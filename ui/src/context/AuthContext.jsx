import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredUser,
  getStoredToken,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
} from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    let isMounted = true;
    async function verifyAuth() {
      if (getStoredToken()) {
        try {
          const profile = await getCurrentUser();
          if (isMounted && profile) {
            setUser(profile);
          }
        } catch {
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    }
    verifyAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    setUser(data.user);
    setToken(data.access_token);
    setAuthModalOpen(false);
    return data;
  };

  const register = async (username, password, email) => {
    const data = await apiRegister(username, password, email);
    setUser(data.user);
    setToken(data.access_token);
    setAuthModalOpen(false);
    return data;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setToken(null);
  };

  const openLogin = () => {
    setModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setModalMode('register');
    setAuthModalOpen(true);
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        authModalOpen,
        setAuthModalOpen,
        modalMode,
        setModalMode,
        openLogin,
        openRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
