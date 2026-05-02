/**
 * QueueTabs - Tab navigation for Purchasing Queue
 * Includes Maintenance Approvals tab
 */
import { 
  Package, Search, Truck, CheckCircle, Clipboard, 
  PlusCircle, RefreshCw, Wrench, CornerDownLeft, Settings 
} from 'lucide-react';

const TAB_CONFIG = [
  { id: 'pending_disburse', label: 'Pending Disburse', icon: Package },
  { id: 'maintenance', label: 'Maintenance', icon: Settings },
  { id: 'needs_sourcing', label: 'Needs Sourcing', icon: Search },
  { id: 'in_sourcing', label: 'In Sourcing', icon: Truck },
  { id: 'arrived', label: 'Arrived', icon: CheckCircle },
  { id: 'pending_inspection', label: 'Pending Inspection', icon: Clipboard },
  { id: 'active_requests', label: 'Active Requests', icon: PlusCircle },
  { id: 'swap_requests', label: 'Swaps', icon: RefreshCw },
  { id: 'in_repair', label: 'In Repair', icon: Wrench },
  { id: 'pending_returns', label: 'Returns', icon: CornerDownLeft },
];

const QueueTabs = ({ activeTab, onTabChange, counts = {} }) => {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2 border-b border-border">
      {TAB_CONFIG.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        const count = counts[id] || 0;
        
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-t-lg text-sm font-medium
              whitespace-nowrap transition-colors
              ${isActive 
                ? 'bg-primary-500 text-white' 
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {count > 0 && (
              <span className={`
                px-1.5 py-0.5 text-xs rounded-full
                ${isActive ? 'bg-white/20' : 'bg-primary-500/20 text-primary-400'}
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default QueueTabs;
export { TAB_CONFIG };
