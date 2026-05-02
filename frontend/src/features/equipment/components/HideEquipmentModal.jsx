/**
 * HideEquipmentModal
 * Confirm hiding with optional reason.
 * Backend: POST /equipment/:id/hide { reason }
 */
import { useState } from 'react';
import { Modal, ModalFooter, Button, Textarea } from '@/components/common';
import { equipmentService } from '../services/equipmentService';
import { useUiStore } from '@/store/uiStore';
import { EyeOff } from 'lucide-react';

export const HideEquipmentModal = ({ isOpen, onClose, equipment, onSuccess }) => {
  const { addNotification } = useUiStore();
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleHide = async () => {
    setSaving(true);
    try {
      await equipmentService.hide(equipment.id, reason || null);
      addNotification({ type: 'success', message: `"${equipment.name}" hidden from staff view` });
      onSuccess?.();
      onClose();
    } catch (err) {
      addNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to hide equipment'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hide Equipment"
      description="This will remove the item from regular users' view. Managers and admins can still see it."
      size="sm"
    >
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-4">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>{equipment?.name}</strong> will be hidden. You can unhide it later from the detail page.
        </p>
      </div>

      <Textarea
        label="Reason (optional)"
        placeholder="e.g. Decommissioned, awaiting disposal…"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
      />

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleHide} isLoading={saving}>
          <EyeOff className="w-4 h-4 mr-2" />
          Hide Equipment
        </Button>
      </ModalFooter>
    </Modal>
  );
};
