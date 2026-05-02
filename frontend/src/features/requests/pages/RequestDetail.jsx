/**
 * RequestDetail - Request detail page
 * Enhanced for Maintenance requests with multi-step approval
 * Manager → Manager_Approved → Purchasing → Approved + Work Order
 */
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout';
import { Card, CardContent, StatusBadge, PriorityBadge } from '@/components/common';
import { PageLoader } from '@/components/feedback';
import { ApprovalActions, ReturnSection, ManagerApprovalForm, PurchasingApprovalForm } from '../components';
import { useRequest, useRequestActions } from '../hooks/useRequests';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { ChevronLeft, AlertCircle, Wrench } from 'lucide-react';
import { 
  StatusNotice, 
  RequestInfo, 
  RequestDetailsSection, 
  ApprovalHistory,
  MaintenanceDetailsSection 
} from './detail';

// --- Helper Functions ---

const formatRequestType = (type) => {
  if (!type) return 'Request';
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

const isManagerRole = (role) => {
  const managerRoles = [
    'Admin', 'Super_Admin', 'IT_Manager',
    'Operations_Manager', 'Accounts_Manager', 'Purchasing_Manager',
    'Safety_Manager', 'Maintenance_Manager',
    'HR_Manager', 'Logistics_Manager', 'Workshop_Manager'
  ];
  return managerRoles.includes(role);
};

const isPurchasingRole = (role) => {
  const purchasingRoles = ['Purchasing_Manager', 'Purchasing_Staff'];
  return purchasingRoles.some(r => 
    role === r || role.toLowerCase() === r.toLowerCase() ||
    role.replace(/_/g, ' ').toLowerCase() === r.replace(/_/g, ' ').toLowerCase()
  );
};

const getApprovalContext = (user, request) => {
  if (!user || !request) return { canApprove: false };
  
  const role = user.role || '';
  const status = request.status || '';
  const isMaintenance = request.type?.toLowerCase() === 'maintenance';
  const isManager = isManagerRole(role);
  const isPurchasing = isPurchasingRole(role);
  const isOwnRequest = request.requester_id === user.id;
  
  if (isMaintenance) {
    if (isManager && status === 'Pending' && !isOwnRequest) {
      return { canApprove: true, showManagerForm: true, showPurchasingForm: false };
    }
    if (isPurchasing && status === 'Manager_Approved' && !isOwnRequest) {
      return { canApprove: true, showManagerForm: false, showPurchasingForm: true };
    }
  } else {
    const approverRoles = [
      'Admin', 'Super_Admin', 'IT_Manager',
      'Operations_Manager', 'Accounts_Manager', 'Purchasing_Manager',
      'Safety_Manager', 'Maintenance_Manager',
      'HR_Manager', 'Logistics_Manager', 'Workshop_Manager'
    ];
    const isApprover = approverRoles.includes(role);
    if (isApprover && status === 'Pending' && !isOwnRequest) {
      return { canApprove: true, showManagerForm: false, showPurchasingForm: false, showStandard: true };
    }
  }
  
  return { canApprove: false };
};

// --- Main Component ---

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const uiStore = useUIStore();
  const { request, isLoading, error, refresh } = useRequest(id);
  const { approveRequest, rejectRequest, transferRequest, isLoading: actionLoading } = useRequestActions();
  
  const [approvedItems, setApprovedItems] = useState(null);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [showPurchasingForm, setShowPurchasingForm] = useState(false);

  useEffect(() => {
    return () => {
      setShowManagerForm(false);
      setShowPurchasingForm(false);
    };
  }, []);

  const requestType = request?.type || request?.request_type || '';
  const isMaintenance = requestType.toLowerCase() === 'maintenance';
  const approvalContext = getApprovalContext(user, request);

  // Smart back navigation
  const handleGoBack = () => {
    setShowManagerForm(false);
    setShowPurchasingForm(false);
    navigate(-1);
  };

  const handleApprove = async (data) => {
    try {
      let approvalData;
      
      if (isMaintenance && data?.managerData) {
        approvalData = { comments: data.comments, managerData: data.managerData };
      } else if (isMaintenance && data?.purchasingData) {
        approvalData = { comments: data.comments, purchasingData: data.purchasingData };
      } else {
        approvalData = approvedItems 
          ? { comments: data?.comments || data, items: approvedItems } 
          : { comments: data?.comments || data };
      }
      
      await approveRequest(id, approvalData);
      
      const message = data?.purchasingData 
        ? 'Request approved - Work Order created'
        : data?.managerData
          ? 'Request approved - Sent to Purchasing'
          : 'Request approved successfully';
      
      uiStore?.addNotification?.({ type: 'success', message });
      setShowManagerForm(false);
      setShowPurchasingForm(false);
      refresh();
    } catch (err) {
      console.error('Approval error:', err);
      uiStore?.addNotification?.({ type: 'error', message: err.message || 'Failed to approve' });
    }
  };

  const handleReject = async (reason) => {
    try {
      await rejectRequest(id, reason);
      uiStore?.addNotification?.({ type: 'success', message: 'Request rejected' });
      setShowManagerForm(false);
      setShowPurchasingForm(false);
      refresh();
    } catch (err) {
      console.error('Rejection error:', err);
      uiStore?.addNotification?.({ type: 'error', message: err.message || 'Failed to reject' });
    }
  };

  const handleTransfer = async (toDepartment, notes) => {
    try {
      await transferRequest(id, toDepartment, notes);
      uiStore?.addNotification?.({ type: 'success', message: `Request transferred to ${toDepartment}` });
      refresh();
    } catch (err) {
      console.error('Transfer error:', err);
      uiStore?.addNotification?.({ type: 'error', message: err.message || 'Failed to transfer' });
    }
  };

  if (isLoading) return <PageLoader />;
  
  if (error || !request) {
    return (
      <PageWrapper title="Request Details">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-text-primary dark:text-dark-text mb-2">Request Not Found</h3>
          <p className="text-text-secondary dark:text-gray-400 mb-4">
            The request you're looking for doesn't exist or you don't have access.
          </p>
          <button onClick={handleGoBack} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Go Back
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <button onClick={handleGoBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="flex items-center gap-2">
            {isMaintenance && <Wrench className="w-5 h-5 text-orange-500" />}
            {formatRequestType(requestType)} Request
          </span>
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary dark:text-white">
                  {formatRequestType(requestType)} Request
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {request.id?.slice(0, 8)}...</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={request.status} />
                <PriorityBadge priority={request.priority} />
              </div>
            </div>

            <StatusNotice request={request} />
            <ReturnSection request={request} onUpdate={refresh} isOwner={user?.id === request.requester_id} />
            <RequestInfo request={request} />
            
            {isMaintenance ? (
              <div className="border-t border-gray-100 dark:border-white/10 pt-4 mt-4">
                <h3 className="text-sm font-medium text-text-primary dark:text-white mb-4">Maintenance Details</h3>
                <MaintenanceDetailsSection request={request} />
              </div>
            ) : (
              <RequestDetailsSection 
                request={request}
                showApprovalActions={approvalContext.showStandard}
                approvedItems={approvedItems}
                setApprovedItems={setApprovedItems}
                actionLoading={actionLoading}
              />
            )}

            {approvalContext.showStandard && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                <ApprovalActions
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onTransfer={handleTransfer}
                  isLoading={actionLoading}
                />
              </div>
            )}

            {approvalContext.showManagerForm && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text">Manager Review Required</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Add cost estimate and review details before sending to Purchasing
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowManagerForm(true)}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    Review & Approve
                  </button>
                  <button
                    onClick={() => handleReject('Rejected by manager')}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {approvalContext.showPurchasingForm && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/30 mb-4">
                  <h3 className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">
                    Purchasing Review Required
                  </h3>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Link materials/tools to inventory, confirm vendor, and finalize cost. Approving creates a Work Order.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowPurchasingForm(true)}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    Review & Approve
                  </button>
                  <button
                    onClick={() => handleReject('Rejected by Purchasing')}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <ApprovalHistory history={request.approval_history} />
      </div>

      {showManagerForm && approvalContext.showManagerForm && (
        <ManagerApprovalForm
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={actionLoading}
          isOpen={showManagerForm}
          onClose={() => setShowManagerForm(false)}
        />
      )}

      {showPurchasingForm && approvalContext.showPurchasingForm && (
        <PurchasingApprovalForm
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={actionLoading}
          isOpen={showPurchasingForm}
          onClose={() => setShowPurchasingForm(false)}
        />
      )}
    </PageWrapper>
  );
};

export default RequestDetail;