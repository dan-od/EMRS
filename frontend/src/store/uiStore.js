import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper to apply theme to DOM
const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // System preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme state
      theme: 'light', // 'light', 'dark', or 'system'
      
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
        set({ theme: newTheme });
      },
      
      // Initialize theme on load
      initTheme: () => {
        const theme = get().theme;
        applyTheme(theme);
      },

      // Sidebar state
      sidebarOpen: true,
      sidebarCollapsed: false,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Modal state
      modalOpen: false,
      modalContent: null,
      modalTitle: '',

      openModal: (content, title = '') => set({ modalOpen: true, modalContent: content, modalTitle: title }),
      closeModal: () => set({ modalOpen: false, modalContent: null, modalTitle: '' }),

      // Confirmation dialog
      confirmDialog: null,
      showConfirm: (config) => set({ confirmDialog: config }),
      hideConfirm: () => set({ confirmDialog: null }),

      // Global loading overlay
      globalLoading: false,
      loadingMessage: '',
      setGlobalLoading: (loading, message = '') => set({ globalLoading: loading, loadingMessage: message }),

      // Offline status
      isOffline: !navigator.onLine,
      setOffline: (offline) => set({ isOffline: offline }),

      // Notifications count
      notificationCount: 0,
      setNotificationCount: (count) => set({ notificationCount: count }),
      incrementNotifications: () => set((state) => ({ notificationCount: state.notificationCount + 1 })),
      clearNotifications: () => set({ notificationCount: 0 }),

      // Toast notifications
      notifications: [],
      addNotification: ({ type = 'info', message, duration = 5000 }) => {
        const id = Date.now();
        set((state) => ({
          notifications: [...state.notifications, { id, type, message }]
        }));
        // Auto remove after duration
        if (duration > 0) {
          setTimeout(() => {
            set((state) => ({
              notifications: state.notifications.filter(n => n.id !== id)
            }));
          }, duration);
        }
        return id;
      },
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }))
    }),
    {
      name: 'emrs-ui',
      partialize: (state) => ({ 
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed 
      })
    }
  )
);

// Alias for backward compatibility
export const useUiStore = useUIStore;
