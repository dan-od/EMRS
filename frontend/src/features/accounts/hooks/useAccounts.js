/**
 * Accounts Hooks
 * React hooks for accounts data fetching and mutations
 */

import { useState, useEffect, useCallback } from 'react';
import accountsApi from '../services/accountsApi';

/**
 * Helper to extract data from API response
 * API returns { success: true, data: {...} }
 */
const extractData = (response, defaultValue = null) => {
  if (!response) return defaultValue;
  // Handle { success: true, data: ... } format
  if (response.success && response.data !== undefined) {
    return response.data;
  }
  // Handle direct data format
  return response;
};

/**
 * Hook for fetching work orders with filters
 */
export const useWorkOrders = (filters = {}) => {
  const [workOrders, setWorkOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await accountsApi.getWorkOrders(filters);
      
      // Extract data from response
      const data = extractData(result, { workOrders: [], pagination: {} });
      
      // Handle both formats: { workOrders, pagination } or direct array
      if (Array.isArray(data)) {
        setWorkOrders(data);
        setPagination({});
      } else {
        setWorkOrders(data.workOrders || data.work_orders || []);
        setPagination(data.pagination || {});
      }
    } catch (err) {
      console.error('Failed to fetch work orders:', err);
      setError(err.message || 'Failed to fetch work orders');
      setWorkOrders([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  return { workOrders, pagination, loading, error, refetch: fetchWorkOrders };
};

/**
 * Hook for fetching single work order
 */
export const useWorkOrder = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    const fetchWorkOrder = async () => {
      try {
        setLoading(true);
        const result = await accountsApi.getWorkOrderById(id);
        setData(extractData(result));
      } catch (err) {
        console.error('Failed to fetch work order:', err);
        setError(err.message || 'Failed to fetch work order');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [id]);

  return { data, loading, error };
};

/**
 * Hook for fetching accounts statistics
 */
export const useAccountsStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const result = await accountsApi.getStats();
      setStats(extractData(result));
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(err.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

/**
 * Hook for recording payment
 */
export const useRecordPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recordPayment = async (id, paymentData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await accountsApi.recordPayment(id, paymentData);
      return extractData(result);
    } catch (err) {
      console.error('Failed to record payment:', err);
      setError(err.message || 'Failed to record payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { recordPayment, loading, error };
};

/**
 * Hook for costs by department
 */
export const useCostsByDepartment = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await accountsApi.getCostsByDepartment();
        const extracted = extractData(result, []);
        setData(Array.isArray(extracted) ? extracted : []);
      } catch (err) {
        console.error('Failed to fetch costs by department:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading, error };
};

/**
 * Hook for costs by vendor
 */
export const useCostsByVendor = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await accountsApi.getCostsByVendor();
        const extracted = extractData(result, []);
        setData(Array.isArray(extracted) ? extracted : []);
      } catch (err) {
        console.error('Failed to fetch costs by vendor:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading, error };
};

/**
 * Hook for service breakdown
 */
export const useServiceBreakdown = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await accountsApi.getServiceBreakdown();
        const extracted = extractData(result, []);
        setData(Array.isArray(extracted) ? extracted : []);
      } catch (err) {
        console.error('Failed to fetch service breakdown:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading, error };
};
