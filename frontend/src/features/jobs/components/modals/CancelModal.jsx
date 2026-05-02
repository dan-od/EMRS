/**
 * CancelModal - Cancel job with reason
 */
import { useState } from 'react';
import { Modal, Button } from '@/components/common';
import { AlertTriangle } from 'lucide-react';
import { useJobWorkflow } from '../../hooks';

export const CancelModal = ({ jobId, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { cancelJob } = useJobWorkflow();

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await cancelJob(jobId, reason);
      onSuccess?.();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed');
    }
    setLoading(false);
  };

  return (
    <Modal isOpen onClose={onClose} title="Cancel Job">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">This action cannot be undone.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Reason *</label>
          <textarea className="w-full px-3 py-2 border border-border-light rounded-lg text-sm" value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Why is this job being cancelled?" />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Keep Job</Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!reason.trim() || loading}>{loading ? 'Cancelling...' : 'Cancel Job'}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelModal;
