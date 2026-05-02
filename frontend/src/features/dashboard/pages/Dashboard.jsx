import { useAuthStore } from '@/store/authStore';
import { isAdmin, isManager, isITSupport, isStaff, isPurchasing, isAccounts, isSafetyOfficer } from '@/utils/helpers';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import EngineerDashboard from './EngineerDashboard';
import ITSupportDashboard from './ITSupportDashboard';
import StaffDashboard from './StaffDashboard';
import PurchasingDashboard from './PurchasingDashboard';
import AccountsHomeDashboard from './AccountsHomeDashboard';
import SafetyDashboard from './SafetyDashboard';

const Dashboard = () => {
  const user = useAuthStore(s => s.user);
  const role = user?.role;

  // Route to appropriate dashboard based on role
  if (isAdmin(role)) return <AdminDashboard user={user} />;
  if (isITSupport(role)) return <ITSupportDashboard user={user} />;
  if (isPurchasing(role)) return <PurchasingDashboard user={user} />;
  if (isAccounts(role)) return <AccountsHomeDashboard user={user} />;
  if (isSafetyOfficer(role)) return <SafetyDashboard user={user} />;
  if (isManager(role)) return <ManagerDashboard user={user} />;
  if (isStaff(role)) return <StaffDashboard user={user} />;

  // Default to engineer dashboard (Field_Engineer)
  return <EngineerDashboard user={user} />;
};

export default Dashboard;
