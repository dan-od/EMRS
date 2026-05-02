import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { EQUIPMENT_MANAGER_ROLES } from '../routeRoles';

const EquipmentList = lazy(() => import('@/features/equipment/pages/EquipmentList'));
const EquipmentDetail = lazy(() => import('@/features/equipment/pages/EquipmentDetail'));
const EditEquipment = lazy(() => import('@/features/equipment/pages/EditEquipment'));
const AddEquipment = lazy(() => import('@/features/equipment/pages/AddEquipment'));
const RequestAssetForm = lazy(() => import('@/features/equipment/pages/RequestAssetForm'));
const EquipmentRequestsList = lazy(() => import('@/features/equipment/pages/EquipmentRequestsList'));
const EquipmentRequestDetail = lazy(() => import('@/features/equipment/pages/EquipmentRequestDetail'));

export const equipmentRoutes = [
  <Route key="eq-list" path="/equipment" element={<EquipmentList />} />,
  <Route key="eq-new" path="/equipment/new" element={
    <ProtectedRoute allowedRoles={EQUIPMENT_MANAGER_ROLES}><AddEquipment /></ProtectedRoute>
  } />,
  <Route key="eq-request-form" path="/equipment/request" element={<RequestAssetForm />} />,
  <Route key="eq-requests" path="/equipment/requests" element={
    <ProtectedRoute allowedRoles={EQUIPMENT_MANAGER_ROLES}><EquipmentRequestsList /></ProtectedRoute>
  } />,
  <Route key="eq-request-id" path="/equipment/requests/:id" element={
    <ProtectedRoute allowedRoles={EQUIPMENT_MANAGER_ROLES}><EquipmentRequestDetail /></ProtectedRoute>
  } />,
  <Route key="eq-detail" path="/equipment/:id" element={<EquipmentDetail />} />,
  <Route key="eq-edit" path="/equipment/:id/edit" element={
    <ProtectedRoute allowedRoles={EQUIPMENT_MANAGER_ROLES}><EditEquipment /></ProtectedRoute>
  } />,
];
