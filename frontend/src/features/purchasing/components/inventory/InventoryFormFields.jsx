import { Input, Select } from '@/components/common';
import { CATEGORY_OPTIONS, UNIT_OPTIONS } from './inventoryConstants';

export const InventoryFormFields = ({ formData, errors, onChange, isEdit = false }) => {
  const handleChange = (field, value) => onChange(field, value);

  return (
    <div className="space-y-4">
      <Input
        label="Item Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          options={CATEGORY_OPTIONS}
          error={errors.category}
          required
        />
        <Select
          label="Unit"
          value={formData.unit}
          onChange={(e) => handleChange('unit', e.target.value)}
          options={UNIT_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isEdit ? (
          <Input
            label="Current Quantity"
            type="number"
            value={formData.currentQuantity || 0}
            disabled
            helperText="Use 'Add Stock' to adjust"
          />
        ) : (
          <Input
            label="Initial Quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            error={errors.quantity}
            required
          />
        )}
        <Input
          label="Reorder Level"
          type="number"
          min="0"
          value={formData.reorder_level}
          onChange={(e) => handleChange('reorder_level', e.target.value)}
        />
      </div>

      <Input
        label="Storage Location"
        value={formData.location}
        onChange={(e) => handleChange('location', e.target.value)}
        placeholder="e.g., Warehouse A, Shelf 3"
      />
    </div>
  );
};
