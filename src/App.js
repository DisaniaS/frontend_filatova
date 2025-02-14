import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import Mainbase from './pages/main/MainBase';
import AuthPage from './pages/authentication/AuthPage';

const App = () => {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/authentication" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Mainbase />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
