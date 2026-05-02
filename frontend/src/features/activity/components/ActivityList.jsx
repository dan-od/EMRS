/**
 * ActivityList Component
 * Displays list of activity logs with pagination
 */

import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import ActivityLogItem from './ActivityLogItem';

const ActivityList = ({ logs, pagination, onPageChange, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-white/10 p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          <p className="mt-3 text-text-secondary dark:text-dark-muted">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-white/10 p-8">
        <div className="flex flex-col items-center justify-center text-text-secondary dark:text-dark-muted">
          <Clock className="w-12 h-12 mb-2 opacity-50" />
          <p className="font-medium">No activity found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
      {/* Log Items */}
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {logs.map((log) => (
          <ActivityLogItem key={log.id} log={log} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-dark-card/50">
          <p className="text-sm text-text-secondary dark:text-dark-muted">
            Showing <span className="font-medium text-text-primary dark:text-dark-text">{logs.length}</span> of{' '}
            <span className="font-medium text-text-primary dark:text-dark-text">{pagination.total}</span> entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-secondary dark:text-dark-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-primary-500 text-white'
                        : 'hover:bg-gray-200 dark:hover:bg-white/10 text-text-secondary dark:text-dark-muted'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-secondary dark:text-dark-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityList;
