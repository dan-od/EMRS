import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { ADMIN_ROLES, MANAGER_ROLES } from '../routeRoles';

const RequestHub = lazy(() => import('@/features/requests/pages/RequestHub'));
const MyRequests = lazy(() => import('@/features/requests/pages/MyRequests'));
const CreateRequest = lazy(() => import('@/features/requests/pages/CreateRequest'));
const RequestDetail = lazy(() => import('@/features/requests/pages/RequestDetail'));
const DeptRequests = lazy(() => import('@/features/requests/pages/DeptRequests'));
const AllRequests = lazy(() => import('@/features/requests/pages/AllRequests'));

export const requestRoutes = [
  <Route key="req-hub" path="/requests" element={<RequestHub />} />,
  <Route key="req-hub2" path="/requests/hub" element={<RequestHub />} />,
  <Route key="req-my" path="/requests/my" element={<MyRequests />} />,
  <Route key="req-new" path="/requests/new" element={<CreateRequest />} />,
  <Route key="req-all" path="/requests/all" element={
    <ProtectedRoute allowedRoles={ADMIN_ROLES}><AllRequests /></ProtectedRoute>
  } />,
  <Route key="req-dept" path="/requests/dept" element={
    <ProtectedRoute allowedRoles={MANAGER_ROLES}><DeptRequests /></ProtectedRoute>
  } />,
  <Route key="req-detail" path="/requests/:id" element={<RequestDetail />} />,
];
