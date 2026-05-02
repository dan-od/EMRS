import { Package, CheckCircle, Send, Pause, RotateCcw, AlertTriangle, CheckCheck, Clock, Wrench } from 'lucide-react';
import { cn } from '@/utils/helpers';

const TABS = [
  { id: 'all', label: 'All Requests', icon: Package },
  { id: 'ready', label: 'Ready to Disburse', icon: CheckCircle },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, info: true },
  { id: 'disbursed', label: 'Disbursed (Out)', icon: Send },
  { id: 'on-hold', label: 'On Hold', icon: Pause },
  { id: 'pending-return', label: 'Pending Return', icon: RotateCcw },
  { id: 'overdue', label: 'Overdue', icon: AlertTriangle, warning: true },
  { id: 'extensions', label: 'Extensions', icon: Clock, purple: true },
  { id: 'completed', label: 'Completed', icon: CheckCheck, success: true }
];

const PurchasingTabs = ({ activeTab, onTabChange, stats, extensionsCount = 0, maintenanceCount = 0 }) => {
  const getCount = (tabId) => {
    switch (tabId) {
      case 'all': return stats.total_active || 0;
      case 'ready': return stats.ready_to_disburse || 0;
      case 'maintenance': return maintenanceCount;
      case 'disbursed': return stats.disbursed_active || 0;
      case 'on-hold': return stats.on_hold || 0;
      case 'pending-return': return stats.pending_return || 0;
      case 'overdue': return stats.overdue || 0;
      case 'extensions': return extensionsCount;
      case 'completed': return stats.completed || 0;
      default: return 0;
    }
  };

  return (
    <div className="flex overflow-x-auto mobile-scroll-x border-b border-gray-200 dark:border-white/10">
      {TABS.map((tab) => {
        const count = getCount(tab.id);
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-text-muted dark:text-gray-400 hover:text-text-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
            )}
          >
            <Icon className={cn(
              'w-4 h-4', 
              tab.warning && count > 0 && 'text-error dark:text-red-400',
              tab.success && 'text-success dark:text-green-400',
              tab.info && count > 0 && 'text-blue-600 dark:text-blue-400'
            )} />
            <span>{tab.label}</span>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs',
              activeTab === tab.id
                ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400'
                : tab.warning && count > 0
                  ? 'bg-error/10 dark:bg-red-500/20 text-error dark:text-red-400'
                  : tab.success
                    ? 'bg-success/10 dark:bg-green-500/20 text-success dark:text-green-400'
                    : tab.purple && count > 0
                      ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                      : tab.info && count > 0
                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-white/10 text-text-muted dark:text-gray-400'
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PurchasingTabs;
