import { cn } from '@/utils/helpers';

export const PasswordField = ({ label, value, onChange, show, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-text-secondary dark:text-slate-300">{label}</label>
    <input
      type={show ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
      className={cn(
        'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm',
        'outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
        'dark:border-dark-border dark:bg-dark-surface dark:text-dark-text'
      )}
    />
  </div>
);
