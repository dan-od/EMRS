/**
 * Create Request Page
 * Form for creating a specific request type (receives type from URL)
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common';
import { useRequestActions } from '../hooks/useRequests';
import { useUIStore } from '@/store/uiStore';
import { 
  PPERequestForm, 
  TransportRequestForm, 
  MaterialRequestForm, 
  EquipmentRequestForm,
  MaintenanceRequestForm
} from '../forms';
import { HardHat, Truck, Package, Wrench, Settings, ChevronLeft } from 'lucide-react';

const TYPE_CONFIG = {
  PPE: { 
    icon: HardHat, 
    form: PPERequestForm, 
    color: 'text-red-500',
    title: 'PPE Request'
  },
  TRANSPORT: { 
    icon: Truck, 
    form: TransportRequestForm, 
    color: 'text-purple-500',
    title: 'Transport Request'
  },
  MATERIAL: { 
    icon: Package, 
    form: MaterialRequestForm, 
    color: 'text-green-500',
    title: 'Material Request'
  },
  EQUIPMENT: { 
    icon: Wrench, 
    form: EquipmentRequestForm, 
    color: 'text-orange-500',
    title: 'Equipment Request'
  },
  MAINTENANCE: { 
    icon: Settings, 
    form: MaintenanceRequestForm, 
    color: 'text-amber-500',
    title: 'Maintenance Request'
  },
};

const CreateRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uiStore = useUIStore();
  const { createRequest, isLoading } = useRequestActions();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Get type from URL param
  const typeFromUrl = searchParams.get('type');
  const [selectedType, setSelectedType] = useState(typeFromUrl || null);

  // Update selected type if URL changes
  useEffect(() => {
    if (typeFromUrl && TYPE_CONFIG[typeFromUrl]) {
      setSelectedType(typeFromUrl);
    }
  }, [typeFromUrl]);

  const handleSubmit = async (payload) => {
    setError(null);
    setSuccess(false);

    const fullPayload = notes.trim() ? { ...payload, notes: notes.trim() } : payload;

    try {
      await createRequest(fullPayload);
      setSuccess(true);
      
      // Try to show notification if available
      if (uiStore?.addNotification) {
        uiStore.addNotification({ type: 'success', message: 'Request submitted successfully' });
      }
      
      // Navigate after short delay to show success
      setTimeout(() => navigate('/requests/my'), 500);
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit request';
      setError(errorMessage);
      
      if (uiStore?.addNotification) {
        uiStore.addNotification({ type: 'error', message: errorMessage });
      }
    }
  };

  const handleBack = () => {
    navigate('/requests');
  };

  // If no valid type, show redirect to hub
  if (!selectedType || !TYPE_CONFIG[selectedType]) {
    return (
      <PageWrapper title="New Request">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-text-secondary dark:text-dark-muted mb-4">Please select a request type</p>
          <button
            onClick={() => navigate('/requests')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go to Request Hub
          </button>
        </div>
      </PageWrapper>
    );
  }

  const config = TYPE_CONFIG[selectedType];
  const FormComponent = config.form;
  const Icon = config.icon;

  return (
    <PageWrapper title="New Request">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400">
            Request submitted successfully! Redirecting...
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBack}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-text-secondary dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${config.color}`} />
                <CardTitle>{config.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <FormComponent onSubmit={handleSubmit} isLoading={isLoading} />
              <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-2">
                <label htmlFor="request-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Additional Notes <span className="text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="request-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Any additional context for this request..."
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 resize-none"
                />
                {notes.length > 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-right">{notes.length}/2000</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default CreateRequest;