import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { PURCHASING_ROLES } from '../routeRoles';

const PurchasingDashboard = lazy(() => import('@/features/purchasing/pages/PurchasingDashboard'));
const DamagedInventoryPage = lazy(() => import('@/features/purchasing/pages/DamagedInventoryPage'));
const InventoryPage = lazy(() => import('@/features/purchasing/pages/InventoryPage'));
const VendorsPage = lazy(() => import('@/features/purchasing/pages/VendorsPage'));
const VehiclesPage = lazy(() => import('@/features/purchasing/pages/VehiclesPage'));

export const purchasingRoutes = [
  <Route key="purch-dash" path="/purchasing" element={
    <ProtectedRoute allowedRoles={PURCHASING_ROLES}><PurchasingDashboard /></ProtectedRoute>
  } />,
  <Route key="purch-inv" path="/purchasing/inventory" element={
    <ProtectedRoute allowedRoles={PURCHASING_ROLES}><InventoryPage /></ProtectedRoute>
  } />,
  <Route key="purch-vendors" path="/purchasing/vendors" element={
    <ProtectedRoute allowedRoles={PURCHASING_ROLES}><VendorsPage /></ProtectedRoute>
  } />,
  <Route key="purch-vehicles" path="/purchasing/vehicles" element={
    <ProtectedRoute allowedRoles={PURCHASING_ROLES}><VehiclesPage /></ProtectedRoute>
  } />,
  <Route key="purch-damaged" path="/purchasing/damaged" element={
    <ProtectedRoute allowedRoles={PURCHASING_ROLES}><DamagedInventoryPage /></ProtectedRoute>
  } />,
];
