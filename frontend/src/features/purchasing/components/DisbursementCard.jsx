import { memo } from 'react';
import { Card, CardContent, StatusBadge, Button } from '@/components/common';
import { formatDate } from '@/utils/formatters';
import { Package, User, Calendar, Check, X } from 'lucide-react';

export const DisbursementCard = memo(({ disbursement, onProcess, isLoading }) => {
  const isPending = disbursement.status === 'Pending';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <Package className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="font-medium text-text-primary dark:text-dark-text">{disbursement.item_name}</h3>
              <p className="text-sm text-text-secondary dark:text-dark-muted">
                Quantity: <strong>{disbursement.quantity}</strong> {disbursement.unit}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-text-muted dark:text-dark-muted">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {disbursement.requester_name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(disbursement.created_at)}
                </span>
              </div>
              {disbursement.notes && (
                <p className="text-sm text-text-muted dark:text-dark-muted mt-2 italic">
                  "{disbursement.notes}"
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={disbursement.status} />
            
            {isPending && onProcess && (
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onProcess(disbursement.id, 'approve')}
                  loading={isLoading}
                >
                  <Check className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onProcess(disbursement.id, 'reject')}
                  loading={isLoading}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

DisbursementCard.displayName = 'DisbursementCard';
