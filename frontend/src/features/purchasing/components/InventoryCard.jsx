import { memo } from 'react';
import { Card, CardContent, Badge } from '@/components/common';
import { Package, AlertTriangle } from 'lucide-react';

export const InventoryCard = memo(({ item, onClick }) => {
  const isLowStock = item.quantity <= item.reorder_level;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(item)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${isLowStock ? 'bg-warning-50 dark:bg-amber-900/20' : 'bg-primary-50 dark:bg-primary-900/20'}`}>
            {isLowStock ? (
              <AlertTriangle className="w-5 h-5 text-warning-500" />
            ) : (
              <Package className="w-5 h-5 text-primary-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-text-primary dark:text-dark-text truncate">{item.name}</h3>
              {isLowStock && (
                <Badge variant="warning" size="sm">Low Stock</Badge>
              )}
            </div>
            <p className="text-sm text-text-muted dark:text-dark-muted mt-1">{item.category}</p>
            <p className="text-xs text-text-muted dark:text-dark-muted">{item.sku}</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-text-primary dark:text-dark-text">{item.quantity}</p>
            <p className="text-xs text-text-muted dark:text-dark-muted">{item.unit}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

InventoryCard.displayName = 'InventoryCard';
