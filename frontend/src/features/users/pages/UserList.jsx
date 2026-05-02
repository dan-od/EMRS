import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { PageLoader, EmptyState } from '@/components/feedback';
import  UserStats  from '../components/UserStats';
import { UserFilters } from '../components/UserFilters';
import UserTable from '../components/UserTable';
import { UserGrid } from '../components/UserGrid';
import { useUsers } from '../hooks/useUsers';
import { useAuthStore } from '@/store/authStore';
import { useDebounce } from '@/hooks/useDebounce';
import { Plus, Users } from 'lucide-react';

const UserList = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const debouncedFilters = useDebounce(filters, 300);
  const { users, isLoading, error } = useUsers(debouncedFilters);

  const canCreate = ['Admin', 'Super_Admin', 'IT_Support'].includes(user?.role);

  if (isLoading) return <PageLoader />;
  if (error) return <EmptyState.ErrorState onRetry={() => window.location.reload()} />;

  return (
    <PageWrapper title="User Management">
      <div className="space-y-8 animate-fadeIn">
        <UserStats users={users} />

        <div className="space-y-6">
          <UserFilters
            filters={filters}
            onChange={setFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onAddUser={canCreate ? () => navigate('/users/new') : null}
          />

          {users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description={Object.keys(filters).length > 0
                ? 'Try adjusting your filters'
                : 'Get started by adding a new user'}
              action={canCreate && (
                <button
                  onClick={() => navigate('/users/new')}
                  className="flex items-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 active:scale-95 transition-all"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add User
                </button>
              )}
            />
          ) : viewMode === 'list' ? (
            <UserTable users={users} />
          ) : (
            <UserGrid users={users} />
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default UserList;
