/**
 * OtherCategoryFields - Fields for 'Other' maintenance category
 */
import { OTHER_SUBCATEGORIES } from './maintenanceConstants';

const OtherCategoryFields = ({ formData, onChange, errors }) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          name="otherCategory"
          value={formData.otherCategory}
          onChange={onChange}
          className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-[#1a1f26] text-gray-700 dark:text-gray-300 ${
            errors.otherCategory ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
          }`}
        >
          <option value="">Select category...</option>
          {OTHER_SUBCATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.otherCategory && <p className="text-red-500 text-sm mt-1">{errors.otherCategory}</p>}
      </div>

      {formData.otherCategory === 'Other (specify below)' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Specify Issue Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="otherDescription"
            value={formData.otherDescription}
            onChange={onChange}
            placeholder="Describe what needs maintenance..."
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-[#1a1f26] text-gray-700 dark:text-gray-300 placeholder:text-text-muted dark:placeholder:text-dark-muted ${
              errors.otherDescription ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
            }`}
          />
          {errors.otherDescription && <p className="text-red-500 text-sm mt-1">{errors.otherDescription}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={onChange}
          placeholder="e.g., Building A, Floor 2, Room 201"
          className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-[#1a1f26] text-gray-700 dark:text-gray-300 placeholder:text-text-muted dark:placeholder:text-dark-muted ${
            errors.location ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
          }`}
        />
        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
      </div>
    </>
  );
};

export default OtherCategoryFields;
