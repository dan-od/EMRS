/**
 * AdditionalRequestModal
 * Modal for assigned engineers to request additional materials/tools
 */

import { useState } from 'react';
import { Modal, Button, Select } from '@/components/common';
import { Plus } from 'lucide-react';
import AdditionalRequestItem from './AdditionalRequestItem';

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' }
];

const AdditionalRequestModal = ({ isOpen, onClose, workOrder, onSubmit, isLoading }) => {
  const [items, setItems] = useState([{ type: 'material', name: '', quantity: 1, specifications: '' }]);
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState('Medium');

  const addItem = () => setItems([...items, { type: 'material', name: '', quantity: 1, specifications: '' }]);
  const removeItem = (i) => items.length > 1 && setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const handleSubmit = () => {
    const validItems = items.filter(item => item.name.trim());
    if (!validItems.length || !reason.trim()) return;
    onSubmit({ workOrderId: workOrder.id, items: validItems, reason: reason.trim(), priority });
  };

  const handleClose = () => {
    setItems([{ type: 'material', name: '', quantity: 1, specifications: '' }]);
    setReason('');
    setPriority('Medium');
    onClose();
  };

  const isValid = items.some(item => item.name.trim()) && reason.trim();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Additional Materials/Tools" size="lg">
      <div className="space-y-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="font-medium text-gray-900 dark:text-white">Work Order: {workOrder?.maintenance_type?.replace(/_/g, ' ')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{workOrder?.equipment_name} • {workOrder?.equipment_serial}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Items Needed</label>
            <Button variant="ghost" size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" />Add</Button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <AdditionalRequestItem key={i} item={item} index={i} onUpdate={updateItem} onRemove={removeItem} canRemove={items.length > 1} />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason *</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are these items needed..." rows={3}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        </div>

        <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} options={PRIORITY_OPTIONS} className="w-48" />

        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">This request goes to Manager → Purchasing for approval.</p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isLoading} disabled={!isValid} className="w-full sm:w-auto">Submit Request</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AdditionalRequestModal;
