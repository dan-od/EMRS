/**
 * JobStatusTracker - Visual workflow progress bar
 */
import { Check } from 'lucide-react';
import { STATUS_FLOW, JOB_STATUS_CONFIG } from '../constants';

export const JobStatusTracker = ({ currentStatus }) => {
  if (currentStatus === 'CANCELLED') {
    return <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-lg text-center text-red-600 font-medium">Job Cancelled</div>;
  }

  const idx = STATUS_FLOW.indexOf(currentStatus);
  const pct = (idx / (STATUS_FLOW.length - 1)) * 100;

  return (
    <div className="relative">
      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700" />
      <div className="absolute top-5 left-0 h-1 bg-primary-500 transition-all" style={{ width: `${pct}%` }} />
      <div className="relative flex justify-between">
        {STATUS_FLOW.map((s, i) => {
          const past = i < idx, curr = i === idx;
          return (
            <div key={s} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm z-10
                ${past ? 'bg-green-500 text-white' : curr ? 'bg-primary-500 text-white ring-4 ring-primary-200' : 'bg-gray-200 text-gray-500'}`}>
                {past ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`mt-2 text-xs font-medium max-w-[70px] text-center ${curr ? 'text-primary-600' : past ? 'text-green-600' : 'text-gray-400'}`}>
                {JOB_STATUS_CONFIG[s]?.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobStatusTracker;
