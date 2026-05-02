import { useUIStore } from '@/store/uiStore';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/utils/helpers';

const TOAST_ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info
};

const TOAST_STYLES = {
  success: 'bg-success text-white',
  warning: 'bg-warning-500 text-white',
  error: 'bg-error text-white',
  info: 'bg-info text-white'
};

export const Toast = ({ notification }) => {
  const { removeNotification } = useUIStore();
  const Icon = TOAST_ICONS[notification.type] || Info;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md',
        TOAST_STYLES[notification.type] || TOAST_STYLES.info
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm">{notification.message}</p>
      <button
        onClick={() => removeNotification(notification.id)}
        className="p-1 hover:bg-white/20 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { notifications } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default ToastContainer;
