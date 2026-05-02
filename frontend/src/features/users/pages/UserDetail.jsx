import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Button } from '@/components/common';
import { PageLoader, EmptyState } from '@/components/feedback';
import { ResetPasswordModal } from '../components';
import UserInfoCard from '../components/UserInfoCard';
import { useUser, useUserActions } from '../hooks/useUsers';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { 
  ChevronLeft, Key, UserX, UserCheck, Edit, Trash2
} from 'lucide-react';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore(s => s.user);
  const { addNotification, showConfirm } = useUiStore();
  const { user, isLoading, error, refresh } = useUser(id);
  const actions = useUserActions();
  
  const [showResetModal, setShowResetModal] = useState(false);

  const canManage = ['Admin', 'Super_Admin', 'IT_Manager', 'IT_Support'].includes(currentUser?.role);
  const canDelete = ['Admin', 'Super_Admin'].includes(currentUser?.role);
  const isSelf = currentUser?.id === id;

  const handleResetPassword = async (newPassword) => {
    try {
      await actions.resetPassword(id, newPassword);
      addNotification({ type: 'success', message: 'Password reset successfully' });
      setShowResetModal(false);
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to reset password' });
    }
  };

  const handleToggleActive = () => {
    const action = user.is_active ? 'deactivate' : 'activate';
    showConfirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      message: `Are you sure you want to ${action} ${user.first_name} ${user.last_name}?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      variant: user.is_active ? 'danger' : 'success',
      onConfirm: async () => {
        try {
          await actions.toggleActive(id, !user.is_active);
          addNotification({ type: 'success', message: `User ${action}d successfully` });
          refresh();
        } catch (err) {
          addNotification({ type: 'error', message: err.message });
        }
      }
    });
  };

  const handleDelete = () => {
    showConfirm({
      title: 'Delete User',
      message: `Permanently delete ${user.first_name} ${user.last_name}? This cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await actions.deleteUser(id);
          addNotification({ type: 'success', message: 'User deleted successfully' });
          navigate('/users');
        } catch (err) {
          addNotification({ type: 'error', message: err.message });
        }
      }
    });
  };

  if (isLoading) return <PageLoader />;
  if (error || !user) return <EmptyState.ErrorState />;

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/users')} className="p-1 hover:bg-background-secondary rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span>User Details</span>
        </div>
      }
      actions={canManage && (
        <Button variant="outline" onClick={() => navigate(`/users/${id}/edit`)}>
          <Edit className="w-4 h-4 mr-2" /> Edit
        </Button>
      )}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <UserInfoCard user={user} isSelf={isSelf}>
          {canManage && !isSelf && (
            <div className="mt-6 pt-6 border-t border-border-light dark:border-dark-border">
              <h3 className="text-sm font-medium text-text-primary dark:text-dark-text mb-3">Actions</h3>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <Button variant="outline" onClick={() => setShowResetModal(true)} disabled={actions.isLoading} className="w-full sm:w-auto">
                  <Key className="w-4 h-4 mr-2" /> Reset Password
                </Button>
                <Button variant={user.is_active ? 'danger' : 'success'} onClick={handleToggleActive} disabled={actions.isLoading} className="w-full sm:w-auto">
                  {user.is_active
                    ? <><UserX className="w-4 h-4 mr-2" />Deactivate</>
                    : <><UserCheck className="w-4 h-4 mr-2" />Activate</>}
                </Button>
                {canDelete && (
                  <Button variant="ghost" onClick={handleDelete} disabled={actions.isLoading} className="text-error hover:bg-error/10 w-full sm:w-auto">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                )}
              </div>
            </div>
          )}
        </UserInfoCard>
      </div>

      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onSubmit={handleResetPassword}
        userName={`${user.first_name} ${user.last_name}`}
        isLoading={actions.isLoading}
      />
    </PageWrapper>
  );
};

export default UserDetail;
