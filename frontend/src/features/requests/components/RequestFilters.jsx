import { Select, Input } from '@/components/common';
import { REQUEST_TYPES, REQUEST_STATUS, PRIORITY } from '@/utils/constants';
import { Search } from 'lucide-react';

export const RequestFilters = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1 min-w-0">
        <Input
          placeholder="Search requests..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>
      <Select
        value={filters.type || ''}
        onChange={(e) => handleChange('type', e.target.value)}
        className="w-40"
      >
        <option value="">All Types</option>
        {Object.entries(REQUEST_TYPES).map(([key, value]) => (
          <option key={key} value={value}>{value}</option>
        ))}
      </Select>
      <Select
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
        className="w-40"
      >
        <option value="">All Status</option>
        {Object.entries(REQUEST_STATUS).map(([key, value]) => (
          <option key={key} value={value}>{value.replace('_', ' ')}</option>
        ))}
      </Select>
      <Select
        value={filters.priority || ''}
        onChange={(e) => handleChange('priority', e.target.value)}
        className="w-40"
      >
        <option value="">All Priority</option>
        {Object.entries(PRIORITY).map(([key, value]) => (
          <option key={key} value={value}>{value}</option>
        ))}
      </Select>
    </div>
  );
};
