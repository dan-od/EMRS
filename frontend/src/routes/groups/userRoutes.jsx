import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { USER_MANAGEMENT_ROLES } from '../routeRoles';

const UserList = lazy(() => import('@/features/users/pages/UserList'));
const UserDetail = lazy(() => import('@/features/users/pages/UserDetail'));
const CreateUser = lazy(() => import('@/features/users/pages/CreateUser'));
const EditUser = lazy(() => import('@/features/users/pages/EditUser'));

export const userRoutes = [
  <Route key="users-list" path="/users" element={
    <ProtectedRoute allowedRoles={USER_MANAGEMENT_ROLES}><UserList /></ProtectedRoute>
  } />,
  <Route key="users-new" path="/users/new" element={
    <ProtectedRoute allowedRoles={USER_MANAGEMENT_ROLES}><CreateUser /></ProtectedRoute>
  } />,
  <Route key="users-edit" path="/users/:id/edit" element={
    <ProtectedRoute allowedRoles={USER_MANAGEMENT_ROLES}><EditUser /></ProtectedRoute>
  } />,
  <Route key="users-detail" path="/users/:id" element={
    <ProtectedRoute allowedRoles={USER_MANAGEMENT_ROLES}><UserDetail /></ProtectedRoute>
  } />,
];
