/**
 * MaintenanceCard Component
 * Single maintenance record card for list view - styled like Damaged/Missing page rows
 */

import { useNavigate } from 'react-router-dom';
import { PriorityBadge } from '@/components/common';
import { formatDate } from '@/utils/formatters';
import { Wrench, Calendar, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/helpers';

const statusStyles = {
  Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
  In_Progress: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400',
  Overdue: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
  Cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
};

const MaintenanceCard = ({ maintenance }) => {
  const navigate = useNavigate();
  const isOverdue = maintenance.status === 'Overdue' || 
    (maintenance.status === 'Scheduled' && new Date(maintenance.scheduled_date) < new Date());

  return (
    <div
      onClick={() => navigate(`/maintenance/${maintenance.id}`)}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
    >
      {/* Icon */}
      <div className={cn(
        'p-2.5 rounded-lg flex-shrink-0',
        isOverdue 
          ? 'bg-red-100 dark:bg-red-500/20' 
          : 'bg-gray-100 dark:bg-gray-700'
      )}>
        {isOverdue ? (
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        ) : (
          <Wrench className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {maintenance.equipment_name}
          </h3>
          <span className={cn(
            'px-2 py-0.5 text-xs font-medium rounded-full',
            statusStyles[maintenance.status] || statusStyles.Scheduled
          )}>
            {maintenance.status?.replace(/_/g, ' ')}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {maintenance.maintenance_type?.replace(/_/g, ' ')} • {maintenance.equipment_serial}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(maintenance.scheduled_date)}
          </span>
          <PriorityBadge priority={maintenance.priority} />
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
    </div>
  );
};

export default MaintenanceCard;
