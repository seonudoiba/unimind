export const DEFAULT_DAY_DATA = {
  id: 'K-W1-D1',
  grade: 'Kindergarten',
  week: 1,
  day: 1,
  title: 'Welcome to Our Class Family',
  guideName: 'Sunny',
  steps: [
    {
      id: 'meditation',
      type: 'meditation',
      title: 'Hello Breathing',
      content: {
        intro: "Put one hand on your belly. Let's breathe with Sunny. Breathe in slow through your nose. Now breathe out slow through your mouth. This is how we say hello to our bodies before we say hello to our friends.",
        cycles: 5
      }
    },
    {
      id: 'story',
      type: 'story',
      title: "Sunny's First Day",
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
      id: 'discussion',
      type: 'quiz',
      title: 'Check-In',
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
      id: 'reflection',
      type: 'reflection',
      title: 'The Welcome Wave',
      content: {
        text: "Now it's your turn! Stand up, say your name out loud, and give the class a big wave. Ask a friend: \"What's one thing that makes you feel welcome?\""
      }
    },
    {
      id: 'badge',
      type: 'completion',
      title: 'You Did It!',
      content: {
        message: 'Nice work finishing this assessment day with Sunny!',
        badge: '⭐'
      }
    }
  ]
};