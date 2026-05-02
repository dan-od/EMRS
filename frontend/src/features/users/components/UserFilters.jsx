import { Search, List, LayoutGrid, Plus, ChevronDown, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { ROLES, DEPARTMENTS, getRoleLabel } from '@/utils/constants';

export const UserFilters = ({ filters, onChange, viewMode, setViewMode, onAddUser }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const hasFilters = filters.search || filters.role || filters.department || filters.isActive;

  return (
    <div className="space-y-4">
      {/* Top row: Search + View Toggle + Add */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className={cn(
              'w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm',
              'outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
              'dark:border-dark-border dark:bg-dark-surface dark:text-dark-text'
            )}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-dark-border dark:bg-dark-surface">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'list'
                  ? 'bg-slate-100 text-text-primary dark:bg-dark-card dark:text-dark-text'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                viewMode === 'grid'
                  ? 'bg-slate-100 text-text-primary dark:bg-dark-card dark:text-dark-text'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          {onAddUser && (
            <button
              onClick={onAddUser}
              className="flex items-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-600 active:scale-95"
            >
              <Plus className="mr-2 h-4 w-4" /> Add User
            </button>
          )}
        </div>
      </div>

      {/* Filter pills row */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          value={filters.role || ''}
          onChange={(val) => handleChange('role', val)}
          label="All Roles"
          options={Object.values(ROLES).map(r => ({ value: r, label: getRoleLabel(r) }))}
        />
        <FilterSelect
          value={filters.department || ''}
          onChange={(val) => handleChange('department', val)}
          label="All Departments"
          options={Object.values(DEPARTMENTS).map(d => ({ value: d.name, label: d.name }))}
        />
        <FilterSelect
          value={filters.isActive ?? ''}
          onChange={(val) => handleChange('isActive', val)}
          label="All Status"
          options={[
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ]}
        />

        {hasFilters && (
          <button
            onClick={() => onChange({})}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-error transition-colors hover:bg-error/10"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
};

const FilterSelect = ({ value, onChange, label, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1.5',
        'text-sm font-medium transition-colors cursor-pointer',
        'hover:bg-slate-50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
        'dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-card',
        value ? 'text-primary-600 border-primary-200 bg-primary-50/50' : 'text-text-secondary'
      )}
    >
      <option value="">{label}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
  </div>
);
