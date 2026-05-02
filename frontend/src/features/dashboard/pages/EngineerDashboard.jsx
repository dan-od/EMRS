import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common';
import { useApi } from '@/hooks/useApi';
import { REQUESTS } from '@/services/endpoints';
import { StatCard } from '../components/StatCard';
import { QuickActions } from '../components/QuickActions';
import {
  Package, ClipboardList, Clock, CheckCircle, Plus, ArrowRight,
  Car, HardHat, Wrench, FileText
} from 'lucide-react';

const EngineerDashboard = ({ user }) => {
  const navigate = useNavigate();

  const { data: myRequestsData } = useApi(REQUESTS.MY_REQUESTS);

  const myRequests = Array.isArray(myRequestsData) ? myRequestsData : (myRequestsData?.data || myRequestsData?.requests || []);

  const stats = {
    activeRequests: myRequests.filter(r => r.status === 'Pending').length,
    assignedEquipment: myRequests.filter(r =>
      r.type === 'Equipment' && ['Disbursed', 'Pending_Return'].includes(r.status)
    ).length,
    pendingRequests: myRequests.filter(r => r.status === 'Pending').length,
    completedToday: myRequests.filter(r => {
      const today = new Date().toDateString();
      return r.status === 'Completed' && new Date(r.updated_at).toDateString() === today;
    }).length
  };

  const displayName = user?.firstName || user?.first_name || 'User';
  const recentRequests = myRequests.slice(0, 5);

  return (
    <PageWrapper title="Dashboard">
      <div className="space-y-5">
        {/* Welcome */}
        <div className="mb-1">
          <h2 className="text-xl font-bold text-text-primary dark:text-dark-text">
            Welcome back, {displayName}! 👋
          </h2>
          <p className="text-sm text-text-secondary dark:text-dark-muted">
            Here's what's happening with your requests and equipment.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Active Requests" value={stats.activeRequests} icon={ClipboardList} color="primary" />
          <StatCard title="Assigned Equipment" value={stats.assignedEquipment} icon={Package} color="info" />
          <StatCard title="Pending" value={stats.pendingRequests} icon={Clock} color="warning" />
          <StatCard title="Completed Today" value={stats.completedToday} icon={CheckCircle} color="success" />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-4 h-4 text-primary-500" />
              Recent Requests
            </CardTitle>
            <button
              onClick={() => navigate('/requests')}
              className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-0">
            {recentRequests.length === 0 ? (
              <EmptyRequests navigate={navigate} />
            ) : (
              <RequestList requests={recentRequests} navigate={navigate} />
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

const EmptyRequests = ({ navigate }) => (
  <div className="text-center py-6">
    <ClipboardList className="w-10 h-10 text-gray-300 dark:text-dark-muted mx-auto mb-2" />
    <p className="text-text-primary dark:text-dark-text font-medium text-sm">No requests yet</p>
    <p className="text-text-secondary dark:text-dark-muted text-xs mb-3">Your recent requests will appear here</p>
    <button 
      onClick={() => navigate('/requests/new')}
      className="px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 inline-flex items-center gap-1.5"
    >
      <Plus className="w-4 h-4" /> Create Request
    </button>
  </div>
);

const RequestList = ({ requests, navigate }) => (
  <div className="space-y-2">
    {requests.map((request) => (
      <div 
        key={request.id}
        onClick={() => navigate(`/requests/${request.id}`)}
        className="p-3 bg-gray-50 dark:bg-dark-card rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-text-primary dark:text-dark-text">
              {request.type || request.request_type} Request
            </p>
            <p className="text-xs text-text-secondary dark:text-dark-muted line-clamp-1">
              {request.subject || request.details?.purpose || request.details?.reason || request.details?.issueDescription || request.type}
            </p>
            <p className="text-xs text-text-muted dark:text-dark-muted mt-0.5">
              {new Date(request.created_at).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </div>
    ))}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Approved: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
    Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
    Disbursed: 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-400',
    On_Hold: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400'
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded shrink-0 ${styles[status] || 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'}`}>
      {status}
    </span>
  );
};

export default EngineerDashboard;
