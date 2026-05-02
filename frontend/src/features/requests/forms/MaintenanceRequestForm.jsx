/**
 * MaintenanceRequestForm - Enhanced form for maintenance/repair requests
 * Includes: Service Type (REQUIRED), Materials, Tools, Vendor Recommendation
 */
import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { api } from '@/services/api';
import {
  CategorySelector,
  EquipmentSelector,
  VehicleSelector,
  OtherCategoryFields,
  IssueDetailsFields,
  ServiceTypeSelector,
  MaterialsSection,
  ToolsSection,
  VendorRecommendation,
  MAINTENANCE_CATEGORIES,
  INITIAL_FORM_DATA
} from './maintenance';

const MaintenanceRequestForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [equipment, setEquipment] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Fetch equipment, vehicles, and vendors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipRes, vehicleRes, vendorRes] = await Promise.all([
          api.get('/equipment').catch(() => ({ data: { equipment: [] } })),
          api.get('/vehicles').catch(() => ({ data: { vehicles: [] } })),
          api.get('/vendors').catch(() => ({ data: { vendors: [] } }))
        ]);
        
        const extractArray = (res, key) => {
          const data = res.data;
          if (Array.isArray(data)) return data;
          if (data?.[key] && Array.isArray(data[key])) return data[key];
          if (data?.data && Array.isArray(data.data)) return data.data;
          return [];
        };
        
        setEquipment(extractArray(equipRes, 'equipment'));
        setVehicles(extractArray(vehicleRes, 'vehicles'));
        setVendors(extractArray(vendorRes, 'vendors'));
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      maintenanceCategory: categoryId,
      equipmentId: '',
      vehicleId: '',
      otherCategory: '',
      otherDescription: '',
      serviceType: ''
    }));
    if (errors.maintenanceCategory) setErrors(prev => ({ ...prev, maintenanceCategory: null }));
  };

  const handleServiceTypeChange = (serviceType) => {
    setFormData(prev => ({ ...prev, serviceType }));
    if (errors.serviceType) setErrors(prev => ({ ...prev, serviceType: null }));
  };

  const handleMaterialsChange = (materials) => {
    setFormData(prev => ({ ...prev, materials }));
  };

  const handleToolsChange = (tools) => {
    setFormData(prev => ({ ...prev, tools }));
  };

  const handleVendorChange = (vendorRecommendation) => {
    setFormData(prev => ({ ...prev, vendorRecommendation }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.maintenanceCategory) newErrors.maintenanceCategory = 'Select a maintenance category';
    if (formData.maintenanceCategory === 'Equipment' && !formData.equipmentId) newErrors.equipmentId = 'Select the equipment';
    if (formData.maintenanceCategory === 'Vehicle' && !formData.vehicleId) newErrors.vehicleId = 'Select the vehicle';
    
    if (formData.maintenanceCategory === 'Other') {
      if (!formData.otherCategory) newErrors.otherCategory = 'Select a category';
      if (formData.otherCategory === 'Other (specify below)' && !formData.otherDescription.trim()) {
        newErrors.otherDescription = 'Please specify the issue type';
      }
      if (!formData.location.trim()) newErrors.location = 'Location is required for facility issues';
    }
    
    if (!formData.issueDescription.trim()) newErrors.issueDescription = 'Issue description is required';
    
    // Service type REQUIRED for Equipment and Vehicle
    if (['Equipment', 'Vehicle'].includes(formData.maintenanceCategory) && !formData.serviceType) {
      newErrors.serviceType = 'You must select a service type (In-House, External, or Mixed)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    if (validate()) {
      const category = MAINTENANCE_CATEGORIES.find(c => c.id === formData.maintenanceCategory);
      
      const payload = {
        type: 'Maintenance',
        priority: formData.priority,
        maintenanceCategory: formData.maintenanceCategory,
        maintenanceRoutesTo: category?.routesTo || 'Purchasing',
        maintenanceOtherDescription: formData.maintenanceCategory === 'Other' 
          ? `${formData.otherCategory}${formData.otherDescription ? `: ${formData.otherDescription}` : ''}`
          : null,
        details: {
          category: formData.maintenanceCategory,
          routesTo: category?.routesTo,
          equipmentId: formData.maintenanceCategory === 'Equipment' ? formData.equipmentId : null,
          vehicleId: formData.maintenanceCategory === 'Vehicle' ? formData.vehicleId : null,
          otherCategory: formData.maintenanceCategory === 'Other' ? formData.otherCategory : null,
          otherDescription: formData.otherDescription || null,
          location: formData.location || null,
          issueDescription: formData.issueDescription,
          severity: formData.severity,
          serviceType: formData.serviceType || null,
          materials: formData.materials?.length > 0 ? formData.materials : null,
          tools: formData.tools?.length > 0 ? formData.tools : null,
          vendorRecommendation: Object.keys(formData.vendorRecommendation || {}).length > 0 
            ? formData.vendorRecommendation 
            : null
        },
        dateNeeded: formData.dateNeeded ? new Date(formData.dateNeeded).toISOString() : undefined
      };
      
      onSubmit(payload);
    } else {
      const firstErrorField = document.querySelector('.text-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const showServiceOptions = ['Equipment', 'Vehicle'].includes(formData.maintenanceCategory);
  const showMaterialsTools = showServiceOptions && formData.serviceType && ['In-House', 'Mixed'].includes(formData.serviceType);
  const showVendor = showServiceOptions && formData.serviceType && ['External', 'Mixed'].includes(formData.serviceType);
  const canSubmit = formData.maintenanceCategory && 
    formData.issueDescription.trim() && 
    (!showServiceOptions || formData.serviceType);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CategorySelector 
        selectedCategory={formData.maintenanceCategory}
        onSelect={handleCategorySelect}
        error={errors.maintenanceCategory}
      />

      {formData.maintenanceCategory === 'Equipment' && (
        <EquipmentSelector
          value={formData.equipmentId}
          onChange={handleChange}
          equipment={equipment}
          isLoading={loadingData}
          error={errors.equipmentId}
        />
      )}

      {formData.maintenanceCategory === 'Vehicle' && (
        <VehicleSelector
          value={formData.vehicleId}
          onChange={handleChange}
          vehicles={vehicles}
          isLoading={loadingData}
          error={errors.vehicleId}
        />
      )}

      {formData.maintenanceCategory === 'Other' && (
        <OtherCategoryFields
          formData={formData}
          onChange={handleChange}
          errors={errors}
        />
      )}

      {formData.maintenanceCategory && (
        <IssueDetailsFields
          formData={formData}
          onChange={handleChange}
          errors={errors}
        />
      )}

      {showServiceOptions && (
        <>
          <ServiceTypeSelector
            value={formData.serviceType}
            onChange={handleServiceTypeChange}
            error={errors.serviceType}
          />
          
          {submitAttempted && !formData.serviceType && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg -mt-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                Please select how this maintenance should be handled before submitting
              </p>
            </div>
          )}
        </>
      )}

      {showMaterialsTools && (
        <div className="space-y-4 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
            In-House Resources Needed (Optional)
          </h3>
          
          <MaterialsSection
            materials={formData.materials}
            onChange={handleMaterialsChange}
          />
          
          <ToolsSection
            tools={formData.tools}
            onChange={handleToolsChange}
            equipment={equipment}
          />
        </div>
      )}

      {showVendor && (
        <VendorRecommendation
          value={formData.vendorRecommendation}
          onChange={handleVendorChange}
          vendors={vendors}
        />
      )}

      <button
        type="submit"
        disabled={isLoading || !formData.maintenanceCategory}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
          canSubmit
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        } disabled:opacity-50`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Maintenance Request'
        )}
      </button>
      
      {showServiceOptions && !formData.serviceType && (
        <p className="text-center text-sm text-amber-600 dark:text-amber-400">
          ⚠️ Select a service type above to continue
        </p>
      )}
    </form>
  );
};

export default MaintenanceRequestForm;
