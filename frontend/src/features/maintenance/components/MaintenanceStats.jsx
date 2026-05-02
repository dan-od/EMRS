/**
 * MaintenanceStats Component
 * Displays maintenance statistics cards - styled like Damaged/Missing page
 */

import { Calendar, PlayCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const MaintenanceStats = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {/* Scheduled */}
      <div className="bg-blue-50 dark:bg-blue-500/15 rounded-xl p-3 border border-blue-200 dark:border-blue-500/20">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs mb-1">
          <Calendar className="w-4 h-4" />
          Scheduled
        </div>
        <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
          {stats?.scheduled_count || 0}
        </p>
      </div>

      {/* In Progress */}
      <div className="bg-orange-50 dark:bg-orange-500/15 rounded-xl p-3 border border-orange-200 dark:border-orange-500/20">
        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-xs mb-1">
          <PlayCircle className="w-4 h-4" />
          In Progress
        </div>
        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
          {stats?.in_progress_count || 0}
        </p>
      </div>

      {/* Overdue */}
      <div className="bg-red-50 dark:bg-red-500/15 rounded-xl p-3 border border-red-200 dark:border-red-500/20">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs mb-1">
          <AlertTriangle className="w-4 h-4" />
          Overdue
        </div>
        <p className="text-xl font-bold text-red-600 dark:text-red-400">
          {stats?.overdue_count || 0}
        </p>
      </div>

      {/* Completed (Month) */}
      <div className="bg-green-50 dark:bg-green-500/15 rounded-xl p-3 border border-green-200 dark:border-green-500/20">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs mb-1">
          <CheckCircle className="w-4 h-4" />
          Completed (Month)
        </div>
        <p className="text-xl font-bold text-green-600 dark:text-green-400">
          {stats?.completed_count || 0}
        </p>
      </div>
    </div>
  );
};

export default MaintenanceStats;
