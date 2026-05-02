/**
 * AppearanceSettings - Theme/appearance settings section
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/common';
import ThemeToggle, { ThemeToggleSimple } from '@/components/common/ThemeToggle';
import { useUIStore } from '@/store/uiStore';
import { Palette, Sun, Moon } from 'lucide-react';

const AppearanceSettings = () => {
  const { theme } = useUIStore();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-primary-500" />
          <CardTitle>Appearance</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-3">
            Theme Mode
          </label>
          <ThemeToggle showLabel size="md" />
          <p className="text-xs text-text-muted dark:text-dark-muted mt-2">
            Choose your preferred color scheme
          </p>
        </div>

        {/* Quick Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-primary-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <div>
              <p className="text-sm font-medium text-text-primary dark:text-dark-text">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-xs text-text-muted dark:text-dark-muted">Quick toggle</p>
            </div>
          </div>
          <ThemeToggleSimple />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
