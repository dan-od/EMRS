import { memo } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

export const LowStockAlert = memo(({ items, onViewAll }) => {
  if (!items?.length) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300">Low Stock Alert</h3>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            {items.length} item{items.length > 1 ? 's' : ''} below reorder level
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {items.slice(0, 5).map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs rounded-full"
              >
                {item.name}: {item.quantity} {item.unit}
              </span>
            ))}
            {items.length > 5 && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                +{items.length - 5} more
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

LowStockAlert.displayName = 'LowStockAlert';
