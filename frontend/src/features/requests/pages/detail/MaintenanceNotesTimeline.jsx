export const MaintenanceNotesTimeline = ({ additionalNotes, managerNotes, managerApproverName, purchasingNotes, purchasingApproverName }) => {
  if (!additionalNotes && !managerNotes && !purchasingNotes) return null;

  return (
    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-[#1a1f26] rounded-xl border border-gray-200 dark:border-white/10">
      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
        Communication Notes
      </h4>
      <div className="space-y-3">
        {additionalNotes && (
          <div className="p-3 bg-white dark:bg-[#242b33] rounded-lg border-l-4 border-blue-400">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Engineer Notes</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{additionalNotes}</p>
          </div>
        )}
        {managerNotes && (
          <div className="p-3 bg-white dark:bg-[#242b33] rounded-lg border-l-4 border-orange-400">
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
              Manager Notes {managerApproverName && `— ${managerApproverName}`}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{managerNotes}</p>
          </div>
        )}
        {purchasingNotes && (
          <div className="p-3 bg-white dark:bg-[#242b33] rounded-lg border-l-4 border-teal-400">
            <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-1">
              Purchasing Notes {purchasingApproverName && `— ${purchasingApproverName}`}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{purchasingNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
