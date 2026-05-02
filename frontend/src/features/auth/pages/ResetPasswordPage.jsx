import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Fuel, CheckCircle } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { useAuth } from '../hooks/useAuth';
import { resetPasswordSchema } from '@/utils/validators';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword, isLoading, error } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data) => {
    try {
      await resetPassword(token, data.password);
      setSuccess(true);
    } catch {
      // Error handled in hook
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-y">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text mb-4">Invalid Reset Link</h2>
          <p className="text-text-secondary dark:text-gray-400 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link to="/login">
            <Button variant="primary" className="w-full">Back to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-y">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card p-8 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text mb-2">Password Reset!</h2>
          <p className="text-text-secondary dark:text-gray-400 mb-6">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <Link to="/login">
            <Button variant="primary" className="w-full">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-y">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-xl mb-4">
            <Fuel className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text mb-2">Reset your password</h2>
          <p className="text-text-secondary dark:text-gray-400 mb-6">Enter your new password below.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              error={errors.password?.message}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
