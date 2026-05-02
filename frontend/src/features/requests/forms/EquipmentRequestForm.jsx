/**
 * EquipmentRequestForm - Main form component
 * Composes smaller components for equipment selection and request
 */

import { useState, useMemo } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { EquipmentSearch, SelectedEquipmentList, NewEquipmentModal } from './components';

const EquipmentRequestForm = ({ onSubmit, isLoading }) => {
  // Fetch equipment from database
  const { data: equipmentData, isLoading: loadingEquipment, error } = useApi('/equipment');
  
  const equipmentList = useMemo(() => {
    if (!equipmentData) return [];
    // Handle various response formats
    if (Array.isArray(equipmentData)) return equipmentData;
    if (equipmentData.data && Array.isArray(equipmentData.data)) return equipmentData.data;
    if (equipmentData.equipment && Array.isArray(equipmentData.equipment)) return equipmentData.equipment;
    // If it's an object with equipment items as properties
    if (typeof equipmentData === 'object') {
      const keys = Object.keys(equipmentData);
      if (keys.length > 0 && equipmentData[keys[0]]?.id) {
        return Object.values(equipmentData);
      }
    }
    return [];
  }, [equipmentData]);

  // State
  const [selectedItems, setSelectedItems] = useState([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({
    priority: 'Medium',
    duration: '',
    purpose: '',
    dateNeeded: ''
  });
  const [errors, setErrors] = useState({});

  // Handlers
  const handleSelectEquipment = (equipment) => {
    if (selectedItems.some(item => item.equipmentId === equipment.id)) return;

    setSelectedItems(prev => [...prev, {
      equipmentId: equipment.id,
      name: equipment.name,
      serialNumber: equipment.serial_number,
      category: equipment.category,
      location: equipment.location,
      quantity: 1,
      isFromDatabase: true
    }]);
  };

  const handleAddNewItem = (item) => {
    setSelectedItems(prev => [...prev, item]);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index, field, value) => {
    setSelectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (selectedItems.length === 0) newErrors.items = 'At least one equipment item is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const items = selectedItems.map(item => ({
      item: item.name,
      equipmentId: item.equipmentId,
      category: item.category,
      quantity: item.quantity || 1,
      serialNumber: item.serialNumber,
      location: item.location,
      isFromDatabase: item.isFromDatabase,
      isNewRequest: item.isNewRequest || false,
      notes: item.notes
    }));

    onSubmit({
      type: 'Equipment',
      priority: formData.priority,
      details: {
        items,
        duration: formData.duration,
        purpose: formData.purpose,
        equipmentType: items.map(i => i.item).join(', ')
      },
      dateNeeded: formData.dateNeeded ? new Date(formData.dateNeeded).toISOString() : undefined
    });
  };

  const selectedIds = selectedItems.filter(i => i.equipmentId).map(i => i.equipmentId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Equipment Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Equipment Items <span className="text-red-500">*</span>
        </label>

        <EquipmentSearch
          equipmentList={equipmentList}
          isLoading={loadingEquipment}
          selectedIds={selectedIds}
          onSelect={handleSelectEquipment}
          onRequestNew={() => setShowNewModal(true)}
        />

        <SelectedEquipmentList
          items={selectedItems}
          onUpdate={handleUpdateItem}
          onRemove={handleRemoveItem}
        />

        {errors.items && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.items}
          </p>
        )}
      </div>

      <NewEquipmentModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onAdd={handleAddNewItem}
      />

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Duration <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="e.g., 2 days, 1 week, Until job completion"
          className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500 ${
            errors.duration ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
          }`}
        />
        {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
      </div>

      {/* Priority & Date Needed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Needed</label>
          <input
            type="date"
            name="dateNeeded"
            value={formData.dateNeeded}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Purpose <span className="text-red-500">*</span>
        </label>
        <textarea
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          rows={3}
          placeholder="Describe why you need this equipment and what it will be used for..."
          className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 resize-none ${
            errors.purpose ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
          }`}
        />
        {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || selectedItems.length === 0}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Equipment Request'
        )}
      </button>
    </form>
  );
};

export default EquipmentRequestForm;
