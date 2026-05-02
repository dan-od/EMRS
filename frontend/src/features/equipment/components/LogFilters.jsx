/**
 * LogFilters Component
 * Filters for equipment logs
 */

import { Filter, X } from 'lucide-react';

const GENERAL_LOG_TYPES = [
  { value: 'Transport', label: 'Transport' },
  { value: 'Disbursed', label: 'Disbursed' },
  { value: 'Returned', label: 'Returned' },
  { value: 'Assignment', label: 'Assignment' },
  { value: 'Location_Change', label: 'Location Change' },
  { value: 'Request_Approved', label: 'Request Approved' },
  { value: 'Note', label: 'Note' },
  { value: 'Other', label: 'Other' }
];

const MAINTENANCE_LOG_TYPES = [
  { value: 'Routine_Service', label: 'Routine Service' },
  { value: 'Repair', label: 'Repair' },
  { value: 'Inspection', label: 'Inspection' },
  { value: 'Calibration', label: 'Calibration' },
  { value: 'Parts_Replaced', label: 'Parts Replaced' },
  { value: 'Note', label: 'Note' },
  { value: 'Other', label: 'Other' }
];

const LogFilters = ({ filters, onChange, logType = 'general' }) => {
  const types = logType === 'general' ? GENERAL_LOG_TYPES : MAINTENANCE_LOG_TYPES;

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => onChange({});
  const hasFilters = filters.type || filters.startDate || filters.endDate;

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center mb-4">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Filter className="w-4 h-4" />
        <span>Filter:</span>
      </div>

      {/* Type Dropdown */}
      <select
        value={filters.type || ''}
        onChange={(e) => handleChange('type', e.target.value)}
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Types</option>
        {types.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {/* Date Range */}
      <input
        type="date"
        value={filters.startDate || ''}
        onChange={(e) => handleChange('startDate', e.target.value)}
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="From"
      />
      <input
        type="date"
        value={filters.endDate || ''}
        onChange={(e) => handleChange('endDate', e.target.value)}
        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="To"
      />

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
          Clear
        </button>
      )}
    </div>
  );
};

export default LogFilters;
