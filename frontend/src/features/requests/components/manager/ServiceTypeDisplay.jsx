/**
 * ServiceTypeDisplay - Shows service type with icon
 */
import { Wrench, Home, Building2, Shuffle } from 'lucide-react';

const SERVICE_TYPE_CONFIG = {
  'In-House': { icon: Home, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/20', label: 'In-House (Our team)' },
  'External': { icon: Building2, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20', label: 'External (Vendor)' },
  'Mixed': { icon: Shuffle, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20', label: 'Mixed (Both)' }
};

const ServiceTypeDisplay = ({ serviceType }) => {
  const config = SERVICE_TYPE_CONFIG[serviceType] || null;
  const Icon = config?.icon || Wrench;

  return (
    <div className={`p-4 rounded-xl border ${config ? config.bg : 'bg-gray-50 dark:bg-gray-800'} border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${config ? config.color : 'text-gray-500'}`} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Service Type: {config ? config.label : <span className="text-yellow-600 dark:text-yellow-400">Not specified</span>}
        </span>
      </div>
    </div>
  );
};

export default ServiceTypeDisplay;
export { SERVICE_TYPE_CONFIG };
