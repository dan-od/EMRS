/**
 * AddEquipment Page
 * Purchasing/Managers add equipment directly.
 * Backend: POST /equipment (camelCase body)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, Button, Input, Select, Textarea } from '@/components/common';
import { AssetCategoryTypeSelect } from '../components/AssetCategoryTypeSelect';
import { equipmentService } from '../services/equipmentService';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import {
  DEPARTMENTS_LIST,
  canEditAllEquipment,
  EQUIPMENT_STATUS_LIST
} from '@/utils/equipmentConstants';
import { Save, X } from 'lucide-react';

// Status list (from backend validation)
const STATUS_OPTIONS = ['Available', 'In_Use', 'Maintenance', 'Out_of_Service'];

const AddEquipment = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { addNotification } = useUiStore();

  const canChooseDept = canEditAllEquipment(user?.role);

  const [form, setForm] = useState({
    name: '',
    serialNumber: '',
    assetCategory: '',
    type: '',
    status: 'Available',
    owningDepartment: canChooseDept ? '' : user?.department || '',
    quantity: 1,
    cost: '',
    location: '',
    maintenanceIntervalHours: '',
    notes: '',
    sharedWithDepartments: []
  });
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity) || 1,
        cost: form.cost ? Number(form.cost) : null,
        maintenanceIntervalHours: form.maintenanceIntervalHours
          ? Number(form.maintenanceIntervalHours)
          : null
      };

      await equipmentService.create(payload);
      addNotification({ type: 'success', message: 'Equipment added successfully' });
      navigate('/equipment');
    } catch (err) {
      addNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to add equipment'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper title="Add Equipment" backButton backTo="/equipment">
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Serial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Equipment Name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. CAT 3512 Generator"
              required
            />
            <Input
              label="Serial Number"
              value={form.serialNumber}
              onChange={(e) => set('serialNumber', e.target.value)}
              placeholder="e.g. SN-2024-001"
            />
          </div>

          {/* Category & Type */}
          <AssetCategoryTypeSelect
            category={form.assetCategory}
            type={form.type}
            onCategoryChange={(v) => set('assetCategory', v)}
            onTypeChange={(v) => set('type', v)}
          />

          {/* Status & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </Select>

            <Select
              label="Owning Department"
              value={form.owningDepartment}
              onChange={(e) => set('owningDepartment', e.target.value)}
              disabled={!canChooseDept}
              required
            >
              {canChooseDept && <option value="">Select department…</option>}
              {DEPARTMENTS_LIST.map(d => (
                <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
              ))}
            </Select>
          </div>

          {/* Quantity, Cost, Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
            />
            <Input
              label="Cost (₦)"
              type="number"
              min="0"
              step="0.01"
              value={form.cost}
              onChange={(e) => set('cost', e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Location"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g. Warehouse A"
            />
          </div>

          {/* Maintenance Interval */}
          <Input
            label="Maintenance Interval (hours)"
            type="number"
            min="1"
            value={form.maintenanceIntervalHours}
            onChange={(e) => set('maintenanceIntervalHours', e.target.value)}
            placeholder="e.g. 500"
          />

          {/* Notes */}
          <Textarea
            label="Notes"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            placeholder="Additional details…"
          />

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
            <Button type="button" variant="ghost" onClick={() => navigate('/equipment')} className="w-full sm:w-auto">
              <X className="w-4 h-4 mr-2" />Cancel
            </Button>
            <Button type="submit" isLoading={saving} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />Add Equipment
            </Button>
          </div>
        </form>
      </Card>
    </PageWrapper>
  );
};

export default AddEquipment;
