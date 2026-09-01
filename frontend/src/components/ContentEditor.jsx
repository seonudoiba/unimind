// frontend/src/components/ContentEditor.jsx
import React, { useState } from 'react';
import AudioSlotManager, { formatDuration } from './AudioSlotManager';

const ContentEditor = ({ grade, week, day, grades, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState('setup'); // 'setup' | 'step-0' | 'step-1' ...
  const [formData, setFormData] = useState(() => {
    if (day) {
      return {
        gradeId: grade?.id || grades[0]?.id || '',
        weekId: week?.id || grades[0]?.weeks[0]?.id || '',
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
    const newIndex = formData.steps.length;
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep]
    });
    setActiveTab(`step-${newIndex}`);
  };

  const handleRemoveStep = (index) => {
    if (window.confirm(`Delete Step ${index + 1} (${formData.steps[index].type})?`)) {
      const updated = formData.steps.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        steps: updated
      });
      setActiveTab(updated.length > 0 ? `step-${Math.max(0, index - 1)}` : 'setup');
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

  // Calculate audio stats for this lesson
  let totalAudioSlots = 0;
  let recordedAudioSlots = 0;
  formData.steps.forEach(step => {
    if (step.type === 'meditation') {
      totalAudioSlots++;
      if (step.content?.introAudioUrl || step.audioUrl) recordedAudioSlots++;
    } else if (step.type === 'story') {
      (step.content?.slides || []).forEach(slide => {
        totalAudioSlots++;
        if (slide.audioUrl) recordedAudioSlots++;
      });
    } else if (step.type === 'quiz') {
      (step.content?.questions || []).forEach(q => {
        totalAudioSlots++;
        if (q.audioUrl) recordedAudioSlots++;
      });
    } else if (step.type === 'reflection') {
      totalAudioSlots++;
      if (step.content?.audioUrl || step.audioUrl) recordedAudioSlots++;
    } else if (step.type === 'completion') {
      totalAudioSlots++;
      if (step.content?.audioUrl || step.audioUrl) recordedAudioSlots++;
    }
  });

  const activeStepIdx = activeTab.startsWith('step-') ? parseInt(activeTab.replace('step-', ''), 10) : null;
  const currentStep = activeStepIdx !== null ? formData.steps[activeStepIdx] : null;

  return (
    <div className="bg-white rounded-2xl shadow-soft-hover border border-[#E3DCC8] flex flex-col max-h-[92vh] overflow-hidden">
      {/* Studio Header Bar */}
      <div className="px-6 py-4 border-b border-[#E3DCC8] bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sun/15 border border-sun/30 flex items-center justify-center text-xl">
            {day ? '✏️' : '✨'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A8B99]">Curriculum Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream border border-[#E3DCC8] font-bold text-navy">
                {recordedAudioSlots}/{totalAudioSlots} Audio Clips
              </span>
            </div>
            <h2 className="font-baloo font-bold text-navy text-xl">
              {formData.title ? formData.title : (day ? 'Edit Lesson Day' : 'Create New Lesson Day')}
            </h2>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-xl border border-[#E3DCC8] bg-white hover:bg-cream text-navy font-baloo font-bold text-xs transition-all"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary text-xs py-2 px-6 shadow-md"
            onClick={handleSubmit}
          >
            💾 Save & Publish Lesson
          </button>
        </div>
      </div>

      {/* Main Studio Body: 2-Column Desktop Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Step Navigator Rail (Desktop) */}
        <div className="w-72 border-r border-[#E3DCC8] bg-[#FAF7F0] p-4 flex flex-col justify-between overflow-y-auto hidden md:flex">
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9AA8B4]">
              Lesson Structure & Steps
            </div>

            {/* General Setup Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('setup')}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-baloo text-xs text-left transition-all ${
                activeTab === 'setup'
                  ? 'bg-sun text-white font-bold shadow-sm'
                  : 'bg-white text-navy hover:bg-white/80 border border-[#E3DCC8]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>⚙️</span>
                <span>Lesson Setup & Metadata</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${activeTab === 'setup' ? 'bg-white/20 text-white' : 'bg-cream text-[#7A8B99]'}`}>
                Day {formData.dayNumber}
              </span>
            </button>

            {/* Step List */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between px-1 text-[11px] font-bold text-[#7A8B99]">
                <span>5-Step Timeline</span>
                <span className="text-[10px] text-grass font-bold">{recordedAudioSlots}/{totalAudioSlots} 🎙️</span>
              </div>

              {formData.steps.map((step, idx) => {
                const isStepActive = activeTab === `step-${idx}`;
                const stepHasAudio =
                  step.audioUrl ||
                  step.content?.introAudioUrl ||
                  step.content?.slides?.some((s) => s.audioUrl) ||
                  step.content?.questions?.some((q) => q.audioUrl) ||
                  step.content?.audioUrl;

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveTab(`step-${idx}`)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between gap-2 ${
                      isStepActive
                        ? 'bg-white border-sun shadow-sm ring-2 ring-sun/20'
                        : 'bg-white/70 hover:bg-white border-[#E3DCC8]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-navy text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-baloo font-bold text-xs text-navy truncate">
                          {step.title || step.type.toUpperCase()}
                        </p>
                        <p className="text-[10px] text-[#7A8B99] capitalize">
                          {step.type}
                          {step.type === 'story' && ` (${step.content?.slides?.length || 0} slides)`}
                          {step.type === 'quiz' && ` (${step.content?.questions?.length || 0} Qs)`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {stepHasAudio ? (
                        <span className="text-xs text-grass font-bold" title="Custom audio attached">🎙️</span>
                      ) : (
                        <span className="text-xs text-[#9AA8B4]" title="TTS fallback">💬</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Step Dropdown / Buttons */}
            <div className="pt-3 border-t border-[#E3DCC8]/80">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#9AA8B4] mb-2">
                + Add Extra Step
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {['meditation', 'story', 'quiz', 'reflection', 'completion'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleAddStep(type)}
                    className="p-1.5 bg-white hover:bg-sun/15 border border-[#E3DCC8] rounded-lg text-[10px] font-baloo font-bold text-navy capitalize transition-colors text-center"
                  >
                    + {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E3DCC8] text-[11px] text-[#7A8B99]">
            💡 Studio Tip: Real voice uploads take precedence over TTS automatically.
          </div>
        </div>

        {/* Right Form Canvas (Desktop Full Width) */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          {/* Mobile step selector bar */}
          <div className="md:hidden flex gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-[#E3DCC8]">
            <button
              type="button"
              onClick={() => setActiveTab('setup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-baloo font-bold whitespace-nowrap ${
                activeTab === 'setup' ? 'bg-sun text-white' : 'bg-cream text-navy'
              }`}
            >
              ⚙️ Setup
            </button>
            {formData.steps.map((step, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(`step-${idx}`)}
                className={`px-3 py-1.5 rounded-lg text-xs font-baloo font-bold whitespace-nowrap ${
                  activeTab === `step-${idx}` ? 'bg-sun text-white' : 'bg-cream text-navy'
                }`}
              >
                {idx + 1}. {step.type}
              </button>
            ))}
          </div>

          {/* TAB 1: LESSON DAY SETUP & METADATA */}
          {activeTab === 'setup' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-baloo font-bold text-navy text-lg mb-1">⚙️ General Lesson Information</h3>
                <p className="text-xs text-[#7A8B99]">
                  Configure the grade level, week, day sequence, and assigned character guide for this assessment day.
                </p>
              </div>

              <div className="bg-[#FAF7F0] p-5 rounded-2xl border border-[#E3DCC8] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-baloo font-bold text-navy text-xs mb-1.5">Grade Level</label>
                    <select
                      className="w-full p-2.5 bg-white border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs font-semibold focus:border-sun focus:outline-none"
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
                    <label className="block font-baloo font-bold text-navy text-xs mb-1.5">Curriculum Week</label>
                    <select
                      className="w-full p-2.5 bg-white border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs font-semibold focus:border-sun focus:outline-none"
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
                    <label className="block font-baloo font-bold text-navy text-xs mb-1.5">Day Sequence (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      className="w-full p-2.5 bg-white border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs font-semibold focus:border-sun focus:outline-none"
                      value={formData.dayNumber}
                      onChange={(e) => setFormData({ ...formData, dayNumber: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  <div>
                    <label className="block font-baloo font-bold text-navy text-xs mb-1.5">Guide Character</label>
                    <select
                      className="w-full p-2.5 bg-white border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs font-semibold focus:border-sun focus:outline-none"
                      value={formData.guideName}
                      onChange={(e) => setFormData({ ...formData, guideName: e.target.value })}
                    >
                      <option value="Sunny">☀️ Sunny the Sun</option>
                      <option value="Owl">🦉 Ollie the Owl</option>
                      <option value="Turtle">🐢 Toby the Turtle</option>
                      <option value="Rabbit">🐰 Rosie the Rabbit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-baloo font-bold text-navy text-xs mb-1.5">Lesson Day Title</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-white border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm font-semibold focus:border-sun focus:outline-none"
                    placeholder="e.g., Welcome to Our Class Family"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              {/* Guide Character Preview Card */}
              <div className="bg-cream/70 p-4 rounded-2xl border border-[#E3DCC8] flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#E3DCC8] flex items-center justify-center text-3xl shadow-sm">
                  {formData.guideName === 'Sunny' ? '☀️' : formData.guideName === 'Owl' ? '🦉' : formData.guideName === 'Turtle' ? '🐢' : '🐰'}
                </div>
                <div>
                  <h4 className="font-baloo font-bold text-navy text-sm">
                    {formData.guideName} will lead students on this assessment day
                  </h4>
                  <p className="text-xs text-[#7A8B99]">
                    Nervous-system-friendly pacing, warm tone, calm narration, and interactive exercises.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('step-0')}
                  className="btn-primary text-xs py-2 px-6"
                >
                  Proceed to Step 1: Meditation →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE STEP CONTENT & AUDIO */}
          {currentStep && activeStepIdx !== null && (
            <div className="space-y-6 max-w-3xl">
              {/* Step Header with Type & Title */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E3DCC8]">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-navy text-white font-baloo font-bold text-xs uppercase tracking-wide">
                    Step {activeStepIdx + 1} of {formData.steps.length}: {currentStep.type}
                  </span>
                  <input
                    type="text"
                    className="font-baloo font-bold text-navy text-lg bg-[#FAF7F0] border border-[#E3DCC8] rounded-xl px-3 py-1 focus:bg-white focus:border-sun focus:outline-none"
                    value={currentStep.title}
                    onChange={(e) =>
                      updateStep(activeStepIdx, (s) => ({ ...s, title: e.target.value }))
                    }
                  />
                </div>

                {formData.steps.length > 1 && (
                  <button
                    type="button"
                    className="text-xs text-coral hover:text-red-700 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={() => handleRemoveStep(activeStepIdx)}
                  >
                    🗑️ Delete Step
                  </button>
                )}
              </div>

              {/* 1. MEDITATION STEP */}
              {currentStep.type === 'meditation' && (
                <div className="space-y-5">
                  <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#E3DCC8] space-y-3">
                    <label className="block font-baloo font-bold text-navy text-xs">
                      Breathing Intro Guidance (Narration read before breathing begins)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-3 bg-white border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs sm:text-sm focus:border-sun focus:outline-none leading-relaxed"
                      placeholder="Intro guidance text..."
                      value={currentStep.content.intro || ''}
                      onChange={(e) =>
                        updateStep(activeStepIdx, (s) => ({
                          ...s,
                          content: { ...s.content, intro: e.target.value }
                        }))
                      }
                    />

                    {/* Meditation Audio Manager */}
                    <AudioSlotManager
                      label="Meditation Voice Narration"
                      hint={currentStep.content.intro}
                      audioUrl={currentStep.content.introAudioUrl || currentStep.audioUrl}
                      audioDuration={currentStep.content.introAudioDuration || currentStep.audioDuration || 0}
                      onChange={({ audioUrl, audioDuration }) => {
                        updateStep(activeStepIdx, (s) => ({
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
                        updateStep(activeStepIdx, (s) => ({
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
                  </div>

                  <div className="bg-cream/60 p-4 rounded-2xl border border-[#E3DCC8]">
                    <label className="block font-baloo font-bold text-navy text-xs mb-1">
                      Number of Breathing Cycles (8s per cycle: 4s Inhale + 4s Exhale)
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      className="w-32 p-2 bg-white border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs font-bold focus:border-sun focus:outline-none"
                      value={currentStep.content.cycles || 5}
                      onChange={(e) =>
                        updateStep(activeStepIdx, (s) => ({
                          ...s,
                          content: { ...s.content, cycles: parseInt(e.target.value) || 5 }
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* 2. STORY STEP (MULTIPLE SLIDES) */}
              {currentStep.type === 'story' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-baloo font-bold text-navy text-sm">
                      Story Narrative Slides ({currentStep.content.slides?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddSlide(activeStepIdx)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      + Add Slide
                    </button>
                  </div>

                  <div className="space-y-4">
                    {currentStep.content.slides?.map((slide, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#E3DCC8] space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#E3DCC8]">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-sun text-white font-baloo font-bold text-xs">
                              Slide {sIdx + 1}
                            </span>
                            <input
                              type="text"
                              className="font-baloo font-bold text-navy text-xs sm:text-sm bg-white border border-[#E3DCC8] rounded-lg px-2 py-1"
                              placeholder="Slide Title"
                              value={slide.title}
                              onChange={(e) =>
                                handleSlideChange(activeStepIdx, sIdx, 'title', e.target.value)
                              }
                            />
                          </div>
                          {currentStep.content.slides.length > 1 && (
                            <button
                              type="button"
                              className="text-xs text-coral hover:text-red-700 font-bold"
                              onClick={() => handleRemoveSlide(activeStepIdx, sIdx)}
                            >
                              ✕ Delete Slide
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block font-baloo font-bold text-navy text-xs mb-1">
                              Slide Narrative Text
                            </label>
                            <textarea
                              rows={2}
                              className="w-full p-2 bg-white border border-[#E3DCC8] rounded-xl font-nunito text-xs focus:border-sun focus:outline-none"
                              placeholder="Slide story text..."
                              value={slide.text}
                              onChange={(e) =>
                                handleSlideChange(activeStepIdx, sIdx, 'text', e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <label className="block font-baloo font-bold text-navy text-xs mb-1">
                              Visual Animation
                            </label>
                            <select
                              className="w-full p-2 bg-white border border-[#E3DCC8] rounded-xl font-nunito text-xs focus:border-sun focus:outline-none"
                              value={slide.visual}
                              onChange={(e) =>
                                handleSlideChange(activeStepIdx, sIdx, 'visual', e.target.value)
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

                        {/* Individual Slide Audio */}
                        <AudioSlotManager
                          label={`Slide ${sIdx + 1} Audio Narration`}
                          hint={slide.text}
                          audioUrl={slide.audioUrl}
                          audioDuration={slide.audioDuration || 0}
                          onChange={({ audioUrl, audioDuration }) => {
                            handleSlideChange(activeStepIdx, sIdx, 'audioUrl', audioUrl);
                            handleSlideChange(activeStepIdx, sIdx, 'audioDuration', audioDuration);
                          }}
                          onRemove={() => {
                            handleSlideChange(activeStepIdx, sIdx, 'audioUrl', null);
                            handleSlideChange(activeStepIdx, sIdx, 'audioDuration', 0);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. QUIZ / CHECK-IN STEP */}
              {currentStep.type === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-baloo font-bold text-navy text-sm">
                      Check-In Comprehension Questions ({currentStep.content.questions?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion(activeStepIdx)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      + Add Question
                    </button>
                  </div>

                  <div className="space-y-4">
                    {currentStep.content.questions?.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#E3DCC8] space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#E3DCC8]">
                          <span className="px-2 py-0.5 rounded-md bg-sky text-white font-baloo font-bold text-xs">
                            Question {qIdx + 1}
                          </span>
                          {currentStep.content.questions.length > 1 && (
                            <button
                              type="button"
                              className="text-xs text-coral hover:text-red-700 font-bold"
                              onClick={() => handleRemoveQuestion(activeStepIdx, qIdx)}
                            >
                              ✕ Delete Question
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block font-baloo font-bold text-navy text-xs mb-1">
                            Question Prompt
                          </label>
                          <input
                            type="text"
                            className="w-full p-2.5 bg-white border border-[#E3DCC8] rounded-xl font-nunito text-xs font-semibold focus:border-sun focus:outline-none"
                            placeholder="e.g., How did Sunny feel at the start?"
                            value={q.question}
                            onChange={(e) =>
                              handleQuestionChange(activeStepIdx, qIdx, 'question', e.target.value)
                            }
                          />
                        </div>

                        {/* Question Audio */}
                        <AudioSlotManager
                          label={`Question ${qIdx + 1} Audio Narration`}
                          hint={q.question}
                          audioUrl={q.audioUrl}
                          audioDuration={q.audioDuration || 0}
                          onChange={({ audioUrl, audioDuration }) => {
                            handleQuestionChange(activeStepIdx, qIdx, 'audioUrl', audioUrl);
                            handleQuestionChange(activeStepIdx, qIdx, 'audioDuration', audioDuration);
                          }}
                          onRemove={() => {
                            handleQuestionChange(activeStepIdx, qIdx, 'audioUrl', null);
                            handleQuestionChange(activeStepIdx, qIdx, 'audioDuration', 0);
                          }}
                        />

                        {/* Answer Choices */}
                        <div className="bg-white p-3 rounded-xl border border-[#E3DCC8] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-baloo font-bold text-navy text-xs">
                              Answer Choices (Select correct answer):
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddOption(activeStepIdx, qIdx)}
                              className="text-[11px] font-bold text-sky hover:underline"
                            >
                              + Add Option
                            </button>
                          </div>

                          <div className="space-y-2">
                            {q.options?.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                  opt.correct
                                    ? 'bg-[#E4F4E8] border-grass'
                                    : 'bg-[#FAF7F0] border-[#E3DCC8]'
                                }`}
                              >
                                <select
                                  className="p-1 border border-[#E3DCC8] rounded-lg text-sm bg-white"
                                  value={opt.emoji}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      activeStepIdx,
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
                                  className="flex-1 p-1.5 bg-white border border-[#E3DCC8] rounded-lg font-nunito text-xs"
                                  placeholder={`Option ${optIdx + 1}`}
                                  value={opt.text}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      activeStepIdx,
                                      qIdx,
                                      optIdx,
                                      'text',
                                      e.target.value
                                    )
                                  }
                                />

                                <label className="flex items-center gap-1.5 text-xs font-baloo font-bold cursor-pointer whitespace-nowrap pl-2">
                                  <input
                                    type="radio"
                                    name={`correct-${activeStepIdx}-${qIdx}`}
                                    checked={opt.correct}
                                    onChange={() =>
                                      handleSetCorrectOption(activeStepIdx, qIdx, optIdx)
                                    }
                                  />
                                  <span className={opt.correct ? 'text-grass' : 'text-[#7A8B99]'}>
                                    {opt.correct ? '✓ Correct' : 'Mark'}
                                  </span>
                                </label>

                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    className="text-coral hover:text-red-700 font-bold text-xs px-1"
                                    onClick={() => handleRemoveOption(activeStepIdx, qIdx, optIdx)}
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
                  <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#E3DCC8] space-y-3">
                    <label className="block font-baloo font-bold text-navy text-xs">
                      Reflection Prompt (Student turn to share with peers)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-3 bg-white border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs sm:text-sm focus:border-sun focus:outline-none leading-relaxed"
                      placeholder="e.g., Turn to your neighbor and wave..."
                      value={currentStep.content.text || ''}
                      onChange={(e) =>
                        updateStep(activeStepIdx, (s) => ({
                          ...s,
                          content: { ...s.content, text: e.target.value }
                        }))
                      }
                    />

                    {/* Reflection Audio */}
                    <AudioSlotManager
                      label="Reflection Prompt Audio"
                      hint={currentStep.content.text}
                      audioUrl={currentStep.content.audioUrl || currentStep.audioUrl}
                      audioDuration={currentStep.content.audioDuration || currentStep.audioDuration || 0}
                      onChange={({ audioUrl, audioDuration }) => {
                        updateStep(activeStepIdx, (s) => ({
                          ...s,
                          audioUrl,
                          audioDuration,
                          content: { ...s.content, audioUrl, audioDuration }
                        }));
                      }}
                      onRemove={() => {
                        updateStep(activeStepIdx, (s) => ({
                          ...s,
                          audioUrl: null,
                          audioDuration: 0,
                          content: { ...s.content, audioUrl: null, audioDuration: 0 }
                        }));
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 5. COMPLETION STEP */}
              {currentStep.type === 'completion' && (
                <div className="space-y-4">
                  <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#E3DCC8] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block font-baloo font-bold text-navy text-xs mb-1">
                          Celebration Message
                        </label>
                        <input
                          type="text"
                          className="w-full p-2.5 bg-white border-2 border-[#E3DCC8] rounded-xl font-nunito text-xs font-semibold focus:border-sun focus:outline-none"
                          placeholder="e.g., Nice work finishing this day with Sunny!"
                          value={currentStep.content.message || ''}
                          onChange={(e) =>
                            updateStep(activeStepIdx, (s) => ({
                              ...s,
                              content: { ...s.content, message: e.target.value }
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block font-baloo font-bold text-navy text-xs mb-1">Badge Icon</label>
                        <input
                          type="text"
                          className="w-full p-2 bg-white border-2 border-[#E3DCC8] rounded-xl font-nunito text-center text-lg"
                          value={currentStep.content.badge || '⭐'}
                          onChange={(e) =>
                            updateStep(activeStepIdx, (s) => ({
                              ...s,
                              content: { ...s.content, badge: e.target.value }
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Completion Audio */}
                    <AudioSlotManager
                      label="Celebration Cheer Audio"
                      hint={currentStep.content.message}
                      audioUrl={currentStep.content.audioUrl || currentStep.audioUrl}
                      audioDuration={currentStep.content.audioDuration || currentStep.audioDuration || 0}
                      onChange={({ audioUrl, audioDuration }) => {
                        updateStep(activeStepIdx, (s) => ({
                          ...s,
                          audioUrl,
                          audioDuration,
                          content: { ...s.content, audioUrl, audioDuration }
                        }));
                      }}
                      onRemove={() => {
                        updateStep(activeStepIdx, (s) => ({
                          ...s,
                          audioUrl: null,
                          audioDuration: 0,
                          content: { ...s.content, audioUrl: null, audioDuration: 0 }
                        }));
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Bottom Navigation between steps */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E3DCC8]">
                <button
                  type="button"
                  onClick={() => {
                    if (activeStepIdx === 0) {
                      setActiveTab('setup');
                    } else {
                      setActiveTab(`step-${activeStepIdx - 1}`);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#E3DCC8] text-xs font-baloo font-bold text-navy hover:bg-cream"
                >
                  ← Previous
                </button>

                {activeStepIdx < formData.steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab(`step-${activeStepIdx + 1}`)}
                    className="btn-primary text-xs py-1.5 px-4"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-primary text-xs py-2 px-6"
                  >
                    💾 Save All Changes
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;