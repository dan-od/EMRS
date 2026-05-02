/**
 * ManagerReviewDisplay - Shows manager's review data for Purchasing
 */
import { FileText, DollarSign, Building2, MessageSquare } from 'lucide-react';

const ManagerReviewDisplay = ({ 
  costEstimate, 
  notes, 
  vendor, 
  approverName 
}) => {
  if (!costEstimate && !notes && !vendor) return null;

  const vendorName = typeof vendor === 'object' 
    ? (vendor?.vendorName || vendor?.name) 
    : vendor;

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl space-y-3">
      <h4 className="font-medium text-blue-900 dark:text-blue-300 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Manager's Review
        {approverName && (
          <span className="text-xs font-normal text-blue-600 dark:text-blue-400">
            (by {approverName})
          </span>
        )}
      </h4>
      
      {costEstimate && (
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Cost Estimate: <strong>₦{Number(costEstimate).toLocaleString()}</strong>
          </span>
        </div>
      )}
      
      {vendorName && (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Recommended Vendor: <strong>{vendorName}</strong>
          </span>
        </div>
      )}
      
      {notes && (
        <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">{notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerReviewDisplay;
