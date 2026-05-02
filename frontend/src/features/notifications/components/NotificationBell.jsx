import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/helpers';

/**
 * Notification bell with dropdown
 */
export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    refresh 
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
    
    // Navigate to reference if available
    if (notification.reference_type && notification.reference_id) {
      const routes = {
        request: '/requests',
        equipment: '/equipment',
        job: '/jobs',
        safety_report: '/safety',
        maintenance: '/maintenance',
        work_order: '/maintenance',
        transport_assignment: '/requests',
        vendor: '/purchasing/vendors',
      };
      // vendor has no detail page — navigate to list only
      const listOnlyRoutes = new Set(['vendor']);
      const base = routes[notification.reference_type];
      if (base) {
        navigate(listOnlyRoutes.has(notification.reference_type)
          ? base
          : `${base}/${notification.reference_id}`);
      }
    }
    setIsOpen(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-error';
      case 'warning': return 'border-l-warning-500';
      default: return 'border-l-primary-500';
    }
  };

  const getTypeIcon = (type) => {
    // Could add different icons based on notification type
    return null;
  };

  // Format date helper (handle snake_case)
  const formatDate = (notification) => {
    const date = notification.created_at || notification.createdAt;
    if (!date) return '';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-text-secondary dark:text-dark-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a1f26] rounded-lg shadow-lg border border-gray-200 dark:border-white/10 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
            <h3 className="font-semibold text-text-primary dark:text-dark-text">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-text-muted dark:text-dark-muted">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-text-muted dark:text-dark-muted mx-auto mb-2" />
                <p className="text-text-muted dark:text-dark-muted text-sm">No notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-white/10">
                {notifications.slice(0, 10).map((notification) => (
                  <li
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-l-4',
                      notification.is_read ? 'bg-white dark:bg-transparent border-l-transparent' : 'bg-blue-50/50 dark:bg-blue-500/10',
                      getPriorityColor(notification.priority)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm',
                          notification.is_read ? 'text-text-secondary dark:text-dark-muted' : 'text-text-primary dark:text-dark-text font-medium'
                        )}>
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-text-muted dark:text-dark-muted mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-text-muted dark:text-dark-muted mt-1">
                          {formatDate(notification)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-white/10 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
