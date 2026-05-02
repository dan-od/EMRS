/**
 * PPE Request Form
 * Form for Personal Protective Equipment requests
 */

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const PPE_ITEMS = [
  'Safety Helmet',
  'Safety Goggles',
  'Safety Gloves',
  'Safety Boots',
  'High-Vis Vest',
  'Ear Protection',
  'Face Shield',
  'Coveralls',
  'Respirator',
  'Fall Harness'
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const PPERequestForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    priority: 'Medium',
    items: [{ item: '', size: 'L', quantity: 1 }],
    reason: '',
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
    newItems[index] = { ...newItems[index], [field]: field === 'quantity' ? parseInt(value) || 1 : value };
    setFormData(prev => ({ ...prev, items: newItems }));
    if (errors.items) setErrors(prev => ({ ...prev, items: null }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item: '', size: 'L', quantity: 1 }]
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
    const validItems = formData.items.filter(item => item.item.trim());
    if (validItems.length === 0) {
      newErrors.items = 'Select at least one PPE item';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Format data to match backend schema
      const payload = {
        type: 'PPE',
        priority: formData.priority,
        details: {
          items: formData.items
            .filter(item => item.item.trim())
            .map(item => ({
              item: item.item,
              size: item.size,
              quantity: item.quantity
            })),
          reason: formData.reason || undefined
        },
        dateNeeded: formData.dateNeeded ? new Date(formData.dateNeeded).toISOString() : undefined
      };
      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* PPE Items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          PPE Items <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="flex flex-wrap gap-2 items-start p-3 bg-gray-50 dark:bg-[#0f1419] rounded-lg border border-gray-200 dark:border-white/10">
              <select
                value={item.item}
                onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select PPE item...</option>
                {PPE_ITEMS.map(ppeItem => (
                  <option key={ppeItem} value={ppeItem}>{ppeItem}</option>
                ))}
              </select>
              <select
                value={item.size}
                onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                {SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                className="w-20 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Qty"
              />
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.items && <p className="text-red-500 text-sm mt-1">{errors.items}</p>}
        <button
          type="button"
          onClick={addItem}
          className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
        >
          + Add Another Item
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

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason (Optional)</label>
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          rows={3}
          placeholder="Why do you need this PPE?"
          className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 resize-none"
        />
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
          'Submit PPE Request'
        )}
      </button>
    </form>
  );
};

export default PPERequestForm;
