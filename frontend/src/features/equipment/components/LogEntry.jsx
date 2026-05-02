/**
 * LogEntry Component
 * Displays a single log entry (General or Maintenance)
 */

import { cn } from '@/utils/helpers';
import { formatDateTime } from '@/utils/formatters';
import { 
  Truck, Package, RotateCcw, MapPin, CheckCircle, StickyNote,
  Wrench, Search, Settings, Cog, PenTool, Link
} from 'lucide-react';

// General log icons
const generalIcons = {
  Transport: Truck,
  Disbursed: Package,
  Returned: RotateCcw,
  Assignment: CheckCircle,
  Location_Change: MapPin,
  Request_Approved: CheckCircle,
  Note: StickyNote,
  Other: StickyNote
};

// Maintenance log icons
const maintenanceIcons = {
  Routine_Service: Wrench,
  Repair: Settings,
  Inspection: Search,
  Calibration: Cog,
  Parts_Replaced: PenTool,
  Note: StickyNote,
  Other: Wrench
};

// General log colors
const generalColors = {
  Transport: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  Disbursed: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  Returned: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  Assignment: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  Location_Change: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  Request_Approved: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  Note: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  Other: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
};

// Maintenance log colors
const maintenanceColors = {
  Routine_Service: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  Repair: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  Inspection: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  Calibration: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  Parts_Replaced: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  Note: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  Other: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
};

const LogEntry = ({ log, type = 'general', onViewMaintenance }) => {
  const icons = type === 'general' ? generalIcons : maintenanceIcons;
  const colors = type === 'general' ? generalColors : maintenanceColors;
  
  const Icon = icons[log.entry_type] || icons.Other;
  const colorClass = colors[log.entry_type] || colors.Other;
  const isManual = log.source === 'manual';

  return (
    <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-dark-surface rounded-lg border border-gray-100 dark:border-dark-border">
      {/* Icon */}
      <div className={cn('p-2.5 rounded-lg flex-shrink-0 h-fit', colorClass)}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {log.entry_type?.replace(/_/g, ' ')}
            </span>
            {isManual && (
              <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                Manual
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatDateTime(log.entry_date)}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          {log.description}
        </p>

        {/* Maintenance specific details */}
        {type === 'maintenance' && (log.labor_hours || log.cost || log.parts_used) && (
          <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
            {log.equipment_hours && (
              <span>Hours: {log.equipment_hours}</span>
            )}
            {log.labor_hours && (
              <span>Labor: {log.labor_hours}hrs</span>
            )}
            {log.cost && (
              <span>Cost: ₦{log.cost?.toLocaleString()}</span>
            )}
            {log.parts_used && (
              <span>Parts: {log.parts_used}</span>
            )}
          </div>
        )}

        {/* User info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By: {log.user_name} ({log.user_role?.replace(/_/g, ' ')}, {log.user_department})
          </p>
          
          {/* Link to maintenance record */}
          {log.maintenance_id && onViewMaintenance && (
            <button
              onClick={() => onViewMaintenance(log.maintenance_id)}
              className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <Link className="w-3.5 h-3.5" />
              View Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogEntry;
