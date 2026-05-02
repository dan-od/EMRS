/**
 * ExtensionRequestModal - Request to extend return date
 */

import { useState } from 'react';
import { Modal, Button } from '@/components/common';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { api } from '@/services/api';
import { EXTENSIONS } from '@/services/endpoints';

const ExtensionRequestModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [requestedDate, setRequestedDate] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const currentDate = request?.expected_return_date 
    ? new Date(request.expected_return_date).toISOString().split('T')[0]
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!requestedDate) {
      setError('Please select a new return date');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the extension');
      return;
    }
    if (new Date(requestedDate) <= new Date(currentDate)) {
      setError('New date must be after current return date');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(EXTENSIONS.BASE, {
        requestId: request.id,
        currentReturnDate: currentDate,
        requestedReturnDate: requestedDate,
        reason: reason.trim()
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit extension request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRequestedDate('');
    setReason('');
    setError('');
    onClose();
  };

  // Calculate minimum date (current date + 1 day)
  const minDate = currentDate 
    ? new Date(new Date(currentDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Return Date Extension" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Info */}
        <div className="p-4 bg-gray-50 dark:bg-dark-card/50 rounded-xl border border-gray-100 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Request</p>
              <p className="font-medium text-text-primary dark:text-dark-text">#{request?.id?.slice(0, 8)} - {request?.type}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-dark-muted">Current Return Date</p>
              <p className="font-medium text-text-primary dark:text-dark-text flex items-center gap-1">
                <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                {currentDate ? formatDate(currentDate) : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* New Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
            New Return Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={requestedDate}
            onChange={(e) => setRequestedDate(e.target.value)}
            min={minDate}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
            Reason for Extension <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you need more time..."
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text placeholder-text-muted dark:placeholder-dark-muted focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Info */}
        <div className="p-3 bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Your extension request will be reviewed by your Department Manager, 
              then by Purchasing before approval.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExtensionRequestModal;
