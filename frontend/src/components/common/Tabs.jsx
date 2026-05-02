/**
 * Tabs Component
 * Reusable tab navigation with dark mode support
 */

import { cn } from '@/utils/helpers';

export const Tabs = ({ children, className }) => (
  <div className={cn('w-full', className)}>
    {children}
  </div>
);

export const TabList = ({ children, className }) => (
  <div className={cn(
    'flex border-b border-gray-200 dark:border-gray-700',
    className
  )}>
    {children}
  </div>
);

export const Tab = ({ 
  children, 
  active = false, 
  onClick, 
  icon: Icon,
  count,
  className 
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
      'border-b-2 -mb-px',
      active 
        ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
      className
    )}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
    {count !== undefined && (
      <span className={cn(
        'px-2 py-0.5 text-xs rounded-full',
        active 
          ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      )}>
        {count}
      </span>
    )}
  </button>
);

export const TabPanel = ({ children, active = false, className }) => {
  if (!active) return null;
  return (
    <div className={cn('py-4', className)}>
      {children}
    </div>
  );
};
