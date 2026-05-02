import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper, PageSection } from '@/components/layout';
import { Card, CardContent, Badge, Button } from '@/components/common';
import { PageLoader, EmptyState } from '@/components/feedback';
import { useSafetyReport, useSafetyActions } from '../hooks/useSafety';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { formatDate, formatDateTime, formatSeverity } from '@/utils/formatters';
import { getSeverityColor } from '@/utils/helpers';
import { 
  ChevronLeft, Calendar, MapPin, User, AlertTriangle,
  CheckCircle, Clock
} from 'lucide-react';

const SafetyReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { addNotification } = useUiStore();
  const { report, isLoading, error, refresh } = useSafetyReport(id);
  const { updateStatus, isLoading: actionLoading } = useSafetyActions();

  const isSafetyDept = user?.department_name === 'Safety';
  const canUpdateStatus = isSafetyDept && report?.status !== 'Closed';

  const handleStatusUpdate = async (status) => {
    try {
      await updateStatus(id, status);
      addNotification({ type: 'success', message: `Report marked as ${status}` });
      refresh();
    } catch (err) {
      addNotification({ type: 'error', message: err.message });
    }
  };

  if (isLoading) return <PageLoader />;
  if (error || !report) return <EmptyState.ErrorState />;

  const severityColor = getSeverityColor(report.severity);

  return (
    <PageWrapper
      title={
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-background-secondary rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span>Safety Report</span>
        </div>
      }
    >
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${severityColor.bg}`}>
                  <AlertTriangle className={`w-6 h-6 ${severityColor.text}`} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    {report.report_type.replace('_', ' ')} Report
                  </h2>
                  <p className="text-sm text-text-muted">ID: {report.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={report.status === 'Open' ? 'warning' :
                               report.status === 'In_Progress' ? 'info' : 'success'}>
                  {report.status.replace('_', ' ')}
                </Badge>
                <Badge className={`${severityColor.bg} ${severityColor.text}`}>
                  {formatSeverity(report.severity)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <InfoItem icon={Calendar} label="Date" value={formatDate(report.incident_date)} />
              <InfoItem icon={MapPin} label="Location" value={report.location} />
              <InfoItem icon={User} label="Reporter" value={report.reporter_name} />
              <InfoItem icon={Clock} label="Reported" value={formatDateTime(report.created_at)} />
            </div>

            <PageSection title="Description">
              <p className="text-text-secondary whitespace-pre-wrap">
                {report.description}
              </p>
            </PageSection>

            {report.actions_taken && (
              <PageSection title="Immediate Actions Taken" className="mt-4">
                <p className="text-text-secondary whitespace-pre-wrap">
                  {report.actions_taken}
                </p>
              </PageSection>
            )}

            {report.witnesses && (
              <PageSection title="Witnesses" className="mt-4">
                <p className="text-text-secondary">{report.witnesses}</p>
              </PageSection>
            )}

            {canUpdateStatus && (
              <div className="mt-6 pt-6 border-t border-border-light">
                <h3 className="text-sm font-medium text-text-primary mb-3">Update Status</h3>
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  {report.status === 'Open' && (
                    <Button
                      variant="primary"
                      onClick={() => handleStatusUpdate('In_Progress')}
                      loading={actionLoading}
                      className="w-full sm:w-auto"
                    >
                      Start Investigation
                    </Button>
                  )}
                  {report.status === 'In_Progress' && (
                    <Button
                      variant="success"
                      onClick={() => handleStatusUpdate('Closed')}
                      loading={actionLoading}
                      className="w-full sm:w-auto"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {report.investigation_notes && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-text-primary mb-4">Investigation Notes</h3>
              <p className="text-text-secondary whitespace-pre-wrap">
                {report.investigation_notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2">
    <Icon className="w-4 h-4 text-text-muted mt-0.5" />
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm text-text-primary">{value || '-'}</p>
    </div>
  </div>
);

export default SafetyReportDetail;
