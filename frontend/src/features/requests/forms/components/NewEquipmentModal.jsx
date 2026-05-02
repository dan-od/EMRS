/**
 * NewEquipmentModal - Modal for requesting equipment not in the database
 */

import { useState } from 'react';

const EQUIPMENT_CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Measuring Instruments',
  'Pumps',
  'Compressors',
  'Generators',
  'Welding Equipment',
  'Lifting Equipment',
  'Testing Equipment',
  'Safety Equipment',
  'Communication Devices',
  'Other'
];

const NewEquipmentModal = ({ isOpen, onClose, onAdd }) => {
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 1,
    notes: ''
  });

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newItem.name.trim() || !newItem.category) return;

    onAdd({
      equipmentId: null,
      name: newItem.name.trim(),
      category: newItem.category,
      quantity: newItem.quantity || 1,
      isFromDatabase: false,
      isNewRequest: true,
      notes: newItem.notes
    });
    
    setNewItem({ name: '', category: '', quantity: 1, notes: '' });
    onClose();
  };

  const handleClose = () => {
    setNewItem({ name: '', category: '', quantity: 1, notes: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-surface rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text mb-4">Request New Equipment</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Use this form to request equipment that isn't in our inventory system yet.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Equipment Name *</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Hydraulic Pump Model X"
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Category *</label>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select category...</option>
              {EQUIPMENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Additional Notes</label>
            <textarea
              value={newItem.notes}
              onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Specifications, requirements, etc."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text resize-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg text-text-primary dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-card"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newItem.name.trim() || !newItem.category}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            Add to Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewEquipmentModal;
