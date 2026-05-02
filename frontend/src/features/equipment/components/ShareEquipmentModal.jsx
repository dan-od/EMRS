/**
 * ShareEquipmentModal
 * Multi-select departments to share equipment with.
 * Backend: POST /equipment/:id/share { departments: [...] }
 */
import { useState, useEffect } from 'react';
import { Modal, ModalFooter, Button } from '@/components/common';
import { equipmentService } from '../services/equipmentService';
import { useUiStore } from '@/store/uiStore';
import { DEPARTMENTS_LIST } from '@/utils/equipmentConstants';
import { Share2, Check } from 'lucide-react';

export const ShareEquipmentModal = ({ isOpen, onClose, equipment, onSuccess }) => {
  const { addNotification } = useUiStore();
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  const owningDept = equipment?.owning_department;

  // Seed from current sharing
  useEffect(() => {
    if (isOpen && equipment) {
      setSelected(equipment.shared_with_departments || []);
    }
  }, [isOpen, equipment]);

  const toggle = (dept) => {
    setSelected(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await equipmentService.updateSharing(equipment.id, selected);
      addNotification({ type: 'success', message: 'Sharing updated' });
      onSuccess?.();
      onClose();
    } catch (err) {
      addNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update sharing'
      });
    } finally {
      setSaving(false);
    }
  };

  // Departments available to share with (exclude owning dept)
  const shareable = DEPARTMENTS_LIST.filter(d => d !== owningDept);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Equipment"
      description={`Select departments to share "${equipment?.name}" with`}
      size="md"
    >
      <div className="mb-2 text-xs text-text-secondary dark:text-dark-muted">
        Owner: <span className="font-medium text-text-primary dark:text-dark-text">{owningDept}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto py-2">
        {shareable.map(dept => {
          const active = selected.includes(dept);
          return (
            <button
              key={dept}
              type="button"
              onClick={() => toggle(dept)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all
                ${active
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-white/10 text-text-secondary dark:text-dark-muted hover:border-gray-300 dark:hover:border-white/20'
                }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors
                ${active
                  ? 'bg-primary-500 text-white'
                  : 'border border-gray-300 dark:border-white/20'
                }`}>
                {active && <Check className="w-3 h-3" />}
              </div>
              <span className="truncate">{dept.replace(/_/g, ' ')}</span>
            </button>
          );
        })}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} isLoading={saving}>
          <Share2 className="w-4 h-4 mr-2" />
          Save Sharing
        </Button>
      </ModalFooter>
    </Modal>
  );
};
