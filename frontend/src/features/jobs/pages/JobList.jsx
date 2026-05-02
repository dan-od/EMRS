/**
 * JobList - Main jobs list page with stats and filter tabs
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Button, Card, CardContent } from '@/components/common';
import { PageLoader, EmptyState } from '@/components/feedback';
import { JobCard } from '../components';
import { useJobs, useMyJobs, useJobStats } from '../hooks';
import { useAuthStore } from '@/store/authStore';
import { Plus, Briefcase, Clock, Play, CheckCircle, AlertTriangle, Users, Package, Boxes } from 'lucide-react';
import { MANAGER_ROLES } from '../constants';

const PURCHASING_ROLES = ['Purchasing_Manager', 'Purchasing_Staff'];

const StatCard = ({ icon: Icon, label, value, color, onClick, active }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 p-4 rounded-xl border transition-all w-full ${active ? 'ring-2 ring-primary-500 border-primary-500' : 'border-border-light hover:border-primary-300'} bg-background-secondary`}
  >
    <div className={`p-2.5 rounded-lg ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="text-left">
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
    </div>
  </button>
);

const FilterTab = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
      active 
        ? 'bg-primary-500 text-white' 
        : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
    }`}
  >
    {label} {count !== undefined && <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${active ? 'bg-white/20' : 'bg-background-tertiary'}`}>{count}</span>}
  </button>
);

const JobList = () => {
  const nav = useNavigate();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('');
  const isManager = MANAGER_ROLES.includes(user?.role);
  const isPurchasing = PURCHASING_ROLES.includes(user?.role);

  const mgr = useJobs({ status: statusFilter });
  const team = useMyJobs({ status: statusFilter });
  const { jobs, pagination, isLoading, error, refresh } = isManager ? mgr : team;
  const { stats } = useJobStats();

  const toggleFilter = (status) => setStatusFilter(s => s === status ? '' : status);

  if (isLoading && !jobs.length) return <PageLoader />;

  return (
    <PageWrapper
      title={isManager ? 'Jobs' : 'My Jobs'}
      actions={isManager && <Button variant="primary" onClick={() => nav('/jobs/new')}><Plus className="w-4 h-4 mr-2" />New Job</Button>}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={Clock} 
          label="Planning" 
          value={(stats?.draft || 0) + (stats?.pending_approval || 0)} 
          color="bg-blue-500"
          onClick={() => toggleFilter('DRAFT')}
          active={statusFilter === 'DRAFT'}
        />
        <StatCard 
          icon={Play} 
          label="In Progress" 
          value={(stats?.approved || 0) + (stats?.in_progress || 0)} 
          color="bg-primary-500"
          onClick={() => toggleFilter('IN_PROGRESS')}
          active={statusFilter === 'IN_PROGRESS'}
        />
        <StatCard 
          icon={CheckCircle} 
          label="Completed" 
          value={stats?.completed || 0} 
          color="bg-green-500"
          onClick={() => toggleFilter('COMPLETED')}
          active={statusFilter === 'COMPLETED'}
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Post Job" 
          value={stats?.post_job || 0} 
          color="bg-yellow-500"
          onClick={() => toggleFilter('POST_JOB')}
          active={statusFilter === 'POST_JOB'}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <FilterTab label="All Jobs" count={pagination.total} active={!statusFilter} onClick={() => setStatusFilter('')} />
        <FilterTab label="Draft" active={statusFilter === 'DRAFT'} onClick={() => toggleFilter('DRAFT')} />
        <FilterTab label="Pending" active={statusFilter === 'PENDING_APPROVAL'} onClick={() => toggleFilter('PENDING_APPROVAL')} />
        <FilterTab label="Approved" active={statusFilter === 'APPROVED'} onClick={() => toggleFilter('APPROVED')} />
        <FilterTab label="In Progress" active={statusFilter === 'IN_PROGRESS'} onClick={() => toggleFilter('IN_PROGRESS')} />
        <FilterTab label="Post Job" active={statusFilter === 'POST_JOB'} onClick={() => toggleFilter('POST_JOB')} />
        <FilterTab label="Completed" active={statusFilter === 'COMPLETED'} onClick={() => toggleFilter('COMPLETED')} />
        
        {/* Disbursement Queue - Purchasing only */}
        {isPurchasing && (
          <>
            <div className="w-px h-6 bg-border-light mx-1" />
            <button
              onClick={() => nav('/jobs/purchasing-queue')}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-500/30"
            >
              <Boxes className="w-4 h-4" />
              Disbursement Queue
            </button>
          </>
        )}
      </div>

      {/* Job List */}
      {error ? (
        <EmptyState icon={Briefcase} title="Error" description="Failed to load" action={refresh} actionLabel="Retry" />
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs" description={statusFilter ? 'No jobs with this status' : isManager ? 'Create your first job' : 'No assigned jobs'} action={isManager && !statusFilter ? () => nav('/jobs/new') : undefined} actionLabel="Create Job" />
      ) : (
        <div className="grid gap-4">{jobs.map(j => <JobCard key={j.id} job={j} />)}</div>
      )}
    </PageWrapper>
  );
};

export default JobList;
