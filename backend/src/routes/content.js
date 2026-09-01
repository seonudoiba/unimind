import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin, authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// Get all grades with their weeks and days (PUBLIC)
router.get('/grades', async (req, res) => {
  try {
    const grades = await prisma.grade.findMany({
      include: {
        weeks: {
          include: {
            days: {
              include: {
                steps: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { dayNumber: 'asc' }
            }
          },
          orderBy: { weekNumber: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get specific day (PUBLIC)
router.get('/day/:dayId', async (req, res) => {
  try {
    const { dayId } = req.params;
    const day = await prisma.day.findUnique({
      where: { id: dayId },
      include: {
        steps: {
          orderBy: { order: 'asc' }
        }
      }
    });
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }
    res.json(day);
  } catch (error) {
    console.error('Error fetching day:', error);
    res.status(500).json({ error: 'Failed to fetch day' });
  }
});

// ============================================
// ADMIN ONLY ROUTES - Authentication required
// ============================================

// ADMIN: Create grade
router.post('/grades', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, order } = req.body;
    const grade = await prisma.grade.create({
      data: { name, order: order || 0 }
    });
    res.status(201).json(grade);
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({ error: 'Failed to create grade' });
  }
});

// ADMIN: Create week
router.post('/weeks', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { gradeId, weekNumber, title, description } = req.body;
    const week = await prisma.week.create({
      data: { gradeId, weekNumber, title, description }
    });
    res.status(201).json(week);
  } catch (error) {
    console.error('Error creating week:', error);
    res.status(500).json({ error: 'Failed to create week' });
  }
});

// ADMIN: Create day
router.post('/days', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { weekId, dayNumber, title, guideName, steps } = req.body;
    
    const day = await prisma.day.create({
      data: {
        weekId,
        dayNumber,
        title,
        guideName: guideName || 'Sunny',
        steps: {
          create: steps.map((step, index) => {
            // Remove any id or dayId fields that might be sent from the frontend
            const { id, dayId, ...stepData } = step;
            return {
              ...stepData,
              order: index,
              // Ensure audio fields are included
              audioUrl: step.audioUrl || null,
              audioDuration: step.audioDuration || 0
            };
          })
        }
      },
      include: {
        steps: {
          orderBy: { order: 'asc' }
        }
      }
    });
    res.status(201).json(day);
  } catch (error) {
    console.error('Error creating day:', error);
    res.status(500).json({ error: 'Failed to create day' });
  }
});

// ADMIN: Update day
router.put('/days/:dayId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { dayId } = req.params;
    const { title, guideName, steps } = req.body;

    // Delete existing steps
    await prisma.step.deleteMany({
      where: { dayId }
    });

    // Update day with new steps
    const updatedDay = await prisma.day.update({
      where: { id: dayId },
      data: {
        title,
        guideName,
        steps: {
          create: steps.map((step, index) => {
            const { id, dayId: stepDayId, ...stepData } = step;
            return {
              ...stepData,
              order: index,
              audioUrl: step.audioUrl || null,
              audioDuration: step.audioDuration || 0
            };
          })
        }
      },
      include: {
        steps: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json(updatedDay);
  } catch (error) {
    console.error('Error updating day:', error);
    res.status(500).json({ error: 'Failed to update day' });
  }
});

// ADMIN: Delete day - NOW HANDLES PROGRESS
router.delete('/days/:dayId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { dayId } = req.params;
    
    // First, get the day details to store in progress
    const day = await prisma.day.findUnique({
      where: { id: dayId },
      include: {
        week: {
          include: {
            grade: true
          }
        }
      }
    });

    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }

    // Update all progress records for this day to keep the title
    await prisma.progress.updateMany({
      where: { dayId },
      data: {
        dayTitle: day.title,
        dayNumber: day.dayNumber,
        weekNumber: day.week.weekNumber,
        gradeName: day.week.grade.name
      }
    });

    // Delete all steps associated with the day
    await prisma.step.deleteMany({
      where: { dayId }
    });
    
    // Then delete the day
    await prisma.day.delete({
      where: { id: dayId }
    });
    
    res.json({ 
      message: 'Day deleted successfully. Progress records preserved with day details.'
    });
  } catch (error) {
    console.error('Error deleting day:', error);
    res.status(500).json({ error: 'Failed to delete day' });
  }
});

// ADMIN: Delete grade
router.delete('/grades/:gradeId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { gradeId } = req.params;
    await prisma.grade.delete({
      where: { id: gradeId }
    });
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ error: 'Failed to delete grade' });
  }
});

export default router;