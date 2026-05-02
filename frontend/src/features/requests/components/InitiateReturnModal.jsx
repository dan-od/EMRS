/**
 * InitiateReturnModal - Per-Item Condition Reporting
 * Refactored to use modular components
 */

import { Modal, Button } from '@/components/common';
import { AlertTriangle } from 'lucide-react';
import { CONDITION_OPTIONS } from '@/components/common/ConditionSelector';
import { ReturnItemCard, useInitiateReturn } from './return';

const QuickSetButtons = ({ onApply }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-sm text-gray-500 dark:text-gray-400">Quick set all:</span>
    {CONDITION_OPTIONS.map(opt => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onApply(opt.value)}
        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors
          ${opt.bg} ${opt.color} ${opt.border} hover:opacity-80`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const ConditionSummary = ({ counts }) => (
  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-dark-card rounded-lg">
    <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">Summary:</span>
    {counts.Good > 0 && (
      <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        {counts.Good} Good
      </span>
    )}
    {counts.Fair > 0 && (
      <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
        {counts.Fair} Fair
      </span>
    )}
    {counts.Damaged > 0 && (
      <span className="px-2 py-0.5 text-xs font-medium rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
        {counts.Damaged} Damaged
      </span>
    )}
    {counts.Lost > 0 && (
      <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
        {counts.Lost} Lost
      </span>
    )}
  </div>
);

const InitiateReturnModal = ({ isOpen, onClose, request, onInitiate, isLoading }) => {
  const {
    returnItems,
    generalNotes,
    setGeneralNotes,
    requestType,
    conditionCounts,
    hasDamagedOrLost,
    damagedItemsHaveNotes,
    canSubmit,
    handleConditionChange,
    handleNotesChange,
    applyToAll,
    buildPayload
  } = useInitiateReturn(request, isOpen);

  const handleSubmit = () => {
    onInitiate(buildPayload());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Initiate Return" size="lg">
      <div className="space-y-4">
        {/* Request Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-gray-50 dark:bg-dark-card rounded-lg">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Request</span>
            <p className="font-medium text-text-primary dark:text-dark-text">#{request?.id?.slice(0, 8)} - {requestType}</p>
          </div>
          <div className="sm:text-right">
            <span className="text-sm text-gray-500 dark:text-gray-400">Return Due</span>
            <p className="font-medium text-text-primary dark:text-dark-text">
              {request?.expected_return_date 
                ? new Date(request.expected_return_date).toLocaleDateString() 
                : 'Not set'}
            </p>
          </div>
        </div>

        {/* Quick Apply Buttons */}
        {returnItems.length > 1 && <QuickSetButtons onApply={applyToAll} />}

        {/* Items with Per-Item Conditions */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Report condition for each item:</p>
          
          {returnItems.map((item, index) => (
            <ReturnItemCard
              key={index}
              item={item}
              index={index}
              onConditionChange={handleConditionChange}
              onNotesChange={handleNotesChange}
            />
          ))}
        </div>

        <ConditionSummary counts={conditionCounts} />

        {/* Warning for damaged/lost */}
        {hasDamagedOrLost && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Note:</strong> Damaged/Lost items will be logged for Purchasing review.
                {!damagedItemsHaveNotes && (
                  <p className="text-red-600 dark:text-red-400 mt-1">Please provide notes for all damaged/lost items.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* General Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Additional Notes (Optional)</label>
          <textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="Any other information about this return..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!canSubmit}
          >
            Initiate Return
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InitiateReturnModal;
