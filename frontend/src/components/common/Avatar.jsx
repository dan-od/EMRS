import { cn } from '@/utils/helpers';
import { getInitials } from '@/utils/helpers';

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

export const Avatar = ({ 
  src, 
  alt = '', 
  name = '', 
  size = 'md',
  className,
  ...props 
}) => {
  const initials = getInitials(name || alt);

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={cn(
          'rounded-full object-cover',
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium',
        'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
        sizes[size],
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
};

export const AvatarGroup = ({ children, max = 4, size = 'md', className }) => {
  const childArray = Array.isArray(children) ? children : [children];
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((child, index) => (
        <div key={index} className="ring-2 ring-white dark:ring-dark-bg rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-medium ring-2 ring-white dark:ring-dark-bg',
            'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-300',
            sizes[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
