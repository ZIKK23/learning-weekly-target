import React, { useState, useEffect } from "react";
import { ChevronLeft, Trophy, Flame } from "lucide-react";

const Leaderboard = ({ onBack }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/leaderboard`);
        const data = await response.json();
        if (data.status === "ok") {
          setStudents(data.data);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
  };

  return (
    <div className="leaderboard-container">
      {/* Header */}
      <div className="leaderboard-header">
        <button onClick={onBack} className="leaderboard-back-btn">
          <ChevronLeft size={24} color="#333" />
        </button>

        <div className="leaderboard-icon-box">
          <Trophy size={24} color="white" />
        </div>

        <div>
          <h1 className="leaderboard-title">Student Streak Leaderboard</h1>
          <p className="leaderboard-subtitle">
            Top student with the longest consecutive daily learning streaks
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="leaderboard-card">
        <div className="leaderboard-card-header">
          <h2 className="leaderboard-card-title">Top 10 Students</h2>
          <p className="leaderboard-card-subtitle">Update daily at 12:00 AM</p>
        </div>

        {/* Table Header */}
        <div className="leaderboard-table-header">
          <div className="col-rank">Rank</div>
          <div className="col-student">Student</div>
          <div className="col-streak">Streak Count</div>
        </div>

        {/* List */}
        <div>
          {loading ? (
            <div style={{ padding: "24px", textAlign: "center" }}>
              Loading...
            </div>
          ) : (
            students.map((student, index) => (
              <div
                key={index}
                className={`leaderboard-item ${
                  index !== students.length - 1 ? "border-bottom" : ""
                }`}
              >
                <div className="leaderboard-rank">
                  {index === 0 ? (
                    <Trophy size={20} color="#eab308" />
                  ) : (
                    index + 1
                  )}
                </div>

                <div className="leaderboard-student-info">
                  <div className="leaderboard-avatar"></div>
                  <div>
                    <div className="leaderboard-student-name">
                      {student.display_name}
                    </div>
                    <div className="leaderboard-student-joined">
                      {formatDate(student.created_at)}
                    </div>
                  </div>
                </div>

                <div className="leaderboard-streak-box">
                  {student.streak}
                  <Flame size={16} color="#f59e0b" fill="#f59e0b" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

