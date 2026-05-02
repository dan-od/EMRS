/**
 * useExtensions - Hook for managing return date extensions
 */

import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api';
import { EXTENSIONS } from '@/services/endpoints';

// Get pending extensions for manager
export const usePendingExtensionsManager = () => {
  const { data, isLoading, error, refresh } = useApi(EXTENSIONS.PENDING_MANAGER);
  return {
    extensions: data?.data || [],
    isLoading,
    error,
    refresh
  };
};

// Get pending extensions for purchasing
export const usePendingExtensionsPurchasing = () => {
  const { data, isLoading, error, refresh } = useApi(EXTENSIONS.PENDING_PURCHASING);
  return {
    extensions: data?.data || [],
    isLoading,
    error,
    refresh
  };
};

// Get extensions for a specific request
export const useRequestExtensions = (requestId) => {
  const { data, isLoading, error, refresh } = useApi(
    requestId ? EXTENSIONS.BY_REQUEST(requestId) : null
  );
  return {
    extensions: data?.data || [],
    isLoading,
    error,
    refresh
  };
};

// Extension actions
export const extensionActions = {
  // Manager actions
  managerApprove: async (id, notes = '') => {
    const response = await api.post(EXTENSIONS.MANAGER_APPROVE(id), { notes });
    return response.data;
  },
  managerReject: async (id, notes = '') => {
    const response = await api.post(EXTENSIONS.MANAGER_REJECT(id), { notes });
    return response.data;
  },
  
  // Purchasing actions
  purchasingApprove: async (id, notes = '') => {
    const response = await api.post(EXTENSIONS.PURCHASING_APPROVE(id), { notes });
    return response.data;
  },
  purchasingReject: async (id, notes = '') => {
    const response = await api.post(EXTENSIONS.PURCHASING_REJECT(id), { notes });
    return response.data;
  }
};

export default {
  usePendingExtensionsManager,
  usePendingExtensionsPurchasing,
  useRequestExtensions,
  extensionActions
};
