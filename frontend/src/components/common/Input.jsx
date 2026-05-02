import { forwardRef } from 'react';
import { cn } from '@/utils/helpers';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  containerClassName,
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted dark:text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5 min-h-[44px] border rounded-xl transition-all duration-200',
            'bg-white dark:bg-[#1a1f26]',
            'text-text-primary dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'placeholder:text-text-muted dark:placeholder:text-gray-500',
            error ? 'border-error focus:ring-error' : 'border-gray-300 dark:border-white/10',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            props.disabled && 'bg-gray-50 dark:bg-[#0f1419] cursor-not-allowed opacity-60',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted dark:text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={cn('mt-1.5 text-sm', error ? 'text-error' : 'text-text-secondary dark:text-gray-400')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
