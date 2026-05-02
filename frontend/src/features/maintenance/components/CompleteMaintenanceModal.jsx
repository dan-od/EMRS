/**
 * CompleteMaintenanceModal Component
 * Modal form for completing maintenance
 */

import { useState } from 'react';
import { Modal, Button, Input, Textarea } from '@/components/common';
import { CheckCircle } from 'lucide-react';

const CompleteMaintenanceModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  maintenance,
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    notes: '',
    labor_hours: '',
    cost: '',
    parts_used: ''
  });

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      notes: formData.notes,
      labor_hours: parseFloat(formData.labor_hours) || 0,
      cost: parseFloat(formData.cost) || 0,
      parts_used: formData.parts_used
    });
  };

  const handleClose = () => {
    setFormData({ notes: '', labor_hours: '', cost: '', parts_used: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Complete Maintenance" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Banner */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>{maintenance?.equipment_name}</strong> - {maintenance?.maintenance_type?.replace(/_/g, ' ')}
          </p>
        </div>

        {/* Completion Notes */}
        <Textarea
          label="Completion Notes"
          value={formData.notes}
          onChange={handleChange('notes')}
          placeholder="Describe work performed..."
          rows={3}
          required
        />

        {/* Labor & Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Labor Hours"
            value={formData.labor_hours}
            onChange={handleChange('labor_hours')}
            placeholder="e.g. 4.5"
            step="0.5"
          />
          <Input
            type="number"
            label="Total Cost (₦)"
            value={formData.cost}
            onChange={handleChange('cost')}
            placeholder="e.g. 45000"
          />
        </div>

        {/* Parts Used */}
        <Textarea
          label="Parts Used"
          value={formData.parts_used}
          onChange={handleChange('parts_used')}
          placeholder="List parts used (e.g. Oil filter x1, Hydraulic oil 5L x2)"
          rows={2}
        />

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" variant="success" isLoading={isLoading} className="w-full sm:w-auto">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CompleteMaintenanceModal;
