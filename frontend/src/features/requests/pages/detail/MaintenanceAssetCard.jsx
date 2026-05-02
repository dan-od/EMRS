import { useState, useEffect } from 'react';
import { Wrench, Truck, Settings, Loader2 } from 'lucide-react';
import { api } from '@/services/api';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Vehicle': return Truck;
    case 'Other': return Settings;
    default: return Wrench;
  }
};

export const MaintenanceAssetCard = ({ details, category }) => {
  const [assetName, setAssetName] = useState(null);
  const [assetInfo, setAssetInfo] = useState(null);
  const [loadingAsset, setLoadingAsset] = useState(false);
  const CategoryIcon = getCategoryIcon(category);

  useEffect(() => {
    const fetchAssetName = async () => {
      const { equipmentId, vehicleId } = details;
      if (!equipmentId && !vehicleId) return;
      setLoadingAsset(true);
      try {
        if (equipmentId && category === 'Equipment') {
          const res = await api.get(`/equipment/${equipmentId}`);
          const eq = res.data?.data || res.data;
          if (eq) {
            setAssetName(eq.name);
            setAssetInfo({ serialNumber: eq.serial_number || eq.serialNumber, status: eq.status, location: eq.location });
          }
        } else if (vehicleId && category === 'Vehicle') {
          const res = await api.get(`/vehicles/${vehicleId}`);
          const v = res.data?.data || res.data;
          if (v) {
            setAssetName(v.name || `${v.make} ${v.model}`);
            setAssetInfo({ plateNumber: v.plate_number || v.plateNumber, status: v.status });
          }
        }
      } catch (error) {
        console.error('Failed to fetch asset:', error);
        setAssetName('Unknown');
      } finally {
        setLoadingAsset(false);
      }
    };
    fetchAssetName();
  }, [details.equipmentId, details.vehicleId, category]);

  if (!details.equipmentId && !details.vehicleId) return null;

  return (
    <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/30">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex-shrink-0">
          <CategoryIcon className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {category === 'Vehicle' ? 'Vehicle' : 'Equipment'}
          </p>
          {loadingAsset ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : (
            <>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {assetName || 'Unknown Asset'}
              </p>
              {assetInfo && (
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {assetInfo.serialNumber && <span>S/N: {assetInfo.serialNumber}</span>}
                  {assetInfo.plateNumber && <span>Plate: {assetInfo.plateNumber}</span>}
                  {assetInfo.status && (
                    <span className={`px-1.5 py-0.5 rounded ${
                      assetInfo.status === 'Available'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                    }`}>{assetInfo.status}</span>
                  )}
                  {assetInfo.location && <span>Location: {assetInfo.location}</span>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
