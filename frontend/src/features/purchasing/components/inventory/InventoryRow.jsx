import { memo } from 'react';
import { Badge } from '@/components/common';
import { Package, AlertTriangle, Edit2, Plus, History } from 'lucide-react';

export const InventoryRow = memo(({ item, onEdit, onAdjustStock, onViewDetails }) => {
  const isLowStock = item.quantity <= item.reorder_level;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
      <td className="px-4 py-3">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onViewDetails?.(item)}
        >
          <div className={`p-2 rounded-lg ${isLowStock ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-primary-50 dark:bg-primary-900/20'}`}>
            {isLowStock ? (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            ) : (
              <Package className="w-4 h-4 text-primary-500" />
            )}
          </div>
          <div>
            <p className="font-medium text-text-primary dark:text-dark-text hover:text-primary-600 transition-colors">{item.name}</p>
            <p className="text-xs text-text-muted dark:text-dark-muted">{item.location || 'No location'}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="secondary" size="sm">{item.category?.replace(/_/g, ' ')}</Badge>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`font-bold text-lg ${isLowStock ? 'text-amber-600' : 'text-text-primary dark:text-dark-text'}`}>
          {item.quantity}
        </span>
        <span className="text-xs text-text-muted dark:text-dark-muted ml-1">{item.unit}</span>
        {isLowStock && <Badge variant="warning" size="sm" className="ml-2">Low Stock</Badge>}
      </td>
      <td className="px-4 py-3 text-center text-text-secondary dark:text-dark-muted">{item.reorder_level}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onViewDetails?.(item)}
            className="p-1.5 rounded-lg text-info hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors"
            title="View History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAdjustStock(item)}
            className="p-1.5 rounded-lg text-success hover:bg-green-50 dark:hover:bg-green-500/20 transition-colors"
            title="Add Stock"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-text-muted dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            title="Edit Item"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

InventoryRow.displayName = 'InventoryRow';
