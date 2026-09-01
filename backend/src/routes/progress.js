import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Mark day complete - NOW STORES DAY DETAILS
router.post('/complete', async (req, res) => {
  try {
    const { studentId, dayId } = req.body;

    if (!studentId || !dayId) {
      return res.status(400).json({ error: 'Student ID and Day ID required' });
    }

    // Get the day details before potentially deleting it
    let dayDetails = null;
    try {
      dayDetails = await prisma.day.findUnique({
        where: { id: dayId },
        include: {
          week: {
            include: {
              grade: true
            }
          }
        }
      });
    } catch (error) {
      console.warn('Day might already be deleted:', error);
    }

    // Create or update student
    let student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          id: studentId,
          name: `Student ${studentId.slice(0, 8)}`,
          grade: dayDetails?.week?.grade?.name || 'Kindergarten'
        }
      });
    }

    // Store progress with day details
    const progress = await prisma.progress.upsert({
      where: {
        studentId_dayId: {
          studentId: student.id,
          dayId
        }
      },
      update: {
        completed: true,
        completedAt: new Date(),
        dayTitle: dayDetails?.title || 'Unknown Lesson',
        dayNumber: dayDetails?.dayNumber || 0,
        weekNumber: dayDetails?.week?.weekNumber || 0,
        gradeName: dayDetails?.week?.grade?.name || 'Unknown Grade'
      },
      create: {
        studentId: student.id,
        dayId,
        completed: true,
        completedAt: new Date(),
        dayTitle: dayDetails?.title || 'Unknown Lesson',
        dayNumber: dayDetails?.dayNumber || 0,
        weekNumber: dayDetails?.week?.weekNumber || 0,
        gradeName: dayDetails?.week?.grade?.name || 'Unknown Grade'
      }
    });

    res.json({
      success: true,
      progress,
      message: `🎉 Completed "${dayDetails?.title || 'lesson'}"!`,
      day: {
        title: dayDetails?.title,
        dayNumber: dayDetails?.dayNumber,
        weekNumber: dayDetails?.week?.weekNumber,
        grade: dayDetails?.week?.grade?.name
      }
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get student progress (works even if days are deleted)
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const progress = await prisma.progress.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get student progress for a specific day
router.get('/student/:studentId/day/:dayId', async (req, res) => {
  try {
    const { studentId, dayId } = req.params;
    const progress = await prisma.progress.findUnique({
      where: {
        studentId_dayId: {
          studentId,
          dayId
        }
      }
    });
    res.json({ 
      completed: progress?.completed || false,
      completedAt: progress?.completedAt || null,
      dayTitle: progress?.dayTitle || null
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

export default router;