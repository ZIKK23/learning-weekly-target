import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import dailyCheckinSvg from "../assets/icons/daily-checkin.svg";
import "./DailyCheckin.css";

export default function DailyCheckin() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("checkin");
  const [selectedItem, setSelectedItem] = useState("daily-checkin");
  const [showSidebar, setShowSidebar] = useState(true);
  const today = new Date();

  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

  const grid = useMemo(() => {
    const firstDayIndex = new Date(view.year, view.month, 1).getDay();
    const totalDays = daysInMonth(view.year, view.month);
    const prevMonth = view.month - 1 < 0 ? 11 : view.month - 1;
    const prevYear = view.month - 1 < 0 ? view.year - 1 : view.year;
    const prevMonthDays = daysInMonth(prevYear, prevMonth);

    const cells = [];

    for (let i = 0; i < 42; i++) {
      const dayIdx = i - firstDayIndex + 1;
      if (i < firstDayIndex) {
        cells.push({
          day: prevMonthDays - (firstDayIndex - 1 - i),
          inMonth: false,
          date: null,
        });
      } else if (dayIdx <= totalDays) {
        const cellDate = new Date(view.year, view.month, dayIdx);
        cells.push({
          day: dayIdx,
          inMonth: true,
          date: cellDate,
        });
      } else {
        cells.push({
          day: dayIdx - totalDays,
          inMonth: false,
          date: null,
        });
      }
    }

    return cells;
  }, [view]);

  const monthLabel = useMemo(() => {
    return new Date(view.year, view.month, 1).toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [view]);

  const prevMonth = () =>
    setView((s) => {
      const m = s.month - 1;
      if (m < 0) return { year: s.year - 1, month: 11 };
      return { ...s, month: m };
    });

  const nextMonth = () =>
    setView((s) => {
      const m = s.month + 1;
      if (m > 11) return { year: s.year + 1, month: 0 };
      return { ...s, month: m };
    });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const CalendarCell = ({ dayNumber, isCurrentMonth, isToday }) => (
    <div
      className={
        "dc-cell " +
        (isCurrentMonth ? "dc-cell--current " : "dc-cell--muted ") +
        (isToday ? "dc-cell--today" : "")
      }
    >
      <div className="dc-cell-number">{dayNumber ?? ""}</div>
      <div className="dc-cell-badge"></div>
    </div>
  );

  return (
    <div className="app-container">
      <Navbar setCurrentPage={setCurrentPage} currentPage={currentPage} />
      
      <div className="content">
        <div className="main-shell">
          <Sidebar
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            setCurrentPage={setCurrentPage}
          />
          
          <div className="main">
            <div className="main-content">
    <div className="daily-checkin-page">
      <div className="dc-wrapper">
        {/* HEADER */}
        <div className="sub-header dc-subheader">
          <div className="dc-subheader-left">
            {/* BACK BUTTON */}
            <button
              className="dc-back-btn"
              onClick={() => {
                navigate('/dashboard');
                if (setCurrentPage) setCurrentPage("academy");
                if (setSelectedItem) setSelectedItem("runtutan");
              }}
              aria-label="Back to Dashboard"
            >
              ‹
            </button>

            {/* ICON */}
            <div className="dc-icon">
              <img src={dailyCheckinSvg} alt="Daily check-in" />
            </div>

            {/* TITLE */}
            <div>
              <div className="dc-title">Daily Check-in</div>
              <div className="dc-subtitle">
                Stay consistent with your daily check-in.
              </div>
            </div>
          </div>
        </div>

        {/* CALENDAR CARD */}
        <div className="dc-card">
          <div className="dc-header">
            <div className="dc-nav-group">
              <button className="dc-nav" onClick={prevMonth}>
                ‹
              </button>
              <button className="dc-nav" onClick={nextMonth}>
                ›
              </button>
            </div>

            <div className="dc-month-label">{monthLabel}</div>
          </div>

          <div className="dc-calendar">
            <div className="dc-weekdays">
              {weekdays.map((w) => (
                <div key={w} className="dc-weekday">
                  {w}
                </div>
              ))}
            </div>

            <div className="dc-grid">
              {grid.map((c, i) => {
                const isToday =
                  c.inMonth &&
                  c.date &&
                  c.date.getFullYear() === today.getFullYear() &&
                  c.date.getMonth() === today.getMonth() &&
                  c.date.getDate() === today.getDate();

                return (
                  <CalendarCell
                    key={i}
                    dayNumber={c.day}
                    isCurrentMonth={c.inMonth}
                    isToday={isToday}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
