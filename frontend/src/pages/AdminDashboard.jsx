import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contentAPI, setAuthToken } from "../services/api";
import ContentEditor from "../components/ContentEditor";

const AdminDashboard = ({ admin, onLogout }) => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const data = await contentAPI.getGrades();
      setGrades(data);
    } catch (error) {
      console.error("Error fetching content:", error);
      alert("Failed to load content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    onLogout();
    navigate("/"); // Redirect to home page
  };

  const handleSaveContent = async (data) => {
    try {
      if (selectedDay) {
        await contentAPI.updateDay(selectedDay.id, data);
      } else {
        await contentAPI.createDay(data);
      }
      await fetchContent();
      setShowEditor(false);
      setSelectedDay(null);
      setSelectedWeek(null);
      setSelectedGrade(null);
      alert("✅ Lesson saved successfully!");
    } catch (error) {
      alert("Failed to save: " + error.message);
    }
  };

  const handleDeleteDay = async (dayId, dayTitle) => {
    if (
      !confirm(
        `Are you sure you want to delete "${dayTitle}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await contentAPI.deleteDay(dayId);
      await fetchContent();
      alert("✅ Lesson deleted successfully!");
    } catch (error) {
      alert("Failed to delete: " + error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-navy font-baloo text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CDEBF7] via-cream to-cream p-3 sm:p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-soft p-3 sm:p-4 mb-4 sm:mb-6 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-baloo font-bold text-navy text-lg sm:text-xl">
            📚 UniMindKidz
          </span>
          <span className="text-xs sm:text-sm text-[#7A8B99] hidden xs:inline">
            | Admin Dashboard
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <a
            href="/"
            className="text-xs sm:text-sm text-sky hover:text-sun-dark transition-colors"
          >
            ← View Student Page
          </a>
          <a
            href="/teacher"
            className="text-xs sm:text-sm text-sky hover:text-sun-dark transition-colors"
          >
            ← View Teacher Page
          </a>
          <span className="text-xs sm:text-sm text-navy">👋 {admin?.name}</span>
          <button
            className="btn-secondary text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content Management */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
            <h2 className="font-baloo text-xl sm:text-2xl text-navy">
              📖 Content Management
            </h2>
            <button
              className="btn-primary text-sm py-2 px-4"
              onClick={() => {
                setSelectedGrade(null);
                setSelectedWeek(null);
                setSelectedDay(null);
                setShowEditor(true);
              }}
            >
              + New Lesson
            </button>
          </div>

          {grades.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#7A8B99]">
                No content yet. Create your first lesson day!
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {grades.map((grade) => (
                <div
                  key={grade.id}
                  className="border-2 border-[#E3DCC8] rounded-xl p-3 sm:p-4"
                >
                  <div className="flex flex-wrap justify-between items-center mb-3">
                    <h3 className="font-baloo text-lg sm:text-xl text-navy">
                      {grade.name}
                    </h3>
                    <button
                      className="text-xs sm:text-sm text-coral hover:text-red-600"
                      onClick={() => {
                        if (
                          confirm(
                            `Delete ${grade.name} and all its content? This cannot be undone.`,
                          )
                        ) {
                          // Delete grade
                        }
                      }}
                    >
                      Delete Grade
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {grade.weeks.map((week) => (
                      <div
                        key={week.id}
                        className="bg-cream rounded-xl p-3 sm:p-4"
                      >
                        <h4 className="font-baloo text-navy font-semibold text-sm sm:text-base">
                          Week {week.weekNumber}: {week.title}
                        </h4>
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mt-2 sm:mt-3">
                          {week.days.map((day) => (
                            <div
                              key={day.id}
                              className="bg-white rounded-xl p-2 sm:p-3 border-2 border-[#E3DCC8] hover:border-sun transition-colors group relative"
                            >
                              <div
                                className="cursor-pointer"
                                onClick={() => {
                                  setSelectedGrade(grade);
                                  setSelectedWeek(week);
                                  setSelectedDay(day);
                                  setShowEditor(true);
                                }}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-baloo font-semibold text-navy text-xs sm:text-sm">
                                      Day {day.dayNumber}
                                    </p>
                                    <p className="text-xs sm:text-sm text-[#4A5D6D] truncate">
                                      {day.title}
                                    </p>
                                  </div>
                                  <span className="text-[10px] sm:text-xs text-[#7A8B99] whitespace-nowrap">
                                    {day.steps.length} steps
                                  </span>
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {day.steps.map((step) => (
                                    <span
                                      key={step.id}
                                      className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-[#E3DCC8] rounded-full"
                                    >
                                      {step.type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {/* Delete button - appears on hover */}
                              <button
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-coral text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDay(day.id, day.title);
                                }}
                                disabled={deleting}
                                title="Delete this lesson"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ContentEditor
              grade={selectedGrade}
              week={selectedWeek}
              day={selectedDay}
              grades={grades}
              onSave={handleSaveContent}
              onCancel={() => {
                setShowEditor(false);
                setSelectedDay(null);
                setSelectedWeek(null);
                setSelectedGrade(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
