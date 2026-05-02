import { useState } from 'react';
import { Shield, Check, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { AUTH } from '@/services/endpoints';
import { useUiStore } from '@/store/uiStore';
import { PasswordField } from './PasswordField';

export const SecuritySection = () => {
  const { addNotification } = useUiStore();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const resetForm = () => { setIsOpen(false); setError(''); setForm({ current: '', newPass: '', confirm: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPass.length < 8) return setError('New password must be at least 8 characters');
    if (!/[A-Z]/.test(form.newPass) || !/[a-z]/.test(form.newPass) || !/[0-9]/.test(form.newPass)) {
      return setError('Password must contain uppercase, lowercase and a number');
    }
    if (form.newPass !== form.confirm) return setError('New passwords do not match');

    setIsLoading(true);
    try {
      await api.post(AUTH.CHANGE_PASSWORD, { currentPassword: form.current, newPassword: form.newPass });
      addNotification({ type: 'success', message: 'Password changed successfully' });
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface">
      <div className="flex items-center gap-3 p-6 pb-0">
        <Shield className="w-5 h-5 text-primary-500" />
        <h3 className="text-base font-semibold text-text-primary dark:text-dark-text">Security</h3>
      </div>

      <div className="p-6">
        {!isOpen ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary dark:text-dark-muted">
                Keep your account secure by using a strong password.
              </p>
              <p className="text-xs text-text-muted dark:text-dark-muted mt-1">
                Must be 8+ characters with uppercase, lowercase, and a number.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="shrink-0 rounded-lg border border-primary-500 px-4 py-2 text-sm font-semibold text-primary-600 transition-all hover:bg-primary-50 active:scale-95 dark:text-primary-400 dark:hover:bg-primary-900/20"
            >
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField label="Current Password" value={form.current}
              onChange={(v) => handleChange('current', v)} show={showPasswords} placeholder="Enter current password" />
            <PasswordField label="New Password" value={form.newPass}
              onChange={(v) => handleChange('newPass', v)} show={showPasswords} placeholder="Minimum 8 characters" />
            <PasswordField label="Confirm New Password" value={form.confirm}
              onChange={(v) => handleChange('confirm', v)} show={showPasswords} placeholder="Re-enter new password" />

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showPasswords} onChange={() => setShowPasswords(!showPasswords)} />
              <span className="text-xs text-text-muted">Show passwords</span>
            </label>

            {error && (
              <div className="flex items-center gap-2 text-sm text-error">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-dark-border">
              <button type="button" onClick={resetForm}
                className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-slate-100 dark:hover:bg-dark-card transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isLoading || !form.current || !form.newPass || !form.confirm}
                className="flex items-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  : <Check className="w-4 h-4 mr-2" />}
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
