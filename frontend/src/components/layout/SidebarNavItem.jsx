/**
 * SidebarNavItem - iOS-style slim navigation item
 * Handles both simple items and expandable items with children
 */

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/helpers';

// iOS-style active/inactive
const baseStyles = 'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm';
const activeStyles = 'bg-primary-500/15 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 font-medium';
const inactiveStyles = 'text-text-secondary dark:text-dark-muted hover:bg-gray-100/80 dark:hover:bg-white/10';

// Paths that should only match exactly (not as prefixes)
const EXACT_MATCH_PATHS = ['/requests', '/purchasing'];

export const SidebarNavItem = ({ item, collapsed }) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const isPathActive = (path) => {
    // For specific paths, only match exact
    if (EXACT_MATCH_PATHS.includes(path)) {
      return location.pathname === path;
    }
    // For other paths, match exact or prefix
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const hasChildren = item.children?.length > 0;
  const isActive = isPathActive(item.path) || 
                   item.children?.some(child => isPathActive(child.path));

  // Expandable item with children
  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(baseStyles, 'w-full justify-between', isActive ? activeStyles : inactiveStyles)}
        >
          <div className="flex items-center gap-2.5">
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </div>
          {!collapsed && (
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', expanded && 'rotate-180')} />
          )}
        </button>
        
        {!collapsed && expanded && (
          <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-gray-200/60 dark:border-white/10 pl-3">
            {item.children.map((child) => (
              <li key={child.path}>
                <NavLink
                  to={child.path}
                  end={EXACT_MATCH_PATHS.includes(child.path)}
                  className={({ isActive }) => cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors',
                    isActive ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-text-muted dark:text-dark-muted hover:text-text-primary dark:hover:text-dark-text'
                  )}
                >
                  <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                  {child.label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  // Simple nav item - use 'end' prop for exact matching on specific paths
  return (
    <li>
      <NavLink
        to={item.path}
        end={EXACT_MATCH_PATHS.includes(item.path)}
        className={({ isActive }) => cn(baseStyles, isActive ? activeStyles : inactiveStyles)}
      >
        <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    </li>
  );
};

export const SidebarDivider = ({ label, collapsed }) => (
  <li className="pt-3 pb-1.5">
    {!collapsed && (
      <span className="px-3 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {label}
      </span>
    )}
    {collapsed && <hr className="border-gray-200/60 dark:border-white/10 mx-2" />}
  </li>
);
