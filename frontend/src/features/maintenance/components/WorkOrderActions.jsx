/**
 * WorkOrderActions
 * Action buttons for work order detail page
 * Purchasing can only view - no action buttons for them
 */
import { Button } from '@/components/common';
import { UserPlus, Plus, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const WorkOrderActions = ({
  maintenance,
  canManage,
  canWork,
  isAssignedEngineer,
  isLoading,
  onAssign,
  onRequestAdditional,
  onStart,
  onComplete,
  onCancel
}) => {
  const user = useAuthStore(s => s.user);
  const userRole = user?.role?.toLowerCase() || '';
  
  // Purchasing can only view work orders - no actions
  const isPurchasing = userRole.includes('purchasing');
  if (isPurchasing) {
    return null;
  }

  const canAssign = canManage && ['Scheduled', 'In_Progress'].includes(maintenance?.status);
  const canRequestAdditional = isAssignedEngineer && maintenance?.status === 'In_Progress';
  const showStart = maintenance?.status === 'Scheduled' && canWork;
  const showComplete = maintenance?.status === 'In_Progress' && canWork;
  const showCancel = ['Scheduled', 'In_Progress'].includes(maintenance?.status) && canManage;

  // Don't render if no actions available
  if (!canAssign && !canRequestAdditional && !showStart && !showComplete && !showCancel) {
    return null;
  }

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-2">
      {canAssign && (
        <Button variant="outline" onClick={onAssign} className="w-full sm:w-auto">
          <UserPlus className="w-4 h-4 mr-2" />Assign Engineer
        </Button>
      )}
      {canRequestAdditional && (
        <Button variant="outline" onClick={onRequestAdditional} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />Request Additional
        </Button>
      )}
      {showStart && (
        <Button onClick={onStart} isLoading={isLoading} className="w-full sm:w-auto">
          <PlayCircle className="w-4 h-4 mr-2" />Start Work
        </Button>
      )}
      {showComplete && (
        <Button variant="success" onClick={onComplete} className="w-full sm:w-auto">
          <CheckCircle className="w-4 h-4 mr-2" />Complete
        </Button>
      )}
      {showCancel && (
        <Button variant="danger" onClick={onCancel} isLoading={isLoading} className="w-full sm:w-auto">
          <XCircle className="w-4 h-4 mr-2" />Cancel
        </Button>
      )}
    </div>
  );
};

export default WorkOrderActions;
