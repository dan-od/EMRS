/**
 * VehicleCard - Single vehicle card
 */
import { Button } from '@/components/common';
import { Edit2, User, Fuel, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { STATUS_CONFIG, TYPE_ICONS } from '../../constants/vehicleConstants';

const VehicleCard = ({ vehicle, onEdit, onUpdateStatus }) => {
  const statusConfig = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.Available;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/10 p-4 hover:shadow-md dark:hover:bg-dark-card transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{TYPE_ICONS[vehicle.type] || '🚗'}</span>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-dark-text">{vehicle.plate_number}</h3>
            <p className="text-sm text-gray-600 dark:text-dark-muted">{vehicle.make} {vehicle.model}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusConfig.color}`}>
          <StatusIcon className="w-3 h-3" />
          {vehicle.status?.replace('_', ' ')}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm text-gray-600 dark:text-dark-muted mb-4">
        <div className="flex justify-between">
          <span>Year</span>
          <span className="font-medium text-gray-900 dark:text-dark-text">{vehicle.year}</span>
        </div>
        <div className="flex justify-between">
          <span>Type</span>
          <span className="font-medium text-gray-900 dark:text-dark-text">{vehicle.type}</span>
        </div>
        {vehicle.assigned_driver_name && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-500/15 rounded-lg border border-blue-100 dark:border-blue-500/20">
            <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="text-blue-700 dark:text-blue-400">{vehicle.assigned_driver_name}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> Fuel</span>
          <span className="font-medium text-gray-900 dark:text-dark-text">{vehicle.fuel_type}</span>
        </div>
        {vehicle.mileage && (
          <div className="flex justify-between">
            <span>Mileage</span>
            <span className="font-medium text-gray-900 dark:text-dark-text">{vehicle.mileage.toLocaleString()} km</span>
          </div>
        )}
        {vehicle.last_service_date && (
          <div className="flex justify-between">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Last Service</span>
            <span className="font-medium text-gray-900 dark:text-dark-text">{formatDate(vehicle.last_service_date)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
        <Button variant="outline" size="sm" onClick={onEdit} className="flex-1 w-full sm:w-auto">
          <Edit2 className="w-3 h-3 mr-1" /> Edit
        </Button>
        <Button variant="outline" size="sm" onClick={onUpdateStatus} className="flex-1 w-full sm:w-auto">
          Update Status
        </Button>
      </div>
    </div>
  );
};

export default VehicleCard;
