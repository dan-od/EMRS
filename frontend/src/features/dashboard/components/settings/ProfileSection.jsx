import { getRoleLabel } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';
import { Mail, Building2, Shield, Calendar, Phone, User } from 'lucide-react';

export const ProfileSection = ({ user }) => {
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Unknown';
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-dark-border dark:bg-dark-surface">
      {/* Profile header with avatar */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white backdrop-blur-sm border border-white/30">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{fullName}</h2>
            <p className="text-sm text-white/80">{user?.email}</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
                {getRoleLabel(user?.role)}
              </span>
              {user?.department && (
                <span className="text-xs text-white/70">{user.department}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem icon={User} label="Full Name" value={fullName} />
          <InfoItem icon={Mail} label="Email" value={user?.email || '-'} />
          <InfoItem icon={Shield} label="Role" value={getRoleLabel(user?.role)} />
          <InfoItem icon={Building2} label="Department" value={user?.department || 'Not assigned'} />
          <InfoItem icon={Phone} label="Phone" value={user?.phone || 'Not set'} />
          <InfoItem icon={Calendar} label="Member Since" value={formatDateTime(user?.createdAt || user?.created_at)} />
        </div>
        <p className="mt-4 text-xs text-text-muted dark:text-dark-muted">
          To update your profile information, contact the IT Department.
        </p>
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-text-muted dark:bg-dark-card dark:text-dark-muted">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-text-muted dark:text-dark-muted">{label}</p>
      <p className="text-sm font-medium text-text-primary dark:text-dark-text truncate">{value}</p>
    </div>
  </div>
);
