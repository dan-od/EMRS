/**
 * EquipmentRow - Equipment item row with sourcing workflow
 * FIXED: Proper text colors for dark theme
 */
import { Package, FileText, ShoppingCart, CheckCircle, RotateCcw, Search, Truck, Wrench, Link } from 'lucide-react';
import { Button } from '@/components/common';

const SOURCE_ICONS = { INVENTORY: Package, CLIENT: FileText, NEW_REQUEST: ShoppingCart };

const STATUS_STYLES = {
  REQUESTED: 'bg-gray-500/20 text-gray-300',
  PENDING_SUPERVISOR: 'bg-yellow-500/20 text-yellow-300',
  SUPERVISOR_REJECTED: 'bg-red-500/20 text-red-300',
  APPROVED: 'bg-blue-500/20 text-blue-300',
  SOURCING: 'bg-purple-500/20 text-purple-300',
  ARRIVED: 'bg-teal-500/20 text-teal-300',
  DISBURSED: 'bg-green-500/20 text-green-300',
  IN_USE: 'bg-primary-500/20 text-primary-300',
  PENDING_RETURN: 'bg-orange-500/20 text-orange-300',
  RETURNED: 'bg-green-500/20 text-green-300',
  UNDER_REPAIR: 'bg-red-500/20 text-red-300',
  PENDING_REINSPECTION: 'bg-yellow-500/20 text-yellow-300'
};

const PRIORITY_STYLES = {
  Critical: 'bg-red-500/20 text-red-300',
  High: 'bg-orange-500/20 text-orange-300',
  Medium: 'bg-blue-500/20 text-blue-300',
  Low: 'bg-gray-500/20 text-gray-300'
};

export const EquipmentRow = ({ 
  item, jobStatus, onDisburse, onReturn, onStartSourcing, onItemArrived, 
  onDisburseArrived, onRepairComplete, onLinkDisburse, showJob = false 
}) => {
  const SourceIcon = SOURCE_ICONS[item.source] || Package;
  const name = item.equipment_name || item.client_equipment_name || item.requested_item_name;
  
  // Determine available actions based on status
  // Job statuses from backend can be: Approved, In_Progress, Post_Job (title case)
  const canDisburse = ['Approved', 'Team_Assigned', 'In_Progress', 'APPROVED', 'IN_PROGRESS'].includes(jobStatus) 
    && item.status === 'APPROVED' 
    && item.source === 'INVENTORY';
  
  // Material/Tool from NEW_REQUEST can either be linked to inventory OR sourced
  const isMaterialRequest = item.item_type === 'MATERIAL_TOOL' && item.source === 'NEW_REQUEST' && item.status === 'APPROVED';
  const canLinkDisburse = isMaterialRequest && !item.linked_inventory_id;
  const canStartSourcing = item.status === 'APPROVED' && item.source === 'NEW_REQUEST' && item.item_type !== 'MATERIAL_TOOL';
  const canSourceMaterial = isMaterialRequest;
  
  const canMarkArrived = item.status === 'SOURCING';
  const canDisburseArrived = item.status === 'ARRIVED';
  const canReturn = ['Post_Job', 'POST_JOB'].includes(jobStatus) && item.status === 'DISBURSED';
  const canRepairComplete = item.status === 'UNDER_REPAIR';

  return (
    <tr className="border-t border-white/10 hover:bg-white/5">
      {showJob && (
        <td className="p-3">
          <span className="font-medium text-sm text-white">{item.job_number}</span>
        </td>
      )}
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <SourceIcon className="w-4 h-4 text-gray-400" />
            {item.item_type === 'MATERIAL_TOOL' && (
              <Wrench className="w-2.5 h-2.5 text-blue-400 absolute -bottom-0.5 -right-0.5" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm text-white">{name}</p>
            <div className="flex gap-2 text-xs text-gray-400">
              {item.serial_number && <span>S/N: {item.serial_number}</span>}
              {item.item_type === 'MATERIAL_TOOL' && <span className="text-blue-400">Material/Tool</span>}
              {item.unit && item.unit !== 'pieces' && <span>{item.quantity} {item.unit}</span>}
            </div>
          </div>
        </div>
      </td>
      <td className="p-3 text-center text-white">
        {item.quantity}{item.unit && item.unit !== 'pieces' ? ` ${item.unit}` : ''}
      </td>
      <td className="p-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.Medium}`}>
          {item.priority}
        </span>
      </td>
      <td className="p-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status] || STATUS_STYLES.REQUESTED}`}>
          {item.status?.replace(/_/g, ' ')}
        </span>
        {item.status === 'SOURCING' && item.estimated_arrival && (
          <p className="text-xs text-gray-400 mt-1">ETA: {new Date(item.estimated_arrival).toLocaleDateString()}</p>
        )}
        {item.status === 'UNDER_REPAIR' && item.repair_notes && (
          <p className="text-xs text-red-400 mt-1">{item.repair_notes}</p>
        )}
        {item.is_consumable && (
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">Consumable</span>
        )}
      </td>
      <td className="p-3 text-right space-x-1">
        {canDisburse && (
          <Button size="sm" variant="primary" onClick={() => onDisburse?.(item)}>
            <CheckCircle className="w-3 h-3 mr-1" />Disburse
          </Button>
        )}
        {canLinkDisburse && (
          <Button size="sm" variant="primary" onClick={() => onLinkDisburse?.(item)}>
            <Link className="w-3 h-3 mr-1" />Link & Disburse
          </Button>
        )}
        {canSourceMaterial && (
          <Button size="sm" variant="secondary" onClick={() => onStartSourcing?.(item)}>
            <Search className="w-3 h-3 mr-1" />Source
          </Button>
        )}
        {canStartSourcing && !isMaterialRequest && (
          <Button size="sm" variant="secondary" onClick={() => onStartSourcing?.(item)}>
            <Search className="w-3 h-3 mr-1" />Source
          </Button>
        )}
        {canMarkArrived && (
          <Button size="sm" variant="primary" onClick={() => onItemArrived?.(item)}>
            <Truck className="w-3 h-3 mr-1" />Arrived
          </Button>
        )}
        {canDisburseArrived && (
          <Button size="sm" variant="primary" onClick={() => onDisburseArrived?.(item)}>
            <CheckCircle className="w-3 h-3 mr-1" />Disburse
          </Button>
        )}
        {canRepairComplete && (
          <Button size="sm" variant="warning" onClick={() => onRepairComplete?.(item)}>
            <Wrench className="w-3 h-3 mr-1" />Repair Done
          </Button>
        )}
        {canReturn && (
          <Button size="sm" variant="secondary" onClick={() => onReturn?.(item)}>
            <RotateCcw className="w-3 h-3 mr-1" />Return
          </Button>
        )}
        {!canDisburse && !canLinkDisburse && !canSourceMaterial && !canStartSourcing && !canMarkArrived && !canDisburseArrived && !canReturn && !canRepairComplete && (
          <span className="text-xs text-gray-500">—</span>
        )}
      </td>
    </tr>
  );
};

export default EquipmentRow;
