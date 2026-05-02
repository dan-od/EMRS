/**
 * Accounts Home Dashboard
 * Landing page for Accounts_Manager and Accounts_Staff roles
 */

import { Link } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { useApi } from '@/hooks/useApi';
import { REQUESTS } from '@/services/endpoints';
import { StatCard } from '../components/StatCard';
import {
  BookOpen, ClipboardList, Package, FileText,
  ArrowRight, DollarSign, Wrench
} from 'lucide-react';

const ACCOUNTS_BASE = '/accounts';

const AccountsHomeDashboard = ({ user }) => {
  const { data: statsData } = useApi(`${ACCOUNTS_BASE}/stats`);
  const { data: myRequestsData } = useApi(REQUESTS.MY_REQUESTS);

  const stats = statsData?.data || statsData || {};
  const myRequests = Array.isArray(myRequestsData) ? myRequestsData : (myRequestsData?.data || []);
  const displayName = user?.firstName || user?.first_name || 'Accounts';
  const isManager = user?.role === 'Accounts_Manager';

  return (
    <PageWrapper title="Dashboard">
      <div className="space-y-5">
        <WelcomeSection name={displayName} isManager={isManager} />
        <StatsRow stats={stats} myPending={myRequests.filter(r => r.status === 'Pending').length} />
        <QuickActions isManager={isManager} />
        <RecentRequests requests={myRequests.slice(0, 3)} />
      </div>
    </PageWrapper>
  );
};

const WelcomeSection = ({ name, isManager }) => (
  <div>
    <h2 className="text-xl font-bold text-text-primary dark:text-dark-text">
      Welcome back, {name}!
    </h2>
    <p className="text-sm text-text-secondary dark:text-dark-muted">
      {isManager ? 'Cost oversight and payment management' : 'Work order tracking and payment records'}
    </p>
  </div>
);

const StatsRow = ({ stats, myPending }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    <StatCard title="Total Work Orders" value={stats.total_work_orders || 0} icon={Wrench} color="primary" />
    <StatCard title="Pending Payment" value={stats.pending_payments || 0} icon={DollarSign} color="warning" />
    <StatCard title="Total Cost" value={`₦${((stats.total_cost || 0) / 1000).toFixed(0)}k`} icon={BookOpen} color="info" />
    <StatCard title="My Requests" value={myPending} icon={ClipboardList} color="success" />
  </div>
);

const QuickActions = ({ isManager }) => (
  <div>
    <h3 className="text-base font-semibold mb-3 text-text-primary dark:text-dark-text">Quick Actions</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <ActionCard to="/accounts" icon={BookOpen} label="Asset Ledger" color="blue" />
      <ActionCard to="/equipment" icon={Package} label="Asset Register" color="green" />
      <ActionCard to="/maintenance" icon={Wrench} label="Work Orders" color="amber" />
      <ActionCard to="/requests/new" icon={FileText} label="New Request" color="purple" />
    </div>
  </div>
);

const ActionCard = ({ to, icon: Icon, label, color }) => (
  <Link
    to={to}
    className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-${color}-50 dark:bg-${color}-500/15 hover:shadow-md transition-all border border-transparent dark:border-${color}-500/20`}
  >
    <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
    <span className={`font-medium text-sm text-${color}-900 dark:text-${color}-300`}>{label}</span>
  </Link>
);

const RecentRequests = ({ requests }) => (
  <div className="bg-white dark:bg-dark-surface/80 rounded-xl p-4 border border-gray-100 dark:border-white/10">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
      <h3 className="text-base font-semibold text-text-primary dark:text-dark-text flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-primary-500" /> My Requests
      </h3>
      <Link to="/requests/my" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
        View All <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
    {requests.length === 0 ? (
      <p className="text-center py-4 text-sm text-text-muted dark:text-dark-muted">No requests yet</p>
    ) : (
      <div className="space-y-2">
        {requests.map(r => (
          <Link key={r.id} to={`/requests/${r.id}`} className="block p-3 bg-gray-50 dark:bg-dark-card rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-text-primary dark:text-dark-text">{r.type || r.request_type}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400">{r.status}</span>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
);

export default AccountsHomeDashboard;
