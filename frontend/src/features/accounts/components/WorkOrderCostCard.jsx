/**
 * Work Order Cost Card Component
 * Displays work order with cost breakdown and payment status
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, User, Building, Wrench, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return `₦${num.toLocaleString()}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const WorkOrderCostCard = ({ workOrder, onRecordPayment }) => {
  const [expanded, setExpanded] = useState(false);

  const managerEstimate = parseFloat(workOrder.manager_cost_estimate) || 0;
  const purchasingCost = parseFloat(workOrder.purchasing_final_cost) || 0;
  const actualCost = parseFloat(workOrder.actual_cost) || 0;
  const finalPayment = parseFloat(workOrder.accounts_final_payment) || 0;
  
  // Use best available cost for display
  const displayCost = actualCost || purchasingCost || managerEstimate;
  
  // Calculate variance from estimate
  const variance = managerEstimate > 0 ? ((displayCost - managerEstimate) / managerEstimate * 100).toFixed(0) : 0;
  
  const isPaid = finalPayment > 0;
  const serviceType = workOrder.request_details?.serviceType || 'Mixed';

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden">
      {/* Header - Always visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                WO-{workOrder.id?.slice(0, 8)}
              </span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                isPaid 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
              }`}>
                {isPaid ? '✓ Paid' : '⏳ Pending Payment'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {workOrder.equipment_name || 'Unknown Equipment'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {workOrder.description}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <User size={12} />
                {workOrder.requester_name || 'Unknown'}
              </span>
              <span className="flex items-center gap-1">
                <Building size={12} />
                {workOrder.requester_department || 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <Wrench size={12} />
                {serviceType}
              </span>
            </div>
          </div>
          
          <div className="text-right ml-4">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(displayCost)}
            </p>
            {managerEstimate > 0 && variance !== '0' && (
              <p className={`text-xs ${parseFloat(variance) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {parseFloat(variance) > 0 ? '+' : ''}{variance}% vs estimate
              </p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {workOrder.status || 'N/A'}
            </p>
            <button className="mt-2 text-gray-500 dark:text-gray-400">
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-dark-border p-4 bg-gray-50 dark:bg-dark-surface">
          {/* Cost Breakdown */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Cost Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-dark-card p-3 rounded border border-gray-200 dark:border-dark-border">
                <p className="text-xs text-gray-500 dark:text-gray-400">Manager Estimate</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(managerEstimate)}</p>
              </div>
              <div className="bg-white dark:bg-dark-card p-3 rounded border border-gray-200 dark:border-dark-border">
                <p className="text-xs text-gray-500 dark:text-gray-400">Purchasing Cost</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(purchasingCost)}</p>
              </div>
              <div className="bg-white dark:bg-dark-card p-3 rounded border border-gray-200 dark:border-dark-border">
                <p className="text-xs text-gray-500 dark:text-gray-400">Actual Cost</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(actualCost)}</p>
              </div>
              <div className={`p-3 rounded border ${
                isPaid 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
              }`}>
                <p className="text-xs text-gray-500 dark:text-gray-400">Final Payment</p>
                <p className={`font-semibold ${isPaid ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {isPaid ? formatCurrency(finalPayment) : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-sm text-gray-900 dark:text-white">{formatDate(workOrder.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-sm text-gray-900 dark:text-white">{formatDate(workOrder.completed_at)}</p>
            </div>
            {isPaid && (
              <>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Payment Date</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(workOrder.accounts_payment_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recorded By</p>
                  <p className="text-sm text-gray-900 dark:text-white">{workOrder.recorded_by_name || 'N/A'}</p>
                </div>
              </>
            )}
          </div>

          {/* Payment Notes */}
          {workOrder.accounts_payment_notes && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Payment Notes</p>
              <p className="text-sm text-gray-900 dark:text-white">{workOrder.accounts_payment_notes}</p>
            </div>
          )}

          {/* Actions */}
          {!isPaid && (
            <div className="flex justify-end">
              <button
                onClick={() => onRecordPayment(workOrder)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
              >
                Record Payment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkOrderCostCard;
