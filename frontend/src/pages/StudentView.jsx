// frontend/src/pages/StudentView.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { contentAPI, progressAPI } from '../services/api';
import { AudioService } from '../services/AudioService';
import { Sunny } from '../components/GuideCharacters';
import {
  MeditationStep,
  StoryStep,
  QuizStep,
  ReflectionStep,
  CompletionStep
} from '../components/StepComponents';

// Default / Seed Day (Kindergarten, Week 1, Day 1)
const DEFAULT_DAY = {
  id: 'K-W1-D1-seed',
  dayNumber: 1,
  title: 'Welcome to Our Class Family',
  guideName: 'Sunny',
  week: {
    weekNumber: 1,
    grade: {
      name: 'Kindergarten'
    }
  },
  steps: [
    {
      type: 'meditation',
      title: 'Hello Breathing',
      order: 0,
      audioUrl: null,
      audioDuration: 0,
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
            visual: 'sunny-alone',
            audioUrl: null,
            audioDuration: 0
          },
          {
            title: 'Standing Alone',
            text: 'One by one, the forest-friend classmates notice Sunny standing alone by the door.',
            visual: 'friends-static',
            audioUrl: null,
            audioDuration: 0
          },
          {
            title: 'Come Sit With Us!',
            text: 'Instead of looking away, they wave, scoot over, and say: “Come sit with us!” 👋',
            visual: 'friends-bounce',
            audioUrl: null,
            audioDuration: 0
          },
          {
            title: 'Part of the Family',
            text: 'By the end of the day, Sunny feels warm and happy — like part of the class family.',
            visual: 'sunny-big',
            audioUrl: null,
            audioDuration: 0
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
            question: 'How did Sunny feel at the start?',
            audioUrl: null,
            audioDuration: 0,
            options: [
              { emoji: '😟', text: 'A little scared and small', correct: true },
              { emoji: '😄', text: 'Super excited and jumping', correct: false },
              { emoji: '😴', text: 'Sleepy and tired', correct: false }
            ]
          },
          {
            question: 'What did the friends do to help?',
            audioUrl: null,
            audioDuration: 0,
            options: [
              { emoji: '🙈', text: 'They looked away', correct: false },
              { emoji: '👋', text: 'They waved and said “come sit with us”', correct: true },
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
      audioUrl: null,
      audioDuration: 0,
      content: {
        text: "Now it's your turn! Stand up, say your name out loud, and give the class a big wave. Ask a friend: “What's one thing that makes you feel welcome?”"
      }
    },
    {
      type: 'completion',
      title: 'You Did It!',
      order: 4,
      audioUrl: null,
      audioDuration: 0,
      content: {
        message: 'Nice work finishing this assessment day with Sunny! 🌟',
        badge: '⭐'
      }
    }
  ]
};

const StudentView = () => {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [dayData, setDayData] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(() => AudioService.isMuted);
  const [showLessonSelector, setShowLessonSelector] = useState(false);
  const [completedDays, setCompletedDays] = useState({});

  const [studentId] = useState(() => {
    let id = localStorage.getItem('unimind_student_id');
    if (!id) {
      id = `student_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem('unimind_student_id', id);
    }
    return id;
  });

  // Subscribe to audio mute/state
  useEffect(() => {
    const unsubscribe = AudioService.subscribe((state) => {
      setIsMuted(state.isMuted);
    });
    return () => unsubscribe();
  }, []);

  // Fetch content from API on mount
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await contentAPI.getGrades();

      // Read completed progress from localStorage
      const completedMap = {};
      data.forEach((grade) => {
        grade.weeks.forEach((week) => {
          week.days.forEach((day) => {
            if (localStorage.getItem(`unimind_complete_${day.id}`) === 'true') {
              completedMap[day.id] = true;
            }
          });
        });
      });
      setCompletedDays(completedMap);
      setGrades(data);

      if (data.length > 0 && data[0].weeks?.length > 0 && data[0].weeks[0].days?.length > 0) {
        const firstDay = data[0].weeks[0].days[0];
        setDayData(firstDay);
        setCurrentStepIndex(0);
        setIsComplete(!!completedMap[firstDay.id]);
      } else {
        setDayData(DEFAULT_DAY);
      }
    } catch (err) {
      console.warn('API error, using default lesson content:', err.message);
      setDayData(DEFAULT_DAY);
    } finally {
      setLoading(false);
    }
  };

  const loadDay = (day) => {
    AudioService.stop();
    setDayData(day);
    setCurrentStepIndex(0);
    setIsComplete(!!completedDays[day.id]);
    setShowLessonSelector(false);
  };

  // Build screens list
  const buildScreens = useCallback(() => {
    if (!dayData) return [];
    const list = [];

    // 0: Welcome / Intro
    list.push({ type: 'daystart', id: 'start' });

    // Find steps
    const steps = dayData.steps || [];

    // 1. Meditation
    const meditationStep = steps.find((s) => s.type === 'meditation');
    if (meditationStep) {
      list.push({ type: 'meditation', data: meditationStep });
    }

    // 2. Story Slides
    const storyStep = steps.find((s) => s.type === 'story');
    if (storyStep) {
      const slides = storyStep.content?.slides || [
        { title: "Sunny's Story", text: '', visual: 'sunny-alone' }
      ];
      slides.forEach((_, idx) => {
        list.push({ type: 'story', slideIndex: idx, data: storyStep });
      });
    }

    // 3. Quiz Questions
    const quizStep = steps.find((s) => s.type === 'quiz');
    if (quizStep) {
      const questions = quizStep.content?.questions || [];
      questions.forEach((_, idx) => {
        list.push({ type: 'quiz', questionIndex: idx, data: quizStep });
      });
    }

    // 4. Reflection
    const reflectionStep = steps.find((s) => s.type === 'reflection');
    if (reflectionStep) {
      list.push({ type: 'reflection', data: reflectionStep });
    }

    // 5. Completion
    const completionStep = steps.find((s) => s.type === 'completion');
    list.push({
      type: 'completion',
      data: completionStep || {
        content: { message: 'Nice work finishing today with Sunny!', badge: '⭐' }
      }
    });

    return list;
  }, [dayData]);

  const screens = buildScreens();

  // Navigation handlers (always stops playing audio to prevent overlaps)
  const goNext = useCallback(() => {
    AudioService.stop();
    if (currentStepIndex < screens.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, screens.length]);

  const goBack = useCallback(() => {
    AudioService.stop();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const restart = useCallback(() => {
    AudioService.stop();
    setCurrentStepIndex(0);
    setIsComplete(false);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = AudioService.toggleMute();
    setIsMuted(newMuted);
  }, []);

  // Mark lesson day complete (Local + Backend API)
  const markDayComplete = useCallback(async () => {
    if (!dayData) return;
    setIsComplete(true);
    localStorage.setItem(`unimind_complete_${dayData.id}`, 'true');
    setCompletedDays((prev) => ({ ...prev, [dayData.id]: true }));

    try {
      if (dayData.id && !dayData.id.includes('seed')) {
        await progressAPI.markComplete(studentId, dayData.id);
      }
    } catch (err) {
      console.warn('Could not sync progress to backend:', err.message);
    }
  }, [dayData, studentId]);

  // Get next day helper
  const getNextDay = useCallback(() => {
    if (!grades.length || !dayData) return null;
    for (let g = 0; g < grades.length; g++) {
      for (let w = 0; w < grades[g].weeks.length; w++) {
        for (let d = 0; d < grades[g].weeks[w].days.length; d++) {
          if (grades[g].weeks[w].days[d].id === dayData.id) {
            if (d < grades[g].weeks[w].days.length - 1) {
              return grades[g].weeks[w].days[d + 1];
            }
            if (w < grades[g].weeks.length - 1 && grades[g].weeks[w + 1].days.length > 0) {
              return grades[g].weeks[w + 1].days[0];
            }
            if (g < grades.length - 1 && grades[g + 1].weeks.length > 0 && grades[g + 1].weeks[0].days.length > 0) {
              return grades[g + 1].weeks[0].days[0];
            }
          }
        }
      }
    }
    return null;
  }, [grades, dayData]);

  // Get previous day helper
  const getPreviousDay = useCallback(() => {
    if (!grades.length || !dayData) return null;
    for (let g = 0; g < grades.length; g++) {
      for (let w = 0; w < grades[g].weeks.length; w++) {
        for (let d = 0; d < grades[g].weeks[w].days.length; d++) {
          if (grades[g].weeks[w].days[d].id === dayData.id) {
            if (d > 0) {
              return grades[g].weeks[w].days[d - 1];
            }
            if (w > 0 && grades[g].weeks[w - 1].days.length > 0) {
              const prevW = grades[g].weeks[w - 1];
              return prevW.days[prevW.days.length - 1];
            }
            if (g > 0 && grades[g - 1].weeks.length > 0) {
              const lastW = grades[g - 1].weeks[grades[g - 1].weeks.length - 1];
              if (lastW.days.length > 0) {
                return lastW.days[lastW.days.length - 1];
              }
            }
          }
        }
      }
    }
    return null;
  }, [grades, dayData]);

  const handleNextDay = useCallback(() => {
    const next = getNextDay();
    if (next) loadDay(next);
  }, [getNextDay]);

  const handlePreviousDay = useCallback(() => {
    const prev = getPreviousDay();
    if (prev) loadDay(prev);
  }, [getPreviousDay]);

  const prevDay = getPreviousDay();
  const nextDay = getNextDay();

  // Determine current active progress segment (5-step structure)
  const getProgressSegments = () => {
    const steps = [
      { id: 'meditation', label: 'Breathe' },
      { id: 'story', label: 'Story' },
      { id: 'quiz', label: 'Check-In' },
      { id: 'reflection', label: 'Reflect' },
      { id: 'completion', label: 'Badge' }
    ];

    const currentScreen = screens[currentStepIndex];
    let activeKey = 'meditation';

    if (currentScreen) {
      if (currentScreen.type === 'daystart' || currentScreen.type === 'meditation') {
        activeKey = 'meditation';
      } else if (currentScreen.type === 'story') {
        activeKey = 'story';
      } else if (currentScreen.type === 'quiz') {
        activeKey = 'quiz';
      } else if (currentScreen.type === 'reflection') {
        activeKey = 'reflection';
      } else if (currentScreen.type === 'completion') {
        activeKey = 'completion';
      }
    }

    const order = ['meditation', 'story', 'quiz', 'reflection', 'completion'];
    const activeIndex = order.indexOf(activeKey);

    return steps.map((s, idx) => ({
      ...s,
      active: s.id === activeKey,
      complete: idx < activeIndex || isComplete
    }));
  };

  // Render current screen content
  const renderCurrentScreen = () => {
    if (!dayData || screens.length === 0) return null;
    const screen = screens[currentStepIndex];
    if (!screen) return null;

    switch (screen.type) {
      case 'daystart':
        return (
          <div className="flex-1 flex flex-col items-center text-center animate-fade-in px-2 sm:px-4 py-2">
            <span className="eyebrow text-[10px] sm:text-xs">
              UniMindKidz · {dayData.week?.grade?.name || 'Kindergarten'} · Week{' '}
              {dayData.week?.weekNumber || 1}
            </span>
            <h1 className="font-baloo text-navy text-2xl sm:text-3xl my-1 leading-tight max-w-[440px]">
              {dayData.title}
            </h1>

            <div className="w-full flex justify-center py-2 overflow-visible">
              <Sunny size={180} />
            </div>

            <p className="text-sm sm:text-base leading-relaxed my-2 text-[#4A5D6D] max-w-[400px] font-nunito font-semibold">
              Tap Start to breathe, learn, and play with {dayData.guideName || 'Sunny'}!
            </p>

            <button
              type="button"
              className="btn-primary text-base sm:text-lg py-3 px-8 sm:px-10 mt-2 shadow-lg hover:scale-105 transition-all"
              onClick={goNext}
            >
              ▶ Start Day {dayData.dayNumber || 1}
            </button>

            {isComplete && (
              <div className="mt-3 flex items-center gap-1.5 text-grass font-baloo font-bold text-xs bg-[#E4F4E8] py-1 px-3 rounded-full border border-grass/30">
                <span>✓ Completed on this device</span>
              </div>
            )}
          </div>
        );

      case 'meditation':
        return (
          <MeditationStep
            data={screen.data?.content || {}}
            onComplete={goNext}
          />
        );

      case 'story':
        return (
          <StoryStep
            data={screen.data?.content || {}}
            slideIndex={screen.slideIndex}
            onNext={goNext}
            onPrev={goBack}
          />
        );

      case 'quiz':
        return (
          <QuizStep
            data={screen.data?.content || {}}
            questionIndex={screen.questionIndex}
            onComplete={goNext}
            onPrev={goBack}
          />
        );

      case 'reflection':
        return (
          <ReflectionStep
            data={screen.data?.content || {}}
            onComplete={() => {
              markDayComplete();
              goNext();
            }}
          />
        );

      case 'completion':
        return (
          <CompletionStep
            data={screen.data?.content || {}}
            dayTitle={dayData.title}
            dayNumber={dayData.dayNumber}
            weekNumber={dayData.week?.weekNumber}
            gradeName={dayData.week?.grade?.name}
            onRestart={restart}
            onSelectNextLesson={() => setShowLessonSelector(true)}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#CDEBF7] to-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sun border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-baloo text-navy text-lg font-bold">✨ Loading UniMindKidz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 bg-gradient-to-b from-[#CDEBF7] via-cream to-cream flex items-center justify-center">
      <div className="w-full max-w-[540px]">
        <div className="bg-cream rounded-2xl sm:rounded-3xl shadow-[0_12px_36px_rgba(51,71,91,0.18)] min-h-[580px] sm:min-h-[640px] relative overflow-hidden flex flex-col border-2 border-white/60">
          {/* Header Bar */}
          <div className="flex justify-between items-center px-4 pt-4 pb-2 z-10">
            {/* Day / Grade Badge + Change Lesson Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <div className="bg-navy text-white font-baloo font-bold text-xs py-1 px-3 rounded-full tracking-wide shadow-sm flex items-center gap-1.5">
                <span>
                  {dayData?.week?.grade?.name?.substring(0, 1) || 'K'} · WK{' '}
                  {dayData?.week?.weekNumber || 1} · DAY {dayData?.dayNumber || 1}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowLessonSelector(!showLessonSelector)}
                className={`text-xs font-baloo font-bold px-2.5 py-1 rounded-full border shadow-sm transition-all flex items-center gap-1 cursor-pointer ${
                  showLessonSelector
                    ? 'bg-sun text-white border-sun-dark'
                    : 'bg-white text-navy hover:text-sun-dark hover:border-sun border-[#E3DCC8]'
                }`}
                title="Change or choose lesson"
              >
                <span>📚 Change Lesson</span>
                <span className="text-[10px]">{showLessonSelector ? '▲' : '▼'}</span>
              </button>
            </div>

            {/* Top Right Controls: Day Switcher, Admin, Sound Mute */}
            <div className="flex items-center gap-1.5">
              {!showLessonSelector && (
                <>
                  <button
                    type="button"
                    disabled={!prevDay}
                    onClick={handlePreviousDay}
                    className="bg-white disabled:opacity-40 rounded-full w-8 h-8 shadow-sm text-xs hover:bg-cream transition-all flex items-center justify-center border border-[#E3DCC8] cursor-pointer"
                    title={prevDay ? `Previous: Day ${prevDay.dayNumber}` : 'No previous lesson'}
                  >
                    ⬅
                  </button>
                  <button
                    type="button"
                    disabled={!nextDay}
                    onClick={handleNextDay}
                    className="bg-white disabled:opacity-40 rounded-full w-8 h-8 shadow-sm text-xs hover:bg-cream transition-all flex items-center justify-center border border-[#E3DCC8] cursor-pointer"
                    title={nextDay ? `Next: Day ${nextDay.dayNumber}` : 'No next lesson'}
                  >
                    ➡
                  </button>
                </>
              )}

              {/* <a
                href="/admin"
                className="text-[11px] font-baloo font-bold text-navy/70 hover:text-navy px-2 py-1 bg-white/70 rounded-lg border border-[#E3DCC8] hover:bg-white transition-all hidden sm:inline-block"
                title="Admin studio"
              >
                ⚙️ Admin
              </a> */}

              <button
                type="button"
                className="bg-white rounded-full w-8 h-8 sm:w-9 sm:h-9 shadow-sm text-sm hover:scale-105 transition-all flex items-center justify-center border border-[#E3DCC8]"
                onClick={toggleMute}
                title={isMuted ? 'Turn Sound ON' : 'Mute Sound'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>

          {/* 5-Step Progress Bar */}
          {!showLessonSelector && (
            <div className="flex gap-1.5 justify-center px-4 pt-1 pb-3">
              {getProgressSegments().map((seg) => (
                <div
                  key={seg.id}
                  className={`h-2 flex-1 max-w-[58px] rounded-full transition-all duration-300 ${
                    seg.complete
                      ? 'bg-grass shadow-sm'
                      : seg.active
                      ? 'bg-sun ring-2 ring-sun/30 shadow-sm'
                      : 'bg-[#E3DCC8]'
                  }`}
                  title={seg.label}
                />
              ))}
            </div>
          )}

          {/* Lesson Selector Overlay */}
          {showLessonSelector ? (
            <div className="flex-1 flex flex-col p-4 animate-fade-in bg-white/95 m-3 rounded-2xl border border-[#E3DCC8]">
              <div className="flex justify-between items-center pb-2 mb-3 border-b border-[#E3DCC8]">
                <span className="font-baloo font-bold text-navy text-base">
                  📚 Choose a Lesson Day
                </span>
                <button
                  type="button"
                  onClick={() => setShowLessonSelector(false)}
                  className="text-xs text-[#7A8B99] hover:text-navy font-bold px-2 py-1 rounded"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-[460px] pr-1">
                {grades.map((g) =>
                  g.weeks.map((w) =>
                    w.days.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => loadDay(d)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all flex justify-between items-center ${
                          d.id === dayData?.id
                            ? 'bg-sun/10 border-sun'
                            : completedDays[d.id]
                            ? 'bg-[#E4F4E8] border-grass'
                            : 'bg-white border-[#E3DCC8] hover:border-sun'
                        }`}
                      >
                        <div>
                          <span className="font-baloo font-bold text-navy text-xs">
                            {g.name} · Week {w.weekNumber} · Day {d.dayNumber}
                          </span>
                          <p className="text-xs text-[#4A5D6D] font-nunito font-semibold mt-0.5">
                            {d.title}
                          </p>
                        </div>
                        {completedDays[d.id] && (
                          <span className="text-grass font-bold text-sm">✓ Done</span>
                        )}
                      </button>
                    ))
                  )
                )}
              </div>
            </div>
          ) : (
            /* Main Lesson Screens */
            <div className="flex-1 flex flex-col px-3 sm:px-6 pb-6 overflow-visible">
              {renderCurrentScreen()}
            </div>
          )}

          {/* Floating Back Button (if not on start screen) */}
          {!showLessonSelector && currentStepIndex > 0 && (
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-[#E3DCC8] shadow-md text-xl text-sun-dark font-bold cursor-pointer z-20 flex items-center justify-center hover:scale-110 transition-all"
              onClick={goBack}
              title="Previous screen"
            >
              ‹
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentView;