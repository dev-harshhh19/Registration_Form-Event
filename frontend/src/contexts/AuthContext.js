import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  const checkAuthStatus = useCallback(async () => {
    try {
      // Removed sensitive logging
      const response = await axios.get('/api/admin/profile');
      if (response.data.success) {
        // Removed sensitive logging
        setUser(response.data.data);
        setIsAuthenticated(true);
      } else {
        
        logout();
      }
    } catch (error) {
      // Keep error logging for debugging purposes
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, [token, checkAuthStatus]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/admin/login', {
        username,
        password
      });

      if (response.data.success) {
        const { token: newToken, admin } = response.data.data;
        setToken(newToken);
        setUser(admin);
        setIsAuthenticated(true);
        localStorage.setItem('adminToken', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      // Keep error logging for debugging purposes
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (username, email) => {
    try {
      const response = await axios.put('/api/admin/profile', {
        username,
        email
      });

      if (response.data.success) {
        // Update user state with new data
        setUser(response.data.data);
        return { success: true, message: 'Profile updated successfully', data: response.data.data };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      // Keep error logging for debugging purposes
      console.error('Profile update error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put('/api/admin/change-password', {
        currentPassword,
        newPassword
      });

      if (response.data.success) {
        return { success: true, message: 'Password changed successfully' };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      // Keep error logging for debugging purposes
      console.error('Password change error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password change failed' 
      };
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};