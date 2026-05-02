/**
 * Equipment Logs Hooks
 */

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { equipmentLogsService } from '../services/equipmentLogsService';

// General Logs
export const useGeneralLogs = (equipmentId, filters = {}) => {
  const queryKey = equipmentId 
    ? `/equipment/${equipmentId}/logs/general?${new URLSearchParams(filters)}`
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    () => equipmentLogsService.getGeneralLogs(equipmentId, filters)
  );

  return {
    logs: data?.logs || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate
  };
};

// Maintenance Logs
export const useMaintenanceLogs = (equipmentId, filters = {}) => {
  const queryKey = equipmentId 
    ? `/equipment/${equipmentId}/logs/maintenance?${new URLSearchParams(filters)}`
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    queryKey,
    () => equipmentLogsService.getMaintenanceLogs(equipmentId, filters)
  );

  return {
    logs: data?.logs || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refresh: mutate
  };
};

// Log Actions
export const useLogActions = (equipmentId) => {
  const [isLoading, setIsLoading] = useState(false);

  const createGeneralLog = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const result = await equipmentLogsService.createGeneralLog(equipmentId, data);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [equipmentId]);

  const createMaintenanceLog = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const result = await equipmentLogsService.createMaintenanceLog(equipmentId, data);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [equipmentId]);

  return {
    createGeneralLog,
    createMaintenanceLog,
    isLoading
  };
};
