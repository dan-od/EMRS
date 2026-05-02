/**
 * VendorsPage
 * Manage suppliers and vendors
 */

import { useState, useCallback } from 'react';
import { PageWrapper } from '@/components/layout';
import { Button, Input, Select, Modal } from '@/components/common';
import { EmptyState, ContentLoader } from '@/components/feedback';
import { 
  Store, Plus, Search, Star, Phone, Mail, MapPin, 
  RefreshCw, Edit2, ToggleLeft, ToggleRight 
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/services/api';
import { VENDORS } from '@/services/endpoints';
import { useUIStore } from '@/store/uiStore';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'PPE', label: 'PPE' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Materials', label: 'Materials' },
  { value: 'Chemicals', label: 'Chemicals' },
  { value: 'Tools', label: 'Tools' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Other', label: 'Other' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' }
];

const VendorsPage = () => {
  const { addNotification } = useUIStore();
  const [filters, setFilters] = useState({ search: '', category: '', status: '' });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, vendor: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 300);
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.append('search', debouncedSearch);
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.status) queryParams.append('is_active', filters.status);
  
  const { data: response, isLoading, mutate: refresh } = useApi(
    `${VENDORS.BASE}?${queryParams.toString()}`
  );
  const { data: statsResponse } = useApi(`${VENDORS.BASE}/stats`);

  const vendors = response?.data || [];
  const stats = statsResponse?.data || statsResponse || {};

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    try {
      await api.post(VENDORS.BASE, formData);
      addNotification({ type: 'success', message: 'Vendor created successfully' });
      setAddModal(false);
      refresh();
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to create vendor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    setIsSubmitting(true);
    try {
      await api.put(VENDORS.BY_ID(id), formData);
      addNotification({ type: 'success', message: 'Vendor updated successfully' });
      setEditModal({ open: false, vendor: null });
      refresh();
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to update vendor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (vendor) => {
    try {
      const isCurrentlyActive = vendor.status === 'Active' || vendor.is_active === true;
      await api.patch(`${VENDORS.BY_ID(vendor.id)}/status`, { isActive: !isCurrentlyActive });
      addNotification({ 
        type: 'success', 
        message: `Vendor ${isCurrentlyActive ? 'deactivated' : 'activated'}` 
      });
      refresh();
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to update status' });
    }
  };

  return (
    <PageWrapper title="Vendors" subtitle="Manage suppliers and vendors">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Vendors" value={stats.total_vendors || stats.total || vendors.length} icon={Store} color="blue" />
        <StatCard label="Active" value={stats.active_vendors || stats.active || 0} icon={ToggleRight} color="green" />
        <StatCard label="Inactive" value={stats.inactive_vendors || stats.inactive || 0} icon={ToggleLeft} color="gray" />
        <StatCard label="Avg Rating" value={(stats.average_rating || stats.avg_rating || 0).toFixed(1)} icon={Star} color="yellow" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-white/10 mb-5">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <Input
              placeholder="Search vendors..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-3">
            <Select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              options={CATEGORIES}
            />
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              options={STATUS_OPTIONS}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setFilters({ search: '', category: '', status: '' })}>
              Clear
            </Button>
            <Button variant="outline" onClick={() => refresh()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="primary" onClick={() => setAddModal(true)} className="flex-1 sm:flex-none">
              <Plus className="w-4 h-4 mr-1" /> Add Vendor
            </Button>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      {isLoading ? (
        <ContentLoader />
      ) : vendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendors found"
          description="Add your first vendor to get started"
          action={<Button variant="primary" onClick={() => setAddModal(true)}>Add Vendor</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map(vendor => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onEdit={() => setEditModal({ open: true, vendor })}
              onToggleStatus={() => handleToggleStatus(vendor)}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <VendorFormModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        onSubmit={handleCreate}
        isLoading={isSubmitting}
        title="Add Vendor"
      />

      {/* Edit Modal */}
      <VendorFormModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, vendor: null })}
        onSubmit={(data) => handleUpdate(editModal.vendor?.id, data)}
        isLoading={isSubmitting}
        title="Edit Vendor"
        initialData={editModal.vendor}
      />
    </PageWrapper>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    gray: 'text-gray-600 dark:text-gray-400',
    yellow: 'text-yellow-600 dark:text-yellow-400'
  };
  return (
    <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-white/10">
      <div className="flex items-center gap-2 text-gray-500 dark:text-dark-muted text-sm mb-1">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
};

// Vendor Card Component
const VendorCard = ({ vendor, onEdit, onToggleStatus }) => (
  <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/10 p-4 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-dark-text">{vendor.name}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-dark-muted">
          {vendor.category}
        </span>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${
        (vendor.is_active !== false && vendor.status !== 'Inactive')
          ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' 
          : 'bg-gray-100 dark:bg-gray-500/20 text-gray-500 dark:text-gray-400'
      }`}>
        {vendor.status === 'Active' || vendor.is_active ? 'Active' : 'Inactive'}
      </span>
    </div>

    {/* Rating */}
    <div className="flex items-center gap-1 mb-3">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= (vendor.rating || 0) 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
      <span className="text-sm text-gray-500 dark:text-dark-muted ml-1">({vendor.rating || 0})</span>
    </div>

    {/* Contact Info */}
    <div className="space-y-1 text-sm text-gray-600 dark:text-dark-muted mb-4">
      {vendor.contact_person && (
        <p className="font-medium text-gray-700 dark:text-dark-text">{vendor.contact_person}</p>
      )}
      {(vendor.contact_phone || vendor.phone) && (
        <p className="flex items-center gap-2">
          <Phone className="w-3 h-3" /> {vendor.contact_phone || vendor.phone}
        </p>
      )}
      {(vendor.contact_email || vendor.email) && (
        <p className="flex items-center gap-2">
          <Mail className="w-3 h-3" /> {vendor.contact_email || vendor.email}
        </p>
      )}
      {vendor.address && (
        <p className="flex items-center gap-2">
          <MapPin className="w-3 h-3" /> {vendor.address}
        </p>
      )}
    </div>

    {/* Actions */}
    <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-white/10">
      <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
        <Edit2 className="w-3 h-3 mr-1" /> Edit
      </Button>
      <Button 
        variant={vendor.is_active ? 'ghost' : 'outline'} 
        size="sm" 
        onClick={onToggleStatus}
        className="flex-1"
      >
        {vendor.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    </div>
  </div>
);

// Vendor Form Modal
const VendorFormModal = ({ isOpen, onClose, onSubmit, isLoading, title, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  // Reset form when modal opens
  useState(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        contact_person: initialData.contact_person || '',
        phone: initialData.contact_phone || initialData.phone || '',
        email: initialData.contact_email || initialData.email || '',
        address: initialData.address || '',
        notes: initialData.notes || ''
      });
    } else if (isOpen) {
      setFormData({
        name: '', category: '', contact_person: '', phone: '', email: '', address: '', notes: ''
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Vendor Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={CATEGORIES.filter(c => c.value)}
          required
        />
        <Input
          label="Contact Person"
          name="contact_person"
          value={formData.contact_person}
          onChange={handleChange}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-card text-text-primary dark:text-dark-text placeholder:text-text-muted dark:placeholder:text-dark-muted"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            {initialData ? 'Update' : 'Create'} Vendor
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VendorsPage;
