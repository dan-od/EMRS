/**
 * RejectModal - Reject job with reason
 */
import { useState } from 'react';
import { Modal, Button } from '@/components/common';
import { AlertTriangle } from 'lucide-react';
import { useJobWorkflow } from '../../hooks';

export const RejectModal = ({ jobId, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { rejectJob } = useJobWorkflow();

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await rejectJob(jobId, reason);
      onSuccess?.();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed');
    }
    setLoading(false);
  };

  return (
    <Modal isOpen onClose={onClose} title="Reject Job">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">Returns job to DRAFT for supervisor to revise.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Reason *</label>
          <textarea className="w-full px-3 py-2 border border-border-light rounded-lg text-sm" value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Why is this being rejected?" />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!reason.trim() || loading}>{loading ? 'Rejecting...' : 'Reject'}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default RejectModal;
