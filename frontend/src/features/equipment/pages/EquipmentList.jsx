/**
 * Equipment List Page
 * Post-Phase 5: Tools vs Equipment with Category Tabs
 * 
 * ACTUAL DB ROLES: Super_Admin, Admin, Field_Engineer, IT_Support,
 * Operations_Manager, Purchasing_Manager, Accounts_Manager,
 * Safety_Manager, Maintenance_Manager,
 * Purchasing_Staff, Accounts_Staff, Safety_Officer, Staff
 */
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Button } from '@/components/common';
import { CardGridSkeleton, EmptyState } from '@/components/feedback';
import { EquipmentCard } from '../components/EquipmentCard';
import { EquipmentFilters } from '../components/EquipmentFilters';
import { CategoryTabs } from '../components/CategoryTabs';
import { MaintenanceAlert } from '../components/MaintenanceAlert';
import { useEquipment, useMaintenanceDue } from '../hooks/useEquipment';
import { useAuthStore } from '@/store/authStore';
import { Plus, Package, ClipboardList } from 'lucide-react';

// Roles that can add equipment directly (no approval needed)
const CAN_ADD_DIRECTLY = [
  'Super_Admin', 'Admin', 'IT_Support',
  'Operations_Manager', 'Purchasing_Manager', 'Accounts_Manager',
  'Safety_Manager', 'Maintenance_Manager',
  'Purchasing_Staff'
];

// Roles that can see costs
const CAN_VIEW_COSTS = [
  'Super_Admin', 'Admin', 'IT_Support',
  'Operations_Manager', 'Purchasing_Manager', 'Accounts_Manager',
  'Maintenance_Manager', 'Safety_Manager',
  'Purchasing_Staff', 'Accounts_Staff'
];

// Roles that can review equipment requests
const CAN_REVIEW_REQUESTS = [
  'Super_Admin', 'Admin', 'IT_Support',
  'Operations_Manager', 'Purchasing_Manager', 'Accounts_Manager',
  'Safety_Manager', 'Maintenance_Manager',
  'Purchasing_Staff'
];

const EquipmentList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore(s => s.user);
  
  const [category, setCategory] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '', type: '', department: '' });
  
  const showMaintenanceOnly = searchParams.get('maintenance') === 'due';
  
  // allEquipment is already department-filtered by backend
  const { equipmentList: allEquipment, isLoading } = useEquipment(filters);
  // maintenanceDue returns ALL items system-wide - needs filtering
  const { maintenanceDue } = useMaintenanceDue();

  const canAddDirectly = CAN_ADD_DIRECTLY.includes(user?.role);
  const showCosts = CAN_VIEW_COSTS.includes(user?.role);
  const canReviewRequests = CAN_REVIEW_REQUESTS.includes(user?.role);

  // FIX: Filter maintenance items to only what user can see
  // allEquipment is already dept-filtered by backend, so intersect
  const visibleMaintenanceDue = useMemo(() => {
    if (!maintenanceDue?.length || !allEquipment?.length) return [];
    const visibleIds = new Set(allEquipment.map(e => e.id));
    return maintenanceDue.filter(item => visibleIds.has(item.id));
  }, [maintenanceDue, allEquipment]);

  const counts = useMemo(() => {
    const equipment = allEquipment.filter(e => e.asset_category === 'EQUIPMENT').length;
    const tool = allEquipment.filter(e => e.asset_category === 'TOOL').length;
    return { total: allEquipment.length, equipment, tool };
  }, [allEquipment]);

  const categoryFiltered = useMemo(() => {
    if (!category) return allEquipment;
    return allEquipment.filter(e => e.asset_category === category);
  }, [allEquipment, category]);

  const displayList = useMemo(() => {
    if (!showMaintenanceOnly) return categoryFiltered;
    const dueIds = new Set(visibleMaintenanceDue.map(i => i.id));
    return categoryFiltered.filter(item => dueIds.has(item.id));
  }, [categoryFiltered, showMaintenanceOnly, visibleMaintenanceDue]);

  const clearFilters = () => {
    setFilters({ search: '', status: '', type: '', department: '' });
    if (showMaintenanceOnly) navigate('/equipment');
  };

  const handleAddClick = () => {
    navigate(canAddDirectly ? '/equipment/new' : '/equipment/request');
  };

  return (
    <PageWrapper 
      title={showMaintenanceOnly ? "Maintenance Due" : "Equipment"}
      subtitle={showMaintenanceOnly ? `${displayList.length} items need attention` : undefined}
      actions={
        <div className="flex flex-wrap gap-2">
          {canReviewRequests && (
            <Button variant="outline" onClick={() => navigate('/equipment/requests')} className="w-full sm:w-auto">
              <ClipboardList className="w-4 h-4 mr-2" />
              Requests
            </Button>
          )}
          <Button onClick={handleAddClick} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            {canAddDirectly ? 'Add Asset' : 'Request Asset'}
          </Button>
        </div>
      }
    >
      {/* Maintenance Alert - filtered to user's visible equipment only */}
      {!showMaintenanceOnly && visibleMaintenanceDue.length > 0 && (
        <div className="mb-4">
          <MaintenanceAlert equipment={visibleMaintenanceDue} />
        </div>
      )}

      {showMaintenanceOnly && (
        <button
          onClick={() => navigate('/equipment')}
          className="mb-4 text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
        >
          ← Back to all equipment
        </button>
      )}

      {!showMaintenanceOnly && (
        <CategoryTabs value={category} onChange={setCategory} counts={counts} />
      )}

      <EquipmentFilters 
        filters={filters} 
        onChange={setFilters} 
        onClear={clearFilters}
        assetCategory={category}
      />

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : displayList.length === 0 ? (
        <EmptyState
          icon={Package}
          title={showMaintenanceOnly ? "No maintenance due" : "No equipment found"}
          description={
            filters.search || filters.type || filters.status
              ? "Try adjusting your filters" 
              : showMaintenanceOnly 
                ? "All equipment is up to date!" 
                : "No assets have been added yet"
          }
          action={!showMaintenanceOnly ? handleAddClick : undefined}
          actionLabel={canAddDirectly ? "Add Asset" : "Request Asset"}
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayList.map((equipment) => (
            <EquipmentCard 
              key={equipment.id} 
              equipment={equipment} 
              showCost={showCosts}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default EquipmentList;