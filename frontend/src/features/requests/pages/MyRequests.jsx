import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Button } from '@/components/common';
import { PageLoader, EmptyState } from '@/components/feedback';
import { RequestCard } from '../components';
import { useMyRequests } from '../hooks/useRequests';
import { Plus, FileText, AlertCircle, Clock, CheckCircle, RotateCcw, XCircle, Package, Timer, Send } from 'lucide-react';
import { cn } from '@/utils/helpers';

// Filter tabs configuration
const FILTER_TABS = [
  { id: 'all', label: 'All', icon: Package },
  { id: 'pending', label: 'Pending Approval', icon: Timer, statuses: ['Pending'] }, // Waiting for manager approval
  { id: 'active', label: 'Active', icon: Send, statuses: ['Approved'] }, // Approved by manager, waiting for disbursement
  { id: 'disbursed', label: 'Disbursed', icon: CheckCircle, statuses: ['Disbursed'] }, // Items in use
  { id: 'return', label: 'Pending Return', icon: RotateCcw, statuses: ['Pending_Return'] }, // User initiated return
  { id: 'completed', label: 'Completed', icon: CheckCircle, statuses: ['Completed'] },
  { id: 'rejected', label: 'Rejected', icon: XCircle, statuses: ['Rejected', 'Cancelled'] }
];

const MyRequests = () => {
  const navigate = useNavigate();
  const { requests, isLoading, error } = useMyRequests();
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter requests based on active tab
  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    if (activeFilter === 'all') return requests;
    
    const tab = FILTER_TABS.find(t => t.id === activeFilter);
    if (!tab?.statuses) return requests;
    
    return requests.filter(r => tab.statuses.includes(r.status));
  }, [requests, activeFilter]);

  // Count for each filter
  const getCounts = useMemo(() => {
    if (!requests) return {};
    return FILTER_TABS.reduce((acc, tab) => {
      acc[tab.id] = tab.id === 'all' 
        ? requests.length 
        : requests.filter(r => tab.statuses?.includes(r.status)).length;
      return acc;
    }, {});
  }, [requests]);

  if (isLoading) return <PageLoader />;
  
  if (error) {
    return (
      <PageWrapper title="My Requests">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-text-primary dark:text-white mb-2">Failed to load requests</h3>
          <p className="text-text-secondary dark:text-gray-400 mb-4">Something went wrong.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title="My Requests"
      actions={
        <Button variant="primary" onClick={() => navigate('/requests')}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      }
    >
      {/* Filter Tabs - iOS pill style */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeFilter === tab.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-white/10 text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#242b33]'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-xs min-w-[20px] text-center',
              activeFilter === tab.id 
                ? 'bg-white/20' 
                : 'bg-gray-100 dark:bg-white/10'
            )}>
              {getCounts[tab.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Request List */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={activeFilter === 'all' ? 'No requests yet' : `No ${activeFilter} requests`}
          description={activeFilter === 'all' ? 'Submit your first request to get started' : 'No requests match this filter'}
        />
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(request => (
            <RequestCard key={request.id} request={request} showReturnAction />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default MyRequests;