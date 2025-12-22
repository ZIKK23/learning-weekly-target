import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Flame, Menu, LogOut } from "lucide-react";
import { logout, getCurrentUser, getStreak } from "./api";
import checkmarkSvg from "./assets/icons/checkmark.svg";
import "./Navbar.css";

function Navbar({ setCurrentPage, currentPage, onLoginClick, onRegisterClick, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const navigate = useNavigate();

  // FIX: Use useState instead of useMemo to allow updates via setUser
  const [user, setUser] = useState(() => getCurrentUser());

  useEffect(() => {
    // Listen for auth changes (login/logout) via custom event
    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };
    
    window.addEventListener('authChange', handleAuthChange);
    // Keep storage event for cross-tab sync
    window.addEventListener("storage", handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        if (!user) return;
        const response = await getStreak();
        if (response?.status === "ok" && response?.streak) {
          setStreakCount(response.streak.streak || 0);
        }
      } catch (error) {
        console.error("❌ Navbar - Error fetching streak:", error);
      }
    };

    fetchStreak();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null); // Clear local user state immediately
      if (onLogout) {
        onLogout();
      } else {
        // Navigate to dashboard to show guest view
        navigate("/dashboard");
      }
    }
  };

  const handleDailyCheckin = () => {
    navigate("/checkin");
  };

  const handleNavClick = (e, page) => {
    e.preventDefault();
    setCurrentPage(page);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LEFT */}
        <div className="navbar-left">
          <img
            src="/src/assets/dicoding-header-logo.png"
            alt="Logo"
            className="navbar-logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          />
        </div>

        {/* CENTER */}
        <div className="navbar-center">
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen((s) => !s)}
            type="button"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>

          <ul className={`navbar-menu ${menuOpen ? "show" : ""}`}>
            <li>
              <a
                href="#"
                className={`navbar-link ${currentPage === "home" ? "active" : ""}`}
                onClick={(e) => handleNavClick(e, "home")}
              >
                Home
              </a>
            </li>

            <li>
              <a
                href="#"
                className={`navbar-link ${currentPage === "academy" ? "active" : ""}`}
                onClick={(e) => handleNavClick(e, "academy")}
              >
                Academy
              </a>
            </li>

            <li>
              <a
                href="#"
                className={`navbar-link ${currentPage === "challenge" ? "active" : ""}`}
                onClick={(e) => handleNavClick(e, "challenge")}
              >
                Challenge
              </a>
            </li>

            <li>
              <a
                href="#"
                className={`navbar-link ${currentPage === "event" ? "active" : ""}`}
                onClick={(e) => handleNavClick(e, "event")}
              >
                Event
              </a>
            </li>

            <li>
              <a
                href="#"
                className={`navbar-link ${currentPage === "job" ? "active" : ""}`}
                onClick={(e) => handleNavClick(e, "job")}
              >
                Job
              </a>
            </li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="navbar-right">
          {/* BELUM LOGIN */}
          {!user ? (
            <>
              <button
                type="button"
                className="navbar-login-btn"
                onClick={() => (onLoginClick ? onLoginClick() : navigate("/login"))}
              >
                Masuk
              </button>

              <button
                type="button"
                className="navbar-register-btn"
                onClick={() =>
                  onRegisterClick ? onRegisterClick() : navigate("/register")
                }
              >
                Daftar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="daily-checkin-btn"
                onClick={handleDailyCheckin}
              >
                <img
                  src={checkmarkSvg}
                  alt="Checkmark"
                  className="daily-checkin-icon"
                />
                <span>Daily Check-in</span>
              </button>

              <div className="navbar-streak">
                <Flame className="navbar-icon" size={24} />
                <span className="navbar-badge">{streakCount}</span>
              </div>

              <span
                className="navbar-username"
                title={user.email}
                onClick={() => navigate("/profile")}
                style={{ cursor: "pointer" }}
              >
                {user.display_name || user.email}
              </span>

              <User
                className="navbar-icon"
                size={24}
                onClick={() => navigate("/profile")}
                style={{ cursor: "pointer" }}
              />

              <Bell className="navbar-icon navbar-bell" size={24} />

              <button
                type="button"
                className="navbar-logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
