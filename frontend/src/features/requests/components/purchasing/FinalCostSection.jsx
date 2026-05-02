/**
 * FinalCostSection - Final cost input for Purchasing approval
 * Shows manager's estimate and allows Purchasing to set final cost
 */
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const FinalCostSection = ({ request, value, onChange }) => {
  const details = request?.details || {};
  const managerEstimate = details.costEstimate || request.manager_cost_estimate;
  
  // Calculate difference
  const finalCost = parseFloat(value) || 0;
  const estimate = parseFloat(managerEstimate) || 0;
  const difference = finalCost - estimate;
  const percentDiff = estimate > 0 ? ((difference / estimate) * 100).toFixed(1) : 0;

  return (
    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/30 space-y-4">
      {/* Manager's Estimate */}
      {managerEstimate && (
        <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-500/30">
          <div>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">Manager's Estimate</p>
            <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
              {formatCurrency(managerEstimate)}
            </p>
          </div>
          {details.managerNotes && (
            <div className="text-right">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Manager Notes:</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 max-w-xs truncate">
                {details.managerNotes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Final Cost Input */}
      <div>
        <label className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2 block">
          Final Cost (Your Determination)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-medium">₦</span>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter final cost"
            min="0"
            step="1000"
            className="w-full pl-8 pr-3 py-3 text-lg font-semibold border border-emerald-200 dark:border-emerald-500/30 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Difference Indicator */}
      {managerEstimate && finalCost > 0 && (
        <div className={`flex items-center gap-2 text-sm ${
          difference > 0 
            ? 'text-amber-600 dark:text-amber-400' 
            : difference < 0 
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400'
        }`}>
          {difference > 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : difference < 0 ? (
            <TrendingDown className="w-4 h-4" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
          <span>
            {difference === 0 
              ? 'Matches estimate' 
              : `${difference > 0 ? '+' : ''}${formatCurrency(difference)} (${difference > 0 ? '+' : ''}${percentDiff}%)`
            }
          </span>
        </div>
      )}

      <p className="text-xs text-emerald-600 dark:text-emerald-400">
        This will be recorded as the official cost for this maintenance and sent to Accounts.
      </p>
    </div>
  );
};

export default FinalCostSection;
