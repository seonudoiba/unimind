// frontend/src/components/AudioSlotManager.jsx
import React, { useState, useRef, useEffect } from 'react';
import { uploadAPI } from '../services/api';
import { AudioService } from '../services/AudioService';

export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const AudioSlotManager = ({
  label = 'Audio Narration',
  hint = '',
  audioUrl = null,
  audioDuration = 0,
  onChange,
  onRemove,
  compact = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Subscribe to AudioService events for preview playback
  useEffect(() => {
    const unsubscribe = AudioService.subscribe((state) => {
      if (state.trackInfo?.url !== audioUrl) {
        setIsPlaying(false);
        setCurrentTime(0);
      } else {
        setIsPlaying(state.isPlaying);
        setCurrentTime(state.trackInfo?.currentTime || 0);
      }
    });

    return () => {
      unsubscribe();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl, isRecording]);

  // Handle file selection from local device
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress('Measuring audio duration...');

    try {
      // 1. Calculate duration on client side
      const detectedDuration = await AudioService.getAudioDuration(file);
      setUploadProgress('Uploading audio file...');

      // 2. Read as base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const audioData = event.target.result;
          const fileName = file.name;

          const response = await uploadAPI.uploadAudio(
            audioData,
            fileName,
            null,
            detectedDuration
          );

          if (response.success && response.audioUrl) {
            onChange({
              audioUrl: response.audioUrl,
              audioDuration: response.duration || detectedDuration || 0,
              fileName: fileName
            });
            setUploadProgress(null);
          } else {
            throw new Error(response.error || 'Upload failed');
          }
        } catch (uploadErr) {
          setError('Upload failed: ' + uploadErr.message);
        } finally {
          setIsUploading(false);
          setUploadProgress(null);
        }
      };

      reader.onerror = () => {
        setError('Failed to read audio file.');
        setIsUploading(false);
        setUploadProgress(null);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error processing file: ' + err.message);
      setIsUploading(false);
      setUploadProgress(null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Start in-browser microphone recording
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        stream.getTracks().forEach((track) => track.stop());

        setIsUploading(true);
        setUploadProgress('Processing recorded audio...');

        try {
          const duration = await AudioService.getAudioDuration(audioBlob);

          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const audioData = e.target.result;
              const fileName = `mic_recording_${Date.now()}.mp3`;

              const response = await uploadAPI.uploadAudio(
                audioData,
                fileName,
                null,
                duration || recordingSeconds
              );

              if (response.success && response.audioUrl) {
                onChange({
                  audioUrl: response.audioUrl,
                  audioDuration: response.duration || duration || recordingSeconds || 0,
                  fileName: fileName
                });
              } else {
                throw new Error(response.error || 'Upload failed');
              }
            } catch (err) {
              setError('Failed to upload recording: ' + err.message);
            } finally {
              setIsUploading(false);
              setUploadProgress(null);
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch (err) {
          setError('Failed to process recording: ' + err.message);
          setIsUploading(false);
          setUploadProgress(null);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Microphone access denied: ' + err.message);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Preview playback toggle
  const togglePlay = () => {
    if (isPlaying) {
      AudioService.stop();
      setIsPlaying(false);
    } else if (audioUrl) {
      AudioService.play({
        url: audioUrl,
        duration: audioDuration,
        onStart: () => setIsPlaying(true),
        onTimeUpdate: (cur) => setCurrentTime(cur),
        onEnd: () => {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      });
    }
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove this audio?')) {
      AudioService.stop();
      if (onRemove) onRemove();
    }
  };

  return (
    <div className={`rounded-xl border ${compact ? 'p-2.5 bg-white' : 'p-3 bg-[#FAF7F0]'} border-[#E3DCC8] my-2 transition-all`}>
      {/* Header with Title and Duration */}
      <div className="flex flex-wrap justify-between items-center gap-1.5 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-baloo font-bold text-navy text-xs sm:text-sm flex items-center gap-1">
            🎙️ {label}
          </span>
          {audioDuration > 0 && (
            <span className="bg-[#E4F4E8] text-grass font-bold text-[11px] px-2 py-0.5 rounded-full border border-grass/30">
              ⏱️ {formatDuration(audioDuration)} ({audioDuration}s)
            </span>
          )}
        </div>
        {audioUrl ? (
          <span className="text-[11px] font-semibold text-grass flex items-center gap-1">
            ✓ Audio Attached
          </span>
        ) : (
          <span className="text-[11px] text-[#7A8B99]">
            (TTS fallback if empty)
          </span>
        )}
      </div>

      {/* Hint Text if provided */}
      {hint && (
        <p className="text-[11px] text-[#4A5D6D] italic mb-2 bg-white/70 p-1.5 rounded-lg border border-[#E3DCC8]/60 line-clamp-2">
          "{hint}"
        </p>
      )}

      {/* Active Recording State */}
      {isRecording && (
        <div className="flex items-center justify-between bg-red-50 border-2 border-coral rounded-xl p-2.5 mb-2 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-coral animate-ping" />
            <span className="font-baloo font-bold text-coral text-xs">
              Recording Live Mic... {formatDuration(recordingSeconds)}
            </span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="bg-coral text-white font-baloo font-bold text-xs py-1 px-3 rounded-lg shadow hover:bg-red-600 transition-all"
          >
            ⏹️ Stop & Save
          </button>
        </div>
      )}

      {/* Uploading / Processing State */}
      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-sun-dark font-baloo font-bold p-2 bg-sun/10 rounded-lg mb-2">
          <div className="w-4 h-4 border-2 border-sun border-t-transparent rounded-full animate-spin" />
          <span>{uploadProgress || 'Uploading audio...'}</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="text-[11px] text-coral bg-red-50 p-1.5 rounded-lg mb-2 border border-coral/30">
          ⚠️ {error}
        </div>
      )}

      {/* Audio Controls & Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {!audioUrl ? (
          // When no audio uploaded: Upload & Record buttons
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isUploading || isRecording}
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-none hover:shadow-sm"
            >
              📤 Upload File
            </button>
            <button
              type="button"
              disabled={isUploading || isRecording}
              onClick={startRecording}
              className="bg-white border-2 border-sun text-sun-dark font-baloo font-bold text-xs py-1.5 px-3 rounded-[14px] hover:bg-sun/10 transition-all flex items-center gap-1.5"
            >
              🎙️ Record Mic
            </button>
          </div>
        ) : (
          // When audio exists: Inline Audio Player + Replace + Remove
          <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-white p-2 rounded-xl border border-[#E3DCC8]">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <button
                type="button"
                onClick={togglePlay}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                  isPlaying
                    ? 'bg-grass text-white'
                    : 'bg-sun text-white hover:bg-sun-dark'
                }`}
                title={isPlaying ? 'Pause' : 'Play preview'}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>

              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-[#7A8B99] font-nunito font-semibold mb-0.5">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(audioDuration)}</span>
                </div>
                <div className="w-full h-2 bg-[#E3DCC8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sun transition-all duration-100"
                    style={{
                      width: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : isPlaying ? 50 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-sky hover:text-navy underline font-bold px-1"
                title="Replace with new audio"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-[11px] text-coral hover:text-red-700 font-bold px-1.5 py-0.5 rounded hover:bg-red-50"
                title="Remove audio"
              >
                ✕ Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioSlotManager;
