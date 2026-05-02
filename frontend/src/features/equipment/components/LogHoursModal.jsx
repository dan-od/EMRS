import { useState } from 'react';
import { Modal, Button, Input } from '@/components/common';
import { Clock } from 'lucide-react';

export const LogHoursModal = ({ isOpen, onClose, equipment, onSubmit, isLoading }) => {
  const [hours, setHours] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const numHours = parseFloat(hours);
    
    if (isNaN(numHours) || numHours <= 0) {
      setError('Please enter a valid number of hours');
      return;
    }

    onSubmit(numHours);
    setHours('');
    setError('');
  };

  const handleClose = () => {
    setHours('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Log Equipment Hours">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <p className="text-sm text-text-secondary mb-3">
            Logging hours for: <strong>{equipment?.name}</strong>
          </p>
          <p className="text-sm text-text-muted mb-4">
            Current hours: {equipment?.current_hours || 0}
          </p>

          <Input
            label="Hours to Add"
            type="number"
            step="0.5"
            min="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            error={error}
            placeholder="Enter hours"
            leftIcon={<Clock className="w-4 h-4" />}
            autoFocus
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            Log Hours
          </Button>
        </div>
      </form>
    </Modal>
  );
};
