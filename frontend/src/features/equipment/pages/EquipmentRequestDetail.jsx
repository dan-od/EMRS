/**
 * EquipmentRequestDetail Page
 * View request + approve/reject. Uses RequestActionPanels.
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, Badge } from '@/components/common';
import { PageLoader, EmptyState } from '@/components/feedback';
import { RequestActionPanels } from '../components/RequestActionPanels';
import { equipmentService } from '../services/equipmentService';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { formatTypeLabel, canApproveEquipmentRequests } from '@/utils/equipmentConstants';
import { formatDate } from '@/utils/formatters';
import { ClipboardList, Package, Wrench } from 'lucide-react';
import useSWR from 'swr';

const EquipmentRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { addNotification } = useUiStore();
  const [processing, setProcessing] = useState(false);

  const { data, isLoading, mutate } = useSWR(
    id ? `equipment-request-${id}` : null,
    () => equipmentService.getRequestById(id),
    { revalidateOnFocus: false }
  );
  const request = data?.data;
  const canAct = canApproveEquipmentRequests(user?.role) && request?.status === 'Pending';

  const handleApprove = async (payload) => {
    setProcessing(true);
    try {
      await equipmentService.approveRequest(id, payload);
      addNotification({ type: 'success', message: 'Approved — equipment added to inventory' });
      mutate();
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to approve' });
    } finally { setProcessing(false); }
  };

  const handleReject = async (reason) => {
    if (!reason?.trim()) { addNotification({ type: 'error', message: 'Rejection reason required' }); return; }
    setProcessing(true);
    try {
      await equipmentService.rejectRequest(id, reason);
      addNotification({ type: 'success', message: 'Request rejected' });
      mutate();
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to reject' });
    } finally { setProcessing(false); }
  };

  if (isLoading) return <PageLoader />;
  if (!request) return (
    <EmptyState icon={ClipboardList} title="Request not found"
      description="This request may have been removed"
      action={() => navigate(-1)} actionLabel="Go Back" />
  );

  const isTool = request.asset_category === 'TOOL';
  const Icon = isTool ? Wrench : Package;
  const statusVariant = { Pending: 'warning', Approved: 'success', Rejected: 'error' };

  return (
    <PageWrapper title={request.name} backButton backTo="/equipment/requests">
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
            ${isTool ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-primary-100 dark:bg-primary-500/20'}`}>
            <Icon className={`w-6 h-6 ${isTool ? 'text-blue-600 dark:text-blue-400' : 'text-primary-600 dark:text-primary-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{request.name}</h2>
              <Badge variant={statusVariant[request.status] || 'secondary'}>{request.status}</Badge>
            </div>
            <p className="text-sm text-text-secondary dark:text-dark-muted">
              {isTool ? 'Tool' : 'Equipment'} · {formatTypeLabel(request.type)} · Qty {request.quantity}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <DL label="Department" value={request.owning_department?.replace(/_/g, ' ')} />
          <DL label="Serial Number" value={request.serial_number || 'N/A'} />
          <DL label="Location" value={request.location || 'N/A'} />
          <DL label="Requested By" value={request.requester_name || 'Unknown'} />
          <DL label="Date Submitted" value={formatDate(request.created_at)} />
        </dl>
      </Card>

      {request.justification && (
        <Card className="mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Justification</h3>
          <p className="text-sm text-text-secondary dark:text-dark-muted whitespace-pre-wrap">{request.justification}</p>
        </Card>
      )}

      {request.notes && (
        <Card className="mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Notes</h3>
          <p className="text-sm text-text-secondary dark:text-dark-muted">{request.notes}</p>
        </Card>
      )}

      {canAct && (
        <RequestActionPanels onApprove={handleApprove} onReject={handleReject} processing={processing} />
      )}
    </PageWrapper>
  );
};

const DL = ({ label, value }) => (
  <div>
    <dt className="text-text-muted dark:text-dark-muted">{label}</dt>
    <dd className="font-medium text-text-primary dark:text-dark-text">{value}</dd>
  </div>
);

export default EquipmentRequestDetail;
