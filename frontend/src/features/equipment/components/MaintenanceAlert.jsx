import { Card } from '@/components/common';
import { AlertTriangle, Wrench, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '@/utils/formatters';

// Roles that should see the maintenance alert
const MAINTENANCE_ALERT_ROLES = [
  'Super_Admin', 'Admin', 'IT_Manager',
  'Operations_Manager', 'Maintenance_Manager', 'Safety_Manager',
  'HR_Manager', 'Logistics_Manager', 'Workshop_Manager',
  'Field_Engineer', 'Purchasing_Manager', 'Purchasing_Staff'
];

export const canSeeMaintenanceAlert = (role) => {
  if (!role) return false;
  return MAINTENANCE_ALERT_ROLES.includes(role);
};

export const MaintenanceAlert = ({ equipment = [] }) => {
  const navigate = useNavigate();

  if (!equipment.length) return null;

  return (
    <Card className="border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
            Maintenance Required
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300/80 mb-3">
            {equipment.length} equipment item{equipment.length > 1 ? 's' : ''} need{equipment.length === 1 ? 's' : ''} maintenance
          </p>

          <div className="space-y-2">
            {equipment.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/equipment/${item.id}`)}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    {formatNumber(item.current_hours)} / {item.next_maintenance_hours ? formatNumber(item.next_maintenance_hours) : '-'} hrs
                  </span>
                  <ChevronRight className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                </div>
              </div>
            ))}
          </div>

          {equipment.length > 3 && (
            <button
              onClick={() => navigate('/equipment?maintenance=due')}
              className="mt-3 text-sm text-yellow-700 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 font-medium"
            >
              View all {equipment.length} items →
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
