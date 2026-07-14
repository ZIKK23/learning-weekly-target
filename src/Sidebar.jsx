import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import sidebarLogo from "./assets/sidebar-logo.png"; // dari src/Sidebar.jsx ke src/assets
import "./Sidebar.css";

function Sidebar({
  showSidebar,
  setShowSidebar,
  currentPage,
  setSelectedItem,
  selectedItem,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (currentPage === "academy") setSelectedItem("runtutan");
    else setSelectedItem(null);
  }, [currentPage, setSelectedItem]);

  return (
    <div className={`sidebar ${showSidebar ? "" : "collapsed"}`}>
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="sidebar-header-main">
          <div className="sidebar-logo-box">
          <img
  src={sidebarLogo}
  alt="sidebar logo"
  className="sidebar-logo-img"
/>
          </div>

          {showSidebar && <span className="sidebar-title">Academy</span>}
        </div>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
        </button>
      </div>

      {/* MENU 1 */}
      <div
        className={`sidebar-section ${
          selectedItem === "progres" ? "selected" : ""
        }`}
        onClick={() => navigate("/dashboard")}
      >
        <div className="sidebar-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 14v2.2l1.6 1"/>
            <path d="M16 4h2a2 2 0 0 1 2 2v.832"/>
            <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2"/>
            <circle cx="16" cy="16" r="6"/>
            <rect x="8" y="2" width="8" height="4" rx="1"/>
          </svg>
          {showSidebar && <span className="sidebar-item-label">Progres Belajar</span>}
        </div>
      </div>

      {/* MENU 2 */}
      <div
        className={`sidebar-section ${
          selectedItem === "class" ? "selected" : ""
        }`}
        onClick={() => navigate("/choose-module")}
      >
        <div className="sidebar-item">
          <BookOpen size={20} />
          {showSidebar && <span className="sidebar-item-label">Class</span>}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
