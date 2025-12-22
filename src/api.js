// API Service Layer
// Centralized API communication with backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ========== AUTH ENDPOINTS ==========

export const login = async (email) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  // Save token to localStorage
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Dispatch custom event to notify components immediately
    window.dispatchEvent(new CustomEvent('authChange', { detail: { authenticated: true } }));
  }

  return data;
};

export const logout = async () => {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });
  } finally {
    // Clear local storage regardless
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Dispatch custom event to notify components immediately (storage event doesn't fire in same tab)
    window.dispatchEvent(new CustomEvent('authChange', { detail: { authenticated: false } }));
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// ========== TARGETS ENDPOINTS ==========

export const createWeeklyTarget = async (days, modules) => {
  return await apiRequest('/targets/create', {
    method: 'POST',
    body: JSON.stringify({ days, modules }),
  });
};

// ========== TODO ENDPOINTS ==========

export const getWeeklyTodo = async () => {
  return await apiRequest('/todo');
};

// ========== STREAK ENDPOINTS ==========

export const getStreak = async () => {
  return await apiRequest('/streak/streak');
};

export const getLeaderboard = async () => {
  return await apiRequest('/leaderboard');
};

// ========== ACTIVITIES ENDPOINTS ==========

export const startActivity = async (module_id) => {
  return await apiRequest('/activities/start', {
    method: 'POST',
    body: JSON.stringify({ module_id }),
  });
};

export const finishActivity = async (activity_id) => {
  return await apiRequest('/activities/finish', {
    method: 'POST',
    body: JSON.stringify({ activity_id }),
  });
};

// ========== STRUCTURE ENDPOINTS ==========

// Note: This endpoint doesn't exist yet in backend
// Will need to be created for fetching available modules
export const getAvailableModules = async () => {
  // Temporary: return mock data or handle gracefully
  // TODO: Backend needs to implement GET /structure/modules
  try {
    return await apiRequest('/structure/modules');
  } catch (error) {
    console.warn('Module endpoint not available yet:', error);
    return { status: 'error', data: [] };
  }
};

// ========== PROGRESS ENDPOINTS ==========

export const getUserProgress = async () => {
  return await apiRequest('/progress/user');
};

// Get module overview (for module landing page)
export const getModuleOverview = async (moduleId) => {
  return await apiRequest(`/modules/${moduleId}`);
};

// Get individual submodule content
export const getSubmoduleContent = async (moduleId, submoduleId) => {
  return await apiRequest(`/modules/${moduleId}/submodule/${submoduleId}`);
};

// Mark submodule as completed
export const markSubmoduleComplete = async (moduleId, submoduleId, actualMinutes) => {
  return await apiRequest(`/modules/${moduleId}/submodule/${submoduleId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ actualMinutes }),
  });
};

// Get progress for all submodules in a module
export const getModuleProgress = async (moduleId) => {
  return await apiRequest(`/modules/${moduleId}/progress`);
};

// Get weekly learning time
export const getWeeklyLearningTime = async () => {
  return apiRequest('/activities/weekly-learning-time');
};

export default {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  createWeeklyTarget,
  getWeeklyTodo,
  getStreak,
  getLeaderboard,
  startActivity,
  finishActivity,
  getAvailableModules,
  getUserProgress,
  getModuleOverview,
  getSubmoduleContent,
  markSubmoduleComplete,
  getModuleProgress,
  getWeeklyLearningTime,
};

