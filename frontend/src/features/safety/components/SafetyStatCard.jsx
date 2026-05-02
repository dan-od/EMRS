import { Card, CardContent } from '@/components/common';

export const SafetyStatCard = ({ title, value, icon: Icon, color = 'primary', trend }) => {
  const colorClasses = {
    primary: 'bg-primary-50 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400',
    success: 'bg-green-50 dark:bg-green-500/20 text-green-500 dark:text-green-400',
    warning: 'bg-yellow-50 dark:bg-yellow-500/20 text-yellow-500 dark:text-yellow-400',
    error: 'bg-red-50 dark:bg-red-500/20 text-red-500 dark:text-red-400',
    info: 'bg-blue-50 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400'
  };

  return (
    <Card className="bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            {trend && (
              <p className={`text-xs mt-1 ${trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {trend > 0 ? '+' : ''}{trend}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
