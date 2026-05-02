import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { ACCOUNTS_ROLES } from '../routeRoles';

const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const Settings = lazy(() => import('@/features/dashboard/pages/Settings'));
const Unauthorized = lazy(() => import('@/features/auth/pages/Unauthorized'));
const ActivityLogs = lazy(() => import('@/features/activity/pages/ActivityLogs'));
const AccountsDashboard = lazy(() => import('@/features/accounts/pages/AccountsDashboard'));

export const coreRoutes = [
  <Route key="dashboard" path="/dashboard" element={<Dashboard />} />,
  <Route key="root" path="/" element={<Navigate to="/dashboard" replace />} />,
  <Route key="accounts" path="/accounts" element={
    <ProtectedRoute allowedRoles={ACCOUNTS_ROLES}><AccountsDashboard /></ProtectedRoute>
  } />,
  <Route key="activity" path="/activity" element={<ActivityLogs />} />,
  <Route key="settings" path="/settings" element={<Settings />} />,
  <Route key="unauthorized" path="/unauthorized" element={<Unauthorized />} />,
  <Route key="catch-all" path="*" element={<Navigate to="/dashboard" replace />} />,
];
