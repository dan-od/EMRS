import { Users, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/helpers';

const StatCard = ({ icon: Icon, label, value, color, bg, delay }) => (
  <div
    className={cn(
      'flex items-center rounded-xl border border-slate-200 bg-white p-5 shadow-sm',
      'dark:border-dark-border dark:bg-dark-surface',
      'animate-slideUp'
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', bg)}>
      <Icon className={cn('h-6 w-6', color)} />
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-text-secondary dark:text-dark-muted">{label}</p>
      <h3 className="text-2xl font-bold text-text-primary dark:text-dark-text">{value}</h3>
    </div>
  </div>
);

const UserStats = ({ users = [] }) => {
  const total = users.length;
  const active = users.filter(u => u.is_active).length;
  const inactive = users.filter(u => !u.is_active).length;
  const admins = users.filter(u =>
    u.role?.includes('Admin') || u.role === 'IT_Support'
  ).length;

  const stats = [
    { label: 'Total Users', value: total, icon: Users, color: 'text-info', bg: 'bg-info/10 dark:bg-info/20' },
    { label: 'Active', value: active, icon: UserCheck, color: 'text-success', bg: 'bg-success/10 dark:bg-success/20' },
    { label: 'Inactive', value: inactive, icon: UserX, color: 'text-error', bg: 'bg-error/10 dark:bg-error/20' },
    { label: 'Admins', value: admins, icon: ShieldCheck, color: 'text-warning', bg: 'bg-warning/10 dark:bg-warning/20' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} delay={i * 100} />
      ))}
    </div>
  );
};

export default UserStats;
