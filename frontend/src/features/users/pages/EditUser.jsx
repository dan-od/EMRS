import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, Button } from '@/components/common';
import { PageLoader, EmptyState } from '@/components/feedback';
import { UserFormFields } from '../components';
import { useUser, useUserActions } from '../hooks/useUsers';
import { useUiStore } from '@/store/uiStore';
import { ChevronLeft, Save, UserCog } from 'lucide-react';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useUiStore();
  const { user, isLoading: loadingUser, error } = useUser(id);
  const { updateUser, isLoading: saving } = useUserActions();
  
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        department: user.department || ''
      });
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateUser(id, formData);
      addNotification({ type: 'success', message: 'User updated successfully' });
      navigate(`/users/${id}`);
    } catch (err) {
      addNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to update user' 
      });
    }
  };

  if (loadingUser) return <PageLoader />;
  if (error || !user) return <EmptyState.ErrorState />;

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/users/${id}`)} 
            className="p-1 hover:bg-background-secondary rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <UserCog className="w-5 h-5 text-primary" />
          <span>Edit User</span>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6 pb-4 border-b border-border-light dark:border-dark-border">
              <h3 className="font-medium text-text-primary dark:text-dark-text">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-text-secondary dark:text-gray-400">{user.email}</p>
            </div>

            <UserFormFields
              formData={formData}
              onChange={setFormData}
              errors={errors}
              isEdit={true}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-border-light dark:border-dark-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/users/${id}`)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default EditUser;
