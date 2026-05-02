/**
 * CreateMaintenanceModal Component
 * Modal form for creating new maintenance
 */

import { useState } from 'react';
import { Modal, Button, Input, Select, Textarea } from '@/components/common';
import { Wrench } from 'lucide-react';

const MAINTENANCE_TYPES = [
  { value: 'Routine_Service', label: 'Routine Service' },
  { value: 'Repair', label: 'Repair' },
  { value: 'Inspection', label: 'Inspection' },
  { value: 'Calibration', label: 'Calibration' },
  { value: 'Overhaul', label: 'Overhaul' },
  { value: 'Emergency', label: 'Emergency' }
];

const PRIORITIES = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' }
];

const CreateMaintenanceModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  equipment = [],
  isLoading 
}) => {
  // Ensure equipment is always an array
  const equipmentList = Array.isArray(equipment) ? equipment : [];
  
  const [formData, setFormData] = useState({
    equipment_id: '',
    maintenance_type: '',
    description: '',
    scheduled_date: '',
    priority: 'Medium',
    estimated_hours: '',
    notes: ''
  });

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      equipment_id: '',
      maintenance_type: '',
      description: '',
      scheduled_date: '',
      priority: 'Medium',
      estimated_hours: '',
      notes: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Schedule Maintenance" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Equipment */}
        <Select
          label="Equipment"
          value={formData.equipment_id}
          onChange={handleChange('equipment_id')}
          required
        >
          <option value="">Select equipment...</option>
          {equipmentList.map(eq => (
            <option key={eq.id} value={eq.id}>
              {eq.name} ({eq.serial_number})
            </option>
          ))}
        </Select>

        {/* Type & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Maintenance Type"
            value={formData.maintenance_type}
            onChange={handleChange('maintenance_type')}
            required
          >
            <option value="">Select type...</option>
            {MAINTENANCE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>

          <Select
            label="Priority"
            value={formData.priority}
            onChange={handleChange('priority')}
          >
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </div>

        {/* Schedule & Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Scheduled Date"
            value={formData.scheduled_date}
            onChange={handleChange('scheduled_date')}
            required
          />
          <Input
            type="number"
            label="Estimated Hours"
            value={formData.estimated_hours}
            onChange={handleChange('estimated_hours')}
            placeholder="e.g. 4"
          />
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          value={formData.description}
          onChange={handleChange('description')}
          placeholder="Describe the maintenance work..."
          rows={3}
          required
        />

        {/* Notes */}
        <Textarea
          label="Additional Notes"
          value={formData.notes}
          onChange={handleChange('notes')}
          placeholder="Any additional notes..."
          rows={2}
        />

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            <Wrench className="w-4 h-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateMaintenanceModal;
