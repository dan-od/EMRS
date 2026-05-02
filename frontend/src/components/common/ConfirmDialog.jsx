import { useUIStore } from '@/store/uiStore';
import { cn } from '@/utils/helpers';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = () => {
  const { confirmDialog, hideConfirm } = useUIStore();

  if (!confirmDialog) return null;

  const { title, message, confirmText = 'Confirm', variant = 'danger', onConfirm } = confirmDialog;

  const handleConfirm = async () => {
    await onConfirm?.();
    hideConfirm();
  };

  const variantStyles = {
    danger: 'bg-error hover:bg-red-600 text-white',
    success: 'bg-success hover:bg-green-600 text-white',
    warning: 'bg-warning hover:bg-yellow-600 text-white',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={hideConfirm} />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-dark-border dark:bg-dark-surface animate-slideUp">
        <button
          onClick={hideConfirm}
          className="absolute right-4 top-4 p-1 rounded text-text-muted hover:text-text-primary hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            variant === 'danger' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
          )}>
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text">
              {title}
            </h3>
            <p className="mt-2 text-sm text-text-secondary dark:text-dark-muted">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={hideConfirm}
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-all active:scale-95',
              variantStyles[variant] || variantStyles.danger
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
