/**
 * Accounts API Service
 * API calls for accounts department functionality
 */

import { api } from '@/services/api';

const BASE_URL = '/accounts';

/**
 * Get completed work orders with filters
 */
export const getWorkOrders = async (params = {}) => {
  const response = await api.get(`${BASE_URL}/work-orders`, { params });
  return response.data;
};

/**
 * Get single work order by ID
 */
export const getWorkOrderById = async (id) => {
  const response = await api.get(`${BASE_URL}/work-orders/${id}`);
  return response.data;
};

/**
 * Record payment for a work order
 */
export const recordPayment = async (id, paymentData) => {
  const response = await api.post(`${BASE_URL}/work-orders/${id}/payment`, paymentData);
  return response.data;
};

/**
 * Get cost summary statistics
 */
export const getStats = async () => {
  const response = await api.get(`${BASE_URL}/stats`);
  return response.data;
};

/**
 * Get costs by department
 */
export const getCostsByDepartment = async () => {
  const response = await api.get(`${BASE_URL}/costs-by-department`);
  return response.data;
};

/**
 * Get costs by vendor
 */
export const getCostsByVendor = async () => {
  const response = await api.get(`${BASE_URL}/costs-by-vendor`);
  return response.data;
};

/**
 * Get service type breakdown
 */
export const getServiceBreakdown = async () => {
  const response = await api.get(`${BASE_URL}/service-breakdown`);
  return response.data;
};

/**
 * Export work orders data
 */
export const exportWorkOrders = async (params = {}) => {
  const response = await api.get(`${BASE_URL}/export`, { params });
  return response.data;
};

const accountsApi = {
  getWorkOrders,
  getWorkOrderById,
  recordPayment,
  getStats,
  getCostsByDepartment,
  getCostsByVendor,
  getServiceBreakdown,
  exportWorkOrders
};

export default accountsApi;
