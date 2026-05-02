/**
 * EquipmentSelector - Equipment dropdown for maintenance form
 */
import { Loader2 } from 'lucide-react';

const EquipmentSelector = ({ value, onChange, equipment, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-text-secondary dark:text-dark-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading equipment...
      </div>
    );
  }

  if (equipment.length === 0) {
    return <p className="text-text-secondary dark:text-dark-muted text-sm">No equipment available</p>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Select Equipment <span className="text-red-500">*</span>
      </label>
      <select
        name="equipmentId"
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-[#1a1f26] text-gray-700 dark:text-gray-300 ${
          error ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
        }`}
      >
        <option value="">Select equipment...</option>
        {equipment.map(eq => (
          <option key={eq.id} value={eq.id}>
            {eq.name} {eq.asset_tag ? `(${eq.asset_tag})` : ''}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default EquipmentSelector;
