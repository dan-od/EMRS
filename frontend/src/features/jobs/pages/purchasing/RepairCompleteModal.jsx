/**
 * RepairCompleteModal - Mark equipment repair as complete
 * After repair, item goes to PENDING_REINSPECTION for engineer to re-inspect
 */
import { useState } from 'react';
import { Modal, Button, Input } from '@/components/common';
import { Wrench, CheckCircle, AlertTriangle, Package } from 'lucide-react';

export const RepairCompleteModal = ({ item, isOpen, onClose, onConfirm, isLoading }) => {
  const [notes, setNotes] = useState('');

  if (!isOpen || !item) return null;

  const name = item.equipment_name || item.client_equipment_name || item.requested_item_name;

  const handleSubmit = () => {
    onConfirm(item.job_id, item.id, notes);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark Repair Complete" size="md">
      <div className="space-y-4">
        {/* Item Info */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
              {item.serial_number && (
                <p className="text-sm text-gray-500 dark:text-gray-400">S/N: {item.serial_number}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">Job: {item.job_number}</p>
            </div>
          </div>
        </div>

        {/* Repair Info */}
        {item.repair_notes && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">Original Repair Issue:</p>
            <p className="text-sm text-red-700 dark:text-red-300">{item.repair_notes}</p>
          </div>
        )}

        {/* Info Notice */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-lg flex gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p className="font-medium">After marking complete:</p>
            <p>Equipment will require re-inspection by the engineer before it can be used in the field.</p>
          </div>
        </div>

        {/* Repair Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Repair Completion Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe repairs performed, parts replaced, tests conducted..."
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          <CheckCircle className="w-4 h-4 mr-2" />
          {isLoading ? 'Processing...' : 'Mark Repair Complete'}
        </Button>
      </div>
    </Modal>
  );
};

export default RepairCompleteModal;
