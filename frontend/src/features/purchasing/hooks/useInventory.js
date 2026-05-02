import { useApi } from '@/hooks/useApi';
import { PURCHASING } from '@/services/endpoints';

// Helper to extract array from API response
const extractArray = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response.data && Array.isArray(response.data)) return response.data;
  if (response.items) return response.items;
  return [];
};

// Fetch inventory items with filters
export const useInventory = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.set('category', params.category);
  if (params.search) queryParams.set('search', params.search);
  if (params.page) queryParams.set('page', params.page);
  if (params.limit) queryParams.set('limit', params.limit);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const { data, error, isLoading, refresh } = useApi(`${PURCHASING.INVENTORY}${queryString}`);
  
  return {
    items: extractArray(data),
    pagination: data?.pagination,
    error,
    isLoading,
    refresh
  };
};

// Fetch low stock items
export const useLowStock = () => {
  const { data, error, isLoading, refresh } = useApi(PURCHASING.LOW_STOCK);
  return { items: extractArray(data), error, isLoading, refresh };
};

// Fetch single inventory item
export const useInventoryItem = (id) => {
  const { data, error, isLoading, refresh } = useApi(
    id ? PURCHASING.INVENTORY_BY_ID(id) : null
  );
  return { item: data?.data || data, error, isLoading, refresh };
};

// Fetch stock movement history
export const useStockMovements = (itemId) => {
  const { data, error, isLoading, refresh } = useApi(
    itemId ? PURCHASING.INVENTORY_MOVEMENTS(itemId) : null
  );
  return { movements: extractArray(data), error, isLoading, refresh };
};

// Re-export actions from separate file
export { useInventoryActions } from './useInventoryActions';
