/**
 * ConfirmReturnModal
 * For Purchasing to confirm returns with per-item condition and notes
 * Shows what engineer reported vs what purchasing confirms
 */

import { useState, useEffect, useMemo } from 'react';
import { Modal, Button } from '@/components/common';
import { Package, Check, AlertTriangle, X } from 'lucide-react';

const ConfirmReturnModal = ({ 
  isOpen, 
  onClose, 
  request, 
  onConfirm,
  isLoading 
}) => {
  const [confirmItems, setConfirmItems] = useState([]);
  const [notes, setNotes] = useState('');

  // Parse request items and return info
  const { requestItems, returnInfo } = useMemo(() => {
    if (!request?.details) return { requestItems: [], returnInfo: null };
    try {
      const details = typeof request.details === 'string' 
        ? JSON.parse(request.details) 
        : request.details;
      return {
        requestItems: details.items || [],
        returnInfo: details.returnInfo || null
      };
    } catch (e) {
      return { requestItems: [], returnInfo: null };
    }
  }, [request]);

  // Initialize confirm items when modal opens
  useEffect(() => {
    if (isOpen && requestItems.length > 0) {
      setConfirmItems(requestItems.map((item, idx) => {
        const returnItem = returnInfo?.returnItems?.[idx];
        return {
          name: item.item || item.name,
          disbursedQty: item.quantity || 1,
          returnedQty: returnItem?.returnQty ?? (item.quantity || 1),
          confirmedQty: returnItem?.returnQty ?? (item.quantity || 1),
          unit: item.unit || 'units',
          condition: returnInfo?.condition || 'Good',
          engineerReason: returnItem?.reason || '',
          inventoryId: item.inventoryId
        };
      }));
      setNotes('');
    }
  }, [isOpen, requestItems, returnInfo]);

  const handleConditionChange = (index, condition) => {
    setConfirmItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], condition };
      return updated;
    });
  };

  const handleConfirmedQtyChange = (index, value) => {
    const qty = Math.max(0, parseInt(value) || 0);
    setConfirmItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], confirmedQty: qty };
      return updated;
    });
  };

  // Calculate totals
  const totalReturned = confirmItems.reduce((sum, item) => sum + item.confirmedQty, 0);
  const totalGoodCondition = confirmItems
    .filter(item => item.condition === 'Good')
    .reduce((sum, item) => sum + item.confirmedQty, 0);

  const handleSubmit = () => {
    const payload = {
      notes,
      confirmedItems: confirmItems.map(item => ({
        name: item.name,
        inventoryId: item.inventoryId,
        confirmedQty: item.confirmedQty,
        condition: item.condition,
        unit: item.unit
      }))
    };
    onConfirm(payload);
  };

  // No items
  if (requestItems.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Confirm Return">
        <div className="p-4 bg-gray-50 dark:bg-dark-card rounded-xl flex items-center gap-2 text-gray-600 dark:text-dark-muted">
          <Package className="w-5 h-5" />
          <span>This request has no items to confirm.</span>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify Return" size="lg">
      <div className="space-y-4">
        {/* Request Info */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-3 bg-gray-50 dark:bg-dark-card/50 rounded-xl border border-gray-100 dark:border-white/10">
          <div>
            <p className="text-xs text-text-secondary dark:text-dark-muted">Request</p>
            <p className="font-semibold text-text-primary dark:text-dark-text">#{request?.id?.slice(0, 8)} - {request?.type}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            returnInfo?.condition === 'Good' 
              ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
              : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
          }`}>
            {returnInfo?.condition || 'Good'}
          </div>
        </div>

        {/* Request Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="p-2 bg-gray-50 dark:bg-dark-card/30 rounded-lg">
            <p className="text-xs text-text-muted dark:text-dark-muted">Requester</p>
            <p className="font-medium text-text-primary dark:text-dark-text">{request?.requester_name}</p>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-dark-card/30 rounded-lg">
            <p className="text-xs text-text-muted dark:text-dark-muted">Disbursed</p>
            <p className="font-medium text-text-primary dark:text-dark-text">{request?.disbursed_at ? new Date(request.disbursed_at).toLocaleDateString() : '-'}</p>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-dark-card/30 rounded-lg">
            <p className="text-xs text-text-muted dark:text-dark-muted">Return Initiated</p>
            <p className="font-medium text-text-primary dark:text-dark-text">{returnInfo?.returnDate ? new Date(returnInfo.returnDate).toLocaleDateString() : '-'}</p>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-dark-card/30 rounded-lg">
            <p className="text-xs text-text-muted dark:text-dark-muted">Disbursed By</p>
            <p className="font-medium text-text-primary dark:text-dark-text">{request?.disbursed_by_name || '-'}</p>
          </div>
        </div>

        {/* Items Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-text-primary dark:text-dark-text flex items-center gap-2">
              <Package className="w-4 h-4" />
              Verify Each Item
            </h4>
            <span className="text-sm text-text-muted dark:text-dark-muted">{confirmItems.length} item to verify</span>
          </div>

          <div className="space-y-3">
            {confirmItems.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-dark-card/50 rounded-xl border border-gray-100 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-text-muted dark:text-dark-muted flex-shrink-0" />
                  <span className="font-medium text-text-primary dark:text-dark-text truncate">{item.name}</span>
                  <span className="text-sm text-text-muted dark:text-dark-muted whitespace-nowrap">({item.disbursedQty} {item.unit})</span>
                </div>

                <div className="flex items-center gap-2 mb-3 text-sm">
                  <span className="text-text-secondary dark:text-dark-muted">Engineer reported:</span>
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                    {returnInfo?.condition || 'Good'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-sm text-text-secondary dark:text-dark-muted whitespace-nowrap">Your verification:</span>
                  <div className="flex flex-wrap gap-1">
                    {['Good', 'Fair', 'Damaged', 'Lost'].map((cond) => (
                      <button
                        key={cond}
                        onClick={() => handleConditionChange(index, cond)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                          item.condition === cond
                            ? cond === 'Good' 
                              ? 'bg-green-100 dark:bg-green-500/20 border-green-300 dark:border-green-500/40 text-green-700 dark:text-green-400'
                              : cond === 'Fair'
                              ? 'bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-400'
                              : cond === 'Damaged'
                              ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400'
                              : 'bg-red-100 dark:bg-red-500/20 border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-400'
                            : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-white/10 text-text-secondary dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-card'
                        }`}
                      >
                        {item.condition === cond && <Check className="w-3 h-3 inline mr-1" />}
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-gray-100 dark:bg-dark-card/80 rounded-xl">
          <p className="text-sm">
            <span className="text-text-secondary dark:text-dark-muted">Verified as: </span>
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
              {totalGoodCondition} Good (restock)
            </span>
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1">
            Verification Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes about this return verification..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text placeholder-text-muted dark:placeholder-dark-muted focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            <Check className="w-4 h-4 mr-1" />
            Confirm Return
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmReturnModal;
