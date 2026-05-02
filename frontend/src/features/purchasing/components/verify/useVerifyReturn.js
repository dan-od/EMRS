/**
 * useVerifyReturn - Hook for managing return verification logic
 */

import { useState, useEffect, useMemo } from 'react';

export const useVerifyReturn = (request, isOpen) => {
  const [verifiedItems, setVerifiedItems] = useState([]);
  const [notes, setNotes] = useState('');

  // Parse return items from request
  const returnItems = useMemo(() => {
    if (!request?.return_items) return [];
    try {
      const items = typeof request.return_items === 'string'
        ? JSON.parse(request.return_items)
        : request.return_items;
      return Array.isArray(items) ? items : [];
    } catch (e) {
      return [];
    }
  }, [request]);

  // Parse request details for fallback
  const requestDetails = useMemo(() => {
    if (!request?.details) return null;
    try {
      return typeof request.details === 'string' 
        ? JSON.parse(request.details) 
        : request.details;
    } catch (e) {
      return null;
    }
  }, [request]);

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen && request) {
      if (returnItems.length > 0) {
        setVerifiedItems(returnItems.map(item => ({
          ...item,
          verifiedCondition: item.condition,
          verificationNotes: ''
        })));
      } else {
        setVerifiedItems([{
          name: requestDetails?.equipmentType || `${request.type} Request Item`,
          quantity: 1,
          unit: 'unit',
          inventoryId: null,
          condition: request.return_condition || 'Good',
          notes: request.return_notes || '',
          verifiedCondition: request.return_condition || 'Good',
          verificationNotes: ''
        }]);
      }
      setNotes('');
    }
  }, [isOpen, request, returnItems, requestDetails]);

  // Handlers
  const handleConditionChange = (index, verifiedCondition) => {
    setVerifiedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], verifiedCondition };
      return updated;
    });
  };

  const handleNotesChange = (index, verificationNotes) => {
    setVerifiedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], verificationNotes };
      return updated;
    });
  };

  // Computed values
  const conditionCounts = useMemo(() => {
    const counts = { Good: 0, Fair: 0, Damaged: 0, Lost: 0 };
    verifiedItems.forEach(item => {
      if (counts[item.verifiedCondition] !== undefined) {
        counts[item.verifiedCondition]++;
      }
    });
    return counts;
  }, [verifiedItems]);

  const hasDiscrepancies = verifiedItems.some(item => 
    item.condition !== item.verifiedCondition
  );

  const hasDamagedOrLost = conditionCounts.Damaged > 0 || conditionCounts.Lost > 0;

  // Build payload
  const buildPayload = () => ({
    notes,
    verifiedItems: verifiedItems.map(item => ({
      name: item.name,
      inventoryId: item.inventoryId,
      quantity: item.quantity,
      unit: item.unit,
      reportedCondition: item.condition,
      verifiedCondition: item.verifiedCondition,
      engineerNotes: item.notes,
      verificationNotes: item.verificationNotes
    }))
  });

  return {
    verifiedItems,
    notes,
    setNotes,
    conditionCounts,
    hasDiscrepancies,
    hasDamagedOrLost,
    handleConditionChange,
    handleNotesChange,
    buildPayload
  };
};

export default useVerifyReturn;
