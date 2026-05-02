/**
 * Cost Summary Stats Component
 * Displays key financial metrics at the top of Asset Ledger
 */

import { DollarSign, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  if (num >= 1000000) {
    return `₦${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `₦${(num / 1000).toFixed(1)}K`;
  }
  return `₦${num.toLocaleString()}`;
};

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'orange' }) => {
  const colorClasses = {
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg p-4 border border-gray-200 dark:border-dark-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const CostSummaryStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-dark-card rounded-lg p-4 border border-gray-200 dark:border-dark-border animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-dark-border rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalCost = parseFloat(stats?.total_actual_cost || stats?.total_confirmed || stats?.total_estimated || 0);
  const thisMonth = parseFloat(stats?.this_month_cost || 0);
  const thisQuarter = parseFloat(stats?.this_quarter_cost || 0);
  const paidCount = parseInt(stats?.paid_count || 0);
  const unpaidCount = parseInt(stats?.unpaid_count || 0);
  const totalCount = paidCount + unpaidCount;
  const paidPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Costs (All Time)"
        value={formatCurrency(totalCost)}
        subtitle={`${stats?.total_work_orders || 0} work orders`}
        icon={DollarSign}
        color="orange"
      />
      <StatCard
        title="This Month"
        value={formatCurrency(thisMonth)}
        subtitle="Current month costs"
        icon={TrendingUp}
        color="blue"
      />
      <StatCard
        title="This Quarter"
        value={formatCurrency(thisQuarter)}
        subtitle="Quarterly total"
        icon={Calendar}
        color="purple"
      />
      <StatCard
        title="Payment Status"
        value={`${paidPercent}%`}
        subtitle={`${paidCount} paid / ${unpaidCount} unpaid`}
        icon={CheckCircle}
        color="green"
      />
    </div>
  );
};

export default CostSummaryStats;
