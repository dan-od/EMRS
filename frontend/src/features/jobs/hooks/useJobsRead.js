/**
 * Jobs Hooks - Data Fetching (Read)
 */
import useSWR from 'swr';
import { api } from '@/services/api';

const fetcher = (url) => api.get(url).then(res => res.data);

export const useJobs = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  const qs = params.toString();
  const { data, error, isLoading, mutate } = useSWR(
    qs ? `/jobs?${qs}` : '/jobs', fetcher, { revalidateOnFocus: false }
  );
  return {
    jobs: data?.jobs || [],
    pagination: data?.pagination || { total: 0 },
    isLoading, error, refresh: mutate
  };
};

export const useMyJobs = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  const qs = params.toString();
  const { data, error, isLoading, mutate } = useSWR(
    qs ? `/jobs/my?${qs}` : '/jobs/my', fetcher, { revalidateOnFocus: false }
  );
  return {
    jobs: data?.jobs || [],
    pagination: data?.pagination || { total: 0 },
    isLoading, error, refresh: mutate
  };
};

export const useJob = (jobId) => {
  const isValid = jobId && /^[0-9a-f-]{36}$/i.test(jobId);
  const { data, error, isLoading, mutate } = useSWR(
    isValid ? `/jobs/${jobId}` : null, fetcher, { revalidateOnFocus: false }
  );
  return { job: data?.job || null, isLoading: isValid ? isLoading : false, error, refresh: mutate };
};

export const useJobStats = () => {
  const { data, error, isLoading } = useSWR('/jobs/stats', fetcher, { revalidateOnFocus: false });
  return { stats: data?.stats || {}, isLoading, error };
};

// Pre-Inspection
export const useInspectionTemplate = (jobId) => {
  const { data, error, isLoading } = useSWR(
    jobId ? `/jobs/${jobId}/inspections/template` : null, fetcher, { revalidateOnFocus: false }
  );
  return { template: data?.template || {}, isLoading, error };
};

export const usePendingInspections = (jobId) => {
  const { data, error, isLoading, mutate } = useSWR(
    jobId ? `/jobs/${jobId}/inspections/pending` : null, fetcher, { revalidateOnFocus: false }
  );
  return { items: data?.items || [], isLoading, error, refresh: mutate };
};

export const useJobInspections = (jobId) => {
  const { data, error, isLoading, mutate } = useSWR(
    jobId ? `/jobs/${jobId}/inspections` : null, fetcher, { revalidateOnFocus: false }
  );
  return { inspections: data?.inspections || [], isLoading, error, refresh: mutate };
};

export const useAcknowledgedItems = (jobId) => {
  const { data, error, isLoading, mutate } = useSWR(
    jobId ? `/jobs/${jobId}/inspections/acknowledged` : null, fetcher, { revalidateOnFocus: false }
  );
  return { items: data?.items || [], isLoading, error, refresh: mutate };
};