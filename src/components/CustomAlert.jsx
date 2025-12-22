import React from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

/**
 * CustomAlert - A centered, styled alert component
 * @param {boolean} isOpen - Whether the alert is visible
 * @param {function} onClose - Callback when alert is closed
 * @param {string} message - The message to display
 * @param {string} type - Type of alert: 'success', 'error', 'info' (default: 'info')
 */
function CustomAlert({ isOpen, onClose, message, type = "info" }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={24} color="#22c55e" />;
      case "error":
        return <AlertCircle size={24} color="#ef4444" />;
      default:
        return <Info size={24} color="#3b82f6" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case "success":
        return "#dcfce7";
      case "error":
        return "#fee2e2";
      default:
        return "#dbeafe";
    }
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    animation: "fadeIn 0.2s ease-out",
  };

  const alertBoxStyle = {
    backgroundColor: "#f5f7fb", // Same as website background
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "420px",
    width: "90%",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.3)",
    position: "relative",
    animation: "slideIn 0.3s ease-out",
    border: "1px solid #e5e7eb",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  };

  const iconBoxStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: getIconBgColor(),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const messageStyle = {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#111827",
    fontFamily: '"Inter", sans-serif',
    whiteSpace: "pre-line",
    flex: 1,
    paddingTop: "8px",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#ffffff",
    color: "#6b7280",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  };

  const okButtonStyle = {
    width: "100%",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#2D3E50",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "8px",
    fontFamily: '"Inter", sans-serif',
    transition: "all 0.2s ease",
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .custom-alert-close-btn:hover {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
          }

          .custom-alert-ok-btn:hover {
            background-color: #243544 !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(45, 62, 80, 0.3);
          }
        `}
      </style>
      <div style={overlayStyle} onClick={onClose}>
        <div style={alertBoxStyle} onClick={(e) => e.stopPropagation()}>
          <button
            className="custom-alert-close-btn"
            style={closeButtonStyle}
            onClick={onClose}
          >
            <X size={18} />
          </button>

          <div style={headerStyle}>
            <div style={iconBoxStyle}>{getIcon()}</div>
            <div style={messageStyle}>{message}</div>
          </div>

          <button
            className="custom-alert-ok-btn"
            style={okButtonStyle}
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </>
  );
}

export default CustomAlert;
