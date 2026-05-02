/**
 * RequestAssetForm Page
 * Staff/Engineers submit "Request Asset" → Manager approves → Equipment added
 * Backend: POST /equipment/requests (camelCase body)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, Button, Input, Textarea } from '@/components/common';
import { AssetCategoryTypeSelect } from '../components/AssetCategoryTypeSelect';
import { equipmentService } from '../services/equipmentService';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { Send, X } from 'lucide-react';

const RequestAssetForm = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { addNotification } = useUiStore();

  const [form, setForm] = useState({
    name: '',
    assetCategory: '',
    type: '',
    serialNumber: '',
    quantity: 1,
    location: '',
    notes: '',
    justification: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.justification.trim()) {
      addNotification({ type: 'error', message: 'Please provide a justification' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity) || 1
      };
      await equipmentService.createRequest(payload);
      addNotification({
        type: 'success',
        message: 'Request submitted. Your manager will review it shortly.'
      });
      navigate('/equipment');
    } catch (err) {
      addNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit request'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper title="Request New Asset" backButton backTo="/equipment">
      <Card className="max-w-2xl">
        <div className="mb-5 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            This request will be sent to your department manager for approval.
            Once approved, the asset will be added to the <strong>{user?.department}</strong> inventory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Serial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Asset Name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Torque Wrench Set"
              required
            />
            <Input
              label="Serial Number (if known)"
              value={form.serialNumber}
              onChange={(e) => set('serialNumber', e.target.value)}
              placeholder="Optional"
            />
          </div>

          {/* Category & Type */}
          <AssetCategoryTypeSelect
            category={form.assetCategory}
            type={form.type}
            onCategoryChange={(v) => set('assetCategory', v)}
            onTypeChange={(v) => set('type', v)}
          />

          {/* Quantity & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
            />
            <Input
              label="Intended Location"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g. Field Site B"
            />
          </div>

          {/* Department (locked) */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm">
            <span className="text-text-secondary dark:text-dark-muted">Department: </span>
            <span className="font-medium text-text-primary dark:text-dark-text">
              {user?.department?.replace(/_/g, ' ')}
            </span>
            <span className="text-text-muted dark:text-dark-muted ml-1">(auto-assigned)</span>
          </div>

          {/* Justification (required) */}
          <Textarea
            label="Justification"
            value={form.justification}
            onChange={(e) => set('justification', e.target.value)}
            rows={3}
            placeholder="Why is this asset needed? How will it be used?"
            required
          />

          {/* Notes */}
          <Textarea
            label="Additional Notes (optional)"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            placeholder="Preferred brand, specifications, urgency…"
          />

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
            <Button type="button" variant="ghost" onClick={() => navigate('/equipment')} className="w-full sm:w-auto">
              <X className="w-4 h-4 mr-2" />Cancel
            </Button>
            <Button type="submit" isLoading={submitting} className="w-full sm:w-auto">
              <Send className="w-4 h-4 mr-2" />Submit Request
            </Button>
          </div>
        </form>
      </Card>
    </PageWrapper>
  );
};

export default RequestAssetForm;
