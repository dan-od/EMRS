/**
 * StatusUpdateModal - Update vehicle status
 */
import { useState, useEffect } from 'react';
import { Button, Select, Modal } from '@/components/common';
import { STATUS_OPTIONS } from '../../constants/vehicleConstants';

const StatusUpdateModal = ({ isOpen, onClose, onSubmit, isLoading, vehicle }) => {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && vehicle) {
      setStatus(vehicle.status);
      setNotes('');
    }
  }, [isOpen, vehicle]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(status, notes);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Vehicle Status">
      <form onSubmit={handleSubmit} className="space-y-4">
        {vehicle && (
          <div className="p-3 bg-gray-50 dark:bg-dark-card/50 rounded-xl border border-gray-100 dark:border-white/10">
            <p className="font-bold text-text-primary dark:text-dark-text">{vehicle.plate_number}</p>
            <p className="text-sm text-gray-600 dark:text-dark-muted">{vehicle.make} {vehicle.model}</p>
          </div>
        )}
        <Select
          label="New Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={STATUS_OPTIONS.filter(s => s.value)}
          required
        />
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Reason for status change..."
            className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-card text-text-primary dark:text-dark-text placeholder:text-text-muted dark:placeholder:text-dark-muted"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isLoading} className="w-full sm:w-auto">Update Status</Button>
        </div>
      </form>
    </Modal>
  );
};

export default StatusUpdateModal;
