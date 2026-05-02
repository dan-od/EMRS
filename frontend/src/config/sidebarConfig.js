/**
 * Sidebar Configuration - Updated with Role-Based Equipment Labels
 * Post-Phase 5: Different labels per role for equipment section
 */

import {
  LayoutDashboard, FileText, Package, Briefcase, Wrench,
  Users, AlertTriangle, History,
  Boxes, Store, Truck, ClipboardList, AlertOctagon, BookOpen
} from 'lucide-react';

const createNavItem = (path, label, icon, children = null) => ({
  path, label, icon, ...(children && { children })
});

const createDivider = (label) => ({ type: 'divider', label });

// ========================================
// ROLE-SPECIFIC SIDEBARS
// ========================================

export const getSuperAdminSidebar = () => [
  createNavItem('/dashboard', 'Dashboard', LayoutDashboard),
  createDivider('Core Features'),
  createNavItem('/equipment', 'Equipment', Package),
  { path: '/requests', label: 'Requests', icon: FileText, children: [
    { path: '/requests', label: 'Request Hub' },
    { path: '/requests/my', label: 'My Requests' },
    { path: '/requests/dept', label: 'Dept Requests' },
    { path: '/requests/all', label: 'All Requests' }
  ]},
  createDivider('In Development'),
  createNavItem('/jobs', 'Jobs', Briefcase),
  createNavItem('/jobs/purchasing-queue', 'Purchasing Queue', ClipboardList),
  createNavItem('/maintenance', 'Maintenance', Wrench),
  createNavItem('/safety', 'Safety Reports', AlertTriangle),
  createDivider('Purchasing'),
  createNavItem('/purchasing', 'Dashboard', Package),
  createNavItem('/purchasing/inventory', 'Inventory', Boxes),
  createNavItem('/purchasing/damaged', 'Damaged Items', AlertOctagon),
  createNavItem('/purchasing/vendors', 'Vendors', Store),
  createNavItem('/purchasing/vehicles', 'Vehicles', Truck),
  createDivider('Finance'),
  createNavItem('/accounts', 'Asset Ledger', BookOpen),
  createDivider('Administration'),
  createNavItem('/users', 'User Management', Users),
  createNavItem('/activity', 'Activity Logs', History),
];

export const getAdminSidebar = () => [
  createNavItem('/dashboard', 'Dashboard', LayoutDashboard),
  createNavItem('/equipment', 'Department Assets', Package), // Updated label
  createNavItem('/maintenance', 'Work Orders', Wrench),
  { path: '/requests', label: 'Requests', icon: FileText, children: [
    { path: '/requests', label: 'Request Hub' },
    { path: '/requests/my', label: 'My Requests' },
    { path: '/requests/dept', label: 'Dept Requests' },
    { path: '/requests/all', label: 'All Requests' }
  ]},
  createDivider('Administration'),
  createNavItem('/users', 'User Management', Users),
  createNavItem('/activity', 'Activity Logs', History),
];

export const getManagerSidebar = () => [
  createNavItem('/dashboard', 'Dashboard', LayoutDashboard),
  createNavItem('/equipment', 'Department Assets', Package), // Updated label
  createNavItem('/maintenance', 'Work Orders', Wrench),
  { path: '/requests', label: 'Requests', icon: FileText, children: [
    { path: '/requests', label: 'Request Hub' },
    { path: '/requests/my', label: 'My Requests' },
    { path: '/requests/dept', label: 'Dept Requests' }
  ]},
  createNavItem('/activity', 'Activity Logs', History),
];

export const getStaffSidebar = () => [
  createNavItem('/dashboard', 'Dashboard', LayoutDashboard),
  createNavItem('/equipment', 'Field Equipment', Package), // Updated label
  createNavItem('/maintenance', 'Work Orders', Wrench),
  { path: '/requests', label: 'Requests', icon: FileText, children: [
    { path: '/requests', label: 'Request Hub' },
    { path: '/requests/my', label: 'My Requests' }
  ]},
  createNavItem('/activity', 'Activity Logs', History),
];

export const getITSupportSidebar = () => [
  createNavItem('/dashboard', 'Dashboard', LayoutDashboard),
  createDivider('User Management'),
  createNavItem('/users', 'All Users', Users),
  createDivider('My Work'),
  { path: '/requests', label: 'Requests', icon: FileText, children: [
    { path: '/requests', label: 'Request Hub' },
    { path: '/requests/my', label: 'My Requests' }
  ]},
  createNavItem('/activity', 'Activity Logs', History),
];

export const getPurchasingStaffSidebar = () => [
  createNavItem('/dashboard', 'Dashboard', LayoutDashboard),
  createDivider('My Requests'),
  { path: '/requests', label: 'Requests', icon: FileText, children: [
    { path: '/requests', label: 'Request Hub' },
    { path: '/requests/my', label: 'My Requests' }
  ]},
  createDivider('Fulfillment'),
  createNavItem('/purchasing', 'Process Requests', Package),
  createNavItem('/maintenance', 'Work Orders', Wrench),
  createDivider('Assets'),
  createNavItem('/purchasing/inventory', 'Inventory', Boxes),
  createNavItem('/purchasing/damaged', 'Damaged/Missing', AlertOctagon),
  createNavItem('/equipment', 'Equipment Registry', Package), // Updated label
  createDivider('Procurement'),
  createNavItem('/purchasing/vendors', 'Vendors', Store),
  createNavItem('/purchasing/vehicles', 'Vehicles', Truck),
  createNavItem('/activity', 'Activity Logs', History),
];

export const getPurchasingManagerSidebar = () => [
  createNavItem('/dashboard', 'Dashboard', LayoutDashboard),
  createDivider('My Work'),
  { path: '/requests', label: 'Requests', icon: FileText, children: [
    { path: '/requests', label: 'Request Hub' },
    { path: '/requests/my', label: 'My Requests' },
    { path: '/requests/dept', label: 'Dept Requests' }
  ]},
  createDivider('Fulfillment'),
  createNavItem('/purchasing', 'Process Requests', Package),
  createNavItem('/maintenance', 'Work Orders', Wrench),
  createDivider('Assets'),
  createNavItem('/purchasing/inventory', 'Inventory', Boxes),
  createNavItem('/purchasing/damaged', 'Damaged/Missing', AlertOctagon),
  createNavItem('/equipment', 'Equipment Registry', Package), // Updated label
  createDivider('Procurement'),
  createNavItem('/purchasing/vendors', 'Vendors', Store),
  createNavItem('/purchasing/vehicles', 'Vehicles', Truck),
  createNavItem('/activity', 'Activity Logs', History),
];

export const getAccountsManagerSidebar = () => [
  createNavItem('/dashboard', 'Dashboard', LayoutDashboard),
  createDivider('Finance'),
  createNavItem('/accounts', 'Asset Ledger', BookOpen),
  createDivider('My Work'),
  { path: '/requests', label: 'Requests', icon: FileText, children: [
    { path: '/requests', label: 'Request Hub' },
    { path: '/requests/my', label: 'My Requests' },
    { path: '/requests/dept', label: 'Dept Requests' }
  ]},
  createDivider('Assets'),
  createNavItem('/equipment', 'Asset Register', Package), // Updated label
  createNavItem('/maintenance', 'Work Orders', Wrench),
  createNavItem('/activity', 'Activity Logs', History),
];

export const getAccountsStaffSidebar = () => [
  createNavItem('/dashboard', 'Dashboard', LayoutDashboard),
  createDivider('Finance'),
  createNavItem('/accounts', 'Asset Ledger', BookOpen),
  createDivider('My Work'),
  { path: '/requests', label: 'Requests', icon: FileText, children: [
    { path: '/requests', label: 'Request Hub' },
    { path: '/requests/my', label: 'My Requests' }
  ]},
  createDivider('Assets'),
  createNavItem('/equipment', 'Asset Register', Package), // Updated label
  createNavItem('/maintenance', 'Work Orders', Wrench),
  createNavItem('/activity', 'Activity Logs', History),
];

export const getSafetyOfficerSidebar = () => [
  createNavItem('/dashboard', 'Dashboard', LayoutDashboard),
  createDivider('Safety'),
  createNavItem('/safety', 'Safety Reports', AlertTriangle),
  createNavItem('/safety/new', 'New Report', AlertTriangle),
  createDivider('My Work'),
  { path: '/requests', label: 'Requests', icon: FileText, children: [
    { path: '/requests', label: 'Request Hub' },
    { path: '/requests/my', label: 'My Requests' }
  ]},
  createDivider('Assets'),
  createNavItem('/equipment', 'Equipment', Package),
  createNavItem('/maintenance', 'Work Orders', Wrench),
  createNavItem('/activity', 'Activity Logs', History),
];

export const getSafetyManagerSidebar = () => [
  createNavItem('/dashboard', 'Dashboard', LayoutDashboard),
  createDivider('Safety'),
  createNavItem('/safety', 'Safety Reports', AlertTriangle),
  createNavItem('/safety/new', 'New Report', AlertTriangle),
  createDivider('My Work'),
  { path: '/requests', label: 'Requests', icon: FileText, children: [
    { path: '/requests', label: 'Request Hub' },
    { path: '/requests/my', label: 'My Requests' },
    { path: '/requests/dept', label: 'Dept Requests' }
  ]},
  createDivider('Assets'),
  createNavItem('/equipment', 'Department Assets', Package),
  createNavItem('/maintenance', 'Work Orders', Wrench),
  createNavItem('/activity', 'Activity Logs', History),
];

export const getITManagerSidebar = () => [
  createNavItem('/dashboard', 'Dashboard', LayoutDashboard),
  createNavItem('/equipment', 'Department Assets', Package),
  createNavItem('/maintenance', 'Work Orders', Wrench),
  { path: '/requests', label: 'Requests', icon: FileText, children: [
    { path: '/requests', label: 'Request Hub' },
    { path: '/requests/my', label: 'My Requests' },
    { path: '/requests/dept', label: 'Dept Requests' }
  ]},
  createDivider('Administration'),
  createNavItem('/users', 'User Management', Users),
  createNavItem('/activity', 'Activity Logs', History),
];

// ========================================
// MAIN EXPORT
// ========================================

export const getSidebarByRole = (role) => {
  if (!role) return getStaffSidebar();

  if (role === 'Super_Admin') return getSuperAdminSidebar();
  if (role === 'Admin') return getAdminSidebar();
  if (role === 'IT_Manager') return getITManagerSidebar();
  if (role === 'IT_Support') return getITSupportSidebar();
  if (role === 'Purchasing_Manager') return getPurchasingManagerSidebar();
  if (role === 'Purchasing_Staff') return getPurchasingStaffSidebar();
  if (role === 'Accounts_Manager') return getAccountsManagerSidebar();
  if (role === 'Accounts_Staff') return getAccountsStaffSidebar();
  if (role === 'Safety_Manager') return getSafetyManagerSidebar();
  if (role === 'Safety_Officer') return getSafetyOfficerSidebar();
  if (role.includes('Manager')) return getManagerSidebar();

  return getStaffSidebar();
};

export default getSidebarByRole;
