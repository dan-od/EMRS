/**
 * ApprovalHistory - Approval history section
 */
import { Card, CardContent } from '@/components/common';
import { formatDateTime } from '@/utils/formatters';

const ApprovalHistory = ({ history }) => {
  if (!history || history.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-medium text-text-primary dark:text-dark-text mb-4">Approval History</h3>
        <div className="space-y-3">
          {history.map((entry, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm">
              <div className={`w-2 h-2 mt-1.5 rounded-full ${
                entry.action === 'Approved' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <div>
                <p className="text-text-primary dark:text-white">
                  <strong>{entry.user_name}</strong> {entry.action?.toLowerCase()} this request
                </p>
                {entry.comments && <p className="text-gray-500 dark:text-gray-400 mt-1">{entry.comments}</p>}
                <p className="text-gray-400 text-xs mt-1">{formatDateTime(entry.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalHistory;
