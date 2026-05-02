/**
 * useEquipment Hook - Updated for Tools vs Equipment
 */
import useSWR from 'swr';
import { equipmentService } from '../services/equipmentService';

// Main equipment list with filters
export const useEquipment = (filters = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    ['equipment', filters],
    () => equipmentService.getAll(filters),
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  return {
    equipmentList: data?.equipment || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    refresh: mutate
  };
};

// Single equipment detail
export const useEquipmentDetail = (id) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['equipment', id] : null,
    () => equipmentService.getById(id),
    { revalidateOnFocus: false }
  );

  return {
    equipment: data?.data || data,
    isLoading,
    error,
    refresh: mutate
  };
};

// Equipment types (built-in + custom)
export const useEquipmentTypes = (category = null) => {
  const { data, error, isLoading } = useSWR(
    ['equipment-types', category],
    () => equipmentService.getTypes(category),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    types: data?.data || { equipment: [], tools: [] },
    allTypes: [...(data?.data?.equipment || []), ...(data?.data?.tools || [])],
    isLoading,
    error
  };
};

// Equipment stats
export const useEquipmentStats = () => {
  const { data, error, isLoading } = useSWR(
    'equipment-stats',
    () => equipmentService.getStats(),
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return { stats: data?.data, isLoading, error };
};

// Maintenance due
export const useMaintenanceDue = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'maintenance-due',
    () => equipmentService.getMaintenanceDue(),
    { revalidateOnFocus: false }
  );

  return {
    maintenanceDue: data?.data || data || [],
    isLoading,
    error,
    refresh: mutate
  };
};

// Stub — EquipmentRequestsList page exists but endpoint not built yet
export const useEquipmentRequests = () => ({
  requests: [], total: 0, isLoading: false, error: null, refresh: () => {}
});

export default useEquipment;
