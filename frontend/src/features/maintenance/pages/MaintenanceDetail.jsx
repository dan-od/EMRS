/**
 * MaintenanceDetail Page
 * Work Order detail view - uses modular sub-components
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, Button } from '@/components/common';
import { PageLoader, EmptyState } from '@/components/feedback';
import {
  CompleteMaintenanceModal, AssignEngineerModal, AdditionalRequestModal,
  WorkOrderHeader, WorkOrderSidebar, WorkOrderActions, DisbursedItemsCard
} from '../components';
import { useMaintenanceDetail, useMaintenanceActions } from '../hooks/useMaintenance';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { isAdmin, isManager } from '@/utils/helpers';
import { formatDateTime, formatCurrency } from '@/utils/formatters';
import { Wrench, ArrowLeft } from 'lucide-react';
import { api } from '@/services/api';
import { canViewCosts } from '@/utils/helpers';

const MaintenanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { addNotification, openConfirmation } = useUiStore();

  const { maintenance, isLoading, refresh } = useMaintenanceDetail(id);
  const { startWork, complete, cancel, assign, isLoading: actionLoading } = useMaintenanceActions();

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAdditionalModal, setShowAdditionalModal] = useState(false);

  const canManage = isAdmin(user?.role) || isManager(user?.role);
  const isAssignedEngineer = maintenance?.assigned_to === user?.id;
  const canWork = canManage || isAssignedEngineer;

  // Go back to work orders list
  const handleGoBack = () => {
    navigate('/maintenance');
  };

  const handleStartWork = async () => {
    try {
      await startWork(id);
      addNotification({ type: 'success', message: 'Work started' });
      refresh();
    } catch { addNotification({ type: 'error', message: 'Failed to start' }); }
  };

  const handleComplete = async (data) => {
    try {
      await complete(id, data);
      addNotification({ type: 'success', message: 'Completed successfully' });
      setShowCompleteModal(false);
      refresh();
    } catch { addNotification({ type: 'error', message: 'Failed to complete' }); }
  };

  const handleCancel = () => {
    openConfirmation({
      title: 'Cancel Work Order', message: 'Are you sure?', confirmText: 'Cancel', variant: 'danger',
      onConfirm: async () => {
        try { await cancel(id, 'Cancelled'); addNotification({ type: 'success', message: 'Cancelled' }); refresh(); }
        catch { addNotification({ type: 'error', message: 'Failed' }); }
      }
    });
  };

  const handleAssign = async (engineerId) => {
    try {
      await assign(id, engineerId);
      addNotification({ type: 'success', message: 'Engineer assigned' });
      setShowAssignModal(false);
      refresh();
    } catch (err) { addNotification({ type: 'error', message: err.message || 'Failed' }); }
  };

  const handleAdditionalRequest = async (data) => {
    try {
      await api.post(`/maintenance/${id}/additional-request`, data);
      addNotification({ type: 'success', message: 'Request submitted - awaiting Manager approval' });
      setShowAdditionalModal(false);
      refresh();
    } catch (err) { addNotification({ type: 'error', message: err.response?.data?.message || 'Failed' }); }
  };

  if (isLoading) return <PageLoader />;
  if (!maintenance) return <EmptyState icon={Wrench} title="Not found" action={handleGoBack} actionLabel="Back to Work Orders" />;

  return (
    <PageWrapper
      title={<div className="flex items-center gap-3">
        <button 
          onClick={handleGoBack} 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Back to Work Orders"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span>Work Order Details</span>
      </div>}
      actions={<WorkOrderActions maintenance={maintenance} canManage={canManage} canWork={canWork} isAssignedEngineer={isAssignedEngineer}
        isLoading={actionLoading} onAssign={() => setShowAssignModal(true)} onRequestAdditional={() => setShowAdditionalModal(true)}
        onStart={handleStartWork} onComplete={() => setShowCompleteModal(true)} onCancel={handleCancel} />}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <WorkOrderHeader maintenance={maintenance} />
          <DescriptionCard maintenance={maintenance} />
          {maintenance.request_id && <LinkedRequestCard requestId={maintenance.request_id} navigate={navigate} />}
          {/* Pass additional_requests to DisbursedItemsCard */}
          <DisbursedItemsCard 
            requestDetails={maintenance.request_details} 
            additionalRequests={maintenance.additional_requests || []}
          />
          {maintenance.status === 'Completed' && <CompletionCard maintenance={maintenance} userRole={user?.role} />}
        </div>
        <WorkOrderSidebar maintenance={maintenance} canManage={canManage} onAssign={() => setShowAssignModal(true)} />
      </div>

      <CompleteMaintenanceModal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)} onSubmit={handleComplete} maintenance={maintenance} isLoading={actionLoading} />
      <AssignEngineerModal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} workOrder={maintenance} onAssign={handleAssign} isLoading={actionLoading} />
      <AdditionalRequestModal isOpen={showAdditionalModal} onClose={() => setShowAdditionalModal(false)} workOrder={maintenance} onSubmit={handleAdditionalRequest} isLoading={actionLoading} />
    </PageWrapper>
  );
};

const DescriptionCard = ({ maintenance }) => (
  <Card>
    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
    <p className="text-gray-600 dark:text-gray-300">{maintenance.description || 'No description'}</p>
    {maintenance.notes && <><h4 className="font-medium text-gray-700 dark:text-gray-300 mt-4 mb-2">Notes</h4><p className="text-gray-500 dark:text-gray-400 text-sm">{maintenance.notes}</p></>}
  </Card>
);

const LinkedRequestCard = ({ requestId, navigate }) => (
  <Card>
    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Linked Request</h3>
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500 dark:text-gray-400">#{requestId.slice(0, 8)}</p>
      <Button variant="outline" size="sm" onClick={() => navigate(`/requests/${requestId}`)}>View</Button>
    </div>
  </Card>
);

const CompletionCard = ({ maintenance, userRole }) => {
  const showCost = canViewCosts(userRole);
  return (
    <Card>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Completion Details</h3>
      <div className="space-y-3">
        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Completed</span><span className="font-medium text-gray-900 dark:text-white">{formatDateTime(maintenance.completed_at)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">By</span><span className="font-medium text-gray-900 dark:text-white">{maintenance.completed_by_name}</span></div>
        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Hours</span><span className="font-medium text-gray-900 dark:text-white">{maintenance.actual_hours || '-'}</span></div>
        {showCost && (
          <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Cost</span><span className="font-medium text-gray-900 dark:text-white">{maintenance.actual_cost ? formatCurrency(maintenance.actual_cost) : '-'}</span></div>
        )}
      </div>
    </Card>
  );
};

export default MaintenanceDetail;
