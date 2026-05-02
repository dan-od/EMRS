import { WifiOff } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';

export const OfflineBanner = () => {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-yellow-500 text-white py-2 px-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">
          You are offline. Some features may be unavailable.
        </span>
      </div>
    </div>
  );
};
