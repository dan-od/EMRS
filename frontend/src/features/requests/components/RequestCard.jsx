import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HardHat, Package, Truck, Wrench, Settings, 
  Calendar, ChevronRight, AlertTriangle, RotateCcw, Clock
} from 'lucide-react';

const TYPE_CONFIG = {
  PPE: { icon: HardHat, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/15' },
  Material: { icon: Package, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/15' },
  Transport: { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/15' },
  Equipment: { icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/15' },
  Maintenance: { icon: Settings, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/15' }
};

const STATUS_CONFIG = {
  Pending: { color: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  PENDING: { color: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  Approved: { color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  APPROVED: { color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  Rejected: { color: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  REJECTED: { color: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  Completed: { color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  COMPLETED: { color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  On_Hold: { color: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  Disbursed: { color: 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400', dot: 'bg-teal-500' },
  Pending_Return: { color: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' }
};

const PRIORITY_CONFIG = {
  Low: { color: 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400' },
  Medium: { color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  High: { color: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400' },
  Critical: { color: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' }
};

export const RequestCard = ({ request, showReturnAction = false, onUpdate }) => {
  const navigate = useNavigate();
  
  const requestType = request.type || request.request_type || 'Request';
  const typeConfig = TYPE_CONFIG[requestType] || { icon: Package, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-500/15' };
  const Icon = typeConfig.icon;
  const status = request.status || 'Pending';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const priority = request.priority || 'Medium';
  const priorityConfig = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getSummary = () => {
    if (!request.details) return null;
    if (request.details.items?.length) return `${request.details.items.length} item${request.details.items.length > 1 ? 's' : ''}`;
    if (request.details.vehicleType) return `${request.details.vehicleType} - ${request.details.destination || ''}`;
    if (request.details.equipmentType) return request.details.equipmentType;
    if (request.details.issueDescription) return request.details.issueDescription.substring(0, 50) + '...';
    return null;
  };

  const getStatusNote = () => {
    if (status === 'On_Hold') return { text: request.disbursement_notes || 'On hold', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/15' };
    if (status === 'Rejected') return { text: request.rejection_reason || 'Not approved', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/15' };
    if (request.disbursed_without_approval && ['Disbursed', 'Completed', 'Pending_Return'].includes(status)) {
      return { text: 'Disbursed without approval', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/15', icon: AlertTriangle };
    }
    return null;
  };

  // Get return date info
  const returnDate = request.expected_return_date || request.expectedReturnDate || request.return_date;
  const isOverdue = returnDate && new Date(returnDate) < new Date() && status === 'Disbursed';
  const isPendingReturn = status === 'Pending_Return';

  const summary = getSummary();
  const statusNote = getStatusNote();

  return (
    <div 
      onClick={() => navigate(`/requests/${request.id}`)}
      className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-white/10 rounded-xl p-4 hover:shadow-md hover:border-gray-200 dark:hover:border-white/20 cursor-pointer transition-all"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`p-3 rounded-xl ${typeConfig.bg} flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${typeConfig.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-primary dark:text-white truncate">{requestType} Request</h3>
          {summary && <p className="text-sm text-text-secondary dark:text-gray-400 truncate mt-0.5">{summary}</p>}

          {/* Status note (on hold, rejected, without approval) */}
          {statusNote && (
            <div className={`flex items-center gap-1.5 mt-1.5 px-2 py-1 rounded-md ${statusNote.bg} max-w-fit`}>
              {statusNote.icon && <statusNote.icon className={`w-3 h-3 ${statusNote.color}`} />}
              <p className={`text-xs ${statusNote.color} truncate max-w-[200px] sm:max-w-[250px]`}>{statusNote.text}</p>
            </div>
          )}

          {/* Created date */}
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            {formatDate(request.created_at)}
          </div>
        </div>

        {/* Right side: Status, Priority, Return info - SIMPLIFIED */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {/* Status badge */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
            <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${statusConfig.color}`}>
              {status.replace('_', ' ')}
            </span>
          </div>

          {/* Priority badge */}
          <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${priorityConfig.color}`}>
            {priority}
          </span>

          {/* Return date - only show if there's a date, for Disbursed or Pending_Return */}
          {returnDate && (status === 'Disbursed' || status === 'Pending_Return') && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
              <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs font-medium whitespace-nowrap">
                {isOverdue ? 'Overdue' : `Return by: ${formatDate(returnDate)}`}
              </span>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 hidden sm:block" />
      </div>
    </div>
  );
};

export default RequestCard;