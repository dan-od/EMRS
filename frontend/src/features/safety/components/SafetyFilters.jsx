import { Select, Input } from '@/components/common';
import { SAFETY_REPORT_TYPES, SAFETY_STATUS, SEVERITY } from '@/utils/constants';
import { Search } from 'lucide-react';

export const SafetyFilters = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search reports..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>
      <Select
        value={filters.type || ''}
        onChange={(e) => handleChange('type', e.target.value)}
        className="w-full sm:w-40"
      >
        <option value="">All Types</option>
        {Object.entries(SAFETY_REPORT_TYPES).map(([key, value]) => (
          <option key={key} value={value}>{value.replace('_', ' ')}</option>
        ))}
      </Select>
      <Select
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
        className="w-full sm:w-40"
      >
        <option value="">All Status</option>
        {Object.entries(SAFETY_STATUS).map(([key, value]) => (
          <option key={key} value={value}>{value}</option>
        ))}
      </Select>
      <Select
        value={filters.severity || ''}
        onChange={(e) => handleChange('severity', e.target.value)}
        className="w-full sm:w-40"
      >
        <option value="">All Severity</option>
        {Object.entries(SEVERITY).map(([key, value]) => (
          <option key={key} value={value}>{value}</option>
        ))}
      </Select>
    </div>
  );
};
