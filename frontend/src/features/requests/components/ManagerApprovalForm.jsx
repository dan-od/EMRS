/**
 * ManagerApprovalForm - Manager approval for Maintenance requests
 * MODULAR: Uses sub-components from ./manager/
 */
import { useState, useEffect } from 'react';
import { Button, Modal } from '@/components/common';
import { Check, X } from 'lucide-react';
import { api } from '@/services/api';
import { 
  ManagerIssueSummary, 
  ServiceTypeDisplay, 
  ManagerMaterialsSection, 
  ManagerToolsSection, 
  ManagerVendorSection, 
  ManagerCostSection 
} from './manager';

const ManagerApprovalForm = ({ request, onApprove, onReject, isLoading, isOpen, onClose }) => {
  const details = request?.details || {};
  const [costEstimate, setCostEstimate] = useState('');
  const [comments, setComments] = useState('');
  const [vendorRecommendation, setVendorRecommendation] = useState({ vendorName: '', contact: '', notes: '' });
  const [additionalMaterials, setAdditionalMaterials] = useState([]);
  const [additionalTools, setAdditionalTools] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch vendors when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchVendors = async () => {
      try {
        const response = await api.get('/vendors');
        const data = response.data;
        
        // Handle various response formats
        let vendorList = [];
        if (Array.isArray(data)) {
          vendorList = data;
        } else if (data?.data && Array.isArray(data.data)) {
          vendorList = data.data;
        } else if (data?.vendors && Array.isArray(data.vendors)) {
          vendorList = data.vendors;
        } else if (data?.items && Array.isArray(data.items)) {
          vendorList = data.items;
        }
        
        setVendors(vendorList);
      } catch (err) {
        console.error('Failed to fetch vendors:', err);
        setVendors([]);
      }
    };
    
    fetchVendors();
  }, [isOpen]);

  // Pre-fill from existing data
  useEffect(() => {
    if (details.managerVendorRecommendation) {
      setVendorRecommendation(details.managerVendorRecommendation);
    } else if (details.vendorRecommendation?.vendorName) {
      setVendorRecommendation(details.vendorRecommendation);
    }
    if (details.costEstimate) setCostEstimate(details.costEstimate.toString());
    if (details.managerMaterialAdditions) setAdditionalMaterials(details.managerMaterialAdditions);
    if (details.managerToolAdditions) setAdditionalTools(details.managerToolAdditions);
    if (details.managerNotes) setComments(details.managerNotes);
  }, [details]);

  const handleApprove = () => {
    onApprove({ 
      comments, 
      managerData: {
        costEstimate: costEstimate ? parseFloat(costEstimate) : null,
        vendorRecommendation: vendorRecommendation.vendorName ? vendorRecommendation : null,
        additionalMaterials: additionalMaterials.length > 0 ? additionalMaterials : null,
        additionalTools: additionalTools.length > 0 ? additionalTools : null,
        managerNotes: comments || null
      }
    });
    onClose();
  };

  const handleReject = () => { 
    if (!rejectReason.trim()) return; 
    onReject(rejectReason); 
    setShowRejectModal(false); 
    onClose(); 
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Review Maintenance Request" size="lg">
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
          <ManagerIssueSummary 
            details={details} 
            engineerNotes={request?.notes || details.additionalNotes} 
          />
          
          <ServiceTypeDisplay serviceType={details.serviceType} />
          
          <ManagerMaterialsSection 
            engineerMaterials={details.materials || []} 
            additionalMaterials={additionalMaterials} 
            setAdditionalMaterials={setAdditionalMaterials} 
          />
          
          <ManagerToolsSection 
            engineerTools={details.tools || []} 
            additionalTools={additionalTools} 
            setAdditionalTools={setAdditionalTools} 
          />
          
          <ManagerVendorSection 
            engineerVendor={details.vendorRecommendation} 
            vendorRecommendation={vendorRecommendation} 
            setVendorRecommendation={setVendorRecommendation} 
            vendors={vendors} 
          />
          
          <ManagerCostSection 
            costEstimate={costEstimate} 
            setCostEstimate={setCostEstimate} 
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comments for Purchasing
            </label>
            <textarea 
              value={comments} 
              onChange={(e) => setComments(e.target.value)} 
              placeholder="Notes for Purchasing team..." 
              rows={3} 
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border sticky bottom-0 bg-white dark:bg-[#1a1f26] pb-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setShowRejectModal(true)} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />Reject
            </Button>
            <Button variant="success" onClick={handleApprove} isLoading={isLoading}>
              <Check className="w-4 h-4 mr-2" />Approve
            </Button>
          </div>
        </div>
      </Modal>
      
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Request" size="sm">
        <div className="space-y-4">
          <textarea 
            value={rejectReason} 
            onChange={(e) => setRejectReason(e.target.value)} 
            placeholder="Reason for rejection..." 
            rows={3} 
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} disabled={!rejectReason.trim()}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ManagerApprovalForm;
