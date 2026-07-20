import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/* ─── Request interceptor ───────────────────────────────────────────
   Reads the token from localStorage synchronously before every
   request. This guarantees the Authorization header is present even
   when a request fires before AuthContext's useEffect has had a
   chance to call api.defaults.headers.common['Authorization'] = ...
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

export default axiosInstance;

