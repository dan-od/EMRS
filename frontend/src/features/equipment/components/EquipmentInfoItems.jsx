/**
 * EquipmentInfoItems — shared sub-components for detail display
 */
import { formatNumber, formatDate, formatCurrency } from '@/utils/formatters';
import { formatTypeLabel } from '@/utils/equipmentConstants';
import { Badge } from '@/components/common';

export const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="text-center p-3 bg-gray-50 dark:bg-dark-card rounded-lg">
    <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
  </div>
);

export const DetailRow = ({ label, value }) => (
  <div className="flex justify-between">
    <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="text-sm font-medium text-gray-900 dark:text-white">{value || 'N/A'}</dd>
  </div>
);

/** Overview tab content for equipment detail */
export const EquipmentOverview = ({ equipment, showCost }) => {
  const isTool = equipment.asset_category === 'TOOL';

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      <div className="bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200/60 dark:border-white/10 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Details</h3>
        <dl className="space-y-3">
          <DetailRow label="Category" value={isTool ? 'Tool' : 'Equipment'} />
          <DetailRow label="Type" value={formatTypeLabel(equipment.type)} />
          <DetailRow label="Department" value={equipment.owning_department?.replace(/_/g, ' ')} />
          <DetailRow label="Model" value={equipment.model} />
          <DetailRow label="Manufacturer" value={equipment.manufacturer} />
          <DetailRow label="Year" value={equipment.year} />
          <DetailRow label="Maintenance Interval"
            value={equipment.maintenance_interval_hours ? `${formatNumber(equipment.maintenance_interval_hours)} hrs` : 'N/A'} />
          {showCost && equipment.cost != null && (
            <DetailRow label="Cost" value={formatCurrency(equipment.cost)} />
          )}
        </dl>
      </div>

      {equipment.notes && (
        <div className="bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200/60 dark:border-white/10 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{equipment.notes}</p>
        </div>
      )}

      {equipment.shared_with_departments?.length > 0 && (
        <div className="bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200/60 dark:border-white/10 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shared With</h3>
          <div className="flex flex-wrap gap-2">
            {equipment.shared_with_departments.map((dept) => (
              <Badge key={dept} variant="secondary">{dept.replace(/_/g, ' ')}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
