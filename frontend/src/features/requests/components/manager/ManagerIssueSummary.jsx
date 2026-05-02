/**
 * ManagerIssueSummary - Displays the maintenance issue details for manager review
 */
import { AlertTriangle } from 'lucide-react';

const ManagerIssueSummary = ({ details, engineerNotes }) => (
  <>
    {/* Engineer's Notes */}
    {engineerNotes && (
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Engineer's Notes:</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{engineerNotes}</p>
      </div>
    )}

    {/* Issue Summary */}
    <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300">Issue Reported</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            {details.issueDescription || 'No description'}
          </p>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              Category: <strong>{details.category || 'Equipment'}</strong>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Severity: <strong className="text-orange-600 dark:text-orange-400">{details.severity || 'Medium'}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default ManagerIssueSummary;
