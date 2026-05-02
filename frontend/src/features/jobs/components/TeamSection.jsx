/**
 * TeamSection - Team display and management
 * Supports: SUPERVISOR, CHIEF_OPERATOR, DAQ, ENGINEER
 */
import { memo, useState } from 'react';
import { Card, CardContent, Button, Avatar } from '@/components/common';
import { Users, Plus, X, Crown, Settings, Activity, Wrench } from 'lucide-react';
import { AddTeamMemberModal } from './AddTeamMemberModal';
import { useTeamActions } from '../hooks';

const ROLE_CONFIG = {
  SUPERVISOR: { icon: Crown, label: 'SUPERVISOR', bg: 'bg-purple-500/20', text: 'text-purple-300' },
  CHIEF_OPERATOR: { icon: Settings, label: 'CHIEF OP', bg: 'bg-blue-500/20', text: 'text-blue-300' },
  DAQ: { icon: Activity, label: 'DAQ', bg: 'bg-teal-500/20', text: 'text-teal-300' },
  ENGINEER: { icon: Wrench, label: 'ENGINEER', bg: 'bg-gray-500/20', text: 'text-gray-300' }
};

const MemberRow = ({ m, canEdit, onRemove }) => {
  const cfg = ROLE_CONFIG[m.role] || ROLE_CONFIG.ENGINEER;
  const Icon = cfg.icon;
  return (
    <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar name={`${m.first_name} ${m.last_name}`} size="sm" />
        <div>
          <p className="text-sm font-medium text-text-primary">{m.first_name} {m.last_name}</p>
          <p className="text-xs text-text-muted">{m.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${cfg.bg} ${cfg.text}`}>
          <Icon className="w-3 h-3" />{cfg.label}
        </span>
        {canEdit && <button onClick={() => onRemove(m.user_id)} className="p-1 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
      </div>
    </div>
  );
};

export const TeamSection = memo(({ jobId, team = [], onRefresh, canEdit }) => {
  const [show, setShow] = useState(false);
  const { removeMember } = useTeamActions();
  
  // Group by roles
  const sups = team.filter(m => m.role === 'SUPERVISOR');
  const chiefs = team.filter(m => m.role === 'CHIEF_OPERATOR');
  const daqs = team.filter(m => m.role === 'DAQ');
  const engs = team.filter(m => m.role === 'ENGINEER');

  const handleRemove = async (uid) => { if (confirm('Remove?')) { await removeMember(jobId, uid); onRefresh?.(); } };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2"><Users className="w-5 h-5 text-primary-500" />Team ({team.length})</h3>
            {canEdit && <Button variant="ghost" size="sm" onClick={() => setShow(true)}><Plus className="w-4 h-4 mr-1" />Add</Button>}
          </div>
          {team.length === 0 ? <p className="text-sm text-text-muted text-center py-4">No team members</p> : (
            <div className="space-y-4">
              {sups.length > 0 && <div><p className="text-xs font-medium text-text-muted uppercase mb-2">Supervisors</p><div className="space-y-2">{sups.map(m => <MemberRow key={m.id} m={m} canEdit={canEdit} onRemove={handleRemove} />)}</div></div>}
              {chiefs.length > 0 && <div><p className="text-xs font-medium text-text-muted uppercase mb-2">Chief Operators</p><div className="space-y-2">{chiefs.map(m => <MemberRow key={m.id} m={m} canEdit={canEdit} onRemove={handleRemove} />)}</div></div>}
              {daqs.length > 0 && <div><p className="text-xs font-medium text-text-muted uppercase mb-2">DAQ</p><div className="space-y-2">{daqs.map(m => <MemberRow key={m.id} m={m} canEdit={canEdit} onRemove={handleRemove} />)}</div></div>}
              {engs.length > 0 && <div><p className="text-xs font-medium text-text-muted uppercase mb-2">Engineers</p><div className="space-y-2">{engs.map(m => <MemberRow key={m.id} m={m} canEdit={canEdit} onRemove={handleRemove} />)}</div></div>}
            </div>
          )}
        </CardContent>
      </Card>
      {show && <AddTeamMemberModal jobId={jobId} existingMembers={team.map(m => m.user_id)} onClose={() => setShow(false)} onSuccess={() => { setShow(false); onRefresh?.(); }} />}
    </>
  );
});
TeamSection.displayName = 'TeamSection';
export default TeamSection;
