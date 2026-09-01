import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import TeacherView from './pages/TeacherView';
import StudentView from './pages/StudentView';
import { getAuthToken, authAPI } from './services/api';

const ProtectedRoute = ({ children }) => {
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      authAPI.verify()
        .then(response => {
          setIsAdmin(true);
          setAdminUser(response.admin);
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-navy font-baloo text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Student View - Public */}
        <Route path="/" element={<StudentView />} />
        
        {/* Admin Login - Public */}
        <Route 
          path="/admin/login" 
          element={
            isAdmin ? 
            <Navigate to="/admin" replace /> : 
            <AdminLogin onLogin={(admin) => {
              setIsAdmin(true);
              setAdminUser(admin);
            }} />
          } 
        />
        
        {/* Admin Dashboard - Protected */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard 
                admin={adminUser} 
                onLogout={() => {
                  setIsAdmin(false);
                  setAdminUser(null);
                  localStorage.removeItem('authToken');
                }} 
              />
            </ProtectedRoute>
          } 
        />

        {/* Teacher View - Protected */}
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute>
              <TeacherView 
                admin={adminUser} 
                onLogout={() => {
                  setIsAdmin(false);
                  setAdminUser(null);
                  localStorage.removeItem('authToken');
                }} 
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;