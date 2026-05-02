import { useState } from 'react';
import { Modal, ModalFooter, Button } from '@/components/common';
import { InventoryFormFields } from './InventoryFormFields';

const initialFormState = {
  name: '',
  category: '',
  quantity: '',
  unit: 'pieces',
  reorder_level: '10',
  location: ''
};

export const AddItemModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    await onSubmit({
      ...formData,
      quantity: parseInt(formData.quantity),
      reorder_level: parseInt(formData.reorder_level) || 10
    });
    setFormData(initialFormState);
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Inventory Item" size="md">
      <form onSubmit={handleSubmit}>
        <InventoryFormFields
          formData={formData}
          errors={errors}
          onChange={handleChange}
          isEdit={false}
        />

        <ModalFooter>
          <Button variant="ghost" onClick={handleClose} type="button">Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Add Item</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
