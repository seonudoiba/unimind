// frontend/src/components/StepComponents.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sunny, Friends } from './GuideCharacters';
import { AudioService } from '../services/AudioService';

// ============================================
// 1. MEDITATION STEP (MIND & BREATHING)
// ============================================
export const MeditationStep = ({ data, onComplete }) => {
  const [phase, setPhase] = useState('intro'); // 'intro', 'breathing', 'done'
  const [breathType, setBreathType] = useState('ready'); // 'inhale', 'exhale'
  const [currentCycle, setCurrentCycle] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const totalCycles = data?.cycles || 5;
  const introText = data?.intro || "Put one hand on your belly. Let's breathe with Sunny. Breathe in slow through your nose. Now breathe out slow through your mouth.";
  const introAudioUrl = data?.introAudioUrl || data?.audioUrl || null;
  const introAudioDuration = data?.introAudioDuration || data?.audioDuration || 0;

  const cycleTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Subscribe to audio state
  useEffect(() => {
    isMountedRef.current = true;
    const unsubscribe = AudioService.subscribe((state) => {
      if (isMountedRef.current) {
        setIsPlayingAudio(state.isPlaying);
      }
    });

    // Play intro narration on start
    playIntroNarration();

    return () => {
      isMountedRef.current = false;
      unsubscribe();
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
      AudioService.stop();
    };
  }, []);

  const playIntroNarration = () => {
    AudioService.play({
      url: introAudioUrl,
      text: introText,
      duration: introAudioDuration,
      onStart: () => {
        if (isMountedRef.current) {
          setIsPlayingAudio(true);
          setPhase('intro');
        }
      },
      onEnd: () => {
        if (isMountedRef.current) {
          setIsPlayingAudio(false);
          // Automatically start breathing once intro finishes
          startBreathingSession();
        }
      }
    });
  };

  const startBreathingSession = () => {
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    AudioService.stop();
    setPhase('breathing');
    setCurrentCycle(1);
    runBreathCycle(1);
  };

  const runBreathCycle = (cycleNum) => {
    if (!isMountedRef.current) return;

    if (cycleNum > totalCycles) {
      // Completed all cycles
      setPhase('done');
      setBreathType('ready');
      AudioService.play({
        text: "Great job breathing! You're ready for our story."
      });
      return;
    }

    setCurrentCycle(cycleNum);
    setProgressPercent(((cycleNum - 1) / totalCycles) * 100);

    // Inhale: 4 seconds
    setBreathType('inhale');
    AudioService.play({ text: 'Breathe in...' });

    cycleTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;

      // Exhale: 4 seconds
      setBreathType('exhale');
      AudioService.play({ text: 'Breathe out...' });

      cycleTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        runBreathCycle(cycleNum + 1);
      }, 4000);
    }, 4000);
  };

  return (
    <div className="flex-1 flex flex-col items-center text-center animate-fade-in px-2 sm:px-4 py-2 relative">
      <span className="eyebrow text-[10px] sm:text-xs">Breathe with Sunny</span>
      <h1 className="font-baloo text-navy text-xl sm:text-2xl my-1 leading-tight">
        {data?.title || 'Hello Breathing'}
      </h1>

      {/* Guide Character with Dynamic Breathing Scale */}
      <div className="w-full flex justify-center py-2 relative overflow-visible">
        <div
          className={`transition-transform duration-[4000ms] ease-in-out ${
            breathType === 'inhale'
              ? 'scale-125'
              : breathType === 'exhale'
              ? 'scale-95'
              : 'scale-100'
          }`}
        >
          <Sunny size={160} breathing={phase === 'breathing'} />
        </div>
      </div>

      {/* Phase Captions & Breathing Status */}
      <div className="my-2 min-h-[70px] flex flex-col items-center justify-center">
        {phase === 'intro' && (
          <div className="animate-fade-in max-w-[420px]">
            <p className="text-sm text-[#4A5D6D] leading-relaxed mb-2 px-2 italic">
              "{introText}"
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                className="btn-replay text-xs py-1.5 px-3"
                onClick={playIntroNarration}
              >
                {isPlayingAudio ? '🔊 Listening to Sunny...' : '🔊 Read Intro Again'}
              </button>
              <button
                type="button"
                className="bg-sun text-white font-baloo font-bold text-xs py-1.5 px-3.5 rounded-full shadow hover:bg-sun-dark transition-all"
                onClick={startBreathingSession}
              >
                ▶ Start Breathing Now
              </button>
            </div>
          </div>
        )}

        {phase === 'breathing' && (
          <div className="animate-fade-in flex flex-col items-center">
            {breathType === 'inhale' && (
              <div className="font-baloo text-xl sm:text-2xl font-bold text-sky flex items-center gap-2 animate-pulse-soft">
                <span>🌬️ Breathe in...</span>
              </div>
            )}
            {breathType === 'exhale' && (
              <div className="font-baloo text-xl sm:text-2xl font-bold text-grass flex items-center gap-2 animate-pulse-soft">
                <span>🌬️ Breathe out...</span>
              </div>
            )}

            {/* Cycle Star Dots */}
            <div className="flex items-center gap-1.5 mt-2">
              {[...Array(totalCycles)].map((_, i) => (
                <span
                  key={i}
                  className={`transition-all duration-300 text-sm ${
                    i + 1 < currentCycle
                      ? 'text-grass scale-110'
                      : i + 1 === currentCycle
                      ? 'text-sun scale-125'
                      : 'text-[#E3DCC8]'
                  }`}
                >
                  {i + 1 < currentCycle ? '⭐' : '●'}
                </span>
              ))}
            </div>
            <span className="text-xs text-[#7A8B99] mt-1 font-nunito font-semibold">
              Breath {currentCycle} of {totalCycles}
            </span>
          </div>
        )}

        {phase === 'done' && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="font-baloo text-xl sm:text-2xl font-bold text-grass mb-1">
              ✨ Great Job Breathing!
            </div>
            <p className="text-xs sm:text-sm text-[#4A5D6D] mb-3">
              Your body and mind are calm and ready for our story.
            </p>
            <button
              type="button"
              className="btn-primary text-sm sm:text-base py-2.5 px-6 sm:px-8"
              onClick={onComplete}
            >
              Next: Our Story →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 2. STORY STEP (SLIDES WITH SEPARATE AUDIO)
// ============================================
export const StoryStep = ({ data, slideIndex = 0, onNext, onPrev }) => {
  const slides = data?.slides || [];
  const slide = slides[slideIndex] || {
    title: "Sunny's Story",
    text: '',
    visual: 'sunny-alone'
  };

  const isLast = slideIndex === slides.length - 1;
  const isFirst = slideIndex === 0;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Play slide audio whenever slideIndex changes
  useEffect(() => {
    AudioService.stop();

    const unsubscribe = AudioService.subscribe((state) => {
      setIsPlayingAudio(state.isPlaying);
    });

    const timer = setTimeout(() => {
      AudioService.play({
        url: slide.audioUrl,
        text: slide.text,
        duration: slide.audioDuration || 0
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      unsubscribe();
      AudioService.stop();
    };
  }, [slideIndex, slide.audioUrl, slide.text]);

  const handleReplay = () => {
    AudioService.play({
      url: slide.audioUrl,
      text: slide.text,
      duration: slide.audioDuration || 0
    });
  };

  // Render Visual Artwork according to slide
  const renderVisual = () => {
    switch (slide.visual) {
      case 'sunny-alone':
        return (
          <div className="w-full max-w-[340px] h-[150px] sm:h-[170px] bg-gradient-to-b from-[#DDF1FA] to-[#EFF9EC] rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden shadow-inner">
            <div className="scale-75 sm:scale-85 overflow-visible">
              <Sunny size={90} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-grass opacity-40 rounded-b-2xl" />
          </div>
        );
      case 'sunny-big':
        return (
          <div className="w-full flex justify-center py-2 overflow-visible">
            <Sunny size={140} />
          </div>
        );
      case 'friends-static':
        return (
          <div className="w-full max-w-[340px] h-[150px] sm:h-[170px] bg-gradient-to-b from-[#DDF1FA] to-[#EFF9EC] rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden shadow-inner">
            <Friends bounce={false} />
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-grass opacity-40 rounded-b-2xl" />
          </div>
        );
      case 'friends-bounce':
        return (
          <div className="w-full max-w-[340px] h-[150px] sm:h-[170px] bg-gradient-to-b from-[#DDF1FA] to-[#EFF9EC] rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden shadow-inner">
            <Friends bounce={true} />
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-grass opacity-40 rounded-b-2xl" />
          </div>
        );
      default:
        return (
          <div className="w-full flex justify-center py-2 overflow-visible">
            <Sunny size={120} />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center text-center animate-fade-in px-2 sm:px-4 py-2">
      {/* Eyebrow & Slide Indicator */}
      <div className="flex items-center gap-2 mb-1">
        <span className="eyebrow text-[10px] sm:text-xs">Our Story</span>
        <span className="bg-sun/20 text-sun-dark font-baloo font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full">
          Slide {slideIndex + 1} of {slides.length}
        </span>
      </div>

      <h1 className="font-baloo text-navy text-lg sm:text-2xl my-1 leading-tight max-w-[420px]">
        {slide.title}
      </h1>

      {renderVisual()}

      <p className="text-sm sm:text-base leading-relaxed my-2 text-[#4A5D6D] max-w-[420px] px-1 font-nunito">
        {slide.text}
      </p>

      {/* Replay Narration Button */}
      <button
        type="button"
        className={`btn-replay text-xs sm:text-sm py-1.5 px-3.5 mb-3 transition-all ${
          isPlayingAudio ? 'border-sun bg-sun/10 scale-105' : ''
        }`}
        onClick={handleReplay}
      >
        {isPlayingAudio ? '🔊 Reading aloud...' : '🔊 Read Again'}
      </button>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 mt-1">
        {!isFirst && (
          <button
            type="button"
            className="btn-secondary text-xs sm:text-sm py-2 px-4"
            onClick={onPrev}
          >
            ← Previous
          </button>
        )}
        <button
          type="button"
          className="btn-primary text-sm sm:text-base py-2.5 px-6 sm:px-8"
          onClick={onNext}
        >
          {isLast ? "Let's Check In →" : 'Next Slide →'}
        </button>
      </div>
    </div>
  );
};

// ============================================
// 3. QUIZ / CHECK-IN STEP
// ============================================
export const QuizStep = ({ data, questionIndex = 0, onComplete, onPrev }) => {
  const questions = data?.questions || [];
  const currentQ = questions[questionIndex] || {
    question: 'How did Sunny feel?',
    options: []
  };

  const [selectedOption, setSelectedOption] = useState(null);
  const [feedbackState, setFeedbackState] = useState(null); // 'correct' | 'wrong' | null
  const [isProcessing, setIsProcessing] = useState(false);
  const isLastQuestion = questionIndex === questions.length - 1;

  // Play question audio on mount
  useEffect(() => {
    setSelectedOption(null);
    setFeedbackState(null);
    setIsProcessing(false);
    AudioService.stop();

    const timer = setTimeout(() => {
      AudioService.play({
        url: currentQ.audioUrl,
        text: currentQ.question + '. Tap your answer.',
        duration: currentQ.audioDuration || 0
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      AudioService.stop();
    };
  }, [questionIndex, currentQ.audioUrl, currentQ.question]);

  const handleOptionClick = (option, optIdx) => {
    if (isProcessing || selectedOption !== null) return;

    setSelectedOption(optIdx);
    setIsProcessing(true);

    if (option.correct) {
      setFeedbackState('correct');
      AudioService.play({ text: 'Yes! Great listening! ⭐' });

      setTimeout(() => {
        setIsProcessing(false);
        onComplete();
      }, 1400);
    } else {
      setFeedbackState('wrong');
      AudioService.play({ text: "Not quite — let's try again!" });

      setTimeout(() => {
        setSelectedOption(null);
        setFeedbackState(null);
        setIsProcessing(false);
      }, 1200);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center text-center animate-fade-in px-2 sm:px-4 py-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="eyebrow text-[10px] sm:text-xs">Class Check-In</span>
        {questions.length > 1 && (
          <span className="bg-sky/20 text-navy font-baloo font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full">
            Question {questionIndex + 1} of {questions.length}
          </span>
        )}
      </div>

      <h1 className="font-baloo text-navy text-lg sm:text-2xl my-2 leading-tight max-w-[420px]">
        {currentQ.question}
      </h1>

      {/* Options Cards */}
      <div className="w-full max-w-[400px] flex flex-col gap-2.5 my-2">
        {currentQ.options?.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          let cardClass =
            'bg-white border-2 sm:border-3 border-[#E3DCC8] hover:border-sky text-navy';

          if (isSelected && feedbackState === 'correct') {
            cardClass = 'bg-[#E4F4E8] border-grass text-grass scale-102 shadow-md';
          } else if (isSelected && feedbackState === 'wrong') {
            cardClass = 'bg-[#FBE7E3] border-coral text-coral animate-shake';
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isProcessing}
              onClick={() => handleOptionClick(opt, idx)}
              className={`font-baloo font-semibold text-sm sm:text-base rounded-2xl py-3 px-4 flex items-center gap-3 transition-all text-left cursor-pointer ${cardClass}`}
            >
              <span className="text-2xl sm:text-3xl flex-shrink-0">{opt.emoji}</span>
              <span className="flex-1">{opt.text}</span>
              {isSelected && feedbackState === 'correct' && (
                <span className="text-grass text-xl font-bold">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      <div className="min-h-[36px] flex items-center justify-center">
        {feedbackState === 'correct' && (
          <div className="font-baloo font-bold text-grass text-sm sm:text-base animate-fade-in flex items-center gap-1.5">
            <span>🌟 Yes! Great listening!</span>
          </div>
        )}
        {feedbackState === 'wrong' && (
          <div className="font-baloo font-bold text-coral text-sm sm:text-base animate-fade-in flex items-center gap-1.5">
            <span>💭 Not quite — let's try again!</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 4. REFLECTION STEP
// ============================================
export const ReflectionStep = ({ data, onComplete }) => {
  const reflectionText =
    data?.text ||
    "Now it's your turn! Stand up, say your name out loud, and give the class a big wave. Ask a friend: “What's one thing that makes you feel welcome?”";
  const audioUrl = data?.audioUrl || null;
  const audioDuration = data?.audioDuration || 0;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    AudioService.stop();

    const unsubscribe = AudioService.subscribe((state) => {
      setIsPlayingAudio(state.isPlaying);
    });

    const timer = setTimeout(() => {
      AudioService.play({
        url: audioUrl,
        text: reflectionText,
        duration: audioDuration
      });
    }, 150);

    return () => {
      clearTimeout(timer);
      unsubscribe();
      AudioService.stop();
    };
  }, [audioUrl, reflectionText]);

  const handleReplay = () => {
    AudioService.play({
      url: audioUrl,
      text: reflectionText,
      duration: audioDuration
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center text-center animate-fade-in px-2 sm:px-4 py-2">
      <span className="eyebrow text-[10px] sm:text-xs">Class Reflection</span>
      <h1 className="font-baloo text-navy text-xl sm:text-2xl my-1 leading-tight">
        {data?.title || 'The Welcome Wave'}
      </h1>

      <div className="w-full flex justify-center py-2 overflow-visible">
        <Sunny size={120} />
      </div>

      <div className="bg-white/90 p-4 rounded-2xl border-2 border-[#E3DCC8] shadow-sm max-w-[420px] my-2">
        <p className="text-sm sm:text-base leading-relaxed text-[#4A5D6D] font-nunito font-semibold">
          {reflectionText}
        </p>
      </div>

      <button
        type="button"
        className={`btn-replay text-xs sm:text-sm py-1.5 px-3.5 mb-4 transition-all ${
          isPlayingAudio ? 'border-sun bg-sun/10 scale-105' : ''
        }`}
        onClick={handleReplay}
      >
        {isPlayingAudio ? '🔊 Listening...' : '🔊 Read Again'}
      </button>

      <button
        type="button"
        className="btn-primary text-base sm:text-lg py-3 px-8 shadow-lg hover:scale-105 transition-all"
        onClick={onComplete}
      >
        I Did It! 👋 →
      </button>
    </div>
  );
};

// ============================================
// 5. COMPLETION & BADGE STEP
// ============================================
export const CompletionStep = ({
  data,
  dayTitle = 'Welcome to Our Class Family',
  dayNumber = 1,
  weekNumber = 1,
  gradeName = 'Kindergarten',
  onRestart,
  onSelectNextLesson
}) => {
  const message = data?.message || `Nice work finishing "${dayTitle}" with Sunny!`;
  const badgeEmoji = data?.badge || '⭐';
  const audioUrl = data?.audioUrl || null;
  const audioDuration = data?.audioDuration || 0;

  useEffect(() => {
    AudioService.stop();

    const timer = setTimeout(() => {
      AudioService.play({
        url: audioUrl,
        text: `You did it! ${message}`,
        duration: audioDuration
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      AudioService.stop();
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center text-center animate-fade-in px-2 sm:px-4 py-2 relative">
      <span className="eyebrow text-[10px] sm:text-xs">
        {gradeName} · Week {weekNumber} · Day {dayNumber} Complete
      </span>

      <h1 className="font-baloo text-navy text-2xl sm:text-3xl my-1 leading-tight">
        You Did It! 🎉
      </h1>

      {/* Glowing Star Badge */}
      <div className="badge w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] rounded-full bg-gradient-to-br from-[#FFE8B8] to-sun flex items-center justify-center text-5xl sm:text-6xl my-2 shadow-[0_12px_28px_rgba(214,134,42,0.45)] animate-pulse-soft">
        {badgeEmoji}
      </div>

      {/* 3 Stars */}
      <div className="stars text-2xl sm:text-3xl tracking-[6px] my-1">
        ⭐⭐⭐
      </div>

      <p className="text-sm sm:text-base leading-relaxed my-2 text-[#4A5D6D] max-w-[400px] px-1 font-nunito font-semibold">
        {message}
      </p>

      <div className="bg-[#E4F4E8] text-grass font-baloo font-bold text-xs py-1 px-3 rounded-full border border-grass/30 mb-4">
        ✓ Progress saved to classroom records
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2.5 justify-center">
        <button
          type="button"
          className="btn-secondary text-sm sm:text-base py-2.5 px-6"
          onClick={onRestart}
        >
          ↺ Play Again
        </button>
        {onSelectNextLesson && (
          <button
            type="button"
            className="btn-primary text-sm sm:text-base py-2.5 px-6"
            onClick={onSelectNextLesson}
          >
            Next Lesson ➡
          </button>
        )}
      </div>
    </div>
  );
};