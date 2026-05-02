import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { ContentLoader, EmptyState } from '@/components/feedback';
import { PurchasingRequestCard } from '../components/PurchasingRequestCard';
import PurchasingTabs from '../components/PurchasingTabs';
import PurchasingStats from '../components/PurchasingStats';
import DisburseModalV2 from '../components/DisburseModalV2';
import HoldModal from '../components/HoldModal';
import ReturnModal from '../components/ReturnModal';
import MaintenanceApprovalPanel from '../components/MaintenanceApprovalPanel';
import DisbursedItemsPanel from '../components/DisbursedItemsPanel';
import PendingExtensionsPanel from '../../requests/components/PendingExtensionsPanel';
import { usePurchasingDashboard, usePurchasingActions } from '../hooks/usePurchasing';
import { extensionActions } from '../../requests/hooks/useExtensions';
import { useUIStore } from '@/store/uiStore';
import { Package } from 'lucide-react';

const PurchasingDashboard = () => {
  const { addNotification } = useUIStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get tab from URL, default to 'all'
  const activeTab = searchParams.get('tab') || 'all';
  
  // Update URL when tab changes
  const setActiveTab = (tab) => {
    setSearchParams({ tab }, { replace: true });
  };
  const [disburseModal, setDisburseModal] = useState({ open: false, request: null, withoutApproval: false });
  const [holdModal, setHoldModal] = useState({ open: false, request: null });
  const [returnModal, setReturnModal] = useState({ open: false, request: null });

  // Single dashboard fetch replacing 11 separate SWR calls
  const {
    isLoading: allLoading, refresh: refreshAll,
    stats, allRequests, readyRequests, holdRequests,
    disbursedRequests, returnRequests, overdueRequests, completedRequests,
    maintenanceRequests, approvedMaintenanceRequests, lowStock, extensions
  } = usePurchasingDashboard();

  const refreshExtensions = refreshAll;
  const statsLoading = allLoading;

  const { disburseRequest, putOnHold, releaseFromHold, confirmReturn, isLoading: actionLoading } = usePurchasingActions();

  // Extension handlers
  const handleExtensionApprove = async (id, notes) => {
    try {
      await extensionActions.purchasingApprove(id, notes);
      addNotification({ type: 'success', message: 'Extension approved. Return date updated.' });
      refreshExtensions();
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to approve extension' });
    }
  };

  const handleExtensionReject = async (id, notes) => {
    try {
      await extensionActions.purchasingReject(id, notes);
      addNotification({ type: 'success', message: 'Extension rejected' });
      refreshExtensions();
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to reject extension' });
    }
  };

  const refreshAllData = () => {
    refreshAll();
  };

  // Get current tab data
  const getTabData = () => {
    switch (activeTab) {
      case 'ready': return readyRequests;
      case 'disbursed': return null; // Handled by DisbursedItemsPanel
      case 'on-hold': return holdRequests;
      case 'pending-return': return returnRequests;
      case 'overdue': return overdueRequests;
      case 'extensions': return null; // Handled separately
      case 'maintenance': return null; // Handled separately
      case 'completed': return completedRequests;
      default: return allRequests;
    }
  };

  const extensionsCount = extensions?.length || 0;
  const maintenanceCount = maintenanceRequests?.length || 0;

  // Handlers for per-item disbursement
  const handleDisburseItem = async (itemIndex, itemData) => {
    try {
      // For now, disburse the whole request with this item's data
      // TODO: Implement true per-item disbursement in backend
      await disburseRequest(disburseModal.request.id, {
        notes: itemData.notes,
        expectedReturnDate: itemData.isConsumable ? null : itemData.returnDate,
        withoutApproval: disburseModal.withoutApproval,
        inventoryLinks: [{
          itemIndex,
          inventoryId: itemData.inventoryId,
          quantity: 1,
          isConsumable: itemData.isConsumable,
          returnDate: itemData.returnDate
        }]
      });
      addNotification({ type: 'success', message: 'Item disbursed successfully' });
      refreshAllData();
    } catch (err) {
      addNotification({ type: 'error', message: err.message || 'Failed to disburse item' });
    }
  };

  const handleDisburseAll = async (readyItems, notes, defaultReturnDate) => {
    try {
      const inventoryLinks = readyItems.map(({ item, index }) => ({
        itemIndex: index,
        inventoryId: item.inventoryId || null,
        quantity: item.quantity || 1,
        isConsumable: item.isConsumable || false,
        returnDate: item.returnDate || defaultReturnDate || null
      }));

      // Calculate the earliest non-null return date for the request-level expected_return_date
      const returnDates = inventoryLinks
        .filter(link => !link.isConsumable && link.returnDate)
        .map(link => link.returnDate);
      const expectedReturnDate = returnDates.length > 0
        ? returnDates.sort()[0] // Get earliest date
        : defaultReturnDate || null;

      await disburseRequest(disburseModal.request.id, {
        notes,
        expectedReturnDate,
        withoutApproval: disburseModal.withoutApproval,
        inventoryLinks
      });
      addNotification({ type: 'success', message: 'All items disbursed successfully' });
      setDisburseModal({ open: false, request: null, withoutApproval: false });
      refreshAllData();
    } catch (err) {
      addNotification({ type: 'error', message: err.message || 'Failed to disburse' });
    }
  };

  const handleHoldItem = async (itemIndex, reason) => {
    try {
      await putOnHold(disburseModal.request.id, reason);
      addNotification({ type: 'success', message: 'Item put on hold' });
      refreshAllData();
    } catch (err) {
      addNotification({ type: 'error', message: err.message || 'Failed to put on hold' });
    }
  };

  const handleHold = async (notes) => {
    try {
      await putOnHold(holdModal.request.id, notes);
      addNotification({ type: 'success', message: 'Request put on hold' });
      setHoldModal({ open: false, request: null });
      refreshAllData();
    } catch (err) {
      addNotification({ type: 'error', message: err.message || 'Failed to put on hold' });
    }
  };

  const handleReleaseFromHold = async (request) => {
    try {
      await releaseFromHold(request.id);
      addNotification({ type: 'success', message: 'Request released from hold' });
      refreshAllData();
    } catch (err) {
      addNotification({ type: 'error', message: err.message || 'Failed to release' });
    }
  };

  const handleConfirmReturn = async (data) => {
    try {
      await confirmReturn(returnModal.request.id, data);
      addNotification({ type: 'success', message: 'Return confirmed' });
      setReturnModal({ open: false, request: null });
      refreshAllData();
    } catch (err) {
      addNotification({ type: 'error', message: err.message || 'Failed to confirm return' });
    }
  };

  const currentRequests = getTabData();

  return (
    <PageWrapper title="Process Requests">
      <PurchasingStats stats={stats} lowStockCount={lowStock?.length || 0} />

      <div className="bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200 dark:border-white/10 mb-6">
        <PurchasingTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={stats}
          extensionsCount={extensionsCount}
          maintenanceCount={maintenanceCount}
        />

        <div className="p-4">
          {activeTab === 'extensions' ? (
            /* Extensions Tab Content */
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted mb-4">
                Review and approve return date extension requests (Manager approved)
              </p>
              <PendingExtensionsPanel
                extensions={extensions}
                isLoading={extensionsLoading}
                role="purchasing"
                onApprove={handleExtensionApprove}
                onReject={handleExtensionReject}
                onRefresh={refreshExtensions}
              />
            </div>
          ) : activeTab === 'maintenance' ? (
            /* Maintenance Tab Content - with full approval form */
            <MaintenanceApprovalPanel
              requests={maintenanceRequests}
              isLoading={maintenanceLoading}
              onApprovalComplete={refreshAllData}
            />
          ) : activeTab === 'disbursed' ? (
            /* Disbursed Tab - Shows actual items out in the field */
            <DisbursedItemsPanel
              requests={disbursedRequests}
              maintenanceRequests={approvedMaintenanceRequests}
              isLoading={disbursedLoading}
            />
          ) : currentRequests === undefined ? (
            <ContentLoader />
          ) : currentRequests.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No requests"
              description={`No ${activeTab === 'all' ? '' : activeTab} requests found`}
            />
          ) : (
            <div className="space-y-3">
              {currentRequests.map(request => (
                <PurchasingRequestCard
                  key={request.id}
                  request={request}
                  onDisburse={(req) => setDisburseModal({ open: true, request: req, withoutApproval: false })}
                  onDisburseWithoutApproval={(req) => setDisburseModal({ open: true, request: req, withoutApproval: true })}
                  onHold={(req) => setHoldModal({ open: true, request: req })}
                  onReleaseFromHold={handleReleaseFromHold}
                  onConfirmReturn={(req) => setReturnModal({ open: true, request: req })}
                  isCompletedView={activeTab === 'completed'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DisburseModalV2
        isOpen={disburseModal.open}
        onClose={() => setDisburseModal({ open: false, request: null, withoutApproval: false })}
        request={disburseModal.request}
        withoutApproval={disburseModal.withoutApproval}
        onDisburseItem={handleDisburseItem}
        onDisburseAll={handleDisburseAll}
        onHoldItem={handleHoldItem}
        isLoading={actionLoading}
      />

      <HoldModal
        isOpen={holdModal.open}
        onClose={() => setHoldModal({ open: false, request: null })}
        request={holdModal.request}
        onHold={handleHold}
        isLoading={actionLoading}
      />

      <ReturnModal
        isOpen={returnModal.open}
        onClose={() => setReturnModal({ open: false, request: null })}
        request={returnModal.request}
        onConfirm={handleConfirmReturn}
        isLoading={actionLoading}
      />
    </PageWrapper>
  );
};

export default PurchasingDashboard;
