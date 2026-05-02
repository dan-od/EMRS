/**
 * ViewToggle - Switch between grouped and flat views
 */
import { LayoutGrid, List } from 'lucide-react';

export const ViewToggle = ({ view, onViewChange }) => (
  <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-card rounded-lg p-1">
    <button
      onClick={() => onViewChange('grouped')}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        view === 'grouped' 
          ? 'bg-white dark:bg-dark-surface text-primary-600 shadow-sm' 
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <LayoutGrid className="w-4 h-4" />
      <span className="hidden sm:inline">By Job</span>
    </button>
    <button
      onClick={() => onViewChange('flat')}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        view === 'flat' 
          ? 'bg-white dark:bg-dark-surface text-primary-600 shadow-sm' 
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <List className="w-4 h-4" />
      <span className="hidden sm:inline">All Items</span>
    </button>
  </div>
);

export default ViewToggle;
