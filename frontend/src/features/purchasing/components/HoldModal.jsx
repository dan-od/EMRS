import { useState } from 'react';
import { Modal, Button, Input } from '@/components/common';

const HoldModal = ({ isOpen, onClose, request, onHold, isLoading }) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!notes.trim()) return;
    onHold(notes);
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Put Request on Hold"
    >
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          <strong>Request:</strong> #{request?.id?.slice(0, 8)} - {request?.type}
        </p>
        
        <Input
          label="Reason for Hold (Required)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Item out of stock, awaiting procurement..."
        />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">Cancel</Button>
          <Button
            variant="warning"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!notes.trim()}
            className="w-full sm:w-auto"
          >
            Put on Hold
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default HoldModal;
