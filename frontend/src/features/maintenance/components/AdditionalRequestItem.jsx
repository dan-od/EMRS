/**
 * AdditionalRequestItem
 * Single item row in the additional request form
 */

import { Input, Select } from '@/components/common';
import { Package, Wrench, Trash2 } from 'lucide-react';

const REQUEST_TYPES = [
  { value: 'material', label: 'Material/Part' },
  { value: 'tool', label: 'Tool/Equipment' }
];

const AdditionalRequestItem = ({ item, index, onUpdate, onRemove, canRemove }) => {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-1">
          {item.type === 'material' ? (
            <Package className="w-5 h-5 text-blue-500" />
          ) : (
            <Wrench className="w-5 h-5 text-orange-500" />
          )}
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select
            value={item.type}
            onChange={(e) => onUpdate(index, 'type', e.target.value)}
            options={REQUEST_TYPES}
          />
          <Input
            placeholder="Item name"
            value={item.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            className="md:col-span-2"
          />
          <Input
            type="number"
            placeholder="Qty"
            value={item.quantity}
            onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
            min={1}
          />
        </div>

        {canRemove && (
          <button
            onClick={() => onRemove(index)}
            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-2 ml-8">
        <Input
          placeholder="Specifications (optional)"
          value={item.specifications}
          onChange={(e) => onUpdate(index, 'specifications', e.target.value)}
        />
      </div>
    </div>
  );
};

export default AdditionalRequestItem;
