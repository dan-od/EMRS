/**
 * EquipmentRequestsList Page
 * Managers see pending equipment requests for their department.
 * Backend: GET /equipment/requests
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, Button, Badge, Select } from '@/components/common';
import { PageLoader, EmptyState } from '@/components/feedback';
import { useEquipmentRequests } from '../hooks/useEquipment';
import { formatTypeLabel } from '@/utils/equipmentConstants';
import { formatDate, formatRelativeTime } from '@/utils/formatters';
import { ClipboardList, ArrowRight, Package, Wrench } from 'lucide-react';

const STATUS_FILTER = ['', 'Pending', 'Approved', 'Rejected'];

const statusBadge = (status) => {
  const map = {
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'error'
  };
  return <Badge variant={map[status] || 'secondary'}>{status}</Badge>;
};

const EquipmentRequestsList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('Pending');
  const { requests, total, isLoading, error } = useEquipmentRequests(
    statusFilter ? { status: statusFilter } : {}
  );

  if (isLoading) return <PageLoader />;

  return (
    <PageWrapper
      title="Equipment Requests"
      subtitle={`${total} request${total !== 1 ? 's' : ''}`}
      backButton
      backTo="/equipment"
    >
      {/* Filter */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Statuses</option>
          {STATUS_FILTER.filter(Boolean).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No requests"
          description={
            statusFilter
              ? `No ${statusFilter.toLowerCase()} equipment requests`
              : 'No equipment requests found'
          }
        />
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <RequestCard key={req.id} request={req} onView={() => navigate(`/equipment/requests/${req.id}`)} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

const RequestCard = ({ request, onView }) => {
  const isTool = request.asset_category === 'TOOL';
  const Icon = isTool ? Wrench : Package;

  return (
    <Card className="hover:bg-gray-50 dark:hover:bg-dark-card transition-colors cursor-pointer" onClick={onView}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${isTool ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-primary-100 dark:bg-primary-500/20'}`}>
          <Icon className={`w-5 h-5 ${isTool ? 'text-blue-600 dark:text-blue-400' : 'text-primary-600 dark:text-primary-400'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-semibold text-sm text-text-primary dark:text-dark-text truncate">
              {request.name}
            </h3>
            {statusBadge(request.status)}
          </div>
          <p className="text-xs text-text-secondary dark:text-dark-muted truncate">
            {formatTypeLabel(request.type)} · Qty {request.quantity} · {request.owning_department?.replace(/_/g, ' ')}
          </p>
          <p className="text-xs text-text-muted dark:text-dark-muted mt-0.5 truncate">
            Requested by {request.requester_name || 'Unknown'} · {formatRelativeTime(request.created_at)}
          </p>
        </div>

        <ArrowRight className="w-4 h-4 text-text-muted dark:text-dark-muted flex-shrink-0 hidden sm:block" />
      </div>
    </Card>
  );
};

export default EquipmentRequestsList;
