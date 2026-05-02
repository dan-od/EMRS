/**
 * IssueDetailsFields - Issue description, severity, date fields
 */
import { SEVERITY_LEVELS } from './maintenanceConstants';

const IssueDetailsFields = ({ formData, onChange, errors }) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Issue Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="issueDescription"
          value={formData.issueDescription}
          onChange={onChange}
          rows={4}
          placeholder="Describe the issue in detail. What's wrong? When did it start?"
          className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 resize-none bg-white dark:bg-[#1a1f26] text-gray-700 dark:text-gray-300 placeholder:text-text-muted dark:placeholder:text-dark-muted ${
            errors.issueDescription ? 'border-red-500' : 'border-gray-200 dark:border-white/10'
          }`}
        />
        {errors.issueDescription && <p className="text-red-500 text-sm mt-1">{errors.issueDescription}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity</label>
          <div className="flex flex-wrap gap-2">
            {SEVERITY_LEVELS.map(level => (
              <label key={level} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="severity"
                  value={level}
                  checked={formData.severity === level}
                  onChange={onChange}
                  className="w-4 h-4 text-primary-600"
                />
                <span className={`text-sm ${
                  level === 'Critical' ? 'text-red-600 dark:text-red-400 font-medium' :
                  level === 'High' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {level}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Date</label>
          <input
            type="date"
            name="dateNeeded"
            value={formData.dateNeeded}
            onChange={onChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-[#1a1f26] text-gray-700 dark:text-gray-300"
          />
        </div>
      </div>
    </>
  );
};

export default IssueDetailsFields;
