/**
 * SourcingModal - Start sourcing for NEW_REQUEST items
 */
import { useState } from 'react';
import { Modal, Button, Input } from '@/components/common';
import { Search, Calendar, FileText } from 'lucide-react';

export const SourcingModal = ({ item, onClose, onSubmit, isLoading }) => {
  const [notes, setNotes] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');

  const handleSubmit = () => {
    onSubmit({ notes, estimated_arrival: estimatedArrival || null });
  };

  const itemName = item.requested_item_name || item.client_equipment_name || 'Item';

  return (
    <Modal isOpen onClose={onClose} title="Start Sourcing" size="md">
      <div className="space-y-4">
        {/* Item Info */}
        <div className="p-3 bg-background-secondary rounded-lg">
          <p className="text-sm font-medium text-text-primary">{itemName}</p>
          <div className="flex gap-4 mt-1 text-xs text-text-secondary">
            <span>Qty: {item.quantity}</span>
            <span>Priority: {item.priority}</span>
            <span>Job: {item.job_number}</span>
          </div>
          {item.requested_item_specs && (
            <p className="mt-2 text-xs text-text-secondary">
              <span className="font-medium">Specs:</span> {item.requested_item_specs}
            </p>
          )}
        </div>

        {/* Estimated Arrival */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            Estimated Arrival Date
          </label>
          <input
            type="date"
            value={estimatedArrival}
            onChange={(e) => setEstimatedArrival(e.target.value)}
            className="w-full px-3 py-2 bg-background-secondary border border-border-light rounded-lg text-sm text-text-primary focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            <FileText className="w-4 h-4 inline mr-1" />
            Sourcing Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Vendors contacted, quotes received, etc..."
            rows={3}
            className="w-full px-3 py-2 bg-background-secondary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
            <Search className="w-4 h-4 mr-1" />
            {isLoading ? 'Starting...' : 'Start Sourcing'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SourcingModal;
