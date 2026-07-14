// src/pages/ChooseModule.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, Clock, CheckCircle2, BookOpen } from "lucide-react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { getAvailableModules, createWeeklyTarget } from "../api";
import CustomAlert from "../components/CustomAlert";
import "./ChooseModule.css";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ChooseModule() {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedItem, setSelectedItem] = useState("class");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedModules, setSelectedModules] = useState({});
  const [existingDays, setExistingDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const [previewClassId, setPreviewClassId] = useState(null);

  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: "", type: "info" });
  const showAlert = (message, type = "info") => setAlertConfig({ isOpen: true, message, type });
  const closeAlert = () => setAlertConfig({ isOpen: false, message: "", type: "info" });

  useEffect(() => {
    fetchModules();
    fetchExistingTarget();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await getAvailableModules();
      if (response.status === "ok") {
        setAvailableClasses(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingTarget = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/todo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === "ok") {
        setExistingDays(data.target_days || []);
        if (data.todo) {
          const moduleToggles = data.todo.reduce(
            (acc, module) => ({ ...acc, [module.module_id]: true }),
            {}
          );
          setSelectedModules(moduleToggles);
        }
      }
    } catch (error) {
      console.error("Error fetching existing target:", error);
    }
  };

  const previewClass = availableClasses.find((c) => c.class_id === previewClassId) || null;

  const isClassEnrolled = (classData) =>
    classData.modules.length > 0 && classData.modules.every((m) => !!selectedModules[m.module_id]);

  const openPreview = (classId) => setPreviewClassId(classId);
  const closePreview = () => setPreviewClassId(null);

  // Enroll satu class = semua modul yang belum selesai di class itu ikut
  // ke-enroll sekaligus. Kalau belum pernah atur jadwal sama sekali,
  // default semua hari aktif dulu (bisa disesuaikan lewat "Manage Schedule").
  const toggleEnrollClass = async (classData) => {
    const classModuleIds = classData.modules.map((m) => m.module_id);
    const alreadyEnrolled = isClassEnrolled(classData);

    const nextSelected = { ...selectedModules };
    classModuleIds.forEach((id) => {
      nextSelected[id] = !alreadyEnrolled;
    });

    const nextModuleIds = Object.keys(nextSelected)
      .filter((id) => nextSelected[id])
      .map((id) => parseInt(id));

    if (nextModuleIds.length === 0) {
      showAlert("Minimal 1 class harus tetap ter-enroll", "error");
      return;
    }

    const daysToUse = existingDays.length > 0 ? existingDays : ALL_DAYS;

    try {
      setEnrolling(true);
      const response = await createWeeklyTarget(daysToUse, nextModuleIds);
      if (response.status === "ok") {
        setSelectedModules(nextSelected);
        setExistingDays(daysToUse);
        showAlert(alreadyEnrolled ? "Class dibatalkan" : "Semua modul di class ini berhasil di-enroll", "success");
      }
    } catch (error) {
      console.error("Error updating enrolled modules:", error);
      showAlert("Gagal menyimpan. Coba lagi.", "error");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar setCurrentPage={() => {}} currentPage="academy" />

      <div className="content">
        <Sidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          currentPage="academy"
          setSelectedItem={setSelectedItem}
          selectedItem={selectedItem}
        />

        <div className={`main ${showSidebar ? "show-sidebar" : "sidebar-collapsed"}`}>
          <div className="main-content">
            <div className="lib-page">
              <div className="lib-content">
                <div className="lib-back-wrap">
                  <button className="lib-back-btn" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft size={18} />
                    Back to Dashboard
                  </button>
                </div>

                <div className="lib-heading">
                  <h2 className="lib-title">Library Class</h2>
                  <p className="lib-subtitle">Jelajahi class yang tersedia, lihat modul di dalamnya, lalu enroll class yang ingin kamu kerjakan</p>
                </div>

                {loading ? (
                  <div className="lib-empty">Memuat class...</div>
                ) : availableClasses.length === 0 ? (
                  <div className="lib-empty">Belum ada class tersedia</div>
                ) : (
                  <div className="lib-grid">
                    {availableClasses.map((classData) => {
                      const isEnrolled = isClassEnrolled(classData);
                      const totalMinutes = classData.modules.reduce((sum, m) => sum + (m.est_minutes || 0), 0);
                      return (
                        <button
                          key={classData.class_id}
                          type="button"
                          className={`lib-card ${isEnrolled ? "lib-card-enrolled" : ""}`}
                          onClick={() => openPreview(classData.class_id)}
                        >
                          {isEnrolled && (
                            <span className="lib-card-badge">
                              <CheckCircle2 size={12} />
                              Terdaftar
                            </span>
                          )}
                          <span className="lib-card-title">{classData.class_name}</span>
                          <span className="lib-card-desc">{classData.modules.length} modul belum dikerjakan</span>
                          <span className="lib-card-meta">
                            <Clock size={12} />
                            {totalMinutes} min total
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {previewClass && (
        <div className="lib-modal-overlay" onClick={closePreview}>
          <div className="lib-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lib-modal-close" onClick={closePreview}>
              <X size={16} />
            </button>

            <span className="lib-modal-class">
              <BookOpen size={14} />
              Class
            </span>
            <h3 className="lib-modal-title">{previewClass.class_name}</h3>
            <span className="lib-modal-meta">
              {previewClass.modules.length} modul belum dikerjakan
            </span>

            <div className="lib-modal-submodules">
              {previewClass.modules.map((mod, idx) => (
                <div key={mod.module_id} className="lib-modal-submodule-row">
                  <span className="lib-modal-submodule-index">{idx + 1}</span>
                  <div className="lib-modal-submodule-info">
                    <span className="lib-modal-submodule-title">{mod.module_name}</span>
                    <span className="lib-modal-submodule-meta">
                      <Clock size={11} />
                      {mod.est_minutes} min
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={`lib-enroll-btn ${isClassEnrolled(previewClass) ? "lib-enroll-btn-active" : ""}`}
              onClick={() => toggleEnrollClass(previewClass)}
              disabled={enrolling}
              style={{ opacity: enrolling ? 0.6 : 1, cursor: enrolling ? "not-allowed" : "pointer" }}
            >
              {enrolling ? (
                "Menyimpan..."
              ) : isClassEnrolled(previewClass) ? (
                <>
                  <CheckCircle2 size={16} />
                  Terdaftar &mdash; Batalkan
                </>
              ) : (
                "Enroll Class Ini"
              )}
            </button>
          </div>
        </div>
      )}

      <CustomAlert
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}
