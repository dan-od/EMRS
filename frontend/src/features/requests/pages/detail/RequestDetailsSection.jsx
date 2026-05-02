/**
 * RequestDetailsSection - Details area for request items
 */
import { Package, Wrench, CheckCircle, XCircle, Briefcase } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { ItemApprovalSection } from '../../components';
import { DetailRow } from './RequestInfo';

const RequestDetailsSection = ({ request, showApprovalActions, approvedItems, setApprovedItems, actionLoading }) => {
  const details = request.details || {};
  
  // Check for additional request format (materials/tools arrays)
  const hasMaterials = details.materials && Array.isArray(details.materials) && details.materials.length > 0;
  const hasTools = details.tools && Array.isArray(details.tools) && details.tools.length > 0;
  const hasItems = details.items && Array.isArray(details.items) && details.items.length > 0;
  const isAdditionalRequest = details.isAdditionalRequest;

  return (
    <div className="border-t border-gray-100 dark:border-white/10 pt-4">
      <h3 className="text-sm font-medium text-text-primary dark:text-dark-text mb-3">Request Details</h3>
      
      {request.details && (
        <div className="bg-gray-50 dark:bg-[#0f1419] rounded-lg p-4 border border-gray-100 dark:border-white/10 space-y-4">
          
          {/* Additional Request Info (Work Order link) */}
          {isAdditionalRequest && details.workOrderId && (
            <div className="pb-3 border-b border-gray-200 dark:border-dark-border">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Additional Request for Work Order</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {details.equipmentName && <span>{details.equipmentName} • </span>}
                <span className="font-mono text-xs">#{details.workOrderId.slice(0, 8)}</span>
              </p>
              {details.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{details.notes}</p>}
            </div>
          )}

          {/* Subject if present */}
          {details.subject && !isAdditionalRequest && (
            <DetailRow label="Subject" value={details.subject} />
          )}

          {/* Materials (Additional Request format) */}
          {hasMaterials && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> Materials
              </p>
              <div className="space-y-1">
                {details.materials.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm pl-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span className="text-gray-700 dark:text-gray-300">{item.name || item.item}</span>
                    <span className="text-gray-500 dark:text-gray-400">× {item.quantity || item.qty || 1}</span>
                    {item.specifications && <span className="text-xs text-gray-400">({item.specifications})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tools (Additional Request format) */}
          {hasTools && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" /> Tools
              </p>
              <div className="space-y-1">
                {details.tools.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm pl-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    <span className="text-gray-700 dark:text-gray-300">{item.name || item.item}</span>
                    <span className="text-gray-500 dark:text-gray-400">× {item.quantity || item.qty || 1}</span>
                    {item.specifications && <span className="text-xs text-gray-400">({item.specifications})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PPE/Equipment Items (Original format) */}
          {hasItems && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Items:</p>
              {showApprovalActions ? (
                <ItemApprovalSection 
                  items={details.items}
                  onChange={setApprovedItems}
                  disabled={actionLoading}
                />
              ) : (
                <div className="space-y-2">
                  {details.items.map((item, idx) => {
                    const isNewRequest = item.isNewRequest === true;
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-2 text-sm p-2 rounded-lg ${
                          isNewRequest 
                            ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30' 
                            : 'bg-gray-50 dark:bg-white/5'
                        }`}
                      >
                        <Package className={`w-4 h-4 mt-0.5 ${isNewRequest ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900 dark:text-white">{item.item || item.name}</span>
                            {item.size && <span className="text-gray-500 dark:text-gray-400">(Size: {item.size})</span>}
                            {item.specifications && <span className="text-blue-500 dark:text-blue-400">— Specifications: {item.specifications}</span>}
                            <span className="text-gray-500 dark:text-gray-400">× {item.quantity || 1}</span>
                            {isNewRequest && (
                              <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-medium">
                                New Request
                              </span>
                            )}
                            {item.approval_status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {item.approval_status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                          </div>
                          {/* Category and Type */}
                          {(item.category || item.assetCategory || item.type) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.category || item.assetCategory}
                              {item.type && ` • ${item.type}`}
                            </p>
                          )}
                          {/* Notes */}
                          {item.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Transport Details */}
          {details.vehicleType && (
            <>
              <DetailRow label="Vehicle Type" value={details.vehicleType} />
              <DetailRow label="Pickup" value={details.pickup} />
              <DetailRow label="Destination" value={details.destination} />
              {details.passengers && <DetailRow label="Passengers" value={details.passengers} />}
            </>
          )}

          {/* Equipment Details */}
          {details.equipmentType && (
            <>
              <DetailRow label="Equipment Type" value={details.equipmentType} />
              <DetailRow label="Duration" value={details.duration} />
            </>
          )}

          {/* Maintenance Details */}
          {details.issueDescription && (
            <>
              <DetailRow label="Issue" value={details.issueDescription} />
              <DetailRow label="Urgency" value={details.urgency} />
            </>
          )}

          {/* Purpose/Reason (not for additional requests - they use notes) */}
          {!isAdditionalRequest && (details.purpose || details.reason) && (
            <DetailRow label="Purpose" value={details.purpose || details.reason} />
          )}

          {/* Empty state if no content */}
          {!hasMaterials && !hasTools && !hasItems && !details.vehicleType && !details.equipmentType && !details.issueDescription && !isAdditionalRequest && (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">No details available</p>
          )}
        </div>
      )}

      {/* Fallback for old format */}
      {!request.details && (request.description || request.justification) && (
        <p className="text-text-secondary dark:text-gray-400 whitespace-pre-wrap">
          {request.description || request.justification}
        </p>
      )}

      {/* Date Needed */}
      {request.date_needed && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
          <DetailRow label="Date Needed" value={formatDate(request.date_needed)} />
        </div>
      )}
    </div>
  );
};

export default RequestDetailsSection;