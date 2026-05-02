/**
 * MaintenanceStatusTabs Component
 * Tab navigation for maintenance status filtering - styled like Damaged/Missing page
 */

import { cn } from '@/utils/helpers';

const STATUSES = [
  { value: '', label: 'All', countKey: null },
  { value: 'Scheduled', label: 'Scheduled', countKey: 'scheduled' },
  { value: 'In_Progress', label: 'In Progress', countKey: 'in_progress' },
  { value: 'Overdue', label: 'Overdue', countKey: 'overdue' },
  { value: 'Completed', label: 'Completed', countKey: 'completed' },
  { value: 'Cancelled', label: 'Cancelled', countKey: 'cancelled' }
];

const MaintenanceStatusTabs = ({ activeStatus, onStatusChange, counts = {} }) => {
  return (
    <div className="flex gap-1 mb-5 overflow-x-auto border-b border-gray-200 dark:border-white/10">
      {STATUSES.map(({ value, label, countKey }) => {
        const isActive = activeStatus === value;
        const count = countKey ? counts[countKey] : null;
        
        return (
          <button
            key={value}
            onClick={() => onStatusChange(value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
              isActive
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            {label}
            {count !== undefined && count !== null && (
              <span className={cn(
                'px-1.5 py-0.5 text-xs rounded-full min-w-[20px] text-center',
                isActive
                  ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default MaintenanceStatusTabs;
