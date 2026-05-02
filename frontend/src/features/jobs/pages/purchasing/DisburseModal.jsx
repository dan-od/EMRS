/**
 * DisburseModal - Confirm equipment disbursement
 */
import { useState } from 'react';
import { Modal, Button } from '@/components/common';
import { Package, CheckCircle } from 'lucide-react';

export const DisburseModal = ({ item, isOpen, onClose, onConfirm, isLoading }) => {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(item.id, notes);
  };

  if (!item) return null;

  const name = item.equipment_name || item.client_equipment_name || item.requested_item_name;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Disbursement">
      <div className="space-y-4">
        {/* Equipment Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">{name}</p>
              {item.serial_number && (
                <p className="text-sm text-gray-600">S/N: {item.serial_number}</p>
              )}
              {item.asset_tag && (
                <p className="text-sm text-gray-500">Asset: {item.asset_tag}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Quantity: {item.quantity} • Job: {item.job_number}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Disbursement Notes <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about condition, special instructions..."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg resize-none dark:bg-dark-card dark:border-white/10 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} isLoading={isLoading}>
            <CheckCircle className="w-4 h-4 mr-1" /> Confirm Disbursement
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DisburseModal;
