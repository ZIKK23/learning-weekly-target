// src/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "./api";

// We keep this for routes that ABSOLUTELY require login (like Profile, Checkin)
// But Dashboard itself now handles Guest Mode, so we don't wrap Dashboard with this.
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // If we want to support guest mode on dashboard, we might redirect there instead of /login logic
    // But for pages like "Profile", a hard redirect to /login (which now renders Dashboard+Popup) is appropriate.
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
