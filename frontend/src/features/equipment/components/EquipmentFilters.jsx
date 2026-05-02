/**
 * EquipmentFilters - Updated with Type filter
 */
import { Input, Select } from '@/components/common';
import { EQUIPMENT_STATUS_LIST, DEPARTMENTS_LIST } from '@/utils/equipmentConstants';
import { Search, X } from 'lucide-react';

export const EquipmentFilters = ({ filters, onChange, onClear, types = [] }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const hasFilters = filters.search || filters.status || filters.type || filters.department;

  return (
    <div className="bg-white/95 dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl border border-gray-200/60 dark:border-white/10 p-3 mb-4">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search equipment..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-36"
          >
            <option value="">All Status</option>
            {EQUIPMENT_STATUS_LIST.map((status) => (
              <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
            ))}
          </Select>

          {types.length > 0 && (
            <Select
              value={filters.type || ''}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-44"
            >
              <option value="">All Types</option>
              {types.map((t) => (
                <option key={t.name} value={t.name}>{t.displayName}</option>
              ))}
            </Select>
          )}

          <Select
            value={filters.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-44"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS_LIST.map((d) => (
              <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
            ))}
          </Select>

          {hasFilters && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-2 py-1.5 text-sm text-text-secondary dark:text-dark-muted hover:text-text-primary dark:hover:text-dark-text transition-colors"
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
