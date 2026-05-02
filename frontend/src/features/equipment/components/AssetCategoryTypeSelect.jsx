/**
 * AssetCategoryTypeSelect
 * Reusable paired dropdowns: asset_category → type (cascading)
 * Used by AddEquipment, EditEquipment, and RequestAssetForm
 */
import { memo } from 'react';
import { Select } from '@/components/common';
import {
  ASSET_CATEGORIES,
  ASSET_CATEGORY_LABELS,
  getTypesForCategory
} from '@/utils/equipmentConstants';

export const AssetCategoryTypeSelect = memo(({
  category,
  type,
  onCategoryChange,
  onTypeChange,
  customTypes = [],
  required = true
}) => {
  const typeOptions = getTypesForCategory(category);

  // Merge custom types for current category
  const allTypeOptions = [
    ...typeOptions,
    ...customTypes
      .filter(ct => !category || ct.asset_category === category)
      .map(ct => ({ value: ct.name, label: ct.display_name || ct.displayName }))
  ];

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    onCategoryChange(val);
    // Reset type when switching category
    onTypeChange('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select
        label="Asset Category"
        value={category}
        onChange={handleCategoryChange}
        required={required}
      >
        <option value="">Select category…</option>
        {ASSET_CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{ASSET_CATEGORY_LABELS[cat]}</option>
        ))}
      </Select>

      <Select
        label="Type"
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        required={required}
        disabled={!category}
      >
        <option value="">{category ? 'Select type…' : 'Choose category first'}</option>
        {allTypeOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Select>
    </div>
  );
});

AssetCategoryTypeSelect.displayName = 'AssetCategoryTypeSelect';
