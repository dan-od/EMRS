import { cn } from '@/utils/helpers';

export const Skeleton = ({ className = '', width, height }) => (
  <div
    className={cn(
      'animate-pulse rounded bg-gray-200 dark:bg-white/10',
      className
    )}
    style={{ width, height }}
  />
);

export const CardSkeleton = () => (
  <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-dark-card p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
    <div className="flex gap-2 pt-1">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 dark:border-white/10">
    <Skeleton className="h-4 w-4 rounded" />
    <Skeleton className="h-4 flex-1" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
    {Array.from({ length: rows }, (_, i) => (
      <TableRowSkeleton key={i} />
    ))}
  </div>
);

export const CardGridSkeleton = ({ count = 6 }) => (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }, (_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);
