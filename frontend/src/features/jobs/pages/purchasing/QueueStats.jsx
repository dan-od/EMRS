/**
 * QueueStats - Stats cards for purchasing queue
 */
import { Package, Truck, AlertTriangle, Briefcase, RotateCcw, Wrench, Search } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-white/10">
    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
      <Icon className={`w-4 h-4 ${color}`} />
      {label}
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value || 0}</p>
  </div>
);

export const QueueStats = ({ stats = {} }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
    <StatCard 
      icon={Package} 
      label="Pending Disburse" 
      value={stats.pending_disburse} 
      color="text-blue-600" 
    />
    <StatCard 
      icon={Search} 
      label="Sourcing" 
      value={stats.sourcing} 
      color="text-purple-600" 
    />
    <StatCard 
      icon={Wrench} 
      label="Under Repair" 
      value={stats.pending_repair} 
      color="text-red-600" 
    />
    <StatCard 
      icon={Truck} 
      label="Out in Field" 
      value={stats.out_in_field} 
      color="text-orange-600" 
    />
    <StatCard 
      icon={RotateCcw} 
      label="Pending Return" 
      value={stats.pending_return} 
      color="text-teal-600" 
    />
    <StatCard 
      icon={Briefcase} 
      label="Active Jobs" 
      value={stats.active_jobs} 
      color="text-green-600" 
    />
    <StatCard 
      icon={AlertTriangle} 
      label="Critical" 
      value={stats.critical_pending} 
      color="text-red-600" 
    />
  </div>
);

export default QueueStats;
