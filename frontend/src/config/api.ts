/**
 * Centralized API configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Helper to get base URL without /api suffix
export const getBaseUrl = () => API_CONFIG.BASE_URL.replace(/\/api$/, '');
