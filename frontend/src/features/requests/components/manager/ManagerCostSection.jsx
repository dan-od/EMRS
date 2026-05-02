/**
 * ManagerCostSection - Cost estimate input for manager
 */

const ManagerCostSection = ({ costEstimate, setCostEstimate }) => (
  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
    <label className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2 block">
      Cost Estimate
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-medium">₦</span>
      <input
        type="number"
        value={costEstimate}
        onChange={(e) => setCostEstimate(e.target.value)}
        placeholder="Enter estimated cost"
        className="w-full pl-8 pr-3 py-2 text-sm border border-emerald-200 dark:border-emerald-500/30 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />
    </div>
    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
      Purchasing will review and finalize the cost
    </p>
  </div>
);

export default ManagerCostSection;
