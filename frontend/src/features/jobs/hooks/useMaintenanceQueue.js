/**
 * useMaintenanceQueue - Fetch maintenance-related requests for Purchasing
 * Includes: Manager_Approved Maintenance requests AND Approved Material requests
 */
import useSWR from 'swr';
import { api } from '@/services/api';

const fetcher = async (url) => {
  const res = await api.get(url);
  return res.data;
};

export const useMaintenanceQueue = () => {
  // Fetch Manager_Approved maintenance requests (for Work Order creation)
  const { 
    data: maintenanceData, 
    isLoading: maintenanceLoading,
    mutate: refreshMaintenance 
  } = useSWR(
    '/requests?type=Maintenance&status=Manager_Approved',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 3000 }
  );
  
  // Fetch Approved Material requests (additional requests from Work Orders)
  const { 
    data: additionalData,
    isLoading: additionalLoading,
    mutate: refreshAdditional
  } = useSWR(
    '/requests?type=Material&status=Approved',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 3000 }
  );
  
  // Parse maintenance requests - handle different response formats
  let maintenanceRequests = [];
  if (maintenanceData) {
    maintenanceRequests = Array.isArray(maintenanceData) 
      ? maintenanceData 
      : maintenanceData?.requests || maintenanceData?.data || [];
  }
  
  // Parse material requests - handle different response formats
  let materialRequests = [];
  if (additionalData) {
    materialRequests = Array.isArray(additionalData)
      ? additionalData
      : additionalData?.requests || additionalData?.data || [];
  }
  
  // Check if a material request is from a work order
  const isFromWorkOrder = (req) => {
    try {
      const details = typeof req.details === 'string' ? JSON.parse(req.details) : req.details;
      return !!(details?.isAdditionalRequest || details?.workOrderId);
    } catch { return false; }
  };
  
  // Combine and tag items
  const items = [
    ...maintenanceRequests.map(r => ({ ...r, queueType: 'maintenance_approval' })),
    ...materialRequests.map(r => ({ 
      ...r, 
      queueType: isFromWorkOrder(r) ? 'additional_request' : 'material_request'
    }))
  ];
  
  const refresh = () => {
    refreshMaintenance();
    refreshAdditional();
  };
  
  return {
    items,
    count: items.length,
    isLoading: maintenanceLoading || additionalLoading,
    refresh
  };
};

export default useMaintenanceQueue;
