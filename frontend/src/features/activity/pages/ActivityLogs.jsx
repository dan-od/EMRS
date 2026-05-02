import { useState } from 'react';
import { PageWrapper } from '@/components/layout';
import { useApi } from '@/hooks/useApi';
import { useAuthStore } from '@/store/authStore';
import { isAdmin, isManager } from '@/utils/helpers';
import { RefreshCw } from 'lucide-react';
import ActivityFilters from '../components/ActivityFilters';
import ActivityList from '../components/ActivityList';

const ACTIVITY_ENDPOINT = '/activity';

const ActivityLogs = () => {
  const user = useAuthStore(s => s.user);
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    entity_type: '',
    start_date: '',
    end_date: '',
    page: 1
  });

  // Build query string
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  // Fetch data
  const { data, isLoading, refresh } = useApi(`${ACTIVITY_ENDPOINT}?${queryParams.toString()}`);
  const { data: actionTypes } = useApi(`${ACTIVITY_ENDPOINT}/actions`);
  const { data: entityTypes } = useApi(`${ACTIVITY_ENDPOINT}/entities`);

  // Extract data
  const logs = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const actions = actionTypes?.data || [];
  const entities = entityTypes?.data || [];

  // Permissions
  const canSeeAllLogs = isAdmin(user?.role);
  const canSeeDeptLogs = isManager(user?.role);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Get visibility message
  const getVisibilityMessage = () => {
    if (canSeeAllLogs) return 'Viewing all system activity';
    if (canSeeDeptLogs) return 'Viewing your department activity';
    return 'Viewing your activity history';
  };

  return (
    <PageWrapper title="Activity Logs">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-text-secondary dark:text-dark-muted">{getVisibilityMessage()}</p>
          <button
            onClick={refresh}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-card text-text-primary dark:text-dark-text transition-colors w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <ActivityFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          actions={actions}
          entities={entities}
        />

        {/* Activity List */}
        <ActivityList
          logs={logs}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>
    </PageWrapper>
  );
};

export default ActivityLogs;
