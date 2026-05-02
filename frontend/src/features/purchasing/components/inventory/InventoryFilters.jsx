import { Input, Select } from '@/components/common';
import { INVENTORY_CATEGORIES } from '@/utils/constants';
import { Search, X } from 'lucide-react';

const CATEGORY_OPTIONS = Object.entries(INVENTORY_CATEGORIES).map(([key, value]) => ({
  value: key,
  label: value.replace(/_/g, ' ')
}));

export const InventoryFilters = ({ filters, onChange, onClear }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const hasFilters = filters.search || filters.category;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search inventory..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex gap-3">
          <Select
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            options={CATEGORY_OPTIONS}
            placeholder="All Categories"
            className="w-44"
          />

          {hasFilters && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-3 py-2 text-sm text-text-secondary dark:text-dark-muted hover:text-text-primary dark:hover:text-dark-text transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
