/**
 * Safety Dashboard
 * Landing page for Safety_Officer and Safety_Manager roles
 */

import { Link } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { useApi } from '@/hooks/useApi';
import { REQUESTS, SAFETY } from '@/services/endpoints';
import { StatCard } from '../components/StatCard';
import {
  AlertTriangle, ClipboardList, Shield, FileText,
  ArrowRight, CheckCircle, Clock, Plus
} from 'lucide-react';

const SafetyDashboard = ({ user }) => {
  const { data: safetyData } = useApi(SAFETY.BASE);
  const { data: myRequestsData } = useApi(REQUESTS.MY_REQUESTS);

  const reports = Array.isArray(safetyData) ? safetyData : (safetyData?.data || []);
  const myRequests = Array.isArray(myRequestsData) ? myRequestsData : (myRequestsData?.data || []);
  const displayName = user?.firstName || user?.first_name || 'Safety';
  const isManager = user?.role?.includes('Manager');

  const openReports = reports.filter(r => !['Resolved', 'Closed'].includes(r.status));
  const criticalReports = reports.filter(r => r.severity === 'Critical' || r.severity === 'High');

  return (
    <PageWrapper title="Dashboard">
      <div className="space-y-5">
        <WelcomeSection name={displayName} isManager={isManager} />
        <StatsRow
          total={reports.length}
          open={openReports.length}
          critical={criticalReports.length}
          myPending={myRequests.filter(r => r.status === 'Pending').length}
        />
        {criticalReports.length > 0 && <CriticalAlert count={criticalReports.length} />}
        <QuickActions />
        <RecentReports reports={openReports.slice(0, 5)} />
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
      {isManager ? 'Safety oversight and compliance management' : 'Safety monitoring and incident reporting'}
    </p>
  </div>
);

const StatsRow = ({ total, open, critical, myPending }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    <StatCard title="Total Reports" value={total} icon={Shield} color="primary" />
    <StatCard title="Open Issues" value={open} icon={Clock} color="warning" />
    <StatCard title="Critical/High" value={critical} icon={AlertTriangle} color="error" />
    <StatCard title="My Requests" value={myPending} icon={ClipboardList} color="info" />
  </div>
);

const CriticalAlert = ({ count }) => (
  <div className="bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
    <div className="flex-1">
      <p className="font-medium text-red-800 dark:text-red-300 text-sm">Critical Attention Required</p>
      <p className="text-xs text-red-600 dark:text-red-400">{count} report(s) with Critical or High severity need review</p>
    </div>
    <Link to="/safety" className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 shrink-0">
      Review Now
    </Link>
  </div>
);

const QuickActions = () => (
  <div>
    <h3 className="text-base font-semibold mb-3 text-text-primary dark:text-dark-text">Quick Actions</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <ActionCard to="/safety" icon={Shield} label="All Reports" color="blue" />
      <ActionCard to="/safety/new" icon={Plus} label="New Report" color="red" />
      <ActionCard to="/equipment" icon={CheckCircle} label="Equipment" color="green" />
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

const RecentReports = ({ reports }) => (
  <div className="bg-white dark:bg-dark-surface/80 rounded-xl p-4 border border-gray-100 dark:border-white/10">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
      <h3 className="text-base font-semibold text-text-primary dark:text-dark-text flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-orange-500" /> Open Safety Reports
      </h3>
      <Link to="/safety" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
        View All <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
    {reports.length === 0 ? (
      <div className="text-center py-4">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
        <p className="text-sm text-text-muted dark:text-dark-muted">No open safety reports</p>
      </div>
    ) : (
      <div className="space-y-2">
        {reports.map(r => (
          <Link key={r.id} to={`/safety/${r.id}`} className="block p-3 bg-gray-50 dark:bg-dark-card rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-dark-text">{r.title || r.type}</p>
                <p className="text-xs text-text-muted dark:text-dark-muted">{r.location || 'No location'}</p>
              </div>
              <SeverityBadge severity={r.severity} />
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
);

const SeverityBadge = ({ severity }) => {
  const styles = {
    Critical: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
    High: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
    Low: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded ${styles[severity] || styles.Medium}`}>{severity}</span>
  );
};

export default SafetyDashboard;
