import { Fragment, useEffect } from 'react';
import { cn } from '@/utils/helpers';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  className
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <Fragment>
      {/* Backdrop - iOS blur style */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Modal - iOS glass style */}
      <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            role="dialog"
            className={cn(
              'relative w-full shadow-xl',
              'bg-white dark:bg-[#1a1f26]',
              'border border-gray-200/60 dark:border-white/10',
              'rounded-t-2xl sm:rounded-2xl',
              'max-h-[85vh] overflow-y-auto overflow-x-hidden',
              'safe-bottom',
              'touch-pan-y overscroll-x-none',
              'animate-sheet sm:animate-slideUp',
              sizes[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-white/10">
                <div>
                  {title && <h2 className="text-base font-semibold text-text-primary dark:text-white">{title}</h2>}
                  {description && <p className="mt-0.5 text-sm text-text-secondary dark:text-gray-400">{description}</p>}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-text-muted dark:text-gray-400 hover:text-text-primary dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="p-5">{children}</div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export const ModalFooter = ({ children, className }) => (
  <div className={cn('flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-white/10', className)}>
    {children}
  </div>
);
