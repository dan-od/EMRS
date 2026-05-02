/**
 * FlatView - All equipment items with sourcing workflow
 */
import { Card, CardContent } from '@/components/common';
import { Package, Wrench, Search, Truck, CheckCircle, RotateCcw, Link } from 'lucide-react';

const JOB_STATUS_STYLES = {
  Draft: 'bg-gray-500/20 text-gray-400',
  Team_Assigned: 'bg-yellow-500/20 text-yellow-400',
  Approved: 'bg-blue-500/20 text-blue-400',
  In_Progress: 'bg-primary-500/20 text-primary-400',
  Post_Job: 'bg-purple-500/20 text-purple-400'
};

const PRIORITY_STYLES = {
  Critical: 'bg-red-500/20 text-red-400',
  High: 'bg-orange-500/20 text-orange-400',
  Medium: 'bg-blue-500/20 text-blue-400',
  Low: 'bg-gray-500/20 text-gray-400'
};

const STATUS_STYLES = {
  REQUESTED: 'bg-gray-500/20 text-gray-400',
  PENDING_SUPERVISOR: 'bg-yellow-500/20 text-yellow-400',
  APPROVED: 'bg-blue-500/20 text-blue-400',
  SOURCING: 'bg-purple-500/20 text-purple-400',
  ARRIVED: 'bg-teal-500/20 text-teal-400',
  DISBURSED: 'bg-green-500/20 text-green-400',
  RETURNED: 'bg-green-500/20 text-green-400',
  UNDER_REPAIR: 'bg-red-500/20 text-red-400',
  PENDING_REINSPECTION: 'bg-yellow-500/20 text-yellow-400'
};

export const FlatView = ({ items, onDisburse, onReturn, onStartSourcing, onItemArrived, onDisburseArrived, onRepairComplete, onLinkDisburse }) => {
  if (items.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-secondary">
              <tr className="text-left text-xs text-text-secondary uppercase">
                <th className="p-3">Job</th>
                <th className="p-3">Job Status</th>
                <th className="p-3">Location</th>
                <th className="p-3">Item</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const name = item.equipment_name || item.client_equipment_name || item.requested_item_name;
                const canDisburse = ['Approved', 'Team_Assigned', 'In_Progress'].includes(item.job_status) && item.status === 'APPROVED' && item.source === 'INVENTORY';
                
                // Material/Tool from NEW_REQUEST can be linked to inventory OR sourced
                const isMaterialRequest = item.item_type === 'MATERIAL_TOOL' && item.source === 'NEW_REQUEST' && item.status === 'APPROVED';
                const canLinkDisburse = isMaterialRequest && !item.linked_inventory_id;
                const canStartSourcing = item.status === 'APPROVED' && item.source === 'NEW_REQUEST' && item.item_type !== 'MATERIAL_TOOL';
                const canSourceMaterial = isMaterialRequest;
                
                const canMarkArrived = item.status === 'SOURCING';
                const canDisburseArrived = item.status === 'ARRIVED';
                const canReturn = item.job_status === 'Post_Job' && item.status === 'DISBURSED';
                const canRepairComplete = item.status === 'UNDER_REPAIR';

                return (
                  <tr key={item.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="p-3"><span className="font-medium text-sm">{item.job_number}</span></td>
                    <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${JOB_STATUS_STYLES[item.job_status]}`}>{item.job_status?.replace('_', ' ')}</span></td>
                    <td className="p-3 text-sm text-text-secondary">{item.location}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {item.item_type === 'MATERIAL_TOOL' ? <Wrench className="w-4 h-4 text-blue-400" /> : <Package className="w-4 h-4 text-primary-400" />}
                        <div>
                          <p className="font-medium text-sm">{name}</p>
                          {item.serial_number && <p className="text-xs text-text-secondary">S/N: {item.serial_number}</p>}
                          {item.item_type === 'MATERIAL_TOOL' && <span className="text-xs text-blue-400">Material/Tool</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">{item.quantity}{item.unit && item.unit !== 'pieces' ? ` ${item.unit}` : ''}</td>
                    <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_STYLES[item.priority]}`}>{item.priority}</span></td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status] || STATUS_STYLES.REQUESTED}`}>{item.status?.replace(/_/g, ' ')}</span>
                      {item.status === 'SOURCING' && item.estimated_arrival && <p className="text-xs text-text-secondary mt-1">ETA: {new Date(item.estimated_arrival).toLocaleDateString()}</p>}
                      {item.status === 'UNDER_REPAIR' && item.repair_notes && <p className="text-xs text-red-400 mt-1">{item.repair_notes}</p>}
                      {item.status === 'PENDING_REINSPECTION' && <p className="text-xs text-yellow-500 mt-1">Awaiting re-inspection</p>}
                      {item.is_consumable && <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">Consumable</span>}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {canDisburse && <button onClick={() => onDisburse(item)} className="text-xs px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" />Disburse</button>}
                      {canLinkDisburse && <button onClick={() => onLinkDisburse?.(item)} className="text-xs px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 inline-flex items-center gap-1"><Link className="w-3 h-3" />Link & Disburse</button>}
                      {canSourceMaterial && <button onClick={() => onStartSourcing(item)} className="text-xs px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 inline-flex items-center gap-1"><Search className="w-3 h-3" />Source</button>}
                      {canStartSourcing && !isMaterialRequest && <button onClick={() => onStartSourcing(item)} className="text-xs px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 inline-flex items-center gap-1"><Search className="w-3 h-3" />Source</button>}
                      {canMarkArrived && <button onClick={() => onItemArrived(item)} className="text-xs px-3 py-1 bg-teal-500 text-white rounded-lg hover:bg-teal-600 inline-flex items-center gap-1"><Truck className="w-3 h-3" />Arrived</button>}
                      {canDisburseArrived && <button onClick={() => onDisburseArrived(item)} className="text-xs px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" />Disburse</button>}
                      {canRepairComplete && <button onClick={() => onRepairComplete?.(item)} className="text-xs px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 inline-flex items-center gap-1"><Wrench className="w-3 h-3" />Repair Done</button>}
                      {canReturn && <button onClick={() => onReturn(item)} className="text-xs px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 inline-flex items-center gap-1"><RotateCcw className="w-3 h-3" />Return</button>}
                      {!canDisburse && !canLinkDisburse && !canSourceMaterial && !canStartSourcing && !canMarkArrived && !canDisburseArrived && !canReturn && !canRepairComplete && <span className="text-xs text-gray-400">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlatView;
