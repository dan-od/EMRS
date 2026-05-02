import { cn } from '@/utils/helpers';

export const Card = ({ children, className, hoverable = false, padding = 'md', ...props }) => {
  const paddingSizes = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-[#1a1f26] rounded-xl',
        'border border-gray-100 dark:border-white/10',
        paddingSizes[padding],
        hoverable && 'hover:bg-gray-50 dark:hover:bg-[#242b33] transition-colors duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-white/10', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('text-base font-semibold text-text-primary dark:text-white', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className, ...props }) => (
  <p className={cn('text-sm text-text-secondary dark:text-gray-400', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={cn(className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('mt-3 pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-2', className)} {...props}>
    {children}
  </div>
);
