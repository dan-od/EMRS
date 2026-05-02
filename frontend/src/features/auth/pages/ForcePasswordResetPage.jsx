import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/features/auth/services/authService';

const ForcePasswordResetPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      updateUser({ mustChangePassword: false });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { id: 'current', label: 'Current Password', value: currentPassword, set: setCurrentPassword },
    { id: 'new', label: 'New Password', value: newPassword, set: setNewPassword },
    { id: 'confirm', label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword },
  ];

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-white dark:bg-[#0f1419] px-6">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-[#FF6B00]" />

      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <div className="inline-block border-[1.5px] border-[#FF6B00] px-6 py-2 mb-6">
            <span className="text-[#FF6B00] font-[800] text-lg tracking-[0.12em]">WELL FLUID</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Set Your Password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome, {user?.firstName}. You must set a new password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 text-sm text-center">
              {error}
            </div>
          )}

          {fields.map(({ id, label, value, set }) => (
            <div key={id} className="space-y-2">
              <label className="text-[10px] font-black text-[#8B4513] dark:text-[#FF6B00] uppercase tracking-[0.15em]">
                {label}
              </label>
              <input
                type="password"
                required
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full h-12 px-4 bg-[#F8FAFC] dark:bg-[#1a1f26] border-[1.5px] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#FF6B00] transition-all rounded-none"
              />
            </div>
          ))}

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Min 8 characters · 1 uppercase letter · 1 number
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 mt-2 bg-[#FF6B00] hover:bg-[#E66000] text-white font-black text-[11px] uppercase tracking-[0.25em] transition-all flex items-center justify-center disabled:opacity-70 rounded-none"
          >
            {isSubmitting
              ? <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
              : 'Set New Password'
            }
          </button>
        </form>
      </div>
    </main>
  );
};

export default ForcePasswordResetPage;
