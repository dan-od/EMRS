/**
 * PreInspectionModal - Enhanced with autosave and repair notes
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Button } from '@/components/common';
import { ClipboardCheck, CheckCircle, AlertTriangle, Wrench, ChevronDown, ChevronRight, Save } from 'lucide-react';
import { useInspectionActions } from '../hooks';
import { api } from '@/services/api';

const CHECKLIST_TEMPLATE = {
  general: {
    label: 'General Condition',
    items: [
      { id: 'visual_inspection', label: 'Visual inspection passed (no damage, cracks, corrosion)' },
      { id: 'components_present', label: 'All components present and accounted for' },
      { id: 'serial_verified', label: 'Serial number verified matches documentation' },
      { id: 'calibration_current', label: 'Calibration/certification current (if applicable)' }
    ]
  },
  safety: {
    label: 'Safety',
    items: [
      { id: 'warning_labels', label: 'Warning labels present and legible' },
      { id: 'safety_guards', label: 'Safety guards in place' },
      { id: 'emergency_shutoff', label: 'Emergency shutoff accessible and functional' },
      { id: 'safety_equipment', label: 'Required safety equipment present' }
    ]
  },
  operational: {
    label: 'Operational Readiness',
    items: [
      { id: 'no_leaks', label: 'No leaks detected' },
      { id: 'connections_secure', label: 'Connections secure and properly fitted' },
      { id: 'pressure_ratings', label: 'Pressure ratings appropriate for job' },
      { id: 'functional_test', label: 'Functional test passed' }
    ]
  }
};

const FailedItemCard = ({ item, resolution, onResolve }) => {
  const [localNotes, setLocalNotes] = useState(resolution?.notes || '');
  
  const handleResolve = (res) => onResolve(item.id, res, localNotes);
  const handleNotesChange = (e) => {
    setLocalNotes(e.target.value);
    if (resolution?.resolution) onResolve(item.id, resolution.resolution, e.target.value);
  };

  return (
    <div className={`p-4 rounded-lg border ${
      resolution?.resolution === 'REPAIR' ? 'bg-red-500/10 border-red-500/30' 
      : resolution?.resolution === 'ACKNOWLEDGE' ? 'bg-yellow-500/10 border-yellow-500/30'
      : 'bg-background-secondary border-border-light'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-yellow-400" />
        <span className="font-medium text-sm">{item.label}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Button variant={resolution?.resolution === 'REPAIR' ? 'danger' : 'ghost'} size="sm" onClick={() => handleResolve('REPAIR')} className="justify-center">
          <Wrench className="w-4 h-4 mr-1" />Flag for Repair
        </Button>
        <Button variant={resolution?.resolution === 'ACKNOWLEDGE' ? 'warning' : 'ghost'} size="sm" onClick={() => handleResolve('ACKNOWLEDGE')} className="justify-center">
          <AlertTriangle className="w-4 h-4 mr-1" />Acknowledge & Proceed
        </Button>
      </div>
      
      <div>
        <label className="block text-xs text-text-secondary mb-1">
          {resolution?.resolution === 'REPAIR' ? 'Describe the issue *' : 'Notes (optional)'}
        </label>
        <textarea
          value={localNotes}
          onChange={handleNotesChange}
          placeholder={resolution?.resolution === 'REPAIR' ? 'Describe what is wrong...' : 'Additional notes...'}
          className="w-full px-3 py-2 bg-background-tertiary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-muted focus:border-primary-500 outline-none resize-none"
          rows={2}
        />
      </div>
    </div>
  );
};

export const PreInspectionModal = ({ jobId, item, onClose, onSuccess }) => {
  const [checklist, setChecklist] = useState({});
  const [failedResolutions, setFailedResolutions] = useState({});
  const [notes, setNotes] = useState('');
  const [expandedSections, setExpandedSections] = useState({ general: true, safety: true, operational: true });
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const { submitInspection } = useInspectionActions();
  const autosaveTimer = useRef(null);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await api.get(`/jobs/${jobId}/items/${item.id}/inspection/draft`);
        if (res.data.draft) {
          const draft = res.data.draft;
          setDraftId(draft.id);
          if (draft.checklist_data && Object.keys(draft.checklist_data).length > 0) setChecklist(draft.checklist_data);
          if (draft.failed_items?.length > 0) {
            const resolutions = {};
            draft.failed_items.forEach(fi => { resolutions[fi.item_id] = { resolution: fi.resolution, notes: fi.notes || fi.reason }; });
            setFailedResolutions(resolutions);
          }
          if (draft.notes) setNotes(draft.notes);
        }
      } catch (err) { console.error('Failed to load draft:', err); }
    };
    loadDraft();
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [jobId, item.id]);

  // Autosave function
  const autosave = useCallback(async () => {
    if (!draftId) return;
    try {
      const failedItemsData = Object.entries(failedResolutions).filter(([_, v]) => v.resolution).map(([id, v]) => ({
        item_id: id, label: getAllItems().find(i => i.id === id)?.label || id, resolution: v.resolution, notes: v.notes
      }));
      await api.post(`/jobs/${jobId}/inspections/${draftId}/autosave`, {
        checklist_data: checklist, failed_items: failedItemsData, notes
      });
      setLastSaved(new Date());
    } catch (err) { console.error('Autosave failed:', err); }
  }, [draftId, checklist, failedResolutions, notes, jobId]);

  // Trigger autosave on changes
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(autosave, 3000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [checklist, failedResolutions, notes, autosave]);

  const getAllItems = () => Object.values(CHECKLIST_TEMPLATE).flatMap(s => s.items);

  const toggleItem = (sectionKey, itemId) => {
    setChecklist(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const failedItems = getAllItems().filter(item => checklist[item.id] === false);

  const handleResolve = (itemId, resolution, itemNotes) => {
    setFailedResolutions(prev => ({ ...prev, [itemId]: { resolution, notes: itemNotes } }));
  };

  const canSubmit = () => {
    const allResolved = failedItems.every(fi => failedResolutions[fi.id]?.resolution);
    const repairsHaveNotes = failedItems.filter(fi => failedResolutions[fi.id]?.resolution === 'REPAIR')
      .every(fi => failedResolutions[fi.id]?.notes?.trim());
    return allResolved && repairsHaveNotes;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const failedItemsData = failedItems.map(fi => ({
        item_id: fi.id, label: fi.label, resolution: failedResolutions[fi.id]?.resolution, notes: failedResolutions[fi.id]?.notes || null
      }));
      await submitInspection(jobId, item.id, { checklist_data: checklist, failed_items: failedItemsData, notes });
      onSuccess?.();
    } catch (err) { console.error('Failed to submit inspection:', err); }
    finally { setSubmitting(false); }
  };

  const itemName = item.equipment_name || item.client_equipment_name || item.requested_item_name || 'Equipment';

  return (
    <Modal isOpen onClose={onClose} title="Pre-Inspection Checklist" size="lg">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary-400" />
            <span className="font-medium text-primary-300">{itemName}</span>
            {item.serial_number && <span className="text-xs text-text-secondary">S/N: {item.serial_number}</span>}
          </div>
          {lastSaved && <span className="text-xs text-green-400 flex items-center gap-1"><Save className="w-3 h-3" />Saved</span>}
        </div>

        {/* Checklist Sections */}
        {Object.entries(CHECKLIST_TEMPLATE).map(([key, section]) => (
          <div key={key} className="border border-border-light rounded-lg overflow-hidden">
            <button onClick={() => setExpandedSections(p => ({ ...p, [key]: !p[key] }))} className="w-full flex items-center justify-between p-3 bg-background-secondary hover:bg-background-tertiary transition-colors">
              <span className="font-medium">{section.label}</span>
              {expandedSections[key] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections[key] && (
              <div className="p-2 space-y-1">
                {section.items.map(checkItem => (
                  <label key={checkItem.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-background-tertiary cursor-pointer">
                    <input type="checkbox" checked={checklist[checkItem.id] === true} onChange={() => toggleItem(key, checkItem.id)}
                      className="w-5 h-5 rounded border-border-light text-primary-500 focus:ring-primary-500 bg-background-secondary" />
                    <span className={`text-sm ${checklist[checkItem.id] === true ? 'text-text-primary' : 'text-text-secondary'}`}>{checkItem.label}</span>
                    {checklist[checkItem.id] === false && <XCircle className="w-4 h-4 text-red-400 ml-auto" />}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Failed Items Resolution */}
        {failedItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-yellow-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />Resolve Failed Items ({failedItems.length})
            </h4>
            {failedItems.map(fi => (
              <FailedItemCard key={fi.id} item={fi} resolution={failedResolutions[fi.id]} onResolve={handleResolve} />
            ))}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Inspection Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional observations..."
            className="w-full px-3 py-2 bg-background-secondary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-muted focus:border-primary-500 outline-none resize-none" rows={3} />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border-light mt-4">
        <span className="text-xs text-text-muted">{lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Not saved yet'}</span>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting || (failedItems.length > 0 && !canSubmit())}>
            <ClipboardCheck className="w-4 h-4 mr-2" />{submitting ? 'Submitting...' : 'Submit for Sign-off'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PreInspectionModal;
