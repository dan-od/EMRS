/**
 * InventoryDropdownParts - Sub-components for inventory dropdown
 */

import { forwardRef } from 'react';
import { Search, ChevronDown, ChevronRight, Package } from 'lucide-react';

// Trigger button component
export const TriggerButton = forwardRef(({ isOpen, onClick, selectedId, selectedItem }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    className={`w-full px-3 py-2 text-left border rounded-lg text-sm flex items-center justify-between
      ${selectedId && selectedId !== 'skip' ? 'border-green-300 dark:border-green-500/40 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 bg-white dark:bg-dark-surface dark:border-dark-border'}
      ${selectedId === 'skip' ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-dark-card' : ''}
      hover:border-primary-300 dark:hover:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500`}
  >
    <span className={`truncate ${selectedId && selectedId !== 'skip' ? 'text-green-700 dark:text-green-400' : selectedId === 'skip' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-dark-muted'}`}>
      {selectedId === 'skip' ? '⊕ Skipped' : selectedItem ? `${selectedItem.name} (${selectedItem.quantity})` : 'Select inventory item...'}
    </span>
    <ChevronDown className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
  </button>
));

TriggerButton.displayName = 'TriggerButton';

// Search input component
export const SearchInput = ({ value, onChange }) => (
  <div className="p-2 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search inventory..."
        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-card dark:text-dark-text dark:placeholder-gray-500"
        autoFocus
      />
    </div>
  </div>
);

// Category section component
export const CategorySection = ({ category, items, isExpanded, onToggle, selectedId, onSelect }) => {
  if (items.length === 0) return null;
  
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-3 py-2 flex items-center gap-2 bg-gray-50 dark:bg-dark-card text-xs font-semibold text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border border-b border-gray-100 dark:border-dark-border"
      >
        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <span>{category.replace(/_/g, ' ')}</span>
        <span className="text-gray-400 dark:text-dark-muted font-normal">({items.length})</span>
      </button>
      {isExpanded && <CategoryItems items={items} selectedId={selectedId} onSelect={onSelect} />}
    </div>
  );
};

// Category items list
const CategoryItems = ({ items, selectedId, onSelect }) => (
  <div className="bg-white dark:bg-dark-surface">
    {items.map(item => (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelect(item)}
        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-primary-50 dark:hover:bg-primary-500/20 border-b border-gray-50 dark:border-dark-border
          ${selectedId === item.id ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-dark-text'}`}
      >
        <span className="truncate">{item.name}</span>
        <span className={`text-xs flex-shrink-0 ml-2 ${item.quantity <= 5 ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-dark-muted'}`}>
          {item.quantity} {item.quantity <= 5 && '⚠️'}
        </span>
      </button>
    ))}
  </div>
);

// Skip option component
export const SkipOption = ({ selectedId, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect({ id: 'skip', name: 'Skip' })}
    className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-dark-border border-t border-gray-200 dark:border-dark-border flex items-center gap-2
      ${selectedId === 'skip' ? 'bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-dark-text' : 'text-gray-500 dark:text-dark-muted'}`}
  >
    <Package className="w-4 h-4" />
    <span>Skip (not in inventory)</span>
  </button>
);
