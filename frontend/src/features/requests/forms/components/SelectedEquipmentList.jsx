/**
 * SelectedEquipmentList - Display and manage selected equipment items
 */

import { Wrench, Plus, X } from 'lucide-react';

const SelectedEquipmentItem = ({ item, index, onUpdate, onRemove }) => (
  <div 
    className={`flex items-center justify-between p-3 rounded-lg border ${
      item.isNewRequest ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-dark-card border-gray-200 dark:border-dark-border'
    }`}
  >
    <div className="flex items-center gap-3 flex-1">
      <div className={`p-2 rounded-lg ${item.isNewRequest ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-white dark:bg-dark-surface'}`}>
        {item.isNewRequest ? (
          <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        ) : (
          <Wrench className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-gray-900 dark:text-dark-text truncate">{item.name}</p>
          {item.isNewRequest && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">New Request</span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {item.category}
          {item.serialNumber && ` • S/N: ${item.serialNumber}`}
          {item.location && ` • ${item.location}`}
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-2 ml-2">
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">Qty:</label>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
          className="w-16 px-2 py-1 text-sm border border-gray-200 dark:border-dark-border rounded bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const SelectedEquipmentList = ({ items, onUpdate, onRemove }) => {
  if (items.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
        Selected Equipment ({items.length})
      </p>
      {items.map((item, index) => (
        <SelectedEquipmentItem
          key={index}
          item={item}
          index={index}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default SelectedEquipmentList;
