import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!user || !user.role || user.role !== 'Администратор') {
    return <Navigate to="/" />;
  }

  return children;
}; 

export default AdminRoute;