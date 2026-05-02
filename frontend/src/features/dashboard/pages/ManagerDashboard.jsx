import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common';
import { useApi } from '@/hooks/useApi';
import { REQUESTS, EQUIPMENT } from '@/services/endpoints';
import { StatCard } from '../components/StatCard';
import { 
  Package, ClipboardList, Clock, CheckCircle,
  AlertTriangle, ArrowRight, UserCheck, Wrench
} from 'lucide-react';

const ManagerDashboard = ({ user }) => {
  const navigate = useNavigate();
  
  // Fetch manager-relevant data
  const { data: pendingData } = useApi(REQUESTS.PENDING);
  const { data: equipmentData } = useApi(EQUIPMENT.BASE);
  const { data: myRequestsData } = useApi(REQUESTS.MY_REQUESTS);

  // Extract arrays safely
  const pendingRequests = Array.isArray(pendingData) ? pendingData : (pendingData?.data || pendingData?.requests || []);
  const equipment = Array.isArray(equipmentData) ? equipmentData : (equipmentData?.data || equipmentData?.equipment || []);
  const myRequests = Array.isArray(myRequestsData) ? myRequestsData : (myRequestsData?.data || myRequestsData?.requests || []);

  // Calculate manager-specific stats
  const stats = {
    pendingApprovals: pendingRequests.length,
    urgentRequests: pendingRequests.filter(r => r.priority === 'Critical' || r.priority === 'High').length,
    equipmentInUse: equipment.filter(e => e.status === 'In_Use').length,
    maintenanceDue: equipment.filter(e => e.status === 'Maintenance').length,
    myPendingRequests: myRequests.filter(r => r.status === 'Pending').length
  };

  const displayName = user?.firstName || user?.first_name || 'Manager';

  return (
    <PageWrapper title="Dashboard">
      <div className="space-y-5">
        {/* Welcome Section */}
        <div>
          <h2 className="text-xl font-bold text-text-primary dark:text-dark-text">
            Welcome back, {displayName}! 👋
          </h2>
          <p className="text-sm text-text-secondary dark:text-dark-muted">
            Manager Dashboard - Team oversight and request approvals
          </p>
        </div>

        {/* Priority Alert for Pending Approvals */}
        {stats.pendingApprovals > 0 && (
          <div className="bg-orange-50 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Clock className="w-5 h-5 text-orange-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-orange-800 dark:text-orange-300 text-sm">Pending Approvals</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                You have {stats.pendingApprovals} request(s) waiting for your approval
                {stats.urgentRequests > 0 && ` (${stats.urgentRequests} urgent)`}
              </p>
            </div>
            <button
              onClick={() => navigate('/requests/dept')}
              className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 shrink-0 w-full sm:w-auto text-center"
            >
              Review Now
            </button>
          </div>
        )}

        {/* Stats Grid - Manager Focus */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={ClipboardList}
            color="warning"
            subtitle={stats.urgentRequests > 0 ? `${stats.urgentRequests} urgent` : undefined}
          />
          <StatCard
            title="My Requests"
            value={stats.myPendingRequests}
            icon={ClipboardList}
            color="primary"
          />
          <StatCard
            title="Equipment In Use"
            value={stats.equipmentInUse}
            icon={Package}
            color="info"
          />
          <StatCard
            title="Maintenance Due"
            value={stats.maintenanceDue}
            icon={Wrench}
            color={stats.maintenanceDue > 0 ? 'error' : 'success'}
          />
        </div>

        {/* Manager Quick Actions */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-text-primary dark:text-dark-text">Manager Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/requests/dept')}
              className="bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 p-4 rounded-xl hover:shadow-md dark:hover:bg-orange-500/25 transition-all flex flex-col items-center gap-2 border border-transparent dark:border-orange-500/20"
            >
              <UserCheck className="w-6 h-6" />
              <span className="font-medium text-sm">Review Requests</span>
              <span className="text-xl font-bold">{stats.pendingApprovals}</span>
            </button>
            <button
              onClick={() => navigate('/equipment')}
              className="bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 p-4 rounded-xl hover:shadow-md dark:hover:bg-green-500/25 transition-all flex flex-col items-center gap-2 border border-transparent dark:border-green-500/20"
            >
              <Package className="w-6 h-6" />
              <span className="font-medium text-sm">Equipment</span>
              <span className="text-xl font-bold">{equipment.length}</span>
            </button>
            <button
              onClick={() => navigate('/requests/new?type=MAINTENANCE')}
              className="bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 p-4 rounded-xl hover:shadow-md dark:hover:bg-purple-500/25 transition-all flex flex-col items-center gap-2 border border-transparent dark:border-purple-500/20"
            >
              <Wrench className="w-6 h-6" />
              <span className="font-medium text-sm">Maintenance</span>
              <span className="text-xl font-bold">{stats.maintenanceDue}</span>
            </button>
          </div>
        </div>

        {/* Pending Approvals List */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4 text-orange-500" />
              Requests Awaiting Approval
            </CardTitle>
            <button
              onClick={() => navigate('/requests/dept')}
              className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-0">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-text-muted dark:text-dark-muted text-sm">All caught up! No pending approvals.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    onClick={() => navigate(`/requests/${request.id}`)}
                    className="p-3 bg-gray-50 dark:bg-dark-card rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border border-l-4 border-orange-400"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-text-primary dark:text-dark-text truncate">{request.type || request.request_type} Request</p>
                        <p className="text-xs text-text-secondary dark:text-dark-muted truncate">
                          From: {request.requester_name || 'Unknown'}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded shrink-0 ${
                        request.priority === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400' :
                        request.priority === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'
                      }`}>
                        {request.priority || 'Medium'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Own Requests Section */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="w-4 h-4 text-primary-500" />
              My Requests
            </CardTitle>
            <button
              onClick={() => navigate('/requests/my')}
              className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-0">
            {myRequests.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-text-muted dark:text-dark-muted text-sm">You haven't made any requests yet.</p>
                <button 
                  onClick={() => navigate('/requests/new')}
                  className="mt-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm"
                >
                  Create Request
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {myRequests.slice(0, 3).map((request) => (
                  <div 
                    key={request.id}
                    onClick={() => navigate(`/requests/${request.id}`)}
                    className="p-3 bg-gray-50 dark:bg-dark-card rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border"
                  >
                    <p className="font-medium text-sm text-text-primary dark:text-dark-text">{request.type || request.request_type}</p>
                    <p className="text-xs text-text-secondary dark:text-dark-muted">{request.status}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default ManagerDashboard;
