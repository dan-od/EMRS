import { useState, useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { useApi } from '@/hooks/useApi';
import { SAFETY } from '@/services/endpoints';
import { safetyService } from '../services/safetyService';

export const useSafetyReports = (params) => {
  // If params is null, don't fetch (used for role-based conditional fetching)
  const shouldFetch = params !== null;
  const queryString = params && Object.keys(params).length > 0 
    ? `?${new URLSearchParams(params)}` 
    : '';
  
  const { data, error, isLoading, refresh } = useApi(
    shouldFetch ? `${SAFETY.BASE}${queryString}` : null
  );
  
  return {
    reports: data?.reports || [],
    pagination: data?.pagination,
    error,
    isLoading,
    refresh
  };
};

export const useMySafetyReports = () => {
  const { data, error, isLoading, refresh } = useApi(SAFETY.MY_REPORTS);
  
  return {
    reports: data?.reports || [],
    error,
    isLoading,
    refresh
  };
};

export const useSafetyReport = (id) => {
  const { data, error, isLoading, refresh } = useApi(id ? SAFETY.BY_ID(id) : null);
  
  return {
    report: data?.report,
    error,
    isLoading,
    refresh
  };
};

export const useSafetyStats = (shouldFetch = true) => {
  const { data, error, isLoading } = useApi(shouldFetch ? SAFETY.STATS : null);
  
  return {
    stats: data || {},
    error,
    isLoading
  };
};

export const useSafetyActions = () => {
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);

  const revalidateSafety = () => {
    mutate(
      key => typeof key === 'string' && key.includes('/safety'),
      undefined,
      { revalidate: true }
    );
  };

  const createReport = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const result = await safetyService.create(data);
      revalidateSafety();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id, status, notes) => {
    setIsLoading(true);
    try {
      const result = await safetyService.updateStatus(id, status, notes);
      revalidateSafety();
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createReport, updateStatus, isLoading };
};
