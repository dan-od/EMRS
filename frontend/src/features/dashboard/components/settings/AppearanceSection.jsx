import ThemeToggle, { ThemeToggleSimple } from '@/components/common/ThemeToggle';
import { Palette, Sun, Moon } from 'lucide-react';

export const AppearanceSection = ({ theme }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface">
    <div className="flex items-center gap-3 p-6 pb-0">
      <Palette className="w-5 h-5 text-primary-500" />
      <h3 className="text-base font-semibold text-text-primary dark:text-dark-text">Appearance</h3>
    </div>

    <div className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-3">
          Theme Mode
        </label>
        <ThemeToggle showLabel size="md" />
        <p className="text-xs text-text-muted dark:text-dark-muted mt-2">
          Choose your preferred color scheme
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-3">
          {theme === 'dark'
            ? <Moon className="w-5 h-5 text-primary-400" />
            : <Sun className="w-5 h-5 text-amber-500" />}
          <div>
            <p className="text-sm font-medium text-text-primary dark:text-dark-text">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </p>
            <p className="text-xs text-text-muted dark:text-dark-muted">Quick toggle</p>
          </div>
        </div>
        <ThemeToggleSimple />
      </div>
    </div>
  </div>
);
