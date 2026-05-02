import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, Button } from '@/components/common';
import { UserFormFields } from '../components';
import { useUserActions } from '../hooks/useUsers';
import { useUiStore } from '@/store/uiStore';
import { ChevronLeft, Save, UserPlus } from 'lucide-react';

const CreateUser = () => {
  const navigate = useNavigate();
  const { addNotification } = useUiStore();
  const { createUser, isLoading } = useUserActions();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    department: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createUser(formData);
      addNotification({ type: 'success', message: 'User created successfully' });
      navigate('/users');
    } catch (err) {
      addNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to create user' 
      });
    }
  };

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/users')} 
            className="p-1 hover:bg-background-secondary rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <UserPlus className="w-5 h-5 text-primary" />
          <span>Create New User</span>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <form onSubmit={handleSubmit} className="p-6">
            <UserFormFields
              formData={formData}
              onChange={setFormData}
              errors={errors}
              isEdit={false}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-border-light dark:border-dark-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/users')}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default CreateUser;
