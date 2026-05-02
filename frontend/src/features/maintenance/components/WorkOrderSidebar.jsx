/**
 * WorkOrderSidebar
 * Sidebar with equipment info, timeline, and assignment prompt
 * Now includes additional request events in timeline
 */
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@/components/common';
import { Package, UserPlus } from 'lucide-react';
import { formatDateTime } from '@/utils/formatters';

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    <span className="font-medium text-gray-900 dark:text-white">{value || '-'}</span>
  </div>
);

const TimelineItem = ({ label, value, by, variant = 'default' }) => {
  const variantStyles = {
    default: 'text-gray-500 dark:text-gray-400',
    additional: 'text-amber-600 dark:text-amber-400',
    disbursed: 'text-green-600 dark:text-green-400'
  };

  return (
    <div className="flex justify-between items-start">
      <span className={variantStyles[variant]}>{label}</span>
      <div className="text-right">
        <p className="text-gray-900 dark:text-white">{value}</p>
        {by && <p className="text-xs text-gray-400">{by}</p>}
      </div>
    </div>
  );
};

const WorkOrderSidebar = ({ maintenance, canManage, onAssign }) => {
  const navigate = useNavigate();
  const showAssignPrompt = canManage && !maintenance.assigned_to && maintenance.status === 'Scheduled';
  
  // Build timeline events including additional requests
  const timelineEvents = buildTimeline(maintenance);

  return (
    <div className="space-y-6">
      {/* Assignment Prompt */}
      {showAssignPrompt && (
        <Card className="border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5">
          <div className="flex items-start gap-3">
            <UserPlus className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Unassigned</h3>
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">Assign an engineer to start.</p>
              <Button size="sm" onClick={onAssign}><UserPlus className="w-4 h-4 mr-2" />Assign Now</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Equipment */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />Equipment
        </h3>
        <div className="space-y-2">
          <DetailRow label="Name" value={maintenance.equipment_name} />
          <DetailRow label="Serial" value={maintenance.equipment_serial} />
          <DetailRow label="Category" value={maintenance.equipment_category} />
          <DetailRow label="Current Hours" value={maintenance.equipment_hours} />
        </div>
        <Button variant="outline" className="w-full mt-4" onClick={() => navigate(`/equipment/${maintenance.equipment_id}`)}>
          View Equipment
        </Button>
      </Card>

      {/* Timeline */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Timeline</h3>
        <div className="space-y-3 text-sm">
          {timelineEvents.map((event, idx) => (
            <TimelineItem 
              key={idx}
              label={event.label}
              value={event.value}
              by={event.by}
              variant={event.variant}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

/**
 * Build timeline events from maintenance data
 * Includes work order events + additional request events
 */
const buildTimeline = (maintenance) => {
  const events = [];

  // Created
  if (maintenance.created_at) {
    events.push({
      label: 'Created',
      value: formatDateTime(maintenance.created_at),
      by: maintenance.created_by_name,
      date: new Date(maintenance.created_at),
      variant: 'default'
    });
  }

  // Assigned
  if (maintenance.assigned_at) {
    events.push({
      label: 'Assigned',
      value: formatDateTime(maintenance.assigned_at),
      by: maintenance.assigned_to_name,
      date: new Date(maintenance.assigned_at),
      variant: 'default'
    });
  }

  // Started
  if (maintenance.started_at) {
    events.push({
      label: 'Started',
      value: formatDateTime(maintenance.started_at),
      date: new Date(maintenance.started_at),
      variant: 'default'
    });
  }

  // Additional Requests
  const additionalRequests = maintenance.additional_requests || [];
  additionalRequests.forEach((req, idx) => {
    const reqDetails = typeof req.details === 'string' 
      ? JSON.parse(req.details) 
      : req.details || {};
    const itemCount = (reqDetails.materials?.length || 0) + (reqDetails.tools?.length || 0);

    // Request created
    events.push({
      label: `Additional #${idx + 1}`,
      value: formatDateTime(req.created_at),
      by: `${itemCount} item(s) requested`,
      date: new Date(req.created_at),
      variant: 'additional'
    });

    // Request disbursed
    if (req.status === 'Disbursed' && req.updated_at) {
      events.push({
        label: `Additional #${idx + 1} Disbursed`,
        value: formatDateTime(req.updated_at),
        date: new Date(req.updated_at),
        variant: 'disbursed'
      });
    }
  });

  // Completed
  if (maintenance.completed_at) {
    events.push({
      label: 'Completed',
      value: formatDateTime(maintenance.completed_at),
      by: maintenance.completed_by_name,
      date: new Date(maintenance.completed_at),
      variant: 'default'
    });
  }

  // Cancelled
  if (maintenance.cancelled_at) {
    events.push({
      label: 'Cancelled',
      value: formatDateTime(maintenance.cancelled_at),
      date: new Date(maintenance.cancelled_at),
      variant: 'default'
    });
  }

  // Sort by date
  events.sort((a, b) => a.date - b.date);

  return events;
};

export default WorkOrderSidebar;
