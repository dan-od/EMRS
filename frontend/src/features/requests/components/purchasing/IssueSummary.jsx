/**
 * IssueSummary - Displays maintenance request summary (equipment, service type, issue)
 */
import { Wrench, Home, Building2, Shuffle, AlertTriangle, User, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

const SERVICE_TYPE_CONFIG = {
  'In-House': { icon: Home, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-500/20' },
  'External': { icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/20' },
  'Mixed': { icon: Shuffle, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/20' }
};

const SEVERITY_CONFIG = {
  Critical: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  Low: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
};

const IssueSummary = ({ request }) => {
  const details = request?.details || {};
  const serviceConfig = SERVICE_TYPE_CONFIG[details.serviceType] || {};
  const ServiceIcon = serviceConfig.icon || Wrench;

  return (
    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        Issue Summary
      </h3>

      {/* Requester Info */}
      <div className="flex items-center gap-3 text-sm">
        <User className="w-4 h-4 text-gray-400" />
        <span className="text-gray-600 dark:text-gray-400">Requested by:</span>
        <span className="font-medium text-gray-900 dark:text-white">{request.requester_name}</span>
        <span className="text-gray-400">({request.requester_department})</span>
      </div>

      {/* Equipment */}
      {(request.equipment_name || details.equipmentName) && (
        <div className="flex items-center gap-3 text-sm">
          <Wrench className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">Equipment:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {request.equipment_name || details.equipmentName}
          </span>
          {request.serial_number && (
            <span className="text-gray-400">({request.serial_number})</span>
          )}
        </div>
      )}

      {/* Category & Service Type */}
      <div className="flex flex-wrap gap-4">
        {details.category && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300">
              {details.category}
            </span>
          </div>
        )}
        {details.serviceType && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Service Type:</span>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${serviceConfig.bg || 'bg-gray-100'}`}>
              <ServiceIcon className={`w-3 h-3 ${serviceConfig.color || 'text-gray-600'}`} />
              {details.serviceType}
            </span>
          </div>
        )}
        {details.severity && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Severity:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_CONFIG[details.severity]}`}>
              {details.severity}
            </span>
          </div>
        )}
      </div>

      {/* Date Needed */}
      {request.date_needed && (
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">Needed by:</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatDate(request.date_needed)}</span>
        </div>
      )}

      {/* Issue Description */}
      <div className="pt-3 border-t border-gray-200 dark:border-white/10">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Issue Description
        </label>
        <p className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-white/10">
          {details.issueDescription || details.subject || 'No description provided'}
        </p>
      </div>
    </div>
  );
};

export default IssueSummary;
