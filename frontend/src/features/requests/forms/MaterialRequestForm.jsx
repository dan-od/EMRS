/**
 * Material Request Form
 * Form for consumables, chemicals, spare parts requests
 */

import { useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const MaterialRequestForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    priority: 'Medium',
    items: [{ name: '', quantity: 1, unit: 'pcs', specifications: '' }],
    purpose: '',
    dateNeeded: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { 
      ...newItems[index], 
      [field]: field === 'quantity' ? parseInt(value) || 1 : value 
    };
    setFormData(prev => ({ ...prev, items: newItems }));
    if (errors.items) setErrors(prev => ({ ...prev, items: null }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, unit: 'pcs', specifications: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const validItems = formData.items.filter(item => item.name.trim());
    if (validItems.length === 0) {
      newErrors.items = 'Add at least one item';
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Format data to match backend schema
      const payload = {
        type: 'Material',
        priority: formData.priority,
        details: {
          items: formData.items
            .filter(item => item.name.trim())
            .map(item => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit || undefined,
              specifications: item.specifications || undefined
            })),
          purpose: formData.purpose
        },
        dateNeeded: formData.dateNeeded ? new Date(formData.dateNeeded).toISOString() : undefined
      };
      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Items List */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Items <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-[#0f1419] rounded-lg border border-gray-200 dark:border-white/10 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={item.unit}
                  onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="liters">liters</option>
                  <option value="meters">meters</option>
                  <option value="boxes">boxes</option>
                  <option value="sets">sets</option>
                </select>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Specifications (optional)"
                value={item.specifications}
                onChange={(e) => handleItemChange(index, 'specifications', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
        </div>
        {errors.items && <p className="text-red-500 text-sm mt-1">{errors.items}</p>}
        <button
          type="button"
          onClick={addItem}
          className="mt-2 flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add Another Item
        </button>
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
          placeholder="Describe why you need these materials..."
          className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 resize-none ${
            errors.purpose ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
          }`}
        />
        {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Material Request'
        )}
      </button>
    </form>
  );
};

export default MaterialRequestForm;
