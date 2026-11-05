import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { AUTH_ENDPOINTS } from '../constants';

const AuthContext = createContext(null);

const TOKEN_KEY = 'urbancart_token';
const USER_KEY = 'urbancart_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // On startup, restore session from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set Authorization header whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      return response.data;
    } catch (err) {
      // If the backend sent a real HTTP error response from server (e.g. 400 Bad Request, 401 Unauthorized), forward it
      if (err.response && err.response.data && err.response.status !== 502 && err.response.status !== 503 && err.response.status !== 504) {
        throw err;
      }

      // Offline / Network fallback for live demo (Vercel without localhost backend)
      const rawDemoUsers = localStorage.getItem('urbancart_demo_users');
      const demoUsers = rawDemoUsers ? JSON.parse(rawDemoUsers) : [];
      const existingUser = demoUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (existingUser && existingUser.password && existingUser.password !== password) {
        const error = new Error('Invalid email or password');
        error.response = { data: { message: 'Invalid email or password' } };
        throw error;
      }

      const isAdmin = email.toLowerCase().includes('admin');
      const rawName = existingUser?.name || email.split('@')[0].replace(/[._]/g, ' ') || 'Demo User';
      const capitalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      const demoUser = {
        _id: existingUser?._id || 'demo-user-' + Date.now(),
        name: capitalizedName,
        email: email.toLowerCase(),
        role: isAdmin ? 'admin' : (existingUser?.role || 'customer'),
        phone: existingUser?.phone || '9876543210',
      };

      const demoToken = 'demo-jwt-token-' + Date.now();

      localStorage.setItem(TOKEN_KEY, demoToken);
      localStorage.setItem(USER_KEY, JSON.stringify(demoUser));

      setToken(demoToken);
      setUser(demoUser);
      setIsAuthenticated(true);

      return { success: true, token: demoToken, user: demoUser };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.REGISTER, { name, email, password });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data && err.response.status !== 502 && err.response.status !== 503 && err.response.status !== 504) {
        throw err;
      }

      // Offline / Network fallback for live demo
      const rawDemoUsers = localStorage.getItem('urbancart_demo_users');
      const demoUsers = rawDemoUsers ? JSON.parse(rawDemoUsers) : [];

      const existing = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        const error = new Error('User already exists with this email address');
        error.response = { data: { message: 'User already exists with this email address' } };
        throw error;
      }

      const isAdmin = email.toLowerCase().includes('admin');
      const newUser = {
        _id: 'demo-user-' + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: isAdmin ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
      };

      demoUsers.push(newUser);
      localStorage.setItem('urbancart_demo_users', JSON.stringify(demoUsers));

      return { success: true, message: 'Registration successful! Please sign in.', user: newUser };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedUserData };
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
