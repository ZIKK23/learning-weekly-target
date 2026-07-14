import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Dashboard from "./Dashboard.jsx";
import Login from "./pages/Login.jsx";
import DailyCheckin from "./pages/DailyCheckin.jsx";
import Profile from "./pages/Profile.jsx";
import SubmoduleContent from "./pages/SubmoduleContent.jsx";
import ChooseModule from "./pages/ChooseModule.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { isAuthenticated } from "./api.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public route - now handled by Dashboard + Popup */}
        <Route path="/login" element={<Dashboard initialShowLogin={true} />} />
        
        {/* Protected routes - actually Dashboard handles its own auth state now, but we keep wrapper for safety if needed, 
            though for guest mode to work we might want to relax ProtectedRoute or just let Dashboard handle it. 
            User wants Dashboard with Guest Mode. ProtectedRoute usually redirects to /login if not authed.
            Let's simply point /dashboard to Dashboard and let it handle guest mode. */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route
          path="/checkin"
          element={
            <ProtectedRoute>
              <DailyCheckin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/module/:moduleId/submodule/:submoduleId"
          element={
            <ProtectedRoute>
              <SubmoduleContent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/choose-module"
          element={
            <ProtectedRoute>
              <ChooseModule />
            </ProtectedRoute>
          }
        />

        {/* Default to Dashboard (Guest or Authed) */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
