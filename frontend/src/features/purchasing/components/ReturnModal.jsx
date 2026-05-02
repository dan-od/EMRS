/**
 * ReturnModal - Per-Item Verification by Purchasing
 * Refactored to use modular components
 */

import { Modal, Button } from '@/components/common';
import { User, Calendar, AlertTriangle, AlertOctagon, CheckCircle, Eye } from 'lucide-react';
import { ConditionBadge } from '@/components/common/ConditionSelector';
import { VerifyItemCard, useVerifyReturn } from './verify';
import { formatDate } from '@/utils/formatters';

const RequestHeader = ({ request }) => (
  <div className="p-4 bg-gray-50 dark:bg-[#242b33] rounded-xl border border-gray-100 dark:border-white/10">
    <div className="flex justify-between items-start mb-3">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Request</p>
        <p className="font-semibold text-text-primary dark:text-white">#{request?.id?.slice(0, 8)} - {request?.type}</p>
      </div>
      <ConditionBadge condition={request?.return_condition} size="md" />
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-200 dark:border-white/10">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Requester</p>
          <p className="text-sm font-medium text-text-primary dark:text-white">{request?.requester_name || 'Unknown'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Disbursed</p>
          <p className="text-sm font-medium text-text-primary dark:text-white">
            {request?.disbursed_at ? formatDate(request.disbursed_at) : 'N/A'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Return Initiated</p>
          <p className="text-sm font-medium text-text-primary dark:text-white">
            {request?.return_initiated_at ? formatDate(request.return_initiated_at) : 'N/A'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Disbursed By</p>
          <p className="text-sm font-medium text-text-primary dark:text-white">{request?.disbursed_by_name || 'Unknown'}</p>
        </div>
      </div>
    </div>

    {request?.return_notes && (
      <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-500/15 rounded-lg border border-purple-100 dark:border-purple-500/20 text-sm text-purple-800 dark:text-purple-300">
        <strong>Engineer's Notes:</strong> {request.return_notes}
      </div>
    )}
  </div>
);

const VerificationSummary = ({ counts }) => (
  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-[#242b33] rounded-lg border border-gray-100 dark:border-white/10">
    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Verified as:</span>
    {counts.Good > 0 && (
      <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
        {counts.Good} Good (restock)
      </span>
    )}
    {counts.Fair > 0 && (
      <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
        {counts.Fair} Fair (restock)
      </span>
    )}
    {counts.Damaged > 0 && (
      <span className="px-2 py-0.5 text-xs font-medium rounded bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400">
        {counts.Damaged} Damaged
      </span>
    )}
    {counts.Lost > 0 && (
      <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
        {counts.Lost} Lost
      </span>
    )}
  </div>
);

const ReturnModal = ({ isOpen, onClose, request, onConfirm, isLoading }) => {
  const {
    verifiedItems,
    notes,
    setNotes,
    conditionCounts,
    hasDiscrepancies,
    hasDamagedOrLost,
    handleConditionChange,
    handleNotesChange,
    buildPayload
  } = useVerifyReturn(request, isOpen);

  const handleSubmit = () => {
    onConfirm(buildPayload());
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Verify Return" size="xl">
      <div className="space-y-5">
        <RequestHeader request={request} />

        {/* Per-Item Verification */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Verify Each Item
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {verifiedItems.length} item{verifiedItems.length !== 1 ? 's' : ''} to verify
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {verifiedItems.map((item, index) => (
              <VerifyItemCard
                key={index}
                item={item}
                index={index}
                onConditionChange={handleConditionChange}
                onNotesChange={handleNotesChange}
              />
            ))}
          </div>
        </div>

        <VerificationSummary counts={conditionCounts} />

        {/* Warnings */}
        {hasDiscrepancies && (
          <div className="p-3 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                You've changed some conditions from what the engineer reported. 
                The verified conditions will be used for inventory updates.
              </p>
            </div>
          </div>
        )}

        {hasDamagedOrLost && (
          <div className="p-3 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/20 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>{conditionCounts.Damaged + conditionCounts.Lost}</strong> item(s) will be logged to 
                Damaged/Missing inventory and will NOT be restocked.
              </p>
            </div>
          </div>
        )}

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">Verification Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes about this return verification..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 resize-none bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-gray-500"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading} className="w-full sm:w-auto">
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm Return
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReturnModal;
