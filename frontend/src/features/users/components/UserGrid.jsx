import { useNavigate } from 'react-router-dom';
import { Mail, Building2, Shield, MoreVertical, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { getRoleLabel } from '@/utils/constants';

export const UserGrid = ({ users = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user, index) => (
        <UserGridCard
          key={user.id}
          user={user}
          delay={index * 50}
          onSelect={() => navigate(`/users/${user.id}`)}
        />
      ))}
    </div>
  );
};

const UserGridCard = ({ user, delay, onSelect }) => {
  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div
      className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-surface animate-slideUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header: Avatar + Name + Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
            {initials}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-text-primary dark:text-dark-text">
              {fullName}
            </h3>
            <span className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
              user.is_active
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
            )}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Info rows */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center text-sm text-text-muted dark:text-dark-muted">
          <Mail className="mr-3 h-4 w-4 opacity-70" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center text-sm text-text-secondary dark:text-slate-300">
          <Shield className="mr-3 h-4 w-4 opacity-70" />
          <span className="font-medium">Role:</span>
          <span className="ml-auto">{getRoleLabel(user.role)}</span>
        </div>
        <div className="flex items-center text-sm text-text-secondary dark:text-slate-300">
          <Building2 className="mr-3 h-4 w-4 opacity-70" />
          <span className="font-medium">Department:</span>
          <span className="ml-auto">{user.department || 'Unassigned'}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-dark-border">
        <button
          onClick={onSelect}
          className="flex w-full items-center justify-center rounded-lg py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
        >
          View details
          <ExternalLink className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
