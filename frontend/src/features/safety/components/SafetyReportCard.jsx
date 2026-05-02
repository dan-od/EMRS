import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/common';
import { formatDate } from '@/utils/formatters';
import { AlertTriangle, AlertCircle, ShieldAlert, Calendar, MapPin, User } from 'lucide-react';

const TYPE_ICONS = {
  Incident: AlertTriangle,
  Hazard: AlertCircle,
  Near_Miss: ShieldAlert
};

const SEVERITY_CONFIG = {
  Critical: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400' },
  High: { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-700 dark:text-orange-400' },
  Medium: { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-400' },
  Low: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-400' }
};

const STATUS_CONFIG = {
  Open: { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-400' },
  In_Progress: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400' },
  Resolved: { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-400' },
  Closed: { bg: 'bg-gray-100 dark:bg-gray-500/20', text: 'text-gray-700 dark:text-gray-400' }
};

export const SafetyReportCard = memo(({ report }) => {
  const navigate = useNavigate();
  const reportType = report.type || report.report_type;
  const Icon = TYPE_ICONS[reportType] || AlertTriangle;
  const severityStyle = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.Medium;
  const statusStyle = STATUS_CONFIG[report.status] || STATUS_CONFIG.Open;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-white/10"
      onClick={() => navigate(`/safety/${report.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${severityStyle.bg}`}>
            <Icon className={`w-5 h-5 ${severityStyle.text}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-xs rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                {report.status?.replace('_', ' ')}
              </span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${severityStyle.bg} ${severityStyle.text}`}>
                {report.severity}
              </span>
            </div>
            
            <h3 className="font-medium text-gray-900 dark:text-white">
              {report.title || `${reportType?.replace('_', ' ')} Report`}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {report.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(report.incident_date || report.created_at)}
              </span>
              {report.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {report.location}
                </span>
              )}
              {report.reporter_name && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {report.reporter_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SafetyReportCard.displayName = 'SafetyReportCard';
