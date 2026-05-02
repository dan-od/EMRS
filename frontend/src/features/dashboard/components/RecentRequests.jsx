import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, Badge, StatusBadge, PriorityBadge } from '@/components/common';
import { EmptyState } from '@/components/feedback';
import { formatRelativeTime, truncate } from '@/utils/formatters';
import { FileText } from 'lucide-react';

export const RecentRequests = ({ requests = [], isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-gray-50 dark:bg-dark-card rounded-lg">
              <div className="w-10 h-10 bg-gray-200 dark:bg-dark-border rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Requests</CardTitle>
        <button 
          onClick={() => navigate('/requests/my-requests')}
          className="text-sm text-primary-500 hover:text-primary-600"
        >
          View All
        </button>
      </CardHeader>

      {requests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No requests yet"
          description="Your recent requests will appear here"
          action={() => navigate('/requests')}
          actionLabel="Create Request"
        />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              onClick={() => navigate(`/requests/${request.id}`)}
              className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-text-muted">#{request.id}</span>
                  <Badge variant="info" size="sm">{request.type}</Badge>
                </div>
                <p className="text-sm font-medium text-text-primary truncate">
                  {truncate(request.subject, 40)}
                </p>
                <p className="text-xs text-text-muted">
                  {formatRelativeTime(request.created_at)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={request.status} />
                <PriorityBadge priority={request.priority} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
