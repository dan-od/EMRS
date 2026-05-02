/**
 * ReturnModal - Accept equipment return with condition and notes
 */
import { useState } from 'react';
import { Modal, Button } from '@/components/common';
import { RotateCcw, AlertTriangle } from 'lucide-react';

const CONDITIONS = [
  { value: 'Good', label: 'Good', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Damaged', label: 'Damaged', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'Needs_Repair', label: 'Needs Repair', color: 'bg-orange-100 text-orange-700 border-orange-300' }
];

export const ReturnModal = ({ item, isOpen, onClose, onConfirm, isLoading }) => {
  const [condition, setCondition] = useState('Good');
  const [hoursUsed, setHoursUsed] = useState('');
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(item.id, condition, hoursUsed ? parseFloat(hoursUsed) : null, notes);
  };

  if (!item) return null;

  const name = item.equipment_name || item.client_equipment_name || item.requested_item_name;
  const isDamaged = condition === 'Damaged' || condition === 'Needs_Repair';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Accept Equipment Return">
      <div className="space-y-4">
        {/* Equipment Info */}
        <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <p className="font-medium">{name}</p>
              {item.serial_number && (
                <p className="text-sm text-gray-600">S/N: {item.serial_number}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Quantity: {item.quantity} • Job: {item.job_number}
              </p>
              {item.disbursed_at && (
                <p className="text-xs text-gray-400 mt-1">
                  Disbursed: {new Date(item.disbursed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Condition Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Return Condition *</label>
          <div className="grid grid-cols-2 gap-2">
            {CONDITIONS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCondition(c.value)}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  condition === c.value 
                    ? `${c.color} border-current` 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Damage Warning */}
        {isDamaged && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">
              This item will be flagged for review. Please provide detailed notes below.
            </p>
          </div>
        )}

        {/* Hours Used */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Hours Used <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="number"
            value={hoursUsed}
            onChange={(e) => setHoursUsed(e.target.value)}
            placeholder="e.g., 48"
            min="0"
            step="0.5"
            className="w-full px-3 py-2 border rounded-lg dark:bg-dark-card dark:border-white/10 focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Inspection Notes {isDamaged && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes about condition, any issues found..."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg resize-none dark:bg-dark-card dark:border-white/10 focus:ring-2 focus:ring-primary-500"
            required={isDamaged}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm} 
            isLoading={isLoading}
            disabled={isDamaged && !notes.trim()}
          >
            <RotateCcw className="w-4 h-4 mr-1" /> Accept Return
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReturnModal;
