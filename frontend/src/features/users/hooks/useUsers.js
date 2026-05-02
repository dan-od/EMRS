import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { USERS } from '@/services/endpoints';
import { usersService } from '../services/usersService';

export const useUsers = (params) => {
  const queryString = params && Object.keys(params).length > 0 
    ? `?${new URLSearchParams(params)}` 
    : '';
  const { data, error, isLoading, refresh } = useApi(`${USERS.BASE}${queryString}`);
  
  return {
    users: data?.users || [],
    pagination: data?.pagination,
    total: data?.total || 0,
    error,
    isLoading,
    refresh
  };
};

export const useUser = (id) => {
  const { data, error, isLoading, refresh } = useApi(id ? USERS.BY_ID(id) : null);
  
  return {
    user: data,
    error,
    isLoading,
    refresh
  };
};

export const useUserActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (action) => {
    setIsLoading(true);
    try {
      return await action();
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = (data) => execute(() => usersService.create(data));
  const updateUser = (id, data) => execute(() => usersService.update(id, data));
  const deleteUser = (id) => execute(() => usersService.delete(id));
  const resetPassword = (id, password) => execute(() => usersService.resetPassword(id, password));
  const toggleActive = (id, isActive) => execute(() => usersService.toggleActive(id, isActive));

  return { createUser, updateUser, deleteUser, resetPassword, toggleActive, isLoading };
};
