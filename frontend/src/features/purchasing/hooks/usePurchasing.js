import { useState, useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api';
import { PURCHASING, REQUESTS } from '@/services/endpoints';

// Single hook replacing 11 concurrent SWR calls on PurchasingDashboard
export const usePurchasingDashboard = () => {
  const { data, error, isLoading, refresh } = useApi(PURCHASING.DASHBOARD_STATS);
  const d = data?.data || {};
  const req = d.requests || {};
  return {
    isLoading,
    error,
    refresh,
    stats: d.stats || {},
    allRequests: req.all || [],
    readyRequests: req.ready || [],
    holdRequests: req.onHold || [],
    disbursedRequests: req.disbursedActive || [],
    returnRequests: req.pendingReturn || [],
    overdueRequests: req.overdue || [],
    completedRequests: req.completed || [],
    maintenanceRequests: req.maintenanceApprovals || [],
    approvedMaintenanceRequests: req.maintenanceApproved || [],
    lowStock: d.lowStock || [],
    extensions: d.extensions || []
  };
};

// Helper to extract array from API response
const extractArray = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response.data && Array.isArray(response.data)) return response.data;
  if (response.items) return response.items;
  if (response.requests) return response.requests;
  if (response.disbursements) return response.disbursements;
  return [];
};

// =====================================================
// INVENTORY HOOKS
// =====================================================

export const useInventory = (params) => {
  const queryString = params ? `?${new URLSearchParams(params)}` : '';
  const { data, error, isLoading, refresh } = useApi(`${PURCHASING.INVENTORY}${queryString}`);
  
  return {
    items: extractArray(data),
    pagination: data?.pagination,
    error,
    isLoading,
    refresh
  };
};

export const useLowStock = () => {
  const { data, error, isLoading, refresh } = useApi(`${PURCHASING.INVENTORY}/low-stock`);
  
  return {
    items: extractArray(data),
    error,
    isLoading,
    refresh
  };
};

// =====================================================
// REQUEST HOOKS FOR PURCHASING
// =====================================================

export const usePurchasingRequests = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.type) queryParams.set('type', params.type);
  if (params.status) queryParams.set('status', params.status);
  if (params.page) queryParams.set('page', params.page);
  if (params.limit) queryParams.set('limit', params.limit);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const { data, error, isLoading, refresh } = useApi(`${REQUESTS.PURCHASING_ALL}${queryString}`);
  
  return {
    requests: extractArray(data),
    pagination: data?.pagination,
    error,
    isLoading,
    refresh
  };
};

export const useReadyToDisburse = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.PURCHASING_READY);
  
  return {
    requests: extractArray(data),
    error,
    isLoading,
    refresh
  };
};

export const useOnHoldRequests = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.PURCHASING_ON_HOLD);
  
  return {
    requests: extractArray(data),
    error,
    isLoading,
    refresh
  };
};

export const useDisbursedActive = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.PURCHASING_DISBURSED);
  
  return {
    requests: extractArray(data),
    error,
    isLoading,
    refresh
  };
};

export const usePendingReturnRequests = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.PURCHASING_PENDING_RETURN);
  
  return {
    requests: extractArray(data),
    error,
    isLoading,
    refresh
  };
};

export const useOverdueReturns = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.PURCHASING_OVERDUE);
  
  return {
    requests: extractArray(data),
    error,
    isLoading,
    refresh
  };
};

// NEW: Get completed/returned requests
export const useCompletedRequests = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.PURCHASING_COMPLETED);
  
  return {
    requests: extractArray(data),
    error,
    isLoading,
    refresh
  };
};

// NEW: Get maintenance requests (repairs from job equipment inspections)
export const useMaintenanceRequests = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.PURCHASING_MAINTENANCE);
  
  return {
    requests: extractArray(data),
    error,
    isLoading,
    refresh
  };
};

export const usePurchasingStats = () => {
  const { data, error, isLoading, refresh } = useApi(REQUESTS.PURCHASING_STATS);
  
  const stats = data?.data || data?.stats || data || {};
  
  return {
    stats: {
      total_active: stats.total_active || 0,
      ready_to_disburse: stats.ready_to_disburse || 0,
      disbursed_active: stats.disbursed_active || 0,
      on_hold: stats.on_hold || 0,
      pending_return: stats.pending_return || 0,
      overdue: stats.overdue || 0,
      completed: stats.completed || 0,
      pending_repairs: stats.pending_repairs || 0
    },
    error,
    isLoading,
    refresh
  };
};

// =====================================================
// DISBURSEMENT LEGACY HOOKS
// =====================================================

export const useDisbursements = (params) => {
  const queryString = params ? `?${new URLSearchParams(params)}` : '';
  const { data, error, isLoading, refresh } = useApi(`${PURCHASING.DISBURSEMENTS}${queryString}`);
  
  return {
    disbursements: extractArray(data),
    pagination: data?.pagination,
    error,
    isLoading,
    refresh
  };
};

export const usePendingDisbursements = () => {
  const { data, error, isLoading, refresh } = useApi(`${PURCHASING.DISBURSEMENTS}/pending`);
  
  return {
    disbursements: extractArray(data),
    error,
    isLoading,
    refresh
  };
};

// =====================================================
// PURCHASING ACTIONS
// =====================================================

export const usePurchasingActions = () => {
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);

  const revalidatePurchasing = () => {
    mutate(
      key => typeof key === 'string' && (key.includes('/requests') || key.includes('/purchasing')),
      undefined,
      { revalidate: true }
    );
  };

  const disburseRequest = useCallback(async (requestId, { notes, expectedReturnDate, withoutApproval, inventoryLinks } = {}) => {
    setIsLoading(true);
    try {
      const response = await api.post(REQUESTS.DISBURSE(requestId), {
        notes,
        expectedReturnDate,
        withoutApproval,
        inventoryLinks
      });
      revalidatePurchasing();
      return response.data?.data || response.data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const putOnHold = useCallback(async (requestId, notes) => {
    setIsLoading(true);
    try {
      const response = await api.post(REQUESTS.PUT_ON_HOLD(requestId), { notes });
      revalidatePurchasing();
      return response.data?.data || response.data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const releaseFromHold = useCallback(async (requestId) => {
    setIsLoading(true);
    try {
      const response = await api.post(REQUESTS.RELEASE_FROM_HOLD(requestId));
      revalidatePurchasing();
      return response.data?.data || response.data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmReturn = useCallback(async (requestId, { notes, verifiedItems } = {}) => {
    setIsLoading(true);
    try {
      const response = await api.post(REQUESTS.CONFIRM_RETURN(requestId), { notes, verifiedItems });
      revalidatePurchasing();
      return response.data?.data || response.data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeRequest = useCallback(async (requestId) => {
    setIsLoading(true);
    try {
      const response = await api.post(REQUESTS.COMPLETE(requestId));
      revalidatePurchasing();
      return response.data?.data || response.data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remindReturn = useCallback(async (requestId) => {
    setIsLoading(true);
    try {
      const response = await api.post(REQUESTS.REMIND_RETURN(requestId));
      revalidatePurchasing();
      return response.data?.data || response.data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addStock = useCallback(async (itemId, quantity, notes) => {
    setIsLoading(true);
    try {
      const response = await api.post(PURCHASING.ADD_STOCK(itemId), { quantity, notes });
      revalidatePurchasing();
      return response.data?.data || response.data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processDisbursement = useCallback(async (disbursementId, action) => {
    setIsLoading(true);
    try {
      const endpoint = action === 'approve' 
        ? PURCHASING.DISBURSEMENT_APPROVE(disbursementId)
        : PURCHASING.DISBURSEMENT_REJECT(disbursementId);
      const response = await api.post(endpoint);
      revalidatePurchasing();
      return response.data?.data || response.data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    disburseRequest,
    putOnHold,
    releaseFromHold,
    confirmReturn,
    completeRequest,
    remindReturn,
    addStock,
    processDisbursement,
    isLoading
  };
};

// =====================================================
// AUDIT TRAIL HOOK
// =====================================================

export const useAuditTrail = (requestId) => {
  const { data, error, isLoading, refresh } = useApi(
    requestId ? REQUESTS.AUDIT_TRAIL(requestId) : null
  );
  
  return {
    auditTrail: extractArray(data),
    error,
    isLoading,
    refresh
  };
};
