const PurchasingStats = ({ stats, lowStockCount = 0 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      <div className="bg-white dark:bg-[#1a1f26] rounded-xl p-4 border border-gray-200 dark:border-white/10">
        <p className="text-2xl font-bold text-text-primary dark:text-white">{stats.total_active || 0}</p>
        <p className="text-sm text-text-muted dark:text-gray-400">Total Requests</p>
      </div>
      <div className="bg-white dark:bg-[#1a1f26] rounded-xl p-4 border border-gray-200 dark:border-white/10">
        <p className="text-2xl font-bold text-primary dark:text-orange-400">{stats.awaiting_review || 0}</p>
        <p className="text-sm text-text-muted dark:text-gray-400">Awaiting Review</p>
      </div>
      <div className="bg-white dark:bg-[#1a1f26] rounded-xl p-4 border border-gray-200 dark:border-white/10">
        <p className="text-2xl font-bold text-success dark:text-green-400">{stats.ready_to_disburse || 0}</p>
        <p className="text-sm text-text-muted dark:text-gray-400">Ready to Give</p>
      </div>
      <div className="bg-white dark:bg-[#1a1f26] rounded-xl p-4 border border-gray-200 dark:border-white/10">
        <p className="text-2xl font-bold text-warning-600 dark:text-yellow-400">{lowStockCount}</p>
        <p className="text-sm text-text-muted dark:text-gray-400">Low Stock Alerts</p>
      </div>
      <div className="bg-white dark:bg-[#1a1f26] rounded-xl p-4 border border-gray-200 dark:border-white/10">
        <p className="text-2xl font-bold text-error dark:text-red-400">{stats.overdue || 0}</p>
        <p className="text-sm text-text-muted dark:text-gray-400">Overdue Returns</p>
      </div>
    </div>
  );
};

export default PurchasingStats;
