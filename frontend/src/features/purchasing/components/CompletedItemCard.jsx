/**
 * CompletedItemCard - Display card for already processed items
 * Shows disbursed, on-hold, or rejected items
 */

import { Check, PauseCircle, X } from 'lucide-react';
import ItemStatusBadge from './ItemStatusBadge';

// Disbursed item
export const DisbursedItemCard = ({ item, itemName }) => (
  <div className="border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 rounded-xl p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-medium text-green-800 dark:text-green-300">{itemName}</p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Disbursed on {item.disbursed_at ? new Date(item.disbursed_at).toLocaleDateString() : 'N/A'}
            {item.disbursed_by_name && ` by ${item.disbursed_by_name}`}
          </p>
        </div>
      </div>
      <ItemStatusBadge status="disbursed" />
    </div>
    {item.return_date && (
      <p className="text-sm text-green-700 dark:text-green-400 mt-2 ml-12">
        Return by: {new Date(item.return_date).toLocaleDateString()}
      </p>
    )}
  </div>
);

// On hold item
export const OnHoldItemCard = ({ item, itemName }) => (
  <div className="border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
          <PauseCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="font-medium text-amber-800 dark:text-amber-300">{itemName}</p>
          <p className="text-sm text-amber-600 dark:text-amber-400">{item.hold_reason || 'On hold'}</p>
        </div>
      </div>
      <ItemStatusBadge status="on_hold" />
    </div>
  </div>
);

// Rejected item
export const RejectedItemCard = ({ itemName }) => (
  <div className="border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 rounded-xl p-4 opacity-60">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
          <X className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="font-medium text-red-800 dark:text-red-300 line-through">{itemName}</p>
          <p className="text-sm text-red-600 dark:text-red-400">Rejected by manager</p>
        </div>
      </div>
      <ItemStatusBadge approvalStatus="rejected" />
    </div>
  </div>
);
