
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Dashboard } from './pages/Dashboard';
import { CreateSubmission } from './pages/CreateSubmission';
import { SubmissionsList } from './pages/SubmissionsList';
import { SubmissionDetail } from './pages/SubmissionDetail';
import { RiskParameters } from './pages/admin/RiskParameters';
import { AdminSettings } from './pages/admin/AdminSettings';
import { EnhancedCreateSubmission } from './pages/EnhancedCreateSubmission';
import { MasterDataManagement } from './pages/MasterDataManagement';
import { ComprehensiveDashboard } from './pages/ComprehensiveDashboard';
import { SystemStatus } from './pages/SystemStatus';


// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App Router
const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />} 
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupForm />} 
        />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<ComprehensiveDashboard  />} />
          
          {/* Submissions */}
          <Route path="submissions" element={<SubmissionsList />} />
          <Route path="submissions/create" element={<CreateSubmission />} />
          <Route path="submissions/:id" element={<SubmissionDetail />} />
          <Route path="submissions/create-enhanced" element={<EnhancedCreateSubmission />} />

          {/* Admin Routes */}
          <Route 
            path="admin/parameters" 
            element={
              <ProtectedRoute adminOnly>
                <RiskParameters />
              </ProtectedRoute>
            } 
          />
          <Route 
  path="admin/status" 
  element={
    <ProtectedRoute adminOnly>
      <SystemStatus />
    </ProtectedRoute>
  } 
/>
          <Route 
            path="admin/settings" 
            element={
              <ProtectedRoute adminOnly>
                <AdminSettings />
              </ProtectedRoute>
            } 
          />
        </Route>
         <Route 
  path="admin/master-data" 
  element={
    <ProtectedRoute adminOnly>
      <MasterDataManagement />
    </ProtectedRoute>
  } 
/>   
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;