/**
 * VehicleStats - Stats cards for vehicles page
 */
import { Truck, CheckCircle, Wrench } from 'lucide-react';
import { STAT_COLORS } from '../../constants/vehicleConstants';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-white/10">
    <div className="flex items-center gap-2 text-gray-500 dark:text-dark-muted text-sm mb-1">
      <Icon className="w-4 h-4" />
      {label}
    </div>
    <p className={`text-xl font-bold ${STAT_COLORS[color]}`}>{value}</p>
  </div>
);

const VehicleStats = ({ vehicles }) => {
  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'Available').length,
    inUse: vehicles.filter(v => v.status === 'In_Use').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Vehicles" value={stats.total} icon={Truck} color="blue" />
      <StatCard label="Available" value={stats.available} icon={CheckCircle} color="green" />
      <StatCard label="In Use" value={stats.inUse} icon={Truck} color="purple" />
      <StatCard label="Maintenance" value={stats.maintenance} icon={Wrench} color="yellow" />
    </div>
  );
};

export default VehicleStats;
