/**
 * ManagerVendorSection - Vendor recommendation for manager approval
 */
import { Building2 } from 'lucide-react';

const ManagerVendorSection = ({ 
  engineerVendor, 
  vendorRecommendation, 
  setVendorRecommendation,
  vendors = []
}) => {
  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/30">
      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        Vendor Recommendation
      </h4>
      
      {/* Engineer's recommendation */}
      {engineerVendor?.vendorName && (
        <div className="mb-3 p-2 bg-white dark:bg-gray-800 rounded-lg text-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Engineer recommended:</p>
          <p className="font-medium text-gray-900 dark:text-white">{engineerVendor.vendorName}</p>
          {engineerVendor.contact && (
            <p className="text-gray-500 dark:text-gray-400 text-xs">Contact: {engineerVendor.contact}</p>
          )}
          {engineerVendor.notes && (
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{engineerVendor.notes}</p>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-xs text-blue-700 dark:text-blue-400 mb-1 block">
            Your Vendor Recommendation
          </label>
          {vendors.length > 0 ? (
            <select
              value={vendorRecommendation.vendorId || ''}
              onChange={(e) => {
                const vendor = vendors.find(v => v.id === e.target.value);
                setVendorRecommendation({
                  ...vendorRecommendation,
                  vendorId: vendor?.id || '',
                  vendorName: vendor?.name || e.target.value
                });
              }}
              className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-500/30 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Select or keep engineer's recommendation...</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Vendor name"
              value={vendorRecommendation.vendorName || ''}
              onChange={(e) => setVendorRecommendation({ ...vendorRecommendation, vendorName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-500/30 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          )}
        </div>
        <input
          type="text"
          placeholder="Contact / Phone (optional)"
          value={vendorRecommendation.contact || ''}
          onChange={(e) => setVendorRecommendation({ ...vendorRecommendation, contact: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-500/30 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <textarea
          placeholder="Notes (optional)"
          value={vendorRecommendation.notes || ''}
          onChange={(e) => setVendorRecommendation({ ...vendorRecommendation, notes: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-500/30 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
        />
      </div>
    </div>
  );
};

export default ManagerVendorSection;
