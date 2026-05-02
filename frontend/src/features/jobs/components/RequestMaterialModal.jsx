/**
 * RequestMaterialModal - Batch add material/tool requests
 * Features: Multi-item, auto-save to localStorage, free-text entry
 */
import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Input, Select } from '@/components/common';
import { Plus, Trash2, Package, Save, AlertCircle } from 'lucide-react';

// Simple TextArea component
const TextArea = ({ label, value, onChange, placeholder, rows = 3, className = '' }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 bg-dark-card border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
    />
  </div>
);

// Simple debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' }
];

const UNIT_OPTIONS = [
  { value: 'pieces', label: 'Pieces' },
  { value: 'sets', label: 'Sets' },
  { value: 'meters', label: 'Meters' },
  { value: 'liters', label: 'Liters' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'pairs', label: 'Pairs' },
  { value: 'rolls', label: 'Rolls' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'units', label: 'Units' }
];

const EMPTY_ITEM = { name: '', description: '', specs: '', quantity: 1, unit: 'pieces', priority: 'Medium', notes: '' };

const getDraftKey = (jobId) => `emrs_material_draft_${jobId}`;

const RequestMaterialModal = ({ isOpen, onClose, onSubmit, jobId, jobNumber, isLoading }) => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ ...EMPTY_ITEM });
  const [draftStatus, setDraftStatus] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [errors, setErrors] = useState({});

  // Debounced auto-save
  const debouncedItems = useDebounce(items, 500);
  const debouncedCurrent = useDebounce(currentItem, 500);

  // Load draft on mount
  useEffect(() => {
    if (isOpen && jobId) {
      const saved = localStorage.getItem(getDraftKey(jobId));
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          if (draft.items?.length > 0 || draft.currentItem?.name) {
            setShowRecovery(true);
          }
        } catch (e) {
          console.error('Failed to parse draft:', e);
        }
      }
    }
  }, [isOpen, jobId]);

  // Auto-save to localStorage
  useEffect(() => {
    if (jobId && (debouncedItems.length > 0 || debouncedCurrent.name)) {
      const draft = { items: debouncedItems, currentItem: debouncedCurrent, savedAt: new Date().toISOString() };
      localStorage.setItem(getDraftKey(jobId), JSON.stringify(draft));
      setDraftStatus('Draft saved');
      setTimeout(() => setDraftStatus(''), 2000);
    }
  }, [debouncedItems, debouncedCurrent, jobId]);

  const recoverDraft = () => {
    const saved = localStorage.getItem(getDraftKey(jobId));
    if (saved) {
      const draft = JSON.parse(saved);
      setItems(draft.items || []);
      setCurrentItem(draft.currentItem || { ...EMPTY_ITEM });
    }
    setShowRecovery(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(getDraftKey(jobId));
    setItems([]);
    setCurrentItem({ ...EMPTY_ITEM });
    setShowRecovery(false);
  };

  const validateItem = useCallback((item) => {
    const errs = {};
    if (!item.name?.trim()) errs.name = 'Item name is required';
    if (!item.quantity || item.quantity < 1) errs.quantity = 'Quantity must be at least 1';
    return errs;
  }, []);

  const addItemToList = () => {
    const errs = validateItem(currentItem);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    setItems(prev => [...prev, { ...currentItem, id: Date.now() }]);
    setCurrentItem({ ...EMPTY_ITEM });
    setErrors({});
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateCurrentItem = (field, value) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    // Add current item if it has content
    let submitItems = [...items];
    if (currentItem.name?.trim()) {
      const errs = validateItem(currentItem);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      submitItems.push({ ...currentItem, id: Date.now() });
    }

    if (submitItems.length === 0) {
      setErrors({ general: 'Add at least one item' });
      return;
    }

    const success = await onSubmit(submitItems.map(({ id, ...item }) => item));
    if (success) {
      localStorage.removeItem(getDraftKey(jobId));
      setItems([]);
      setCurrentItem({ ...EMPTY_ITEM });
      onClose();
    }
  };

  const handleClose = () => {
    // Draft is auto-saved, just close
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Materials / Tools" size="lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <div>
            <p className="text-sm text-gray-400">Job: <span className="text-white font-medium">{jobNumber}</span></p>
          </div>
          {draftStatus && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <Save className="w-3 h-3" /> {draftStatus}
            </span>
          )}
        </div>

        {/* Recovery prompt */}
        {showRecovery && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-yellow-300">You have unsaved items. Continue?</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={discardDraft}>Discard</Button>
              <Button size="sm" variant="primary" onClick={recoverDraft}>Continue</Button>
            </div>
          </div>
        )}

        {/* Added items list */}
        {items.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Items to Request ({items.length})</h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="bg-background-secondary rounded-lg p-3 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary-400" />
                      <span className="font-medium">{idx + 1}. {item.name}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Qty: {item.quantity} {item.unit} | Priority: {item.priority}
                      {item.description && <span className="ml-2">| {item.description}</span>}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)} 
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new item form */}
        <div className="bg-background-secondary/50 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </h4>

          {errors.general && (
            <div className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Item Name *</label>
              <Input
                value={currentItem.name}
                onChange={(e) => updateCurrentItem('name', e.target.value)}
                placeholder="e.g., Safety Goggles, Hydraulic Oil, Pump Seals"
                error={errors.name}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Description / Specs</label>
              <Input
                value={currentItem.description}
                onChange={(e) => updateCurrentItem('description', e.target.value)}
                placeholder="e.g., UV-resistant, 5W-30"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Quantity *</label>
                <Input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => updateCurrentItem('quantity', parseInt(e.target.value) || 1)}
                  error={errors.quantity}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Unit</label>
                <Select
                  value={currentItem.unit}
                  onChange={(e) => updateCurrentItem('unit', e.target.value)}
                  options={UNIT_OPTIONS}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Priority</label>
              <Select
                value={currentItem.priority}
                onChange={(e) => updateCurrentItem('priority', e.target.value)}
                options={PRIORITY_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
              <Input
                value={currentItem.notes}
                onChange={(e) => updateCurrentItem('notes', e.target.value)}
                placeholder="Any additional notes"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={addItemToList}
              disabled={!currentItem.name?.trim()}
            >
              <Plus className="w-4 h-4 mr-1" /> Add to List
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <span className="text-sm text-gray-400">
            {items.length} item{items.length !== 1 ? 's' : ''} ready to submit
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={isLoading || (items.length === 0 && !currentItem.name?.trim())}
              isLoading={isLoading}
            >
              Submit {items.length > 0 ? `(${items.length})` : 'All'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RequestMaterialModal;
