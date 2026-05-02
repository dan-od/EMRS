/**
 * VehicleFormModal - Add/Edit vehicle form
 */
import { useState, useEffect } from 'react';
import { Button, Input, Select, Modal } from '@/components/common';
import { VEHICLE_TYPES, FUEL_TYPES } from '../../constants/vehicleConstants';

const VehicleFormModal = ({ isOpen, onClose, onSubmit, isLoading, title, initialData, drivers = [] }) => {
  const [formData, setFormData] = useState({
    plate_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'Pickup',
    fuel_type: 'Diesel',
    mileage: '',
    assigned_driver_id: '',
    notes: ''
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        plate_number: initialData.plate_number || '',
        make: initialData.make || '',
        model: initialData.model || '',
        year: initialData.year || new Date().getFullYear(),
        type: initialData.type || 'Pickup',
        fuel_type: initialData.fuel_type || 'Diesel',
        mileage: initialData.mileage || '',
        assigned_driver_id: initialData.assigned_driver_id || '',
        notes: initialData.notes || ''
      });
    } else if (isOpen) {
      setFormData({
        plate_number: '', make: '', model: '', year: new Date().getFullYear(),
        type: 'Pickup', fuel_type: 'Diesel', mileage: '', assigned_driver_id: '', notes: ''
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'year' || name === 'mileage' ? (value ? parseInt(value) : '') : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Plate Number"
          name="plate_number"
          value={formData.plate_number}
          onChange={handleChange}
          placeholder="e.g., PH 234 ABC"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Make" name="make" value={formData.make} onChange={handleChange} placeholder="e.g., Toyota" required />
          <Input label="Model" name="model" value={formData.model} onChange={handleChange} placeholder="e.g., Hilux" required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Year" name="year" type="number" value={formData.year} onChange={handleChange} min={2000} max={2030} required />
          <Select label="Type" name="type" value={formData.type} onChange={handleChange} options={VEHICLE_TYPES.filter(t => t.value)} />
          <Select label="Fuel Type" name="fuel_type" value={formData.fuel_type} onChange={handleChange} options={FUEL_TYPES} />
        </div>
        <Input label="Mileage (km)" name="mileage" type="number" value={formData.mileage} onChange={handleChange} placeholder="e.g., 45000" />
        {drivers.length > 0 && (
          <Select
            label="Assign Driver"
            name="assigned_driver_id"
            value={formData.assigned_driver_id}
            onChange={handleChange}
            options={[
              { value: '', label: 'No Driver Assigned' },
              ...drivers.map(d => ({ 
                value: d.id, 
                label: d.name || `${d.first_name || ''} ${d.last_name || ''}`.trim() || d.email 
              }))
            ]}
          />
        )}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-card text-text-primary dark:text-dark-text placeholder:text-text-muted dark:placeholder:text-dark-muted"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            {initialData ? 'Update' : 'Add'} Vehicle
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VehicleFormModal;
