/**
 * MaintenanceTable Component
 * Table view for maintenance list
 */

import { useNavigate } from 'react-router-dom';
import { Badge, PriorityBadge } from '@/components/common';
import { formatDate } from '@/utils/formatters';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/helpers';

const statusStyles = {
  Scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  In_Progress: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
  Overdue: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  Completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  Cancelled: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
};

const MaintenanceTable = ({ data = [] }) => {
  const navigate = useNavigate();

  if (data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Equipment
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Priority
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Scheduled
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Assigned To
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Status
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.map((item) => {
              const isOverdue = item.status === 'Overdue' || 
                (item.status === 'Scheduled' && new Date(item.scheduled_date) < new Date());
              
              return (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/maintenance/${item.id}`)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isOverdue && (
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.equipment_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.equipment_serial}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {item.maintenance_type?.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(item.scheduled_date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {item.assigned_to_name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      statusStyles[item.status] || statusStyles.Scheduled
                    )}>
                      {item.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaintenanceTable;
