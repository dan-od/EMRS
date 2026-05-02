import { useState } from 'react';
import { Modal, ModalFooter, Button, Input, Textarea } from '@/components/common';
import { Package, Plus } from 'lucide-react';

export const StockAdjustModal = ({ isOpen, onClose, item, onSubmit, isLoading }) => {
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      setError('Enter a valid quantity greater than 0');
      return;
    }
    await onSubmit(item.id, qty, notes);
    resetForm();
  };

  const resetForm = () => { setQuantity(''); setNotes(''); setError(''); };
  const handleClose = () => { resetForm(); onClose(); };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Stock" size="sm">
      <form onSubmit={handleSubmit}>
        <div className="bg-gray-50 dark:bg-dark-card/50 rounded-xl p-4 mb-4 flex items-center gap-3 border border-gray-100 dark:border-white/10">
          <div className="p-2 bg-primary-50 dark:bg-primary-500/20 rounded-xl">
            <Package className="w-5 h-5 text-primary-500 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-text-primary dark:text-dark-text">{item.name}</p>
            <p className="text-sm text-text-muted dark:text-dark-muted">
              Current: <span className="font-semibold text-text-primary dark:text-dark-text">{item.quantity}</span> {item.unit}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Quantity to Add"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setError(''); }}
            error={error}
            leftIcon={<Plus className="w-4 h-4" />}
            required
          />

          {quantity && parseInt(quantity) > 0 && (
            <p className="text-sm text-text-secondary dark:text-dark-muted">
              New total: <span className="font-semibold text-green-600 dark:text-green-400">
                {item.quantity + parseInt(quantity)}
              </span> {item.unit}
            </p>
          )}

          <Textarea
            label="Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., PO #12345"
            rows={2}
          />
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={handleClose} type="button">Cancel</Button>
          <Button type="submit" isLoading={isLoading} variant="success">
            <Plus className="w-4 h-4 mr-1" /> Add Stock
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
