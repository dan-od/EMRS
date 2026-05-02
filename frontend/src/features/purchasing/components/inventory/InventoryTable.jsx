import { memo } from 'react';
import { EmptyState } from '@/components/feedback';
import { InventoryRow } from './InventoryRow';
import { Package, Loader2 } from 'lucide-react';

const TABLE_HEADERS = [
  { key: 'name', label: 'Item', className: 'text-left' },
  { key: 'category', label: 'Category', className: 'text-left' },
  { key: 'quantity', label: 'Quantity', className: 'text-center' },
  { key: 'reorder', label: 'Reorder Level', className: 'text-center' },
  { key: 'actions', label: 'Actions', className: 'text-right' }
];

const TableSkeleton = () => (
  <div className="animate-pulse p-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-white/10">
        <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/4" />
        </div>
        <div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-16" />
      </div>
    ))}
  </div>
);

export const InventoryTable = memo(({ items, isLoading, onEdit, onAdjustStock, onViewDetails }) => {
  if (isLoading) return <TableSkeleton />;

  if (!items?.length) {
    return (
      <EmptyState
        icon={Package}
        title="No inventory items"
        description="Add your first inventory item to get started"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
      <table className="w-full min-w-[600px]">
        <thead className="bg-gray-50 dark:bg-[#0f1419]">
          <tr>
            {TABLE_HEADERS.map((header) => (
              <th
                key={header.key}
                className={`px-4 py-3 text-xs font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider ${header.className}`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/10 bg-white dark:bg-[#1a1f26]">
          {items.map((item) => (
            <InventoryRow
              key={item.id}
              item={item}
              onEdit={onEdit}
              onAdjustStock={onAdjustStock}
              onViewDetails={onViewDetails}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

InventoryTable.displayName = 'InventoryTable';
