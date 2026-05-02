/**
 * JobCard - List item display with improved dark mode
 */
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, PriorityBadge } from '@/components/common';
import { JobStatusBadge } from './JobStatusBadge';
import { MapPin, Calendar, Users, Package, ChevronRight } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

export const JobCard = memo(({ job }) => {
  const nav = useNavigate();
  return (
    <Card 
      className="group hover:border-primary-500/50 transition-all cursor-pointer bg-background-secondary border-border-light" 
      onClick={() => nav(`/jobs/${job.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header with job number, status, priority */}
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-sm font-mono font-semibold text-primary-400">{job.job_number}</span>
              <JobStatusBadge status={job.status} size="sm" />
              <PriorityBadge priority={job.priority} size="sm" />
            </div>
            
            {/* Client name */}
            <h3 className="text-lg font-semibold text-text-primary truncate mb-1">{job.client}</h3>
            {job.well_name && <p className="text-sm text-text-secondary truncate mb-2">{job.well_name}</p>}
            
            {/* Meta info */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-text-muted" />
                <span>{job.location}</span>
              </span>
              {job.start_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  <span>{formatDate(job.start_date)}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-text-muted" />
                <span>{job.team_count || 0}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-text-muted" />
                <span>{job.equipment_count || 0}</span>
              </span>
            </div>
            
            {/* Role badge for team members */}
            {job.my_role && (
              <div className="mt-3 pt-3 border-t border-border-light">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${job.my_role === 'SUPERVISOR' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                  Your role: {job.my_role}
                </span>
              </div>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary-500 transition-colors self-center" />
        </div>
      </CardContent>
    </Card>
  );
});
JobCard.displayName = 'JobCard';
export default JobCard;
