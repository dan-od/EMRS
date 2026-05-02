import { cn } from '@/utils/helpers';

const variants = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300',
  secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm'
};

export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  dot = false,
  className,
  ...props 
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'error' && 'bg-red-500',
          variant === 'info' && 'bg-blue-500',
          variant === 'primary' && 'bg-primary-500',
          variant === 'default' && 'bg-gray-500'
        )} />
      )}
      {children}
    </span>
  );
};

// Preset badges for common use cases
export const StatusBadge = ({ status, className }) => {
  const statusVariants = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    completed: 'success',
    transferred: 'info',
    draft: 'default',
    in_progress: 'info',
    operational: 'success',
    maintenance: 'warning',
    retired: 'default'
  };

  const variant = statusVariants[status?.toLowerCase()] || 'default';
  const label = status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return <Badge variant={variant} dot className={className}>{label}</Badge>;
};

export const PriorityBadge = ({ priority, className }) => {
  const priorityVariants = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    urgent: 'error'
  };

  const variant = priorityVariants[priority?.toLowerCase()] || 'default';

  return <Badge variant={variant} className={className}>{priority}</Badge>;
};
