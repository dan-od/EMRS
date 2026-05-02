import { forwardRef } from 'react';
import { cn } from '@/utils/helpers';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  placeholder = 'Select an option',
  className,
  containerClassName,
  children,
  ...props
}, ref) => {
  // Use children if provided, otherwise use options prop
  const hasChildren = children && (Array.isArray(children) ? children.length > 0 : true);
  
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5 min-h-[44px] pr-10 border rounded-xl appearance-none cursor-pointer',
            'bg-white dark:bg-[#1a1f26]',
            'text-gray-900 dark:text-white',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            error ? 'border-error focus:ring-error' : 'border-gray-300 dark:border-gray-600',
            props.disabled && 'bg-gray-50 dark:bg-[#0f1419] cursor-not-allowed opacity-60',
            className
          )}
          {...props}
        >
          {hasChildren ? (
            // Render children (option elements passed directly)
            children
          ) : (
            // Render from options prop
            <>
              <option value="" disabled>
                {placeholder}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </>
          )}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {(error || helperText) && (
        <p className={cn('mt-1.5 text-sm', error ? 'text-error' : 'text-gray-500 dark:text-gray-400')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
