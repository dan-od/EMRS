import { cn } from '@/utils/helpers';

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  subtitle,
  color = 'primary',
  onClick,
  className 
}) => {
  // iOS-style subtle colors for dark mode
  const colors = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400',
    success: 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    warning: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
    error: 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    info: 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
  };

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-500 dark:text-gray-400'
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-dark-surface/80 rounded-xl p-4 transition-all duration-200',
        'border border-gray-100 dark:border-white/10',
        'backdrop-blur-sm',
        onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-card',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text-secondary dark:text-dark-muted">{title}</p>
          <p className="text-xl font-bold text-text-primary dark:text-dark-text mt-0.5">{value}</p>
          {subtitle && (
            <p className="text-xs text-text-muted dark:text-dark-muted mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <p className={cn('text-xs mt-0.5', trendColors[trend])}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-xl', colors[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
