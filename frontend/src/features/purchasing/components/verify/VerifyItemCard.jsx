/**
 * VerifyItemCard - Individual item verification card for Purchasing
 */

import { Package, CheckCircle } from 'lucide-react';
import { CONDITION_OPTIONS, ConditionBadge } from '@/components/common/ConditionSelector';

const VerifyItemCard = ({ 
  item, 
  index, 
  onConditionChange, 
  onNotesChange 
}) => {
  const conditionMismatch = item.condition !== item.verifiedCondition;
  const isBadCondition = item.verifiedCondition === 'Damaged' || item.verifiedCondition === 'Lost';

  return (
    <div 
      className={`p-4 rounded-xl border ${
        isBadCondition ? 'bg-red-50 dark:bg-red-500/15 border-red-200 dark:border-red-500/30' :
        conditionMismatch ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30' :
        'bg-white dark:bg-[#242b33] border-gray-200 dark:border-white/10'
      }`}
    >
      {/* Item Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="font-medium text-text-primary dark:text-white">{item.name}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({item.quantity} {item.unit})
          </span>
        </div>
      </div>

      {/* Engineer's Report */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-gray-100 dark:bg-[#1a1f26] rounded-lg text-sm border border-gray-100 dark:border-white/5">
        <span className="text-gray-600 dark:text-gray-400">Engineer reported:</span>
        <ConditionBadge condition={item.condition} />
        {item.notes && (
          <span className="text-gray-600 dark:text-gray-400 ml-2 truncate">- "{item.notes}"</span>
        )}
      </div>

      {/* Purchasing Verification */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your verification:</span>
        {CONDITION_OPTIONS.map(opt => (
          <label 
            key={opt.value}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer border transition-all
              ${item.verifiedCondition === opt.value 
                ? `${opt.bg} ${opt.darkBg || ''} ${opt.border} ${opt.darkBorder || ''} ${opt.color} ${opt.darkColor || ''} ring-2 ring-offset-1 dark:ring-offset-[#1a1f26]` 
                : 'bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            <input
              type="radio"
              name={`verify-${index}`}
              value={opt.value}
              checked={item.verifiedCondition === opt.value}
              onChange={() => onConditionChange(index, opt.value)}
              className="sr-only"
            />
            {item.verifiedCondition === opt.value && <CheckCircle className="w-3.5 h-3.5" />}
            <span className="text-sm font-medium">{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Discrepancy Note */}
      {conditionMismatch && (
        <input
          type="text"
          value={item.verificationNotes || ''}
          onChange={(e) => onNotesChange(index, e.target.value)}
          placeholder="Note why you changed the condition..."
          className="mt-2 w-full px-3 py-2 text-sm border border-amber-300 dark:border-amber-500/40 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white placeholder-text-muted dark:placeholder-gray-500"
        />
      )}
    </div>
  );
};

export default VerifyItemCard;
