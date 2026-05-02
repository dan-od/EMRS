import { Package } from 'lucide-react';

const MaterialRow = ({ material, idx }) => (
  <div
    key={material.id || idx}
    className="flex items-start sm:items-center justify-between gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg"
  >
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{material.name}</p>
      {material.specs && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{material.specs}</p>
      )}
    </div>
    <span className="text-sm text-gray-600 dark:text-gray-300">
      {material.quantity} {material.unit}
    </span>
  </div>
);

export const MaintenanceMaterialsList = ({ materials, managerMaterialAdditions }) => {
  const hasMaterials = materials && materials.length > 0;
  const hasManagerAdditions = managerMaterialAdditions && managerMaterialAdditions.length > 0;

  if (!hasMaterials && !hasManagerAdditions) return null;

  return (
    <>
      {hasMaterials && (
        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/30">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Materials / Parts Needed
          </h4>
          <div className="space-y-2">
            {materials.map((m, idx) => <MaterialRow key={m.id || idx} material={m} idx={idx} />)}
          </div>
        </div>
      )}
      {hasManagerAdditions && (
        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-300 dark:border-green-500/40">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Additional Materials (Added by Manager)
          </h4>
          <div className="space-y-2">
            {managerMaterialAdditions.map((m, idx) => (
              <div key={m.id || idx} className="flex items-start sm:items-center justify-between gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
                <span className="text-sm text-gray-600 dark:text-gray-300">{m.quantity} {m.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
