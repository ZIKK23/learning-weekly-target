// src/ManageSchedule.jsx
import React, { useState, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";
import { getAvailableModules, createWeeklyTarget } from "./api";
import CustomAlert from "./components/CustomAlert";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: checked ? "flex-end" : "flex-start",
        width: 44,
        height: 24,
        padding: 2,
        borderRadius: 999,
        border: "none",
        backgroundColor: checked ? "#22c55e" : "#d1d5db",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "999px",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(15,23,42,0.2)",
        }}
      />
    </button>
  );
}

function ManageSchedule({ isOpen, onClose }) {
  const [dayActive, setDayActive] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d]: false }), {})
  );
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [selectedModules, setSelectedModules] = useState({});
  
  // Backend integration states
  const [availableClasses, setAvailableClasses] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', type: 'info' });
  
  const showAlert = (message, type = 'info') => {
    setAlertConfig({ isOpen: true, message, type });
  };
  
  const closeAlert = () => {
    setAlertConfig({ isOpen: false, message: '', type: 'info' });
  };

  // Fetch available modules when module modal opens
  useEffect(() => {
    if (showModuleModal && availableClasses.length === 0) {
      fetchModules();
    }
  }, [showModuleModal]);
  
  // Fetch existing target to pre-populate toggles
  useEffect(() => {
    if (isOpen) {
      fetchExistingTarget();
    }
  }, [isOpen]);
  
  const fetchExistingTarget = async () => {
    try {
      const token = localStorage.getItem('authToken');  // Fixed: use 'authToken' key
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/todo`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      console.log('📅 Existing target data:', data);
      
      if (data.status === 'ok' && data.target_days && data.todo) {
        console.log('✅ Pre-populating toggles...');
        console.log('   Days:', data.target_days);
        console.log('   Modules:', data.todo.map(m => m.module_id));
        
        // Pre-populate day toggles
        const dayToggles = DAYS.reduce((acc, d) => ({ 
          ...acc, 
          [d]: data.target_days.includes(d) 
        }), {});
        console.log('   Day toggles:', dayToggles);
        setDayActive(dayToggles);
        
        // Pre-populate module toggles
        const moduleToggles = data.todo.reduce((acc, module) => ({
          ...acc,
          [module.module_id]: true
        }), {});
        console.log('   Module toggles:', moduleToggles);
        setSelectedModules(moduleToggles);
      } else {
        console.log('⚠️ No existing target or missing data');
      }
    } catch (error) {
      console.error('❌ Error fetching existing target:', error);
    }
  };

  const fetchModules = async () => {
    try {
      setModulesLoading(true);
      const response = await getAvailableModules();
      if (response.status === 'ok') {
        setAvailableClasses(response.data);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setModulesLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleDay = (day) => {
    setDayActive((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const toggleModule = (moduleId) => {
    setSelectedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // Calculate total selected time from selected modules
  const calculateTotalTime = () => {
    let total = 0;
    availableClasses.forEach(classData => {
      classData.modules.forEach(module => {
        if (selectedModules[module.module_id]) {
          total += module.est_minutes || 0;
        }
      });
    });
    return total;
  };

  const totalSelectedTime = calculateTotalTime();

  // Save weekly target to backend
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Get selected day names
      const selectedDays = Object.keys(dayActive).filter(day => dayActive[day]);
      
      // Get selected module IDs
      const selectedModuleIds = Object.keys(selectedModules)
        .filter(id => selectedModules[id])
        .map(id => parseInt(id));

      if (selectedDays.length === 0) {
        showAlert('Please select at least one study day', 'error');
        setSaving(false);
        return;
      }

      if (selectedModuleIds.length === 0) {
        showAlert('Please select at least one module', 'error');
        setSaving(false);
        return;
      }

      const response = await createWeeklyTarget(selectedDays, selectedModuleIds);
      
      if (response.status === 'ok') {
        showAlert('Weekly target created successfully!', 'success');
        // Close alert and refresh after a short delay
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating weekly target:', error);
      showAlert('Failed to create weekly target. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };

  const modalStyle = {
    width: "100%",
    maxWidth: 420,
    background: "#ffffff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  };

  const headerTitleStyle = {
    fontSize: 18,
    fontWeight: 600,
    color: "#0f172a",
  };

  const headerSubStyle = {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  };

  const closeBtnStyle = {
    width: 28,
    height: 28,
    borderRadius: 999,
    border: "none",
    background: "#f3f4f6",
    color: "#6b7280",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const listRowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
  };

  const footerButtonPrimary = {
    borderRadius: 999,
    border: "none",
    padding: "8px 16px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    background: "#0f172a",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  };

  return (
    <>
      {/* MODAL 1: Set Study Schedule */}
      <div style={overlayStyle}>
        <div style={modalStyle}>
          {/* header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
              gap: 12,
            }}
          >
            <div>
              <h2 style={headerTitleStyle}>Set Study Schedule</h2>
              <p style={headerSubStyle}>Choose which days you want to study</p>
            </div>
            <button style={closeBtnStyle} onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          {/* body */}
          <div
            style={{
              maxHeight: 260,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            {DAYS.map((day, idx) => (
              <div
                key={day}
                style={{
                  ...listRowStyle,
                  borderBottom:
                    idx === DAYS.length - 1 ? "none" : "1px solid #e5e7eb",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#0f172a",
                    }}
                  >
                    {day}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      marginTop: 2,
                    }}
                  >
                    Set this day as study day
                  </span>
                </div>
                <Toggle
                  checked={dayActive[day]}
                  onChange={() => toggleDay(day)}
                />
              </div>
            ))}
          </div>

          {/* footer */}
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setShowModuleModal(true)}
              style={footerButtonPrimary}
            >
              Select Modules
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 2: Select Modules - Real Data */}
      {showModuleModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            {/* header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
                gap: 12,
              }}
            >
              <div>
                <h2 style={headerTitleStyle}>Select Modules</h2>
                <p style={headerSubStyle}>
                  Choose which modules you want to study this week
                </p>
              </div>
              <button
                style={closeBtnStyle}
                onClick={() => setShowModuleModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* body */}
            <div
              style={{
                maxHeight: 260,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {modulesLoading ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                  Loading modules...
                </div>
              ) : availableClasses.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                  No modules available
                </div>
              ) : (
                availableClasses.map((classData, classIdx) => (
                  <div key={classData.class_id}>
                    {/* Class Header */}
                    <div style={{ 
                      padding: "8px 0", 
                      fontWeight: 600, 
                      fontSize: 13,
                      color: "#374151",
                      marginTop: classIdx > 0 ? 12 : 0
                    }}>
                      {classData.class_name}
                    </div>
                    
                    {/* Modules in this class */}
                    {classData.modules.map((module, idx) => (
                      <div
                        key={module.module_id}
                        style={{
                          ...listRowStyle,
                          borderBottom:
                            idx === classData.modules.length - 1
                              ? "none"
                              : "1px solid #e5e7eb",
                          paddingLeft: 12,
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#0f172a",
                            }}
                          >
                            {module.module_name}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                              marginTop: 2,
                            }}
                          >
                            {module.est_minutes} min
                          </span>
                        </div>
                        <Toggle
                          checked={!!selectedModules[module.module_id]}
                          onChange={() => toggleModule(module.module_id)}
                        />
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* footer */}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
              }}
            >
              <p style={{ color: "#6b7280" }}>
                Total Selected Study Time:{" "}
                <span
                  style={{ fontWeight: 600, color: "#0f172a" }}
                >{`${totalSelectedTime || 0} Min`}</span>
              </p>
              <button 
                type="button" 
                onClick={handleSave} 
                style={{
                  ...footerButtonPrimary,
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </>
  );
}

export default ManageSchedule;
