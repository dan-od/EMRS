/**
 * MaintenanceFilters Component
 * Filters for maintenance list - styled like Damaged/Missing page
 */

import { Input, Select, Button } from '@/components/common';
import { Search, RefreshCw } from 'lucide-react';

const MAINTENANCE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'Routine_Service', label: 'Routine Service' },
  { value: 'Repair', label: 'Repair' },
  { value: 'Inspection', label: 'Inspection' },
  { value: 'Calibration', label: 'Calibration' },
  { value: 'Overhaul', label: 'Overhaul' },
  { value: 'Emergency', label: 'Emergency' }
];

const PRIORITIES = [
  { value: '', label: 'All Priority' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' }
];

const MaintenanceFilters = ({ filters, onChange, onRefresh }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => onChange({});

  return (
    <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-white/10 mb-5">
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
        {/* Search */}
        <div className="flex-1 min-w-0 sm:min-w-[200px]">
          <Input
            placeholder="Search equipment..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Type Filter */}
        <div className="min-w-0 sm:min-w-[150px]">
          <Select
            label="Type"
            value={filters.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
            options={MAINTENANCE_TYPES}
          />
        </div>

        {/* Priority Filter */}
        <div className="min-w-0 sm:min-w-[140px]">
          <Select
            label="Priority"
            value={filters.priority || ''}
            onChange={(e) => handleChange('priority', e.target.value)}
            options={PRIORITIES}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={clearFilters} className="flex-1 sm:flex-none">
            Clear Filters
          </Button>

          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} className="flex-1 sm:flex-none">
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceFilters;
