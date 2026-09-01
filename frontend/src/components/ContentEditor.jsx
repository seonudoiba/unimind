// frontend/src/components/ContentEditor.jsx
import React, { useState } from 'react';
import AudioSlotManager, { formatDuration } from './AudioSlotManager';

const ContentEditor = ({ grade, week, day, grades, onSave, onCancel }) => {
  const [formData, setFormData] = useState(() => {
    if (day) {
      return {
        gradeId: grade?.id || '',
        weekId: week?.id || '',
        dayNumber: day.dayNumber || 1,
        title: day.title || '',
        guideName: day.guideName || 'Sunny',
        welcomeAudioUrl: day.welcomeAudioUrl || null,
        welcomeAudioDuration: day.welcomeAudioDuration || 0,
        steps: (day.steps || []).map((step, idx) => ({
          ...step,
          order: idx,
          audioUrl: step.audioUrl || null,
          audioDuration: step.audioDuration || 0,
          content: step.content || {}
        }))
      };
    }
    return {
      gradeId: grades[0]?.id || '',
      weekId: grades[0]?.weeks[0]?.id || '',
      dayNumber: 1,
      title: '',
      guideName: 'Sunny',
      welcomeAudioUrl: null,
      welcomeAudioDuration: 0,
      steps: [
        {
          type: 'meditation',
          title: 'Hello Breathing',
          order: 0,
          audioUrl: null,
          audioDuration: 0,
          content: {
            intro: "Put one hand on your belly. Let's breathe with Sunny. Breathe in slow through your nose. Now breathe out slow through your mouth. This is how we say hello to our bodies before we say hello to our friends.",
            cycles: 5,
            introAudioUrl: null,
            introAudioDuration: 0
          }
        },
        {
          type: 'story',
          title: "Sunny's First Day",
          order: 1,
          audioUrl: null,
          audioDuration: 0,
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
          audioUrl: null,
          audioDuration: 0,
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
            text: "Now it's your turn! Stand up, say your name out loud, and give the class a big wave. Ask a friend: “What's one thing that makes you feel welcome?”",
            audioUrl: null,
            audioDuration: 0
          }
        },
        {
          type: 'completion',
          title: 'You Did It!',
          order: 4,
          audioUrl: null,
          audioDuration: 0,
          content: {
            message: 'Nice work finishing this assessment day with Sunny!',
            badge: '⭐',
            audioUrl: null,
            audioDuration: 0
          }
        }
      ]
    };
  });

  const [selectedGrade, setSelectedGrade] = useState(formData.gradeId);
  const [activeStepTab, setActiveStepTab] = useState(0);

  const emojiOptions = ['😊', '😟', '😄', '😴', '🙈', '👋', '🏃', '🤔', '⭐', '🌟', '❤️', '💪', '🌈', '🎉', '🎊', '🦁', '🦉', '🐢', '🐰', '🌸', '✨'];
  const visualOptions = [
    { value: 'sunny-alone', label: '☀️ Sunny Alone (Doorway)' },
    { value: 'friends-static', label: '🐰 Bear, Bunny & Fox (Static)' },
    { value: 'friends-bounce', label: '👋 Friends Bouncing & Waving' },
    { value: 'sunny-big', label: '🌟 Sunny Big & Smiling' }
  ];

  // Helper step modifier
  const updateStep = (index, updater) => {
    setFormData((prev) => {
      const newSteps = [...prev.steps];
      newSteps[index] = updater(newSteps[index]);
      return { ...prev, steps: newSteps };
    });
  };

  const handleAddStep = (type) => {
    const newStep = {
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      order: formData.steps.length,
      audioUrl: null,
      audioDuration: 0,
      content:
        type === 'meditation'
          ? { intro: "Let's take a calm breath together.", cycles: 5, introAudioUrl: null, introAudioDuration: 0 }
          : type === 'story'
          ? { slides: [{ title: 'Slide 1', text: 'Story begins here...', visual: 'sunny-alone', audioUrl: null, audioDuration: 0 }] }
          : type === 'quiz'
          ? {
              questions: [
                {
                  question: 'What did we learn today?',
                  audioUrl: null,
                  audioDuration: 0,
                  options: [
                    { emoji: '😊', text: 'Be kind to our friends', correct: true },
                    { emoji: '🙈', text: 'Ignore everyone', correct: false }
                  ]
                }
              ]
            }
          : type === 'reflection'
          ? { text: 'Turn to your neighbor and share a smile!', audioUrl: null, audioDuration: 0 }
          : { message: 'Great job today!', badge: '⭐', audioUrl: null, audioDuration: 0 }
    };
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep]
    });
    setActiveStepTab(formData.steps.length);
  };

  const handleRemoveStep = (index) => {
    if (window.confirm(`Delete Step ${index + 1} (${formData.steps[index].type})?`)) {
      setFormData({
        ...formData,
        steps: formData.steps.filter((_, i) => i !== index)
      });
      setActiveStepTab(Math.max(0, index - 1));
    }
  };

  // Story slide operations
  const handleAddSlide = (stepIndex) => {
    updateStep(stepIndex, (step) => {
      const slides = step.content.slides || [];
      return {
        ...step,
        content: {
          ...step.content,
          slides: [
            ...slides,
            {
              title: `Slide ${slides.length + 1}`,
              text: '',
              visual: 'sunny-alone',
              audioUrl: null,
              audioDuration: 0
            }
          ]
        }
      };
    });
  };

  const handleRemoveSlide = (stepIndex, slideIndex) => {
    updateStep(stepIndex, (step) => {
      const slides = [...step.content.slides];
      slides.splice(slideIndex, 1);
      return {
        ...step,
        content: { ...step.content, slides }
      };
    });
  };

  const handleSlideChange = (stepIndex, slideIndex, field, value) => {
    updateStep(stepIndex, (step) => {
      const slides = [...step.content.slides];
      slides[slideIndex] = { ...slides[slideIndex], [field]: value };
      return {
        ...step,
        content: { ...step.content, slides }
      };
    });
  };

  // Quiz question operations
  const handleAddQuestion = (stepIndex) => {
    updateStep(stepIndex, (step) => {
      const questions = step.content.questions || [];
      return {
        ...step,
        content: {
          ...step.content,
          questions: [
            ...questions,
            {
              question: '',
              audioUrl: null,
              audioDuration: 0,
              options: [
                { emoji: '😊', text: '', correct: true },
                { emoji: '😕', text: '', correct: false }
              ]
            }
          ]
        }
      };
    });
  };

  const handleRemoveQuestion = (stepIndex, qIndex) => {
    updateStep(stepIndex, (step) => {
      const questions = [...step.content.questions];
      questions.splice(qIndex, 1);
      return {
        ...step,
        content: { ...step.content, questions }
      };
    });
  };

  const handleQuestionChange = (stepIndex, qIndex, field, value) => {
    updateStep(stepIndex, (step) => {
      const questions = [...step.content.questions];
      questions[qIndex] = { ...questions[qIndex], [field]: value };
      return {
        ...step,
        content: { ...step.content, questions }
      };
    });
  };

  const handleAddOption = (stepIndex, qIndex) => {
    updateStep(stepIndex, (step) => {
      const questions = [...step.content.questions];
      const opts = [...questions[qIndex].options, { emoji: '😊', text: '', correct: false }];
      questions[qIndex] = { ...questions[qIndex], options: opts };
      return {
        ...step,
        content: { ...step.content, questions }
      };
    });
  };

  const handleRemoveOption = (stepIndex, qIndex, optIndex) => {
    updateStep(stepIndex, (step) => {
      const questions = [...step.content.questions];
      if (questions[qIndex].options.length <= 2) {
        alert('Questions must have at least 2 options.');
        return step;
      }
      const opts = questions[qIndex].options.filter((_, i) => i !== optIndex);
      questions[qIndex] = { ...questions[qIndex], options: opts };
      return {
        ...step,
        content: { ...step.content, questions }
      };
    });
  };

  const handleOptionChange = (stepIndex, qIndex, optIndex, field, value) => {
    updateStep(stepIndex, (step) => {
      const questions = [...step.content.questions];
      const opts = [...questions[qIndex].options];
      opts[optIndex] = { ...opts[optIndex], [field]: value };
      questions[qIndex] = { ...questions[qIndex], options: opts };
      return {
        ...step,
        content: { ...step.content, questions }
      };
    });
  };

  const handleSetCorrectOption = (stepIndex, qIndex, correctIdx) => {
    updateStep(stepIndex, (step) => {
      const questions = [...step.content.questions];
      const opts = questions[qIndex].options.map((opt, i) => ({
        ...opt,
        correct: i === correctIdx
      }));
      questions[qIndex] = { ...questions[qIndex], options: opts };
      return {
        ...step,
        content: { ...step.content, questions }
      };
    });
  };

  const handleSubmit = () => {
    if (!formData.weekId) {
      alert('Please select a week');
      return;
    }
    if (!formData.title.trim()) {
      alert('Please enter a lesson day title');
      return;
    }
    if (formData.steps.length === 0) {
      alert('Please include at least one lesson step');
      return;
    }

    // Sync step-level audioUrls from content for consistency
    const preparedSteps = formData.steps.map((step, idx) => {
      let topAudioUrl = step.audioUrl;
      let topAudioDuration = step.audioDuration || 0;

      if (step.type === 'meditation' && step.content?.introAudioUrl) {
        topAudioUrl = step.content.introAudioUrl;
        topAudioDuration = step.content.introAudioDuration || topAudioDuration;
      } else if (step.type === 'story' && step.content?.slides?.length > 0) {
        // top-level fallback
        topAudioUrl = step.content.slides[0]?.audioUrl || topAudioUrl;
        topAudioDuration = step.content.slides[0]?.audioDuration || topAudioDuration;
      } else if (step.type === 'reflection' && step.content?.audioUrl) {
        topAudioUrl = step.content.audioUrl;
        topAudioDuration = step.content.audioDuration || topAudioDuration;
      } else if (step.type === 'completion' && step.content?.audioUrl) {
        topAudioUrl = step.content.audioUrl;
        topAudioDuration = step.content.audioDuration || topAudioDuration;
      }

      return {
        ...step,
        order: idx,
        audioUrl: topAudioUrl || null,
        audioDuration: topAudioDuration || 0
      };
    });

    onSave({
      ...formData,
      steps: preparedSteps
    });
  };

  const currentStep = formData.steps[activeStepTab];

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-6 border border-[#E3DCC8] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center pb-4 mb-4 border-b border-[#E3DCC8]">
        <div>
          <span className="eyebrow text-xs">Denise / Admin Content Studio</span>
          <h2 className="font-baloo text-xl sm:text-2xl text-navy">
            {day ? '✏️ Edit Lesson Day & Audio Narration' : '📝 Create New Lesson Day & Audio'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary text-xs sm:text-sm py-1.5 px-3 sm:px-4"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary text-xs sm:text-sm py-1.5 px-4 sm:px-6"
            onClick={handleSubmit}
          >
            💾 Save Lesson
          </button>
        </div>
      </div>

      {/* Basic Lesson Information */}
      <div className="bg-cream rounded-xl p-4 border border-[#E3DCC8] mb-5">
        <h3 className="font-baloo font-bold text-navy text-sm mb-3">📍 Lesson Day Setup</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block font-baloo font-semibold text-navy text-xs mb-1">Grade</label>
            <select
              className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs sm:text-sm focus:border-sun focus:outline-none bg-white"
              value={formData.gradeId}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                const g = grades.find((gr) => gr.id === e.target.value);
                setFormData({
                  ...formData,
                  gradeId: e.target.value,
                  weekId: g?.weeks[0]?.id || ''
                });
              }}
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-baloo font-semibold text-navy text-xs mb-1">Week</label>
            <select
              className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs sm:text-sm focus:border-sun focus:outline-none bg-white"
              value={formData.weekId}
              onChange={(e) => setFormData({ ...formData, weekId: e.target.value })}
            >
              <option value="">Select a week</option>
              {grades
                .find((g) => g.id === selectedGrade)
                ?.weeks?.map((w) => (
                  <option key={w.id} value={w.id}>
                    Week {w.weekNumber}: {w.title}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-baloo font-semibold text-navy text-xs mb-1">Day Number</label>
            <input
              type="number"
              min="1"
              max="5"
              className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs sm:text-sm focus:border-sun focus:outline-none bg-white"
              value={formData.dayNumber}
              onChange={(e) => setFormData({ ...formData, dayNumber: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div>
            <label className="block font-baloo font-semibold text-navy text-xs mb-1">Guide Character</label>
            <select
              className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs sm:text-sm focus:border-sun focus:outline-none bg-white"
              value={formData.guideName}
              onChange={(e) => setFormData({ ...formData, guideName: e.target.value })}
            >
              <option>Sunny</option>
              <option>Owl</option>
              <option>Turtle</option>
              <option>Rabbit</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-baloo font-semibold text-navy text-xs mb-1">Day Title</label>
          <input
            type="text"
            className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm focus:border-sun focus:outline-none bg-white"
            placeholder="e.g., Welcome to Our Class Family"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
      </div>

      {/* Step Tabs Navigation */}
      <div className="mb-4">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
          <span className="font-baloo font-bold text-navy text-sm">
            5-Part Lesson Structure ({formData.steps.length} Steps)
          </span>
          <div className="flex flex-wrap gap-1">
            {['meditation', 'story', 'quiz', 'reflection', 'completion'].map((type) => (
              <button
                key={type}
                type="button"
                className="bg-cream hover:bg-sun/20 text-navy font-baloo font-semibold text-[11px] py-1 px-2.5 rounded-lg border border-[#E3DCC8] transition-colors"
                onClick={() => handleAddStep(type)}
              >
                + {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#FAF7F0] rounded-xl border border-[#E3DCC8]">
          {formData.steps.map((step, idx) => {
            const hasAudio =
              step.audioUrl ||
              step.content?.introAudioUrl ||
              step.content?.slides?.some((s) => s.audioUrl) ||
              step.content?.questions?.some((q) => q.audioUrl) ||
              step.content?.audioUrl;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveStepTab(idx)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-baloo text-xs font-semibold transition-all ${
                  activeStepTab === idx
                    ? 'bg-sun text-white shadow-sm'
                    : 'bg-white text-navy hover:bg-cream border border-[#E3DCC8]'
                }`}
              >
                <span>
                  {idx + 1}. {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                </span>
                {hasAudio && (
                  <span
                    className={`text-[10px] px-1 rounded-full ${
                      activeStepTab === idx ? 'bg-white text-sun font-bold' : 'text-grass font-bold'
                    }`}
                  >
                    🎙️
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Content Editor */}
      {currentStep && (
        <div className="bg-[#FCFAF6] rounded-xl p-4 border-2 border-sun/30 mb-6">
          <div className="flex flex-wrap justify-between items-center pb-3 mb-3 border-b border-[#E3DCC8]">
            <div className="flex items-center gap-2">
              <span className="bg-navy text-white font-baloo font-bold text-xs py-0.5 px-2.5 rounded-full">
                Step {activeStepTab + 1}: {currentStep.type.toUpperCase()}
              </span>
              <input
                type="text"
                className="font-baloo font-bold text-navy text-base bg-white border border-[#E3DCC8] rounded-lg px-2 py-0.5 focus:border-sun focus:outline-none"
                value={currentStep.title}
                onChange={(e) =>
                  updateStep(activeStepTab, (s) => ({ ...s, title: e.target.value }))
                }
              />
            </div>
            {formData.steps.length > 1 && (
              <button
                type="button"
                className="text-xs text-coral hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50"
                onClick={() => handleRemoveStep(activeStepTab)}
              >
                ✕ Delete Step
              </button>
            )}
          </div>

          {/* 1. MEDITATION STEP */}
          {currentStep.type === 'meditation' && (
            <div className="space-y-4">
              <div>
                <label className="block font-baloo font-semibold text-navy text-xs mb-1">
                  Breathing Intro Guidance (Read before breathing begins)
                </label>
                <textarea
                  rows={3}
                  className="w-full p-2.5 border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs sm:text-sm focus:border-sun focus:outline-none bg-white leading-relaxed"
                  placeholder="Intro guidance text..."
                  value={currentStep.content.intro || ''}
                  onChange={(e) =>
                    updateStep(activeStepTab, (s) => ({
                      ...s,
                      content: { ...s.content, intro: e.target.value }
                    }))
                  }
                />
              </div>

              {/* Meditation Intro Audio Slot */}
              <AudioSlotManager
                label="Meditation Intro Narration Audio"
                hint={currentStep.content.intro}
                audioUrl={currentStep.content.introAudioUrl || currentStep.audioUrl}
                audioDuration={currentStep.content.introAudioDuration || currentStep.audioDuration || 0}
                onChange={({ audioUrl, audioDuration }) => {
                  updateStep(activeStepTab, (s) => ({
                    ...s,
                    audioUrl,
                    audioDuration,
                    content: {
                      ...s.content,
                      introAudioUrl: audioUrl,
                      introAudioDuration: audioDuration
                    }
                  }));
                }}
                onRemove={() => {
                  updateStep(activeStepTab, (s) => ({
                    ...s,
                    audioUrl: null,
                    audioDuration: 0,
                    content: {
                      ...s.content,
                      introAudioUrl: null,
                      introAudioDuration: 0
                    }
                  }));
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-baloo font-semibold text-navy text-xs mb-1">
                    Number of Breathing Cycles
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs sm:text-sm focus:border-sun focus:outline-none bg-white"
                    value={currentStep.content.cycles || 5}
                    onChange={(e) =>
                      updateStep(activeStepTab, (s) => ({
                        ...s,
                        content: { ...s.content, cycles: parseInt(e.target.value) || 5 }
                      }))
                    }
                  />
                  <p className="text-[10px] text-[#7A8B99] mt-1">
                    Each cycle is 8 seconds (4s Inhale + 4s Exhale) with gentle visual cues.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. STORY STEP (MULTIPLE SLIDES WITH SEPARATE AUDIO PER SLIDE) */}
          {currentStep.type === 'story' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-baloo font-bold text-navy text-xs sm:text-sm">
                  Story Slides ({currentStep.content.slides?.length || 0} Slides)
                </span>
                <button
                  type="button"
                  onClick={() => handleAddSlide(activeStepTab)}
                  className="btn-primary text-xs py-1 px-3"
                >
                  + Add Slide
                </button>
              </div>

              <div className="space-y-4">
                {currentStep.content.slides?.map((slide, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white p-3.5 rounded-xl border-2 border-[#E3DCC8] shadow-sm relative"
                  >
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-[#E3DCC8]/60">
                      <div className="flex items-center gap-2">
                        <span className="bg-sun/20 text-sun-dark font-baloo font-bold text-xs py-0.5 px-2 rounded-md">
                          Slide {sIdx + 1}
                        </span>
                        <input
                          type="text"
                          className="font-baloo font-bold text-navy text-xs sm:text-sm border border-[#E3DCC8] rounded px-2 py-0.5"
                          placeholder="Slide Title"
                          value={slide.title}
                          onChange={(e) =>
                            handleSlideChange(activeStepTab, sIdx, 'title', e.target.value)
                          }
                        />
                      </div>
                      {currentStep.content.slides.length > 1 && (
                        <button
                          type="button"
                          className="text-xs text-coral hover:text-red-700 font-bold"
                          onClick={() => handleRemoveSlide(activeStepTab, sIdx)}
                        >
                          ✕ Delete Slide
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                      <div className="sm:col-span-2">
                        <label className="block font-baloo font-semibold text-navy text-xs mb-1">
                          Slide Text
                        </label>
                        <textarea
                          rows={2}
                          className="w-full p-2 border border-[#E3DCC8] rounded-lg font-nunito text-xs sm:text-sm focus:border-sun focus:outline-none"
                          placeholder="Write slide narrative..."
                          value={slide.text}
                          onChange={(e) =>
                            handleSlideChange(activeStepTab, sIdx, 'text', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block font-baloo font-semibold text-navy text-xs mb-1">
                          Slide Visual Art
                        </label>
                        <select
                          className="w-full p-2 border border-[#E3DCC8] rounded-lg font-nunito text-xs focus:border-sun focus:outline-none bg-white"
                          value={slide.visual}
                          onChange={(e) =>
                            handleSlideChange(activeStepTab, sIdx, 'visual', e.target.value)
                          }
                        >
                          {visualOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Separate Audio for THIS Slide */}
                    <AudioSlotManager
                      label={`Slide ${sIdx + 1} Audio Narration`}
                      hint={slide.text}
                      audioUrl={slide.audioUrl}
                      audioDuration={slide.audioDuration || 0}
                      onChange={({ audioUrl, audioDuration }) => {
                        handleSlideChange(activeStepTab, sIdx, 'audioUrl', audioUrl);
                        handleSlideChange(activeStepTab, sIdx, 'audioDuration', audioDuration);
                      }}
                      onRemove={() => {
                        handleSlideChange(activeStepTab, sIdx, 'audioUrl', null);
                        handleSlideChange(activeStepTab, sIdx, 'audioDuration', 0);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. QUIZ / CHECK-IN STEP (MULTIPLE QUESTIONS WITH SEPARATE AUDIO PER QUESTION) */}
          {currentStep.type === 'quiz' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-baloo font-bold text-navy text-xs sm:text-sm">
                  Check-In Questions ({currentStep.content.questions?.length || 0} Questions)
                </span>
                <button
                  type="button"
                  onClick={() => handleAddQuestion(activeStepTab)}
                  className="btn-primary text-xs py-1 px-3"
                >
                  + Add Question
                </button>
              </div>

              <div className="space-y-4">
                {currentStep.content.questions?.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="bg-white p-3.5 rounded-xl border-2 border-[#E3DCC8] shadow-sm"
                  >
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-[#E3DCC8]/60">
                      <span className="bg-sky/20 text-navy font-baloo font-bold text-xs py-0.5 px-2 rounded-md">
                        Question {qIdx + 1}
                      </span>
                      {currentStep.content.questions.length > 1 && (
                        <button
                          type="button"
                          className="text-xs text-coral hover:text-red-700 font-bold"
                          onClick={() => handleRemoveQuestion(activeStepTab, qIdx)}
                        >
                          ✕ Delete Question
                        </button>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="block font-baloo font-semibold text-navy text-xs mb-1">
                        Question Prompt
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs sm:text-sm focus:border-sun focus:outline-none"
                        placeholder="e.g., How did Sunny feel at the start?"
                        value={q.question}
                        onChange={(e) =>
                          handleQuestionChange(activeStepTab, qIdx, 'question', e.target.value)
                        }
                      />
                    </div>

                    {/* Question Narration Audio */}
                    <AudioSlotManager
                      label={`Question ${qIdx + 1} Audio Narration`}
                      hint={q.question}
                      audioUrl={q.audioUrl}
                      audioDuration={q.audioDuration || 0}
                      onChange={({ audioUrl, audioDuration }) => {
                        handleQuestionChange(activeStepTab, qIdx, 'audioUrl', audioUrl);
                        handleQuestionChange(activeStepTab, qIdx, 'audioDuration', audioDuration);
                      }}
                      onRemove={() => {
                        handleQuestionChange(activeStepTab, qIdx, 'audioUrl', null);
                        handleQuestionChange(activeStepTab, qIdx, 'audioDuration', 0);
                      }}
                    />

                    {/* Options list */}
                    <div className="mt-3 bg-cream p-2.5 rounded-xl border border-[#E3DCC8]">
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-baloo font-bold text-navy text-xs">
                          Answer Options (Select the correct one):
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddOption(activeStepTab, qIdx)}
                          className="text-[11px] text-sky font-bold hover:underline"
                        >
                          + Add Option
                        </button>
                      </div>

                      <div className="space-y-2">
                        {q.options?.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`flex flex-wrap items-center gap-2 p-2 rounded-lg border transition-all ${
                              opt.correct
                                ? 'bg-[#E4F4E8] border-grass'
                                : 'bg-white border-[#E3DCC8]'
                            }`}
                          >
                            <select
                              className="p-1 border border-[#E3DCC8] rounded text-base bg-white"
                              value={opt.emoji}
                              onChange={(e) =>
                                handleOptionChange(
                                  activeStepTab,
                                  qIdx,
                                  optIdx,
                                  'emoji',
                                  e.target.value
                                )
                              }
                            >
                              {emojiOptions.map((em) => (
                                <option key={em} value={em}>
                                  {em}
                                </option>
                              ))}
                            </select>

                            <input
                              type="text"
                              className="flex-1 min-w-[120px] p-1.5 border border-[#E3DCC8] rounded-lg font-nunito text-xs sm:text-sm bg-white"
                              placeholder={`Option ${optIdx + 1} text`}
                              value={opt.text}
                              onChange={(e) =>
                                handleOptionChange(
                                  activeStepTab,
                                  qIdx,
                                  optIdx,
                                  'text',
                                  e.target.value
                                )
                              }
                            />

                            <label className="flex items-center gap-1 text-xs font-baloo font-bold cursor-pointer whitespace-nowrap">
                              <input
                                type="radio"
                                name={`correct-${activeStepTab}-${qIdx}`}
                                checked={opt.correct}
                                onChange={() =>
                                  handleSetCorrectOption(activeStepTab, qIdx, optIdx)
                                }
                              />
                              <span className={opt.correct ? 'text-grass' : 'text-navy'}>
                                {opt.correct ? '✓ Correct Answer' : 'Mark Correct'}
                              </span>
                            </label>

                            {q.options.length > 2 && (
                              <button
                                type="button"
                                className="text-coral hover:text-red-700 font-bold text-xs px-1"
                                onClick={() =>
                                  handleRemoveOption(activeStepTab, qIdx, optIdx)
                                }
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. REFLECTION STEP */}
          {currentStep.type === 'reflection' && (
            <div className="space-y-4">
              <div>
                <label className="block font-baloo font-semibold text-navy text-xs mb-1">
                  Reflection Activity Prompt
                </label>
                <textarea
                  rows={3}
                  className="w-full p-2.5 border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs sm:text-sm focus:border-sun focus:outline-none bg-white leading-relaxed"
                  placeholder="Now it's your turn! Stand up and..."
                  value={currentStep.content.text || ''}
                  onChange={(e) =>
                    updateStep(activeStepTab, (s) => ({
                      ...s,
                      content: { ...s.content, text: e.target.value }
                    }))
                  }
                />
              </div>

              {/* Reflection Audio Slot */}
              <AudioSlotManager
                label="Reflection Prompt Audio Narration"
                hint={currentStep.content.text}
                audioUrl={currentStep.content.audioUrl || currentStep.audioUrl}
                audioDuration={currentStep.content.audioDuration || currentStep.audioDuration || 0}
                onChange={({ audioUrl, audioDuration }) => {
                  updateStep(activeStepTab, (s) => ({
                    ...s,
                    audioUrl,
                    audioDuration,
                    content: { ...s.content, audioUrl, audioDuration }
                  }));
                }}
                onRemove={() => {
                  updateStep(activeStepTab, (s) => ({
                    ...s,
                    audioUrl: null,
                    audioDuration: 0,
                    content: { ...s.content, audioUrl: null, audioDuration: 0 }
                  }));
                }}
              />
            </div>
          )}

          {/* 5. COMPLETION STEP */}
          {currentStep.type === 'completion' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block font-baloo font-semibold text-navy text-xs mb-1">
                    Completion & Celebration Message
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs sm:text-sm focus:border-sun focus:outline-none bg-white"
                    placeholder="Nice work finishing this day with Sunny!"
                    value={currentStep.content.message || ''}
                    onChange={(e) =>
                      updateStep(activeStepTab, (s) => ({
                        ...s,
                        content: { ...s.content, message: e.target.value }
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block font-baloo font-semibold text-navy text-xs mb-1">Badge Emoji</label>
                  <input
                    type="text"
                    className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-center text-lg bg-white"
                    value={currentStep.content.badge || '⭐'}
                    onChange={(e) =>
                      updateStep(activeStepTab, (s) => ({
                        ...s,
                        content: { ...s.content, badge: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>

              {/* Completion Audio Slot */}
              <AudioSlotManager
                label="Celebration Cheer Audio Narration"
                hint={currentStep.content.message}
                audioUrl={currentStep.content.audioUrl || currentStep.audioUrl}
                audioDuration={currentStep.content.audioDuration || currentStep.audioDuration || 0}
                onChange={({ audioUrl, audioDuration }) => {
                  updateStep(activeStepTab, (s) => ({
                    ...s,
                    audioUrl,
                    audioDuration,
                    content: { ...s.content, audioUrl, audioDuration }
                  }));
                }}
                onRemove={() => {
                  updateStep(activeStepTab, (s) => ({
                    ...s,
                    audioUrl: null,
                    audioDuration: 0,
                    content: { ...s.content, audioUrl: null, audioDuration: 0 }
                  }));
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-[#E3DCC8]">
        <span className="text-xs text-[#7A8B99]">
          💡 Note: All audio clips automatically synchronize with slide timers and never overlap.
        </span>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary text-sm py-2 px-4" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-primary text-sm py-2 px-6" onClick={handleSubmit}>
            💾 Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;