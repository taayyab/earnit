/**
 * Authentication Context for EarnedIt Platform
 * Supports MFA verification flow
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, mfaAPI } from './api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const useAuthSafe = () => {
  const context = useContext(AuthContext);
  return context || { user: null, logout: () => {}, isAuthenticated: false };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedMfaRequired = localStorage.getItem('mfaRequired') === 'true';
    const storedMfaVerified = localStorage.getItem('mfaVerified') === 'true';

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      setMfaRequired(storedMfaRequired);
      setMfaVerified(storedMfaVerified);
      
      if (!parsedUser.first_name) {
        authAPI.getMe().then(response => {
          const profileData = response.data;
          const updatedUser = {
            ...parsedUser,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            representation_mode: profileData.representation_mode,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }).catch(err => {
          console.error('Failed to refresh profile on mount:', err);
        });
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const { access_token, user_id, email: userEmail, role, veteran_status, mfa_required, accreditation_status, first_name, last_name } = response.data;

    const userData = { user_id, email: userEmail, role, veteran_status, accreditation_status, first_name, last_name };

    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('mfaRequired', mfa_required ? 'true' : 'false');
    localStorage.setItem('mfaVerified', 'false');
    localStorage.removeItem('onboarding_completed');

    setToken(access_token);
    setUser(userData);
    setMfaRequired(mfa_required || false);
    setMfaVerified(false);

    return { ...userData, mfa_required };
  };

  const completeMfaVerification = (newToken) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('mfaVerified', 'true');
    setToken(newToken);
    setMfaVerified(true);
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { access_token, user_id, email, role, veteran_status, accreditation_status, first_name, last_name } = response.data;

    const userData = { user_id, email, role, veteran_status, accreditation_status, first_name, last_name };

    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('mfaRequired', 'false');
    localStorage.setItem('mfaVerified', 'true');
    localStorage.removeItem('onboarding_completed');

    setToken(access_token);
    setUser(userData);
    setMfaRequired(false);
    setMfaVerified(true);

    return userData;
  };

  const demoLogin = async (accountType = 'veteran') => {
    const response = await authAPI.demoLogin(accountType);
    const { access_token, user_id, email, role, veteran_status, first_name, last_name } = response.data;

    const userData = { user_id, email, role, veteran_status, first_name, last_name, is_demo: true };

    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('mfaRequired', 'false');
    localStorage.setItem('mfaVerified', 'true');
    localStorage.removeItem('onboarding_completed');

    setToken(access_token);
    setUser(userData);
    setMfaRequired(false);
    setMfaVerified(true);

    return userData;
  };

  const refreshProfile = async () => {
    try {
      const response = await authAPI.getMe();
      const profileData = response.data;
      
      const updatedUser = {
        ...user,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        representation_mode: profileData.representation_mode,
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      return user;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('mfaRequired');
    localStorage.removeItem('mfaVerified');
    localStorage.removeItem('onboarding_completed');
    setToken(null);
    setUser(null);
    setMfaRequired(false);
    setMfaVerified(false);
  };

  const checkMfaStatus = async () => {
    try {
      const response = await mfaAPI.getStatus();
      const isEnabled = response.data.mfa?.enabled || false;
      setMfaRequired(isEnabled);
      localStorage.setItem('mfaRequired', isEnabled ? 'true' : 'false');
      return isEnabled;
    } catch (err) {
      console.error('Failed to check MFA status:', err);
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    demoLogin,
    logout,
    isAuthenticated: !!token,
    mfaRequired,
    mfaVerified,
    completeMfaVerification,
    checkMfaStatus,
    refreshProfile,
    needsMfaVerification: mfaRequired && !mfaVerified,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
