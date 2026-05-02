import { useState } from 'react';
import { RotateCcw, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/common';
import { api } from '@/services/api';
import { REQUESTS } from '@/services/endpoints';
import { formatDate } from '@/utils/formatters';
import InitiateReturnModal from './InitiateReturnModal';
import ExtensionRequestModal from './ExtensionRequestModal';

/**
 * Return Section - Shows return info and allows engineer to initiate return
 * Shows for all Disbursed requests (with or without return date)
 * Uses InitiateReturnModal for per-item partial returns
 */
const ReturnSection = ({ request, onUpdate, isOwner }) => {
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const status = request?.status;
  const returnDate = request?.expected_return_date;
  const isOverdue = returnDate && new Date(returnDate) < new Date();
  const isConsumable = request?.details?.isConsumable || request?.is_consumable;
  const hasPendingExtension = request?.has_pending_extension;
  
  // Only show for disbursed items (unless consumable)
  if (status !== 'Disbursed') return null;
  if (isConsumable) return null;

  const handleInitiateReturn = async (payload) => {
    setLoading(true);
    try {
      await api.post(REQUESTS.INITIATE_RETURN(request.id), payload);
      setShowReturnModal(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to initiate return:', err);
      alert(err.response?.data?.message || err.message || 'Failed to initiate return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Return Info Banner */}
      <div className={`rounded-lg p-4 mb-6 ${
        isOverdue ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
        returnDate ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
        'bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border'
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {isOverdue ? (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            ) : (
              <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <h4 className={`font-medium ${
                isOverdue ? 'text-red-800 dark:text-red-300' :
                returnDate ? 'text-blue-800 dark:text-blue-300' :
                'text-gray-800 dark:text-dark-text'
              }`}>
                {isOverdue ? 'Return Overdue!' : returnDate ? 'Return Required' : 'Return Available'}
              </h4>
              {returnDate ? (
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
                  <p className={`text-sm ${isOverdue ? 'text-red-700 dark:text-red-300 font-medium' : 'text-blue-700 dark:text-blue-300'}`}>
                    {isOverdue ? 'Was due: ' : 'Due by: '}{formatDate(returnDate)}
                  </p>
                  {hasPendingExtension && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
                      Extension Pending
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  You can initiate a return for these items when ready.
                </p>
              )}
              {isOverdue && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Please return items or request an extension.
                </p>
              )}
            </div>
          </div>
          
          {isOwner && (
            <div className="flex flex-col sm:flex-row gap-2">
              {returnDate && !hasPendingExtension && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExtensionModal(true)}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Extend
                </Button>
              )}
              <Button
                variant={isOverdue ? 'danger' : 'primary'}
                size="sm"
                onClick={() => setShowReturnModal(true)}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Return
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Return Modal */}
      <InitiateReturnModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        request={request}
        onInitiate={handleInitiateReturn}
        isLoading={loading}
      />

      {/* Extension Request Modal */}
      <ExtensionRequestModal
        isOpen={showExtensionModal}
        onClose={() => setShowExtensionModal(false)}
        request={request}
        onSuccess={onUpdate}
      />
    </>
  );
};

export default ReturnSection;
