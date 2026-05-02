import { useState, useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { useApi } from '@/hooks/useApi';
import { REQUESTS } from '@/services/endpoints';
import { api } from '@/services/api';

// Helper to extract array from API response
const extractArray = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response.data && Array.isArray(response.data)) return response.data;
  if (response.requests) return response.requests;
  return [];
};

export const useRequests = (params) => {
  const queryString = params ? `?${new URLSearchParams(params)}` : '';
  const { data, error, isLoading, refresh } = useApi(`${REQUESTS.BASE}${queryString}`);
  
  return {
    requests: extractArray(data),
    pagination: data?.pagination,
    error,
    isLoading,
    refresh
  };
};

export const useMyRequests = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.MY_REQUESTS);
  
  return {
    requests: extractArray(data),
    error,
    isLoading,
    refresh
  };
};

export const usePendingRequests = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.PENDING);
  
  return {
    requests: extractArray(data),
    error,
    isLoading,
    refresh
  };
};

export const useDeptRequests = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.DEPARTMENT);

  return {
    requests: extractArray(data),
    pagination: data?.pagination,
    error,
    isLoading,
    refresh
  };
};

export const useAllRequests = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.ALL);

  return {
    requests: extractArray(data),
    pagination: data?.pagination,
    error,
    isLoading,
    refresh
  };
};

export const useRequest = (id) => {
  const { data, error, isLoading, refresh } = useApi(id ? REQUESTS.BY_ID(id) : null);
  
  return {
    request: data?.data || data,
    error,
    isLoading,
    refresh
  };
};

/**
 * Hook for request actions (create, approve, reject, etc.)
 */
export const useRequestActions = () => {
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const revalidateRequests = () => {
    mutate(
      key => typeof key === 'string' && key.includes('/requests'),
      undefined,
      { revalidate: true }
    );
  };

  const createRequest = useCallback(async (requestData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post(REQUESTS.BASE, requestData);
      revalidateRequests();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to create request';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRequest = useCallback(async (id, requestData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.put(REQUESTS.BY_ID(id), requestData);
      revalidateRequests();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update request';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveRequest = useCallback(async (id, data = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = typeof data === 'string' 
        ? { notes: data }
        : { 
            notes: data.comments || data.notes || '', 
            items: data.items,
            managerData: data.managerData,
            purchasingData: data.purchasingData
          };
      
      const response = await api.post(REQUESTS.APPROVE(id), payload);
      revalidateRequests();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to approve request';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectRequest = useCallback(async (id, reason) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(REQUESTS.REJECT(id), { reason });
      revalidateRequests();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reject request';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelRequest = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(REQUESTS.CANCEL(id));
      revalidateRequests();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to cancel request';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const transferRequest = useCallback(async (id, toDepartment, notes = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(REQUESTS.TRANSFER(id), { toDepartment, notes });
      revalidateRequests();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to transfer request';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
    transferRequest,
    isLoading,
    error
  };
};