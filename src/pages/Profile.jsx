import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "../Navbar";
import { getStreak, getCurrentUser } from "../api";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(null);
  const [dailyStatus, setDailyStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get current user
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }

        // 2. Fetch streak data using API service
        const response = await getStreak();
        console.log("Profile - Streak response:", response);
        
        if (response.status === "ok") {
          setStreak(response.streak || null);
          setDailyStatus(response.dailyStatus || []);
        }
      } catch (error) {
        console.error("Profile - Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDisplayName = (val) => {
    if (!val) return "Guest User";
    if (val.includes("@")) {
      const base = val.split("@")[0];
      return base
        .replace(/[._-]/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
    return val;
  };

  const displayName =
    user?.display_name ||
    (user?.email ? formatDisplayName(user.email) : "Guest User");

  const email = user?.email || "—";
  
  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : "—";

  const currentStreak = streak?.streak ?? 0;

  return (
    <div className="profile-page">
      <Navbar setCurrentPage={() => {}} currentPage="profile" />
      
      <div className="profile-content" style={{ flexDirection: 'column', alignItems: 'center', paddingTop: '32px' }}>
        
        <div style={{ width: '100%', maxWidth: '1080px', marginBottom: '24px' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              color: '#374151',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>

        <div className="profile-grid">

          {/* MAIN CARD */}
          <div className="profile-card profile-main">
            <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div className="main-info">
              <div className="name">{displayName}</div>
              <div className="email">{email}</div>
              <div className="joined">Joined: {joined}</div>
            </div>
          </div>

          {/* STREAK CARD */}
          <div className="profile-card">
            <div className="section-title">Weekly Streak</div>

            <div className="streak-row">
              <div className="streak-num">
                {loading ? "…" : currentStreak}
              </div>
            </div>

            <div className="streak-days">
              {dailyStatus.length > 0 
                ? dailyStatus.map((item, i) => (
                    <div 
                      key={i} 
                      className={`day ${item.active ? 'active' : ''}`}
                      title={item.date}
                    >
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </div>
                  ))
                : ["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <div key={i} className="day">
                      {d}
                    </div>
                  ))
              }
            </div>
          </div>

          {/* ACCOUNT INFO CARD */}
          <div className="profile-card">
            <div className="section-title">Account Info</div>

            <div className="row">
              <div className="label">Email</div>
              <div className="value">{email}</div>
            </div>

            <div className="row">
              <div className="label">Display Name</div>
              <div className="value">{displayName}</div>
            </div>

            <div className="row">
              <div className="label">Joined</div>
              <div className="value">{joined}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
