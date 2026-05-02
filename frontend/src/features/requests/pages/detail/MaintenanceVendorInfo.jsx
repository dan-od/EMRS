import { Building2 } from 'lucide-react';

const DetailRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

const hasVendorData = (rec) =>
  rec && Object.keys(rec).length > 0 && rec.vendorName;

export const MaintenanceVendorInfo = ({ vendorRecommendation, managerVendorRecommendation }) => {
  const showRequester = hasVendorData(vendorRecommendation);
  const showManager = hasVendorData(managerVendorRecommendation);

  if (!showRequester && !showManager) return null;

  return (
    <>
      {showRequester && (
        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/30">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Vendor Recommendation (by Requester)
          </h4>
          <div className="space-y-2">
            <DetailRow label="Vendor" value={vendorRecommendation.vendorName} />
            {vendorRecommendation.contact && <DetailRow label="Contact" value={vendorRecommendation.contact} />}
            {vendorRecommendation.notes && <DetailRow label="Notes" value={vendorRecommendation.notes} />}
          </div>
        </div>
      )}
      {showManager && (
        <div className="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/30">
          <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Vendor Recommendation (by Manager)
          </h4>
          <div className="space-y-2">
            <DetailRow label="Vendor" value={managerVendorRecommendation.vendorName} />
            {managerVendorRecommendation.contact && <DetailRow label="Contact" value={managerVendorRecommendation.contact} />}
            {managerVendorRecommendation.notes && <DetailRow label="Notes" value={managerVendorRecommendation.notes} />}
          </div>
        </div>
      )}
    </>
  );
};
