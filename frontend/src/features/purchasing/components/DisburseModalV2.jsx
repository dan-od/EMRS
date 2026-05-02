/**
 * DisburseModalV2 - Card-based per-item disbursement modal
 */

import { useState, useEffect, useMemo } from 'react';
import { Modal, Button } from '@/components/common';
import { Loader2 } from 'lucide-react';
import { useInventory } from '../hooks/usePurchasing';
import PendingItemCard from './PendingItemCard';
import { DisbursedItemCard, OnHoldItemCard, RejectedItemCard } from './CompletedItemCard';
import { RequestHeader, ApprovalWarning, DateApplySection, SummarySection, JustificationInput } from './DisburseModalHeader';

const DisburseModalV2 = ({ 
  isOpen, onClose, request, withoutApproval = false,
  onDisburseItem, onDisburseAll, onHoldItem, isLoading 
}) => {
  const { items: inventory, isLoading: loadingInventory } = useInventory({ limit: 100 });
  const [globalNotes, setGlobalNotes] = useState('');
  const [defaultReturnDate, setDefaultReturnDate] = useState('');
  const [itemStates, setItemStates] = useState({});

  // Parse request items
  const requestItems = useMemo(() => {
    if (!request?.details) return [];
    try {
      const details = typeof request.details === 'string' ? JSON.parse(request.details) : request.details;
      return details.items && Array.isArray(details.items) ? details.items : [];
    } catch { return []; }
  }, [request?.details]);

  // Reset on open
  useEffect(() => {
    if (isOpen) { setItemStates({}); setGlobalNotes(''); setDefaultReturnDate(''); }
  }, [isOpen]);

  // Summary stats
  const summary = useMemo(() => {
    let disbursed = 0, onHold = 0, rejected = 0, ready = 0;
    requestItems.forEach(item => {
      if (item.disbursement_status === 'disbursed') disbursed++;
      else if (item.disbursement_status === 'on_hold') onHold++;
      else if (item.approval_status === 'rejected') rejected++;
      else ready++;
    });
    return { total: requestItems.length, disbursed, onHold, rejected, ready };
  }, [requestItems]);

  // Apply date to all
  const applyDateToAll = () => {
    if (!defaultReturnDate) return;
    const newStates = {};
    requestItems.forEach((_, i) => { newStates[i] = { ...itemStates[i], returnDate: defaultReturnDate, isConsumable: false }; });
    setItemStates(newStates);
  };

  const updateItemState = (index, updates) => {
    setItemStates(prev => ({ ...prev, [index]: { ...prev[index], ...updates } }));
  };

  const handleDisburseAll = () => {
    const readyItems = requestItems
      .map((item, i) => ({ item: { ...item, ...itemStates[i] }, index: i }))
      .filter(({ item }) => item.disbursement_status !== 'disbursed' && item.disbursement_status !== 'on_hold' && item.approval_status !== 'rejected');
    onDisburseAll?.(readyItems, globalNotes, defaultReturnDate);
  };

  const handleClose = () => { setGlobalNotes(''); setDefaultReturnDate(''); setItemStates({}); onClose(); };

  const requestType = request?.type || 'Material';
  const departmentName = request?.department_name || request?.requester_department || request?.department;

  // Render item
  const renderItem = (item, index) => {
    const itemName = item.item || item.name || `Item ${index + 1}`;
    if (item.disbursement_status === 'disbursed') return <DisbursedItemCard key={index} item={item} itemName={itemName} />;
    if (item.disbursement_status === 'on_hold') return <OnHoldItemCard key={index} item={item} itemName={itemName} />;
    if (item.approval_status === 'rejected') return <RejectedItemCard key={index} itemName={itemName} />;
    return (
      <PendingItemCard key={index} item={item} index={index} inventory={inventory}
        onDisburseItem={onDisburseItem} onHoldItem={onHoldItem} isLoading={isLoading}
        requestType={requestType} itemState={itemStates[index] || {}} updateItemState={updateItemState}
        withoutApproval={withoutApproval} globalNotes={globalNotes}
      />
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Disburse Request" size="xl">
      <div className="space-y-4 max-h-[75vh] overflow-y-auto">
        <RequestHeader request={request} requestType={requestType} departmentName={departmentName} withoutApproval={withoutApproval} />
        {withoutApproval && <ApprovalWarning />}
        <DateApplySection defaultReturnDate={defaultReturnDate} setDefaultReturnDate={setDefaultReturnDate} onApply={applyDateToAll} />

        {loadingInventory ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            <span className="ml-2 text-gray-500 dark:text-dark-muted">Loading inventory...</span>
          </div>
        ) : (
          <div className="space-y-3">{requestItems.map(renderItem)}</div>
        )}

        {withoutApproval && <JustificationInput value={globalNotes} onChange={setGlobalNotes} />}
        <SummarySection summary={summary} />

        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2 sticky bottom-0 bg-white dark:bg-[#1a1f26] border-t border-gray-100 dark:border-white/10 -mx-5 px-5 pb-2 -mb-4">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">Close</Button>
          {summary.ready > 0 && (
            <Button variant="primary" onClick={handleDisburseAll} disabled={isLoading || (withoutApproval && !globalNotes.trim())} className="w-full sm:w-auto">
              Disburse All Ready ({summary.ready})
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DisburseModalV2;
