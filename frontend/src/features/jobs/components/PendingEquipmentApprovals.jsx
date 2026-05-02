/**
 * PendingEquipmentApprovals - Manager approval for job equipment requests
 * Shows equipment requests made on active jobs that need manager approval
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Check, X, ExternalLink, Clock, AlertTriangle, 
  User, Briefcase, MapPin, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { api } from '@/services/api';

// ============================================
// SUB-COMPONENTS
// ============================================
const PriorityBadge = ({ priority }) => {
  const colors = {
    Critical: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
    High: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30',
    Low: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30'
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${colors[priority] || colors.Medium}`}>
      {priority}
    </span>
  );
};

const RequestCard = ({ item, onApprove, onReject, processing }) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const itemName = item.equipment_name || item.requested_item_name || item.client_equipment_name || 'Unknown Item';
  const isProcessing = processing === item.id;

  const handleApprove = () => onApprove(item.id, notes);
  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(item.id, rejectReason);
    setShowRejectForm(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header - Clickable */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
              <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{itemName}</h4>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {item.job_number}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {item.requested_by_name || 'Unknown'}
                </span>
                {item.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={item.priority} />
            <span className="text-sm text-gray-500 dark:text-gray-400">×{item.quantity}</span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
          {/* Item Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Source:</span>
              <span className="ml-2 text-gray-900 dark:text-white capitalize">{item.source?.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Type:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{item.item_type === 'MATERIAL_TOOL' ? 'Material/Tool' : 'Equipment'}</span>
            </div>
            {item.client && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Client:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{item.client}</span>
              </div>
            )}
          </div>

          {/* Request Reason */}
          {(item.request_reason || item.reason) && (
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Request Reason:</span>
              <p className="text-sm text-gray-800 dark:text-gray-100">{item.request_reason || item.reason}</p>
            </div>
          )}

          {/* Description/Specs */}
          {(item.requested_item_description || item.description || item.requested_item_specs || item.specifications) && (
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {(item.requested_item_description || item.description) && (
                <div className="mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Description:</span>
                  <p className="text-sm text-gray-800 dark:text-gray-100">{item.requested_item_description || item.description}</p>
                </div>
              )}
              {(item.requested_item_specs || item.specifications) && (
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Specifications:</span>
                  <p className="text-sm text-gray-800 dark:text-gray-100">{item.requested_item_specs || item.specifications}</p>
                </div>
              )}
            </div>
          )}

          {/* Notes for approval */}
          {!showRejectForm && (
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Approval Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for this approval..."
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
                rows={2}
              />
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 rounded-lg">
              <label className="text-xs text-red-700 dark:text-red-300 block mb-1">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this request is being rejected..."
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-500/30 rounded-lg text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500 outline-none resize-none"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || isProcessing}
                  className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!showRejectForm && (
            <div className="flex items-center justify-between pt-2">
              <Link 
                to={`/jobs/${item.job_id}`}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View Job
              </Link>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowRejectForm(true)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-sm flex items-center gap-1 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-sm flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isProcessing ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const PendingEquipmentApprovals = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/jobs/equipment/pending-approval');
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch pending approvals:', err);
      setError('Failed to load pending job requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleApprove = async (itemId, notes) => {
    setProcessing(itemId);
    try {
      await api.post(`/jobs/equipment/${itemId}/manager-approve`, { notes });
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error('Failed to approve:', err);
      alert('Failed to approve request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (itemId, reason) => {
    setProcessing(itemId);
    try {
      await api.post(`/jobs/equipment/${itemId}/manager-reject`, { reason });
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error('Failed to reject:', err);
      alert('Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchItems}
          className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
          <Clock className="w-5 h-5 text-yellow-500" />
          Pending Equipment Requests
          {items.length > 0 && (
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
              {items.length}
            </span>
          )}
        </h3>
        <button
          onClick={fetchItems}
          className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No pending job requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <RequestCard 
              key={item.id} 
              item={item} 
              onApprove={handleApprove}
              onReject={handleReject}
              processing={processing}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingEquipmentApprovals;
