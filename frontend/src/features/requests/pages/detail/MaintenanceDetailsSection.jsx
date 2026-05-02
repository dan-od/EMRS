import { AlertTriangle, Home, Building2, Shuffle } from 'lucide-react';
import { MaintenanceAssetCard } from './MaintenanceAssetCard';
import { MaintenanceMaterialsList } from './MaintenanceMaterialsList';
import { MaintenanceToolsList } from './MaintenanceToolsList';
import { MaintenanceVendorInfo } from './MaintenanceVendorInfo';
import { MaintenanceNotesTimeline } from './MaintenanceNotesTimeline';
import { MaintenanceCostInfo } from './MaintenanceCostInfo';

const SERVICE_TYPE_CONFIG = {
  'In-House': { icon: Home, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/20', label: 'In-House (Our team)' },
  'External': { icon: Building2, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20', label: 'External (Vendor)' },
  'Mixed': { icon: Shuffle, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20', label: 'Mixed (Both)' }
};

const SEVERITY_CONFIG = {
  'Low': { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/20' },
  'Medium': { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-500/20' },
  'High': { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20' },
  'Critical': { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20' }
};

const MaintenanceDetailsSection = ({ request }) => {
  const details = request.details || {};
  const serviceType = details.serviceType;
  const serviceConfig = SERVICE_TYPE_CONFIG[serviceType] || {};
  const ServiceIcon = serviceConfig.icon || AlertTriangle;
  const severity = details.severity || 'Medium';
  const severityConfig = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Medium;
  const category = details.category || request.maintenance_category || 'Equipment';

  return (
    <div className="space-y-4">
      <MaintenanceAssetCard details={details} category={category} />

      {category === 'Other' && details.otherCategory && (
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Facility Issue</p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">{details.otherCategory}</p>
              {details.location && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Location: {details.location}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Issue Description</p>
            <p className="text-sm text-gray-900 dark:text-white">{details.issueDescription || 'No description provided'}</p>
            <div className="flex gap-4 mt-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Severity</p>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${severityConfig.bg} ${severityConfig.color}`}>
                  {severity}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {serviceType && (
        <div className={`p-3 sm:p-4 rounded-xl border ${serviceConfig.bg} border-gray-200 dark:border-dark-border`}>
          <div className="flex items-center gap-2 mb-2">
            <ServiceIcon className={`w-5 h-5 ${serviceConfig.color}`} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Service Type: {serviceConfig.label || serviceType}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {serviceType === 'In-House' && 'Our team will handle this repair'}
            {serviceType === 'External' && 'Will be sent to external vendor'}
            {serviceType === 'Mixed' && 'Combination of in-house and external work'}
          </p>
        </div>
      )}

      <MaintenanceMaterialsList
        materials={details.materials}
        managerMaterialAdditions={details.managerMaterialAdditions}
      />
      <MaintenanceToolsList
        tools={details.tools}
        managerToolAdditions={details.managerToolAdditions}
      />
      <MaintenanceVendorInfo
        vendorRecommendation={details.vendorRecommendation}
        managerVendorRecommendation={details.managerVendorRecommendation}
      />
      <MaintenanceCostInfo
        managerCostEstimate={request.manager_cost_estimate}
        costEstimate={details.costEstimate}
        purchasingFinalCost={request.purchasing_final_cost}
      />
      <MaintenanceNotesTimeline
        additionalNotes={details.additionalNotes}
        managerNotes={details.managerNotes}
        managerApproverName={details.managerApproverName}
        purchasingNotes={details.purchasingNotes}
        purchasingApproverName={details.purchasingApproverName}
      />
    </div>
  );
};

export default MaintenanceDetailsSection;
