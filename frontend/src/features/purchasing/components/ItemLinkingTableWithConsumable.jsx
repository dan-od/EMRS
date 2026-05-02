/**
 * ItemLinkingTableWithConsumable
 * Displays request items with:
 * - Inventory linking dropdowns
 * - Per-item consumable checkbox
 * - Per-item return date
 * - Shows approved quantity vs original if different
 */

import { AlertTriangle, Check, Info } from 'lucide-react';
import InventoryLinkDropdown from './InventoryLinkDropdown';

const ItemLinkingTableWithConsumable = ({
  items = [],
  inventory = [],
  linkedItems = {},
  onLinkItem,
  onConsumableChange,
  onReturnDateChange,
  requestType
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-dark-card rounded-lg text-center text-gray-500 dark:text-gray-400 text-sm">
        No items to link
      </div>
    );
  }

  const categoryMap = {
    'PPE': 'PPE',
    'Material': 'Materials',
    'Equipment': 'Spare_Parts',
  };
  const requestCategory = categoryMap[requestType] || 'PPE';

  const getLinkedItemDetails = (itemIndex) => {
    const link = linkedItems[itemIndex];
    if (!link || link.inventoryId === 'skip') return null;
    return inventory.find(i => i.id === link.inventoryId);
  };

  const getStockStatus = (itemIndex) => {
    const link = linkedItems[itemIndex];
    if (!link || link.inventoryId === 'skip') return null;

    const invItem = inventory.find(i => i.id === link.inventoryId);
    if (!invItem) return null;

    const requested = items[itemIndex]?.quantity || 1;
    if (invItem.quantity < requested) {
      return {
        status: 'insufficient',
        available: invItem.quantity,
        needed: requested,
        itemName: invItem.name,
        unit: invItem.unit || 'units'
      };
    }
    return { status: 'ok', available: invItem.quantity, unit: invItem.unit || 'units' };
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 dark:bg-dark-card">
            <tr>
              <th className="px-2 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Item</th>
              <th className="px-2 py-2 text-center font-medium text-gray-600 dark:text-gray-300 w-16">Qty</th>
              <th className="px-2 py-2 text-left font-medium text-gray-600 dark:text-gray-300 w-40">Inventory</th>
              <th className="px-2 py-2 text-center font-medium text-gray-600 dark:text-gray-300 w-24">Consumable?</th>
              <th className="px-2 py-2 text-left font-medium text-gray-600 dark:text-gray-300 w-36">Return Date</th>
              <th className="px-2 py-2 text-center font-medium text-gray-600 dark:text-gray-300 w-12">&#10003;</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
            {items.map((item, index) => {
              const stockStatus = getStockStatus(index);
              const linkedInvItem = getLinkedItemDetails(index);
              const link = linkedItems[index] || {};
              const isLinked = link.inventoryId;
              const isSkipped = link.inventoryId === 'skip';
              const isConsumable = Boolean(link.isConsumable);

              const itemName = item?.item || item?.name || item?.description || `Item ${index + 1}`;
              const itemSize = item?.size;
              const itemQty = item?.quantity || 1;
              const originalQty = item?.originalQuantity;
              const wasPartiallyApproved = originalQty && originalQty !== itemQty;
              const itemUnit = linkedInvItem?.unit || item?.unit || '';
              const approvalStatus = item?.approval_status;

              return (
                <tr key={index} className={stockStatus?.status === 'insufficient' ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                  <td className="px-2 py-2">
                    <span className="font-medium text-sm dark:text-dark-text">{itemName}</span>
                    {itemSize && itemSize !== 'N/A' && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">({itemSize})</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className="font-medium dark:text-dark-text">{itemQty}</span>
                    {itemUnit && <span className="text-gray-500 dark:text-gray-400 text-xs ml-0.5">{itemUnit}</span>}
                    {wasPartiallyApproved && (
                      <div className="text-xs text-amber-600 dark:text-amber-400" title={`Originally requested: ${originalQty}`}>
                        (was {originalQty})
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <InventoryLinkDropdown
                      inventory={inventory}
                      selectedId={link.inventoryId || null}
                      onSelect={(invItem) => onLinkItem(index, invItem)}
                      requestCategory={requestCategory}
                      requestedItemName={itemName}
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={isConsumable}
                      onChange={(e) => onConsumableChange(index, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      title="Mark as consumable (no return needed)"
                    />
                  </td>
                  <td className="px-2 py-2">
                    {isConsumable ? (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">No return</span>
                    ) : (
                      <input
                        type="date"
                        value={link.returnDate ?? ''}
                        onChange={(e) => onReturnDateChange(index, e.target.value)}
                        min={minDate}
                        className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-primary-500 dark:bg-[#1a1f26] dark:text-white
                          ${!link.returnDate ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10' : 'border-gray-200 dark:border-white/10'}`}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2 text-center">
                    {!isLinked && <span className="text-gray-400 dark:text-gray-500">—</span>}
                    {isSkipped && <span className="text-gray-400 dark:text-gray-500 text-xs">Skip</span>}
                    {isLinked && !isSkipped && stockStatus?.status === 'ok' && (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    )}
                    {isLinked && !isSkipped && stockStatus?.status === 'insufficient' && (
                      <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stock warnings */}
      {items.map((item, index) => {
        const stockStatus = getStockStatus(index);
        if (stockStatus?.status === 'insufficient') {
          return (
            <div key={`warn-${index}`} className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-800 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>
                <strong>{stockStatus.itemName}</strong>: Need {stockStatus.needed} {stockStatus.unit}, only {stockStatus.available} available
              </span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default ItemLinkingTableWithConsumable;
