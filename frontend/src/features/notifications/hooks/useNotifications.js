import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api';
import { NOTIFICATIONS } from '@/services/endpoints';

const NOTIFICATIONS_KEY = `${NOTIFICATIONS.BASE}?limit=20`;
const REFRESH_INTERVAL = 30000;

export const useNotifications = () => {
  const { mutate } = useSWRConfig();

  const { data: notifData, isLoading, error, mutate: mutateNotifs } = useApi(
    NOTIFICATIONS_KEY,
    { refreshInterval: REFRESH_INTERVAL }
  );

  const { data: countData, mutate: mutateCount } = useApi(
    NOTIFICATIONS.UNREAD_COUNT,
    { refreshInterval: REFRESH_INTERVAL }
  );

  const notifications = Array.isArray(notifData)
    ? notifData
    : (notifData?.data || notifData?.notifications || []);

  const unreadCount = countData?.count ?? countData ?? 0;

  const markAsRead = useCallback(async (notificationId) => {
    await api.patch(NOTIFICATIONS.MARK_READ(notificationId));
    mutateNotifs(
      (prev) => {
        const items = Array.isArray(prev) ? prev : (prev?.data || []);
        const updated = items.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
        return Array.isArray(prev) ? updated : { ...prev, data: updated };
      },
      { revalidate: false }
    );
    mutateCount(
      (prev) => {
        const c = prev?.count ?? prev ?? 0;
        const next = Math.max(0, c - 1);
        return prev?.count !== undefined ? { ...prev, count: next } : next;
      },
      { revalidate: false }
    );
  }, [mutateNotifs, mutateCount]);

  const markAllAsRead = useCallback(async () => {
    await api.patch(NOTIFICATIONS.MARK_ALL_READ);
    mutateNotifs(
      (prev) => {
        const items = Array.isArray(prev) ? prev : (prev?.data || []);
        const updated = items.map(n => ({ ...n, is_read: true }));
        return Array.isArray(prev) ? updated : { ...prev, data: updated };
      },
      { revalidate: false }
    );
    mutateCount(
      (prev) => (prev?.count !== undefined ? { ...prev, count: 0 } : 0),
      { revalidate: false }
    );
  }, [mutateNotifs, mutateCount]);

  const refresh = useCallback(() => {
    mutateNotifs();
    mutateCount();
  }, [mutateNotifs, mutateCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh,
    refreshCount: mutateCount,
    markAsRead,
    markAllAsRead
  };
};

export default useNotifications;
