/**
 * EquipmentMaterialsSection - Two-column layout
 * Left: Equipment | Right: Materials & Tools
 * Includes Pre-Inspection for disbursed items
 * Supports additional requests for active jobs
 * Managers can approve/reject REQUESTED items
 */
import { memo, useState } from 'react';
import { Card, CardContent, Button } from '@/components/common';
import { Package, Wrench, Building, ShoppingCart, Trash2, ClipboardCheck, CheckCircle, AlertTriangle, Plus, Clock, Eye, Check, X } from 'lucide-react';
import { AddEquipmentModal } from './AddEquipmentModal';
import { PreInspectionModal } from './PreInspectionModal';
import { ViewInspectionModal } from './ViewInspectionModal';
import RequestMaterialModal from './RequestMaterialModal';
import { useEquipmentItemActions } from '../hooks';
import { ITEM_STATUS_CONFIG } from '../constants';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';

const MANAGER_ROLES = ['Super_Admin', 'Admin', 'Operations_Manager', 'Operations Manager'];

const StatusBadge = ({ status }) => {
  const cfg = ITEM_STATUS_CONFIG[status] || { label: status, color: 'gray' };
  const colors = {
    gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    teal: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30'
  };
  return <span className={`text-xs px-2 py-0.5 rounded border ${colors[cfg.color] || colors.gray}`}>{cfg.label}</span>;
};

const SourceIcon = ({ source }) => {
  if (source === 'CLIENT') return <Building className="w-4 h-4 text-blue-400" />;
  if (source === 'NEW_REQUEST') return <ShoppingCart className="w-4 h-4 text-purple-400" />;
  return <Package className="w-4 h-4 text-primary-400" />;
};

const InspectionBadge = ({ status }) => {
  if (status === 'PASSED') return <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-300 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Passed</span>;
  if (status === 'FLAGGED_REPAIR') return <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Needs Repair</span>;
  if (status === 'ACKNOWLEDGED_PROCEED') return <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Risk Ack</span>;
  if (status === 'PENDING') return <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 flex items-center gap-1"><Clock className="w-3 h-3" />Pending</span>;
  return null;
};

const ItemRow = ({ item, canEdit, onRemove, onInspect, canInspect, onViewInspection, isManager, onApprove, onReject }) => {
  const [processing, setProcessing] = useState(false);
  const name = item.source === 'INVENTORY' ? item.equipment_name : item.source === 'CLIENT' ? item.client_equipment_name : item.requested_item_name;
  const showInspectBtn = canInspect && item.status === 'DISBURSED' && !item.inspection_status;
  const hasInspection = item.inspection_status && item.current_inspection_id;
  const showManagerActions = isManager && item.status === 'REQUESTED';

  const handleApprove = async () => {
    if (!confirm('Approve this equipment request?')) return;
    setProcessing(true);
    try {
      await onApprove(item.id);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setProcessing(true);
    try {
      await onReject(item.id, reason);
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg group">
      <SourceIcon source={item.source} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{name}</p>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          {item.serial_number && <span>{item.serial_number}</span>}
          {item.source === 'CLIENT' && <span className="text-blue-400">Client</span>}
          {item.source === 'NEW_REQUEST' && <span className="text-purple-400">Request</span>}
        </div>
      </div>
      <span className="text-sm text-text-secondary">×{item.quantity}</span>
      <StatusBadge status={item.status} />
      {item.inspection_status && <InspectionBadge status={item.inspection_status} />}
      {hasInspection && (
        <Button variant="ghost" size="sm" onClick={() => onViewInspection(item)} className="!px-2 !py-1 text-xs opacity-0 group-hover:opacity-100">
          <Eye className="w-3 h-3" />
        </Button>
      )}
      {showInspectBtn && (
        <Button variant="ghost" size="sm" onClick={() => onInspect(item)} className="!px-2 !py-1 text-xs bg-teal-500/10 text-teal-400 hover:bg-teal-500/20">
          <ClipboardCheck className="w-3 h-3 mr-1" />Pre-Inspect
        </Button>
      )}
      {showManagerActions && (
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleApprove}
            disabled={processing}
            className="!px-2 !py-1 text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20"
          >
            <Check className="w-3 h-3 mr-1" />{processing ? '...' : 'Approve'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReject}
            disabled={processing}
            className="!px-2 !py-1 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20"
          >
            <X className="w-3 h-3 mr-1" />Reject
          </Button>
        </div>
      )}
      {canEdit && item.status === 'REQUESTED' && !isManager && (
        <button onClick={() => onRemove(item.id)} className="p-1 text-text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const ItemList = ({ items, canEdit, onRemove, emptyText, onInspect, canInspect, onViewInspection, isManager, onApprove, onReject }) => {
  if (items.length === 0) return <p className="text-sm text-text-muted text-center py-6">{emptyText}</p>;
  return (
    <div className="space-y-2">
      {items.map(i => (
        <ItemRow 
          key={i.id} 
          item={i} 
          canEdit={canEdit} 
          onRemove={onRemove} 
          onInspect={onInspect} 
          canInspect={canInspect} 
          onViewInspection={onViewInspection}
          isManager={isManager}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
};

// Full add buttons for draft mode - Equipment only (inventory, client, new request)
const EquipmentAddButtons = ({ onAdd }) => (
  <div className="flex gap-1">
    <Button variant="ghost" size="sm" onClick={() => onAdd('inventory', 'EQUIPMENT')} title="From Inventory"><Package className="w-4 h-4" /></Button>
    <Button variant="ghost" size="sm" onClick={() => onAdd('client', 'EQUIPMENT')} title="Client Provided"><Building className="w-4 h-4" /></Button>
    <Button variant="ghost" size="sm" onClick={() => onAdd('new-request', 'EQUIPMENT')} title="New Request"><ShoppingCart className="w-4 h-4" /></Button>
  </div>
);

// Material/Tool add button - always opens free-text modal
const MaterialAddButton = ({ onAdd }) => (
  <Button 
    variant="ghost" 
    size="sm" 
    onClick={() => onAdd('material', 'MATERIAL_TOOL')} 
    title="Add Material/Tool"
    className="text-blue-400 hover:text-blue-300"
  >
    <Plus className="w-4 h-4 mr-1" />Add
  </Button>
);

// Request buttons for active jobs - Equipment (same as draft but with approval notice in modal)
const EquipmentRequestButtons = ({ onAdd }) => (
  <div className="flex gap-1">
    <Button variant="ghost" size="sm" onClick={() => onAdd('inventory', 'EQUIPMENT')} title="From Inventory" className="text-purple-400 hover:text-purple-300"><Package className="w-4 h-4" /></Button>
    <Button variant="ghost" size="sm" onClick={() => onAdd('new-request', 'EQUIPMENT')} title="Request New" className="text-purple-400 hover:text-purple-300"><ShoppingCart className="w-4 h-4" /></Button>
  </div>
);

// Request button for active jobs - Material/Tool (same as add, uses free-text)
const MaterialRequestButton = ({ onAdd }) => (
  <Button 
    variant="ghost" 
    size="sm" 
    onClick={() => onAdd('material', 'MATERIAL_TOOL')} 
    title="Request Material/Tool"
    className="text-blue-400 hover:text-blue-300"
  >
    <Plus className="w-4 h-4 mr-1" />Request
  </Button>
);

export const EquipmentMaterialsSection = memo(({ 
  jobId, 
  items = [], 
  onRefresh, 
  canEdit = false, 
  canRequest = false,
  canInspect = true,
  jobStatus,
  jobNumber 
}) => {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('inventory');
  const [modalItemType, setModalItemType] = useState('EQUIPMENT');
  const [inspectItem, setInspectItem] = useState(null);
  const [viewInspectionItem, setViewInspectionItem] = useState(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { removeItem } = useEquipmentItemActions();

  const isManager = MANAGER_ROLES.includes(user?.role);

  const handleRemove = async (id) => {
    if (!confirm('Remove this item from the job?')) return;
    await removeItem(jobId, id);
    onRefresh?.();
  };

  const handleApprove = async (itemId) => {
    try {
      await api.post(`/jobs/equipment/${itemId}/manager-approve`, { notes: '' });
      onRefresh?.();
    } catch (err) {
      console.error('Failed to approve:', err);
      alert(err.response?.data?.error || 'Failed to approve request');
    }
  };

  const handleReject = async (itemId, reason) => {
    try {
      await api.post(`/jobs/equipment/${itemId}/manager-reject`, { reason });
      onRefresh?.();
    } catch (err) {
      console.error('Failed to reject:', err);
      alert(err.response?.data?.error || 'Failed to reject request');
    }
  };

  const openModal = (type, itemType) => {
    // For materials/tools, always use the new free-text modal
    if (type === 'material' || itemType === 'MATERIAL_TOOL') {
      setShowMaterialModal(true);
    } else {
      // Equipment uses the existing modal
      setModalType(type);
      setModalItemType('EQUIPMENT');
      setShowModal(true);
    }
  };

  const handleInspect = (item) => setInspectItem(item);
  const handleInspectSuccess = () => { setInspectItem(null); onRefresh?.(); };
  const handleViewInspection = (item) => setViewInspectionItem(item);

  // Handle material request submission
  const handleMaterialSubmit = async (materialItems) => {
    setIsSubmitting(true);
    try {
      // Get user's role on this job team
      const teamMember = items.find(i => i.added_by === user?.id);
      const jobRole = teamMember?.requested_by_role || user?.role;
      
      await api.post(`/jobs/${jobId}/materials`, { 
        items: materialItems,
        jobRole 
      });
      onRefresh?.();
      return true;
    } catch (err) {
      console.error('Failed to submit material requests:', err);
      alert(err.response?.data?.message || 'Failed to submit requests');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const equipment = items.filter(i => i.item_type !== 'MATERIAL_TOOL');
  const materials = items.filter(i => i.item_type === 'MATERIAL_TOOL');
  
  // Count disbursed items needing inspection
  const needsInspection = items.filter(i => i.status === 'DISBURSED' && !i.inspection_status).length;
  
  // Count items needing manager approval
  const needsApproval = items.filter(i => i.status === 'REQUESTED').length;
  
  // Check if job is in active state (not draft)
  const isActiveJob = jobStatus && !['DRAFT', 'TEAM_ASSIGNED'].includes(jobStatus.toString().toUpperCase());

  return (
    <div className="space-y-4">
      {needsInspection > 0 && (
        <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-teal-400" />
          <span className="text-sm text-teal-300">{needsInspection} item{needsInspection > 1 ? 's' : ''} ready for pre-inspection</span>
        </div>
      )}
      
      {isManager && needsApproval > 0 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-400" />
          <span className="text-sm text-yellow-300">{needsApproval} equipment request{needsApproval > 1 ? 's' : ''} pending your approval</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Equipment Column */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-500" />
                Equipment ({equipment.length})
              </h3>
              {canEdit && <EquipmentAddButtons onAdd={openModal} />}
              {!canEdit && canRequest && isActiveJob && <EquipmentRequestButtons onAdd={openModal} />}
            </div>
            <ItemList 
              items={equipment} 
              canEdit={canEdit} 
              onRemove={handleRemove} 
              emptyText="No equipment added" 
              onInspect={handleInspect} 
              canInspect={canInspect} 
              onViewInspection={handleViewInspection}
              isManager={isManager}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </CardContent>
        </Card>

        {/* Materials & Tools Column */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-500" />
                Materials & Tools ({materials.length})
              </h3>
              {canEdit && <MaterialAddButton onAdd={openModal} />}
              {!canEdit && canRequest && isActiveJob && <MaterialRequestButton onAdd={openModal} />}
            </div>
            <ItemList 
              items={materials} 
              canEdit={canEdit} 
              onRemove={handleRemove} 
              emptyText="No materials or tools added" 
              onInspect={handleInspect} 
              canInspect={canInspect} 
              onViewInspection={handleViewInspection}
              isManager={isManager}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <AddEquipmentModal 
          jobId={jobId} 
          type={modalType} 
          existingItems={items.filter(i => i.source === 'INVENTORY').map(i => i.equipment_id)} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => { setShowModal(false); onRefresh?.(); }}
          isAdditionalRequest={isActiveJob}
        />
      )}

      {showMaterialModal && (
        <RequestMaterialModal
          isOpen={showMaterialModal}
          jobId={jobId}
          jobNumber={jobNumber}
          onClose={() => setShowMaterialModal(false)}
          onSubmit={handleMaterialSubmit}
          isLoading={isSubmitting}
        />
      )}
      
      {inspectItem && (
        <PreInspectionModal
          jobId={jobId}
          item={inspectItem}
          onClose={() => setInspectItem(null)}
          onSuccess={handleInspectSuccess}
        />
      )}
      
      {viewInspectionItem && (
        <ViewInspectionModal
          jobId={jobId}
          item={viewInspectionItem}
          onClose={() => setViewInspectionItem(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
});

EquipmentMaterialsSection.displayName = 'EquipmentMaterialsSection';
export default EquipmentMaterialsSection;
