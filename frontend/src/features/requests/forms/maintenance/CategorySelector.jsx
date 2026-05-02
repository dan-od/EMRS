/**
 * CategorySelector - Maintenance category selection
 */
import { MAINTENANCE_CATEGORIES } from './maintenanceConstants';

const CategorySelector = ({ selectedCategory, onSelect, error }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        What needs maintenance? <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MAINTENANCE_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={`p-4 border-2 rounded-xl text-left transition-all ${
              selectedCategory === category.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/15'
                : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-white dark:bg-[#1a1f26]'
            }`}
          >
            <category.icon className={`w-6 h-6 mb-2 ${
              selectedCategory === category.id ? 'text-primary-600 dark:text-primary-400' : 'text-text-muted dark:text-dark-muted'
            }`} />
            <p className={`font-medium ${
              selectedCategory === category.id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {category.label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{category.description}</p>
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default CategorySelector;
