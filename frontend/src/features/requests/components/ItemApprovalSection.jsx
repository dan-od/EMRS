/**
 * ItemApprovalSection - Per-item approval for managers
 * Allows managers to approve/reject/modify individual items in a request
 */

import { useState, memo } from 'react';
import { Check, X, Edit2, Package, AlertCircle } from 'lucide-react';

const ItemRow = memo(({ item, index, onStatusChange, onQuantityChange, disabled }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editQty, setEditQty] = useState(item.quantity);
  
  const status = item.approval_status || 'pending';
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isModified = item.approved_quantity && item.approved_quantity !== item.quantity;

  const handleSaveQty = () => {
    onQuantityChange(index, parseInt(editQty) || item.quantity);
    setIsEditing(false);
  };

  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
      isApproved ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
      isRejected ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
      'bg-gray-50 dark:bg-dark-card border-gray-200 dark:border-dark-border'
    }`}>
      {/* Item Icon */}
      <div className={`p-2 rounded-lg ${
        isApproved ? 'bg-green-100 dark:bg-green-900/30' : isRejected ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-dark-card'
      }`}>
        <Package className={`w-4 h-4 ${
          isApproved ? 'text-green-600 dark:text-green-400' : isRejected ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
        }`} />
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary dark:text-dark-text truncate">
          {item.item || item.name}
        </p>
        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-400">
          {item.size && <span>Size: {item.size}</span>}
          {item.size && <span>•</span>}
          <span>Requested: {item.quantity}</span>
          {isModified && (
            <span className="text-amber-600 font-medium">
              → Approved: {item.approved_quantity}
            </span>
          )}
        </div>
      </div>

      {/* Quantity Edit */}
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={editQty}
            onChange={(e) => setEditQty(e.target.value)}
            min={0}
            max={item.quantity}
            className="w-16 px-2 py-1 text-center border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-text-primary dark:text-dark-text"
            autoFocus
          />
          <button
            onClick={handleSaveQty}
            className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setIsEditing(false); setEditQty(item.approved_quantity || item.quantity); }}
            className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {/* Edit Quantity Button */}
          {!disabled && !isRejected && (
            <button
              onClick={() => { setEditQty(item.approved_quantity || item.quantity); setIsEditing(true); }}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-card rounded-lg transition-colors"
              title="Modify quantity"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Approve Button */}
          <button
            onClick={() => onStatusChange(index, 'approved')}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition-colors ${
              isApproved 
                ? 'bg-green-500 text-white' 
                : 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Approve item"
          >
            <Check className="w-4 h-4" />
          </button>

          {/* Reject Button */}
          <button
            onClick={() => onStatusChange(index, 'rejected')}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition-colors ${
              isRejected 
                ? 'bg-red-500 text-white' 
                : 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Reject item"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
});

ItemRow.displayName = 'ItemRow';

export const ItemApprovalSection = ({ items = [], onChange, disabled = false }) => {
  const [localItems, setLocalItems] = useState(() => 
    items.map(item => ({
      ...item,
      approval_status: item.approval_status || 'pending',
      approved_quantity: item.approved_quantity || item.quantity
    }))
  );

  const handleStatusChange = (index, status) => {
    const updated = [...localItems];
    updated[index] = { 
      ...updated[index], 
      approval_status: status,
      // Reset quantity to original if rejecting
      approved_quantity: status === 'rejected' ? 0 : (updated[index].approved_quantity || updated[index].quantity)
    };
    setLocalItems(updated);
    onChange?.(updated);
  };

  const handleQuantityChange = (index, quantity) => {
    const updated = [...localItems];
    updated[index] = { 
      ...updated[index], 
      approved_quantity: quantity,
      approval_status: 'approved' // Auto-approve when modifying quantity
    };
    setLocalItems(updated);
    onChange?.(updated);
  };

  const approvedCount = localItems.filter(i => i.approval_status === 'approved').length;
  const rejectedCount = localItems.filter(i => i.approval_status === 'rejected').length;
  const pendingCount = localItems.filter(i => i.approval_status === 'pending').length;

  const approveAll = () => {
    const updated = localItems.map(item => ({
      ...item,
      approval_status: 'approved',
      approved_quantity: item.approved_quantity || item.quantity
    }));
    setLocalItems(updated);
    onChange?.(updated);
  };

  const rejectAll = () => {
    const updated = localItems.map(item => ({
      ...item,
      approval_status: 'rejected',
      approved_quantity: 0
    }));
    setLocalItems(updated);
    onChange?.(updated);
  };

  if (!localItems.length) {
    return (
      <div className="text-center py-4 text-text-muted">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No items to review</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-secondary dark:text-gray-400">
            {localItems.length} item{localItems.length !== 1 ? 's' : ''} to review
          </span>
          {approvedCount > 0 && (
            <span className="text-green-600 font-medium">{approvedCount} approved</span>
          )}
          {rejectedCount > 0 && (
            <span className="text-red-600 font-medium">{rejectedCount} rejected</span>
          )}
          {pendingCount > 0 && (
            <span className="text-amber-600 font-medium">{pendingCount} pending</span>
          )}
        </div>
        
        {!disabled && (
          <div className="flex gap-2">
            <button
              onClick={approveAll}
              className="px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            >
              Approve All
            </button>
            <button
              onClick={rejectAll}
              className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Reject All
            </button>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {localItems.map((item, index) => (
          <ItemRow
            key={index}
            item={item}
            index={index}
            onStatusChange={handleStatusChange}
            onQuantityChange={handleQuantityChange}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Warning if some items rejected */}
      {rejectedCount > 0 && rejectedCount < localItems.length && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-amber-700 dark:text-amber-300">
            Partial approval: {approvedCount} item{approvedCount !== 1 ? 's' : ''} will be approved, 
            {rejectedCount} will be rejected.
          </p>
        </div>
      )}
    </div>
  );
};

export default ItemApprovalSection;
