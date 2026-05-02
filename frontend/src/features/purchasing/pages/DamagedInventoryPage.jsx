/**
 * DamagedInventoryPage
 * View and manage damaged, lost, and incomplete return items
 */

import { useState } from 'react';
import { PageWrapper } from '@/components/layout';
import { Button, Input, Select, Modal } from '@/components/common';
import { 
  AlertTriangle, Package, Search, Filter, 
  CheckCircle, XCircle, Clock, Wrench, RefreshCw
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { formatDate } from '@/utils/formatters';
import { api } from '@/services/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Pending_Verification', label: 'Pending Verification' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Under_Review', label: 'Under Review' },
  { value: 'Written_Off', label: 'Written Off' },
  { value: 'Repaired', label: 'Repaired' },
  { value: 'Replaced', label: 'Replaced' },
  { value: 'Resolved', label: 'Resolved' }
];

const CONDITION_OPTIONS = [
  { value: '', label: 'All Conditions' },
  { value: 'Damaged', label: 'Damaged' },
  { value: 'Lost', label: 'Lost' },
  { value: 'Incomplete', label: 'Incomplete' }
];

const STATUS_COLORS = {
  Pending_Verification: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400',
  Verified: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400',
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
  Under_Review: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
  Written_Off: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400',
  Repaired: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
  Replaced: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400',
  Resolved: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
};

const CONDITION_COLORS = {
  Damaged: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400',
  Lost: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
  Incomplete: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400'
};

const DamagedInventoryPage = () => {
  const [filters, setFilters] = useState({ status: '', condition: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch damaged inventory
  const { 
    data: response, 
    isLoading, 
    mutate: refresh 
  } = useApi(`/purchasing/damaged-inventory?status=${filters.status}&condition=${filters.condition}`);

  // Fetch stats
  const { data: statsResponse } = useApi('/purchasing/damaged-inventory/stats');

  const items = response?.data || [];
  const stats = statsResponse?.data || {};

  const handleUpdateStatus = async () => {
    if (!selectedItem || !updateStatus) return;
    
    setIsUpdating(true);
    try {
      await api.patch(`/purchasing/damaged-inventory/${selectedItem.id}/status`, {
        status: updateStatus,
        notes: updateNotes
      });
      refresh();
      setShowUpdateModal(false);
      setSelectedItem(null);
      setUpdateStatus('');
      setUpdateNotes('');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const openUpdateModal = (item) => {
    setSelectedItem(item);
    setUpdateStatus(item.status);
    setUpdateNotes('');
    setShowUpdateModal(true);
  };

  return (
    <PageWrapper 
      title="Damaged & Missing Inventory" 
      subtitle="Track items returned as damaged, lost, or incomplete"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-5">
        <div className="bg-purple-50 dark:bg-purple-500/15 rounded-xl p-3 border border-purple-200 dark:border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs mb-1">
            <Clock className="w-4 h-4" />
            Awaiting Verification
          </div>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{stats.pending_verification || 0}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-500/15 rounded-xl p-3 border border-yellow-200 dark:border-yellow-500/20">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-xs mb-1">
            <Clock className="w-4 h-4" />
            Pending
          </div>
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending || 0}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-500/15 rounded-xl p-3 border border-orange-200 dark:border-orange-500/20">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-xs mb-1">
            <AlertTriangle className="w-4 h-4" />
            Damaged
          </div>
          <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.damaged_count || 0}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-500/15 rounded-xl p-3 border border-red-200 dark:border-red-500/20">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs mb-1">
            <XCircle className="w-4 h-4" />
            Lost
          </div>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.lost_count || 0}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-500/15 rounded-xl p-3 border border-amber-200 dark:border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs mb-1">
            <Package className="w-4 h-4" />
            Incomplete
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.incomplete_count || 0}</p>
        </div>
        <div className="bg-gray-50 dark:bg-dark-card/50 rounded-xl p-3 border border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-gray-500 dark:text-dark-muted text-xs mb-1">
            <CheckCircle className="w-4 h-4" />
            Total
          </div>
          <p className="text-xl font-bold text-gray-700 dark:text-dark-text">{stats.total || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-white/10 mb-5">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
          <div className="flex-1 min-w-[200px]">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              options={STATUS_OPTIONS}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Select
              label="Condition"
              value={filters.condition}
              onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
              options={CONDITION_OPTIONS}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setFilters({ status: '', condition: '' })}
          >
            Clear Filters
          </Button>
          <Button variant="outline" onClick={() => refresh()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-dark-muted">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-dark-muted">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No damaged or missing items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-dark-card/50 border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase">Item</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-dark-muted uppercase">Qty</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-dark-muted uppercase">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase">Reported By</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-dark-muted uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase">Date</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-dark-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-dark-text truncate max-w-[200px]">{item.item_name}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted">{item.category}</p>
                    {item.request_id && (
                      <p className="text-xs text-gray-400 dark:text-dark-muted">
                        Request: #{item.request_id.slice(0, 8)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium text-text-primary dark:text-dark-text">{item.quantity}</span>
                    <span className="text-gray-500 dark:text-dark-muted text-xs ml-1">{item.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${CONDITION_COLORS[item.condition]}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-muted max-w-xs truncate">
                    {item.reason || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-muted">
                    {item.reported_by_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                      {item.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-muted">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openUpdateModal(item)}
                    >
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      <Modal 
        isOpen={showUpdateModal} 
        onClose={() => setShowUpdateModal(false)}
        title="Update Item Status"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-dark-card/50 rounded-xl border border-gray-100 dark:border-white/10">
              <p className="font-medium text-text-primary dark:text-dark-text">{selectedItem.item_name}</p>
              <p className="text-sm text-gray-500 dark:text-dark-muted">
                {selectedItem.quantity} {selectedItem.unit} • {selectedItem.condition}
              </p>
            </div>

            <Select
              label="Status"
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              options={[
                { value: 'Pending', label: 'Pending' },
                { value: 'Under_Review', label: 'Under Review' },
                { value: 'Written_Off', label: 'Written Off' },
                { value: 'Repaired', label: 'Repaired' },
                { value: 'Replaced', label: 'Replaced' },
                { value: 'Resolved', label: 'Resolved' }
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-dark-text mb-1">Resolution Notes</label>
              <textarea
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Notes about the resolution..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text placeholder-text-muted dark:placeholder-dark-muted focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleUpdateStatus}
                isLoading={isUpdating}
              >
                Update Status
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default DamagedInventoryPage;
