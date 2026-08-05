import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

const SafetyHub = lazy(() => import('@/features/safety/pages/SafetyHub'));
const CreateSafetyReport = lazy(() => import('@/features/safety/pages/CreateSafetyReport'));
const SafetyReportDetail = lazy(() => import('@/features/safety/pages/SafetyReportDetail'));

/**
 * Safety is open to every authenticated user.
 *
 * This is an HSE system: anyone on site can witness an incident, so filing a
 * report cannot be role-gated. These routes previously required SAFETY_ROLES,
 * which redirected ordinary staff to /unauthorized and left SafetyHub's
 * "Showing your submitted reports" branch, useMySafetyReports() and the
 * backend's getMyReports endpoint as unreachable dead code.
 *
 * Access is still restricted, just at the right layer:
 *   - the hub branches internally, showing the full list only to
 *     SAFETY_ADMIN_ROLES and own-reports to everyone else
 *   - the detail endpoint is guarded server-side by ownership or role
 *     (safety.routes.js), because a frontend-only guard is what produced
 *     this defect in the first place
 */
export const safetyRoutes = [
  <Route key="safety-hub" path="/safety" element={
    <ProtectedRoute><SafetyHub /></ProtectedRoute>
  } />,
  <Route key="safety-new" path="/safety/new" element={
    <ProtectedRoute><CreateSafetyReport /></ProtectedRoute>
  } />,
  <Route key="safety-detail" path="/safety/:id" element={
    <ProtectedRoute><SafetyReportDetail /></ProtectedRoute>
  } />,
];
