import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Bearer token fallback
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred',
      statusCode: error.response?.status,
      errors: error.response?.data?.errors || null
    };

    // If 401 Unauthorized occurs on protected routes, broadcast or clear local session
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('erp_token');
    }

    return Promise.reject(customError);
  }
);

export default api;
