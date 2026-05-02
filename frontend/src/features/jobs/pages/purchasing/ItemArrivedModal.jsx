/**
 * ItemArrivedModal - Mark item as arrived and link to inventory
 */
import { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '@/components/common';
import { Package, Truck, DollarSign, FileText, Search } from 'lucide-react';
import { api } from '@/services/api';

export const ItemArrivedModal = ({ item, onClose, onSubmit, isLoading }) => {
  const [vendorName, setVendorName] = useState(item.vendor_name || '');
  const [poNumber, setPoNumber] = useState('');
  const [cost, setCost] = useState('');
  const [linkedInventoryId, setLinkedInventoryId] = useState('');
  const [createNew, setCreateNew] = useState(true);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchInventory, setSearchInventory] = useState('');

  useEffect(() => {
    // Load inventory items for linking
    api.get('/equipment?limit=100').then(res => setInventoryItems(res.data?.equipment || []));
  }, []);

  const handleSubmit = () => {
    onSubmit({
      vendor_name: vendorName,
      purchase_order_number: poNumber,
      procurement_cost: cost ? parseFloat(cost) : null,
      linked_inventory_id: createNew ? null : linkedInventoryId || null
    });
  };

  const itemName = item.requested_item_name || item.client_equipment_name || 'Item';
  const filteredInventory = inventoryItems.filter(i => 
    i.name?.toLowerCase().includes(searchInventory.toLowerCase()) ||
    i.serial_number?.toLowerCase().includes(searchInventory.toLowerCase())
  );

  return (
    <Modal isOpen onClose={onClose} title="Item Arrived" size="md">
      <div className="space-y-4">
        {/* Item Info */}
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-green-400" />
            <p className="text-sm font-medium text-green-300">{itemName} has arrived!</p>
          </div>
          <div className="flex gap-4 mt-1 text-xs text-text-secondary">
            <span>Qty: {item.quantity}</span>
            <span>Job: {item.job_number}</span>
          </div>
        </div>

        {/* Vendor Info */}
        <Input
          label="Vendor Name"
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
          placeholder="e.g., ABC Equipment Ltd"
          leftIcon={<Truck className="w-4 h-4" />}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="PO Number"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            placeholder="PO-2026-001"
            leftIcon={<FileText className="w-4 h-4" />}
          />
          <Input
            label="Cost"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
            leftIcon={<DollarSign className="w-4 h-4" />}
          />
        </div>

        {/* Link to Inventory */}
        <div className="border-t border-border-light pt-4">
          <p className="text-sm font-medium text-text-primary mb-3">Link to Inventory</p>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setCreateNew(true)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                createNew ? 'bg-primary-500 text-white' : 'bg-background-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              Create New Item
            </button>
            <button
              onClick={() => setCreateNew(false)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                !createNew ? 'bg-primary-500 text-white' : 'bg-background-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              Link Existing
            </button>
          </div>

          {!createNew && (
            <div className="space-y-2">
              <Input
                placeholder="Search inventory..."
                value={searchInventory}
                onChange={(e) => setSearchInventory(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredInventory.slice(0, 10).map(inv => (
                  <button
                    key={inv.id}
                    onClick={() => setLinkedInventoryId(inv.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors ${
                      linkedInventoryId === inv.id 
                        ? 'bg-primary-500/20 border border-primary-500/50' 
                        : 'bg-background-tertiary hover:bg-background-secondary'
                    }`}
                  >
                    <Package className="w-4 h-4 text-primary-400" />
                    <span className="flex-1 truncate">{inv.name}</span>
                    <span className="text-xs text-text-secondary">{inv.serial_number}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
            <Package className="w-4 h-4 mr-1" />
            {isLoading ? 'Saving...' : 'Confirm Arrival'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ItemArrivedModal;
