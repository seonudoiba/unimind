import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all students with their progress (works even if days are deleted)
router.get('/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        progress: true
      },
      orderBy: { name: 'asc' }
    });

    const formattedStudents = students.map(student => {
      const totalDays = student.progress.length;
      const completedDays = student.progress.filter(p => p.completed).length;
      const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

      return {
        id: student.id,
        name: student.name,
        grade: student.grade || 'Kindergarten',
        progress: student.progress.map(p => ({
          dayId: p.dayId,
          dayTitle: p.dayTitle || 'Deleted Lesson',
          dayNumber: p.dayNumber || 0,
          weekNumber: p.weekNumber || 0,
          gradeName: p.gradeName || 'Unknown',
          completed: p.completed,
          completedAt: p.completedAt,
        })),
        stats: {
          totalDays,
          completedDays,
          completionRate,
        }
      };
    });

    res.json(formattedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get class statistics (works even if days are deleted)
router.get('/class-stats', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        progress: true
      }
    });

    const totalStudents = students.length;
    let totalProgress = 0;
    let completedProgress = 0;
    
    students.forEach(student => {
      totalProgress += student.progress.length;
      completedProgress += student.progress.filter(p => p.completed).length;
    });
    
    const overallCompletionRate = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0;

    // Get progress stats by day (including deleted days)
    const progressByDay = await prisma.progress.groupBy({
      by: ['dayId', 'dayTitle', 'dayNumber', 'weekNumber', 'gradeName'],
      where: {
        completed: true
      },
      _count: {
        id: true
      }
    });

    const dayStats = progressByDay.map(p => ({
      dayId: p.dayId,
      dayTitle: p.dayTitle || 'Deleted Lesson',
      dayNumber: p.dayNumber || 0,
      weekNumber: p.weekNumber || 0,
      grade: p.gradeName || 'Unknown',
      completed: p._count.id,
      total: totalStudents,
      completionRate: totalStudents > 0 ? Math.round((p._count.id / totalStudents) * 100) : 0
    }));

    res.json({
      totalStudents,
      totalProgress,
      completedProgress,
      overallCompletionRate,
      dayStats
    });
  } catch (error) {
    console.error('Error fetching class stats:', error);
    res.status(500).json({ error: 'Failed to fetch class stats' });
  }
});

export default router;