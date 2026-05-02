/**
 * RequestActionPanels — Approve/Reject forms for equipment requests
 */
import { useState } from 'react';
import { Card, Button, Input, Textarea } from '@/components/common';
import { CheckCircle, XCircle } from 'lucide-react';

export const RequestActionPanels = ({ onApprove, onReject, processing }) => {
  const [mode, setMode] = useState(null); // 'approve' | 'reject' | null
  const [cost, setCost] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  if (!mode) {
    return (
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setMode('approve')} className="flex-1 w-full sm:w-auto">
            <CheckCircle className="w-4 h-4 mr-2" />Approve
          </Button>
          <Button variant="danger" onClick={() => setMode('reject')} className="flex-1 w-full sm:w-auto">
            <XCircle className="w-4 h-4 mr-2" />Reject
          </Button>
        </div>
      </Card>
    );
  }

  if (mode === 'approve') {
    return (
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Approve Request</h3>
        <div className="space-y-4">
          <Input label="Cost (₦) — optional" type="number" min="0" step="0.01"
            value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Enter cost if known" />
          <Textarea label="Notes (optional)" value={approveNotes}
            onChange={(e) => setApproveNotes(e.target.value)} rows={2} placeholder="Any notes for the record…" />
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setMode(null)} disabled={processing} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={() => onApprove({ cost: cost ? Number(cost) : null, notes: approveNotes || null })} isLoading={processing} className="w-full sm:w-auto">
              <CheckCircle className="w-4 h-4 mr-2" />Confirm Approval
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Reject Request</h3>
      <div className="space-y-4">
        <Textarea label="Reason for rejection" value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)} rows={3}
          placeholder="Explain why this request is being rejected…" required />
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button variant="ghost" onClick={() => setMode(null)} disabled={processing} className="w-full sm:w-auto">Cancel</Button>
          <Button variant="danger" onClick={() => onReject(rejectReason)} isLoading={processing} className="w-full sm:w-auto">
            <XCircle className="w-4 h-4 mr-2" />Confirm Rejection
          </Button>
        </div>
      </div>
    </Card>
  );
};
