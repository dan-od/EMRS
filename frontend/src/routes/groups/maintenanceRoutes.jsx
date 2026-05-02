import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { MAINTENANCE_ROLES } from '../routeRoles';

const MaintenanceList = lazy(() => import('@/features/maintenance/pages/MaintenanceList'));
const MaintenanceDetail = lazy(() => import('@/features/maintenance/pages/MaintenanceDetail'));

export const maintenanceRoutes = [
  <Route key="maint-list" path="/maintenance" element={
    <ProtectedRoute allowedRoles={MAINTENANCE_ROLES}><MaintenanceList /></ProtectedRoute>
  } />,
  <Route key="maint-detail" path="/maintenance/:id" element={
    <ProtectedRoute allowedRoles={MAINTENANCE_ROLES}><MaintenanceDetail /></ProtectedRoute>
  } />,
];
