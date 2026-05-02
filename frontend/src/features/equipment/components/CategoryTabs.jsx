/**
 * CategoryTabs - Filter between All, Tools, and Equipment
 */
import { memo } from 'react';
import { cn } from '@/utils/helpers';
import { Package, Wrench, Layers } from 'lucide-react';

const TABS = [
  { key: '', label: 'All', icon: Layers },
  { key: 'EQUIPMENT', label: 'Equipment', icon: Package },
  { key: 'TOOL', label: 'Tools', icon: Wrench }
];

export const CategoryTabs = memo(({ value, onChange, counts = {} }) => {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-card rounded-lg w-full sm:w-fit mb-4 overflow-x-auto">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = value === key;
        const count = key === '' ? counts.total : counts[key.toLowerCase()];
        
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              isActive
                ? 'bg-white dark:bg-dark-surface text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-text-secondary dark:text-dark-muted hover:text-text-primary dark:hover:text-dark-text'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {count !== undefined && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-xs',
                isActive 
                  ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-200 dark:bg-dark-border text-text-muted dark:text-dark-muted'
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

CategoryTabs.displayName = 'CategoryTabs';
