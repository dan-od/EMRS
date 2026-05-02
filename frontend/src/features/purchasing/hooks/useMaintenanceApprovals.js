/**
 * useMaintenanceApprovals - Hook for fetching Manager_Approved maintenance requests
 * These are requests waiting for Purchasing to review and approve
 */
import { useApi } from '@/hooks/useApi';
import { REQUESTS } from '@/services/endpoints';

// Extract array from various response formats
const extractArray = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response.data && Array.isArray(response.data)) return response.data;
  if (response.requests) return response.requests;
  return [];
};

export const useMaintenanceApprovals = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.PURCHASING_MAINTENANCE);
  
  // Filter to only show Manager_Approved status (ready for purchasing review)
  const allRequests = extractArray(data);
  const pendingApprovals = allRequests.filter(r => 
    r.status === 'Manager_Approved' || 
    (r.type === 'Material' && r.status === 'Approved' && r.details?.isAdditionalRequest)
  );
  
  return {
    requests: pendingApprovals,
    allMaintenanceRequests: allRequests,
    error,
    isLoading,
    refresh
  };
};

export default useMaintenanceApprovals;
