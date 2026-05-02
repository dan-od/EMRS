import { Wrench } from 'lucide-react';

const ToolRow = ({ tool, idx }) => (
  <div
    key={tool.id || idx}
    className="flex items-start sm:items-center justify-between gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg"
  >
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{tool.name}</p>
      {tool.serialNumber && <p className="text-xs text-gray-500 dark:text-gray-400">S/N: {tool.serialNumber}</p>}
      {tool.specs && <p className="text-xs text-gray-500 dark:text-gray-400">{tool.specs}</p>}
    </div>
    <span className={`px-2 py-0.5 text-xs rounded-full ${
      tool.isFromEquipmentList
        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
    }`}>
      {tool.isFromEquipmentList ? 'From Inventory' : 'Custom'}
    </span>
  </div>
);

export const MaintenanceToolsList = ({ tools, managerToolAdditions }) => {
  const hasTools = tools && tools.length > 0;
  const hasManagerAdditions = managerToolAdditions && managerToolAdditions.length > 0;

  if (!hasTools && !hasManagerAdditions) return null;

  return (
    <>
      {hasTools && (
        <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30">
          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Tools / Equipment Needed
          </h4>
          <div className="space-y-2">
            {tools.map((t, idx) => <ToolRow key={t.id || idx} tool={t} idx={idx} />)}
          </div>
        </div>
      )}
      {hasManagerAdditions && (
        <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-300 dark:border-amber-500/40">
          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Additional Tools (Added by Manager)
          </h4>
          <div className="space-y-2">
            {managerToolAdditions.map((t, idx) => (
              <div key={t.id || idx} className="flex items-start sm:items-center justify-between gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
