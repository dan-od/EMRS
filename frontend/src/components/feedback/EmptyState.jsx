import { cn } from '@/utils/helpers';
import { Button } from '@/components/common';
import { FileQuestion, Inbox, Search, AlertCircle } from 'lucide-react';

const icons = {
  default: Inbox,
  search: Search,
  error: AlertCircle,
  notFound: FileQuestion
};

export const EmptyState = ({
  icon: CustomIcon,
  iconType = 'default',
  title = 'No data found',
  description,
  action,
  actionLabel,
  className
}) => {
  const Icon = CustomIcon || icons[iconType];

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-card flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-muted dark:text-dark-muted" />
      </div>
      <h3 className="text-lg font-medium text-text-primary dark:text-dark-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary dark:text-dark-muted max-w-sm mb-4">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// Preset empty states
export const NoResults = ({ searchTerm, onClear }) => (
  <EmptyState
    iconType="search"
    title="No results found"
    description={searchTerm ? `No results for "${searchTerm}". Try adjusting your search.` : 'Try adjusting your filters.'}
    action={onClear}
    actionLabel="Clear search"
  />
);

export const ErrorState = ({ message, onRetry }) => (
  <EmptyState
    iconType="error"
    title="Something went wrong"
    description={message || 'An error occurred while loading data.'}
    action={onRetry}
    actionLabel="Try again"
  />
);
