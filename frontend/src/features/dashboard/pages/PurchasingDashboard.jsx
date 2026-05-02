/**
 * Purchasing Staff Dashboard
 * Focus: Inventory, disbursements, receiving goods
 */

import { PageWrapper } from '@/components/layout';
import { useApi } from '@/hooks/useApi';
import { PURCHASING, REQUESTS } from '@/services/endpoints';
import { StatCard } from '../components/StatCard';
import { Link } from 'react-router-dom';
import { 
  Package, AlertTriangle, ShoppingCart, CheckCircle,
  ClipboardList, Plus, Truck, BoxIcon, Wrench, Download
} from 'lucide-react';

const PurchasingDashboard = ({ user }) => {
  const { data: inventoryData } = useApi(PURCHASING.INVENTORY);
  const { data: myRequestsData } = useApi(REQUESTS.MY_REQUESTS);
  const { data: readyData } = useApi(REQUESTS.PURCHASING_READY);

  const inventory = Array.isArray(inventoryData) ? inventoryData : (inventoryData?.data || inventoryData?.items || []);
  const myRequests = Array.isArray(myRequestsData) ? myRequestsData : (myRequestsData?.data || []);
  const readyRequests = Array.isArray(readyData) ? readyData : (readyData?.data || readyData?.requests || []);

  const displayName = user?.firstName || user?.first_name || user?.name?.split(' ')[0] || 'Purchasing';
  const isPurchasingManager = user?.role === 'Purchasing_Manager';

  // Calculate stats
  const lowStockItems = inventory.filter(item =>
    item.quantity <= (item.reorder_level || 10)
  );

  const stats = {
    totalItems: inventory.length,
    lowStock: lowStockItems.length,
    pendingDisbursements: readyRequests.length,
    myPendingRequests: myRequests.filter(r => r.status === 'Pending')?.length || 0
  };

  return (
    <PageWrapper title="Purchasing Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-text-primary">
            Welcome, {displayName}! 📦
          </h2>
          <p className="text-text-secondary">
            {isPurchasingManager ? 'Manage inventory and approve purchases' : 'Inventory and disbursement management'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Inventory Items"
            value={stats.totalItems}
            icon={Package}
            color="primary"
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStock}
            icon={AlertTriangle}
            color="error"
          />
          <StatCard
            title="Pending Disbursements"
            value={stats.pendingDisbursements}
            icon={Truck}
            color="warning"
          />
          <StatCard
            title="My Requests"
            value={stats.myPendingRequests}
            icon={ClipboardList}
            color="info"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-surface rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <Link
              to="/purchasing"
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Package className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-300">Inventory</span>
            </Link>
            <Link
              to="/purchasing?tab=disbursements"
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Truck className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
              <span className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-300">Disbursements</span>
            </Link>
            <Link
              to="/equipment"
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
            >
              <BoxIcon className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs sm:text-sm font-medium text-indigo-900 dark:text-indigo-300">Equipment</span>
            </Link>
            <Link
              to="/maintenance"
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <Wrench className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 dark:text-amber-400" />
              <span className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-300">Maintenance</span>
            </Link>
            <Link
              to="/purchasing?tab=receive"
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Download className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-300">Receive Goods</span>
            </Link>
            <Link
              to="/requests/new"
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
              <span className="text-xs sm:text-sm font-medium text-orange-900 dark:text-orange-300">My Request</span>
            </Link>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-red-900 dark:text-red-300">Low Stock Alert</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                  {lowStockItems.length} item(s) are at or below reorder level
                </p>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-white dark:bg-dark-surface rounded-lg p-3 gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary dark:text-dark-text truncate">{item.name}</p>
                        <p className="text-xs text-text-secondary">{item.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium text-red-600 dark:text-red-400">{item.quantity} {item.unit}</p>
                        <p className="text-xs text-text-secondary">Reorder: {item.reorder_level}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {lowStockItems.length > 5 && (
                  <Link
                    to="/purchasing?filter=low-stock"
                    className="mt-3 inline-block text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                  >
                    View all {lowStockItems.length} items →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Safety Reporting */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 sm:p-6 border border-yellow-100 dark:border-yellow-800/50">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Safety Reporting
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
            Report any safety concerns in the warehouse or during deliveries
          </p>
          <Link
            to="/safety/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface rounded-lg text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-sm font-medium"
          >
            <AlertTriangle className="w-4 h-4" />
            Report Safety Issue
          </Link>
        </div>

        {/* My Recent Requests */}
        <div className="bg-white dark:bg-dark-surface rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text">My Recent Requests</h3>
            <Link to="/requests/my" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All →
            </Link>
          </div>

          {myRequests.length === 0 ? (
            <div className="text-center py-6 text-text-secondary">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No requests yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
              {myRequests.slice(0, 3).map((request) => (
                <Link
                  key={request.id}
                  to={`/requests/${request.id}`}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-dark-card -mx-2 px-2 rounded-lg transition-colors gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary dark:text-dark-text truncate">{request.subject}</p>
                    <p className="text-sm text-text-secondary">{request.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                    request.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    request.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                    'bg-gray-100 dark:bg-dark-card text-gray-800 dark:text-dark-text'
                  }`}>
                    {request.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default PurchasingDashboard;
