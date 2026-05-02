/**
 * WorkflowActions - Context-aware action buttons
 */
import { useState } from 'react';
import { Button } from '@/components/common';
import { Send, Check, X, Play, Flag, CheckCircle, Clipboard } from 'lucide-react';
import { useJobWorkflow } from '../hooks';
import { RejectModal, SignoffModal, CancelModal } from './modals';
import { MANAGER_ROLES } from '../constants';

// Helper for case-insensitive status check
const statusIs = (status, ...values) => {
  const s = (status || '').toUpperCase();
  return values.some(v => v.toUpperCase() === s);
};

export const WorkflowActions = ({ job, userRole, userId, onRefresh }) => {
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const wf = useJobWorkflow();

  const isManager = MANAGER_ROLES.includes(userRole);
  
  // Fix: Compare as strings to handle UUID comparison
  const isSupervisor = job.team?.some(m => 
    String(m.user_id) === String(userId) && m.role === 'SUPERVISOR'
  );

  const act = async (action) => {
    if (['reject', 'signoff', 'cancel'].includes(action)) { setModal(action); return; }
    setLoading(true);
    try {
      if (action === 'submit') await wf.submitJob(job.id);
      else if (action === 'approve') await wf.approveJob(job.id);
      else if (action === 'start') await wf.startJob(job.id);
      else if (action === 'post-job') await wf.moveToPostJob(job.id);
      else if (action === 'complete') await wf.completeJob(job.id);
      onRefresh?.();
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  const actions = [];
  
  // DRAFT: Supervisor can submit (requires equipment)
  if (statusIs(job.status, 'DRAFT') && isSupervisor) {
    actions.push({ 
      id: 'submit', 
      label: 'Submit for Approval', 
      icon: Send, 
      v: 'primary', 
      d: !job.equipment_items?.length 
    });
  }
  
  // PENDING_APPROVAL (Team_Assigned): Manager can approve/reject
  if (statusIs(job.status, 'PENDING_APPROVAL', 'TEAM_ASSIGNED') && isManager) {
    actions.push({ id: 'approve', label: 'Approve', icon: Check, v: 'primary' });
    actions.push({ id: 'reject', label: 'Reject', icon: X, v: 'danger' });
  }
  
  // APPROVED: Supervisor sign-off
  if (statusIs(job.status, 'APPROVED') && isSupervisor && !job.signoff_completed) {
    actions.push({ id: 'signoff', label: 'Sign-Off', icon: Clipboard, v: 'primary' });
  }
  
  // APPROVED + Signoff: Supervisor can start
  if (statusIs(job.status, 'APPROVED') && isSupervisor && job.signoff_completed) {
    actions.push({ id: 'start', label: 'Start Job', icon: Play, v: 'primary' });
  }
  
  // IN_PROGRESS: Team returned
  if (statusIs(job.status, 'IN_PROGRESS') && (isSupervisor || isManager)) {
    actions.push({ id: 'post-job', label: 'Team Returned', icon: Flag, v: 'secondary' });
  }
  
  // POST_JOB: Complete
  if (statusIs(job.status, 'POST_JOB') && (isSupervisor || isManager)) {
    actions.push({ id: 'complete', label: 'Complete', icon: CheckCircle, v: 'primary' });
  }
  
  // Cancel (Managers only, in DRAFT or APPROVED)
  if (statusIs(job.status, 'DRAFT', 'APPROVED') && isManager) {
    actions.push({ id: 'cancel', label: 'Cancel', icon: X, v: 'danger' });
  }

  if (!actions.length) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map(a => (
          <Button 
            key={a.id} 
            variant={a.v} 
            onClick={() => act(a.id)} 
            disabled={loading || a.d}
            title={a.d ? 'Add equipment first' : ''}
          >
            <a.icon className="w-4 h-4 mr-1" />{a.label}
          </Button>
        ))}
      </div>
      {modal === 'reject' && <RejectModal jobId={job.id} onClose={() => setModal(null)} onSuccess={() => { setModal(null); onRefresh?.(); }} />}
      {modal === 'signoff' && <SignoffModal jobId={job.id} onClose={() => setModal(null)} onSuccess={() => { setModal(null); onRefresh?.(); }} />}
      {modal === 'cancel' && <CancelModal jobId={job.id} onClose={() => setModal(null)} onSuccess={() => { setModal(null); onRefresh?.(); }} />}
    </>
  );
};
export default WorkflowActions;
