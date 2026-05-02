import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Building2 } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { getRoleLabel } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';

const UserTable = ({ users = [] }) => {
  const navigate = useNavigate();

  if (users.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:bg-dark-card dark:text-dark-muted">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
            {users.map((user) => (
              <UserRow key={user.id} user={user} onClick={() => navigate(`/users/${user.id}`)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserRow = ({ user, onClick }) => {
  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();

  return (
    <tr
      onClick={onClick}
      className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-dark-card"
    >
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
            {initials}
          </div>
          <div className="ml-3 min-w-0">
            <div className="font-semibold text-text-primary truncate dark:text-dark-text">
              {fullName}
            </div>
            <div className="text-xs text-text-muted truncate dark:text-dark-muted">
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center text-text-secondary dark:text-slate-300">
          <Shield className="mr-2 h-4 w-4 opacity-50" />
          {getRoleLabel(user.role)}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center text-text-secondary dark:text-slate-300">
          <Building2 className="mr-2 h-4 w-4 opacity-50" />
          {user.department || 'Unassigned'}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          user.is_active
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
        )}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 text-text-muted dark:text-dark-muted">
        {formatDateTime(user.created_at)}
      </td>
      <td className="px-6 py-4 text-right">
        <ChevronRight className="ml-auto h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-text-secondary dark:text-slate-600" />
      </td>
    </tr>
  );
};

export default UserTable;
