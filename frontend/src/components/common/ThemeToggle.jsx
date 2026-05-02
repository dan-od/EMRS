/**
 * ThemeToggle - Switch between light and dark mode
 */

import { Sun, Moon, Monitor } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const ThemeToggle = ({ showLabel = false, size = 'md' }) => {
  const { theme, setTheme } = useUIStore();

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const buttonSize = size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-3' : 'p-2';

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-dark-border rounded-lg">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`${buttonSize} rounded-md transition-all duration-200 flex items-center gap-2
            ${theme === value 
              ? 'bg-white dark:bg-dark-surface shadow-sm text-primary-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          title={label}
        >
          <Icon className={iconSize} />
          {showLabel && <span className="text-sm font-medium">{label}</span>}
        </button>
      ))}
    </div>
  );
};

// Simple toggle button (light/dark only)
export const ThemeToggleSimple = ({ className = '' }) => {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${isDark ? 'bg-primary-500' : 'bg-gray-300'} ${className}`}
      aria-label="Toggle theme"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center
          ${isDark ? 'translate-x-7' : 'translate-x-0'}`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-primary-500" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
