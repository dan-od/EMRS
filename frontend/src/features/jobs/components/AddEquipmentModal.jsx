/**
 * AddEquipmentModal - Add EQUIPMENT from inventory or request new
 * Equipment ONLY - Materials/Tools use RequestMaterialModal
 * Additional requests on active jobs require manager approval
 */
import { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '@/components/common';
import { Search, Package, AlertCircle } from 'lucide-react';
import { useEquipmentItemActions } from '../hooks';
import { api } from '@/services/api';
import { PRIORITY_OPTIONS } from '../constants';
import { EquipmentRow, SelectedChip } from './equipment';

export const AddEquipmentModal = ({ jobId, type, existingItems = [], onClose, onSuccess, isAdditionalRequest = false }) => {
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState('');
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [priority, setPriority] = useState('Medium');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [specs, setSpecs] = useState('');
  const [reason, setReason] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const { addInventoryItem, addClientItem, addNewRequest } = useEquipmentItemActions();

  useEffect(() => {
    if (type !== 'inventory') return;
    setLoading(true);
    api.get('/equipment?status=Available&limit=100')
      .then(res => setEquipment((res.data?.equipment || []).filter(e => !existingItems.includes(e.id))))
      .finally(() => setLoading(false));
  }, [type, existingItems]);

  const filtered = equipment.filter(e => 
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.serial_number?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (id) => {
    setSelections(prev => prev[id] ? (({ [id]: _, ...rest }) => rest)(prev) : { ...prev, [id]: { quantity: 1 } });
  };

  const updateQuantity = (id, qty) => setSelections(prev => ({ ...prev, [id]: { ...prev[id], quantity: qty } }));
  const removeSelection = (id) => setSelections(prev => (({ [id]: _, ...rest }) => rest)(prev));

  const selectedItems = Object.keys(selections);
  const selectedEquipment = equipment.filter(e => selections[e.id]);

  const submit = async () => {
    setSubmitting(true);
    try {
      if (type === 'inventory') {
        for (const id of selectedItems) {
          await addInventoryItem(jobId, { 
            equipment_id: id, 
            quantity: selections[id].quantity, 
            priority, 
            item_type: 'EQUIPMENT', 
            reason,
            is_additional_request: isAdditionalRequest 
          });
        }
      } else if (type === 'client') {
        await addClientItem(jobId, { 
          client_equipment_name: name, 
          client_equipment_description: desc, 
          quantity, 
          priority, 
          item_type: 'EQUIPMENT',
          is_additional_request: isAdditionalRequest 
        });
      } else {
        await addNewRequest(jobId, { 
          requested_item_name: name, 
          requested_item_description: desc, 
          requested_item_specs: specs, 
          quantity, 
          priority, 
          item_type: 'EQUIPMENT', 
          reason,
          is_additional_request: isAdditionalRequest 
        });
      }
      onSuccess?.();
    } finally { setSubmitting(false); }
  };

  const valid = type === 'inventory' ? selectedItems.length > 0 : name.trim();
  const title = isAdditionalRequest 
    ? 'Request Additional Equipment' 
    : type === 'inventory' ? 'Add Equipment from Inventory' : type === 'client' ? 'Add Client Equipment' : 'Request New Equipment';

  return (
    <Modal isOpen onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        {/* Additional Request Notice - Manager approval only */}
        {isAdditionalRequest && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-300">Requires Manager Approval</p>
              <p className="text-xs text-yellow-400/80">Additional requests on active jobs need manager approval before being sent to purchasing.</p>
            </div>
          </div>
        )}

        {type === 'inventory' ? (
          <>
            <Input placeholder="Search equipment..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
            {selectedItems.length > 0 && (
              <div className="p-3 bg-background-secondary rounded-lg">
                <p className="text-xs text-text-secondary mb-2">{selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected</p>
                <div className="flex flex-wrap gap-2">{selectedEquipment.map(item => <SelectedChip key={item.id} item={item} quantity={selections[item.id]?.quantity || 1} onRemove={removeSelection} />)}</div>
              </div>
            )}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {loading ? <div className="flex items-center justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
               : filtered.length === 0 ? <p className="text-center text-text-secondary py-8">{search ? 'No equipment found' : 'No available equipment'}</p>
               : filtered.map(item => <EquipmentRow key={item.id} item={item} isSelected={!!selections[item.id]} quantity={selections[item.id]?.quantity || 1} onToggle={toggleSelection} onQuantityChange={updateQuantity} />)}
            </div>
            <div className="pt-2 border-t border-border-light"><Select label="Priority" value={priority} onChange={e => setPriority(e.target.value)} options={PRIORITY_OPTIONS} /></div>
          </>
        ) : (
          <>
            <Input label="Equipment Name *" placeholder="e.g., Pump Unit, Separator" value={name} onChange={e => setName(e.target.value)} />
            <div><label className="block text-sm font-medium text-text-secondary mb-1">Description</label><textarea className="w-full px-3 py-2 bg-background-secondary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors" placeholder="Optional description..." value={desc} onChange={e => setDesc(e.target.value)} rows={2} /></div>
            {(type === 'new-request' || isAdditionalRequest) && (
              <>
                {type === 'new-request' && <Input label="Specifications" placeholder="e.g., 3000 PSI rated, 50ft length" value={specs} onChange={e => setSpecs(e.target.value)} />}
                <div><label className="block text-sm font-medium text-text-secondary mb-1">Reason for Request {isAdditionalRequest && '*'}</label><textarea className="w-full px-3 py-2 bg-background-secondary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors" placeholder="Why is this item needed?" value={reason} onChange={e => setReason(e.target.value)} rows={2} /></div>
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Quantity" type="number" min={1} value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
              <Select label="Priority" value={priority} onChange={e => setPriority(e.target.value)} options={PRIORITY_OPTIONS} />
            </div>
          </>
        )}
        
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={!valid || submitting || (isAdditionalRequest && !reason.trim())}>
            {submitting ? 'Submitting...' : isAdditionalRequest ? 'Submit Request' : `Add ${type === 'inventory' && selectedItems.length > 1 ? `(${selectedItems.length})` : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddEquipmentModal;
