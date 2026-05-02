/**
 * PendingItemCard - Card for items pending disbursement
 * Uses DisburseItemForm for form fields
 */

import { useState } from 'react';
import { Package, ChevronDown, ChevronUp, AlertTriangle, Loader2, ShoppingCart, Wrench } from 'lucide-react';
import { Button } from '@/components/common';
import ItemStatusBadge from './ItemStatusBadge';
import DisburseItemForm from './DisburseItemForm';
import { formatTypeLabel, formatCategoryLabel } from '@/utils/equipmentConstants';

const PendingItemCard = ({ 
  item, 
  index, 
  inventory, 
  onDisburseItem, 
  onHoldItem,
  isLoading,
  requestType,
  itemState = {},
  updateItemState,
  withoutApproval = false,
  globalNotes = ''
}) => {
  const [expanded, setExpanded] = useState(true);
  
  // Item state from parent
  const isConsumable = itemState.isConsumable || false;
  const returnDate = itemState.returnDate || '';
  const linkedInventory = itemState.inventoryId || null;
  const notes = itemState.notes || '';
  
  // Check if item needs procurement (not in database)
  const needsProcurement = item.isNewRequest === true;
  const isTool = item.assetCategory === 'TOOL';
  
  // Update functions
  const setIsConsumable = (val) => updateItemState?.(index, { isConsumable: val, returnDate: val ? '' : returnDate });
  const setReturnDate = (val) => updateItemState?.(index, { returnDate: val });
  const setLinkedInventory = (val) => updateItemState?.(index, { inventoryId: val });
  const setNotes = (val) => updateItemState?.(index, { notes: val });
  
  const itemName = item.item || item.name || `Item ${index + 1}`;
  const itemQty = item.quantity || item.approved_quantity || 1;
  const itemUnit = item.unit || 'pcs';
  const itemSize = item.size;
  const itemSpecs = item.specifications;
  
  // Inventory validation
  const linkedInvItem = inventory.find(i => i.id === linkedInventory);
  const hasInsufficientStock = linkedInvItem && itemQty > linkedInvItem.quantity;
  
  // Can disburse check — procurement items don't need inventory linking
  const canDisburse = (linkedInventory || needsProcurement) && 
    (isConsumable || returnDate) && 
    !hasInsufficientStock &&
    (!withoutApproval || globalNotes.trim());

  const handleDisburse = () => {
    onDisburseItem(index, {
      inventoryId: linkedInventory || null,
      isConsumable,
      returnDate: isConsumable ? null : returnDate,
      notes,
      needsProcurement
    });
  };

  const handleHold = () => {
    const reason = hasInsufficientStock 
      ? `Insufficient stock: need ${itemQty}, have ${linkedInvItem?.quantity || 0}`
      : notes || 'Item put on hold';
    onHoldItem(index, reason);
  };

  return (
    <div className={`border bg-white dark:bg-[#242b33] rounded-xl overflow-hidden shadow-sm ${
      needsProcurement 
        ? 'border-amber-300 dark:border-amber-500/40' 
        : 'border-gray-200 dark:border-white/10'
    }`}>
      {/* Header */}
      <div 
        className={`flex items-center justify-between p-4 cursor-pointer ${
          needsProcurement 
            ? 'bg-amber-50 dark:bg-amber-500/10' 
            : 'bg-gray-50 dark:bg-[#1a1f26]'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            needsProcurement 
              ? 'bg-amber-100 dark:bg-amber-500/20' 
              : isTool 
                ? 'bg-blue-100 dark:bg-blue-500/20' 
                : 'bg-primary-100 dark:bg-primary-500/20'
          }`}>
            {needsProcurement ? (
              <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            ) : isTool ? (
              <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-text-primary dark:text-white">{itemName}</p>
              {itemSize && <span className="text-sm text-gray-500 dark:text-gray-400">(Size: {itemSize})</span>}
              {itemSpecs && <span className="text-sm text-blue-500 dark:text-blue-400">— Specifications: {itemSpecs}</span>}
              {needsProcurement && (
                <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                  Needs Procurement
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary dark:text-gray-400">
              Qty: {itemQty} {itemUnit}
              {item.assetCategory && ` • ${formatCategoryLabel(item.assetCategory)}`}
              {item.type && ` • ${formatTypeLabel(item.type)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ItemStatusBadge approvalStatus={item.approval_status} />
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {/* Expandable content */}
      {expanded && (
        <div className="p-4 border-t border-gray-100 dark:border-white/10">
          <DisburseItemForm
            isConsumable={isConsumable}
            setIsConsumable={setIsConsumable}
            returnDate={returnDate}
            setReturnDate={setReturnDate}
            linkedInventory={linkedInventory}
            setLinkedInventory={setLinkedInventory}
            notes={notes}
            setNotes={setNotes}
            inventory={inventory}
            requestType={requestType}
            itemName={itemName}
            itemQty={itemQty}
            linkedInvItem={linkedInvItem}
            hasInsufficientStock={hasInsufficientStock}
            needsProcurement={needsProcurement}
          />

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-white/10">
            {withoutApproval && !globalNotes.trim() && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Enter justification above to enable
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="primary" size="sm" onClick={handleDisburse} disabled={!canDisburse || isLoading} className="flex-1">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Disburse This Item'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleHold} disabled={isLoading} className="w-full sm:w-auto">Put on Hold</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingItemCard;