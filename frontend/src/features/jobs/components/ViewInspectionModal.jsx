/**
 * ViewInspectionModal - View full inspection details with all checklist responses
 * Supports: Engineers viewing their submissions, Managers signing off
 */
import { useState, useEffect } from 'react';
import { Modal, Button } from '@/components/common';
import { 
  ClipboardCheck, CheckCircle, AlertTriangle, Wrench, User, Calendar, 
  FileSignature, Check, X, ChevronDown, ChevronUp, XCircle
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

// ============================================
// SUB-COMPONENTS
// ============================================
const StatusBadge = ({ status }) => {
  const config = {
    PASSED: { label: 'Passed', bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-300', icon: CheckCircle },
    FLAGGED_REPAIR: { label: 'Needs Repair', bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-300', icon: Wrench },
    ACKNOWLEDGED_PROCEED: { label: 'Risk Acknowledged', bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-300', icon: AlertTriangle },
    PENDING_REVIEW: { label: 'Pending Review', bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300', icon: ClipboardCheck }
  };
  const cfg = config[status] || { label: status, bg: 'bg-gray-100 dark:bg-gray-500/20', text: 'text-gray-700 dark:text-gray-300', icon: ClipboardCheck };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${cfg.bg} ${cfg.text} text-sm font-medium`}>
      <Icon className="w-4 h-4" />{cfg.label}
    </span>
  );
};

const ResponseBadge = ({ value }) => {
  if (value === 'PASS' || value === true || value === 'Yes') {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-xs"><CheckCircle className="w-3 h-3" />Pass</span>;
  }
  if (value === 'FAIL' || value === false || value === 'No') {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 text-xs"><XCircle className="w-3 h-3" />Fail</span>;
  }
  if (value === 'N/A') {
    return <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 text-xs">N/A</span>;
  }
  return <span className="text-sm text-gray-800 dark:text-gray-200">{String(value)}</span>;
};

const ChecklistSection = ({ title, items, responses, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  if (!items || items.length === 0) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{items.length} items</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>
      {expanded && (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {items.map((item, idx) => {
            const response = responses?.[item.id];
            return (
              <div key={item.id || idx} className="p-3 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{item.label}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                  )}
                  {response?.notes && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">Note: {response.notes}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <ResponseBadge value={response?.value ?? response} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DecisionBadge = ({ decision }) => {
  if (!decision) return <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">Pending</span>;
  if (decision === 'APPROVED' || decision === 'APPROVED_REPAIR') return <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300">Approved</span>;
  if (decision === 'REJECTED') return <span className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300">Rejected</span>;
  return null;
};

const FailedItemReview = ({ item, onDecision, isManager }) => {
  const [notes, setNotes] = useState('');
  const [deciding, setDeciding] = useState(false);

  const handleDecision = async (decision) => {
    setDeciding(true);
    try {
      await onDecision(item.id, decision, notes);
    } finally {
      setDeciding(false);
    }
  };

  const isRepair = item.resolution === 'REPAIR';
  const hasDecision = !!item.manager_decision;

  return (
    <div className={`p-4 rounded-lg border ${isRepair ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30' : 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">{item.checklist_item_label}</p>
          <span className={`text-xs px-2 py-0.5 rounded ${isRepair ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300' : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'}`}>
            {isRepair ? 'Flagged for Repair' : 'Risk Acknowledged'}
          </span>
        </div>
        <DecisionBadge decision={item.manager_decision} />
      </div>
      
      {item.engineer_notes && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
          <span className="text-xs text-gray-500 dark:text-gray-400">Engineer Notes:</span>
          <p className="text-gray-800 dark:text-gray-200">{item.engineer_notes}</p>
        </div>
      )}
      
      {!hasDecision && isManager && (
        <div className="mt-3 space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Manager notes (optional)..."
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 outline-none resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            {isRepair ? (
              <>
                <Button size="sm" variant="primary" onClick={() => handleDecision('APPROVED_REPAIR')} disabled={deciding} className="flex-1">
                  <Wrench className="w-3 h-3 mr-1" />Approve Repair
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDecision('REJECTED')} disabled={deciding}>
                  <X className="w-3 h-3 mr-1" />Reject
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="primary" onClick={() => handleDecision('APPROVED')} disabled={deciding} className="flex-1">
                  <Check className="w-3 h-3 mr-1" />Approve Risk
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDecision('REJECTED')} disabled={deciding}>
                  <X className="w-3 h-3 mr-1" />Reject
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      
      {hasDecision && item.manager_notes && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
          <span className="text-xs text-gray-500 dark:text-gray-400">Manager Notes:</span>
          <p className="text-gray-800 dark:text-gray-200">{item.manager_notes}</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const ViewInspectionModal = ({ jobId, item, onClose, onRefresh }) => {
  const [inspection, setInspection] = useState(null);
  const [failedItems, setFailedItems] = useState([]);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingOff, setSigningOff] = useState(false);
  const [showFullChecklist, setShowFullChecklist] = useState(true);
  const { user } = useAuthStore();

  const MANAGER_ROLES = ['Super Admin', 'Super_Admin', 'Admin', 'Operations Manager', 'Operations_Manager'];
  const isManager = MANAGER_ROLES.includes(user?.role);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch inspection
        const res = await api.get(`/jobs/${jobId}/items/${item.id}/inspections`);
        if (res.data.inspections?.length > 0) {
          const insp = res.data.inspections[0];
          setInspection(insp);
          // Fetch failed items
          const fiRes = await api.get(`/jobs/${jobId}/inspections/${insp.id}/failed-items`);
          setFailedItems(fiRes.data.failed_items || []);
        }
        // Fetch template for labels
        try {
          const tplRes = await api.get(`/jobs/${jobId}/inspections/template`);
          setTemplate(tplRes.data.template);
        } catch (e) { /* Template not critical */ }
      } catch (err) { 
        console.error('Failed to fetch inspection:', err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [jobId, item.id]);

  const handleItemDecision = async (failedItemId, decision, notes) => {
    try {
      await api.post(`/jobs/${jobId}/inspections/${inspection.id}/items/${failedItemId}/decision`, { decision, notes });
      const fiRes = await api.get(`/jobs/${jobId}/inspections/${inspection.id}/failed-items`);
      setFailedItems(fiRes.data.failed_items || []);
      const inspRes = await api.get(`/jobs/${jobId}/items/${item.id}/inspections`);
      if (inspRes.data.inspections?.length > 0) setInspection(inspRes.data.inspections[0]);
    } catch (err) { console.error('Failed to submit decision:', err); }
  };

  const handleSignOffAll = async () => {
    setSigningOff(true);
    try {
      await api.post(`/jobs/${jobId}/inspections/${inspection.id}/signoff`);
      onRefresh?.();
      onClose();
    } catch (err) { console.error('Failed to sign off:', err); }
    finally { setSigningOff(false); }
  };

  const itemName = item.equipment_name || item.client_equipment_name || item.requested_item_name || 'Equipment';
  const canSignOffAll = inspection && !inspection.signed_off_by && isManager;
  const pendingDecisions = failedItems.filter(fi => !fi.manager_decision).length;
  const allDecided = failedItems.length > 0 && pendingDecisions === 0;

  // Parse checklist data
  const checklistData = inspection?.checklist_data || {};
  const categories = template?.categories || [];

  if (loading) {
    return (
      <Modal isOpen onClose={onClose} title="Inspection Details" size="xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </Modal>
    );
  }

  if (!inspection) {
    return (
      <Modal isOpen onClose={onClose} title="Inspection Details" size="xl">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No inspection found.</p>
        <div className="flex justify-end"><Button variant="ghost" onClick={onClose}>Close</Button></div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose} title="Inspection Details" size="xl">
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
        {/* Header */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{itemName}</h3>
            {item.serial_number && <p className="text-sm text-gray-500 dark:text-gray-400">S/N: {item.serial_number}</p>}
          </div>
          <StatusBadge status={inspection.overall_status} />
        </div>

        {/* Inspector Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
              <User className="w-3 h-3" />Inspected By
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{inspection.inspector_name}</p>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
              <Calendar className="w-3 h-3" />Date
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(inspection.submitted_at || inspection.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Sign-off Status */}
        {inspection.signed_off_by ? (
          <div className="p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Signed Off</p>
              <p className="text-xs text-green-600 dark:text-green-400">By {inspection.signoff_name} on {new Date(inspection.signed_off_at).toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-lg flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Pending manager sign-off {pendingDecisions > 0 && `(${pendingDecisions} items need decision)`}
            </p>
          </div>
        )}

        {/* Full Checklist Responses */}
        <div className="space-y-3">
          <button
            onClick={() => setShowFullChecklist(!showFullChecklist)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ClipboardCheck className="w-4 h-4" />
            Inspection Responses
            {showFullChecklist ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showFullChecklist && (
            <div className="space-y-3">
              {categories.length > 0 ? (
                categories.map((cat, idx) => (
                  <ChecklistSection
                    key={cat.id || idx}
                    title={cat.name}
                    items={cat.items}
                    responses={checklistData}
                    defaultExpanded={idx === 0}
                  />
                ))
              ) : (
                /* Fallback if no template - show raw responses */
                Object.keys(checklistData).length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
                    {Object.entries(checklistData).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{key}</span>
                        <ResponseBadge value={typeof val === 'object' ? val.value : val} />
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Failed Items / Issues */}
        {failedItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Issues Requiring Attention ({failedItems.length})
            </h4>
            {failedItems.map(fi => (
              <FailedItemReview key={fi.id} item={fi} onDecision={handleItemDecision} isManager={isManager} />
            ))}
          </div>
        )}

        {/* General Notes */}
        {inspection.notes && (
          <div>
            <h4 className="text-sm font-medium mb-1 text-gray-900 dark:text-white">Inspection Notes</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">{inspection.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        {canSignOffAll && failedItems.length === 0 && (
          <Button variant="primary" onClick={handleSignOffAll} disabled={signingOff}>
            <FileSignature className="w-4 h-4 mr-2" />{signingOff ? 'Signing...' : 'Sign Off'}
          </Button>
        )}
        {canSignOffAll && allDecided && (
          <Button variant="primary" onClick={handleSignOffAll} disabled={signingOff}>
            <FileSignature className="w-4 h-4 mr-2" />{signingOff ? 'Signing...' : 'Sign Off All'}
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default ViewInspectionModal;
