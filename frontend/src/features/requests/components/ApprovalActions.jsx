import { useState } from 'react';
import { Button, Modal, Textarea, Select } from '@/components/common';
import { Check, X, ArrowRight } from 'lucide-react';

const DEPARTMENTS = [
  { value: 'Operations', label: 'Operations' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Purchasing', label: 'Purchasing' },
  { value: 'Safety', label: 'Safety' },
  { value: 'Finance', label: 'Finance' },
  { value: 'IT', label: 'IT' },
  { value: 'HR', label: 'HR' },
  { value: 'Logistics', label: 'Logistics' },
  { value: 'Workshop', label: 'Workshop' },
];

export const ApprovalActions = ({ onApprove, onReject, onTransfer, isLoading }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [transferDept, setTransferDept] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  const handleApproveClick = () => setShowApproveModal(true);
  const handleRejectClick = () => setShowRejectModal(true);
  const handleTransferClick = () => setShowTransferModal(true);

  const handleApprove = () => {
    onApprove(comments);
    setShowApproveModal(false);
    setComments('');
  };

  const handleReject = () => {
    if (!reason.trim()) return;
    onReject(reason);
    setShowRejectModal(false);
    setReason('');
  };

  const handleTransfer = () => {
    if (!transferDept) return;
    onTransfer(transferDept, transferNotes);
    setShowTransferModal(false);
    setTransferDept('');
    setTransferNotes('');
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="success"
          onClick={handleApproveClick}
          disabled={isLoading}
        >
          <Check className="w-4 h-4 mr-2" />
          Approve
        </Button>
        <Button
          variant="danger"
          onClick={handleRejectClick}
          disabled={isLoading}
        >
          <X className="w-4 h-4 mr-2" />
          Reject
        </Button>
        {onTransfer && (
          <Button
            variant="outline"
            onClick={handleTransferClick}
            disabled={isLoading}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Transfer
          </Button>
        )}
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Request"
      >
        <div className="space-y-4">
          <Textarea
            label="Comments (optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any comments..."
            rows={3}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApprove} isLoading={isLoading}>
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Request"
      >
        <div className="space-y-4">
          <Textarea
            label="Reason for rejection"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason..."
            rows={3}
            error={!reason.trim() ? 'Reason is required' : ''}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleReject} 
              isLoading={isLoading}
              disabled={!reason.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Transfer Request"
      >
        <div className="space-y-4">
          <Select
            label="Transfer to Department"
            value={transferDept}
            onChange={(e) => setTransferDept(e.target.value)}
            options={DEPARTMENTS}
            placeholder="Select department..."
          />
          <Textarea
            label="Notes (optional)"
            value={transferNotes}
            onChange={(e) => setTransferNotes(e.target.value)}
            placeholder="Add any notes for the receiving department..."
            rows={3}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowTransferModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleTransfer} 
              isLoading={isLoading}
              disabled={!transferDept}
            >
              Confirm Transfer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
