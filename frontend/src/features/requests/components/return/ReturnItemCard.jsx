/**
 * ReturnItemCard - Individual item card for return condition reporting
 */

import { Package, CheckCircle } from 'lucide-react';
import { CONDITION_OPTIONS } from '@/components/common/ConditionSelector';

const ReturnItemCard = ({ item, index, onConditionChange, onNotesChange }) => {
  const isBadCondition = item.condition === 'Damaged' || item.condition === 'Lost';

  return (
    <div 
      className={`p-3 rounded-lg border ${
        item.condition === 'Damaged' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
        item.condition === 'Lost' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
        'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border'
      }`}
    >
      {/* Item Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="font-medium text-text-primary dark:text-dark-text">{item.name}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({item.quantity} {item.unit})
          </span>
        </div>
      </div>
      
      {/* Condition Selector */}
      <div className="flex flex-wrap gap-2 mb-2">
        {CONDITION_OPTIONS.map(opt => (
          <label 
            key={opt.value}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer border transition-all
              ${item.condition === opt.value 
                ? `${opt.bg} ${opt.border} ${opt.color} ring-2 ring-offset-1 ring-current` 
                : 'bg-gray-50 dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card'}`}
          >
            <input
              type="radio"
              name={`condition-${index}`}
              value={opt.value}
              checked={item.condition === opt.value}
              onChange={() => onConditionChange(index, opt.value)}
              className="sr-only"
            />
            {item.condition === opt.value && <CheckCircle className="w-3.5 h-3.5" />}
            <span className="text-sm font-medium">{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Notes for Damaged/Lost items */}
      {isBadCondition && (
        <input
          type="text"
          value={item.notes}
          onChange={(e) => onNotesChange(index, e.target.value)}
          placeholder={item.condition === 'Lost' 
            ? "What happened? (required)" 
            : "Describe the damage (required)"}
          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text focus:ring-2 focus:ring-primary-500
            ${!item.notes.trim() ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-dark-border'}`}
        />
      )}
    </div>
  );
};

export default ReturnItemCard;
