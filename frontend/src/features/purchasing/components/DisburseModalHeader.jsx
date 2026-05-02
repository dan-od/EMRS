/**
 * DisburseModalHeader - Header and warning sections for disburse modal
 */

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/common';

// Request info header with context for purchasing
export const RequestHeader = ({ request, requestType, departmentName, withoutApproval }) => {
  const details = request?.details || {};
  const purpose = details.purpose || details.reason || null;
  const approvalHistory = request?.approval_history || [];
  const managerComment = approvalHistory.find(h => h.action === 'APPROVED')?.comments;
  const isMaintenance = requestType === 'Maintenance';

  return (
    <div className="p-3 bg-gray-50 dark:bg-[#242b33] rounded-xl border border-gray-100 dark:border-white/10 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-text-primary dark:text-white">
            Request: <span className="text-primary-600 dark:text-primary-400">#{request?.id?.slice(0, 8)}</span> - {requestType}
          </p>
          <p className="text-sm text-text-secondary dark:text-gray-400">
            Requester: {request?.requester_name || 'Unknown'}
            {departmentName && <span> • {departmentName}</span>}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="text-text-secondary dark:text-gray-400">
            Status: <span className="font-medium dark:text-white">{request?.status}</span>
          </p>
          {withoutApproval && <p className="text-amber-600 dark:text-amber-400 font-medium">⚠️ Not yet approved</p>}
        </div>
      </div>
      {purpose && (
        <div className="pt-2 border-t border-gray-200 dark:border-white/10">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Purpose</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{purpose}</p>
        </div>
      )}
      {isMaintenance && <MaintenanceDetails details={details} />}
      {managerComment && (
        <div className="pt-2 border-t border-gray-200 dark:border-white/10">
          <p className="text-xs font-medium text-orange-500 dark:text-orange-400">Manager Notes</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{managerComment}</p>
        </div>
      )}
    </div>
  );
};

// Maintenance-specific details for purchasing context
const MaintenanceDetails = ({ details }) => {
  const severityColors = {
    Critical: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    High: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    Low: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
  };

  return (
    <div className="pt-2 border-t border-gray-200 dark:border-white/10 space-y-2">
      {/* Category, Service Type, Severity row */}
      <div className="flex flex-wrap gap-2 items-center">
        {details.category && (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
            {details.category}
          </span>
        )}
        {details.serviceType && (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
            {details.serviceType}
          </span>
        )}
        {details.severity && (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColors[details.severity] || ''}`}>
            {details.severity}
          </span>
        )}
        {details.urgency && (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400">
            {details.urgency}
          </span>
        )}
      </div>

      {/* Issue description */}
      {details.issueDescription && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Issue</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{details.issueDescription}</p>
        </div>
      )}

      {/* Materials */}
      {details.materials?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Materials Requested</p>
          <ul className="mt-1 space-y-0.5">
            {details.materials.map((m, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                - {m.name}{m.specs ? ` (${m.specs})` : ''} x{m.quantity || 1} {m.unit || ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tools */}
      {details.tools?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tools Requested</p>
          <ul className="mt-1 space-y-0.5">
            {details.tools.map((t, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                - {t.name}{t.specs ? ` (${t.specs})` : ''}{t.serialNumber ? ` [${t.serialNumber}]` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vendor recommendation */}
      {details.vendorRecommendation?.vendorName && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Vendor Recommendation</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {details.vendorRecommendation.vendorName}
            {details.vendorRecommendation.contact ? ` - ${details.vendorRecommendation.contact}` : ''}
            {details.vendorRecommendation.notes ? ` (${details.vendorRecommendation.notes})` : ''}
          </p>
        </div>
      )}

      {/* Additional notes */}
      {details.additionalNotes && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Additional Notes</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{details.additionalNotes}</p>
        </div>
      )}
    </div>
  );
};

// Warning for unapproved disbursement
export const ApprovalWarning = () => (
  <div className="p-3 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 rounded-xl flex items-start gap-2">
    <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Disbursing without manager approval</p>
      <p className="text-sm text-amber-700 dark:text-amber-400">Please provide justification below.</p>
    </div>
  </div>
);

// Quick date apply section
export const DateApplySection = ({ defaultReturnDate, setDefaultReturnDate, onApply }) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 p-3 bg-blue-50 dark:bg-blue-500/15 border border-blue-100 dark:border-blue-500/20 rounded-xl">
    <div className="flex-1">
      <label className="block text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
        Default return date for all items:
      </label>
      <input
        type="date"
        value={defaultReturnDate}
        onChange={(e) => setDefaultReturnDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        className="w-full px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-[#1a1f26] dark:text-white focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <Button variant="outline" size="sm" onClick={onApply} disabled={!defaultReturnDate}>
      Apply to All
    </Button>
  </div>
);

// Summary section
export const SummarySection = ({ summary }) => (
  <div className="p-3 bg-gray-100 dark:bg-[#242b33] rounded-xl border border-gray-200 dark:border-white/10">
    <p className="text-sm font-medium text-gray-800 dark:text-white">
      Summary: {summary.disbursed}/{summary.total} disbursed
      {summary.onHold > 0 && <span className="text-amber-600 dark:text-amber-400"> • {summary.onHold} on hold</span>}
      {summary.rejected > 0 && <span className="text-red-600 dark:text-red-400"> • {summary.rejected} rejected</span>}
      {summary.ready > 0 && <span className="text-blue-600 dark:text-blue-400"> • {summary.ready} ready</span>}
    </p>
  </div>
);

// Justification textarea
export const JustificationInput = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Justification (Required)
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Explain why disbursing without approval..."
      rows={2}
      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1f26] dark:text-white dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
    />
  </div>
);
