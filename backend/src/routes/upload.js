import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload audio
router.post('/audio', requireAdmin, async (req, res) => {
  try {
    const { audioData, fileName, duration, stepId } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    // Decode base64
    const base64Data = audioData.includes('base64,') ? audioData.split('base64,')[1] : audioData;
    const buffer = Buffer.from(base64Data, 'base64');
    const safeBaseName = (fileName || 'audio')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_');
    const timestamp = Date.now();
    const cleanFileName = `audio_${timestamp}_${safeBaseName}.mp3`;

    // Try Cloudinary first if configured
    let cloudinarySuccess = false;
    let result = null;

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'video', // audio is handled under video in Cloudinary
              folder: 'unimind-audio',
              public_id: `audio_${timestamp}_${safeBaseName}`,
              format: 'mp3',
            },
            (error, res) => {
              if (error) reject(error);
              else resolve(res);
            }
          );

          const readableStream = new Readable();
          readableStream.push(buffer);
          readableStream.push(null);
          readableStream.pipe(uploadStream);
        });
        cloudinarySuccess = true;
      } catch (cloudErr) {
        console.warn('⚠️ Cloudinary upload failed, falling back to local storage:', cloudErr.message);
      }
    }

    if (cloudinarySuccess && result) {
      return res.json({
        success: true,
        audioUrl: result.secure_url,
        duration: duration || result.duration || 0,
        publicId: result.public_id,
        storage: 'cloudinary'
      });
    }

    // Local file fallback
    const localFilePath = path.join(uploadsDir, cleanFileName);
    await fs.promises.writeFile(localFilePath, buffer);

    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    const localUrl = `${protocol}://${host}/uploads/${cleanFileName}`;

    return res.json({
      success: true,
      audioUrl: localUrl,
      duration: duration || 0,
      publicId: cleanFileName,
      storage: 'local'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload audio: ' + error.message });
  }
});

// Delete audio
router.delete('/audio/:publicId', requireAdmin, async (req, res) => {
  try {
    const { publicId } = req.params;

    // Check if local file
    const localFilePath = path.join(uploadsDir, publicId);
    if (fs.existsSync(localFilePath)) {
      await fs.promises.unlink(localFilePath);
      return res.json({ success: true, message: 'Local audio deleted' });
    }

    // Try Cloudinary destroy
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'video',
      });
      if (result.result === 'ok') {
        return res.json({ success: true, message: 'Cloudinary audio deleted' });
      }
    }

    res.json({ success: true, message: 'Audio removed' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete audio' });
  }
});

export default router;