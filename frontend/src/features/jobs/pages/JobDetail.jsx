/**
 * JobDetail - Job detail page
 */
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Button } from '@/components/common';
import { PageLoader, EmptyState } from '@/components/feedback';
import { TeamSection, EquipmentMaterialsSection } from '../components';
import { JobDetailHeader } from './JobDetailHeader';
import { useJob } from '../hooks';
import { useAuthStore } from '@/store/authStore';
import { ChevronLeft, Edit, RefreshCw, Briefcase } from 'lucide-react';
import { MANAGER_ROLES } from '../constants';

// Status check helpers
const isDraftStatus = (status) => {
  if (!status) return false;
  const s = status.toString().toUpperCase();
  return s === 'DRAFT' || s === 'TEAM_ASSIGNED';
};

const isActiveJob = (status) => {
  if (!status) return false;
  const s = status.toString().toUpperCase();
  return ['APPROVED', 'EQUIPMENT_ALLOCATED', 'READY', 'IN_PROGRESS', 'ACTIVE'].includes(s);
};

const JobDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuthStore();
  const { job, isLoading, error, refresh } = useJob(id);

  const isManager = MANAGER_ROLES.includes(user?.role);
  const isSupervisor = job?.team?.some(m => m.user_id === user?.id && m.role === 'SUPERVISOR');
  const isEngineer = job?.team?.some(m => m.user_id === user?.id && m.role === 'ENGINEER');
  const isChiefOp = job?.team?.some(m => m.user_id === user?.id && m.role === 'CHIEF_OPERATOR');
  const isDAQ = job?.team?.some(m => m.user_id === user?.id && m.role === 'DAQ');
  const isTeamMember = isSupervisor || isEngineer || isChiefOp || isDAQ;
  
  const isDraft = isDraftStatus(job?.status);
  const isActive = isActiveJob(job?.status);
  
  // Team management - only in draft
  const canManageTeam = (isManager || isSupervisor) && isDraft;
  
  // Equipment editing (full control) - only in draft
  const canEditEquipment = (isManager || isSupervisor || isEngineer) && isDraft;
  
  // Equipment requesting - team members can request even when job is active
  // New requests will need supervisor → manager approval
  const canRequestEquipment = isTeamMember && (isDraft || isActive);
  
  // Pre-inspection - team members can inspect disbursed items
  const canInspect = isTeamMember && isActive;

  if (isLoading) return <PageLoader />;
  if (error || !job) {
    return (
      <PageWrapper title="Job">
        <EmptyState icon={Briefcase} title="Not found" description={error?.response?.status === 403 ? 'Access denied' : 'Job not found'} action={() => nav('/jobs')} actionLabel="Back" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={<div className="flex items-center gap-3"><button onClick={() => nav('/jobs')} className="p-1 hover:bg-background-secondary rounded"><ChevronLeft className="w-5 h-5" /></button>{job.job_number}</div>}
      actions={<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={refresh}><RefreshCw className="w-4 h-4" /></Button>{isManager && isDraft && <Button variant="secondary" size="sm" onClick={() => nav(`/jobs/${id}/edit`)}><Edit className="w-4 h-4 mr-1" />Edit</Button>}</div>}
    >
      <div className="space-y-6">
        <JobDetailHeader job={job} user={user} onRefresh={refresh} />
        <TeamSection jobId={id} team={job.team} onRefresh={refresh} canEdit={canManageTeam} />
        <EquipmentMaterialsSection 
          jobId={id} 
          items={job.equipment_items} 
          onRefresh={refresh} 
          canEdit={canEditEquipment}
          canRequest={canRequestEquipment}
          canInspect={canInspect}
          jobStatus={job.status}
        />
      </div>
    </PageWrapper>
  );
};

export default JobDetail;