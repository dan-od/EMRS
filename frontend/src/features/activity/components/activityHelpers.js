/**
 * Activity Helpers
 * Action configurations, icons, and formatting utilities
 */

import { 
  LogIn, LogOut, UserPlus, UserMinus, Edit, Trash2, 
  CheckCircle, XCircle, Send, FileText, Shield, 
  Package, Wrench, ShoppingCart, Truck,
  Key, UserCheck, ClipboardList, Clock, RotateCcw, Settings
} from 'lucide-react';

// Unique color schemes for each action type with dark mode support
export const getActionConfig = (action) => {
  const configs = {
    // Auth - Blues
    LOGIN: { bg: 'bg-blue-100', darkBg: 'dark:bg-blue-500/20', text: 'text-blue-700', darkText: 'dark:text-blue-400', icon: LogIn },
    LOGIN_FAILED: { bg: 'bg-red-100', darkBg: 'dark:bg-red-500/20', text: 'text-red-700', darkText: 'dark:text-red-400', icon: XCircle },
    LOGOUT: { bg: 'bg-slate-100', darkBg: 'dark:bg-slate-500/20', text: 'text-slate-700', darkText: 'dark:text-slate-400', icon: LogOut },
    PASSWORD_CHANGED: { bg: 'bg-indigo-100', darkBg: 'dark:bg-indigo-500/20', text: 'text-indigo-700', darkText: 'dark:text-indigo-400', icon: Key },
    PASSWORD_RESET_REQUESTED: { bg: 'bg-violet-100', darkBg: 'dark:bg-violet-500/20', text: 'text-violet-700', darkText: 'dark:text-violet-400', icon: RotateCcw },
    PASSWORD_RESET_COMPLETED: { bg: 'bg-violet-100', darkBg: 'dark:bg-violet-500/20', text: 'text-violet-700', darkText: 'dark:text-violet-400', icon: RotateCcw },
    
    // Create - Greens
    USER_CREATED: { bg: 'bg-emerald-100', darkBg: 'dark:bg-emerald-500/20', text: 'text-emerald-700', darkText: 'dark:text-emerald-400', icon: UserPlus },
    REQUEST_CREATED: { bg: 'bg-green-100', darkBg: 'dark:bg-green-500/20', text: 'text-green-700', darkText: 'dark:text-green-400', icon: Send },
    EQUIPMENT_CREATED: { bg: 'bg-teal-100', darkBg: 'dark:bg-teal-500/20', text: 'text-teal-700', darkText: 'dark:text-teal-400', icon: Package },
    JOB_CREATED: { bg: 'bg-cyan-100', darkBg: 'dark:bg-cyan-500/20', text: 'text-cyan-700', darkText: 'dark:text-cyan-400', icon: ClipboardList },
    SAFETY_REPORT_CREATED: { bg: 'bg-lime-100', darkBg: 'dark:bg-lime-500/20', text: 'text-lime-700', darkText: 'dark:text-lime-400', icon: Shield },
    INVENTORY_ADDED: { bg: 'bg-green-100', darkBg: 'dark:bg-green-500/20', text: 'text-green-700', darkText: 'dark:text-green-400', icon: ShoppingCart },
    VENDOR_CREATED: { bg: 'bg-emerald-100', darkBg: 'dark:bg-emerald-500/20', text: 'text-emerald-700', darkText: 'dark:text-emerald-400', icon: Truck },
    MAINTENANCE_LOGGED: { bg: 'bg-teal-100', darkBg: 'dark:bg-teal-500/20', text: 'text-teal-700', darkText: 'dark:text-teal-400', icon: Wrench },
    FIELD_REPORT_SUBMITTED: { bg: 'bg-cyan-100', darkBg: 'dark:bg-cyan-500/20', text: 'text-cyan-700', darkText: 'dark:text-cyan-400', icon: FileText },
    DISBURSEMENT_CREATED: { bg: 'bg-pink-100', darkBg: 'dark:bg-pink-500/20', text: 'text-pink-700', darkText: 'dark:text-pink-400', icon: ShoppingCart },
    DISBURSE: { bg: 'bg-amber-100', darkBg: 'dark:bg-amber-500/20', text: 'text-amber-700', darkText: 'dark:text-amber-400', icon: ShoppingCart },
    PURCHASE_REQUEST_CREATED: { bg: 'bg-fuchsia-100', darkBg: 'dark:bg-fuchsia-500/20', text: 'text-fuchsia-700', darkText: 'dark:text-fuchsia-400', icon: ShoppingCart },
    PREJOB_INSPECTION_CREATED: { bg: 'bg-cyan-100', darkBg: 'dark:bg-cyan-500/20', text: 'text-cyan-700', darkText: 'dark:text-cyan-400', icon: ClipboardList },
    POSTJOB_INSPECTION_CREATED: { bg: 'bg-teal-100', darkBg: 'dark:bg-teal-500/20', text: 'text-teal-700', darkText: 'dark:text-teal-400', icon: ClipboardList },
    
    // Update - Yellows/Oranges
    USER_UPDATED: { bg: 'bg-amber-100', darkBg: 'dark:bg-amber-500/20', text: 'text-amber-700', darkText: 'dark:text-amber-400', icon: Edit },
    REQUEST_UPDATED: { bg: 'bg-yellow-100', darkBg: 'dark:bg-yellow-500/20', text: 'text-yellow-700', darkText: 'dark:text-yellow-400', icon: Edit },
    EQUIPMENT_UPDATED: { bg: 'bg-orange-100', darkBg: 'dark:bg-orange-500/20', text: 'text-orange-700', darkText: 'dark:text-orange-400', icon: Edit },
    JOB_UPDATED: { bg: 'bg-amber-100', darkBg: 'dark:bg-amber-500/20', text: 'text-amber-700', darkText: 'dark:text-amber-400', icon: Edit },
    SAFETY_REPORT_UPDATED: { bg: 'bg-yellow-100', darkBg: 'dark:bg-yellow-500/20', text: 'text-yellow-700', darkText: 'dark:text-yellow-400', icon: Edit },
    ROLE_CHANGED: { bg: 'bg-orange-100', darkBg: 'dark:bg-orange-500/20', text: 'text-orange-700', darkText: 'dark:text-orange-400', icon: UserCheck },
    EQUIPMENT_STATUS_CHANGED: { bg: 'bg-yellow-100', darkBg: 'dark:bg-yellow-500/20', text: 'text-yellow-700', darkText: 'dark:text-yellow-400', icon: Settings },
    JOB_STATUS_CHANGED: { bg: 'bg-amber-100', darkBg: 'dark:bg-amber-500/20', text: 'text-amber-700', darkText: 'dark:text-amber-400', icon: Settings },
    INVENTORY_UPDATED: { bg: 'bg-yellow-100', darkBg: 'dark:bg-yellow-500/20', text: 'text-yellow-700', darkText: 'dark:text-yellow-400', icon: Edit },
    INVENTORY_ADJUSTED: { bg: 'bg-orange-100', darkBg: 'dark:bg-orange-500/20', text: 'text-orange-700', darkText: 'dark:text-orange-400', icon: Settings },
    VENDOR_UPDATED: { bg: 'bg-amber-100', darkBg: 'dark:bg-amber-500/20', text: 'text-amber-700', darkText: 'dark:text-amber-400', icon: Edit },
    VENDOR_RATING_UPDATED: { bg: 'bg-amber-100', darkBg: 'dark:bg-amber-500/20', text: 'text-amber-700', darkText: 'dark:text-amber-400', icon: Truck },
    
    // Approve - Greens/Teals
    REQUEST_APPROVED: { bg: 'bg-emerald-100', darkBg: 'dark:bg-emerald-500/20', text: 'text-emerald-700', darkText: 'dark:text-emerald-400', icon: CheckCircle },
    JOB_APPROVED: { bg: 'bg-teal-100', darkBg: 'dark:bg-teal-500/20', text: 'text-teal-700', darkText: 'dark:text-teal-400', icon: CheckCircle },
    PURCHASE_REQUEST_APPROVED: { bg: 'bg-green-100', darkBg: 'dark:bg-green-500/20', text: 'text-green-700', darkText: 'dark:text-green-400', icon: CheckCircle },
    FIELD_REPORT_REVIEWED: { bg: 'bg-cyan-100', darkBg: 'dark:bg-cyan-500/20', text: 'text-cyan-700', darkText: 'dark:text-cyan-400', icon: CheckCircle },
    
    // Reject - Reds/Pinks
    REQUEST_REJECTED: { bg: 'bg-red-100', darkBg: 'dark:bg-red-500/20', text: 'text-red-700', darkText: 'dark:text-red-400', icon: XCircle },
    PURCHASE_REQUEST_REJECTED: { bg: 'bg-rose-100', darkBg: 'dark:bg-rose-500/20', text: 'text-rose-700', darkText: 'dark:text-rose-400', icon: XCircle },
    
    // Complete - Purples
    REQUEST_COMPLETED: { bg: 'bg-purple-100', darkBg: 'dark:bg-purple-500/20', text: 'text-purple-700', darkText: 'dark:text-purple-400', icon: CheckCircle },
    MAINTENANCE_COMPLETED: { bg: 'bg-violet-100', darkBg: 'dark:bg-violet-500/20', text: 'text-violet-700', darkText: 'dark:text-violet-400', icon: CheckCircle },
    DISBURSEMENT_COMPLETED: { bg: 'bg-fuchsia-100', darkBg: 'dark:bg-fuchsia-500/20', text: 'text-fuchsia-700', darkText: 'dark:text-fuchsia-400', icon: CheckCircle },
    SAFETY_REPORT_RESOLVED: { bg: 'bg-purple-100', darkBg: 'dark:bg-purple-500/20', text: 'text-purple-700', darkText: 'dark:text-purple-400', icon: Shield },
    
    // Assign - Blues/Indigos
    EQUIPMENT_ASSIGNED: { bg: 'bg-sky-100', darkBg: 'dark:bg-sky-500/20', text: 'text-sky-700', darkText: 'dark:text-sky-400', icon: Package },
    JOB_TEAM_ADDED: { bg: 'bg-indigo-100', darkBg: 'dark:bg-indigo-500/20', text: 'text-indigo-700', darkText: 'dark:text-indigo-400', icon: UserPlus },
    JOB_SUPERVISOR_ASSIGNED: { bg: 'bg-blue-100', darkBg: 'dark:bg-blue-500/20', text: 'text-blue-700', darkText: 'dark:text-blue-400', icon: UserCheck },
    JOB_EQUIPMENT_ASSIGNED: { bg: 'bg-sky-100', darkBg: 'dark:bg-sky-500/20', text: 'text-sky-700', darkText: 'dark:text-sky-400', icon: Package },
    SAFETY_REPORT_ASSIGNED: { bg: 'bg-sky-100', darkBg: 'dark:bg-sky-500/20', text: 'text-sky-700', darkText: 'dark:text-sky-400', icon: Shield },
    MAINTENANCE_ASSIGNED: { bg: 'bg-indigo-100', darkBg: 'dark:bg-indigo-500/20', text: 'text-indigo-700', darkText: 'dark:text-indigo-400', icon: Wrench },
    
    // Remove/Delete - Reds
    USER_DELETED: { bg: 'bg-red-100', darkBg: 'dark:bg-red-500/20', text: 'text-red-700', darkText: 'dark:text-red-400', icon: Trash2 },
    USER_DEACTIVATED: { bg: 'bg-rose-100', darkBg: 'dark:bg-rose-500/20', text: 'text-rose-700', darkText: 'dark:text-rose-400', icon: UserMinus },
    USER_REACTIVATED: { bg: 'bg-green-100', darkBg: 'dark:bg-green-500/20', text: 'text-green-700', darkText: 'dark:text-green-400', icon: UserCheck },
    EQUIPMENT_UNASSIGNED: { bg: 'bg-rose-100', darkBg: 'dark:bg-rose-500/20', text: 'text-rose-700', darkText: 'dark:text-rose-400', icon: Package },
    JOB_TEAM_REMOVED: { bg: 'bg-red-100', darkBg: 'dark:bg-red-500/20', text: 'text-red-700', darkText: 'dark:text-red-400', icon: UserMinus },
    JOB_SUPERVISOR_REMOVED: { bg: 'bg-rose-100', darkBg: 'dark:bg-rose-500/20', text: 'text-rose-700', darkText: 'dark:text-rose-400', icon: UserMinus },
    JOB_EQUIPMENT_REMOVED: { bg: 'bg-red-100', darkBg: 'dark:bg-red-500/20', text: 'text-red-700', darkText: 'dark:text-red-400', icon: Package },
    REQUEST_CANCELLED: { bg: 'bg-gray-200', darkBg: 'dark:bg-gray-500/20', text: 'text-gray-700', darkText: 'dark:text-gray-400', icon: XCircle },
    VENDOR_DEACTIVATED: { bg: 'bg-rose-100', darkBg: 'dark:bg-rose-500/20', text: 'text-rose-700', darkText: 'dark:text-rose-400', icon: Truck },
    VENDOR_REACTIVATED: { bg: 'bg-green-100', darkBg: 'dark:bg-green-500/20', text: 'text-green-700', darkText: 'dark:text-green-400', icon: Truck },
    
    // Transfer
    REQUEST_TRANSFERRED: { bg: 'bg-indigo-100', darkBg: 'dark:bg-indigo-500/20', text: 'text-indigo-700', darkText: 'dark:text-indigo-400', icon: Send },
    
    // Equipment specific
    EQUIPMENT_HOURS_LOGGED: { bg: 'bg-sky-100', darkBg: 'dark:bg-sky-500/20', text: 'text-sky-700', darkText: 'dark:text-sky-400', icon: Clock },
  };

  // Check for exact match first
  if (configs[action]) {
    return configs[action];
  }

  // Fallback to pattern matching
  if (action?.includes('LOGIN')) return { bg: 'bg-blue-100', darkBg: 'dark:bg-blue-500/20', text: 'text-blue-700', darkText: 'dark:text-blue-400', icon: LogIn };
  if (action?.includes('CREATED') || action?.includes('ADDED')) return { bg: 'bg-green-100', darkBg: 'dark:bg-green-500/20', text: 'text-green-700', darkText: 'dark:text-green-400', icon: UserPlus };
  if (action?.includes('APPROVED')) return { bg: 'bg-emerald-100', darkBg: 'dark:bg-emerald-500/20', text: 'text-emerald-700', darkText: 'dark:text-emerald-400', icon: CheckCircle };
  if (action?.includes('REJECTED')) return { bg: 'bg-red-100', darkBg: 'dark:bg-red-500/20', text: 'text-red-700', darkText: 'dark:text-red-400', icon: XCircle };
  if (action?.includes('COMPLETED') || action?.includes('RESOLVED')) return { bg: 'bg-purple-100', darkBg: 'dark:bg-purple-500/20', text: 'text-purple-700', darkText: 'dark:text-purple-400', icon: CheckCircle };
  if (action?.includes('UPDATED') || action?.includes('CHANGED')) return { bg: 'bg-amber-100', darkBg: 'dark:bg-amber-500/20', text: 'text-amber-700', darkText: 'dark:text-amber-400', icon: Edit };
  if (action?.includes('DELETED') || action?.includes('REMOVED') || action?.includes('CANCELLED')) return { bg: 'bg-red-100', darkBg: 'dark:bg-red-500/20', text: 'text-red-700', darkText: 'dark:text-red-400', icon: Trash2 };
  if (action?.includes('ASSIGNED')) return { bg: 'bg-indigo-100', darkBg: 'dark:bg-indigo-500/20', text: 'text-indigo-700', darkText: 'dark:text-indigo-400', icon: UserCheck };
  if (action?.includes('TRANSFER')) return { bg: 'bg-violet-100', darkBg: 'dark:bg-violet-500/20', text: 'text-violet-700', darkText: 'dark:text-violet-400', icon: Send };
  
  return { bg: 'bg-gray-100', darkBg: 'dark:bg-gray-500/20', text: 'text-gray-600', darkText: 'dark:text-gray-400', icon: FileText };
};

// Format user display name
export const formatUserDisplay = (log) => {
  // If we have entity_name for login actions, use it (it contains "First Last")
  if (log.action === 'LOGIN' && log.entity_name && !log.entity_name.includes('undefined')) {
    return log.entity_name;
  }
  // Otherwise use email
  return log.user_email || 'System';
};

// Format role for display
export const formatRole = (role) => {
  if (!role) return '';
  return role.replace(/_/g, ' ');
};
