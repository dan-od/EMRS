/**
 * VehicleFilters - Filter bar for vehicles page
 */
import { Button, Input, Select } from '@/components/common';
import { Search, RefreshCw, Plus } from 'lucide-react';
import { VEHICLE_TYPES, STATUS_OPTIONS } from '../../constants/vehicleConstants';

const VehicleFilters = ({ filters, setFilters, onRefresh, onAddNew }) => {
  return (
    <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-white/10 mb-6">
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
        <div className="flex-1 min-w-0 sm:min-w-[200px]">
          <Input
            placeholder="Search plate, make, model..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="grid grid-cols-2 sm:flex gap-3">
          <Select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            options={VEHICLE_TYPES}
          />
          <Select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setFilters({ search: '', type: '', status: '' })}>
            Clear
          </Button>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="primary" onClick={onAddNew} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-1" /> Add Vehicle
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VehicleFilters;
