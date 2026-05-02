/**
 * ConditionSelector - Reusable condition selection component
 * Used in InitiateReturnModal and ReturnModal
 */

import { CheckCircle } from 'lucide-react';

export const CONDITION_OPTIONS = [
  { value: 'Good', label: 'Good', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { value: 'Fair', label: 'Fair', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { value: 'Damaged', label: 'Damaged', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  { value: 'Lost', label: 'Lost', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
];

export const ConditionBadge = ({ condition, size = 'sm' }) => {
  const config = CONDITION_OPTIONS.find(c => c.value === condition) || CONDITION_OPTIONS[0];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`${sizeClass} font-medium rounded ${config.bg} ${config.color}`}>
      {condition}
    </span>
  );
};

const ConditionSelector = ({ 
  name, 
  value, 
  onChange, 
  showLabels = true,
  compact = false 
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? '' : 'mb-2'}`}>
      {CONDITION_OPTIONS.map(opt => (
        <label 
          key={opt.value}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer border transition-all
            ${value === opt.value 
              ? `${opt.bg} ${opt.border} ${opt.color} ring-2 ring-offset-1 ring-current` 
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="sr-only"
          />
          {value === opt.value && <CheckCircle className="w-3.5 h-3.5" />}
          {showLabels && <span className="text-sm font-medium">{opt.label}</span>}
        </label>
      ))}
    </div>
  );
};

export default ConditionSelector;
