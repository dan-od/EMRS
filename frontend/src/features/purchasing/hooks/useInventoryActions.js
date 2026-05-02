import { useState, useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { api } from '@/services/api';
import { PURCHASING } from '@/services/endpoints';

// Inventory actions (CRUD + stock adjustments)
export const useInventoryActions = () => {
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);

  const revalidateInventory = () => {
    mutate(
      key => typeof key === 'string' && key.includes('/purchasing'),
      undefined,
      { revalidate: true }
    );
  };

  const createItem = useCallback(async (itemData) => {
    setIsLoading(true);
    try {
      const response = await api.post(PURCHASING.INVENTORY, itemData);
      revalidateInventory();
      return response.data?.data || response.data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (id, itemData) => {
    setIsLoading(true);
    try {
      const response = await api.put(PURCHASING.INVENTORY_BY_ID(id), itemData);
      revalidateInventory();
      return response.data?.data || response.data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addStock = useCallback(async (id, quantity, notes) => {
    setIsLoading(true);
    try {
      const response = await api.post(PURCHASING.ADD_STOCK(id), { quantity, notes });
      revalidateInventory();
      return response.data?.data || response.data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const response = await api.delete(PURCHASING.INVENTORY_BY_ID(id));
      revalidateInventory();
      return response.data?.data || response.data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createItem, updateItem, addStock, deleteItem, isLoading };
};
