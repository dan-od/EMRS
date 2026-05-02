/**
 * ServiceTypeSelector - Select maintenance service type
 * In-House, External, or Mixed
 * REQUIRED for Equipment and Vehicle maintenance
 */
import { Home, Building2, Shuffle, AlertCircle } from 'lucide-react';

const SERVICE_TYPES = [
  { 
    id: 'In-House', 
    label: 'In-House', 
    icon: Home, 
    description: 'Our team handles the repair',
    color: 'text-green-500',
    bgSelected: 'bg-green-100 dark:bg-green-500/20 border-green-500 ring-2 ring-green-500'
  },
  { 
    id: 'External', 
    label: 'External', 
    icon: Building2, 
    description: 'Send to external vendor',
    color: 'text-blue-500',
    bgSelected: 'bg-blue-100 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
  },
  { 
    id: 'Mixed', 
    label: 'Mixed', 
    icon: Shuffle, 
    description: 'Both in-house & external work',
    color: 'text-purple-500',
    bgSelected: 'bg-purple-100 dark:bg-purple-500/20 border-purple-500 ring-2 ring-purple-500'
  }
];

const ServiceTypeSelector = ({ value, onChange, error }) => {
  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-300 dark:border-amber-500/40 rounded-xl">
      <label className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3">
        <AlertCircle className="w-4 h-4" />
        How should this be handled? <span className="text-red-500">*</span>
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SERVICE_TYPES.map(type => {
          const Icon = type.icon;
          const isSelected = value === type.id;
          
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                isSelected
                  ? type.bgSelected
                  : 'border-gray-200 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500 bg-white dark:bg-gray-800'
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? type.color : 'text-gray-400'}`} />
              <p className={`text-sm font-bold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {type.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {type.description}
              </p>
            </button>
          );
        })}
      </div>
      
      {!value && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Please select how this maintenance should be handled
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-500 mt-2 font-medium">{error}</p>
      )}
    </div>
  );
};

export default ServiceTypeSelector;
