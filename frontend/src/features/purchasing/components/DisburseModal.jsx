/**
 * DisburseModal
 * Modal for disbursing requests with inventory linking
 * - Per-item consumable marking (not a general checkbox)
 * - Per-item return dates
 * Handles all request types: PPE, Material, Equipment, Transport, Maintenance
 */

import { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Input } from '@/components/common';
import { Loader2, AlertTriangle, Package } from 'lucide-react';
import ItemLinkingTableWithConsumable from './ItemLinkingTableWithConsumable';
import { useInventory } from '../hooks/usePurchasing';

const DisburseModal = ({ 
  isOpen, 
  onClose, 
  request, 
  withoutApproval = false,
  onDisburse,
  onHold,
  isLoading 
}) => {
  const [notes, setNotes] = useState('');
  const [defaultReturnDate, setDefaultReturnDate] = useState('');
  const [linkedItems, setLinkedItems] = useState({});
  const [saveAliases, setSaveAliases] = useState(true);

  // Fetch all inventory items
  const { items: inventory, isLoading: loadingInventory } = useInventory({ limit: 100 });

  // Parse request items - handle different request type structures
  // Only include items that were approved (or all items if no per-item approval)
  const requestItems = useMemo(() => {
    if (!request?.details) return [];
    
    try {
      const details = typeof request.details === 'string' 
        ? JSON.parse(request.details) 
        : request.details;
      
      let items = [];
      
      if (details.items && Array.isArray(details.items)) {
        items = details.items;
      } else if (details.equipment) {
        items = Array.isArray(details.equipment) ? details.equipment : [details.equipment];
      } else if (Array.isArray(details)) {
        items = details;
      }
      
      // Filter out rejected items and use approved quantities
      return items
        .filter(item => {
          // Include if no approval status (legacy) or if approved/pending
          const status = item.approval_status?.toLowerCase();
          return !status || status === 'approved' || status === 'pending';
        })
        .map(item => ({
          ...item,
          // Use approved quantity if available, otherwise original quantity
          quantity: item.approved_quantity || item.quantity || 1,
          originalQuantity: item.quantity || 1
        }));
    } catch (e) {
      console.error('Error parsing request details:', e);
      return [];
    }
  }, [request]);

  const hasItemsToLink = requestItems.length > 0;
  const requestType = request?.type;
  const needsInventoryLinking = hasItemsToLink && !['Transport', 'Maintenance'].includes(requestType);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Initialize linked items with consumable flag
      const initialLinks = {};
      requestItems.forEach((item, idx) => {
        initialLinks[idx] = {
          inventoryId: null,
          inventoryName: null,
          requestedName: item.item || item.name,
          isConsumable: false,
          returnDate: ''
        };
      });
      setLinkedItems(initialLinks);
      setNotes('');
      setDefaultReturnDate('');
      setSaveAliases(true);
    }
  }, [isOpen, request?.id, requestItems]);

  // Check stock availability
  const stockCheck = useMemo(() => {
    if (!needsInventoryLinking) {
      return { allLinked: true, hasIssues: false, issues: [] };
    }
    
    const issues = [];
    let allLinked = true;
    
    requestItems.forEach((item, index) => {
      const link = linkedItems[index];
      if (!link?.inventoryId) {
        allLinked = false;
        return;
      }
      if (link.inventoryId === 'skip') return;
      
      const invItem = inventory.find(i => i.id === link.inventoryId);
      if (invItem && (item.quantity || 1) > invItem.quantity) {
        issues.push({
          itemName: invItem.name,
          needed: item.quantity || 1,
          available: invItem.quantity
        });
      }
    });
    
    return { allLinked, hasIssues: issues.length > 0, issues };
  }, [requestItems, linkedItems, inventory, needsInventoryLinking]);

  const handleLinkItem = (index, invItem) => {
    setLinkedItems(prev => ({
      ...prev,
      [index]: { 
        ...prev[index],
        inventoryId: invItem.id, 
        inventoryName: invItem.name,
        requestedName: requestItems[index]?.item || requestItems[index]?.name
      }
    }));
  };

  const handleConsumableChange = (index, isConsumable) => {
    setLinkedItems(prev => ({
      ...prev,
      [index]: { 
        ...prev[index],
        isConsumable,
        returnDate: isConsumable ? '' : prev[index]?.returnDate
      }
    }));
  };

  const handleReturnDateChange = (index, date) => {
    setLinkedItems(prev => ({
      ...prev,
      [index]: { 
        ...prev[index],
        returnDate: date
      }
    }));
  };

  const applyDefaultDateToAll = () => {
    if (!defaultReturnDate) return;
    setLinkedItems(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(idx => {
        if (!updated[idx].isConsumable) {
          updated[idx] = { ...updated[idx], returnDate: defaultReturnDate };
        }
      });
      return updated;
    });
  };

  const handleDisburse = () => {
    const inventoryLinks = needsInventoryLinking 
      ? Object.entries(linkedItems)
          .filter(([_, link]) => link.inventoryId !== 'skip')
          .map(([index, link]) => ({
            itemIndex: parseInt(index),
            inventoryId: link.inventoryId,
            quantity: requestItems[index]?.quantity || 1,
            isConsumable: link.isConsumable,
            returnDate: link.isConsumable ? null : link.returnDate,
            saveAlias: saveAliases && link.requestedName !== link.inventoryName
              ? { alias: link.requestedName, inventoryId: link.inventoryId }
              : null
          }))
      : [];

    // Check if any non-consumable item needs return date
    const nonConsumableItems = Object.values(linkedItems).filter(l => !l.isConsumable);
    const allHaveReturnDates = nonConsumableItems.every(l => l.returnDate);
    
    // For PPE/Material/Equipment, require return dates for non-consumable items
    const typicallyNeedsReturn = ['Equipment', 'PPE', 'Material'].includes(requestType);
    if (typicallyNeedsReturn && nonConsumableItems.length > 0 && !allHaveReturnDates) {
      alert('Please set return dates for all non-consumable items');
      return;
    }

    onDisburse({
      notes,
      withoutApproval,
      inventoryLinks
    });
  };

  const handleHold = () => {
    const holdReason = stockCheck.issues.length > 0
      ? stockCheck.issues.map(i => `${i.itemName}: need ${i.needed}, have ${i.available}`).join('; ')
      : notes || 'Item not in stock';
    onHold(`Insufficient stock - ${holdReason}`);
  };

  // Check if can submit
  const nonConsumableCount = Object.values(linkedItems).filter(l => !l.isConsumable).length;
  const allNonConsumableHaveDates = Object.values(linkedItems)
    .filter(l => !l.isConsumable)
    .every(l => l.returnDate);
  
  const isTransportOrMaintenance = ['Transport', 'Maintenance'].includes(requestType);
  const canSubmit = isTransportOrMaintenance || 
    (stockCheck.allLinked && !stockCheck.hasIssues && (nonConsumableCount === 0 || allNonConsumableHaveDates));

  const handleClose = () => {
    setNotes('');
    setDefaultReturnDate('');
    setLinkedItems({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Disburse Request" size="xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {withoutApproval && (
          <div className="p-3 bg-warning-50 dark:bg-amber-500/15 border border-warning-200 dark:border-amber-500/30 rounded-lg">
            <p className="text-sm text-warning-700 dark:text-amber-400">
              <strong>Note:</strong> This request has not been approved by a manager.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between text-sm text-text-secondary dark:text-dark-muted gap-1">
          <span><strong className="dark:text-dark-text">Request:</strong> #{request?.id?.slice(0, 8)} - {request?.type}</span>
          <span><strong className="dark:text-dark-text">Requester:</strong> {request?.requester_name || request?.requesterName}</span>
        </div>

        {/* Inventory Linking with Consumable Options */}
        {needsInventoryLinking && (
          <>
            {loadingInventory ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading inventory...</span>
              </div>
            ) : (
              <>
                {/* Default return date helper */}
                <div className="flex flex-col sm:flex-row items-end gap-3 p-3 bg-gray-50 dark:bg-dark-card rounded-lg border border-gray-100 dark:border-dark-border">
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Set default return date for all items:
                    </label>
                    <input
                      type="date"
                      value={defaultReturnDate}
                      onChange={(e) => setDefaultReturnDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-dark-border rounded focus:ring-2 focus:ring-primary-500 dark:bg-[#1a1f26] dark:text-white"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={applyDefaultDateToAll}
                    disabled={!defaultReturnDate}
                  >
                    Apply to All
                  </Button>
                </div>

                <ItemLinkingTableWithConsumable
                  items={requestItems}
                  inventory={inventory}
                  linkedItems={linkedItems}
                  onLinkItem={handleLinkItem}
                  onConsumableChange={handleConsumableChange}
                  onReturnDateChange={handleReturnDateChange}
                  requestType={requestType}
                />
                
                {Object.values(linkedItems).some(l => 
                  l.requestedName && l.inventoryName && 
                  l.requestedName !== l.inventoryName && 
                  l.inventoryId !== 'skip'
                ) && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={saveAliases}
                      onChange={(e) => setSaveAliases(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600"
                    />
                    Save name mappings for future auto-matching
                  </label>
                )}
              </>
            )}
          </>
        )}

        {!needsInventoryLinking && (
          <div className="p-3 bg-gray-50 dark:bg-dark-card rounded-lg flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-dark-border">
            <Package className="w-5 h-5" />
            <span>This {requestType?.toLowerCase()} request doesn't require inventory linking.</span>
          </div>
        )}

        {stockCheck.hasIssues && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Insufficient Stock</p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  Cannot disburse. Put on hold until restocked?
                </p>
              </div>
            </div>
          </div>
        )}

        <Input
          label={withoutApproval ? "Justification (Required)" : "Notes (Optional)"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={withoutApproval ? "Explain why disbursing without approval..." : "Any notes..."}
        />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2 sticky bottom-0 bg-white dark:bg-[#1a1f26] border-t border-gray-100 dark:border-white/10 -mx-5 px-5 pb-2 -mb-4">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">Cancel</Button>
          
          {stockCheck.hasIssues ? (
            <Button variant="warning" onClick={handleHold} isLoading={isLoading}>
              Put on Hold
            </Button>
          ) : (
            <Button 
              variant={withoutApproval ? "warning" : "primary"}
              onClick={handleDisburse} 
              isLoading={isLoading}
              disabled={(withoutApproval && !notes.trim()) || !canSubmit}
            >
              {withoutApproval ? 'Disburse Anyway' : 'Disburse'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DisburseModal;
