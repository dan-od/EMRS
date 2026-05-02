/**
 * VehiclesPage - Manage fleet vehicles
 */
import { useState } from 'react';
import { PageWrapper } from '@/components/layout';
import { EmptyState, ContentLoader } from '@/components/feedback';
import { Button } from '@/components/common';
import { Truck } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/services/api';
import { VEHICLES } from '@/services/endpoints';
import { useUIStore } from '@/store/uiStore';
import { 
  VehicleStats, 
  VehicleFilters, 
  VehicleCard, 
  VehicleFormModal, 
  StatusUpdateModal 
} from './vehicles';

const VehiclesPage = () => {
  const { addNotification } = useUIStore();
  const [filters, setFilters] = useState({ search: '', type: '', status: '' });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, vehicle: null });
  const [statusModal, setStatusModal] = useState({ open: false, vehicle: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 300);
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.append('search', debouncedSearch);
  if (filters.type) queryParams.append('type', filters.type);
  if (filters.status) queryParams.append('status', filters.status);
  
  const { data: response, isLoading, mutate: refresh } = useApi(`${VEHICLES.BASE}?${queryParams.toString()}`);
  const { data: driversResponse } = useApi(VEHICLES.DRIVERS);

  const vehicles = response?.data || [];
  const drivers = driversResponse?.data || [];

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    try {
      await api.post(VEHICLES.BASE, formData);
      addNotification({ type: 'success', message: 'Vehicle added successfully' });
      setAddModal(false);
      refresh();
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to add vehicle' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    setIsSubmitting(true);
    try {
      await api.patch(VEHICLES.BY_ID(id), formData);
      addNotification({ type: 'success', message: 'Vehicle updated successfully' });
      setEditModal({ open: false, vehicle: null });
      refresh();
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to update vehicle' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status, notes) => {
    setIsSubmitting(true);
    try {
      await api.patch(VEHICLES.STATUS(id), { status, notes });
      addNotification({ type: 'success', message: 'Status updated successfully' });
      setStatusModal({ open: false, vehicle: null });
      refresh();
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to update status' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper title="Fleet Vehicles" subtitle="Manage company vehicles">
      <VehicleStats vehicles={vehicles} />
      
      <VehicleFilters 
        filters={filters} 
        setFilters={setFilters} 
        onRefresh={refresh}
        onAddNew={() => setAddModal(true)}
      />

      {isLoading ? (
        <ContentLoader />
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No vehicles found"
          description="Add your first vehicle to the fleet"
          action={<Button variant="primary" onClick={() => setAddModal(true)}>Add Vehicle</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={() => setEditModal({ open: true, vehicle })}
              onUpdateStatus={() => setStatusModal({ open: true, vehicle })}
            />
          ))}
        </div>
      )}

      <VehicleFormModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        onSubmit={handleCreate}
        isLoading={isSubmitting}
        title="Add Vehicle"
        drivers={drivers}
      />

      <VehicleFormModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, vehicle: null })}
        onSubmit={(data) => handleUpdate(editModal.vehicle?.id, data)}
        isLoading={isSubmitting}
        title="Edit Vehicle"
        initialData={editModal.vehicle}
        drivers={drivers}
      />

      <StatusUpdateModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, vehicle: null })}
        onSubmit={(status, notes) => handleUpdateStatus(statusModal.vehicle?.id, status, notes)}
        isLoading={isSubmitting}
        vehicle={statusModal.vehicle}
      />
    </PageWrapper>
  );
};

export default VehiclesPage;
