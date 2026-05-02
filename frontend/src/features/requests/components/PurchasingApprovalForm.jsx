/**
 * PurchasingApprovalForm - Full approval form for Maintenance requests
 * Links materials to inventory, tools to equipment, confirms vendor, finalizes cost
 * Approve → Creates Work Order
 */
import { useState } from 'react';
import { Modal, Button } from '@/components/common';
import { Check, X, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import {
  IssueSummary,
  MaterialsLinkSection,
  ToolsLinkSection,
  VendorConfirmSection,
  FinalCostSection
} from './purchasing';

const PurchasingApprovalForm = ({ request, isOpen, onClose, onSuccess }) => {
  const { addNotification } = useUIStore();
  const details = request?.details || {};
  
  // Form state
  const [finalCost, setFinalCost] = useState(details.costEstimate || request?.manager_cost_estimate || '');
  const [comments, setComments] = useState('');
  const [materialLinks, setMaterialLinks] = useState({});
  const [toolLinks, setToolLinks] = useState({});
  const [selectedVendor, setSelectedVendor] = useState(
    details.managerVendorRecommendation || details.vendorRecommendation || null
  );
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Handle material link
  const handleMaterialLink = (index, inventoryId) => {
    setMaterialLinks(prev => ({
      ...prev,
      [index]: inventoryId
    }));
  };

  // Handle tool link
  const handleToolLink = (index, equipmentId) => {
    setToolLinks(prev => ({
      ...prev,
      [index]: equipmentId
    }));
  };

  // Build linked materials array
  const buildLinkedMaterials = () => {
    const allMaterials = [
      ...(details.materials || []).map(m => ({ ...m, source: 'engineer' })),
      ...(details.managerMaterialAdditions || []).map(m => ({ ...m, source: 'manager' }))
    ];
    
    return allMaterials.map((material, idx) => ({
      ...material,
      linkedInventoryId: materialLinks[idx] || material.linkedInventoryId || null
    }));
  };

  // Build linked tools array
  const buildLinkedTools = () => {
    const allTools = [
      ...(details.tools || []).map(t => ({ ...t, source: 'engineer' })),
      ...(details.managerToolAdditions || []).map(t => ({ ...t, source: 'manager' }))
    ];
    
    return allTools.map((tool, idx) => ({
      ...tool,
      linkedEquipmentId: toolLinks[idx] || tool.linkedEquipmentId || tool.equipmentId || null
    }));
  };

  // Handle approve
  const handleApprove = async () => {
    if (!finalCost) {
      addNotification({ type: 'error', message: 'Please enter a final cost' });
      return;
    }

    setIsSubmitting(true);
    try {
      const isAdditionalRequest = details.isAdditionalRequest;
      
      if (isAdditionalRequest) {
        // Additional Material requests - DISBURSE them (they're already manager-approved)
        await api.post(`/requests/${request.id}/disburse`, {
          notes: comments,
          withoutApproval: false,
          purchasingData: {
            finalCost: parseFloat(finalCost),
            purchasingNotes: comments,
            confirmedVendor: selectedVendor,
            linkedMaterials: buildLinkedMaterials(),
            linkedTools: buildLinkedTools()
          }
        });
        
        addNotification({ 
          type: 'success', 
          message: 'Additional materials disbursed to work order!' 
        });
      } else {
        // Regular Maintenance requests - APPROVE to create Work Order
        const purchasingData = {
          finalCost: parseFloat(finalCost),
          purchasingNotes: comments,
          confirmedVendor: selectedVendor,
          linkedMaterials: buildLinkedMaterials(),
          linkedTools: buildLinkedTools()
        };

        await api.post(`/requests/${request.id}/approve`, {
          comments,
          purchasingData
        });

        addNotification({ 
          type: 'success', 
          message: 'Request approved! Work Order created.' 
        });
      }
      
      onSuccess?.();
    } catch (err) {
      console.error('Action failed:', err);
      addNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to process request' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      addNotification({ type: 'error', message: 'Please provide a reason for rejection' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/requests/${request.id}/reject`, {
        reason: rejectReason
      });

      addNotification({ type: 'success', message: 'Request rejected' });
      setShowRejectModal(false);
      onSuccess?.();
    } catch (err) {
      console.error('Rejection failed:', err);
      addNotification({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to reject request' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Review Maintenance Request"
        size="xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Issue Summary */}
          <IssueSummary request={request} />

          {/* Materials Section */}
          <MaterialsLinkSection
            request={request}
            materialLinks={materialLinks}
            onMaterialLink={handleMaterialLink}
          />

          {/* Tools Section */}
          <ToolsLinkSection
            request={request}
            toolLinks={toolLinks}
            onToolLink={handleToolLink}
          />

          {/* Vendor Section */}
          <VendorConfirmSection
            request={request}
            selectedVendor={selectedVendor}
            onVendorSelect={setSelectedVendor}
          />

          {/* Final Cost Section */}
          <FinalCostSection
            request={request}
            value={finalCost}
            onChange={setFinalCost}
          />

          {/* Purchasing Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Purchasing Notes (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any notes about procurement, vendor selection, delivery timeline..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
          <Button
            variant="outline"
            onClick={() => setShowRejectModal(true)}
            disabled={isSubmitting}
            className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-500/50 dark:hover:bg-red-500/10"
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isSubmitting || !finalCost}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {details.isAdditionalRequest ? 'Disburse to Work Order' : 'Approve & Create Work Order'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Request"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">
              This will reject the maintenance request and notify the requester and their manager.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Rejection *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this request is being rejected..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              required
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={isSubmitting || !rejectReason.trim()}
            >
              {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PurchasingApprovalForm;
