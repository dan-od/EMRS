/**
 * ActivityLogItem Component
 * Displays a single activity log entry
 */

import { useState } from 'react';
import { getActionConfig, formatUserDisplay, formatRole } from './activityHelpers';

const ActivityLogItem = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const actionConfig = getActionConfig(log.action);
  const ActionIcon = actionConfig.icon;
  const hasDetails = log.details && Object.keys(log.details).length > 0;

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${actionConfig.bg} ${actionConfig.darkBg || ''} flex items-center justify-center`}>
            <ActionIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${actionConfig.text} ${actionConfig.darkText || ''}`} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* User Name/Email */}
            <span className="font-medium text-text-primary dark:text-dark-text text-sm sm:text-base">
              {formatUserDisplay(log)}
            </span>

            {/* Action Badge */}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionConfig.bg} ${actionConfig.darkBg || ''} ${actionConfig.text} ${actionConfig.darkText || ''}`}>
              {log.action?.replace(/_/g, ' ')}
            </span>
          </div>

          {/* User Role & Department */}
          {(log.user_role || log.department) && (
            <p className="text-sm text-text-muted dark:text-dark-muted mt-0.5">
              {formatRole(log.user_role)}
              {log.user_role && log.department && ' \u2022 '}
              {log.department?.replace(/_/g, ' ')}
            </p>
          )}

          {/* Entity Name (Target) */}
          {log.entity_name && log.entity_name !== 'undefined undefined' && log.action !== 'LOGIN' && (
            <p className="text-sm text-text-secondary dark:text-dark-muted mt-1">
              <span className="text-text-muted dark:text-dark-muted">Target:</span> {log.entity_name}
            </p>
          )}

          {/* Timestamp - shown inline on mobile */}
          <p className="text-xs text-text-muted dark:text-dark-muted mt-1 sm:hidden">
            {new Date(log.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}{' '}
            {new Date(log.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>

          {/* Expandable Details */}
          {hasDetails && (
            <div className="mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer flex items-center gap-1"
              >
                <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>&#9654;</span>
                View details
              </button>
              {isExpanded && (
                <pre className="mt-2 text-xs bg-gray-50 dark:bg-dark-card p-3 rounded-lg overflow-x-auto border border-gray-200 dark:border-white/10 text-gray-700 dark:text-dark-muted">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Timestamp - hidden on mobile, shown on sm+ */}
        <div className="hidden sm:block flex-shrink-0 text-right">
          <p className="text-sm text-text-secondary dark:text-dark-muted">
            {new Date(log.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          <p className="text-xs text-text-muted dark:text-dark-muted">
            {new Date(log.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogItem;
