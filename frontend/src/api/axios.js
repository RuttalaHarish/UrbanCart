import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/* ─── Request Interceptor ───────────────────────────────────────────
   Reads the token from localStorage synchronously before every request.
─────────────────────────────────────────────────────────────────── */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('urbancart_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─── Response Interceptor ──────────────────────────────────────────
   Handles 401 Unauthorized errors by redirecting unauthenticated users
   straight to /login without displaying raw "no authentication" popups.
─────────────────────────────────────────────────────────────────── */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid credentials
      localStorage.removeItem('urbancart_token');
      localStorage.removeItem('urbancart_user');
      
      // Redirect to login if not already on /login
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
