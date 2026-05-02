import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Button } from '@/components/common';
import { PageLoader, EmptyState } from '@/components/feedback';
import { SafetyReportCard, SafetyFilters, SafetyStatCard } from '../components';
import { useSafetyReports, useMySafetyReports, useSafetyStats } from '../hooks/useSafety';
import { useAuthStore } from '@/store/authStore';
import { useDebounce } from '@/hooks/useDebounce';
import { Plus, AlertTriangle, AlertCircle, ShieldAlert, CheckCircle } from 'lucide-react';

// Roles that can see ALL safety reports
const SAFETY_ADMIN_ROLES = ['Admin', 'Super_Admin', 'Safety_Officer', 'Operations_Manager'];

const SafetyHub = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [filters, setFilters] = useState({});
  const debouncedFilters = useDebounce(filters, 300);
  
  // Check if user has safety admin access
  const hasSafetyAccess = useMemo(() => 
    SAFETY_ADMIN_ROLES.includes(user?.role), [user?.role]
  );
  
  // Use appropriate endpoint based on role
  const { reports: allReports, isLoading: loadingAll } = useSafetyReports(
    hasSafetyAccess ? debouncedFilters : null
  );
  const { reports: myReports, isLoading: loadingMy } = useMySafetyReports();
  const { stats } = useSafetyStats(hasSafetyAccess);  // Only fetch stats for safety roles
  
  // Show all reports for safety admins, own reports for others
  const reports = hasSafetyAccess ? allReports : myReports;
  const isLoading = hasSafetyAccess ? loadingAll : loadingMy;

  if (isLoading) return <PageLoader />;

  return (
    <PageWrapper 
      title="Safety Reports"
      actions={
        <Button variant="danger" onClick={() => navigate('/safety/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      }
    >
      {/* Stats for Safety/Admin roles */}
      {hasSafetyAccess && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SafetyStatCard
            title="Open Reports"
            value={stats.open_count || 0}
            icon={AlertTriangle}
            color="warning"
          />
          <SafetyStatCard
            title="This Month"
            value={stats.last_30_days || 0}
            icon={AlertCircle}
            color="info"
          />
          <SafetyStatCard
            title="Critical"
            value={stats.critical_count || 0}
            icon={ShieldAlert}
            color="error"
          />
          <SafetyStatCard
            title="Resolved"
            value={stats.resolved_count || 0}
            icon={CheckCircle}
            color="success"
          />
        </div>
      )}

      {/* Only show filters for safety admins */}
      {hasSafetyAccess && <SafetyFilters filters={filters} onChange={setFilters} />}
      
      {/* Role indicator for non-safety users */}
      {!hasSafetyAccess && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Showing your submitted reports. All reports are reviewed by the Safety Department.
          </p>
        </div>
      )}
      
      {reports.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title={hasSafetyAccess ? "No safety reports" : "No reports submitted"}
          description={hasSafetyAccess 
            ? "No reports match your current filters" 
            : "You haven't submitted any safety reports yet. Use the button above to report an incident, hazard, or near miss."
          }
        />
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <SafetyReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default SafetyHub;
