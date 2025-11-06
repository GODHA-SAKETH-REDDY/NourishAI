// Centralized API base for production and dev
// If REACT_APP_API_BASE is not set, default to same-origin so the SPA can call the Django backend when served together.
export const API_BASE = process.env.REACT_APP_API_BASE || '';

export const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
