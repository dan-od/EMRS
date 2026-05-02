/**
 * usePurchasingQueue - Hook for purchasing queue with tab filtering
 */
import useSWR from 'swr';
import { api } from '@/services/api';

const fetcher = (url) => api.get(url).then(res => res.data);

export const usePurchasingQueue = (tab = 'pending_disburse') => {
  const endpoint = '/jobs/purchasing/queue?tab=' + tab;
  
  const { data, error, isLoading, mutate } = useSWR(
    endpoint, 
    fetcher, 
    { revalidateOnFocus: false, dedupingInterval: 3000 }
  );
  
  return { 
    items: data?.items || [], 
    counts: data?.counts || {},
    isLoading, 
    error, 
    refresh: mutate 
  };
};

export const usePurchasingStats = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/jobs/purchasing/stats', 
    fetcher, 
    { revalidateOnFocus: false }
  );
  
  return { stats: data?.stats || {}, isLoading, error, refresh: mutate };
};