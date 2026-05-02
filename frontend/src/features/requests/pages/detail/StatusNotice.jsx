/**
 * StatusNotice - Shows important status info prominently
 */
import { formatDateTime } from '@/utils/formatters';
import { 
  PauseCircle, XCircle, CheckCircle, AlertTriangle, RotateCcw 
} from 'lucide-react';

const StatusNotice = ({ request }) => {
  const status = request.status;
  const disbursedWithoutApproval = request.disbursed_without_approval;
  
  // On Hold
  if (status === 'On_Hold') {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-500/15 border border-yellow-200 dark:border-yellow-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-3">
          <PauseCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Request On Hold</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              {request.disbursement_notes || request.hold_reason || 'This request has been put on hold by the Purchasing department.'}
            </p>
            {request.updated_at && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Since {formatDateTime(request.updated_at)}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Rejected
  if (status === 'Rejected') {
    return (
      <div className="bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-red-800 dark:text-red-300">Request Rejected</h4>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              {request.rejection_reason || request.manager_notes || 'This request was not approved.'}
            </p>
            {request.approved_by_name && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                By {request.approved_by_name} on {formatDateTime(request.approved_at || request.updated_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Disbursed without approval - warning
  if (disbursedWithoutApproval && ['Disbursed', 'Completed', 'Pending_Return'].includes(status)) {
    return (
      <div className="bg-orange-50 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-orange-800 dark:text-orange-300">Disbursed Without Manager Approval</h4>
            <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
              {request.disbursement_notes || 'This request was disbursed before manager approval was received.'}
            </p>
            {request.disbursed_by_name && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                Disbursed by {request.disbursed_by_name} on {formatDateTime(request.disbursed_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Approved with notes
  if (status === 'Approved' && request.manager_notes) {
    return (
      <div className="bg-green-50 dark:bg-green-500/15 border border-green-200 dark:border-green-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-green-800 dark:text-green-300">Approved by Manager</h4>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">{request.manager_notes}</p>
            {request.approved_by_name && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                By {request.approved_by_name} on {formatDateTime(request.approved_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Disbursed (normal flow)
  if (status === 'Disbursed' && !disbursedWithoutApproval) {
    return (
      <div className="bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-800 dark:text-blue-300">Items Disbursed</h4>
            {request.disbursement_notes && (
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">{request.disbursement_notes}</p>
            )}
            {request.disbursed_by_name && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                By {request.disbursed_by_name} on {formatDateTime(request.disbursed_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Pending Return
  if (status === 'Pending_Return') {
    return (
      <div className="bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-purple-800 dark:text-purple-300">Return Initiated</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
              {request.return_notes || 'You have initiated a return. Waiting for Purchasing to confirm receipt.'}
            </p>
            {request.return_initiated_at && (
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                Initiated on {formatDateTime(request.return_initiated_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Completed with return
  if (status === 'Completed' && request.return_confirmed_at) {
    return (
      <div className="bg-green-50 dark:bg-green-500/15 border border-green-200 dark:border-green-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-green-800 dark:text-green-300">Return Confirmed</h4>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              {request.return_notes || 'Items have been returned and confirmed by Purchasing.'}
              {request.return_condition && ` Condition: ${request.return_condition}`}
            </p>
            {request.return_confirmed_by_name && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Confirmed by {request.return_confirmed_by_name} on {formatDateTime(request.return_confirmed_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

export default StatusNotice;
