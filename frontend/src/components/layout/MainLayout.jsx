import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { OfflineBanner, ContentLoader, ErrorBoundary } from '@/components/feedback';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/utils/helpers';

export const MainLayout = () => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <Sidebar />
      <div className={cn(
        'transition-all duration-300 ease-out min-h-screen pb-6 sm:pb-0',
        sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-60'
      )}>
        <ErrorBoundary>
          <Suspense fallback={<ContentLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>
      <OfflineBanner />
      <ConfirmDialog />
    </div>
  );
};
