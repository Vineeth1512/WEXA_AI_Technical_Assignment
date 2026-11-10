import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('stockflow_token'));
  const [loading, setLoading] = useState(true);

  // Check and restore user session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('stockflow_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('stockflow_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Session expired or invalid:', error.message);
          localStorage.removeItem('stockflow_token');
          localStorage.removeItem('stockflow_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // User Registration
  const register = async (email, password, organizationName) => {
    const res = await api.post('/auth/register', {
      email,
      password,
      organizationName
    });

    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('stockflow_token', newToken);
      localStorage.setItem('stockflow_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    }
    return res.data;
  };

  // User Login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password
    });

    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('stockflow_token', newToken);
      localStorage.setItem('stockflow_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    }
    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('stockflow_token');
    localStorage.removeItem('stockflow_user');
    setToken(null);
    setUser(null);
  };

  // Update User/Org in state
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('stockflow_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        updateUser
      }}
    >
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

