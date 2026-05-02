/**
 * EquipmentSection Component
 * Displays and manages job equipment assignments
 */
import { memo, useState } from 'react';
import { Card, CardContent, Button, StatusBadge } from '@/components/common';
import { Package, Plus, X, Truck } from 'lucide-react';
import { AddEquipmentModal } from './AddEquipmentModal';
import { useEquipmentActions } from '../hooks/useJobs';
import { formatDate } from '@/utils/formatters';

export const EquipmentSection = memo(({ jobId, equipment = [], onRefresh, canEdit = false }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { removeEquipment, isLoading } = useEquipmentActions(jobId);

  const handleRemove = async (equipmentId) => {
    if (!window.confirm('Remove this equipment from the job?')) return;
    try {
      await removeEquipment(equipmentId);
      onRefresh?.();
    } catch (err) {
      console.error('Failed to remove equipment:', err);
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    onRefresh?.();
  };

  const assignedEquipment = equipment.filter(e => !e.returned_at);
  const returnedEquipment = equipment.filter(e => e.returned_at);

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-primary flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-500" />
              Equipment ({assignedEquipment.length})
            </h3>
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Assign
              </Button>
            )}
          </div>

          {equipment.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              No equipment assigned yet
            </p>
          ) : (
            <div className="space-y-2">
              {assignedEquipment.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-background-secondary dark:bg-[#242b33] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-500/20 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-muted">
                        {item.serial_number} • {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.equipment_status} size="sm" />
                    {canEdit && (
                      <button
                        onClick={() => handleRemove(item.equipment_id)}
                        disabled={isLoading}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {returnedEquipment.length > 0 && (
                <>
                  <div className="pt-3 mt-3 border-t border-border-light dark:border-gray-700">
                    <p className="text-xs text-text-muted mb-2">Returned Equipment</p>
                  </div>
                  {returnedEquipment.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Truck className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{item.name}</p>
                          <p className="text-xs text-text-muted">
                            Returned: {formatDate(item.returned_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && (
        <AddEquipmentModal
          jobId={jobId}
          existingEquipment={equipment.map(e => e.equipment_id)}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </>
  );
});

EquipmentSection.displayName = 'EquipmentSection';
export default EquipmentSection;
