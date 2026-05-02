import { useState } from 'react';
import { PageWrapper } from '@/components/layout';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import {
  AppearanceSection,
  ProfileSection,
  NotificationsSection,
  SecuritySection,
  MobileAppSection
} from '../components/settings';

const Settings = () => {
  const user = useAuthStore(s => s.user);
  const { theme } = useUIStore();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    requestUpdates: true,
    safetyAlerts: true
  });

  return (
    <PageWrapper title="Settings">
      <div className="max-w-3xl mx-auto space-y-6">
        <ProfileSection user={user} />
        <AppearanceSection theme={theme} />
        <SecuritySection />
        <NotificationsSection notifications={notifications} setNotifications={setNotifications} />
        <MobileAppSection />
      </div>
    </PageWrapper>
  );
};

export default Settings;
