import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthRequest, loginRequest, logout as logoutAction } from '../redux/slices/user';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.data);
  const userStatus = useSelector((state) => state.user.status);
  
  const [loading, setLoading] = useState(true);

  // Используем данные из Redux store
  const isAuthenticated = Boolean(userData);
  const user = userData;

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        await dispatch(checkAuthRequest());
      } catch (error) {
        console.error('Ошибка аутентификации:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    if (userStatus !== 'loading') {
      setLoading(false);
    }
  }, [userStatus]);

  const login = async (loginData) => {
    try {
      const resultAction = await dispatch(loginRequest(loginData));
      const userData = resultAction.payload;
      
      if (userData && userData.token) {
        localStorage.setItem('token', userData.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch(logoutAction());
  };

  const contextValue = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};