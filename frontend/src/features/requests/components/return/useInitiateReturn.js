/**
 * useInitiateReturn - Hook for managing return initiation logic
 */

import { useState, useEffect, useMemo } from 'react';

export const useInitiateReturn = (request, isOpen) => {
  const [returnItems, setReturnItems] = useState([]);
  const [generalNotes, setGeneralNotes] = useState('');

  // Parse request items from multiple sources
  const { requestItems, hasItems, requestType } = useMemo(() => {
    if (!request) return { requestItems: [], hasItems: false, requestType: 'Unknown' };
    
    const type = request.type || 'Unknown';
    let items = [];
    
    // First check disbursed_items
    if (request.disbursed_items) {
      try {
        const disbursed = typeof request.disbursed_items === 'string' 
          ? JSON.parse(request.disbursed_items) 
          : request.disbursed_items;
        
        if (Array.isArray(disbursed) && disbursed.length > 0) {
          items = disbursed.filter(item => !item.isConsumable).map(item => ({
            name: item.inventoryName || item.name || item.item,
            quantity: item.quantity || 1,
            unit: item.unit || 'units',
            inventoryId: item.inventoryId
          }));
        }
      } catch (e) {
        // Could not parse disbursed_items
      }
    }
    
    // If no disbursed items, check request details
    if (items.length === 0 && request.details) {
      try {
        const details = typeof request.details === 'string' 
          ? JSON.parse(request.details) 
          : request.details;
        
        if (details.items && Array.isArray(details.items)) {
          items = details.items
            .filter(item => item.approval_status !== 'rejected')
            .map(item => ({
              name: item.item || item.name,
              quantity: item.approved_quantity || item.quantity || 1,
              unit: item.unit || 'pcs',
              inventoryId: item.inventoryId
            }));
        } else if (details.equipment && Array.isArray(details.equipment)) {
          items = details.equipment.map(item => ({
            name: typeof item === 'string' ? item : (item.name || item.item),
            quantity: item.quantity || 1,
            unit: item.unit || 'units',
            inventoryId: item.inventoryId
          }));
        } else if (details.equipmentType) {
          items = [{
            name: details.equipmentType,
            quantity: 1,
            unit: 'unit',
            inventoryId: null
          }];
        }
      } catch (e) {
        // Could not parse details
      }
    }
    
    return { 
      requestItems: items, 
      hasItems: items.length > 0,
      requestType: type
    };
  }, [request]);

  // Get request description
  const getRequestDescription = () => {
    if (!request?.details) return null;
    try {
      const details = typeof request.details === 'string' 
        ? JSON.parse(request.details) 
        : request.details;
      
      if (requestType === 'Equipment') {
        return details.equipmentType || details.equipment || details.description;
      }
      return details.description;
    } catch (e) {
      return null;
    }
  };

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      if (hasItems) {
        setReturnItems(requestItems.map(item => ({
          name: item.name,
          quantity: item.quantity || 1,
          unit: item.unit || 'units',
          inventoryId: item.inventoryId,
          condition: 'Good',
          notes: ''
        })));
      } else {
        setReturnItems([{
          name: getRequestDescription() || `${requestType} Item`,
          quantity: 1,
          unit: 'unit',
          inventoryId: null,
          condition: 'Good',
          notes: ''
        }]);
      }
      setGeneralNotes('');
    }
  }, [isOpen, hasItems, requestItems, requestType]);

  // Handlers
  const handleConditionChange = (index, condition) => {
    setReturnItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], condition };
      return updated;
    });
  };

  const handleNotesChange = (index, notes) => {
    setReturnItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], notes };
      return updated;
    });
  };

  const applyToAll = (condition) => {
    setReturnItems(prev => prev.map(item => ({ ...item, condition })));
  };

  // Computed values
  const conditionCounts = useMemo(() => {
    const counts = { Good: 0, Fair: 0, Damaged: 0, Lost: 0 };
    returnItems.forEach(item => {
      if (counts[item.condition] !== undefined) counts[item.condition]++;
    });
    return counts;
  }, [returnItems]);

  const hasDamagedOrLost = conditionCounts.Damaged > 0 || conditionCounts.Lost > 0;

  const damagedItemsHaveNotes = returnItems.every(item => 
    (item.condition !== 'Damaged' && item.condition !== 'Lost') || item.notes.trim()
  );

  const canSubmit = returnItems.length > 0 && damagedItemsHaveNotes;

  // Build payload
  const buildPayload = () => ({
    notes: generalNotes,
    returnItems: returnItems.map(item => ({
      name: item.name,
      inventoryId: item.inventoryId,
      quantity: item.quantity,
      unit: item.unit,
      condition: item.condition,
      notes: item.notes
    }))
  });

  return {
    returnItems,
    generalNotes,
    setGeneralNotes,
    requestType,
    conditionCounts,
    hasDamagedOrLost,
    damagedItemsHaveNotes,
    canSubmit,
    handleConditionChange,
    handleNotesChange,
    applyToAll,
    buildPayload
  };
};

export default useInitiateReturn;
