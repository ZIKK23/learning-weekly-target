// src/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import DailyCheckin from "./pages/DailyCheckin";
import { getUserProgress, getWeeklyTodo, getStreak, getWeeklyLearningTime, isAuthenticated } from "./api"; // Added isAuthenticated

import {
  BookOpen,
  FileText,
  CheckSquare,
  Calendar,
  CalendarCheck,
  Settings,
  Clock,
  Flame,
  Trophy,
  BarChart3,
  Route,
  Check,
} from "lucide-react";
import Leaderboard from "./Leaderboard";
import ManageSchedule from "./ManageSchedule";
import Login from "./pages/Login"; // Added Login

function Dashboard({ initialShowLogin }) {
  const [showSidebar, setShowSidebar] = useState(true);
  const navigate = useNavigate();
  
  // AUTH STATE (Added)
  const [authed, setAuthed] = useState(isAuthenticated());
  const [showLogin, setShowLogin] = useState(!!initialShowLogin && !isAuthenticated());

  const [currentPage, setCurrentPage] = useState("academy");
  const [selectedItem, setSelectedItem] = useState("progres");
  const [isManageScheduleOpen, setIsManageScheduleOpen] = useState(false);
  
  // State for user progress data
  const [userProgress, setUserProgress] = useState([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressDetailsMap, setProgressDetailsMap] = useState({});
  
  // State for today's schedule data
  const [todoData, setTodoData] = useState(null);
  const [todoLoading, setTodoLoading] = useState(false);
  
  // State for streak data
  const [streakData, setStreakData] = useState(null);
  const [streakLoading, setStreakLoading] = useState(true);
  
  // State for weekly learning time
  const [learningTimeData, setLearningTimeData] = useState(null);
  const [learningTimeLoading, setLearningTimeLoading] = useState(true);

  // Auth Effects (Added)
  useEffect(() => {
    if (initialShowLogin && !isAuthenticated()) {
      setShowLogin(true);
    }
  }, [initialShowLogin]);

  // Listen for auth state changes (login/logout events)
  useEffect(() => {
    const handleAuthChange = (event) => {
      setAuthed(event.detail.authenticated);
      // Close login modal if successfully authenticated
      if (event.detail.authenticated) {
        setShowLogin(false);
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const closeLogin = () => {
     setShowLogin(false);
     if (window.location.pathname === '/login') {
       navigate('/', { replace: true });
     }
  };

  // Fetch user progress and todo on mount
  useEffect(() => {
    // Only fetch if authenticated (Added check)
    if (!authed) {
        setProgressLoading(false);
        setTodoLoading(false);
        setStreakLoading(false);
        setLearningTimeLoading(false);
        return;
    }

    const fetchProgress = async () => {
      try {
        setProgressLoading(true);
        const response = await getUserProgress();
        if (response.status === 'ok') {
          setUserProgress(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
      } finally {
        setProgressLoading(false);
      }
    };
    
    const fetchTodo = async () => {
      try {
        setTodoLoading(true);
        const response = await getWeeklyTodo();
        console.log('📊 Dashboard - Todo Response:', response);
        if (response.status === 'ok') {
          setTodoData(response);
        }
      } catch (error) {
        console.error('❌ Dashboard - Error fetching todo:', error);
      } finally {
        setTodoLoading(false);
      }
    };

    const fetchStreak = async () => {
      try {
        setStreakLoading(true);
        const response = await getStreak();
        console.log('🔥 Dashboard - Streak Response:', response);
        if (response.status === 'ok') {
          // Store the ENTIRE response (includes streak object AND dailyStatus array)
          setStreakData(response);
        }
      } catch (error) {
        console.error('❌ Dashboard - Error fetching streak:', error);
      } finally {
        setStreakLoading(false);
      }
    };

    const fetchLearningTime = async () => {
      try {
        setLearningTimeLoading(true);
        const response = await getWeeklyLearningTime();
        if (response.status === 'ok') {
          setLearningTimeData(response.data);
        }
      } catch (error) {
        console.error('❌ Dashboard - Error fetching learning time:', error);
      } finally {
        setLearningTimeLoading(false);
      }
    };

    fetchProgress();
    fetchTodo();
    fetchStreak();
    fetchLearningTime();
  }, [authed]); // Added dependency

  useEffect(() => {
    if (currentPage !== "academy" || selectedItem !== "runtutan") return;

    const handleKeyDown = (e) => {
      const container = document.querySelector(".sub-box-container");
      if (!container) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        container.scrollLeft -= 100;
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        container.scrollLeft += 100;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, selectedItem]);

  // Toggle progress details for a specific class
  const toggleProgressDetails = (classId) => {
    setProgressDetailsMap(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };
  
  // Calculate daily goal from learningTimeData (uses actual_minutes from activities)
  const calculateDailyGoal = () => {
    if (!todoData || !learningTimeData) {
      return { totalHours: 0, completedHours: 0, progressPercent: 0 };
    }
    
    // Check if TODAY is a scheduled learning day
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const isTargetDay = todoData.target_days && todoData.target_days.includes(todayName);

    // Calculate daily goal based on target days
    let dailyTotalMinutes = 0;
    if (isTargetDay) {
        const totalMinutes = todoData.todo.reduce((sum, module) => sum + (module.est_minutes || 0), 0);
        const dayCount = todoData.target_days.length || 1;
        dailyTotalMinutes = Math.round(totalMinutes / dayCount);
    }

    // Get today's ACTUAL completed minutes from learningTimeData
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayData = learningTimeData.dailyData?.find(d => d.day === today);
    const completedMinutes = todayData ? todayData.minutes : 0;
    
    // Cap progress at 100% 
    const effectiveMinutes = Math.min(completedMinutes, dailyTotalMinutes);

    return {
      totalHours: Math.round(dailyTotalMinutes / 60),
      completedHours: Math.round(effectiveMinutes / 60),
      progressPercent: dailyTotalMinutes > 0 ? Math.round((effectiveMinutes / dailyTotalMinutes) * 100) : 0
    };
  };
  
  const dailyGoal = calculateDailyGoal();

  const renderSubContent = () => {
    // Guest View: Show login prompt when not authenticated
    if (!authed) {
      // ✅ mode guest: tampilkan info sederhana + ajakan login
      return (
        <div style={{ padding: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Selamat datang 👋</h2>
          <p style={{ color: "#667085", marginBottom: 16 }}>
            Untuk melihat progress, streak, dan jadwal belajar kamu, silakan login dulu.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#111827",
              color: "white",
              cursor: "pointer",
            }}
          >
            Masuk
          </button>
        </div>
      );
    }

    if (currentPage !== "academy") return null;

    // Halaman leaderboard
    if (selectedItem === "leaderboard") {
      return <Leaderboard onBack={() => setSelectedItem("runtutan")} />;
    }

    // Halaman runtutan belajar
    if (selectedItem !== "runtutan") return null;

    return (
      <div className="sub-container">
        {/* Title Runtunan Belajar */}
        <div className="sub-row">
          <div className="sub-icon">
            <Calendar size={20} />
          </div>
          <span className="sub-text">Runtunan Belajar</span>
        </div>

        {/* Baris atas: Study Schedule + Streak + To Do */}
        <div className="sub-box-container">
          {/* === KIRI: Study Schedule & Activities === */}
          <div className="sub-box">
            {/* HEADER CARD */}
            <div className="sub-header">
              <div className="sub-header-content">
                <CalendarCheck size={24} />
                <span className="sub-header-text">
                  Study Schedule &amp; Activities
                </span>
              </div>

              <span className="sub-header-desc">
                Learning Targets &amp; Activity Summary
              </span>

              {/* BUTTON MANAGE SCHEDULE */}
              <button
  type="button"
  onClick={() => setIsManageScheduleOpen(true)}
  className="sub-manage-box sub-manage-primary"
>
  <Settings size={16} />
  <span className="sub-manage-text">Manage Schedule</span>
</button>
            </div>

            {/* CONTENT: Today schedule & chart */}
            <div className="sub-schedule">
              {/* TODAY CARD */}
              <div className="sub-schedule-title">Today&apos;s Schedule</div>

              <div className="sub-day-box">
                <div className="sub-day-left">
                  <div className="day-title">today</div>
                  <div className="day-name">
                    {new Date().toLocaleDateString("en", { weekday: "long" })}
                  </div>
                  <div className="day-date">
                    {new Date().toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="sub-day-right">
                  <div className="hour-number">
                    {todoLoading ? '-' : dailyGoal.totalHours}
                  </div>
                  <div className="hour-text">Hour Goal</div>
                </div>
              </div>

              {/* TODAY PROGRESS */}
              <div className="sub-progress">
                <div className="sub-progress-title">
                  Today&apos;s Learning Progress
                </div>
                <div className="sub-progress-time">
                  {todoLoading 
                    ? 'Loading...' 
                    : `${dailyGoal.completedHours} Hour / ${dailyGoal.totalHours} Hour`
                  }
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="learning-progress-box">
                <div className="learning-icon-row">
                  <div className="learning-icon-box">
                    <Clock size={20} />
                  </div>
                  <div className="progress-number-row">
                    {todoLoading ? '0%' : `${dailyGoal.progressPercent}%`}
                  </div>
                </div>

                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${todoLoading ? 0 : Math.min(dailyGoal.progressPercent, 100)}%` }} 
                  />
                </div>
              </div>

              {/* WEEK PROGRESS */}
              <div className="week-progress">
                <div className="week-progress-title">
                  This Week&apos;s Learning Time
                </div>
              </div>

              <div className="week-learning-time-box">
              <div className="chart-container-new">
                <div className="chart-legend">
                  <div className="legend-box" />
                  <span className="legend-text">Study</span>
                </div>

                <div className="chart-body-new">
                  {/* Grid Layer: Labels + Lines combined in rows for perfect alignment */}
                  <div className="grid-layer-new">
                    {[24, 18, 12, 6, 0].map((val, i) => (
                      <div key={val} className="grid-row-new" style={{ top: `${i * 25}%` }}>
                        <span className="grid-label-new">{val} Hr</span>
                        <div className="grid-line-new" />
                      </div>
                    ))}
                  </div>

                  {/* Bars Layer: Absolute overlay */}
                  <div className="bars-layer-new">
                    {learningTimeLoading ? (
                      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <div key={day} className="bar-column-new">
                          <div className="bar-new" style={{ height: '0%' }} />
                          <span className="bar-label-new">{day}</span>
                        </div>
                      ))
                    ) : learningTimeData?.dailyData ? (
                      learningTimeData.dailyData.map((dayData) => {
                         // 24 hours = 100% height
                         const percentHeight = Math.min((dayData.hours / 24) * 100, 100);
                         return (
                          <div key={dayData.day} className="bar-column-new">
                            <div 
                              className="bar-new" 
                              style={{ height: `${percentHeight}%` }} 
                              title={`${dayData.hours} hours`}
                            />
                            <span className="bar-label-new">{dayData.day.slice(0, 3)}</span>
                          </div>
                         );
                      })
                    ) : (
                      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <div key={day} className="bar-column-new">
                          <div className="bar-new" style={{ height: '0%' }} />
                          <span className="bar-label-new">{day}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

              {/* SEPARATOR */}
              <div className="separator" />

              {/* STATS: Courses, Assessments, Submission */}
              <div className="progress-stats">
                <div className="stat-item">
                  <div className="stat-box left">
                    <div className="stat-icon">
                      <BookOpen size={24} />
                    </div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">4</div>
                    <div className="stat-label">Courses</div>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-box center">
                    <div className="stat-icon">
                      <FileText size={24} />
                    </div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">10</div>
                    <div className="stat-label">Assessments</div>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-box right">
                    <div className="stat-icon">
                      <CheckSquare size={24} />
                    </div>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">4</div>
                    <div className="stat-label">Submission</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* === KANAN: Streak + To Do === */}
          <div className="right-container">
            {/* STREAK CARD */}
            <div className="sub-box-2">
              <div className="sub-header">
                <div className="sub-header-content">
                  <Flame size={24} />
                  <span className="sub-header-text">Streak</span>
                </div>
                <span className="sub-header-desc">
                  Finish submodule&apos;s to get a streak
                </span>
              </div>
              <div className="sub-content" style={{ padding: "16px 24px" }}>
                <div className="streak-content">
                  <div className={`streak-left ${streakData?.streak?.streak > 0 ? 'active' : ''}`}>
                    <Flame size={32} />
                    <span className="streak-left-number">
                      {streakLoading ? '-' : (streakData?.streak?.streak || 0)}
                    </span>
                  </div>
                  <div className={`streak-right ${streakData?.streak?.streak > 0 ? 'active' : ''}`}>
                    <Flame size={24} />
                    <span>best streak</span>
                    <span>{streakLoading ? '-' : (streakData?.streak?.streak || 0)}</span>
                  </div>
                </div>

                <div className="streak-day-box">
                  {streakLoading ? (
                    // Loading state
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div key={d} className="streak-day">
                        <div className="streak-day-circle">
                          <Flame size={20} />
                        </div>
                        <span className="streak-day-label">{d}</span>
                      </div>
                    ))
                  ) : streakData?.dailyStatus ? (
                    // Show actual daily status from API
                    streakData.dailyStatus.map((dayData) => (
                      <div key={dayData.day} className="streak-day">
                        <div className={`streak-day-circle ${dayData.active ? 'streak-day-active' : 'streak-day-inactive'}`}>
                          <Flame size={20} />
                        </div>
                        <span className="streak-day-label">{dayData.day.slice(0, 3)}</span>
                      </div>
                    ))
                  ) : (
                    // No data - show all inactive
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div key={d} className="streak-day">
                        <div className="streak-day-circle streak-day-inactive">
                          <Flame size={20} />
                        </div>
                        <span className="streak-day-label">{d}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="top-student-streak">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "16px",
                    }}
                  >
                    <Trophy
                      size={24}
                      style={{ color: "#8b5cf6", marginRight: "12px" }}
                    />
                    <div>
                      <div
                        style={{
                          fontFamily: '"Inter", sans-serif',
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        Top 10 siswa dengan streak terbanyak
                      </div>
                      <div
                        style={{
                          fontFamily: '"Inter", sans-serif',
                          fontSize: "12px",
                          color: "#667085",
                          marginTop: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedItem("leaderboard")}
                      >
                        Lihat leaderboard {"->"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === BAWAH: Overall Progress (full width) === */}
        {/* === BAWAH: Overall Progress (full width) === */}
        <div className="sub-box-4">
  <div className="sub-header">
    <div className="sub-header-content">
      <BarChart3 size={24} />
      <span className="sub-header-text">Overall Progress</span>
    </div>
    <span className="sub-header-desc">
      Track your courses in one place
    </span>
  </div>

          <div className="sub-content">
            <div
              style={{
                padding: "24px",
                display: "flex",
                gap: "32px",
              }}
            >
              {/* Learning Path Progress - Real Data */}
              <div className="learning-path-section">
                <div className="learning-path-section-title">
                  <Route
                    size={24}
                    className="learning-path-section-icon"
                  />
                  <span className="learning-path-section-main-title">
                    Your Learning Progress
                  </span>
                </div>
                <div className="learning-path-section-subtitle">
                  Classes you're currently studying
                </div>

                {progressLoading ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                    Loading your progress...
                  </div>
                ) : userProgress.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                    No learning progress yet.
                  </div>
                ) : (
                  userProgress.map((classData, index) => {
                    const colors = [
                      "#10b981", // green
                      "#3b82f6", // blue
                      "#8b5cf6", // purple
                      "#f59e0b", // orange
                      "#ef4444", // red
                      "#06b6d4", // cyan
                    ];
                    const color = colors[index % colors.length];
                    const isExpanded = progressDetailsMap[classData.class_id];

                    return (
                      <div
                        key={classData.class_id}
                        className={`learning-path-box ${
                          isExpanded ? "learning-path-expanded" : ""
                        }`}
                      >
                        <div className="learning-path-header">
                          <div
                            className="learning-path-icon"
                            style={{ backgroundColor: color }}
                          >
                            <Check size={16} style={{ color: "white" }} />
                          </div>
                          <span 
                            className="learning-path-title"
                            onClick={async () => {
                              // Navigate to first submodule of first incomplete module
                              const firstIncomplete = classData.modules.find(m => m.status !== 'completed');
                              const targetModule = firstIncomplete || classData.modules[0];
                              
                              if (targetModule) {
                                try {
                                  // Fetch module overview to get first submodule ID
                                  const { getModuleOverview } = await import('./api');
                                  const response = await getModuleOverview(targetModule.module_id);
                                  if (response.status === 'ok' && response.data.submodules.length > 0) {
                                    const firstSubmodule = response.data.submodules[0];
                                    navigate(`/module/${targetModule.module_id}/submodule/${firstSubmodule.id}`);
                                  }
                                } catch (err) {
                                  console.error('Error fetching module:', err);
                                }
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {classData.class_name}
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${classData.progress}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <div className="progress-details">
                          <span
                            className="progress-details-text"
                            onClick={() => toggleProgressDetails(classData.class_id)}
                          >
                            {isExpanded ? "v" : ">"} Progress Details
                          </span>
                          <span
                            className="progress-percentage"
                            style={{ color }}
                          >
                            {classData.progress}% ({classData.completed_modules}/{classData.total_modules} modules)
                          </span>
                        </div>

                        {isExpanded && (
                          <div
                            style={{
                              marginTop: "16px",
                              position: "relative",
                            }}
                          >
                            <div className="progress-tree-line" />
                            <div className="progress-tree-container">
                              {classData.modules.map((module) => {
                                const moduleProgress = module.status === 'completed' ? 100 : 0;
                                return (
                                  <div
                                    key={module.module_id}
                                    className="progress-tree-item"
                                  >
                                    <div className="progress-tree-connector" />
                                    <span 
                                      className="progress-tree-label"
                                      onClick={async () => {
                                        try {
                                          // Fetch module overview to get first submodule
                                          const { getModuleOverview } = await import('./api');
                                          const response = await getModuleOverview(module.module_id);
                                          if (response.status === 'ok' && response.data.submodules.length > 0) {
                                            const firstSubmodule = response.data.submodules[0];
                                            navigate(`/module/${module.module_id}/submodule/${firstSubmodule.id}`);
                                          }
                                        } catch (err) {
                                          console.error('Error fetching module:', err);
                                        }
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {module.module_name}
                                    </span>
                                    <div className="progress-tree-bar">
                                      <div className="progress-tree-progress">
                                        <div
                                          style={{
                                            width: `${moduleProgress}%`,
                                            height: "100%",
                                            backgroundColor: color,
                                            borderRadius: "2px",
                                          }}
                                        />
                                      </div>
                                      <span
                                        className="progress-tree-percentage"
                                        style={{ color }}
                                      >
                                        {module.status === 'completed' ? '✓ Completed' : 'Not Started'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    );
  };

  // ==== LAYOUT DASHBOARD UTAMA ====
  return (
    <div className="app-container">
      <Navbar setCurrentPage={setCurrentPage} currentPage={currentPage} />

      <div className="content">
        {currentPage === "academy" && (
          <Sidebar
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            currentPage={currentPage}
            setSelectedItem={setSelectedItem}
            selectedItem={selectedItem}
          />
        )}

        <div
          className={`main ${
            currentPage !== "academy"
              ? "no-sidebar"
              : showSidebar
              ? "show-sidebar"
              : "sidebar-collapsed"
          }`}
        >
          <div className="main-content">
            {currentPage === "daily-checkin" ? (
              <DailyCheckin
                setCurrentPage={setCurrentPage}
                setSelectedItem={setSelectedItem}
                />
            ) : (
             renderSubContent()
            )}
          </div>
        </div>
      </div>

      {/* Modal Manage Schedule */}
      <ManageSchedule
        isOpen={isManageScheduleOpen}
        onClose={() => setIsManageScheduleOpen(false)}
      />

      {/* ✅ MODAL OVERLAY LOGIN (Added) */}
      {showLogin && (
        <div style={overlayStyles.wrapper}>
          <div style={overlayStyles.backdrop} onClick={() => {
             // If clicked backdrop, close modal
             closeLogin();
          }} />
          <div style={overlayStyles.modal}>
            <Login
              onSuccess={() => {
                closeLogin();
                setAuthed(true); 
              }}
              onRegister={() => {
                closeLogin();
                navigate("/register");
              }}
              onClose={closeLogin}
              asModal
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

// Styles for Overlay (Added)
const overlayStyles = {
  wrapper: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  backdrop: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" },
  modal: {
    position: "relative",
    width: "100%",
    maxWidth: 420,  
    borderRadius: 16,
    background: "#fff", 
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },
};
