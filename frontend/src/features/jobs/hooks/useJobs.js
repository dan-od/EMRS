/**
 * Jobs Hooks
 * Custom hooks for jobs data fetching and mutations
 */
import useSWR from 'swr';
import { api } from '@/services/api';

// Jobs API base path - NO /api prefix (axios baseURL already includes it)
const JOBS_API = '/jobs';

// Fetcher function
const fetcher = (url) => api.get(url).then(res => res.data);

/**
 * Hook for fetching jobs list with filters (all jobs - for managers)
 */
export const useJobs = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const queryString = params.toString();
  const endpoint = queryString ? `${JOBS_API}?${queryString}` : JOBS_API;

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000
  });

  return {
    jobs: data?.jobs || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 10 },
    isLoading,
    error,
    refresh: mutate
  };
};

/**
 * Hook for fetching user's assigned jobs (team member view)
 */
export const useMyJobs = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const queryString = params.toString();
  const endpoint = queryString ? `${JOBS_API}/my?${queryString}` : `${JOBS_API}/my`;

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000
  });

  return {
    jobs: data?.jobs || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 10 },
    isLoading,
    error,
    refresh: mutate
  };
};

/**
 * Hook for fetching single job details
 * Only fetches if id is a valid UUID (not 'new' or other special routes)
 */
export const useJob = (id) => {
  // Validate that id looks like a UUID before fetching
  const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  const { data, error, isLoading, mutate } = useSWR(
    isValidUUID ? `${JOBS_API}/${id}` : null, 
    fetcher, 
    {
      revalidateOnFocus: false
    }
  );

  return {
    job: data?.job || null,
    isLoading: isValidUUID ? isLoading : false,
    error: isValidUUID ? error : null,
    refresh: mutate
  };
};

/**
 * Hook for fetching job statistics (all jobs - for managers)
 */
export const useJobStats = () => {
  const { data, error, isLoading } = useSWR(
    `${JOBS_API}/stats`, 
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    stats: data?.stats || { draft: 0, planning: 0, in_progress: 0, completed: 0, active: 0, total: 0 },
    isLoading,
    error
  };
};

/**
 * Hook for fetching user's assigned jobs statistics
 */
export const useMyJobStats = () => {
  const { data, error, isLoading } = useSWR(
    `${JOBS_API}/my/stats`, 
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    stats: data?.stats || { draft: 0, planning: 0, in_progress: 0, completed: 0, active: 0, total: 0 },
    isLoading,
    error
  };
};

/**
 * Hook for job mutations (create, update, status change)
 */
export const useJobActions = () => {
  const createJob = async (jobData) => {
    const response = await api.post(JOBS_API, jobData);
    return response.data.job;
  };

  const updateJob = async (id, jobData) => {
    const response = await api.put(`${JOBS_API}/${id}`, jobData);
    return response.data.job;
  };

  const updateStatus = async (id, status, notes = '') => {
    const response = await api.patch(`${JOBS_API}/${id}/status`, { status, notes });
    return response.data.job;
  };

  return { createJob, updateJob, updateStatus };
};

/**
 * Hook for team management
 */
export const useTeamActions = () => {
  const addMember = async (jobId, userId, role = 'Member') => {
    const response = await api.post(`${JOBS_API}/${jobId}/team`, { 
      user_id: userId, 
      role_in_job: role 
    });
    return response.data;
  };

  const removeMember = async (jobId, userId) => {
    await api.delete(`${JOBS_API}/${jobId}/team/${userId}`);
  };

  const setSupervisor = async (jobId, supervisorId) => {
    const response = await api.patch(`${JOBS_API}/${jobId}/supervisor`, { 
      supervisor_id: supervisorId 
    });
    return response.data.job;
  };

  return { addMember, removeMember, setSupervisor };
};

/**
 * Hook for equipment management
 */
export const useEquipmentActions = () => {
  const addEquipment = async (jobId, equipmentId) => {
    const response = await api.post(`${JOBS_API}/${jobId}/equipment`, { 
      equipment_id: equipmentId 
    });
    return response.data;
  };

  const removeEquipment = async (jobId, equipmentId) => {
    await api.delete(`${JOBS_API}/${jobId}/equipment/${equipmentId}`);
  };

  return { addEquipment, removeEquipment };
};

export default useJobs;
