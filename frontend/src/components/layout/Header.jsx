import { Menu, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Avatar } from '@/components/common';
import { NotificationBell } from '@/features/notifications/components';
import { formatRole } from '@/utils/formatters';
import { cn } from '@/utils/helpers';

export const Header = ({ title }) => {
  const user = useAuthStore(s => s.user);
  const { toggleSidebar, sidebarCollapsed, theme, toggleTheme } = useUIStore();

  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header className="sticky top-0 z-30 safe-top bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10">
      <div className="h-14 flex items-center justify-between px-4 lg:px-5">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5 text-text-secondary dark:text-dark-muted" />
          </button>
          {title && (
            <h1 className="text-lg font-semibold text-text-primary dark:text-dark-text hidden sm:block">
              {title}
            </h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle - iOS style */}
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-full transition-all duration-300 ease-in-out",
              "hover:scale-110 active:scale-95",
              isDark 
                ? "bg-slate-700/50 text-amber-400 hover:bg-slate-600/50" 
                : "bg-blue-50 text-blue-500 hover:bg-blue-100"
            )}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User - Compact */}
          <div className="flex items-center gap-2.5 pl-2.5 ml-1 border-l border-gray-200/60 dark:border-white/10">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-text-primary dark:text-dark-text leading-tight">{formatRole(user?.role)}</p>
            </div>
            <Avatar name={user?.name} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
};
