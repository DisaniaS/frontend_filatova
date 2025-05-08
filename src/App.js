import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import Mainbase from './pages/main/MainBase';
import AuthPage from './pages/authentication/AuthPage';
import UserRoleManager from './pages/admin/UserRoleManager';
import AdminRoute from './utils/AdminRoute';

const App = () => {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/authentication" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute><Mainbase /></ProtectedRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserRoleManager /></AdminRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
