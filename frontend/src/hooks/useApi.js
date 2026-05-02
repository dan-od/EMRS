import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { apiPost, apiPut, apiDelete } from '@/services/api';

// GET hook with SWR caching
// Fetcher + defaults come from <SWRConfig> in main.jsx
export const useApi = (endpoint, options = {}) => {
  const { enabled = true, ...config } = options;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled && endpoint ? endpoint : null,
    config
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    refresh: mutate,
    mutate
  };
};

// Mutation hook for POST requests
export const useApiPost = (endpoint, options = {}) => {
  const { trigger, isMutating, error, reset } = useSWRMutation(
    endpoint,
    (url, { arg }) => apiPost(url, arg),
    options
  );

  return { trigger, isLoading: isMutating, error, reset };
};

// Mutation hook for PUT requests
export const useApiPut = (endpoint, options = {}) => {
  const { trigger, isMutating, error, reset } = useSWRMutation(
    endpoint,
    (url, { arg }) => apiPut(url, arg),
    options
  );

  return { trigger, isLoading: isMutating, error, reset };
};

// Mutation hook for DELETE requests
export const useApiDelete = (endpoint, options = {}) => {
  const { trigger, isMutating, error, reset } = useSWRMutation(
    endpoint,
    (url) => apiDelete(url),
    options
  );

  return { trigger, isLoading: isMutating, error, reset };
};

// Hook for paginated data
export const usePaginatedApi = (endpoint, page = 1, limit = 10, options = {}) => {
  const separator = endpoint?.includes('?') ? '&' : '?';
  const paginatedEndpoint = endpoint ? `${endpoint}${separator}page=${page}&limit=${limit}` : null;

  const { data, error, isLoading, mutate } = useApi(paginatedEndpoint, options);

  return {
    data: data?.data || [],
    pagination: data?.pagination || { page, limit, total: 0, totalPages: 0 },
    error,
    isLoading,
    refresh: mutate
  };
};

// Generic mutation hook
export const useMutate = () => {
  const mutate = async (method, endpoint, data = null) => {
    switch (method.toUpperCase()) {
      case 'POST':
        return apiPost(endpoint, data);
      case 'PUT':
        return apiPut(endpoint, data);
      case 'DELETE':
        return apiDelete(endpoint);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  };

  return { mutate };
};