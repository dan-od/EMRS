import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common';
import { useApi } from '@/hooks/useApi';
import { REQUESTS, EQUIPMENT, USERS, SAFETY } from '@/services/endpoints';
import { StatCard } from '../components/StatCard';
import { 
  Users, Package, ClipboardList, Shield, AlertTriangle,
  Clock, CheckCircle, Settings, Plus, ArrowRight, TrendingUp
} from 'lucide-react';

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  
  // Fetch all relevant data — limit=100 to respect pagination guard
  const { data: usersData } = useApi(`${USERS.BASE}?limit=100`);
  const { data: equipmentData } = useApi(`${EQUIPMENT.BASE}?limit=100`);
  const { data: requestsData } = useApi(REQUESTS.PENDING);
  const { data: safetyData } = useApi(SAFETY.BASE);

  // Extract arrays safely
  const users = Array.isArray(usersData) ? usersData : (usersData?.data || usersData?.users || []);
  const equipment = Array.isArray(equipmentData) ? equipmentData : (equipmentData?.data || equipmentData?.equipment || []);
  const pendingRequests = Array.isArray(requestsData) ? requestsData : (requestsData?.data || requestsData?.requests || []);
  const safetyReports = Array.isArray(safetyData) ? safetyData : (safetyData?.data || safetyData?.reports || []);

  // Use server total if paginated, else derive from array
  const totalUsers = usersData?.pagination?.total ?? users.length;
  const totalEquipment = equipmentData?.pagination?.total ?? equipment.length;

  // Calculate stats
  const stats = {
    totalUsers,
    activeUsers: users.filter(u => u.is_active).length,
    totalEquipment,
    availableEquipment: equipment.filter(e => e.status === 'Available').length,
    pendingRequests: pendingRequests.length,
    openSafetyReports: safetyReports.filter(s => s.status === 'Open').length,
    criticalAlerts: safetyReports.filter(s => s.severity === 'Critical' && s.status !== 'Resolved').length
  };

  const displayName = user?.firstName || user?.first_name || 'System';

  // Quick action cards for admin
  const adminActions = [
    { label: 'Manage Users', icon: Users, path: '/users', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', count: stats.totalUsers },
    { label: 'Equipment', icon: Package, path: '/equipment', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400', count: stats.totalEquipment },
    { label: 'Pending Approvals', icon: Clock, path: '/requests?status=Pending', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400', count: stats.pendingRequests },
    { label: 'Safety Reports', icon: Shield, path: '/safety', color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400', count: stats.openSafetyReports }
  ];

  return (
    <PageWrapper title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text">
              Welcome back, {displayName}! 👋
            </h2>
            <p className="text-text-secondary dark:text-dark-muted">
              System Administrator Dashboard - Full access to all EMRS modules
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/users/new')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card dark:text-dark-text"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Stats Grid - 4 columns on large screens */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="primary" subtitle={`${stats.activeUsers} active`} />
          <StatCard title="Equipment" value={stats.totalEquipment} icon={Package} color="info" subtitle={`${stats.availableEquipment} available`} />
          <StatCard title="Pending Requests" value={stats.pendingRequests} icon={ClipboardList} color="warning" />
          <StatCard title="Safety Reports" value={stats.openSafetyReports} icon={Shield} color={stats.criticalAlerts > 0 ? 'error' : 'success'} />
        </div>

        {/* Alert Banner for Critical Items */}
        {(stats.criticalAlerts > 0 || stats.pendingRequests > 5) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-800 dark:text-red-300">Attention Required</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                {stats.criticalAlerts > 0 && `${stats.criticalAlerts} critical safety report(s). `}
                {stats.pendingRequests > 5 && `${stats.pendingRequests} requests awaiting approval.`}
              </p>
            </div>
            <button 
              onClick={() => navigate(stats.criticalAlerts > 0 ? '/safety' : '/requests/dept')}
              className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              View Now
            </button>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-dark-text">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {adminActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`${action.color} p-4 rounded-xl hover:shadow-md transition-all flex flex-col items-center gap-2`}
              >
                <action.icon className="w-8 h-8" />
                <span className="font-medium">{action.label}</span>
                {action.count !== undefined && (
                  <span className="text-2xl font-bold">{action.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout for Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Pending Approvals
              </CardTitle>
              <button 
                onClick={() => navigate('/requests?status=Pending')}
                className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-text-muted text-center py-4">No pending approvals</p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.slice(0, 5).map((request) => (
                    <div 
                      key={request.id}
                      onClick={() => navigate(`/requests/${request.id}`)}
                      className="p-3 bg-gray-50 dark:bg-dark-card rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-text-primary dark:text-dark-text">{request.type} Request</p>
                          <p className="text-sm text-text-secondary dark:text-dark-muted">{request.requester_name || 'Unknown'}</p>
                        </div>
                        <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                          {request.priority || 'Medium'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Safety Reports Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Safety Reports
              </CardTitle>
              <button 
                onClick={() => navigate('/safety')}
                className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent>
              {safetyReports.length === 0 ? (
                <p className="text-text-muted text-center py-4">No safety reports</p>
              ) : (
                <div className="space-y-3">
                  {safetyReports.slice(0, 5).map((report) => (
                    <div 
                      key={report.id}
                      onClick={() => navigate(`/safety/${report.id}`)}
                      className="p-3 bg-gray-50 dark:bg-dark-card rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-text-primary dark:text-dark-text">{report.title || report.type}</p>
                          <p className="text-sm text-text-secondary dark:text-dark-muted">{report.location || 'No location'}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          report.severity === 'Critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                          report.severity === 'High' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        }`}>
                          {report.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{users.filter(u => u.is_active).length}</p>
                <p className="text-sm text-blue-800 dark:text-blue-300">Active Users</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{equipment.filter(e => e.status === 'Available').length}</p>
                <p className="text-sm text-green-800 dark:text-green-300">Available Equipment</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{equipment.filter(e => e.status === 'In_Use').length}</p>
                <p className="text-sm text-orange-800 dark:text-orange-300">Equipment In Use</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{equipment.filter(e => e.status === 'Maintenance').length}</p>
                <p className="text-sm text-red-800 dark:text-red-300">Under Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default AdminDashboard;
