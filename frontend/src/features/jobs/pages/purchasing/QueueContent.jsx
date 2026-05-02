/**
 * QueueContent - Renders equipment items for selected tab
 * Now includes Maintenance tab support
 */
import { Package } from 'lucide-react';
import { EmptyState } from '@/components/feedback';
import { EquipmentRow } from './EquipmentRow';
import MaintenanceQueueContent from './MaintenanceQueueContent';

const EMPTY_MESSAGES = {
  pending_disburse: 'No equipment pending disbursement',
  maintenance: 'No maintenance requests pending approval',
  needs_sourcing: 'No items need sourcing',
  in_sourcing: 'No items currently being sourced',
  arrived: 'No arrived items awaiting disbursement',
  pending_inspection: 'No items pending inspection',
  active_requests: 'No active job requests',
  swap_requests: 'No swap requests',
  in_repair: 'No items in repair',
  pending_returns: 'No pending returns',
};

const QueueContent = ({ 
  items = [], 
  activeTab,
  onDisburse,
  onReturn,
  onStartSourcing,
  onItemArrived,
  onDisburseArrived,
  onRepairComplete,
  onLinkDisburse,
  isLoading,
  // Maintenance-specific props
  maintenanceItems = [],
  maintenanceLoading = false,
  onMaintenanceRefresh
}) => {
  // Handle Maintenance tab separately
  if (activeTab === 'maintenance') {
    return (
      <MaintenanceQueueContent
        items={maintenanceItems}
        isLoading={maintenanceLoading}
        onRefresh={onMaintenanceRefresh}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-background-secondary animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={Package}
        title={EMPTY_MESSAGES[activeTab] || 'No items'}
        description="Items will appear here when available"
      />
    );
  }

  return (
    <div className="bg-background-secondary rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-text-secondary uppercase tracking-wider border-b border-white/10">
            <th className="p-3">Job</th>
            <th className="p-3">Equipment</th>
            <th className="p-3 text-center">Qty</th>
            <th className="p-3">Priority</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <EquipmentRow
              key={item.id}
              item={item}
              jobStatus={item.job_status}
              showJob={true}
              onDisburse={onDisburse}
              onReturn={onReturn}
              onStartSourcing={onStartSourcing}
              onItemArrived={onItemArrived}
              onDisburseArrived={onDisburseArrived}
              onRepairComplete={onRepairComplete}
              onLinkDisburse={onLinkDisburse}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QueueContent;
