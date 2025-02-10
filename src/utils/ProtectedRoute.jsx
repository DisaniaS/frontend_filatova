import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // или любой другой индикатор загрузки
  }

  return isAuthenticated ? children : <Navigate to="/authentication" />;
};

export default ProtectedRoute;