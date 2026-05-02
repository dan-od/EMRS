import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { ProtectedRoute } from './ProtectedRoute';
import LoginPage from '@/features/auth/pages/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import { coreRoutes } from './groups/coreRoutes';
import { equipmentRoutes } from './groups/equipmentRoutes';
import { requestRoutes } from './groups/requestRoutes';
import { maintenanceRoutes } from './groups/maintenanceRoutes';
import { safetyRoutes } from './groups/safetyRoutes';
import { jobsRoutes } from './groups/jobsRoutes';
import { purchasingRoutes } from './groups/purchasingRoutes';
import { userRoutes } from './groups/userRoutes';

export const PublicRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export const AppRoutes = () => (
  <ProtectedRoute>
    <Routes>
      <Route element={<MainLayout />}>
        {coreRoutes}
        {equipmentRoutes}
        {requestRoutes}
        {maintenanceRoutes}
        {safetyRoutes}
        {jobsRoutes}
        {purchasingRoutes}
        {userRoutes}
      </Route>
    </Routes>
  </ProtectedRoute>
);
