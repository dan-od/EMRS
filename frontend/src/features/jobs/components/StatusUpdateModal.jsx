/**
 * StatusUpdateModal Component
 * Modal for updating job status with notes
 */
import { useState } from 'react';
import { Modal, Button, Select, Textarea } from '@/components/common';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useJobActions } from '../hooks/useJobs';

// Valid status transitions
const STATUS_TRANSITIONS = {
  'Draft': ['Team_Assigned', 'Planning'],
  'Team_Assigned': ['Planning'],
  'Planning': ['Inspection', 'Approved'],
  'Inspection': ['Approved', 'Planning'],
  'Approved': ['Equipped'],
  'Equipped': ['In_Transit'],
  'In_Transit': ['In_Progress'],
  'In_Progress': ['Completing'],
  'Completing': ['Post_Job'],
  'Post_Job': ['Completed'],
  'Completed': []
};

const STATUS_LABELS = {
  'Draft': 'Draft',
  'Team_Assigned': 'Team Assigned',
  'Planning': 'Planning',
  'Inspection': 'Inspection',
  'Approved': 'Approved',
  'Equipped': 'Equipped',
  'In_Transit': 'In Transit',
  'In_Progress': 'In Progress',
  'Completing': 'Completing',
  'Post_Job': 'Post Job Review',
  'Completed': 'Completed'
};

export const StatusUpdateModal = ({ jobId, currentStatus, onClose, onSuccess }) => {
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const { updateStatus, isLoading, error } = useJobActions();

  const availableTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  const handleSubmit = async () => {
    if (!newStatus) return;
    try {
      await updateStatus(jobId, newStatus, notes);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const statusOptions = availableTransitions.map(status => ({
    value: status,
    label: STATUS_LABELS[status]
  }));

  return (
    <Modal isOpen onClose={onClose} title="Update Job Status" size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-text-muted">Current:</span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-medium">
            {STATUS_LABELS[currentStatus]}
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-text-muted">New:</span>
          {newStatus ? (
            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 rounded text-sm font-medium">
              {STATUS_LABELS[newStatus]}
            </span>
          ) : (
            <span className="text-sm text-text-muted">Select...</span>
          )}
        </div>

        {availableTransitions.length === 0 ? (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This job is in its final status and cannot be changed.
            </p>
          </div>
        ) : (
          <>
            <Select
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[{ value: '', label: 'Select new status...' }, ...statusOptions]}
              required
            />

            <Textarea
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
              rows={3}
            />

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!newStatus || isLoading || availableTransitions.length === 0}
            loading={isLoading}
          >
            Update Status
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StatusUpdateModal;
