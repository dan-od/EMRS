/**
 * VendorRecommendation - Optional vendor recommendation for external service
 */
import { Building2 } from 'lucide-react';

const VendorRecommendation = ({ value = {}, onChange, vendors = [] }) => {
  // Ensure vendors is an array
  const vendorList = Array.isArray(vendors) ? vendors : [];

  const handleChange = (field) => (e) => {
    onChange({ ...value, [field]: e.target.value });
  };

  const handleVendorSelect = (e) => {
    const vendorId = e.target.value;
    if (!vendorId) {
      onChange({ ...value, vendorId: '', vendorName: '' });
      return;
    }

    const vendor = vendorList.find(v => v.id === vendorId);
    onChange({
      ...value,
      vendorId: vendor?.id || '',
      vendorName: vendor?.name || ''
    });
  };

  return (
    <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl">
      <label className="block text-sm font-medium text-blue-800 dark:text-blue-300">
        <Building2 className="w-4 h-4 inline mr-1" />
        Vendor Recommendation (Optional)
      </label>
      
      <p className="text-xs text-blue-600 dark:text-blue-400">
        Recommend a vendor for external service. Manager and Purchasing can modify.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Vendor Select */}
        {vendorList.length > 0 ? (
          <div>
            <label className="block text-xs text-blue-700 dark:text-blue-400 mb-1">
              Select Known Vendor
            </label>
            <select
              value={value.vendorId || ''}
              onChange={handleVendorSelect}
              className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-500/30 rounded-lg bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white"
            >
              <option value="">Select vendor...</option>
              {vendorList.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs text-blue-700 dark:text-blue-400 mb-1">
              Vendor Name
            </label>
            <input
              type="text"
              value={value.vendorName || ''}
              onChange={handleChange('vendorName')}
              placeholder="Enter vendor name"
              className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-500/30 rounded-lg bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        )}

        {/* Contact Info */}
        <div>
          <label className="block text-xs text-blue-700 dark:text-blue-400 mb-1">
            Contact / Phone (Optional)
          </label>
          <input
            type="text"
            value={value.contact || ''}
            onChange={handleChange('contact')}
            placeholder="Contact info"
            className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-500/30 rounded-lg bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs text-blue-700 dark:text-blue-400 mb-1">
          Notes / Reason for Recommendation
        </label>
        <textarea
          value={value.notes || ''}
          onChange={handleChange('notes')}
          placeholder="e.g., They fixed this issue before, good pricing, etc."
          rows={2}
          className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-500/30 rounded-lg bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white placeholder-gray-400 resize-none"
        />
      </div>
    </div>
  );
};

export default VendorRecommendation;
