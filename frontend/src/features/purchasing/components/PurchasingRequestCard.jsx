import { Package, Truck, Wrench, HardHat, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Card, Badge, StatusBadge, AuditTrailProgress, buildAuditSteps } from '@/components/common';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/helpers';

/**
 * Request type icons
 */
const TYPE_ICONS = {
  PPE: HardHat,
  Equipment: Package,
  Material: ShoppingBag,
  Transport: Truck,
  Maintenance: Wrench
};

/**
 * Get approval status indicator
 */
const getApprovalStatus = (request) => {
  // Handle both snake_case and camelCase (avoiding common mistake #5)
  const status = request.status;
  const approvedAt = request.approved_at || request.approvedAt;
  const disbursedWithoutApproval = request.disbursed_without_approval || request.disbursedWithoutApproval;
  
  if (status === 'Rejected') {
    return { label: 'Rejected', color: 'bg-error/10 text-error dark:bg-red-500/20 dark:text-red-400', icon: '✗' };
  }
  if (disbursedWithoutApproval) {
    return { label: 'Disbursed (No Approval)', color: 'bg-warning-100 text-warning-700 dark:bg-amber-500/20 dark:text-amber-400', icon: '⚠️' };
  }
  if (approvedAt || status === 'Approved') {
    return { label: 'Manager Approved', color: 'bg-success/10 text-success dark:bg-green-500/20 dark:text-green-400', icon: '✓' };
  }
  if (status === 'On_Hold') {
    return { label: 'On Hold', color: 'bg-warning-100 text-warning-700 dark:bg-amber-500/20 dark:text-amber-400', icon: '⏸' };
  }
  if (['Disbursed', 'Pending_Return', 'Completed'].includes(status)) {
    return { label: 'Processed', color: 'bg-success/10 text-success dark:bg-green-500/20 dark:text-green-400', icon: '✓' };
  }
  return { label: 'Awaiting Manager', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400', icon: '⏳' };
};

/**
 * PurchasingRequestCard - Shows request with audit trail for purchasing dept
 */
export const PurchasingRequestCard = ({ 
  request, 
  onDisburse, 
  onDisburseWithoutApproval,
  onHold,
  onReleaseFromHold,
  onConfirmReturn,
  onRemind,
  compact = false 
}) => {
  if (!request) return null;

  // Handle snake_case/camelCase (avoiding common mistake #5)
  const requestId = request.id;
  const type = request.type;
  const status = request.status;
  const priority = request.priority;
  const requesterName = request.requester_name || request.requesterName || 'Unknown';
  const requesterDept = request.requester_department || request.requesterDepartment || '-';
  const createdAt = request.created_at || request.createdAt;
  const expectedReturnDate = request.expected_return_date || request.expectedReturnDate;
  const daysOverdue = request.days_overdue || request.daysOverdue || 0;
  const details = request.details || {};
  
  const Icon = TYPE_ICONS[type] || Package;
  const approvalStatus = getApprovalStatus(request);
  const auditSteps = buildAuditSteps(request);
  
  const isOverdue = daysOverdue > 0 || 
    (expectedReturnDate && new Date(expectedReturnDate) < new Date() && 
     ['Disbursed', 'Pending_Return'].includes(status));

  // Format items for display
  const formatItems = () => {
    if (!details.items) return null;
    if (Array.isArray(details.items)) {
      return details.items.map(i => `${i.name || i.item} (${i.quantity || 1})`).join(', ');
    }
    return null;
  };

  // Get request-specific details
  const getRequestDetails = () => {
    const parts = [];
    
    if (type === 'PPE') {
      const items = formatItems();
      if (items) parts.push(`Items: ${items}`);
      if (details.reason) parts.push(`Reason: ${details.reason}`);
    } else if (type === 'Equipment') {
      if (details.equipmentType) parts.push(`Type: ${details.equipmentType}`);
      if (details.duration) parts.push(`Duration: ${details.duration}`);
      if (details.purpose) parts.push(`Purpose: ${details.purpose}`);
    } else if (type === 'Transport') {
      if (details.pickup && details.destination) {
        parts.push(`${details.pickup} → ${details.destination}`);
      }
      if (details.vehicleType) parts.push(`Vehicle: ${details.vehicleType}`);
      if (details.passengers) parts.push(`Passengers: ${details.passengers}`);
      if (details.purpose) parts.push(`Purpose: ${details.purpose}`);
    } else if (type === 'Material') {
      const items = formatItems();
      if (items) parts.push(`Items: ${items}`);
      if (details.purpose) parts.push(`Purpose: ${details.purpose}`);
    } else if (type === 'Maintenance') {
      if (details.category) parts.push(`Category: ${details.category}`);
      if (details.issueDescription) parts.push(`Issue: ${details.issueDescription}`);
      if (details.severity) parts.push(`Severity: ${details.severity}`);
      if (details.location) parts.push(`Location: ${details.location}`);
    }
    
    return parts;
  };

  const requestDetails = getRequestDetails();

  return (
    <Card className={cn(
      'p-4 hover:shadow-md transition-shadow',
      isOverdue && 'border-l-4 border-l-error'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            type === 'PPE' ? 'bg-blue-100 dark:bg-blue-500/20' :
            type === 'Equipment' ? 'bg-purple-100 dark:bg-purple-500/20' :
            type === 'Transport' ? 'bg-green-100 dark:bg-green-500/20' :
            type === 'Maintenance' ? 'bg-orange-100 dark:bg-orange-500/20' :
            'bg-gray-100 dark:bg-gray-500/20'
          )}>
            <Icon className="w-5 h-5 text-text-primary dark:text-dark-text" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-text-muted dark:text-dark-muted">
                #{requestId?.slice(0, 8)}
              </span>
              <Badge variant="outline" size="sm">{type}</Badge>
              {priority === 'Critical' && (
                <Badge variant="error" size="sm">Critical</Badge>
              )}
              {priority === 'High' && (
                <Badge variant="warning" size="sm">High</Badge>
              )}
            </div>
            <p className="text-sm text-text-primary dark:text-dark-text font-medium">
              {requesterName}
              <span className="text-text-muted dark:text-dark-muted font-normal"> • {requesterDept}</span>
            </p>
          </div>
        </div>
        
        {isOverdue && (
          <div className="flex items-center gap-1 text-error dark:text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Overdue</span>
          </div>
        )}
      </div>

      {/* Audit Trail */}
      <div className="mb-3 bg-gray-50 dark:bg-[#0f1419] rounded-lg p-3 border border-gray-100 dark:border-white/5">
        <AuditTrailProgress steps={auditSteps} compact={compact} />
        
        {/* Approval Status Indicator */}
        <div className={cn(
          'mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
          approvalStatus.color
        )}>
          <span>{approvalStatus.icon}</span>
          <span>{approvalStatus.label}</span>
        </div>
      </div>

      {/* Request Details */}
      {requestDetails.length > 0 && (
        <div className="mb-3 space-y-1">
          {requestDetails.slice(0, 3).map((detail, idx) => (
            <p key={idx} className="text-sm text-text-secondary dark:text-dark-muted line-clamp-1">
              {detail}
            </p>
          ))}
          {requestDetails.length > 3 && (
            <p className="text-xs text-text-muted dark:text-dark-muted">+{requestDetails.length - 3} more details</p>
          )}
        </div>
      )}

      {/* Return Date Info for Disbursed items */}
      {status === 'Disbursed' && (
        <div className={cn(
          'mb-3 p-2 rounded-lg text-sm',
          isOverdue ? 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400' : 
          expectedReturnDate ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400' : 
          'bg-gray-50 dark:bg-dark-card/50 text-gray-600 dark:text-dark-muted'
        )}>
          {expectedReturnDate ? (
            <span>
              {isOverdue ? '⚠️ Overdue! Return was due: ' : '📅 Return by: '}
              {new Date(expectedReturnDate).toLocaleDateString()}
            </span>
          ) : (
            <span>📦 Consumable - No return needed</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
        <span className="text-xs text-text-muted dark:text-dark-muted">
          {createdAt && formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>

        <div className="flex flex-wrap gap-2">
          {/* Show different buttons based on status */}
          {status === 'Pending' && (
            <>
              {onDisburseWithoutApproval && (
                <button
                  onClick={() => onDisburseWithoutApproval(request)}
                  className="px-3 py-1.5 text-xs font-medium text-warning-700 dark:text-amber-400 bg-warning-100 dark:bg-amber-500/20 rounded-lg hover:bg-warning-200 dark:hover:bg-amber-500/30"
                >
                  Disburse Anyway
                </button>
              )}
              {onHold && (
                <button
                  onClick={() => onHold(request)}
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary dark:text-dark-muted bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20"
                >
                  Put on Hold
                </button>
              )}
            </>
          )}
          
          {status === 'Approved' && (
            <>
              {onDisburse && (
                <button
                  onClick={() => onDisburse(request)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-success dark:bg-green-600 rounded-lg hover:bg-success/90 dark:hover:bg-green-700"
                >
                  Disburse
                </button>
              )}
              {onHold && (
                <button
                  onClick={() => onHold(request)}
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary dark:text-dark-muted bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20"
                >
                  Put on Hold
                </button>
              )}
            </>
          )}
          
          {/* On Hold - show Resume and Disburse buttons */}
          {status === 'On_Hold' && (
            <>
              {onReleaseFromHold && (
                <button
                  onClick={() => onReleaseFromHold(request)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 dark:bg-blue-600 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Resume
                </button>
              )}
              {onDisburse && (
                <button
                  onClick={() => onDisburse(request)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-success dark:bg-green-600 rounded-lg hover:bg-success/90 dark:hover:bg-green-700"
                >
                  Disburse
                </button>
              )}
            </>
          )}
          
          {status === 'Pending_Return' && onConfirmReturn && (
            <button
              onClick={() => onConfirmReturn(request)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary-500 dark:bg-primary-600 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700"
            >
              Confirm Return
            </button>
          )}
          
          {isOverdue && onRemind && status !== 'Pending_Return' && (
            <button
              onClick={() => onRemind(request)}
              className="px-3 py-1.5 text-xs font-medium text-error dark:text-red-400 bg-error/10 dark:bg-red-500/20 rounded-lg hover:bg-error/20 dark:hover:bg-red-500/30"
            >
              Remind
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PurchasingRequestCard;
