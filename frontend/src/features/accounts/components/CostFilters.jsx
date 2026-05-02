/**
 * Cost Filters Component
 * Filters for work order cost data
 */

import { useState } from 'react';
import { Filter, Download, X } from 'lucide-react';
import { DEPARTMENTS } from '@/utils/constants';

const CostFilters = ({ filters, onFilterChange, onExport, exporting }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      dateFrom: '',
      dateTo: '',
      department: '',
      paymentStatus: '',
      minCost: '',
      maxCost: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== undefined);

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg p-4 border border-gray-200 dark:border-dark-border mb-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">From:</span>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">To:</span>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleChange('dateTo', e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
          />
        </div>

        {/* Department */}
        <select
          value={filters.department || ''}
          onChange={(e) => handleChange('department', e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
        >
          <option value="">All Departments</option>
          {Object.values(DEPARTMENTS).map(dept => (
            <option key={dept.id} value={dept.name}>{dept.name}</option>
          ))}
        </select>

        {/* Payment Status */}
        <select
          value={filters.paymentStatus || ''}
          onChange={(e) => handleChange('paymentStatus', e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Pending Payment</option>
        </select>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <Filter size={16} />
          More
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <X size={16} />
            Clear
          </button>
        )}

        {/* Export Button */}
        <button
          onClick={onExport}
          disabled={exporting}
          className="ml-auto flex items-center gap-2 px-4 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          <Download size={16} />
          {exporting ? 'Exporting...' : 'Export'}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Min Cost:</span>
            <input
              type="number"
              value={filters.minCost || ''}
              onChange={(e) => handleChange('minCost', e.target.value)}
              placeholder="₦0"
              className="w-28 px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Max Cost:</span>
            <input
              type="number"
              value={filters.maxCost || ''}
              onChange={(e) => handleChange('maxCost', e.target.value)}
              placeholder="₦∞"
              className="w-28 px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CostFilters;
