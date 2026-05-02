/**
 * JobDetailHeader - Job info header section
 */
import { Card, CardContent, PriorityBadge } from '@/components/common';
import { JobStatusBadge, JobStatusTracker, WorkflowActions } from '../components';
import { Calendar, MapPin, Building, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDate, formatDateTime } from '@/utils/formatters';

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2">
    <Icon className="w-4 h-4 text-text-muted mt-0.5" />
    <div><p className="text-xs text-text-muted">{label}</p><p className="text-sm">{value || '-'}</p></div>
  </div>
);

export const JobDetailHeader = ({ job, user, onRefresh }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <JobStatusBadge status={job.status} />
            <PriorityBadge priority={job.priority} />
          </div>
          <h2 className="text-xl font-semibold">{job.client}</h2>
          {job.well_name && <p className="text-text-secondary">{job.well_name}</p>}
          {job.description && <p className="text-sm text-text-muted mt-2">{job.description}</p>}
        </div>
        <WorkflowActions job={job} userRole={user?.role} userId={user?.id} onRefresh={onRefresh} />
      </div>

      {job.my_role && (
        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg inline-flex">
          <span className="text-sm text-blue-600">Your role: <strong>{job.my_role}</strong></span>
        </div>
      )}

      <div className="mb-6 pb-6 border-b"><JobStatusTracker currentStatus={job.status} /></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Info icon={Building} label="Client" value={job.client} />
        <Info icon={MapPin} label="Location" value={job.location} />
        <Info icon={Calendar} label="Start" value={formatDate(job.start_date)} />
        <Info icon={Clock} label="End" value={formatDate(job.expected_end_date)} />
      </div>

      {job.status === 'APPROVED' && (
        <div className={`mt-4 pt-4 border-t flex items-center gap-3 p-3 rounded-lg ${job.signoff_completed ? 'bg-green-50' : 'bg-yellow-50'}`}>
          {job.signoff_completed ? (
            <><CheckCircle className="w-5 h-5 text-green-500" /><div><p className="text-sm font-medium text-green-700">Sign-off completed</p><p className="text-xs text-green-600">By {job.signoff_by_name} on {formatDateTime(job.signoff_at)}</p></div></>
          ) : (
            <><AlertCircle className="w-5 h-5 text-yellow-500" /><p className="text-sm text-yellow-700">Awaiting supervisor sign-off</p></>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

export default JobDetailHeader;
