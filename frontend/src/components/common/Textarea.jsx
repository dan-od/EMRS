import { forwardRef } from 'react';
import { cn } from '@/utils/helpers';

export const Textarea = forwardRef(({
  label,
  error,
  helperText,
  rows = 4,
  className,
  containerClassName,
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1.5">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full px-3 py-2.5 min-h-[44px] border rounded-lg transition-all duration-200 resize-none',
          'bg-white dark:bg-dark-surface',
          'text-text-primary dark:text-dark-text',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'placeholder:text-text-muted dark:placeholder:text-dark-muted',
          error ? 'border-error focus:ring-error' : 'border-gray-300 dark:border-dark-border',
          props.disabled && 'bg-gray-50 dark:bg-dark-card cursor-not-allowed',
          className
        )}
        {...props}
      />
      {(error || helperText) && (
        <p className={cn('mt-1.5 text-sm', error ? 'text-error' : 'text-text-secondary dark:text-dark-muted')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
