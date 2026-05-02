import { memo } from 'react';
import { Package, AlertTriangle, TrendingUp, Boxes } from 'lucide-react';

const StatCard = memo(({ icon: Icon, label, value, subtext, iconBg, iconColor }) => (
  <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-xl ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary dark:text-dark-text">{value}</p>
        <p className="text-sm text-text-muted dark:text-dark-muted">{label}</p>
        {subtext && <p className="text-xs text-text-secondary dark:text-dark-muted mt-0.5">{subtext}</p>}
      </div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

export const InventoryStats = memo(({ items, lowStockItems }) => {
  const totalItems = items?.length || 0;
  const lowStockCount = lowStockItems?.length || 0;
  const totalStock = items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  
  const categoryCounts = items?.reduce((acc, item) => {
    const cat = item.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {}) || {};
  
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={Package}
        label="Total Items"
        value={totalItems}
        iconBg="bg-primary-50 dark:bg-primary-900/20"
        iconColor="text-primary-500"
      />
      <StatCard
        icon={Boxes}
        label="Total Stock"
        value={totalStock.toLocaleString()}
        subtext="units"
        iconBg="bg-blue-50 dark:bg-blue-900/20"
        iconColor="text-blue-500"
      />
      <StatCard
        icon={AlertTriangle}
        label="Low Stock"
        value={lowStockCount}
        subtext="items need reorder"
        iconBg="bg-amber-50 dark:bg-amber-900/20"
        iconColor="text-amber-500"
      />
      <StatCard
        icon={TrendingUp}
        label="Top Category"
        value={topCategory ? topCategory[0].replace(/_/g, ' ') : '-'}
        subtext={topCategory ? `${topCategory[1]} items` : ''}
        iconBg="bg-green-50 dark:bg-green-900/20"
        iconColor="text-green-500"
      />
    </div>
  );
});

InventoryStats.displayName = 'InventoryStats';
