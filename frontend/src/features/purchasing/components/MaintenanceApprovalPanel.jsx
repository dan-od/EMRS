/**
 * MaintenanceApprovalPanel - Shows Manager_Approved maintenance requests
 * Each card has a "Review" button that opens PurchasingApprovalForm
 */
import { useState } from 'react';
import { Wrench, Calendar, Package, Eye, AlertTriangle, Home, Building2, Shuffle } from 'lucide-react';
import { EmptyState } from '@/components/feedback';
import { formatDate, formatCurrency } from '@/utils/formatters';
import PurchasingApprovalForm from '../../requests/components/PurchasingApprovalForm';

const SERVICE_TYPE_ICONS = {
  'In-House': Home,
  'External': Building2,
  'Mixed': Shuffle
};

const SeverityBadge = ({ severity }) => {
  const colors = {
    Critical: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    High: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    Low: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[severity] || colors.Medium}`}>
      {severity}
    </span>
  );
};

const MaintenanceCard = ({ request, onReview }) => {
  const details = request.details || {};
  const isAdditional = details.isAdditionalRequest;
  const ServiceIcon = SERVICE_TYPE_ICONS[details.serviceType] || Wrench;
  
  // Count materials and tools
  const materialsCount = (details.materials?.length || 0) + (details.managerMaterialAdditions?.length || 0);
  const toolsCount = (details.tools?.length || 0) + (details.managerToolAdditions?.length || 0);
  
  return (
    <div className="bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-white/10 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isAdditional ? 'bg-purple-100 dark:bg-purple-500/20' : 'bg-blue-100 dark:bg-blue-500/20'}`}>
            {isAdditional ? (
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            ) : (
              <ServiceIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {isAdditional ? 'Additional Materials Request' : `${details.category || 'Equipment'} Maintenance`}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {request.requester_name} • {formatDate(request.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {details.severity && <SeverityBadge severity={details.severity} />}
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
            Awaiting Review
          </span>
        </div>
      </div>

      {/* Issue Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
        {details.issueDescription || details.subject || 'No description provided'}
      </p>

      {/* Equipment Info */}
      {(request.equipment_name || details.equipmentName) && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <Wrench className="w-4 h-4" />
          <span>{request.equipment_name || details.equipmentName}</span>
          {request.serial_number && (
            <span className="text-gray-400">({request.serial_number})</span>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mb-3 text-sm">
        {details.serviceType && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <ServiceIcon className="w-4 h-4" />
            <span>{details.serviceType}</span>
          </div>
        )}
        {materialsCount > 0 && (
          <div className="text-gray-600 dark:text-gray-400">
            {materialsCount} material{materialsCount > 1 ? 's' : ''}
          </div>
        )}
        {toolsCount > 0 && (
          <div className="text-gray-600 dark:text-gray-400">
            {toolsCount} tool{toolsCount > 1 ? 's' : ''}
          </div>
        )}
        {details.costEstimate && (
          <div className="text-emerald-600 dark:text-emerald-400 font-medium">
            Est: {formatCurrency(details.costEstimate)}
          </div>
        )}
      </div>

      {/* Manager Notes Preview */}
      {details.managerNotes && (
        <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-2 mb-3 text-sm">
          <span className="font-medium text-amber-800 dark:text-amber-300">Manager Notes: </span>
          <span className="text-amber-700 dark:text-amber-400">{details.managerNotes}</span>
        </div>
      )}

      {/* Date Needed */}
      {request.date_needed && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <Calendar className="w-4 h-4" />
          <span>Needed by: {formatDate(request.date_needed)}</span>
        </div>
      )}

      {/* Work Order Reference */}
      {details.workOrderId && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Work Order: #{details.workOrderId.slice(0, 8)}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-white/10">
        <button
          onClick={() => onReview(request)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          {isAdditional ? 'Review & Disburse' : 'Review & Approve'}
        </button>
      </div>
    </div>
  );
};

const MaintenanceApprovalPanel = ({ requests, isLoading, onApprovalComplete }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalForm, setShowApprovalForm] = useState(false);

  const handleReview = (request) => {
    setSelectedRequest(request);
    setShowApprovalForm(true);
  };

  const handleClose = () => {
    setShowApprovalForm(false);
    setSelectedRequest(null);
  };

  const handleApprovalSuccess = () => {
    handleClose();
    onApprovalComplete?.();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-100 dark:bg-white/10 rounded-lg h-40" />
        ))}
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <EmptyState
        icon={Wrench}
        title="No pending approvals"
        description="Manager-approved maintenance requests will appear here for your review"
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        <p className="text-sm text-gray-500 dark:text-dark-muted mb-4">
          Review maintenance requests approved by managers. Link materials to inventory, confirm vendors, and finalize costs.
        </p>
        {requests.map(request => (
          <MaintenanceCard 
            key={request.id} 
            request={request} 
            onReview={handleReview}
          />
        ))}
      </div>

      {/* Purchasing Approval Form Modal */}
      {showApprovalForm && selectedRequest && (
        <PurchasingApprovalForm
          request={selectedRequest}
          isOpen={showApprovalForm}
          onClose={handleClose}
          onSuccess={handleApprovalSuccess}
        />
      )}
    </>
  );
};

export default MaintenanceApprovalPanel;
