import { Bell, Mail, Smartphone, RefreshCw, AlertTriangle } from 'lucide-react';

const NOTIFICATION_OPTIONS = [
  { key: 'email', label: 'Email notifications', desc: 'Receive updates via email', icon: Mail },
  { key: 'push', label: 'Push notifications', desc: 'Browser & mobile alerts', icon: Smartphone },
  { key: 'requestUpdates', label: 'Request status updates', desc: 'Track your request progress', icon: RefreshCw },
  { key: 'safetyAlerts', label: 'Safety alerts', desc: 'Critical safety notifications', icon: AlertTriangle }
];

export const NotificationsSection = ({ notifications, setNotifications }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface">
    <div className="flex items-center gap-3 p-6 pb-0">
      <Bell className="w-5 h-5 text-primary-500" />
      <h3 className="text-base font-semibold text-text-primary dark:text-dark-text">
        Notification Preferences
      </h3>
    </div>

    <div className="p-6 space-y-1">
      {NOTIFICATION_OPTIONS.map(({ key, label, desc, icon: Icon }) => (
        <label
          key={key}
          className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-card transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-text-muted dark:bg-dark-card dark:text-dark-muted">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary dark:text-dark-text">{label}</p>
              <p className="text-xs text-text-muted dark:text-dark-muted">{desc}</p>
            </div>
          </div>
          <ToggleSwitch
            checked={notifications[key]}
            onChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))}
          />
        </label>
      ))}
    </div>
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`
      relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
      transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500/30
      ${checked ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm
        transition-transform duration-200 ease-in-out
        ${checked ? 'translate-x-5' : 'translate-x-0'}
      `}
    />
  </button>
);
