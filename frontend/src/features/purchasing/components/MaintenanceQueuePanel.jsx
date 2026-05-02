import { Wrench, Calendar, Package, ChevronRight, Send, Eye } from 'lucide-react';
import { EmptyState } from '@/components/feedback';
import { formatDate } from '@/utils/formatters';

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

const StatusBadge = ({ status }) => {
  const colors = {
    Pending: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
    Approved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    Manager_Approved: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.Pending}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const MaintenanceRequestCard = ({ request, onDisburse, onView }) => {
  const details = request.details || {};
  const isAdditional = details.isAdditionalRequest;
  const canDisburse = request.status === 'Approved' || request.status === 'Manager_Approved';
  
  return (
    <div 
      className="bg-white dark:bg-[#1e2530] border border-gray-200 dark:border-white/10 rounded-lg p-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-500/50 transition-all cursor-pointer"
      onClick={() => onView?.(request)}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isAdditional ? (
            <Package className="w-5 h-5 text-purple-500" />
          ) : (
            <Wrench className="w-5 h-5 text-blue-500" />
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {isAdditional ? 'Additional Materials' : details.category || 'Maintenance'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {request.requester_name} • {formatDate(request.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {details.severity && <SeverityBadge severity={details.severity} />}
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Issue or Subject */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        {details.issueDescription || details.subject || 'No description'}
      </p>

      {/* Equipment Info */}
      {(request.equipment_name || details.equipmentName) && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="font-medium">Equipment:</span> {request.equipment_name || details.equipmentName}
          {request.serial_number && <span className="ml-2 text-gray-500">({request.serial_number})</span>}
        </div>
      )}

      {/* Materials and Tools for Additional Requests */}
      {isAdditional && (
        <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 mb-3">
          {details.materials?.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Materials:</span>
              <ul className="mt-1 space-y-1">
                {details.materials.map((m, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                    • {m.name} {m.quantity > 1 && `(x${m.quantity})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {details.tools?.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tools:</span>
              <ul className="mt-1 space-y-1">
                {details.tools.map((t, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                    • {t.name} {t.quantity > 1 && `(x${t.quantity})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Date Needed */}
      {request.date_needed && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <Calendar className="w-4 h-4" />
          <span>Needed by: {formatDate(request.date_needed)}</span>
        </div>
      )}

      {/* Work Order Link if exists */}
      {details.workOrderId && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Work Order: #{details.workOrderId.slice(0, 8)}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-gray-200 dark:border-white/10">
        <button
          onClick={(e) => { e.stopPropagation(); onView?.(request); }}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        {canDisburse && (
          <button
            onClick={(e) => { e.stopPropagation(); onDisburse?.(request); }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            Disburse
          </button>
        )}
      </div>
    </div>
  );
};

const MaintenanceQueuePanel = ({ requests, isLoading, onDisburse, onView }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-100 dark:bg-white/10 rounded-lg h-32" />
        ))}
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <EmptyState
        icon={Wrench}
        title="No maintenance requests"
        description="Maintenance requests awaiting processing will appear here"
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 dark:text-dark-muted mb-4">
        Maintenance requests and additional material requests from work orders
      </p>
      {requests.map(request => (
        <MaintenanceRequestCard 
          key={request.id} 
          request={request} 
          onDisburse={onDisburse}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default MaintenanceQueuePanel;
