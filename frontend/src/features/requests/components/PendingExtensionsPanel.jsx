/**
 * PendingExtensionsPanel - Shows pending extension requests
 * Used by both Manager and Purchasing dashboards
 */

import { useState } from 'react';
import { Clock, Calendar, User, Check, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/common';
import { formatDate } from '@/utils/formatters';

const ExtensionCard = ({ extension, role, onApprove, onReject, isLoading }) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      await onApprove(extension.id, notes);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading('reject');
    try {
      await onReject(extension.id, notes);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-dark-text">
                {extension.request_type} - Extension Request
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-muted">
                <User className="w-3.5 h-3.5" />
                <span>{extension.requester_name}</span>
                <span>•</span>
                <span>{extension.requester_department}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-dark-muted">Current → Requested</p>
              <p className="text-sm font-medium">
                <span className="text-gray-600 dark:text-dark-muted">{formatDate(extension.current_return_date)}</span>
                <span className="mx-1 dark:text-dark-muted">→</span>
                <span className="text-purple-600 dark:text-purple-400">{formatDate(extension.requested_return_date)}</span>
              </p>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400 dark:text-dark-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 dark:text-dark-muted" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-white/10 pt-4">
          {/* Reason */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 dark:text-dark-muted mb-1">Reason for Extension</label>
            <p className="text-sm text-gray-800 dark:text-dark-text bg-gray-50 dark:bg-dark-card/50 rounded-lg p-3 border border-gray-100 dark:border-white/5">
              {extension.reason || 'No reason provided'}
            </p>
          </div>

          {/* Manager approval info (for Purchasing view) */}
          {role === 'purchasing' && extension.manager_approved_by_name && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-500/15 border border-green-200 dark:border-green-500/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-400">
                <strong>✓ Manager Approved:</strong> {extension.manager_approved_by_name}
                {extension.manager_notes && (
                  <span className="block text-xs mt-1">Notes: {extension.manager_notes}</span>
                )}
              </p>
            </div>
          )}

          {/* Notes input */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 dark:text-dark-muted mb-1">
              Your Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text placeholder-text-muted dark:placeholder-dark-muted focus:ring-2 focus:ring-primary-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReject();
              }}
              disabled={isLoading || actionLoading}
            >
              {actionLoading === 'reject' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-1" />
              )}
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleApprove();
              }}
              disabled={isLoading || actionLoading}
            >
              {actionLoading === 'approve' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              Approve
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const PendingExtensionsPanel = ({ 
  extensions = [], 
  isLoading, 
  role = 'manager', // 'manager' or 'purchasing'
  onApprove,
  onReject,
  onRefresh
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }

  if (extensions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-dark-card/50 rounded-xl border border-gray-100 dark:border-white/10">
        <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-dark-muted" />
        <p className="text-gray-500 dark:text-dark-muted">No pending extension requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {extensions.map((extension) => (
        <ExtensionCard
          key={extension.id}
          extension={extension}
          role={role}
          onApprove={onApprove}
          onReject={onReject}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default PendingExtensionsPanel;
