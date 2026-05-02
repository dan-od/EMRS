/**
 * VehicleSelector - Vehicle dropdown for maintenance form
 */
import { Loader2 } from 'lucide-react';

const VehicleSelector = ({ value, onChange, vehicles, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-text-secondary dark:text-dark-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading vehicles...
      </div>
    );
  }

  if (vehicles.length === 0) {
    return <p className="text-text-secondary dark:text-dark-muted text-sm">No vehicles available</p>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Select Vehicle <span className="text-red-500">*</span>
      </label>
      <select
        name="vehicleId"
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-[#1a1f26] text-gray-700 dark:text-gray-300 ${
          error ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
        }`}
      >
        <option value="">Select vehicle...</option>
        {vehicles.map(v => (
          <option key={v.id} value={v.id}>
            {v.name} ({v.plate_number || v.plateNumber})
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default VehicleSelector;
