import React, { useState } from 'react';

const ContentManager = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        grade: initialData.grade,
        week: initialData.week,
        day: initialData.day,
        title: initialData.title,
        guideName: initialData.guideName,
        steps: {
          meditation: {
            title: initialData.steps.find(s => s.id === 'meditation')?.title || '',
            intro: initialData.steps.find(s => s.id === 'meditation')?.content?.intro || '',
            cycles: initialData.steps.find(s => s.id === 'meditation')?.content?.cycles || 5
          },
          story: {
            title: initialData.steps.find(s => s.id === 'story')?.title || '',
            slides: initialData.steps.find(s => s.id === 'story')?.content?.slides || [
              { title: '', text: '', visual: 'sunny-alone' }
            ]
          },
          quiz: {
            questions: initialData.steps.find(s => s.id === 'discussion')?.content?.questions || [
              {
                question: '',
                options: [
                  { emoji: '😊', text: '', correct: false },
                  { emoji: '😕', text: '', correct: false },
                  { emoji: '🤔', text: '', correct: false }
                ]
              }
            ]
          },
          reflection: {
            title: initialData.steps.find(s => s.id === 'reflection')?.title || '',
            text: initialData.steps.find(s => s.id === 'reflection')?.content?.text || ''
          },
          completion: {
            message: initialData.steps.find(s => s.id === 'badge')?.content?.message || ''
          }
        }
      };
    }
    return {
      grade: 'Kindergarten',
      week: 1,
      day: 1,
      title: '',
      guideName: 'Sunny',
      steps: {
        meditation: { title: '', intro: '', cycles: 5 },
        story: { title: '', slides: [{ title: '', text: '', visual: 'sunny-alone' }] },
        quiz: {
          questions: [
            {
              question: '',
              options: [
                { emoji: '😊', text: '', correct: false },
                { emoji: '😕', text: '', correct: false },
                { emoji: '🤔', text: '', correct: false }
              ]
            }
          ]
        },
        reflection: { title: '', text: '' },
        completion: { message: '' }
      }
    };
  });

  const [currentTab, setCurrentTab] = useState('basic');

  const handleInputChange = (path, value) => {
    const newData = { ...formData };
    const keys = path.split('.');
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setFormData(newData);
  };

  const addStorySlide = () => {
    setFormData({
      ...formData,
      steps: {
        ...formData.steps,
        story: {
          ...formData.steps.story,
          slides: [
            ...formData.steps.story.slides,
            { title: '', text: '', visual: 'sunny-alone' }
          ]
        }
      }
    });
  };

  const removeStorySlide = (index) => {
    const newSlides = formData.steps.story.slides.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      steps: {
        ...formData.steps,
        story: {
          ...formData.steps.story,
          slides: newSlides
        }
      }
    });
  };

  const addQuizQuestion = () => {
    setFormData({
      ...formData,
      steps: {
        ...formData.steps,
        quiz: {
          ...formData.steps.quiz,
          questions: [
            ...formData.steps.quiz.questions,
            {
              question: '',
              options: [
                { emoji: '😊', text: '', correct: false },
                { emoji: '😕', text: '', correct: false },
                { emoji: '🤔', text: '', correct: false }
              ]
            }
          ]
        }
      }
    });
  };

  const removeQuizQuestion = (index) => {
    const newQuestions = formData.steps.quiz.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      steps: {
        ...formData.steps,
        quiz: {
          ...formData.steps.quiz,
          questions: newQuestions
        }
      }
    });
  };

  const handleSave = () => {
    const dayData = {
      id: `${formData.grade.substring(0, 1)}-W${formData.week}-D${formData.day}`,
      grade: formData.grade,
      week: formData.week,
      day: formData.day,
      title: formData.title,
      guideName: formData.guideName,
      steps: [
        {
          id: 'meditation',
          type: 'meditation',
          title: formData.steps.meditation.title,
          content: {
            intro: formData.steps.meditation.intro,
            cycles: parseInt(formData.steps.meditation.cycles)
          }
        },
        {
          id: 'story',
          type: 'story',
          title: formData.steps.story.title,
          content: {
            slides: formData.steps.story.slides
          }
        },
        {
          id: 'discussion',
          type: 'quiz',
          title: 'Check-In',
          content: {
            questions: formData.steps.quiz.questions
          }
        },
        {
          id: 'reflection',
          type: 'reflection',
          title: formData.steps.reflection.title,
          content: {
            text: formData.steps.reflection.text
          }
        },
        {
          id: 'badge',
          type: 'completion',
          title: 'You Did It!',
          content: {
            message: formData.steps.completion.message || 'Great job!',
            badge: '⭐'
          }
        }
      ]
    };
    
    onSave(dayData);
  };

  const visualOptions = ['sunny-alone', 'sunny-big', 'friends-static', 'friends-bounce'];
  const emojiOptions = ['😊', '😟', '😄', '😴', '🙈', '👋', '🏃', '🤔', '⭐', '🌟'];

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft-hover p-3 sm:p-6 max-w-4xl mx-auto max-h-[90vh] overflow-y-auto w-full">
      <h2 className="font-baloo text-lg sm:text-2xl text-navy mb-3 sm:mb-4">📝 Create New Lesson Day</h2>
      
      <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-[#E3DCC8] flex-wrap">
        {['basic', 'meditation', 'story', 'quiz', 'reflection', 'completion'].map((tab) => (
          <button
            key={tab}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 font-baloo font-semibold capitalize transition-all text-xs sm:text-sm ${
              currentTab === tab 
                ? 'text-sun-dark border-b-2 border-sun' 
                : 'text-[#7A8B99] hover:text-navy'
            }`}
            onClick={() => setCurrentTab(tab)}
          >
            {tab === 'basic' ? '📋' : 
             tab === 'meditation' ? '🧘' :
             tab === 'story' ? '📖' :
             tab === 'quiz' ? '❓' :
             tab === 'reflection' ? '💭' : '🎉'}
            <span className="hidden xs:inline ml-1">{tab === 'basic' ? 'Basic' : 
             tab === 'meditation' ? 'Meditation' :
             tab === 'story' ? 'Story' :
             tab === 'quiz' ? 'Quiz' :
             tab === 'reflection' ? 'Reflection' : 'Complete'}</span>
          </button>
        ))}
      </div>

      {currentTab === 'basic' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div>
              <label className="block font-baloo font-semibold text-navy text-sm sm:text-base mb-0.5 sm:mb-1">Grade</label>
              <select
                className="w-full p-2 sm:p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
              >
                <option>Kindergarten</option>
                <option>Grade 1</option>
                <option>Grade 2</option>
                <option>Grade 3</option>
                <option>Grade 4</option>
                <option>Grade 5</option>
                <option>Grade 6</option>
                <option>Grade 7</option>
                <option>Grade 8</option>
              </select>
            </div>
            <div>
              <label className="block font-baloo font-semibold text-navy text-sm sm:text-base mb-0.5 sm:mb-1">Week</label>
              <input
                type="number"
                min="1"
                max="12"
                className="w-full p-2 sm:p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
                value={formData.week}
                onChange={(e) => handleInputChange('week', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div>
            <label className="block font-baloo font-semibold text-navy text-sm sm:text-base mb-0.5 sm:mb-1">Day Title</label>
            <input
              type="text"
              className="w-full p-2 sm:p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
              placeholder="e.g., Welcome to Our Class Family"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block font-baloo font-semibold text-navy text-sm sm:text-base mb-0.5 sm:mb-1">Guide Character</label>
            <select
              className="w-full p-2 sm:p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
              value={formData.guideName}
              onChange={(e) => handleInputChange('guideName', e.target.value)}
            >
              <option>Sunny</option>
              <option>Owl</option>
              <option>Turtle</option>
              <option>Rabbit</option>
            </select>
          </div>
        </div>
      )}

      {currentTab === 'meditation' && (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block font-baloo font-semibold text-navy text-sm sm:text-base mb-0.5 sm:mb-1">Meditation Title</label>
            <input
              type="text"
              className="w-full p-2 sm:p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
              placeholder="e.g., Hello Breathing"
              value={formData.steps.meditation.title}
              onChange={(e) => handleInputChange('steps.meditation.title', e.target.value)}
            />
          </div>
          <div>
            <label className="block font-baloo font-semibold text-navy text-sm sm:text-base mb-0.5 sm:mb-1">Intro Text</label>
            <textarea
              className="w-full p-2 sm:p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none min-h-[80px] sm:min-h-[100px]"
              placeholder="Guide students through the breathing exercise..."
              value={formData.steps.meditation.intro}
              onChange={(e) => handleInputChange('steps.meditation.intro', e.target.value)}
            />
          </div>
          <div>
            <label className="block font-baloo font-semibold text-navy text-sm sm:text-base mb-0.5 sm:mb-1">Number of Breathing Cycles</label>
            <input
              type="number"
              min="3"
              max="10"
              className="w-full p-2 sm:p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
              value={formData.steps.meditation.cycles}
              onChange={(e) => handleInputChange('steps.meditation.cycles', e.target.value)}
            />
          </div>
        </div>
      )}

      {currentTab === 'story' && (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block font-baloo font-semibold text-navy text-sm sm:text-base mb-0.5 sm:mb-1">Story Title</label>
            <input
              type="text"
              className="w-full p-2 sm:p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
              placeholder="e.g., Sunny's First Day"
              value={formData.steps.story.title}
              onChange={(e) => handleInputChange('steps.story.title', e.target.value)}
            />
          </div>
          
          {formData.steps.story.slides.map((slide, index) => (
            <div key={index} className="bg-[#FFF8EA] p-3 sm:p-4 rounded-xl border-2 border-[#E3DCC8]">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <h4 className="font-baloo font-semibold text-navy text-sm sm:text-base">Slide {index + 1}</h4>
                {formData.steps.story.slides.length > 1 && (
                  <button
                    className="text-coral hover:text-red-600 font-bold text-base sm:text-lg"
                    onClick={() => removeStorySlide(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="space-y-2 sm:space-y-3">
                <input
                  type="text"
                  className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
                  placeholder="Slide title"
                  value={slide.title}
                  onChange={(e) => {
                    const newSlides = [...formData.steps.story.slides];
                    newSlides[index].title = e.target.value;
                    setFormData({
                      ...formData,
                      steps: {
                        ...formData.steps,
                        story: {
                          ...formData.steps.story,
                          slides: newSlides
                        }
                      }
                    });
                  }}
                />
                <textarea
                  className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none min-h-[60px] sm:min-h-[80px]"
                  placeholder="Story text..."
                  value={slide.text}
                  onChange={(e) => {
                    const newSlides = [...formData.steps.story.slides];
                    newSlides[index].text = e.target.value;
                    setFormData({
                      ...formData,
                      steps: {
                        ...formData.steps,
                        story: {
                          ...formData.steps.story,
                          slides: newSlides
                        }
                      }
                    });
                  }}
                />
                <div>
                  <label className="block font-baloo font-semibold text-navy text-xs sm:text-sm mb-0.5 sm:mb-1">Visual</label>
                  <select
                    className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
                    value={slide.visual}
                    onChange={(e) => {
                      const newSlides = [...formData.steps.story.slides];
                      newSlides[index].visual = e.target.value;
                      setFormData({
                        ...formData,
                        steps: {
                          ...formData.steps,
                          story: {
                            ...formData.steps.story,
                            slides: newSlides
                          }
                        }
                      });
                    }}
                  >
                    {visualOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
          
          <button
            className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
            onClick={addStorySlide}
          >
            ➕ Add Story Slide
          </button>
        </div>
      )}

      {currentTab === 'quiz' && (
        <div className="space-y-4 sm:space-y-6">
          {formData.steps.quiz.questions.map((question, index) => (
            <div key={index} className="bg-[#FFF8EA] p-3 sm:p-4 rounded-xl border-2 border-[#E3DCC8]">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <h4 className="font-baloo font-semibold text-navy text-sm sm:text-base">Question {index + 1}</h4>
                {formData.steps.quiz.questions.length > 1 && (
                  <button
                    className="text-coral hover:text-red-600 font-bold text-base sm:text-lg"
                    onClick={() => removeQuizQuestion(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="space-y-2 sm:space-y-3">
                <input
                  type="text"
                  className="w-full p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
                  placeholder="Question text"
                  value={question.question}
                  onChange={(e) => {
                    const newQuestions = [...formData.steps.quiz.questions];
                    newQuestions[index].question = e.target.value;
                    setFormData({
                      ...formData,
                      steps: {
                        ...formData.steps,
                        quiz: {
                          ...formData.steps.quiz,
                          questions: newQuestions
                        }
                      }
                    });
                  }}
                />
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
                    <select
                      className="p-1.5 sm:p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
                      value={option.emoji}
                      onChange={(e) => {
                        const newQuestions = [...formData.steps.quiz.questions];
                        newQuestions[index].options[optIndex].emoji = e.target.value;
                        setFormData({
                          ...formData,
                          steps: {
                            ...formData.steps,
                            quiz: {
                              ...formData.steps.quiz,
                              questions: newQuestions
                            }
                          }
                        });
                      }}
                    >
                      {emojiOptions.map(emoji => (
                        <option key={emoji} value={emoji}>{emoji}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="flex-1 min-w-[120px] p-1.5 sm:p-2 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
                      placeholder={`Option ${optIndex + 1}`}
                      value={option.text}
                      onChange={(e) => {
                        const newQuestions = [...formData.steps.quiz.questions];
                        newQuestions[index].options[optIndex].text = e.target.value;
                        setFormData({
                          ...formData,
                          steps: {
                            ...formData.steps,
                            quiz: {
                              ...formData.steps.quiz,
                              questions: newQuestions
                            }
                          }
                        });
                      }}
                    />
                    <label className="flex items-center gap-0.5 sm:gap-1 font-nunito text-xs sm:text-sm whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={option.correct}
                        onChange={(e) => {
                          const newQuestions = [...formData.steps.quiz.questions];
                          newQuestions[index].options.forEach((o, i) => {
                            o.correct = i === optIndex ? e.target.checked : false;
                          });
                          setFormData({
                            ...formData,
                            steps: {
                              ...formData.steps,
                              quiz: {
                                ...formData.steps.quiz,
                                questions: newQuestions
                              }
                            }
                          });
                        }}
                      />
                      Correct
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <button
            className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
            onClick={addQuizQuestion}
          >
            ➕ Add Question
          </button>
        </div>
      )}

      {currentTab === 'reflection' && (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block font-baloo font-semibold text-navy text-sm sm:text-base mb-0.5 sm:mb-1">Reflection Title</label>
            <input
              type="text"
              className="w-full p-2 sm:p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
              placeholder="e.g., The Welcome Wave"
              value={formData.steps.reflection.title}
              onChange={(e) => handleInputChange('steps.reflection.title', e.target.value)}
            />
          </div>
          <div>
            <label className="block font-baloo font-semibold text-navy text-sm sm:text-base mb-0.5 sm:mb-1">Reflection Prompt</label>
            <textarea
              className="w-full p-2 sm:p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none min-h-[100px] sm:min-h-[120px]"
              placeholder="Guide students through the reflection activity..."
              value={formData.steps.reflection.text}
              onChange={(e) => handleInputChange('steps.reflection.text', e.target.value)}
            />
          </div>
        </div>
      )}

      {currentTab === 'completion' && (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block font-baloo font-semibold text-navy text-sm sm:text-base mb-0.5 sm:mb-1">Completion Message</label>
            <input
              type="text"
              className="w-full p-2 sm:p-3 border-2 border-[#E3DCC8] rounded-xl font-nunito text-sm sm:text-base focus:border-sun focus:outline-none"
              placeholder="e.g., Nice work finishing this day with Sunny!"
              value={formData.steps.completion.message}
              onChange={(e) => handleInputChange('steps.completion.message', e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t border-[#E3DCC8]">
        <button className="btn-primary text-sm sm:text-lg py-2 px-4 sm:py-3.5 sm:px-8" onClick={handleSave}>
          💾 Save Lesson
        </button>
        <button className="btn-secondary text-sm sm:text-lg py-2 px-4 sm:py-3.5 sm:px-8" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ContentManager;