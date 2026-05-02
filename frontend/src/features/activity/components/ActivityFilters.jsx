import { Search, Calendar, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getActionGroupsForRole, getEntitiesForRole } from './activityFilterConfig';

const ActivityFilters = ({ filters, onFilterChange, actions = [], entities = [] }) => {
  const user = useAuthStore(s => s.user);
  const userRole = user?.role || '';

  const actionGroups = getActionGroupsForRole(userRole);
  const filteredEntities = getEntitiesForRole(userRole, entities);

  return (
    <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 dark:border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-muted" />
          <input
            type="text"
            placeholder="Search logs..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-dark-card text-text-primary dark:text-dark-text placeholder-text-muted dark:placeholder-dark-muted focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        <div className="relative">
          <select
            value={filters.action}
            onChange={(e) => onFilterChange('action', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-dark-card text-text-primary dark:text-dark-text focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer pr-10 transition-colors"
          >
            <option value="">All Actions</option>
            {Object.entries(actionGroups).map(([key, group]) => (
              <optgroup key={key} label={group.label}>
                {group.actions
                  .filter(action => actions.includes(action))
                  .map(action => (
                    <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
                  ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-muted pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filters.entity_type}
            onChange={(e) => onFilterChange('entity_type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-dark-card text-text-primary dark:text-dark-text focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer pr-10 transition-colors"
          >
            <option value="">All Entities</option>
            {filteredEntities.map(entity => (
              <option key={entity} value={entity}>{entity.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-muted pointer-events-none" />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-muted" />
          <input type="date" value={filters.start_date} onChange={(e) => onFilterChange('start_date', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-dark-card text-text-primary dark:text-dark-text focus:ring-2 focus:ring-primary-500 transition-colors"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-muted" />
          <input type="date" value={filters.end_date} onChange={(e) => onFilterChange('end_date', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-dark-card text-text-primary dark:text-dark-text focus:ring-2 focus:ring-primary-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default ActivityFilters;
