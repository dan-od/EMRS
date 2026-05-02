/**
 * IT Support Dashboard
 * Focus: User management, password resets, account support
 * No access to: Business data (equipment, requests, jobs)
 */

import { PageWrapper } from '@/components/layout';
import { useApi } from '@/hooks/useApi';
import { USERS } from '@/services/endpoints';
import { StatCard } from '../components/StatCard';
import { Link } from 'react-router-dom';
import { 
  Users, UserPlus, KeyRound, UserCheck, 
  AlertCircle, Search, Settings
} from 'lucide-react';

const ITSupportDashboard = ({ user }) => {
  const { data: usersData, isLoading } = useApi(USERS.BASE);
  
  const users = Array.isArray(usersData) ? usersData : (usersData?.data || usersData?.users || []);
  
  const displayName = user?.firstName || user?.first_name || user?.name?.split(' ')[0] || 'Support';

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active)?.length || 0,
    inactiveUsers: users.filter(u => !u.is_active)?.length || 0,
    recentlyCreated: users.filter(u => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(u.created_at) > weekAgo;
    })?.length || 0
  };

  return (
    <PageWrapper title="IT Support Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text">
            Welcome, {displayName}!
          </h2>
          <p className="text-text-secondary dark:text-dark-muted">
            User account management and support tools
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Active Accounts"
            value={stats.activeUsers}
            icon={UserCheck}
            color="success"
          />
          <StatCard
            title="Inactive Accounts"
            value={stats.inactiveUsers}
            icon={AlertCircle}
            color="warning"
          />
          <StatCard
            title="New This Week"
            value={stats.recentlyCreated}
            icon={UserPlus}
            color="info"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/users"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Manage Users</span>
            </Link>
            <Link
              to="/users/new"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <UserPlus className="w-8 h-8 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-300">Create User</span>
            </Link>
            <Link
              to="/users?isActive=false"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <KeyRound className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-300">Inactive Users</span>
            </Link>
            <Link
              to="/activity"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Search className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-300">Activity Logs</span>
            </Link>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text">Recently Created Users</h3>
            <Link to="/users" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-dark-card rounded" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        {u.first_name?.[0]}{u.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary dark:text-dark-text">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-sm text-text-secondary dark:text-dark-muted">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.is_active ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    }`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <p className="text-xs text-text-secondary dark:text-dark-muted mt-1">{u.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Access Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-300">IT Support Access Level</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                You can create and manage non-admin user accounts and perform password resets.
                For security, you cannot access business data such as equipment, requests, or jobs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ITSupportDashboard;
