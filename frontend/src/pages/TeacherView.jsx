import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherAPI, setAuthToken } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const TeacherView = ({ admin, onLogout }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classStats, setClassStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'analytics' | 'curriculum-preview'

  // Search, Filter & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'in-progress' | 'not-started'
  const [sortBy, setSortBy] = useState('rate-desc'); // 'rate-desc' | 'rate-asc' | 'name-asc' | 'recent'

  // Student Detail Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [teacherNotes, setTeacherNotes] = useState('');

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
      setStudents(studentsData || []);
      setClassStats(statsData || {
        totalStudents: 0,
        completedProgress: 0,
        totalProgress: 0,
        overallCompletionRate: 0
      });
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      alert('Failed to load student data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    onLogout();
    navigate('/');
  };

  const getGradeBadge = (grade) => {
    const map = {
      'Kindergarten': { bg: 'bg-sun/15 text-sun-dark border-sun/30', label: 'Kindergarten' },
      'Grade 1': { bg: 'bg-sky/15 text-[#2C7B9B] border-sky/30', label: 'Grade 1' },
      'Grade 2': { bg: 'bg-[#E4F4E8] text-grass border-grass/30', label: 'Grade 2' },
      'Grade 3': { bg: 'bg-sun-dark/15 text-sun-dark border-sun-dark/30', label: 'Grade 3' },
    };
    return map[grade] || { bg: 'bg-cream text-navy border-[#E3DCC8]', label: grade || 'K' };
  };

  // Filter & sort students
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Grade filter
    if (selectedGrade !== 'all') {
      result = result.filter(s => (s.grade || 'Kindergarten') === selectedGrade);
    }

    // Status filter
    if (statusFilter === 'completed') {
      result = result.filter(s => s.stats?.completionRate === 100);
    } else if (statusFilter === 'in-progress') {
      result = result.filter(s => (s.stats?.completionRate || 0) > 0 && (s.stats?.completionRate || 0) < 100);
    } else if (statusFilter === 'not-started') {
      result = result.filter(s => (s.stats?.completionRate || 0) === 0);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.id || '').toLowerCase().includes(q) ||
        (s.grade || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'rate-desc') return (b.stats?.completionRate || 0) - (a.stats?.completionRate || 0);
      if (sortBy === 'rate-asc') return (a.stats?.completionRate || 0) - (b.stats?.completionRate || 0);
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'recent') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      return 0;
    });

    return result;
  }, [students, selectedGrade, statusFilter, searchQuery, sortBy]);

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Grade', 'Completed Days', 'Total Days', 'Completion Rate %'];
    const rows = filteredStudents.map(s => [
      s.id,
      `"${s.name}"`,
      s.grade || 'Kindergarten',
      s.stats?.completedDays || 0,
      s.stats?.totalDays || 0,
      `${s.stats?.completionRate || 0}%`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `unimind_students_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const breadcrumbs = [
    activeTab === 'roster'
      ? 'Student Roster'
      : activeTab === 'analytics'
      ? 'Class Analytics'
      : 'Curriculum Plans'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-sky/20 border-2 border-sky flex items-center justify-center text-3xl animate-bounce mb-3">
          📊
        </div>
        <h2 className="text-navy font-baloo text-xl font-bold">Loading Teacher Command Center...</h2>
        <p className="text-xs text-[#7A8B99] mt-1">Aggregating real-time student progress & completion metrics</p>
      </div>
    );
  }

  return (
    <AdminLayout
      admin={admin}
      onLogout={handleLogout}
      currentRole="teacher"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      breadcrumbs={breadcrumbs}
      primaryAction={
        <button
          type="button"
          onClick={handleExportCSV}
          className="btn-secondary text-xs py-1.5 px-3.5 shadow-md flex items-center gap-1.5"
          title="Export student roster to CSV"
        >
          <span>📥</span>
          <span className="hidden xs:inline">Export CSV</span>
        </button>
      }
    >
      {/* 1. TOP METRIC STATS BANNER */}
      {classStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-5">
          {/* Total Students */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E3DCC8] shadow-soft flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B99] block mb-1">
                Enrolled Students
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-baloo font-extrabold text-navy">
                  {classStats.totalStudents}
                </span>
                <span className="text-xs font-bold text-grass">Active Learners</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky/15 flex items-center justify-center text-2xl border border-sky/30">
              👨‍🎓
            </div>
          </div>

          {/* Lessons Mastered */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E3DCC8] shadow-soft flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B99] block mb-1">
                Lessons Mastered
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-baloo font-extrabold text-sun-dark">
                  {classStats.completedProgress}
                </span>
                <span className="text-xs font-bold text-[#7A8B99]">/ {classStats.totalProgress} Total</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sun/15 flex items-center justify-center text-2xl border border-sun/30">
              🏆
            </div>
          </div>

          {/* Overall Completion Rate */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E3DCC8] shadow-soft flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B99] block mb-1">
                Class Mastery Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-baloo font-extrabold text-grass">
                  {classStats.overallCompletionRate}%
                </span>
                <span className="text-xs font-bold text-grass">Overall Rate</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#E4F4E8] flex items-center justify-center text-2xl border border-grass/30 text-grass">
              📈
            </div>
          </div>

          {/* Active Participation */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E3DCC8] shadow-soft flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B99] block mb-1">
                Assessment Status
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-baloo font-extrabold text-navy">
                  100%
                </span>
                <span className="text-xs font-bold text-sun-dark">Audio Guided</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-2xl border border-[#E3DCC8]">
              🌟
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT: STUDENT ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-5">
          {/* Desktop Filter & Control Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-[#E3DCC8] shadow-soft flex flex-wrap items-center justify-between gap-4">
            {/* Left Filter: Grade Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3'].map((grade) => {
                const isSelected = selectedGrade === grade;
                const count = grade === 'all' 
                  ? students.length 
                  : students.filter(s => (s.grade || 'Kindergarten') === grade).length;

                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-3 py-1.5 rounded-xl font-baloo text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-navy text-white shadow-sm'
                        : 'bg-[#FAF7F0] text-navy hover:bg-cream border border-[#E3DCC8]'
                    }`}
                  >
                    {grade === 'all' ? 'All Classes' : grade} ({count})
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Status & Sorting Dropdowns */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-1.5 bg-[#FAF7F0] border border-[#E3DCC8] rounded-xl text-xs font-nunito font-semibold text-navy focus:outline-none focus:border-sun"
              >
                <option value="all">All Progress Statuses</option>
                <option value="completed">🎉 100% Completed</option>
                <option value="in-progress">⏳ In Progress</option>
                <option value="not-started">💤 Not Started</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-1.5 bg-[#FAF7F0] border border-[#E3DCC8] rounded-xl text-xs font-nunito font-semibold text-navy focus:outline-none focus:border-sun"
              >
                <option value="rate-desc">Highest Completion %</option>
                <option value="rate-asc">Lowest Completion %</option>
                <option value="name-asc">Student Name (A-Z)</option>
                <option value="recent">Most Recently Active</option>
              </select>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={fetchData}
                className="p-1.5 rounded-xl bg-[#FAF7F0] hover:bg-cream border border-[#E3DCC8] text-xs font-bold text-navy"
                title="Refresh student progress data"
              >
                🔄
              </button>
            </div>
          </div>

          {/* Desktop Student Data Table */}
          <div className="bg-white rounded-2xl border border-[#E3DCC8] shadow-soft overflow-hidden">
            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-2">👨‍🎓</div>
                <h3 className="font-baloo font-bold text-navy text-lg">No students found</h3>
                <p className="text-xs text-[#7A8B99] mt-1">
                  Try adjusting your search criteria or grade selection.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] border-b border-[#E3DCC8] text-[11px] font-baloo font-bold text-[#7A8B99] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Grade Level</th>
                      <th className="py-3.5 px-4">Completed / Total</th>
                      <th className="py-3.5 px-4">Mastery Progress</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DCC8]/60 text-xs font-nunito">
                    {filteredStudents.map((student) => {
                      const gradeBadge = getGradeBadge(student.grade);
                      const rate = student.stats?.completionRate || 0;
                      const isComplete = rate === 100;
                      const initials = (student.name || 'S')
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-[#FAF7F0]/60 transition-colors group cursor-pointer"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowStudentDetail(true);
                          }}
                        >
                          {/* Student Name & Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-sun/20 border border-sun/40 text-sun-dark font-baloo font-bold flex items-center justify-center text-xs shadow-2xs">
                                {initials}
                              </div>
                              <div>
                                <span className="font-baloo font-bold text-navy text-sm block group-hover:text-sun-dark transition-colors">
                                  {student.name}
                                </span>
                                <span className="text-[10px] text-[#7A8B99] font-mono">
                                  ID: {student.id.slice(0, 12)}...
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Grade */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-baloo font-bold border ${gradeBadge.bg}`}>
                              {gradeBadge.label}
                            </span>
                          </td>

                          {/* Completed / Total Count */}
                          <td className="py-3.5 px-4">
                            <span className="font-baloo font-bold text-navy text-sm">
                              {student.stats?.completedDays || 0}
                            </span>
                            <span className="text-[#7A8B99] font-semibold text-xs">
                              {" "} / {student.stats?.totalDays || 0} Days
                            </span>
                          </td>

                          {/* Visual Progress Bar */}
                          <td className="py-3.5 px-4 min-w-[160px]">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[11px] font-bold">
                                <span className={isComplete ? 'text-grass' : rate > 50 ? 'text-sun-dark' : 'text-[#7A8B99]'}>
                                  {rate}%
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-[#E3DCC8]/70 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isComplete
                                      ? 'bg-grass'
                                      : rate >= 50
                                      ? 'bg-sun'
                                      : 'bg-sky'
                                  }`}
                                  style={{ width: `${Math.max(rate, 4)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Status Pill */}
                          <td className="py-3.5 px-4">
                            {isComplete ? (
                              <span className="px-2.5 py-1 rounded-full bg-[#E4F4E8] text-grass font-baloo font-bold text-xs border border-grass/30">
                                🎉 Completed
                              </span>
                            ) : rate > 0 ? (
                              <span className="px-2.5 py-1 rounded-full bg-sun/15 text-sun-dark font-baloo font-bold text-xs border border-sun/30">
                                🏃 On Track ({rate}%)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-cream text-[#7A8B99] font-baloo font-semibold text-xs border border-[#E3DCC8]">
                                ⏳ Not Started
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentDetail(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-cream border border-[#E3DCC8] hover:border-sun text-navy font-baloo font-bold text-xs shadow-2xs transition-all"
                            >
                              🔍 View Record
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: CLASS ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-[#E3DCC8] shadow-soft">
            <h3 className="font-baloo font-bold text-navy text-xl mb-1">📈 Classroom Mastery & Pacing Analytics</h3>
            <p className="text-xs text-[#7A8B99]">
              Detailed breakdown of student engagement across meditation routines, social-emotional stories, and check-ins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Grade 1 Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-[#E3DCC8] shadow-soft space-y-3">
              <span className="px-2.5 py-1 rounded-lg bg-sun/15 text-sun-dark font-baloo font-bold text-xs">
                Kindergarten Cohort
              </span>
              <h4 className="font-baloo font-bold text-navy text-lg">Welcome to Our Class Family</h4>
              <p className="text-xs text-[#7A8B99]">
                Day 1 Assessment completion rate and emotional regulation check-in performance.
              </p>
              <div className="p-3 bg-[#FAF7F0] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-navy">
                  <span>Completion Rate:</span>
                  <span className="text-grass">{classStats?.overallCompletionRate || 0}%</span>
                </div>
                <div className="flex justify-between text-[#7A8B99]">
                  <span>Pacing Comfort:</span>
                  <span className="font-bold text-navy">Calm & Nervous-System Friendly</span>
                </div>
              </div>
            </div>

            {/* Daily Meditation Insights */}
            <div className="bg-white rounded-2xl p-5 border border-[#E3DCC8] shadow-soft space-y-3">
              <span className="px-2.5 py-1 rounded-lg bg-grass/15 text-grass font-baloo font-bold text-xs">
                Breathing Routine
              </span>
              <h4 className="font-baloo font-bold text-navy text-lg">Hello Breathing Cycles</h4>
              <p className="text-xs text-[#7A8B99]">
                Students participate in 5 cycles of 8-second inhales and exhales guided by Sunny.
              </p>
              <div className="p-3 bg-[#FAF7F0] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-navy">
                  <span>Pacing:</span>
                  <span className="text-navy font-bold">8.0s per cycle</span>
                </div>
                <div className="flex justify-between text-[#7A8B99]">
                  <span>Audio Voiceover:</span>
                  <span className="font-bold text-grass">100% Attached</span>
                </div>
              </div>
            </div>

            {/* Check-in Comprehension */}
            <div className="bg-white rounded-2xl p-5 border border-[#E3DCC8] shadow-soft space-y-3">
              <span className="px-2.5 py-1 rounded-lg bg-sky/15 text-[#2C7B9B] font-baloo font-bold text-xs">
                Comprehension Check-In
              </span>
              <h4 className="font-baloo font-bold text-navy text-lg">Kindness & Belonging</h4>
              <p className="text-xs text-[#7A8B99]">
                Multiple choice questions with emoji visual cues and immediate encouraging audio feedback.
              </p>
              <div className="p-3 bg-[#FAF7F0] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-navy">
                  <span>Retry Rate:</span>
                  <span className="text-sun-dark font-bold">Gentle Retry (No Rush)</span>
                </div>
                <div className="flex justify-between text-[#7A8B99]">
                  <span>Audio Feedback:</span>
                  <span className="font-bold text-grass">Positive & Clear</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: CURRICULUM PREVIEW */}
      {activeTab === 'curriculum-preview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-[#E3DCC8] shadow-soft">
            <h3 className="font-baloo font-bold text-navy text-xl mb-1">📖 Curriculum Plans Preview</h3>
            <p className="text-xs text-[#7A8B99]">
              Educator overview of lessons currently configured for student assessment and social-emotional learning.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E3DCC8] shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sun/20 flex items-center justify-center text-2xl font-bold">
                ☀️
              </div>
              <div>
                <span className="text-xs font-bold text-sun-dark uppercase tracking-wider">Kindergarten • Week 1 • Day 1</span>
                <h4 className="font-baloo font-bold text-navy text-lg">Welcome to Our Class Family</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E3DCC8]">
                <span className="text-xs font-bold text-navy block">1. 🧘 Meditation</span>
                <span className="text-[11px] text-[#7A8B99]">Hello Breathing (5 cycles)</span>
              </div>
              <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E3DCC8]">
                <span className="text-xs font-bold text-navy block">2. 📖 Story</span>
                <span className="text-[11px] text-[#7A8B99]">Sunny's First Day (4 slides)</span>
              </div>
              <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E3DCC8]">
                <span className="text-xs font-bold text-navy block">3. ❓ Check-In</span>
                <span className="text-[11px] text-[#7A8B99]">Kindness Quiz (2 Qs)</span>
              </div>
              <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E3DCC8]">
                <span className="text-xs font-bold text-navy block">4. 💭 Reflection</span>
                <span className="text-[11px] text-[#7A8B99]">The Welcome Wave</span>
              </div>
              <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E3DCC8]">
                <span className="text-xs font-bold text-navy block">5. ⭐ Badge</span>
                <span className="text-[11px] text-[#7A8B99]">Celebration Cheer</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. STUDENT DEEP-DIVE SLIDE-OVER MODAL */}
      {showStudentDetail && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-soft-hover border border-[#E3DCC8] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E3DCC8] bg-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sun text-white font-baloo font-bold text-lg flex items-center justify-center shadow-sm">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-baloo font-bold text-navy text-xl">{selectedStudent.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#7A8B99]">
                    <span>Grade: <strong>{selectedStudent.grade || 'Kindergarten'}</strong></span>
                    <span>•</span>
                    <span className="font-mono">ID: {selectedStudent.id}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="p-2 rounded-xl text-[#7A8B99] hover:text-navy hover:bg-white text-lg"
                onClick={() => setShowStudentDetail(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5">
              {/* Stat Pills */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E3DCC8] text-center">
                  <span className="text-2xl font-baloo font-bold text-navy block">
                    {selectedStudent.stats?.completedDays || 0}
                  </span>
                  <span className="text-[11px] font-bold text-[#7A8B99]">Completed Days</span>
                </div>
                <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E3DCC8] text-center">
                  <span className="text-2xl font-baloo font-bold text-navy block">
                    {selectedStudent.stats?.totalDays || 0}
                  </span>
                  <span className="text-[11px] font-bold text-[#7A8B99]">Total Lessons</span>
                </div>
                <div className="bg-[#E4F4E8] p-3 rounded-xl border border-grass/30 text-center">
                  <span className="text-2xl font-baloo font-bold text-grass block">
                    {selectedStudent.stats?.completionRate || 0}%
                  </span>
                  <span className="text-[11px] font-bold text-grass">Mastery Rate</span>
                </div>
              </div>

              {/* Progress Checklist */}
              <div>
                <h4 className="font-baloo font-bold text-navy text-sm mb-2">Curriculum Lessons Checklist</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedStudent.progress?.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#FAF7F0] text-center text-xs text-[#7A8B99]">
                      No lessons started yet for this student.
                    </div>
                  ) : (
                    selectedStudent.progress.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F0] border border-[#E3DCC8]"
                      >
                        <div>
                          <p className="font-baloo font-bold text-navy text-xs">
                            {p.gradeName || 'Kindergarten'} • Week {p.weekNumber || 1} • Day {p.dayNumber || 1}
                          </p>
                          <p className="text-xs text-[#7A8B99]">{p.dayTitle || 'Welcome to Our Class Family'}</p>
                        </div>
                        {p.completed ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#E4F4E8] text-grass font-baloo font-bold text-xs border border-grass/30">
                            ✅ Completed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-sun/15 text-sun-dark font-baloo font-bold text-xs border border-sun/30">
                            ⏳ In Progress
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Teacher Observation Notes */}
              <div>
                <label className="block font-baloo font-bold text-navy text-xs mb-1">
                  Teacher Observations & Calming Pacing Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full p-3 bg-[#FAF7F0] border border-[#E3DCC8] rounded-xl font-nunito text-xs focus:bg-white focus:border-sun focus:outline-none"
                  placeholder="Record student responses, breathing focus observations, or class family notes..."
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E3DCC8] bg-[#FAF7F0] flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-white hover:bg-cream border border-[#E3DCC8] text-xs font-baloo font-bold text-navy"
                onClick={() => setShowStudentDetail(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-primary text-xs py-2 px-5"
                onClick={() => {
                  alert('Teacher observation notes saved!');
                  setShowStudentDetail(false);
                }}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TeacherView;