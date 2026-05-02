/**
 * ItemLinkingTable
 * Displays request items with inventory linking dropdowns
 * Shows stock warnings and tracks linked items
 */

import { AlertTriangle, Check } from 'lucide-react';
import InventoryLinkDropdown from './InventoryLinkDropdown';

const ItemLinkingTable = ({
  items = [],
  inventory = [],
  linkedItems = {},
  onLinkItem,
  requestType
}) => {
  // Safety check - return early if no items
  if (!items || items.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-dark-card rounded-lg text-center text-gray-500 dark:text-gray-400 text-sm">
        No items to link
      </div>
    );
  }

  // Map request type to inventory category
  const categoryMap = {
    'PPE': 'PPE',
    'Material': 'Materials',
    'Equipment': 'Spare_Parts',
  };
  const requestCategory = categoryMap[requestType] || 'PPE';

  // Get linked inventory item details
  const getLinkedItemDetails = (itemIndex) => {
    const link = linkedItems[itemIndex];
    if (!link || link.inventoryId === 'skip') return null;
    return inventory.find(i => i.id === link.inventoryId);
  };

  // Check stock availability for a linked item
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

  return (
    <div className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50 dark:bg-dark-card">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Requested Item</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-300 w-24">Qty</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Link to Inventory</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-300 w-20">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
            {items.map((item, index) => {
              const stockStatus = getStockStatus(index);
              const linkedInvItem = getLinkedItemDetails(index);
              const isLinked = linkedItems[index]?.inventoryId;
              const isSkipped = linkedItems[index]?.inventoryId === 'skip';

              // Get item name - handle different structures
              const itemName = item?.item || item?.name || item?.description || `Item ${index + 1}`;
              const itemSize = item?.size;
              const itemQty = item?.quantity || 1;
              // Get unit from linked inventory item or from request item
              const itemUnit = linkedInvItem?.unit || item?.unit || '';

              return (
                <tr key={index} className={stockStatus?.status === 'insufficient' ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                  <td className="px-3 py-2">
                    <span className="font-medium dark:text-dark-text">{itemName}</span>
                    {itemSize && itemSize !== 'N/A' && (
                      <span className="text-gray-500 dark:text-gray-400 ml-1">({itemSize})</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="font-medium dark:text-dark-text">{itemQty}</span>
                    {itemUnit && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">{itemUnit}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <InventoryLinkDropdown
                      inventory={inventory}
                      selectedId={linkedItems[index]?.inventoryId}
                      onSelect={(invItem) => onLinkItem(index, invItem)}
                      requestCategory={requestCategory}
                      requestedItemName={itemName}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    {!isLinked && (
                      <span className="text-gray-400 dark:text-gray-500">—</span>
                    )}
                    {isSkipped && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Skipped</span>
                    )}
                    {isLinked && !isSkipped && stockStatus?.status === 'ok' && (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    )}
                    {isLinked && !isSkipped && stockStatus?.status === 'insufficient' && (
                      <AlertTriangle className="w-5 h-5 text-red-500 mx-auto" />
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
                <strong>{stockStatus.itemName}</strong>: Need {stockStatus.needed} {stockStatus.unit}, only {stockStatus.available} {stockStatus.unit} in stock
              </span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default ItemLinkingTable;
