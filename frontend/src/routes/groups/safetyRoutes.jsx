import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { SAFETY_ROLES } from '../routeRoles';

const SafetyHub = lazy(() => import('@/features/safety/pages/SafetyHub'));
const CreateSafetyReport = lazy(() => import('@/features/safety/pages/CreateSafetyReport'));
const SafetyReportDetail = lazy(() => import('@/features/safety/pages/SafetyReportDetail'));

export const safetyRoutes = [
  <Route key="safety-hub" path="/safety" element={
    <ProtectedRoute allowedRoles={SAFETY_ROLES}><SafetyHub /></ProtectedRoute>
  } />,
  <Route key="safety-new" path="/safety/new" element={
    <ProtectedRoute allowedRoles={SAFETY_ROLES}><CreateSafetyReport /></ProtectedRoute>
  } />,
  <Route key="safety-detail" path="/safety/:id" element={
    <ProtectedRoute allowedRoles={SAFETY_ROLES}><SafetyReportDetail /></ProtectedRoute>
  } />,
];
