/**
 * JobFilters Component
 * Filter controls for job list
 */
import { memo } from 'react';
import { Input, Select } from '@/components/common';
import { Search, Filter } from 'lucide-react';
import { JOB_STATUS, PRIORITY } from '@/utils/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  ...Object.entries(JOB_STATUS).map(([key, value]) => ({
    value: value,
    label: value.replace(/_/g, ' ')
  }))
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  ...Object.entries(PRIORITY).map(([key, value]) => ({
    value: value,
    label: value
  }))
];

export const JobFilters = memo(({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-[#1a1f26] rounded-lg border border-border-light dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-text-muted" />
        <span className="text-sm font-medium text-text-primary">Filters</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          placeholder="Search client or location..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
        
        <Select
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          options={STATUS_OPTIONS}
        />
        
        <Select
          value={filters.priority || ''}
          onChange={(e) => handleChange('priority', e.target.value)}
          options={PRIORITY_OPTIONS}
        />
        
        <Input
          type="date"
          placeholder="Start date from"
          value={filters.startDate || ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
        />
      </div>
    </div>
  );
});

JobFilters.displayName = 'JobFilters';
export default JobFilters;
