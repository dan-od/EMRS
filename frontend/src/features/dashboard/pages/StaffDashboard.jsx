/**
 * Staff Dashboard
 * For office staff - simple view focused on personal requests and safety
 * No access to: Equipment, Jobs, Maintenance, Purchasing
 */

import { PageWrapper } from '@/components/layout';
import { useApi } from '@/hooks/useApi';
import { REQUESTS } from '@/services/endpoints';
import { StatCard } from '../components/StatCard';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, Clock, CheckCircle, AlertTriangle,
  Plus, FileText, Send
} from 'lucide-react';

const StaffDashboard = ({ user }) => {
  const { data: requestsData, isLoading } = useApi(REQUESTS.MY_REQUESTS);
  
  const myRequests = Array.isArray(requestsData) ? requestsData : (requestsData?.data || []);
  
  const displayName = user?.firstName || user?.first_name || user?.name?.split(' ')[0] || 'Staff';

  // Calculate stats
  const stats = {
    totalRequests: myRequests.length,
    pendingRequests: myRequests.filter(r => r.status === 'Pending')?.length || 0,
    approvedRequests: myRequests.filter(r => r.status === 'Approved')?.length || 0,
    completedRequests: myRequests.filter(r => r.status === 'Completed')?.length || 0
  };

  const recentRequests = myRequests.slice(0, 5);

  return (
    <PageWrapper title="Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-text-primary">
            Hello, {displayName}! 👋
          </h2>
          <p className="text-text-secondary">
            Here's a summary of your requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Requests"
            value={stats.totalRequests}
            icon={ClipboardList}
            color="primary"
          />
          <StatCard
            title="Pending"
            value={stats.pendingRequests}
            icon={Clock}
            color="warning"
          />
          <StatCard
            title="Approved"
            value={stats.approvedRequests}
            icon={CheckCircle}
            color="success"
          />
          <StatCard
            title="Completed"
            value={stats.completedRequests}
            icon={CheckCircle}
            color="info"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/requests/new?type=Material"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Request Supplies</span>
            </Link>
            <Link
              to="/requests/new?type=PPE"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Plus className="w-8 h-8 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-300">Request PPE</span>
            </Link>
            <Link
              to="/requests/my"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <ClipboardList className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-300">My Requests</span>
            </Link>
            <Link
              to="/safety/new"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-900 dark:text-red-300">Report Safety Issue</span>
            </Link>
          </div>
        </div>

        {/* Safety Reporting Section */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-100 dark:border-red-800/30">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Safety Reporting
            </span>
            <span className="text-xs font-normal bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
              Direct to Safety Dept
            </span>
          </h3>
          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
            Report hazards, incidents, or near-misses directly to the Safety department
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              to="/safety/new?type=Hazard"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface rounded-lg text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Hazard
            </Link>
            <Link
              to="/safety/new?type=Incident"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface rounded-lg text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-sm font-medium"
            >
              <Send className="w-4 h-4" />
              Report Incident
            </Link>
            <Link
              to="/safety/new?type=Near_Miss"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface rounded-lg text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-sm font-medium"
            >
              <Clock className="w-4 h-4" />
              Report Near Miss
            </Link>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text">My Recent Requests</h3>
            <Link to="/requests/my" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All →
            </Link>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-dark-card rounded" />
              ))}
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No requests yet</p>
              <Link
                to="/requests/new"
                className="mt-3 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                Create your first request
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-dark-border overflow-x-auto">
              {recentRequests.map((request) => (
                <Link
                  key={request.id}
                  to={`/requests/${request.id}`}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-dark-card -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="font-medium text-text-primary dark:text-dark-text truncate">{request.subject}</p>
                    <p className="text-sm text-text-secondary truncate">
                      {request.type} • {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    request.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    request.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                    request.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                    'bg-gray-100 dark:bg-dark-card text-gray-800 dark:text-dark-text'
                  }`}>
                    {request.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default StaffDashboard;
