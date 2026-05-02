/**
 * MaintenanceList Page
 * Main maintenance module page with list and filters
 */

import { useState } from 'react';
import { PageWrapper } from '@/components/layout';
import { Button } from '@/components/common';
import { ContentLoader, EmptyState } from '@/components/feedback';
import {
  MaintenanceStats,
  MaintenanceFilters,
  MaintenanceStatusTabs,
  MaintenanceCard,
  MaintenanceTable,
  CreateMaintenanceModal
} from '../components';
import { 
  useMaintenance, 
  useMaintenanceStats, 
  useMaintenanceActions 
} from '../hooks/useMaintenance';
import { useApi } from '@/hooks/useApi';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { isAdmin, isManager } from '@/utils/helpers';
import { Plus, Wrench, LayoutGrid, List } from 'lucide-react';

const MaintenanceList = () => {
  const user = useAuthStore(s => s.user);
  const { addNotification } = useUiStore();
  
  // State
  const [filters, setFilters] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Data
  const { maintenance, isLoading, refresh } = useMaintenance({ 
    ...filters, 
    status: statusFilter 
  });
  const { stats, isLoading: loadingStats } = useMaintenanceStats();
  const { data: equipmentData } = useApi('/equipment');
  const { create, isLoading: creating } = useMaintenanceActions();

  // Extract equipment array from API response
  const equipmentList = Array.isArray(equipmentData) 
    ? equipmentData 
    : (equipmentData?.equipment || equipmentData?.data || []);

  // Permissions
  const canCreate = isAdmin(user?.role) || isManager(user?.role);

  // Handlers
  const handleCreate = async (data) => {
    try {
      await create(data);
      addNotification({ type: 'success', message: 'Maintenance scheduled successfully' });
      setShowCreateModal(false);
      refresh();
    } catch (err) {
      addNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to create maintenance' 
      });
    }
  };

  return (
    <PageWrapper
      title="Maintenance"
      actions={
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded ${viewMode === 'cards' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Schedule Maintenance</span>
              <span className="sm:hidden">Schedule</span>
            </Button>
          )}
        </div>
      }
    >
      {/* Stats */}
      <MaintenanceStats stats={stats} isLoading={loadingStats} />

      {/* Status Tabs */}
      <MaintenanceStatusTabs
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
        counts={{
          scheduled: stats?.scheduled_count,
          in_progress: stats?.in_progress_count,
          overdue: stats?.overdue_count,
          completed: stats?.completed_count
        }}
      />

      {/* Filters */}
      <MaintenanceFilters filters={filters} onChange={setFilters} onRefresh={refresh} />

      {/* List */}
      <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
        {isLoading && !maintenance.length ? (
          <div className="p-8"><ContentLoader /></div>
        ) : maintenance.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Wrench}
              title="No maintenance records"
              description={statusFilter ? 'No records match your filters' : 'Schedule maintenance to get started'}
              action={canCreate && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
              )}
            />
          </div>
        ) : viewMode === 'table' ? (
          <MaintenanceTable data={maintenance} />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {maintenance.map(item => (
              <MaintenanceCard key={item.id} maintenance={item} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateMaintenanceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        equipment={equipmentList}
        isLoading={creating}
      />
    </PageWrapper>
  );
};

export default MaintenanceList;
