/**
 * JobCard - Single job card with equipment items
 */
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button } from '@/components/common';
import { ExternalLink, MapPin, Calendar } from 'lucide-react';
import { EquipmentRow } from './EquipmentRow';
import { formatDate } from '@/utils/formatters';

const JOB_STATUS_STYLES = {
  Draft: 'bg-gray-500/20 text-gray-400',
  Team_Assigned: 'bg-yellow-500/20 text-yellow-400',
  Approved: 'bg-blue-500/20 text-blue-400',
  In_Progress: 'bg-primary-500/20 text-primary-400',
  Post_Job: 'bg-purple-500/20 text-purple-400'
};

const PRIORITY_STYLES = {
  Critical: 'bg-red-500 text-white',
  High: 'bg-orange-500 text-white',
  Medium: 'bg-blue-500 text-white',
  Low: 'bg-gray-500 text-white'
};

export const JobCard = ({ job, items, onDisburse, onReturn, onStartSourcing, onItemArrived, onDisburseArrived, onRepairComplete, onLinkDisburse }) => {
  const nav = useNavigate();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Job Header */}
        <div className="p-4 border-b border-white/10 flex flex-wrap justify-between items-start gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{job.job_number}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${JOB_STATUS_STYLES[job.job_status]}`}>
                {job.job_status?.replace('_', ' ')}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${PRIORITY_STYLES[job.job_priority]}`}>
                {job.job_priority}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(job.start_date)}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => nav(`/jobs/${job.job_id}`)}>
            <ExternalLink className="w-4 h-4 mr-1" /> View
          </Button>
        </div>

        {/* Equipment Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-secondary">
              <tr className="text-left text-xs text-text-secondary uppercase">
                <th className="p-3">Item</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <EquipmentRow 
                  key={item.id} 
                  item={item} 
                  jobStatus={job.job_status}
                  onDisburse={onDisburse}
                  onReturn={onReturn}
                  onStartSourcing={onStartSourcing}
                  onItemArrived={onItemArrived}
                  onDisburseArrived={onDisburseArrived}
                  onRepairComplete={onRepairComplete}
                  onLinkDisburse={onLinkDisburse}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
