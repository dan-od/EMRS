/**
 * GroupedView - Equipment items grouped by job
 */
import { JobCard } from './JobCard';

export const GroupedView = ({ items, onDisburse, onReturn, onStartSourcing, onItemArrived, onDisburseArrived, onRepairComplete, onLinkDisburse }) => {
  // Group items by job
  const byJob = items.reduce((acc, item) => {
    const key = item.job_id;
    if (!acc[key]) {
      acc[key] = {
        job: {
          job_id: item.job_id,
          job_number: item.job_number,
          job_status: item.job_status,
          job_priority: item.job_priority,
          location: item.location,
          start_date: item.start_date
        },
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  const jobGroups = Object.values(byJob);

  if (jobGroups.length === 0) return null;

  return (
    <div className="space-y-6">
      {jobGroups.map(({ job, items: jobItems }) => (
        <JobCard 
          key={job.job_id} 
          job={job} 
          items={jobItems}
          onDisburse={onDisburse}
          onReturn={onReturn}
          onStartSourcing={onStartSourcing}
          onItemArrived={onItemArrived}
          onDisburseArrived={onDisburseArrived}
          onRepairComplete={onRepairComplete}
          onLinkDisburse={onLinkDisburse}
        />
      ))}
    </div>
  );
};

export default GroupedView;
