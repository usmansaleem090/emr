// Base API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  VERIFY: "/api/auth/verify",
  REFRESH: "/api/auth/refresh",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
} as const;

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: "/api/users/profile",
  UPDATE_PROFILE: "/api/users/profile",
  CHANGE_PASSWORD: "/api/users/change-password",
  LIST: "/api/users",
  CREATE: "/api/users",
  GET_BY_ID: (id: number) => `/api/users/${id}`,
  UPDATE: (id: number) => `/api/users/${id}`,
  DELETE: (id: number) => `/api/users/${id}`,
} as const;

// Patient endpoints
export const PATIENT_ENDPOINTS = {
  LIST: "/api/patients",
  CREATE: "/api/patients",
  GET_BY_ID: (id: number) => `/api/patients/${id}`,
  GET_BY_MRN: (mrn: string) => `/api/patients/mrn/${mrn}`,
  UPDATE: (id: number) => `/api/patients/${id}`,
  DELETE: (id: number) => `/api/patients/${id}`,
  SEARCH: "/api/patients/search",
} as const;

// System endpoints
export const SYSTEM_ENDPOINTS = {
  HEALTH: "/api/health",
  VERSION: "/api/version",
  STATUS: "/api/status",
} as const;

// WebSocket endpoints
export const WEBSOCKET_ENDPOINTS = {
  NOTIFICATIONS: "/ws/notifications",
  CHAT: "/ws/chat",
  UPDATES: "/ws/updates",
} as const;

// File upload endpoints
export const UPLOAD_ENDPOINTS = {
  PROFILE_PICTURE: "/api/uploads/profile",
  PATIENT_DOCUMENTS: "/api/uploads/documents",
  MEDICAL_IMAGES: "/api/uploads/images",
} as const;

// Report endpoints
export const REPORT_ENDPOINTS = {
  GENERATE: "/api/reports/generate",
  LIST: "/api/reports",
  DOWNLOAD: (id: number) => `/api/reports/${id}/download`,
} as const;

// Export all endpoints as a single object
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USERS: USER_ENDPOINTS,
  PATIENTS: PATIENT_ENDPOINTS,
  SYSTEM: SYSTEM_ENDPOINTS,
  WEBSOCKET: WEBSOCKET_ENDPOINTS,
  UPLOADS: UPLOAD_ENDPOINTS,
  REPORTS: REPORT_ENDPOINTS,
} as const;

export default API_ENDPOINTS;
