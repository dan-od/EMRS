import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { Car, HardHat, Wrench, FileText, AlertTriangle, FileWarning, AlertCircle } from 'lucide-react';

const actions = [
  { 
    label: 'Request Transport', 
    icon: Car, 
    path: '/requests/new?type=TRANSPORT', 
    light: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    dark: 'dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25'
  },
  { 
    label: 'Request PPE', 
    icon: HardHat, 
    path: '/requests/new?type=PPE', 
    light: 'bg-green-50 text-green-600 hover:bg-green-100',
    dark: 'dark:bg-green-500/15 dark:text-green-400 dark:hover:bg-green-500/25'
  },
  { 
    label: 'Log Maintenance', 
    icon: Wrench, 
    path: '/requests/new?type=MAINTENANCE', 
    light: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    dark: 'dark:bg-orange-500/15 dark:text-orange-400 dark:hover:bg-orange-500/25'
  },
  { 
    label: 'Request Material', 
    icon: FileText, 
    path: '/requests/new?type=MATERIAL', 
    light: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    dark: 'dark:bg-purple-500/15 dark:text-purple-400 dark:hover:bg-purple-500/25'
  }
];

const safetyActions = [
  { 
    id: 'hazard',
    label: 'Report Hazard', 
    icon: AlertTriangle, 
    path: '/safety/new?type=hazard', 
    light: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    dark: 'dark:bg-yellow-500/15 dark:text-yellow-400 dark:hover:bg-yellow-500/25'
  },
  { 
    id: 'incident',
    label: 'Report Incident', 
    icon: FileWarning, 
    path: '/safety/new?type=incident', 
    light: 'bg-red-50 text-red-600 hover:bg-red-100',
    dark: 'dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25'
  },
  { 
    id: 'near-miss',
    label: 'Report Near Miss', 
    icon: AlertCircle, 
    path: '/safety/new?type=near-miss', 
    light: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    dark: 'dark:bg-orange-500/15 dark:text-orange-400 dark:hover:bg-orange-500/25'
  }
];

export const QuickActions = ({ className }) => {
  const navigate = useNavigate();

  return (
    <div className={cn('space-y-5', className)}>
      {/* Regular Actions */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary dark:text-dark-muted mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {actions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200',
                'border border-transparent dark:border-white/5',
                action.light, action.dark
              )}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Safety Actions */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary dark:text-dark-muted mb-3">
          🚨 Safety Reporting <span className="text-xs text-text-muted dark:text-dark-muted">(Direct to Safety Dept)</span>
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          {safetyActions.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200',
                'border border-transparent dark:border-white/5',
                action.light, action.dark
              )}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs font-medium text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
