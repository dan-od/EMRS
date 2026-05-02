/**
 * ItemStatusBadge - Status indicator for disbursement items
 */

import { Check, Clock, PauseCircle, X } from 'lucide-react';

const ItemStatusBadge = ({ status, approvalStatus }) => {
  if (status === 'disbursed') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
        <Check className="w-3 h-3" /> Disbursed
      </span>
    );
  }
  if (status === 'on_hold') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
        <PauseCircle className="w-3 h-3" /> On Hold
      </span>
    );
  }
  if (approvalStatus === 'approved') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
        <Check className="w-3 h-3" /> Approved
      </span>
    );
  }
  if (approvalStatus === 'rejected') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
        <X className="w-3 h-3" /> Rejected
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-muted text-xs font-medium rounded-full">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
};

export default ItemStatusBadge;
