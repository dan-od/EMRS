/**
 * AddTeamMemberModal - Multi-select with new roles
 * Roles: SUPERVISOR, CHIEF_OPERATOR, DAQ, ENGINEER
 */
import { useState, useEffect } from 'react';
import { Modal, Button, Input, Avatar } from '@/components/common';
import { Search, UserPlus, Check, Crown, Settings, Activity, Wrench, X } from 'lucide-react';
import { useTeamActions } from '../hooks';
import { api } from '@/services/api';

const ROLE_CONFIG = {
  SUPERVISOR: { icon: Crown, color: 'purple', label: 'Supervisor', bg: 'bg-purple-500', bgLight: 'bg-purple-500/20', text: 'text-purple-300' },
  CHIEF_OPERATOR: { icon: Settings, color: 'blue', label: 'Chief Op', bg: 'bg-blue-500', bgLight: 'bg-blue-500/20', text: 'text-blue-300' },
  DAQ: { icon: Activity, color: 'teal', label: 'DAQ', bg: 'bg-teal-500', bgLight: 'bg-teal-500/20', text: 'text-teal-300' },
  ENGINEER: { icon: Wrench, color: 'gray', label: 'Engineer', bg: 'bg-gray-500', bgLight: 'bg-gray-500/20', text: 'text-gray-300' }
};

const SelectedChip = ({ user, role, onRemove }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.ENGINEER;
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 text-primary-300 rounded-full text-sm">
      <span className="font-medium">{user.first_name} {user.last_name}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded ${cfg.bgLight} ${cfg.text}`}>{cfg.label}</span>
      <button onClick={() => onRemove(user.id)} className="hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
};

const RoleButton = ({ role, isActive, onClick }) => {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  return (
    <button onClick={onClick} className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${isActive ? `${cfg.bg} text-white` : `bg-background-secondary text-text-secondary hover:${cfg.bgLight} hover:${cfg.text}`}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </button>
  );
};

const UserRow = ({ user, isSelected, role, onToggle, onRoleChange }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${isSelected ? 'bg-primary-500/10 border border-primary-500/50' : 'bg-background-tertiary hover:bg-background-secondary border border-transparent'}`} onClick={() => onToggle(user.id)}>
    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-500'}`}>
      {isSelected && <Check className="w-3 h-3 text-white" />}
    </div>
    <Avatar name={`${user.first_name} ${user.last_name}`} size="sm" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-text-primary truncate">{user.first_name} {user.last_name}</p>
      <p className="text-xs text-text-secondary truncate">{user.email}</p>
    </div>
    {isSelected && (
      <div className="flex gap-1 flex-wrap" onClick={e => e.stopPropagation()}>
        {Object.keys(ROLE_CONFIG).map(r => <RoleButton key={r} role={r} isActive={role === r} onClick={() => onRoleChange(user.id, r)} />)}
      </div>
    )}
  </div>
);

export const AddTeamMemberModal = ({ jobId, existingMembers = [], onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addMembers } = useTeamActions();

  useEffect(() => {
    setLoading(true);
    api.get('/users').then(res => setUsers((res.data?.users || []).filter(u => !existingMembers.includes(u.id)))).finally(() => setLoading(false));
  }, [existingMembers]);

  const filtered = users.filter(u => `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase()));
  const toggleSelection = (id) => setSelections(prev => prev[id] ? (({ [id]: _, ...rest }) => rest)(prev) : { ...prev, [id]: { role: 'ENGINEER' } });
  const updateRole = (id, role) => setSelections(prev => ({ ...prev, [id]: { ...prev[id], role } }));
  const removeSelection = (id) => setSelections(prev => (({ [id]: _, ...rest }) => rest)(prev));

  const selectedIds = Object.keys(selections);
  const selectedUsers = users.filter(u => selections[u.id]);

  const submit = async () => {
    if (!selectedIds.length) return;
    setSubmitting(true);
    try {
      await addMembers(jobId, selectedIds.map(id => ({ user_id: id, role: selections[id].role })));
      onSuccess?.();
    } finally { setSubmitting(false); }
  };

  return (
    <Modal isOpen onClose={onClose} title="Add Team Members" size="lg">
      <div className="space-y-4">
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
        
        {selectedIds.length > 0 && (
          <div className="p-3 bg-background-secondary rounded-lg">
            <p className="text-xs text-text-secondary mb-2">{selectedIds.length} member{selectedIds.length > 1 ? 's' : ''} selected</p>
            <div className="flex flex-wrap gap-2">{selectedUsers.map(user => <SelectedChip key={user.id} user={user} role={selections[user.id]?.role || 'ENGINEER'} onRemove={removeSelection} />)}</div>
          </div>
        )}
        
        <div className="flex gap-3 text-xs text-text-secondary flex-wrap">
          <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-purple-400" />Supervisor</span>
          <span className="flex items-center gap-1"><Settings className="w-3 h-3 text-blue-400" />Chief Operator</span>
          <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-teal-400" />DAQ</span>
          <span className="flex items-center gap-1"><Wrench className="w-3 h-3 text-gray-400" />Engineer</span>
        </div>
        
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {loading ? <div className="flex items-center justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
           : filtered.length === 0 ? <p className="text-center text-text-secondary py-8">{search ? 'No users found' : 'No available users'}</p>
           : filtered.map(user => <UserRow key={user.id} user={user} isSelected={!!selections[user.id]} role={selections[user.id]?.role || 'ENGINEER'} onToggle={toggleSelection} onRoleChange={updateRole} />)}
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={!selectedIds.length || submitting}>
            <UserPlus className="w-4 h-4 mr-1" />{submitting ? 'Adding...' : `Add ${selectedIds.length > 1 ? `(${selectedIds.length})` : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddTeamMemberModal;
