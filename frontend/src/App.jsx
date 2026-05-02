import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { AppRoutes } from '@/routes';
import { ToastContainer, ErrorBoundary } from '@/components/feedback';
import LoginPage from '@/features/auth/pages/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import ForcePasswordResetPage from '@/features/auth/pages/ForcePasswordResetPage';

export default function App() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const { initTheme } = useUIStore();

  // Initialize theme on app load
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      <ToastContainer />
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/change-password"
            element={isAuthenticated ? <ForcePasswordResetPage /> : <Navigate to="/login" replace />}
          />

          {/* Protected Routes */}
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </ErrorBoundary>
    </>
  );
}
