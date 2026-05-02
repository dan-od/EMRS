/**
 * AddLogModal Component
 * Modal for adding manual log entries
 */

import { useState } from 'react';
import { Modal, Button, Select, Textarea, Input } from '@/components/common';
import { Plus } from 'lucide-react';

const GENERAL_LOG_TYPES = [
  { value: 'Transport', label: 'Transport' },
  { value: 'Location_Change', label: 'Location Change' },
  { value: 'Assignment', label: 'Assignment' },
  { value: 'Note', label: 'Note' },
  { value: 'Other', label: 'Other' }
];

const MAINTENANCE_LOG_TYPES = [
  { value: 'Inspection', label: 'Inspection' },
  { value: 'Calibration', label: 'Calibration' },
  { value: 'Repair', label: 'Repair' },
  { value: 'Routine_Service', label: 'Routine Service' },
  { value: 'Parts_Replaced', label: 'Parts Replaced' },
  { value: 'Note', label: 'Note' },
  { value: 'Other', label: 'Other' }
];

const AddLogModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  logType = 'general',
  isLoading 
}) => {
  const isGeneral = logType === 'general';
  const types = isGeneral ? GENERAL_LOG_TYPES : MAINTENANCE_LOG_TYPES;

  const [formData, setFormData] = useState({
    entry_type: '',
    description: '',
    entry_date: new Date().toISOString().split('T')[0],
    // General log specific
    location_from: '',
    location_to: '',
    // Maintenance log specific
    equipment_hours: '',
    labor_hours: '',
    cost: '',
    parts_used: '',
    notes: ''
  });

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      entry_type: formData.entry_type,
      description: formData.description,
      entry_date: formData.entry_date,
      notes: formData.notes || null
    };

    if (isGeneral) {
      data.location_from = formData.location_from || null;
      data.location_to = formData.location_to || null;
    } else {
      data.equipment_hours = formData.equipment_hours ? parseInt(formData.equipment_hours) : null;
      data.labor_hours = formData.labor_hours ? parseFloat(formData.labor_hours) : null;
      data.cost = formData.cost ? parseFloat(formData.cost) : null;
      data.parts_used = formData.parts_used || null;
    }

    onSubmit(data);
  };

  const handleClose = () => {
    setFormData({
      entry_type: '',
      description: '',
      entry_date: new Date().toISOString().split('T')[0],
      location_from: '',
      location_to: '',
      equipment_hours: '',
      labor_hours: '',
      cost: '',
      parts_used: '',
      notes: ''
    });
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={`Add ${isGeneral ? 'General' : 'Maintenance'} Log Entry`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Entry Type"
            value={formData.entry_type}
            onChange={handleChange('entry_type')}
            required
          >
            <option value="">Select type...</option>
            {types.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>

          <Input
            type="date"
            label="Date"
            value={formData.entry_date}
            onChange={handleChange('entry_date')}
            required
          />
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          value={formData.description}
          onChange={handleChange('description')}
          placeholder="Describe the activity..."
          rows={3}
          required
        />

        {/* General Log: Location fields */}
        {isGeneral && formData.entry_type === 'Transport' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="From Location"
              value={formData.location_from}
              onChange={handleChange('location_from')}
              placeholder="e.g. Lagos Warehouse"
            />
            <Input
              label="To Location"
              value={formData.location_to}
              onChange={handleChange('location_to')}
              placeholder="e.g. Port Harcourt"
            />
          </div>
        )}

        {/* Maintenance Log: Additional fields */}
        {!isGeneral && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="number"
                label="Equipment Hours"
                value={formData.equipment_hours}
                onChange={handleChange('equipment_hours')}
                placeholder="e.g. 2450"
              />
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
                label="Cost (₦)"
                value={formData.cost}
                onChange={handleChange('cost')}
                placeholder="e.g. 45000"
              />
            </div>

            <Input
              label="Parts Used"
              value={formData.parts_used}
              onChange={handleChange('parts_used')}
              placeholder="e.g. Oil filter x1, Hydraulic oil 5L"
            />
          </>
        )}

        {/* Notes */}
        <Textarea
          label="Additional Notes"
          value={formData.notes}
          onChange={handleChange('notes')}
          placeholder="Any additional notes..."
          rows={2}
        />

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLogModal;
