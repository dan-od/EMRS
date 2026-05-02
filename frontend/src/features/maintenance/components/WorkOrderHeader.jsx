/**
 * WorkOrderHeader
 * Header section of work order detail with status and quick info
 * Cost info hidden from engineers
 */

import { Card, PriorityBadge } from '@/components/common';
import { Wrench, Calendar, Clock, User, Banknote } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { cn, canViewCosts } from '@/utils/helpers';
import { useAuthStore } from '@/store/authStore';

const statusStyles = {
  Scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  In_Progress: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
  Overdue: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  Completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  Cancelled: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
};

const InfoBox = ({ icon: Icon, label, value, highlight }) => (
  <div className={cn(
    "text-center p-3 rounded-lg",
    highlight ? "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20" : "bg-gray-50 dark:bg-gray-800"
  )}>
    <Icon className={cn("w-5 h-5 mx-auto mb-1", highlight ? "text-amber-500" : "text-gray-400")} />
    <p className={cn("text-xs mb-1", highlight ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400")}>{label}</p>
    <p className={cn("font-semibold", highlight ? "text-amber-700 dark:text-amber-300" : "text-gray-900 dark:text-white")}>{value}</p>
  </div>
);

const WorkOrderHeader = ({ maintenance }) => {
  const user = useAuthStore(s => s.user);
  const showCost = canViewCosts(user?.role);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
          <Wrench className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {maintenance.maintenance_type?.replace(/_/g, ' ')}
            </h2>
            <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', statusStyles[maintenance.status])}>
              {maintenance.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {maintenance.equipment_name} • {maintenance.equipment_serial}
          </p>
        </div>
        <PriorityBadge priority={maintenance.priority} />
      </div>

      <div className={cn("grid gap-3 sm:gap-4", showCost ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3")}>
        <InfoBox icon={Calendar} label="Scheduled" value={formatDate(maintenance.scheduled_date)} />
        <InfoBox icon={Clock} label="Est. Hours" value={maintenance.estimated_hours || '-'} />
        <InfoBox icon={User} label="Assigned To" value={maintenance.assigned_to_name || 'Unassigned'} highlight={!maintenance.assigned_to_name} />
        {showCost && (
          <InfoBox icon={Banknote} label="Est. Cost" value={maintenance.estimated_cost ? formatCurrency(maintenance.estimated_cost) : '-'} />
        )}
      </div>
    </Card>
  );
};

export default WorkOrderHeader;
