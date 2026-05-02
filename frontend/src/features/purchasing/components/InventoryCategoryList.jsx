/**
 * InventoryCategoryList - Category list with expandable items
 */

import { ChevronDown, ChevronRight, Package } from 'lucide-react';

// Category header
export const CategoryHeader = ({ category, count, isExpanded, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full px-3 py-2 flex items-center gap-2 bg-gray-50 dark:bg-dark-card text-xs font-semibold text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border border-b border-gray-100 dark:border-dark-border"
  >
    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
    <span>{category.replace(/_/g, ' ')}</span>
    <span className="text-gray-400 dark:text-dark-muted font-normal">({count})</span>
  </button>
);

// Single inventory item
export const InventoryItem = ({ item, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(item)}
    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-primary-50 dark:hover:bg-primary-500/20 border-b border-gray-50 dark:border-dark-border
      ${isSelected ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-dark-text'}`}
  >
    <span className="truncate">{item.name}</span>
    <span className={`text-xs flex-shrink-0 ml-2 ${item.quantity <= 5 ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-dark-muted'}`}>
      {item.quantity} {item.quantity <= 5 && '⚠️'}
    </span>
  </button>
);

// Skip option at bottom
export const SkipOption = ({ isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect({ id: 'skip', name: 'Skip' })}
    className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-dark-border border-t border-gray-200 dark:border-dark-border flex items-center gap-2
      ${isSelected ? 'bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-dark-text' : 'text-gray-500 dark:text-dark-muted'}`}
  >
    <Package className="w-4 h-4" />
    <span>Skip (not in inventory)</span>
  </button>
);

// Category with items
export const CategorySection = ({ category, items, isExpanded, onToggle, selectedId, onSelect }) => (
  <div>
    <CategoryHeader
      category={category}
      count={items.length}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
    {isExpanded && (
      <div className="bg-white dark:bg-dark-surface">
        {items.map(item => (
          <InventoryItem
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    )}
  </div>
);
