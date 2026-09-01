import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Create admin
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'UniMindAdmin2024!', 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'denise@theunimindproject.org' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'denise@theunimindproject.org',
      password: adminPassword,
      name: 'Denise Williams'
    }
  });
  console.log('✅ Admin created:', admin.email);

  // Create Kindergarten grade
  const kindergarten = await prisma.grade.upsert({
    where: { name: 'Kindergarten' },
    update: {},
    create: {
      name: 'Kindergarten',
      order: 0
    }
  });
  console.log('✅ Grade created:', kindergarten.name);

  // Create Week 1
  const week1 = await prisma.week.upsert({
    where: {
      gradeId_weekNumber: {
        gradeId: kindergarten.id,
        weekNumber: 1
      }
    },
    update: {},
    create: {
      gradeId: kindergarten.id,
      weekNumber: 1,
      title: 'Belonging & Community',
      description: 'Building connections and feeling welcome in our classroom family'
    }
  });
  console.log('✅ Week created:', week1.title);

  // Create Day 1
  const day1 = await prisma.day.upsert({
    where: {
      weekId_dayNumber: {
        weekId: week1.id,
        dayNumber: 1
      }
    },
    update: {},
    create: {
      weekId: week1.id,
      dayNumber: 1,
      title: 'Welcome to Our Class Family',
      guideName: 'Sunny',
      steps: {
        create: [
          {
            type: 'meditation',
            title: 'Hello Breathing',
            order: 0,
            content: {
              intro: "Put one hand on your belly. Let's breathe with Sunny. Breathe in slow through your nose. Now breathe out slow through your mouth. This is how we say hello to our bodies before we say hello to our friends.",
              cycles: 5
            }
          },
          {
            type: 'story',
            title: "Sunny's First Day",
            order: 1,
            content: {
              slides: [
                {
                  title: "Sunny's First Day",
                  text: "Sunny is starting at a brand-new forest classroom today. Sunny doesn't know anyone yet, and feels very small and a little scared.",
                  visual: 'sunny-alone'
                },
                {
                  title: 'Standing Alone',
                  text: "One by one, the forest-friend classmates notice Sunny standing alone by the door.",
                  visual: 'friends-static'
                },
                {
                  title: 'Come Sit With Us!',
                  text: 'Instead of looking away, they wave, scoot over, and say: "Come sit with us!" 👋',
                  visual: 'friends-bounce'
                },
                {
                  title: 'Part of the Family',
                  text: 'By the end of the day, Sunny feels warm and happy — like part of the class family.',
                  visual: 'sunny-big'
                }
              ]
            }
          },
          {
            type: 'quiz',
            title: 'Check-In',
            order: 2,
            content: {
              questions: [
                {
                  question: "How did Sunny feel at the start?",
                  options: [
                    { emoji: '😟', text: 'A little scared and small', correct: true },
                    { emoji: '😄', text: 'Super excited and jumping', correct: false },
                    { emoji: '😴', text: 'Sleepy and tired', correct: false }
                  ]
                },
                {
                  question: 'What did the friends do to help?',
                  options: [
                    { emoji: '🙈', text: 'They looked away', correct: false },
                    { emoji: '👋', text: 'They waved and said "come sit with us"', correct: true },
                    { emoji: '🏃', text: 'They ran outside', correct: false }
                  ]
                }
              ]
            }
          },
          {
            type: 'reflection',
            title: 'The Welcome Wave',
            order: 3,
            content: {
              text: "Now it's your turn! Stand up, say your name out loud, and give the class a big wave. Ask a friend: \"What's one thing that makes you feel welcome?\""
            }
          },
          {
            type: 'completion',
            title: 'You Did It!',
            order: 4,
            content: {
              message: 'Nice work finishing this day with Sunny! 🌟 You\'re part of our class family now!',
              badge: '⭐'
            }
          }
        ]
      }
    }
  });
  console.log('✅ Day created:', day1.title);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });