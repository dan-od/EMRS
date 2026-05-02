/**
 * Sidebar Component - iOS-inspired slim design
 * Role-specific navigation using sidebarConfig
 */

import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getSidebarByRole } from '@/config/sidebarConfig';
import { ChevronLeft, Settings, LogOut } from 'lucide-react';
import { SidebarNavItem, SidebarDivider } from './SidebarNavItem';

export const Sidebar = () => {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapse } = useUIStore();

  const navItems = getSidebarByRole(user?.role);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const renderNavItem = (item) => {
    if (item.type === 'divider') {
      return <SidebarDivider key={`div-${item.label}`} label={item.label} collapsed={sidebarCollapsed} />;
    }
    return <SidebarNavItem key={item.path} item={item} collapsed={sidebarCollapsed} />;
  };

  return (
    <>
      {/* Mobile overlay - iOS blur style */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - iOS style */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full flex flex-col transition-all duration-300 ease-out',
        'bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl',
        'border-r border-gray-200/60 dark:border-white/10',
        sidebarCollapsed ? 'w-[72px]' : 'w-60',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo - WellFluid Brand */}
        <div className="h-14 flex items-center px-2 border-b border-gray-100/60 dark:border-white/5 flex-shrink-0 safe-top">
          <div className="flex-1 flex justify-center">
            {sidebarCollapsed ? (
              <div className="w-9 h-9 border border-[#FF6B00] dark:border-[#FF6B00]/80 rounded flex items-center justify-center">
                <span className="text-[#FF6B00] font-[800] text-[10px] leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>WF</span>
              </div>
            ) : (
              <div className="border border-[#FF6B00] dark:border-[#FF6B00]/80 px-3 py-[3px]">
                <div className="flex flex-col items-center gap-[2px]">
                  <span className="text-[#FF6B00] font-[800] text-[10px] tracking-[0.14em] leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>WELL FLUID</span>
                  <div className="bg-[#8B4513] px-2 py-[2px] w-full flex justify-center">
                    <span className="text-white font-[500] text-[6px] tracking-[0.2em] leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>SERVICES LIMITED</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebarCollapse}
            className="hidden lg:flex p-1 rounded-md hover:bg-gray-100/80 dark:hover:bg-white/10 text-text-muted dark:text-dark-muted flex-shrink-0"
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Navigation - Slim items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">{navItems.map(renderNavItem)}</ul>
        </nav>

        {/* Footer - Compact */}
        <div className="border-t border-gray-100/60 dark:border-white/5 p-2 flex-shrink-0 safe-bottom">
          <NavLink
            to="/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary dark:text-dark-muted hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors"
          >
            <Settings className="w-[18px] h-[18px]" />
            {!sidebarCollapsed && <span>Settings</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-error hover:bg-red-50/80 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
