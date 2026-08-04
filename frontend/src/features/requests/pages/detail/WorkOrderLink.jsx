/**
 * WorkOrderLink - Click-through from a request to the work order it produced.
 *
 * Renders for any request carrying details.workOrderId. Purchasing approval
 * writes that key for standard Maintenance requests as well as Jobs-module
 * additional requests, so both paths get the link; only the wording differs.
 */
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WorkOrderLink = ({ details }) => {
  const navigate = useNavigate();
  const workOrderId = details?.workOrderId;
  if (!workOrderId) return null;

  const isAdditionalRequest = details.isAdditionalRequest;
  const label = isAdditionalRequest ? 'Additional Request for Work Order' : 'Work Order';

  return (
    <div className="pb-3 border-b border-gray-200 dark:border-dark-border">
      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">{label}</p>
      <button
        type="button"
        onClick={() => navigate(`/maintenance/${workOrderId}`)}
        className="group flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        {details.equipmentName && <span>{details.equipmentName} •</span>}
        <span className="font-mono text-xs underline underline-offset-2">#{workOrderId.slice(0, 8)}</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
      </button>
      {isAdditionalRequest && details.notes && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{details.notes}</p>
      )}
    </div>
  );
};

export default WorkOrderLink;
