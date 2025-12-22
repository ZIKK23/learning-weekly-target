import React, { useEffect } from "react";
import {
  FileText,
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
          selectedItem === "runtutan" ? "selected" : ""
        }`}
        onClick={() => setSelectedItem("runtutan")}
      >
        <div className="sidebar-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 14h1v4"/>
            <path d="M16 2v4"/>
            <path d="M3 10h18"/>
            <path d="M8 2v4"/>
            <rect x="3" y="4" width="18" height="18" rx="2"/>
          </svg>
          {showSidebar && (
            <span className="sidebar-item-label">Runtutan Belajar</span>
          )}
        </div>
      </div>

      {/* MENU 3 */}
      <div
        className={`sidebar-section ${
          selectedItem === "langganan" ? "selected" : ""
        }`}
      >
        <div className="sidebar-item">
          <FileText size={20} />
          {showSidebar && <span className="sidebar-item-label">Langganan</span>}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
