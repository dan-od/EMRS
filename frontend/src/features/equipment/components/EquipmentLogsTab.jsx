/**
 * EquipmentLogsTab Component
 * Tab content for displaying equipment logs (General or Maintenance)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common';
import { EmptyState } from '@/components/feedback';
import LogEntry from './LogEntry';
import LogFilters from './LogFilters';
import AddLogModal from './AddLogModal';
import { useGeneralLogs, useMaintenanceLogs, useLogActions } from '../hooks/useEquipmentLogs';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { Plus, FileText, Wrench } from 'lucide-react';

// Permission check helpers - expanded to include more roles
const canAddGeneralLog = (role) => {
  if (!role) return false;
  const allowed = [
    'Super_Admin', 'Admin', 'IT_Manager',
    'Operations_Manager', 'Maintenance_Manager', 'Safety_Manager',
    'HR_Manager', 'Logistics_Manager', 'Workshop_Manager',
    'Field_Engineer', 'Purchasing_Manager', 'Purchasing_Staff'
  ];
  return allowed.includes(role);
};

const canAddMaintenanceLog = (role) => {
  if (!role) return false;
  const allowed = [
    'Super_Admin', 'Admin', 'IT_Manager',
    'Operations_Manager', 'Maintenance_Manager',
    'Field_Engineer'
  ];
  return allowed.includes(role);
};

const EquipmentLogsTab = ({ equipmentId, logType = 'general' }) => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { addNotification } = useUiStore();
  
  const [filters, setFilters] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch logs based on type
  const isGeneral = logType === 'general';
  const { logs: generalLogs, isLoading: loadingGeneral, refresh: refreshGeneral } = useGeneralLogs(
    isGeneral ? equipmentId : null, 
    filters
  );
  const { logs: maintenanceLogs, isLoading: loadingMaint, refresh: refreshMaint } = useMaintenanceLogs(
    !isGeneral ? equipmentId : null, 
    filters
  );

  const logs = isGeneral ? generalLogs : maintenanceLogs;
  const isLoading = isGeneral ? loadingGeneral : loadingMaint;
  const refresh = isGeneral ? refreshGeneral : refreshMaint;

  // Actions
  const { createGeneralLog, createMaintenanceLog, isLoading: creating } = useLogActions(equipmentId);

  // Permissions - check user role
  const canAdd = isGeneral ? canAddGeneralLog(user?.role) : canAddMaintenanceLog(user?.role);

  // Handlers
  const handleAdd = async (data) => {
    try {
      if (isGeneral) {
        await createGeneralLog(data);
      } else {
        await createMaintenanceLog(data);
      }
      addNotification({ type: 'success', message: 'Log entry added successfully' });
      setShowAddModal(false);
      refresh();
    } catch (err) {
      addNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to add entry' 
      });
    }
  };

  const handleViewMaintenance = (maintenanceId) => {
    navigate(`/maintenance/${maintenanceId}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          {isGeneral ? (
            <><FileText className="w-5 h-5" /> General Log</>
          ) : (
            <><Wrench className="w-5 h-5" /> Maintenance Log</>
          )}
        </h3>
        {canAdd && (
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Entry
          </Button>
        )}
      </div>

      {/* Filters */}
      <LogFilters 
        filters={filters} 
        onChange={setFilters} 
        logType={logType}
      />

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && logs.length === 0 && (
        <EmptyState
          icon={isGeneral ? FileText : Wrench}
          title={`No ${isGeneral ? 'general' : 'maintenance'} log entries`}
          description={filters.type ? 'Try adjusting your filters' : 'Log entries will appear here'}
          action={canAdd ? (
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add First Entry
            </Button>
          ) : undefined}
        />
      )}

      {/* Logs List */}
      {!isLoading && logs.length > 0 && (
        <div className="space-y-3">
          {logs.map(log => (
            <LogEntry 
              key={log.id} 
              log={log} 
              type={logType}
              onViewMaintenance={!isGeneral ? handleViewMaintenance : undefined}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddLogModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        logType={logType}
        isLoading={creating}
      />
    </div>
  );
};

export default EquipmentLogsTab;
