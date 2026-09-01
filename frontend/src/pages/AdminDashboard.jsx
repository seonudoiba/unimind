import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { contentAPI, setAuthToken, uploadAPI } from "../services/api";
import { AudioService } from "../services/AudioService";
import AdminLayout from "../components/AdminLayout";
import ContentEditor from "../components/ContentEditor";
import AudioSlotManager, { formatDuration } from "../components/AudioSlotManager";

const AdminDashboard = ({ admin, onLogout }) => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNavTab, setActiveNavTab] = useState("curriculum"); // 'curriculum' | 'audio-studio' | 'guides-matrix'
  const [selectedGradeId, setSelectedGradeId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [audioFilter, setAudioFilter] = useState("all"); // 'all' | 'has-audio' | 'missing-audio'
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'

  // Editor Modal state
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deletingDayId, setDeletingDayId] = useState(null);

  // Audio preview playing state in Studio table
  const [playingUrl, setPlayingUrl] = useState(null);

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    const unsubscribe = AudioService.subscribe((state) => {
      if (!state.isPlaying) {
        setPlayingUrl(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await contentAPI.getGrades();
      setGrades(data);
    } catch (error) {
      console.error("Error fetching content:", error);
      alert("Failed to load content. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    onLogout();
    navigate("/");
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
      !confirm(`Are you sure you want to delete "${dayTitle}"? This cannot be undone.`)
    ) {
      return;
    }

    setDeletingDayId(dayId);
    try {
      await contentAPI.deleteDay(dayId);
      await fetchContent();
      alert("✅ Lesson deleted successfully!");
    } catch (error) {
      alert("Failed to delete: " + error.message);
    } finally {
      setDeletingDayId(null);
    }
  };

  // Flatten all days for metrics and search
  const allDays = useMemo(() => {
    const list = [];
    grades.forEach((grade) => {
      (grade.weeks || []).forEach((week) => {
        (week.days || []).forEach((day) => {
          // Calculate audio status for this day
          let totalSlots = 0;
          let filledSlots = 0;
          let totalAudioSeconds = 0;

          (day.steps || []).forEach((step) => {
            if (step.type === "meditation") {
              totalSlots++;
              if (step.content?.introAudioUrl || step.audioUrl) {
                filledSlots++;
                totalAudioSeconds += (step.content?.introAudioDuration || step.audioDuration || 0);
              }
            } else if (step.type === "story") {
              const slides = step.content?.slides || [];
              slides.forEach((sl) => {
                totalSlots++;
                if (sl.audioUrl) {
                  filledSlots++;
                  totalAudioSeconds += (sl.audioDuration || 0);
                }
              });
            } else if (step.type === "quiz") {
              const qs = step.content?.questions || [];
              qs.forEach((q) => {
                totalSlots++;
                if (q.audioUrl) {
                  filledSlots++;
                  totalAudioSeconds += (q.audioDuration || 0);
                }
              });
            } else if (step.type === "reflection") {
              totalSlots++;
              if (step.content?.audioUrl || step.audioUrl) {
                filledSlots++;
                totalAudioSeconds += (step.content?.audioDuration || step.audioDuration || 0);
              }
            } else if (step.type === "completion") {
              totalSlots++;
              if (step.content?.audioUrl || step.audioUrl) {
                filledSlots++;
                totalAudioSeconds += (step.content?.audioDuration || step.audioDuration || 0);
              }
            }
          });

          list.push({
            ...day,
            grade,
            week,
            totalSlots,
            filledSlots,
            totalAudioSeconds,
            isFullyVoiced: totalSlots > 0 && filledSlots === totalSlots,
          });
        });
      });
    });
    return list;
  }, [grades]);

  // Global KPIs
  const totalLessonsCount = allDays.length;
  const totalSlotsCount = allDays.reduce((acc, d) => acc + d.totalSlots, 0);
  const filledSlotsCount = allDays.reduce((acc, d) => acc + d.filledSlots, 0);
  const audioCoveragePercent = totalSlotsCount > 0 ? Math.round((filledSlotsCount / totalSlotsCount) * 100) : 100;
  const totalVoiceMinutes = Math.round(allDays.reduce((acc, d) => acc + d.totalAudioSeconds, 0) / 60);

  // Filtered lessons
  const filteredDays = useMemo(() => {
    return allDays.filter((item) => {
      // Grade filter
      if (selectedGradeId !== "all" && item.grade.id !== selectedGradeId) {
        return false;
      }
      // Audio filter
      if (audioFilter === "has-audio" && item.filledSlots === 0) return false;
      if (audioFilter === "missing-audio" && item.isFullyVoiced) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.title || "").toLowerCase().includes(q);
        const matchGrade = (item.grade?.name || "").toLowerCase().includes(q);
        const matchWeek = (item.week?.title || "").toLowerCase().includes(q);
        const matchGuide = (item.guideName || "").toLowerCase().includes(q);
        if (!matchTitle && !matchGrade && !matchWeek && !matchGuide) return false;
      }

      return true;
    });
  }, [allDays, selectedGradeId, audioFilter, searchQuery]);

  // Audio Studio clips list
  const allAudioClips = useMemo(() => {
    const clips = [];
    allDays.forEach((day) => {
      (day.steps || []).forEach((step, stepIdx) => {
        if (step.type === "meditation") {
          clips.push({
            id: `${day.id}-step-${step.id || stepIdx}-meditation`,
            day,
            stepType: "Meditation Intro",
            stepTitle: step.title,
            textSnippet: step.content?.intro || "",
            audioUrl: step.content?.introAudioUrl || step.audioUrl,
            audioDuration: step.content?.introAudioDuration || step.audioDuration || 0,
          });
        } else if (step.type === "story") {
          (step.content?.slides || []).forEach((slide, sIdx) => {
            clips.push({
              id: `${day.id}-step-${step.id || stepIdx}-slide-${sIdx}`,
              day,
              stepType: `Story Slide ${sIdx + 1}`,
              stepTitle: slide.title || `Slide ${sIdx + 1}`,
              textSnippet: slide.text || "",
              audioUrl: slide.audioUrl,
              audioDuration: slide.audioDuration || 0,
            });
          });
        } else if (step.type === "quiz") {
          (step.content?.questions || []).forEach((q, qIdx) => {
            clips.push({
              id: `${day.id}-step-${step.id || stepIdx}-q-${qIdx}`,
              day,
              stepType: `Quiz Question ${qIdx + 1}`,
              stepTitle: q.question,
              textSnippet: q.question || "",
              audioUrl: q.audioUrl,
              audioDuration: q.audioDuration || 0,
            });
          });
        } else if (step.type === "reflection") {
          clips.push({
            id: `${day.id}-step-${step.id || stepIdx}-reflection`,
            day,
            stepType: "Reflection Prompt",
            stepTitle: step.title,
            textSnippet: step.content?.text || "",
            audioUrl: step.content?.audioUrl || step.audioUrl,
            audioDuration: step.content?.audioDuration || step.audioDuration || 0,
          });
        } else if (step.type === "completion") {
          clips.push({
            id: `${day.id}-step-${step.id || stepIdx}-completion`,
            day,
            stepType: "Celebration Badge",
            stepTitle: step.title,
            textSnippet: step.content?.message || "",
            audioUrl: step.content?.audioUrl || step.audioUrl,
            audioDuration: step.content?.audioDuration || step.audioDuration || 0,
          });
        }
      });
    });
    return clips;
  }, [allDays]);

  const toggleAudioPlay = (url, duration) => {
    if (playingUrl === url) {
      AudioService.stop();
      setPlayingUrl(null);
    } else {
      AudioService.play({
        url,
        duration,
        onStart: () => setPlayingUrl(url),
        onEnd: () => setPlayingUrl(null),
        onError: () => setPlayingUrl(null),
      });
    }
  };

  const breadcrumbs = [
    activeNavTab === "curriculum"
      ? "Curriculum Hub"
      : activeNavTab === "audio-studio"
      ? "Audio Narration Studio"
      : "Guide Characters",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-sun/20 border-2 border-sun flex items-center justify-center text-3xl animate-bounce mb-3">
          ☀️
        </div>
        <h2 className="text-navy font-baloo text-xl font-bold">Loading Admin Suite...</h2>
        <p className="text-xs text-[#7A8B99] mt-1">Connecting to UniMind curriculum repository</p>
      </div>
    );
  }

  return (
    <AdminLayout
      admin={admin}
      onLogout={handleLogout}
      currentRole="admin"
      activeTab={activeNavTab}
      onTabChange={setActiveNavTab}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      breadcrumbs={breadcrumbs}
      primaryAction={
        <button
          type="button"
          onClick={() => {
            setSelectedGrade(null);
            setSelectedWeek(null);
            setSelectedDay(null);
            setShowEditor(true);
          }}
          className="btn-primary text-xs py-1.5 px-3.5 shadow-md flex items-center gap-1.5"
        >
          <span>+</span>
          <span className="hidden xs:inline">New Lesson</span>
        </button>
      }
    >
      {/* 1. TOP METRIC STATS CARDS (DESKTOP GRID) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-5">
        {/* Total Lessons */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E3DCC8] shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B99] block mb-1">
              Curriculum Days
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-baloo font-extrabold text-navy">
                {totalLessonsCount}
              </span>
              <span className="text-xs font-bold text-[#7A8B99]">Across {grades.length} Grades</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-2xl border border-[#E3DCC8]">
            📚
          </div>
        </div>

        {/* Audio Coverage */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E3DCC8] shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B99] block mb-1">
              Studio Audio Coverage
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-baloo font-extrabold text-grass">
                {audioCoveragePercent}%
              </span>
              <span className="text-xs font-bold text-grass">
                {filledSlotsCount}/{totalSlotsCount} clips
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E4F4E8] flex items-center justify-center text-2xl border border-grass/30 text-grass">
            🎙️
          </div>
        </div>

        {/* Voice Narration Duration */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E3DCC8] shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B99] block mb-1">
              Voice Duration
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-baloo font-extrabold text-navy">
                {totalVoiceMinutes}m
              </span>
              <span className="text-xs font-bold text-[#7A8B99]">Recorded Audio</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky/15 flex items-center justify-center text-2xl border border-sky/30">
            ⏱️
          </div>
        </div>

        {/* Active Character Guides */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#E3DCC8] shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8B99] block mb-1">
              Character Guides
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-baloo font-extrabold text-navy">
                4 Guides
              </span>
              <span className="text-xs font-bold text-sun-dark">☀️ 🦉 🐢 🐰</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sun/15 flex items-center justify-center text-2xl border border-sun/30">
            🐾
          </div>
        </div>
      </div>

      {/* 2. TAB CONTENT: CURRICULUM HUB */}
      {activeNavTab === "curriculum" && (
        <div className="space-y-5">
          {/* Desktop Filter & Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-[#E3DCC8] shadow-soft flex flex-wrap items-center justify-between gap-4">
            {/* Grade Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedGradeId("all")}
                className={`px-3 py-1.5 rounded-xl font-baloo text-xs font-bold transition-all ${
                  selectedGradeId === "all"
                    ? "bg-navy text-white shadow-sm"
                    : "bg-[#FAF7F0] text-navy hover:bg-cream border border-[#E3DCC8]"
                }`}
              >
                All Grades ({allDays.length})
              </button>
              {grades.map((grade) => {
                const count = allDays.filter((d) => d.grade.id === grade.id).length;
                const isSelected = selectedGradeId === grade.id;
                return (
                  <button
                    key={grade.id}
                    type="button"
                    onClick={() => setSelectedGradeId(grade.id)}
                    className={`px-3 py-1.5 rounded-xl font-baloo text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-sun text-white shadow-sm"
                        : "bg-[#FAF7F0] text-navy hover:bg-cream border border-[#E3DCC8]"
                    }`}
                  >
                    {grade.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Audio Filter & View Mode Toggle */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Audio Filter */}
              <select
                value={audioFilter}
                onChange={(e) => setAudioFilter(e.target.value)}
                className="p-1.5 bg-[#FAF7F0] border border-[#E3DCC8] rounded-xl text-xs font-nunito font-semibold text-navy focus:outline-none focus:border-sun"
              >
                <option value="all">All Audio Status</option>
                <option value="has-audio">🎙️ Has Custom Voice</option>
                <option value="missing-audio">⚠️ Incomplete / Missing Audio</option>
              </select>

              {/* View Mode Switcher */}
              <div className="flex items-center bg-[#FAF7F0] p-1 rounded-xl border border-[#E3DCC8]">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 rounded-lg text-xs font-baloo font-bold transition-all ${
                    viewMode === "cards" ? "bg-white text-navy shadow-2xs" : "text-[#7A8B99] hover:text-navy"
                  }`}
                  title="Card Grid View"
                >
                  🎴 Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg text-xs font-baloo font-bold transition-all ${
                    viewMode === "table" ? "bg-white text-navy shadow-2xs" : "text-[#7A8B99] hover:text-navy"
                  }`}
                  title="Compact Table View"
                >
                  📋 Table
                </button>
              </div>
            </div>
          </div>

          {/* Lessons Display Area */}
          {filteredDays.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E3DCC8] shadow-soft">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-baloo font-bold text-navy text-lg">No lessons match your filters</h3>
              <p className="text-xs text-[#7A8B99] mt-1">
                Try adjusting your search query or grade selection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGradeId("all");
                  setAudioFilter("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-cream border border-[#E3DCC8] font-baloo font-bold text-xs text-navy hover:bg-sun/10"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "cards" ? (
            /* DESKTOP CARDS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {filteredDays.map((day) => (
                <div
                  key={day.id}
                  className="bg-white rounded-2xl border border-[#E3DCC8] hover:border-sun/60 shadow-soft hover:shadow-soft-hover transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-4 md:p-5 border-b border-[#E3DCC8]/60 bg-gradient-to-b from-[#FAF7F0]/80 to-white">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-navy text-white font-baloo font-bold text-xs">
                          {day.grade?.name || "K"} • Day {day.dayNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-[#7A8B99]">
                          Week {day.week?.weekNumber}
                        </span>
                      </div>

                      {/* Audio coverage indicator */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          day.isFullyVoiced
                            ? "bg-[#E4F4E8] text-grass border-grass/30"
                            : day.filledSlots > 0
                            ? "bg-sun/15 text-sun-dark border-sun/30"
                            : "bg-cream text-[#7A8B99] border-[#E3DCC8]"
                        }`}
                      >
                        {day.isFullyVoiced ? "🎙️ 100% Voiced" : `🎙️ ${day.filledSlots}/${day.totalSlots}`}
                      </span>
                    </div>

                    <h3 className="font-baloo font-bold text-navy text-base line-clamp-1 group-hover:text-sun-dark transition-colors">
                      {day.title}
                    </h3>
                    <p className="text-xs text-[#7A8B99] line-clamp-1 mt-0.5">
                      Theme: {day.week?.title || "Classroom Community"}
                    </p>
                  </div>

                  {/* Card Body: Step progression pills */}
                  <div className="p-4 md:p-5 space-y-3 flex-1">
                    <div className="flex items-center justify-between text-xs font-nunito text-[#7A8B99]">
                      <span className="flex items-center gap-1 font-bold text-navy">
                        <span>{day.guideName === "Sunny" ? "☀️" : day.guideName === "Owl" ? "🦉" : day.guideName === "Turtle" ? "🐢" : "🐰"}</span>
                        <span>Guide: {day.guideName}</span>
                      </span>
                      {day.totalAudioSeconds > 0 && (
                        <span>⏱️ {formatDuration(day.totalAudioSeconds)}</span>
                      )}
                    </div>

                    {/* Step Timeline Pills */}
                    <div className="space-y-1.5">
                      {(day.steps || []).map((step, idx) => {
                        const hasStepAudio =
                          step.audioUrl ||
                          step.content?.introAudioUrl ||
                          step.content?.slides?.some((s) => s.audioUrl) ||
                          step.content?.questions?.some((q) => q.audioUrl) ||
                          step.content?.audioUrl;

                        return (
                          <div
                            key={step.id || idx}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-[#E3DCC8]/60 text-xs"
                          >
                            <span className="font-nunito font-semibold text-navy truncate">
                              {idx + 1}. {step.title || step.type}
                            </span>
                            <span className="text-[11px] flex items-center gap-1">
                              {hasStepAudio ? (
                                <span className="text-grass font-bold" title="Audio voiced">🎙️</span>
                              ) : (
                                <span className="text-[#9AA8B4]" title="TTS fallback">💬</span>
                              )}
                              <span className="text-[#7A8B99] capitalize">{step.type}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3.5 bg-[#FAF7F0]/60 border-t border-[#E3DCC8] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGrade(day.grade);
                        setSelectedWeek(day.week);
                        setSelectedDay(day);
                        setShowEditor(true);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-white hover:bg-cream border border-[#E3DCC8] font-baloo font-bold text-xs text-navy hover:border-sun transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>✏️</span>
                      <span>Studio Edit</span>
                    </button>

                    <button
                      type="button"
                      disabled={deletingDayId === day.id}
                      onClick={() => handleDeleteDay(day.id, day.title)}
                      className="p-1.5 rounded-xl text-coral hover:bg-red-50 hover:text-red-700 transition-colors"
                      title="Delete lesson"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* DESKTOP TABLE VIEW */
            <div className="bg-white rounded-2xl border border-[#E3DCC8] shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] border-b border-[#E3DCC8] text-[11px] font-baloo font-bold text-[#7A8B99] uppercase tracking-wider">
                      <th className="py-3 px-4">Lesson Day</th>
                      <th className="py-3 px-4">Grade & Week</th>
                      <th className="py-3 px-4">Guide</th>
                      <th className="py-3 px-4">Steps Breakdown</th>
                      <th className="py-3 px-4">Audio Narration</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DCC8]/60 text-xs font-nunito">
                    {filteredDays.map((day) => (
                      <tr key={day.id} className="hover:bg-cream/40 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-baloo font-bold text-navy text-sm">{day.title}</p>
                          <span className="text-[11px] text-[#7A8B99]">Day {day.dayNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-sun/15 text-sun-dark font-baloo font-bold text-xs">
                            {day.grade?.name || "Kindergarten"}
                          </span>
                          <span className="block text-[11px] text-[#7A8B99] mt-0.5">
                            Week {day.week?.weekNumber}: {day.week?.title}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-navy">
                          {day.guideName === "Sunny" ? "☀️ Sunny" : day.guideName === "Owl" ? "🦉 Owl" : day.guideName === "Turtle" ? "🐢 Turtle" : "🐰 Rabbit"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(day.steps || []).map((s, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-[#FAF7F0] border border-[#E3DCC8] text-[10px] font-semibold text-navy">
                                {s.type}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              day.isFullyVoiced ? "bg-[#E4F4E8] text-grass" : "bg-sun/15 text-sun-dark"
                            }`}>
                              {day.filledSlots}/{day.totalSlots} Voiced
                            </span>
                            {day.totalAudioSeconds > 0 && (
                              <span className="text-[11px] text-[#7A8B99]">
                                ({formatDuration(day.totalAudioSeconds)})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGrade(day.grade);
                                setSelectedWeek(day.week);
                                setSelectedDay(day);
                                setShowEditor(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-cream hover:bg-sun text-navy hover:text-white font-baloo font-bold text-xs transition-colors border border-[#E3DCC8]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDay(day.id, day.title)}
                              className="p-1 rounded text-coral hover:bg-red-50 hover:text-red-700"
                              title="Delete lesson"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TAB CONTENT: AUDIO NARRATION STUDIO */}
      {activeNavTab === "audio-studio" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-[#E3DCC8] shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
              <div>
                <h3 className="font-baloo font-bold text-navy text-xl">🎙️ Audio Narration Studio Master List</h3>
                <p className="text-xs text-[#7A8B99]">
                  Inventory of all narration audio clips across meditation prompts, story slides, quiz questions, and badges.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-grass bg-[#E4F4E8] px-3 py-1 rounded-full border border-grass/30">
                  {filledSlotsCount} Custom Voice Clips Active
                </span>
              </div>
            </div>

            {/* Studio Clips Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#E3DCC8] text-[11px] font-baloo font-bold text-[#7A8B99] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Lesson & Step</th>
                    <th className="py-2.5 px-3">Narration Text Snippet</th>
                    <th className="py-2.5 px-3">Audio Status & Duration</th>
                    <th className="py-2.5 px-3 text-right">Preview / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DCC8]/60 text-xs font-nunito">
                  {allAudioClips.map((clip) => {
                    const isPlayingThis = playingUrl === clip.audioUrl;
                    return (
                      <tr key={clip.id} className="hover:bg-cream/30 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-baloo font-bold text-navy block">
                            {clip.day.title} (Day {clip.day.dayNumber})
                          </span>
                          <span className="text-[11px] text-sun-dark font-semibold">
                            {clip.stepType}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <p className="text-xs text-[#4A5D6D] line-clamp-2 italic">
                            "{clip.textSnippet}"
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          {clip.audioUrl ? (
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-[#E4F4E8] text-grass font-bold text-[11px] border border-grass/20">
                                ✓ Voiced ({formatDuration(clip.audioDuration)})
                              </span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-cream text-[#7A8B99] font-semibold text-[11px] border border-[#E3DCC8]">
                              💬 TTS Fallback
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {clip.audioUrl ? (
                            <button
                              type="button"
                              onClick={() => toggleAudioPlay(clip.audioUrl, clip.audioDuration)}
                              className={`px-3 py-1.5 rounded-xl font-baloo font-bold text-xs transition-all shadow-xs ${
                                isPlayingThis
                                  ? "bg-grass text-white"
                                  : "bg-white text-navy hover:bg-sun hover:text-white border border-[#E3DCC8]"
                              }`}
                            >
                              {isPlayingThis ? "⏸️ Pause" : "▶️ Preview"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGrade(clip.day.grade);
                                setSelectedWeek(clip.day.week);
                                setSelectedDay(clip.day);
                                setShowEditor(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-sun text-white font-baloo font-bold text-xs shadow-xs hover:bg-sun-dark"
                            >
                              + Record/Upload
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: GUIDE CHARACTERS MATRIX */}
      {activeNavTab === "guides-matrix" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-[#E3DCC8] shadow-soft">
            <h3 className="font-baloo font-bold text-navy text-xl mb-1">🐾 UniMindKidz Guide Characters Matrix</h3>
            <p className="text-xs text-[#7A8B99]">
              Visual guide characters are carefully designed with nervous-system-friendly pacing, warm friendly expressions, and unique emotional regulation domains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Sunny */}
            <div className="bg-white rounded-2xl p-5 border-2 border-sun/40 shadow-soft text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#FFD98A] to-sun flex items-center justify-center text-4xl shadow-md">
                ☀️
              </div>
              <div>
                <h4 className="font-baloo font-bold text-navy text-lg">Sunny</h4>
                <span className="text-xs font-bold text-sun-dark bg-sun/15 px-2 py-0.5 rounded-full">
                  Primary Guide (Weeks 1-3)
                </span>
              </div>
              <p className="text-xs text-[#4A5D6D] leading-relaxed">
                Warm, glowing, and welcoming. Leads slow 8s breathing cycles and class family integration exercises.
              </p>
              <div className="text-[11px] text-[#7A8B99] pt-2 border-t border-[#E3DCC8]">
                Domain: <strong>Welcome & Belonging</strong>
              </div>
            </div>

            {/* Ollie the Owl */}
            <div className="bg-white rounded-2xl p-5 border-2 border-sky/40 shadow-soft text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#D0EFFB] to-sky flex items-center justify-center text-4xl shadow-md">
                🦉
              </div>
              <div>
                <h4 className="font-baloo font-bold text-navy text-lg">Ollie the Owl</h4>
                <span className="text-xs font-bold text-sky bg-sky/15 px-2 py-0.5 rounded-full">
                  Focus Guide (Weeks 4-6)
                </span>
              </div>
              <p className="text-xs text-[#4A5D6D] leading-relaxed">
                Wise, observant, and quiet. Encourages deep listening, noticing body cues, and thoughtful reflection.
              </p>
              <div className="text-[11px] text-[#7A8B99] pt-2 border-t border-[#E3DCC8]">
                Domain: <strong>Mindful Attention</strong>
              </div>
            </div>

            {/* Toby the Turtle */}
            <div className="bg-white rounded-2xl p-5 border-2 border-grass/40 shadow-soft text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#D8F2E2] to-grass flex items-center justify-center text-4xl shadow-md">
                🐢
              </div>
              <div>
                <h4 className="font-baloo font-bold text-navy text-lg">Toby the Turtle</h4>
                <span className="text-xs font-bold text-grass bg-grass/15 px-2 py-0.5 rounded-full">
                  Pacing Guide (Weeks 7-9)
                </span>
              </div>
              <p className="text-xs text-[#4A5D6D] leading-relaxed">
                Patient, grounded, and steady. Teaches children that taking it slow is strong and calming.
              </p>
              <div className="text-[11px] text-[#7A8B99] pt-2 border-t border-[#E3DCC8]">
                Domain: <strong>Emotional Regulation</strong>
              </div>
            </div>

            {/* Rosie the Rabbit */}
            <div className="bg-white rounded-2xl p-5 border-2 border-[#F6D8C6] shadow-soft text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#FFEBE0] to-[#F6D8C6] flex items-center justify-center text-4xl shadow-md">
                🐰
              </div>
              <div>
                <h4 className="font-baloo font-bold text-navy text-lg">Rosie the Rabbit</h4>
                <span className="text-xs font-bold text-[#E86A55] bg-coral/15 px-2 py-0.5 rounded-full">
                  Energy Guide (Weeks 10-12)
                </span>
              </div>
              <p className="text-xs text-[#4A5D6D] leading-relaxed">
                Joyful, bouncy, and energetic. Guides children from high energy back to balanced calm.
              </p>
              <div className="text-[11px] text-[#7A8B99] pt-2 border-t border-[#E3DCC8]">
                Domain: <strong>Energy Transition & Joy</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONTENT STUDIO MODAL OVERLAY */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-fade-in">
          <div className="max-w-5xl w-full">
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
    </AdminLayout>
  );
};

export default AdminDashboard;
