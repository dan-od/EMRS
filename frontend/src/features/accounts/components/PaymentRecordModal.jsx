/**
 * PaymentRecordModal Component
 * Modal for recording final payment on a work order
 */

import { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle } from 'lucide-react';

const PaymentRecordModal = ({ 
  isOpen, 
  onClose, 
  workOrder, 
  onSubmit, 
  isLoading = false 
}) => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Pre-fill with actual cost when work order changes
  useEffect(() => {
    if (workOrder?.actual_cost) {
      setAmount(workOrder.actual_cost.toString());
    }
    setNotes('');
    setError('');
  }, [workOrder]);

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `₦${num.toLocaleString()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    try {
      await onSubmit({
        amount: numAmount,
        notes: notes.trim() || null
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    }
  };

  if (!isOpen || !workOrder) return null;

  const variance = parseFloat(amount) - (workOrder.actual_cost || 0);
  const hasVariance = Math.abs(variance) > 0.01;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1f26] rounded-xl shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <CreditCard className="text-primary" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Record Payment
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Work Order Info */}
          <div className="bg-gray-50 dark:bg-[#232a33] rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-500 dark:text-dark-muted mb-1">
              Work Order: <span className="font-mono">WO-{workOrder.id?.slice(0, 8)}</span>
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {workOrder.equipment_name}
            </p>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-gray-500 dark:text-dark-muted">Actual Cost:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(workOrder.actual_cost)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Amount (₦) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#232a33] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            {hasVariance && (
              <p className={`text-xs mt-1 ${variance > 0 ? 'text-orange-500' : 'text-blue-500'}`}>
                {variance > 0 ? '+' : ''}{formatCurrency(variance)} variance from actual cost
              </p>
            )}
          </div>

          {/* Notes Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Invoice number, payment reference, or other notes..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#232a33] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  Recording...
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Record Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentRecordModal;
