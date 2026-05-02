/**
 * VendorConfirmSection - Displays vendor recommendations and allows selection
 * Shows engineer's recommendation, manager's recommendation, and vendor list
 */
import { useState, useEffect } from 'react';
import { Building2, Check, Phone, FileText, Search } from 'lucide-react';
import { api } from '@/services/api';

const VendorCard = ({ vendor, selected, onSelect, label }) => {
  if (!vendor) return null;
  
  return (
    <div 
      onClick={() => onSelect(vendor)}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        selected 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' 
          : 'border-gray-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-500/50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {selected && <Check className="w-4 h-4 text-primary-500" />}
          <span className="font-medium text-gray-900 dark:text-white">
            {vendor.vendorName || vendor.name}
          </span>
        </div>
        {label && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            label === 'Engineer' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
          }`}>
            {label} Recommended
          </span>
        )}
      </div>
      {vendor.contact && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Phone className="w-3 h-3" />
          <span>{vendor.contact}</span>
        </div>
      )}
      {vendor.notes && (
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
          <FileText className="w-3 h-3 mt-0.5" />
          <span className="line-clamp-2">{vendor.notes}</span>
        </div>
      )}
    </div>
  );
};

const VendorConfirmSection = ({ request, selectedVendor, onVendorSelect }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllVendors, setShowAllVendors] = useState(false);
  const details = request?.details || {};

  const engineerVendor = details.vendorRecommendation;
  const managerVendor = details.managerVendorRecommendation;

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await api.get('/vendors');
        const data = res.data;
        setVendors(Array.isArray(data) ? data : data.data || data.vendors || []);
      } catch (err) {
        console.error('Failed to fetch vendors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(v => 
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
        <Building2 className="w-5 h-5 text-emerald-500" />
        Vendor Selection
      </h3>

      {/* Recommendations */}
      {(engineerVendor || managerVendor) && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">Recommendations:</p>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {engineerVendor && (
              <VendorCard 
                vendor={engineerVendor} 
                selected={selectedVendor?.vendorName === engineerVendor.vendorName}
                onSelect={onVendorSelect}
                label="Engineer"
              />
            )}
            {managerVendor && (
              <VendorCard 
                vendor={managerVendor} 
                selected={selectedVendor?.vendorName === managerVendor.vendorName}
                onSelect={onVendorSelect}
                label="Manager"
              />
            )}
          </div>
        </div>
      )}

      {/* Choose Different Vendor */}
      <div>
        <button
          type="button"
          onClick={() => setShowAllVendors(!showAllVendors)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          {showAllVendors ? 'Hide vendor list' : 'Choose a different vendor'}
        </button>

        {showAllVendors && (
          <div className="mt-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>

            {loading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-white/10 rounded-lg" />)}
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredVendors.slice(0, 10).map(vendor => (
                  <button
                    key={vendor.id}
                    type="button"
                    onClick={() => onVendorSelect({ 
                      vendorId: vendor.id, 
                      vendorName: vendor.name,
                      contact: vendor.contact_phone,
                      notes: ''
                    })}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedVendor?.vendorId === vendor.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                        : 'border-gray-200 dark:border-white/10 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">{vendor.name}</span>
                      {selectedVendor?.vendorId === vendor.id && (
                        <Check className="w-4 h-4 text-primary-500" />
                      )}
                    </div>
                    {vendor.category && (
                      <span className="text-xs text-gray-500">{vendor.category}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Vendor Summary */}
      {selectedVendor && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              Selected: {selectedVendor.vendorName || selectedVendor.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorConfirmSection;
