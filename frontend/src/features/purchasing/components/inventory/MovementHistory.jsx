import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle, RotateCcw, Settings } from 'lucide-react';

const MOVEMENT_ICONS = {
  IN: { icon: ArrowUpCircle, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/20' },
  OUT: { icon: ArrowDownCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/20' },
  RETURN: { icon: RotateCcw, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/20' },
  ADJUSTMENT: { icon: Settings, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/20' },
  DISBURSE: { icon: Settings, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/20' },
  WRITE_OFF: { icon: ArrowDownCircle, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-500/20' }
};

const MovementItem = memo(({ movement }) => {
  const config = MOVEMENT_ICONS[movement.movement_type] || MOVEMENT_ICONS.ADJUSTMENT;
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div className={`p-2 rounded-lg ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary dark:text-dark-text">
            {movement.movement_type === 'IN' || movement.movement_type === 'RETURN' ? '+' : '-'}{movement.quantity}
          </span>
          <span className="text-xs text-text-muted dark:text-dark-muted uppercase">
            {movement.movement_type.replace(/_/g, ' ')}
          </span>
        </div>
        
        {movement.notes && (
          <p className="text-sm text-text-secondary dark:text-dark-muted mt-0.5 truncate">{movement.notes}</p>
        )}
        
        <p className="text-xs text-text-muted dark:text-dark-muted mt-1">
          {movement.performed_by_name || 'System'} • {' '}
          {formatDistanceToNow(new Date(movement.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
});

MovementItem.displayName = 'MovementItem';

export const MovementHistory = memo(({ movements, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-dark-card rounded-lg" />
        ))}
      </div>
    );
  }

  if (!movements?.length) {
    return (
      <div className="text-center py-6 text-text-muted dark:text-dark-muted">
        No stock movements recorded
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto">
      {movements.map((movement) => (
        <MovementItem key={movement.id} movement={movement} />
      ))}
    </div>
  );
});

MovementHistory.displayName = 'MovementHistory';
