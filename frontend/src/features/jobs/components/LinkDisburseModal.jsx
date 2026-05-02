/**
 * LinkDisburseModal - Link material request to inventory and disburse
 * Features: Inventory search, consumable flag, partial fulfillment option
 */
import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/components/common';
import { Search, Package, AlertTriangle, CheckCircle, Loader2, Check } from 'lucide-react';
import { api } from '@/services/api';

// Inline Checkbox component
const Checkbox = ({ id, checked = false, onChange, label, disabled = false, className = '' }) => (
  <label 
    htmlFor={id} 
    className={`flex items-center gap-2 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    <div className="relative">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" />
      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${checked ? 'bg-primary-500 border-primary-500' : 'bg-transparent border-gray-500 hover:border-gray-400'}`}>
        {checked && <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" strokeWidth={3} />}
      </div>
    </div>
    {label && <span className="text-sm">{label}</span>}
  </label>
);

const LinkDisburseModal = ({ 
  isOpen, 
  onClose, 
  item, 
  onLinkDisburse, 
  onPartialFulfill,
  isLoading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isConsumable, setIsConsumable] = useState(false);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [showPartial, setShowPartial] = useState(false);
  const [sourceRemaining, setSourceRemaining] = useState(true);

  // Reset state when item changes
  useEffect(() => {
    if (item) {
      setQuantity(item.quantity || 1);
      setSearchTerm(item.requested_item_name || '');
      setIsConsumable(false);
      setSelectedInventory(null);
      setExpectedReturnDate('');
      setNotes('');
      setError('');
      setShowPartial(false);
    }
  }, [item]);

  // Search inventory
  useEffect(() => {
    const search = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setInventory([]);
        return;
      }
      
      setSearching(true);
      try {
        const res = await api.get('/jobs/materials/search-inventory', { params: { q: searchTerm } });
        setInventory(res.data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    };

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleSelectInventory = (inv) => {
    setSelectedInventory(inv);
    setError('');
    
    // Check if partial fulfillment needed
    if (inv.quantity < (item?.quantity || 1)) {
      setShowPartial(true);
      setQuantity(inv.quantity);
    } else {
      setShowPartial(false);
      setQuantity(item?.quantity || 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedInventory) {
      setError('Please select an inventory item');
      return;
    }
    
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (quantity > selectedInventory.quantity) {
      setError(`Only ${selectedInventory.quantity} available in stock`);
      return;
    }

    // Check if partial fulfillment
    const requestedQty = item?.quantity || 1;
    if (showPartial && quantity < requestedQty) {
      await onPartialFulfill({
        inventoryId: selectedInventory.id,
        disburseQuantity: quantity,
        sourceRemaining,
        isConsumable,
        expectedReturnDate: isConsumable ? null : expectedReturnDate,
        notes
      });
    } else {
      await onLinkDisburse({
        inventoryId: selectedInventory.id,
        quantity,
        isConsumable,
        expectedReturnDate: isConsumable ? null : expectedReturnDate,
        notes
      });
    }
  };

  if (!isOpen || !item) return null;

  const requestedQty = item.quantity || 1;
  const insufficientStock = selectedInventory && selectedInventory.quantity < requestedQty;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Link to Inventory & Disburse" size="md">
      <div className="space-y-4">
        {/* Request Info */}
        <div className="bg-background-secondary rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-primary-400" />
            <span className="font-medium">{item.requested_item_name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
            <div>Job: <span className="text-white">{item.job_number}</span></div>
            <div>Requested: <span className="text-white">{requestedQty} {item.unit || 'pieces'}</span></div>
            {item.requested_item_description && (
              <div className="col-span-2">Specs: {item.requested_item_description}</div>
            )}
          </div>
        </div>

        {/* Inventory Search */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Search Inventory</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or category..."
              className="pl-10"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Inventory Results */}
        {inventory.length > 0 && (
          <div className="max-h-48 overflow-y-auto border border-white/10 rounded-lg">
            {inventory.map((inv) => (
              <button
                key={inv.id}
                onClick={() => handleSelectInventory(inv)}
                className={`w-full p-3 text-left border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                  selectedInventory?.id === inv.id ? 'bg-primary-500/20 border-primary-500/30' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{inv.name}</p>
                    <p className="text-sm text-gray-400">{inv.category} • {inv.location}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${inv.quantity < requestedQty ? 'text-yellow-400' : 'text-green-400'}`}>
                      {inv.quantity} {inv.unit}
                    </p>
                    <p className="text-xs text-gray-500">in stock</p>
                  </div>
                </div>
                {selectedInventory?.id === inv.id && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                )}
              </button>
            ))}
          </div>
        )}

        {searchTerm.length >= 2 && inventory.length === 0 && !searching && (
          <div className="text-center py-4 text-gray-400">
            No inventory items found. Consider using "Source" instead.
          </div>
        )}

        {/* Selected Inventory Details */}
        {selectedInventory && (
          <div className="space-y-3 pt-3 border-t border-white/10">
            {/* Insufficient stock warning */}
            {insufficientStock && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-300">
                    Only {selectedInventory.quantity} available, but {requestedQty} requested.
                  </p>
                  <p className="text-xs text-yellow-400 mt-1">
                    You can disburse what's available and source the remainder.
                  </p>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Quantity to Disburse</label>
                <Input
                  type="number"
                  min="1"
                  max={selectedInventory.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, selectedInventory.quantity))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max: {selectedInventory.quantity} {selectedInventory.unit}
                </p>
              </div>

              {showPartial && (
                <div className="flex items-end pb-6">
                  <Checkbox
                    id="sourceRemaining"
                    checked={sourceRemaining}
                    onChange={(e) => setSourceRemaining(e.target.checked)}
                    label={`Source remaining ${requestedQty - quantity}`}
                  />
                </div>
              )}
            </div>

            {/* Consumable */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="isConsumable"
                checked={isConsumable}
                onChange={(e) => setIsConsumable(e.target.checked)}
              />
              <label htmlFor="isConsumable" className="text-sm">
                <span className="text-white">Consumable</span>
                <span className="text-gray-400 ml-1">(no return expected)</span>
              </label>
            </div>

            {/* Return Date (if not consumable) */}
            {!isConsumable && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Expected Return Date</label>
                <Input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  placeholder="Leave blank to use job end date"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to use job end date</p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Notes</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional disbursement notes"
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedInventory || isLoading}
            loading={isLoading}
          >
            {showPartial && quantity < requestedQty 
              ? `Disburse ${quantity} & ${sourceRemaining ? 'Source Rest' : 'Close'}` 
              : 'Link & Disburse'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LinkDisburseModal;
