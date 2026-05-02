/**
 * RequestInfo - Info grid and return date section
 */
import { formatDate, formatDateTime } from '@/utils/formatters';
import { Calendar, User, Building, Clock } from 'lucide-react';

export const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm text-text-primary dark:text-white">{value || '-'}</p>
    </div>
  </div>
);

export const DetailRow = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500 dark:text-gray-400">{label}:</span>
    <span className="text-text-primary dark:text-white">{value}</span>
  </div>
);

const RequestInfo = ({ request }) => {
  const returnDate = request.expected_return_date || request.expectedReturnDate || request.return_date;
  const isOverdue = returnDate && new Date(returnDate) < new Date() && request.status === 'Disbursed';

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <InfoItem icon={User} label="Requester" value={request.requester_name || 'Unknown'} />
        <InfoItem icon={Building} label="Department" value={request.requester_department || request.department_name || request.department || '-'} />
        <InfoItem icon={Calendar} label="Created" value={formatDate(request.created_at)} />
        <InfoItem icon={Clock} label="Updated" value={formatDateTime(request.updated_at)} />
      </div>

      {returnDate && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/20 rounded-lg mb-6">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Expected Return Date</p>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">{formatDate(returnDate)}</p>
          </div>
          {isOverdue && (
            <span className="ml-auto px-2 py-1 bg-red-100 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
              Overdue
            </span>
          )}
        </div>
      )}
    </>
  );
};

export default RequestInfo;
