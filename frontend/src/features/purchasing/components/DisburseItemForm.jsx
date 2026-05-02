/**
 * DisburseItemForm - Form fields for disbursing an item
 * Handles returnable toggle, date, inventory link, and notes
 */

import { Calendar, AlertTriangle } from 'lucide-react';
import InventoryLinkDropdown from './InventoryLinkDropdown';

const DisburseItemForm = ({
  isConsumable,
  setIsConsumable,
  returnDate,
  setReturnDate,
  linkedInventory,
  setLinkedInventory,
  notes,
  setNotes,
  inventory,
  requestType,
  itemName,
  itemQty,
  linkedInvItem,
  hasInsufficientStock,
  needsProcurement = false
}) => {
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Returnable toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Returnable?</label>
        <div className="flex gap-2">
          <button
            onClick={() => setIsConsumable(false)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              !isConsumable 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-[#1a1f26] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setIsConsumable(true)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              isConsumable 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-[#1a1f26] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            No (Consumable)
          </button>
        </div>
      </div>

      {/* Return date (if returnable) */}
      {!isConsumable && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" /> Return Date
          </label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={minDate}
            className={`w-full px-3 py-2 rounded-xl border bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500 ${
              !returnDate 
                ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10' 
                : 'border-gray-200 dark:border-white/10'
            }`}
          />
          {!returnDate && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Return date required for returnable items</p>
          )}
        </div>
      )}

      {/* Inventory link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Link to Inventory {needsProcurement && <span className="text-gray-400 font-normal">(optional — new procurement)</span>}
        </label>
        {needsProcurement && !linkedInventory && (
          <div className="mb-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              This is a new procurement item. You can disburse without linking to inventory, or link it if stock has arrived.
            </p>
          </div>
        )}
        <InventoryLinkDropdown
          inventory={inventory}
          selectedId={linkedInventory}
          onSelect={(inv) => setLinkedInventory(inv.id)}
          requestCategory={requestType === 'PPE' ? 'PPE' : 'Materials'}
          requestedItemName={itemName}
        />
        {hasInsufficientStock && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Insufficient stock: need {itemQty}, have {linkedInvItem.quantity}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes for this item..."
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white placeholder-text-muted dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  );
};

export default DisburseItemForm;
