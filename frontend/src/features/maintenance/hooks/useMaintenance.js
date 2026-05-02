/**
 * Maintenance Hooks - Data fetching hooks
 */

import useSWR from 'swr';
import { maintenanceService } from '../services/maintenanceService';

export const useMaintenance = (filters = {}) => {
  const queryString = Object.keys(filters).length ? `?${new URLSearchParams(filters)}` : '';
  const { data, error, isLoading, mutate } = useSWR(`/maintenance${queryString}`, () => maintenanceService.getAll(filters));
  return { maintenance: data?.data || [], pagination: data?.pagination, isLoading, error, refresh: mutate };
};

export const useMaintenanceDetail = (id) => {
  const { data, error, isLoading, mutate } = useSWR(id ? `/maintenance/${id}` : null, () => maintenanceService.getById(id));
  return { maintenance: data, isLoading, error, refresh: mutate };
};

export const useMaintenanceStats = () => {
  const { data, error, isLoading } = useSWR('/maintenance/stats', () => maintenanceService.getStats());
  return { stats: data || { scheduled_count: 0, in_progress_count: 0, completed_count: 0, overdue_count: 0 }, isLoading, error };
};

export const useMaintenanceDue = (days = 7) => {
  const { data, error, isLoading, mutate } = useSWR(`/maintenance/due?days=${days}`, () => maintenanceService.getDue(days));
  return { dueMaintenance: data || [], isLoading, error, refresh: mutate };
};

// Re-export actions from separate file
export { useMaintenanceActions } from './useMaintenanceActions';
