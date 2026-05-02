import { Check, X, AlertTriangle, Clock, Pause } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { format } from 'date-fns';

/**
 * Horizontal progress bar showing request audit trail
 * Like: Created -> Approved -> Disbursed -> Completed
 */
export const AuditTrailProgress = ({ steps, compact = false }) => {
  if (!steps || steps.length === 0) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
      case 'rejected':
        return <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3" />;
      case 'on_hold':
        return <Pause className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusColors = (status) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-success',
          border: 'border-success',
          text: 'text-success dark:text-green-400',
          line: 'bg-success'
        };
      case 'rejected':
        return {
          bg: 'bg-error',
          border: 'border-error',
          text: 'text-error dark:text-red-400',
          line: 'bg-error'
        };
      case 'warning':
        return {
          bg: 'bg-warning-500',
          border: 'border-warning-500',
          text: 'text-warning-600 dark:text-amber-400',
          line: 'bg-warning-500'
        };
      case 'on_hold':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-500',
          text: 'text-amber-600 dark:text-amber-400',
          line: 'bg-amber-500'
        };
      case 'current':
        return {
          bg: 'bg-primary-500',
          border: 'border-primary-500',
          text: 'text-primary-600 dark:text-primary-400',
          line: 'bg-gray-200 dark:bg-white/20'
        };
      default:
        return {
          bg: 'bg-gray-200 dark:bg-white/20',
          border: 'border-gray-300 dark:border-white/30',
          text: 'text-text-muted dark:text-gray-400',
          line: 'bg-gray-200 dark:bg-white/20'
        };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'MMM d');
    } catch {
      return '';
    }
  };

  return (
    <div className={cn('w-full', compact ? 'py-1' : 'py-2')}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const colors = getStatusColors(step.status);
          const isLast = index === steps.length - 1;
          
          return (
            <div 
              key={index} 
              className={cn('flex items-center', !isLast && 'flex-1')}
            >
              {/* Step Circle and Info */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    'rounded-full border-2 flex items-center justify-center',
                    colors.border,
                    step.status === 'pending' ? 'bg-white dark:bg-dark-surface' : colors.bg,
                    compact ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8'
                  )}
                >
                  {step.status !== 'pending' && (
                    <span className="text-white">
                      {getStatusIcon(step.status)}
                    </span>
                  )}
                </div>
                
                {/* Label */}
                {!compact && (
                  <div className="mt-1 sm:mt-2 text-center">
                    <p className={cn(
                      'text-xs font-medium truncate max-w-[52px] sm:max-w-[80px]',
                      step.status === 'pending' ? 'text-text-muted dark:text-gray-500' : colors.text
                    )}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="hidden sm:block text-xs text-text-muted dark:text-gray-500">
                        {formatDate(step.date)}
                      </p>
                    )}
                    {step.user && (
                      <p className="hidden sm:block text-xs text-text-muted dark:text-gray-500 truncate max-w-[80px]">
                        {step.user}
                      </p>
                    )}
                    {step.note && (
                      <p className="hidden sm:block text-xs text-warning-600 dark:text-amber-400 mt-0.5 max-w-[100px] truncate" title={step.note}>
                        {step.note}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-1 sm:mx-2',
                    step.status === 'completed' || step.status === 'rejected' || step.status === 'warning' || step.status === 'on_hold'
                      ? colors.line
                      : 'bg-gray-200 dark:bg-white/20'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Build audit trail steps from request data
 */
export const buildAuditSteps = (request) => {
  if (!request) return [];
  
  const steps = [];
  
  // Step 1: Created
  steps.push({
    label: 'Created',
    status: 'completed',
    date: request.created_at || request.createdAt,
    user: request.requester_name || 'Requester'
  });
  
  // Step 2: Approved/Rejected/Pending
  if (request.status === 'Rejected') {
    steps.push({
      label: 'Rejected',
      status: 'rejected',
      date: request.approved_at || request.approvedAt,
      user: request.approved_by_name || 'Manager',
      note: request.rejection_reason
    });
    return steps;
  } else if (request.status === 'Pending') {
    steps.push({
      label: 'Approved',
      status: 'pending'
    });
    steps.push({
      label: 'Disbursed',
      status: 'pending'
    });
    steps.push({
      label: 'Completed',
      status: 'pending'
    });
    return steps;
  } else if (request.disbursed_without_approval) {
    steps.push({
      label: 'Approved',
      status: 'warning',
      note: 'Bypassed'
    });
  } else if (request.approved_at || request.status !== 'Pending') {
    steps.push({
      label: 'Approved',
      status: 'completed',
      date: request.approved_at || request.approvedAt,
      user: request.approved_by_name
    });
  }
  
  // Step 3: Disbursed
  if (['Disbursed', 'Pending_Return', 'Completed'].includes(request.status)) {
    steps.push({
      label: 'Disbursed',
      status: 'completed',
      date: request.disbursed_at || request.disbursedAt,
      user: request.disbursed_by_name
    });
  } else if (['Approved', 'On_Hold'].includes(request.status)) {
    steps.push({
      label: request.status === 'On_Hold' ? 'On Hold' : 'Disbursed',
      status: request.status === 'On_Hold' ? 'on_hold' : 'pending',
      note: request.status === 'On_Hold' ? request.disbursement_notes : null
    });
    steps.push({
      label: 'Completed',
      status: 'pending'
    });
    return steps;
  }
  
  // Step 4: Return (if applicable) or Completed
  if (request.expected_return_date) {
    if (request.status === 'Pending_Return') {
      steps.push({
        label: 'Return Init.',
        status: 'completed',
        date: request.return_initiated_at,
        user: request.requester_name
      });
      steps.push({
        label: 'Confirmed',
        status: 'pending'
      });
    } else if (request.status === 'Completed' && request.return_confirmed_at) {
      steps.push({
        label: 'Returned',
        status: 'completed',
        date: request.return_confirmed_at,
        user: request.return_confirmed_by_name
      });
    } else if (request.status === 'Disbursed') {
      steps.push({
        label: 'Returned',
        status: 'pending'
      });
    }
  } else {
    // Consumables - no return needed
    if (request.status === 'Completed') {
      steps.push({
        label: 'Completed',
        status: 'completed'
      });
    } else {
      steps.push({
        label: 'Completed',
        status: 'pending'
      });
    }
  }
  
  return steps;
};

export default AuditTrailProgress;
