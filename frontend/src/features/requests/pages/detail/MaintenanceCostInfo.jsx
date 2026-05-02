export const MaintenanceCostInfo = ({ managerCostEstimate, costEstimate, purchasingFinalCost }) => {
  const hasEstimate = managerCostEstimate || costEstimate;
  const hasFinalCost = !!purchasingFinalCost;

  if (!hasEstimate && !hasFinalCost) return null;

  return (
    <>
      {hasEstimate && (
        <div className="p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
          <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">
            Cost Estimate (by Manager)
          </h4>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            ₦{(managerCostEstimate || costEstimate || 0).toLocaleString()}
          </p>
        </div>
      )}
      {hasFinalCost && (
        <div className="p-3 sm:p-4 bg-teal-50 dark:bg-teal-500/10 rounded-xl border border-teal-200 dark:border-teal-500/30">
          <h4 className="text-sm font-medium text-teal-800 dark:text-teal-300 mb-2">
            Final Cost (by Purchasing)
          </h4>
          <p className="text-lg font-bold text-teal-700 dark:text-teal-400">
            ₦{(purchasingFinalCost || 0).toLocaleString()}
          </p>
        </div>
      )}
    </>
  );
};
