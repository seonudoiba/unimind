import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherAPI, setAuthToken } from '../services/api';

const TeacherView = ({ admin, onLogout }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classStats, setClassStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, statsData] = await Promise.all([
        teacherAPI.getStudents(),
        teacherAPI.getClassStats()
      ]);
      setStudents(studentsData);
      setClassStats(statsData);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      alert('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    onLogout();
    navigate('/');
  };

  const getGradeColor = (grade) => {
    const colors = {
      'Kindergarten': 'bg-sun',
      'Grade 1': 'bg-sky',
      'Grade 2': 'bg-grass',
      'Grade 3': 'bg-sun-dark',
    };
    return colors[grade] || 'bg-navy';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-navy font-baloo text-xl">📊 Loading student data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CDEBF7] via-cream to-cream p-3 sm:p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-soft p-3 sm:p-4 mb-4 sm:mb-6 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-baloo font-bold text-navy text-lg sm:text-xl">📚 UniMindKidz</span>
          <span className="text-xs sm:text-sm text-[#7A8B99] hidden xs:inline">| Teacher Dashboard</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <a href="/" className="text-xs sm:text-sm text-sky hover:text-sun-dark transition-colors">
            ← View Student Site
          </a>
          <a href="/admin" className="text-xs sm:text-sm text-sky hover:text-sun-dark transition-colors">
            ⚙️ Admin
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

      {/* Stats Overview */}
      {classStats && (
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl shadow-soft p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-baloo text-navy">{classStats.totalStudents}</p>
            <p className="text-xs sm:text-sm text-[#7A8B99]">Total Students</p>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-baloo text-navy">{classStats.completedProgress}</p>
            <p className="text-xs sm:text-sm text-[#7A8B99]">Lessons Completed</p>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-baloo text-navy">{classStats.totalProgress}</p>
            <p className="text-xs sm:text-sm text-[#7A8B99]">Total Lessons</p>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-baloo text-grass">{classStats.overallCompletionRate}%</p>
            <p className="text-xs sm:text-sm text-[#7A8B99]">Completion Rate</p>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6">
          <h2 className="font-baloo text-xl sm:text-2xl text-navy mb-4">👨‍🎓 Student Progress</h2>
          
          {students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#7A8B99]">No students have started lessons yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#E3DCC8]">
                    <th className="text-left py-2 px-3 text-sm font-baloo text-navy">Student</th>
                    <th className="text-left py-2 px-3 text-sm font-baloo text-navy hidden sm:table-cell">Grade</th>
                    <th className="text-left py-2 px-3 text-sm font-baloo text-navy">Completed</th>
                    <th className="text-left py-2 px-3 text-sm font-baloo text-navy hidden sm:table-cell">Total</th>
                    <th className="text-left py-2 px-3 text-sm font-baloo text-navy">Rate</th>
                    <th className="text-left py-2 px-3 text-sm font-baloo text-navy">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-[#E3DCC8] hover:bg-cream transition-colors">
                      <td className="py-2 px-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👤</span>
                          <span className="font-nunito font-semibold text-navy">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-sm hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded-full text-white text-xs font-baloo ${getGradeColor(student.grade)}`}>
                          {student.grade || 'K'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm font-nunito font-semibold text-grass">
                        {student.stats.completedDays}
                      </td>
                      <td className="py-2 px-3 text-sm font-nunito hidden sm:table-cell">
                        {student.stats.totalDays}
                      </td>
                      <td className="py-2 px-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-16 sm:w-20 h-2 bg-[#E3DCC8] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-grass rounded-full transition-all"
                              style={{ width: `${student.stats.completionRate}%` }}
                            />
                          </div>
                          <span className="font-nunito font-bold text-navy text-xs sm:text-sm">
                            {student.stats.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-sm">
                        <button
                          className="text-sky hover:text-sun-dark text-xs sm:text-sm underline"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowStudentDetail(true);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Student Detail Modal */}
      {showStudentDetail && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft-hover p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-baloo text-xl sm:text-2xl text-navy">{selectedStudent.name}</h3>
                <p className="text-sm text-[#7A8B99]">Grade: {selectedStudent.grade || 'Kindergarten'}</p>
              </div>
              <button
                className="text-coral hover:text-red-600 text-xl"
                onClick={() => setShowStudentDetail(false)}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-cream rounded-xl p-3 text-center">
                <p className="text-2xl font-baloo text-navy">{selectedStudent.stats.completedDays}</p>
                <p className="text-xs text-[#7A8B99]">Completed</p>
              </div>
              <div className="bg-cream rounded-xl p-3 text-center">
                <p className="text-2xl font-baloo text-navy">{selectedStudent.stats.totalDays}</p>
                <p className="text-xs text-[#7A8B99]">Total Lessons</p>
              </div>
              <div className="bg-cream rounded-xl p-3 text-center">
                <p className="text-2xl font-baloo text-grass">{selectedStudent.stats.completionRate}%</p>
                <p className="text-xs text-[#7A8B99]">Completion Rate</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-baloo font-semibold text-navy text-sm">Lesson Progress</h4>
              <div className="max-h-[300px] overflow-y-auto">
                {selectedStudent.progress.length === 0 ? (
                  <p className="text-[#7A8B99] text-sm">No lessons started yet.</p>
                ) : (
                  selectedStudent.progress.map((p, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-[#E3DCC8]">
                      <div>
                        <p className="text-sm font-nunito text-navy">
                          {p.grade || 'K'} - Week {p.weekNumber} - Day {p.dayNumber}
                        </p>
                        <p className="text-xs text-[#7A8B99]">{p.dayTitle}</p>
                      </div>
                      {p.completed ? (
                        <span className="text-grass text-sm font-baloo">✅ Completed</span>
                      ) : (
                        <span className="text-[#7A8B99] text-sm font-baloo">⏳ In Progress</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherView;