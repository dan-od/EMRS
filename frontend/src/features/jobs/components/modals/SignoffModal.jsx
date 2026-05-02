/**
 * SignoffModal - Pre-job sign-off checklist
 */
import { useState } from 'react';
import { Modal, Button } from '@/components/common';
import { useJobWorkflow } from '../../hooks';

export const SignoffModal = ({ jobId, onClose, onSuccess }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState({ equipment: false, issues: false, team: false });
  const { signoffJob } = useJobWorkflow();

  const allChecked = Object.values(checks).every(v => v);

  const handleSubmit = async () => {
    if (!allChecked) return;
    setLoading(true);
    try {
      await signoffJob(jobId, notes, { equipment_inspected: checks.equipment, issues_resolved: checks.issues, team_briefed: checks.team });
      onSuccess?.();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed');
    }
    setLoading(false);
  };

  const Checkbox = ({ id, label }) => (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" checked={checks[id]} onChange={e => setChecks(p => ({ ...p, [id]: e.target.checked }))} className="w-5 h-5 rounded" />
      <span className="text-sm">{label}</span>
    </label>
  );

  return (
    <Modal isOpen onClose={onClose} title="Pre-Job Sign-Off">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">Confirm all requirements are met before starting.</p>
        <div className="space-y-3 p-4 bg-background-secondary rounded-lg">
          <Checkbox id="equipment" label="All equipment inspected and ready" />
          <Checkbox id="issues" label="All issues resolved or manager-approved" />
          <Checkbox id="team" label="Team briefed and ready to mobilize" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Notes (optional)</label>
          <textarea className="w-full px-3 py-2 border border-border-light rounded-lg text-sm" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!allChecked || loading}>{loading ? 'Signing...' : 'Complete Sign-Off'}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SignoffModal;
