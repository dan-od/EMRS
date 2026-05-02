/**
 * PurchasingQueuePage - Tab-based equipment queue
 * Includes Maintenance Approvals tab
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Button } from '@/components/common';
import { PageLoader } from '@/components/feedback';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { usePurchasingQueue, usePurchasingStats, usePurchasingActions, useMaterialActions, useMaintenanceQueue } from '../../hooks';
import QueueTabs from './QueueTabs';
import QueueContent from './QueueContent';
import QueueStats from './QueueStats';
import { 
  DisburseModal, ReturnModal, SourcingModal, 
  ItemArrivedModal, RepairCompleteModal 
} from './modals';
import LinkDisburseModal from '../../components/LinkDisburseModal';

const PurchasingQueuePage = () => {
  const nav = useNavigate();
  const { addNotification } = useUIStore();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('pending_disburse');
  
  // Data hooks
  const { items, isLoading, refresh, counts } = usePurchasingQueue(activeTab);
  const { stats } = usePurchasingStats();
  const { disburseItem, acceptReturn, startSourcing, itemArrived, disburseArrived, markRepairComplete } = usePurchasingActions();
  const { linkAndDisburse, partialFulfill } = useMaterialActions();
  
  // Maintenance queue hook
  const { 
    items: maintenanceItems, 
    count: maintenanceCount,
    isLoading: maintenanceLoading, 
    refresh: refreshMaintenance 
  } = useMaintenanceQueue();
  
  // Modal states
  const [modal, setModal] = useState({ type: null, item: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const openModal = (type, item) => setModal({ type, item });
  const closeModal = () => setModal({ type: null, item: null });
  
  // Action handlers
  const handleAction = useCallback(async (action, ...args) => {
    setIsSubmitting(true);
    try {
      await action(...args);
      addNotification({ type: 'success', message: 'Action completed successfully' });
      closeModal();
      refresh();
      refreshMaintenance();
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Action failed' });
    } finally {
      setIsSubmitting(false);
    }
  }, [addNotification, refresh, refreshMaintenance]);

  const handleDisburse = (itemId, notes) => handleAction(disburseItem, itemId, notes);
  const handleReturn = (itemId, condition, hours, notes) => handleAction(acceptReturn, itemId, condition, hours, notes);
  const handleStartSourcing = (data) => handleAction(startSourcing, modal.item.id, data.notes, data.estimated_arrival);
  const handleItemArrived = (data) => handleAction(itemArrived, modal.item.id, data);
  const handleDisburseArrived = (item) => handleAction(disburseArrived, item.id, '');
  const handleRepairComplete = (jobId, itemId, notes) => handleAction(markRepairComplete, itemId, notes);
  const handleLinkDisburse = (data) => handleAction(linkAndDisburse, modal.item.id, data);
  
  // Combine counts for tabs
  const allCounts = {
    ...counts,
    maintenance: maintenanceCount
  };

  if (isLoading && !items.length && activeTab !== 'maintenance') return <PageLoader />;

  return (
    <PageWrapper
      title="Process Requests"
      subtitle={
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => nav('/jobs')} className="!p-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span>Track and manage equipment through job lifecycle</span>
        </div>
      }
      actions={
        <Button variant="ghost" size="sm" onClick={() => { refresh(); refreshMaintenance(); }}>
          <RefreshCw className={`w-4 h-4 ${isLoading || maintenanceLoading ? 'animate-spin' : ''}`} />
        </Button>
      }
    >
      <QueueStats stats={stats} />
      
      <QueueTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        counts={allCounts}
      />
      
      <div className="mt-4">
        <QueueContent
          items={items}
          activeTab={activeTab}
          isLoading={isLoading}
          onDisburse={(item) => openModal('disburse', item)}
          onReturn={(item) => openModal('return', item)}
          onStartSourcing={(item) => openModal('sourcing', item)}
          onItemArrived={(item) => openModal('arrived', item)}
          onDisburseArrived={handleDisburseArrived}
          onRepairComplete={(item) => openModal('repair', item)}
          onLinkDisburse={(item) => openModal('linkDisburse', item)}
          // Maintenance props
          maintenanceItems={maintenanceItems}
          maintenanceLoading={maintenanceLoading}
          onMaintenanceRefresh={refreshMaintenance}
        />
      </div>

      {/* Modals */}
      <DisburseModal
        item={modal.type === 'disburse' ? modal.item : null}
        isOpen={modal.type === 'disburse'}
        onClose={closeModal}
        onConfirm={handleDisburse}
        isLoading={isSubmitting}
      />
      
      <ReturnModal
        item={modal.type === 'return' ? modal.item : null}
        isOpen={modal.type === 'return'}
        onClose={closeModal}
        onConfirm={handleReturn}
        isLoading={isSubmitting}
      />
      
      {modal.type === 'sourcing' && modal.item && (
        <SourcingModal item={modal.item} onClose={closeModal} onSubmit={handleStartSourcing} isLoading={isSubmitting} />
      )}
      
      {modal.type === 'arrived' && modal.item && (
        <ItemArrivedModal item={modal.item} onClose={closeModal} onSubmit={handleItemArrived} isLoading={isSubmitting} />
      )}
      
      <RepairCompleteModal
        item={modal.type === 'repair' ? modal.item : null}
        isOpen={modal.type === 'repair'}
        onClose={closeModal}
        onConfirm={handleRepairComplete}
        isLoading={isSubmitting}
      />
      
      <LinkDisburseModal
        isOpen={modal.type === 'linkDisburse'}
        item={modal.item}
        onClose={closeModal}
        onLinkDisburse={handleLinkDisburse}
        onPartialFulfill={(data) => handleAction(partialFulfill, modal.item.id, data)}
        isLoading={isSubmitting}
      />
    </PageWrapper>
  );
};

export default PurchasingQueuePage;
