import { useState, useEffect } from 'react';
import { Modal, ModalFooter, Button } from '@/components/common';
import { InventoryFormFields } from './InventoryFormFields';

export const EditItemModal = ({ isOpen, onClose, item, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'pieces',
    reorder_level: '10',
    location: '',
    currentQuantity: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        unit: item.unit || 'pieces',
        reorder_level: item.reorder_level?.toString() || '10',
        location: item.location || '',
        currentQuantity: item.quantity || 0
      });
    }
  }, [item]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const { currentQuantity, ...submitData } = formData;
    await onSubmit(item.id, {
      ...submitData,
      reorder_level: parseInt(formData.reorder_level) || 10
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Inventory Item" size="md">
      <form onSubmit={handleSubmit}>
        <InventoryFormFields
          formData={formData}
          errors={errors}
          onChange={handleChange}
          isEdit={true}
        />

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Save Changes</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
