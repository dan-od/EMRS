/**
 * Accounts Dashboard Page (Asset Ledger)
 * Main page for accounts department to view work order costs and record payments
 */

import { useState, useCallback } from 'react';
import { PageWrapper } from '@/components/layout';
import { EmptyState } from '@/components/feedback';
import { BookOpen, RefreshCw } from 'lucide-react';

import { CostSummaryStats, CostFilters, WorkOrderCostCard, RecordPaymentModal } from '../components';
import { useWorkOrders, useAccountsStats, useRecordPayment } from '../hooks';
import accountsApi from '../services/accountsApi';

const AccountsDashboard = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    department: '',
    paymentStatus: '',
    minCost: '',
    maxCost: ''
  });
  const [page, setPage] = useState(1);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Fetch data
  const { workOrders, pagination, loading, error, refetch } = useWorkOrders({ ...filters, page });
  const { stats, loading: statsLoading } = useAccountsStats();
  const { recordPayment, loading: paymentLoading } = useRecordPayment();

  // Ensure workOrders is always an array (defensive)
  const safeWorkOrders = Array.isArray(workOrders) ? workOrders : [];

  // Handle filter change
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page
  }, []);

  // Handle payment recording
  const handleRecordPayment = async (paymentData) => {
    try {
      await recordPayment(selectedWorkOrder.id, paymentData);
      setSelectedWorkOrder(null);
      refetch();
    } catch (err) {
      console.error('Failed to record payment:', err);
      // Toast notification would go here
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await accountsApi.exportWorkOrders(filters);
      
      // Extract data if wrapped in success response
      const data = response?.data || response;
      
      // Create and download CSV
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asset-ledger-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <PageWrapper 
      title="Asset Ledger" 
      subtitle="Track work order costs and record payments"
      icon={BookOpen}
      actions={
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      }
    >
      {/* Stats Summary */}
      <CostSummaryStats stats={stats} loading={statsLoading} />

      {/* Filters */}
      <CostFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        exporting={exporting}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={refetch}
            className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && safeWorkOrders.length === 0 && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-card rounded-lg p-4 border border-gray-200 dark:border-dark-border animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-dark-border rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && safeWorkOrders.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No work orders found"
          description="There are no work orders matching your filters. Try adjusting your search criteria."
        />
      )}

      {/* Work Orders List */}
      {safeWorkOrders.length > 0 && (
        <div className="space-y-4">
          {safeWorkOrders.map((wo) => (
            <WorkOrderCostCard
              key={wo.id}
              workOrder={wo}
              onRecordPayment={setSelectedWorkOrder}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-border rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-border rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedWorkOrder && (
        <RecordPaymentModal
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
          onSubmit={handleRecordPayment}
          loading={paymentLoading}
        />
      )}
    </PageWrapper>
  );
};

export default AccountsDashboard;
