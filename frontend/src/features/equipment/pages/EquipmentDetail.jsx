/**
 * Equipment Detail Page
 * Post-Phase 5: category/type, hide/unhide, share actions
 */
import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Button, Badge, StatusBadge, Tabs, TabList, Tab, TabPanel } from '@/components/common';
import { PageLoader, EmptyState } from '@/components/feedback';
import { LogHoursModal, EquipmentLogsTab } from '../components';
import { ShareEquipmentModal } from '../components/ShareEquipmentModal';
import { HideEquipmentModal } from '../components/HideEquipmentModal';
import { InfoItem, EquipmentOverview } from '../components/EquipmentInfoItems';
import { useEquipmentDetail } from '../hooks/useEquipment';
import { equipmentService } from '../services/equipmentService';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { canManageThisEquipment, canViewCosts, formatTypeLabel } from '@/utils/equipmentConstants';
import { formatNumber, formatDate } from '@/utils/formatters';
import {
  Package, Wrench, Clock, Calendar, MapPin, User,
  Edit, FileText, Info, Share2, EyeOff, Eye
} from 'lucide-react';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const { addNotification } = useUiStore();
  const { equipment, isLoading, refresh } = useEquipmentDetail(id);

  const [showLogHours, setShowLogHours] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHideModal, setShowHideModal] = useState(false);
  const [loggingHours, setLoggingHours] = useState(false);
  const [unhiding, setUnhiding] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const canManage = equipment
    ? canManageThisEquipment(user?.role, user?.department, equipment.owning_department)
    : false;
  const showCost = canViewCosts(user?.role);
  const isTool = equipment?.asset_category === 'TOOL';

  const handleLogHours = async (hours) => {
    setLoggingHours(true);
    try {
      await equipmentService.logHours(id, { hours });
      setShowLogHours(false);
      refresh();
    } catch { addNotification({ type: 'error', message: 'Failed to log hours' }); }
    finally { setLoggingHours(false); }
  };

  const handleUnhide = async () => {
    setUnhiding(true);
    try {
      await equipmentService.unhide(id);
      addNotification({ type: 'success', message: 'Equipment is now visible' });
      refresh();
    } catch { addNotification({ type: 'error', message: 'Failed to unhide' }); }
    finally { setUnhiding(false); }
  };

  if (isLoading) return <PageLoader />;
  if (!equipment) return (
    <EmptyState icon={Package} title="Equipment not found"
      description="The equipment you're looking for doesn't exist"
      action={() => navigate(-1)} actionLabel="Go Back" />
  );

  const Icon = isTool ? Wrench : Package;
  const iconBg = isTool ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-primary-100 dark:bg-primary-900/30';
  const iconColor = isTool ? 'text-blue-600 dark:text-blue-400' : 'text-primary-600 dark:text-primary-400';

  return (
    <PageWrapper title={equipment.name} backButton backTo={location.state?.from || '/equipment'}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowLogHours(true)} size="sm" className="w-full sm:w-auto">
            <Clock className="w-4 h-4 mr-1" />Log Hours
          </Button>
          {canManage && (
            <>
              <Button variant="outline" onClick={() => setShowShareModal(true)} size="sm" className="w-full sm:w-auto">
                <Share2 className="w-4 h-4 mr-1" />Share
              </Button>
              {equipment.is_hidden
                ? <Button variant="outline" onClick={handleUnhide} isLoading={unhiding} size="sm" className="w-full sm:w-auto"><Eye className="w-4 h-4 mr-1" />Unhide</Button>
                : <Button variant="outline" onClick={() => setShowHideModal(true)} size="sm" className="w-full sm:w-auto"><EyeOff className="w-4 h-4 mr-1" />Hide</Button>
              }
              <Button onClick={() => navigate(`/equipment/${id}/edit`)} size="sm" className="w-full sm:w-auto">
                <Edit className="w-4 h-4 mr-1" />Edit
              </Button>
            </>
          )}
        </div>
      }
    >
      {equipment.is_hidden && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-800 dark:text-amber-300">This equipment is hidden from regular users.</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200/60 dark:border-white/10 p-5 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
          <div className={`w-16 h-16 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{equipment.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 truncate">
              {equipment.serial_number || 'No S/N'} · {formatTypeLabel(equipment.type)}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant={isTool ? 'info' : 'secondary'}>{isTool ? 'Tool' : 'Equipment'}</Badge>
              {equipment.quantity > 1 && <Badge variant="secondary">Qty: {equipment.quantity}</Badge>}
            </div>
          </div>
          <StatusBadge status={equipment.status} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <InfoItem icon={Clock} label="Current Hours" value={`${formatNumber(equipment.current_hours || 0)} hrs`} />
          <InfoItem icon={Calendar} label="Last Maintenance" value={formatDate(equipment.last_maintenance_date)} />
          <InfoItem icon={MapPin} label="Location" value={equipment.location || 'N/A'} />
          <InfoItem icon={User} label="Department" value={equipment.owning_department?.replace(/_/g, ' ') || 'N/A'} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs>
        <TabList>
          <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Info}>Overview</Tab>
          <Tab active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={FileText}>General Log</Tab>
          <Tab active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')} icon={Wrench}>Maintenance Log</Tab>
        </TabList>
        <TabPanel active={activeTab === 'overview'}>
          <EquipmentOverview equipment={equipment} showCost={showCost} />
        </TabPanel>
        <TabPanel active={activeTab === 'general'}>
          <EquipmentLogsTab equipmentId={id} logType="general" />
        </TabPanel>
        <TabPanel active={activeTab === 'maintenance'}>
          <EquipmentLogsTab equipmentId={id} logType="maintenance" />
        </TabPanel>
      </Tabs>

      <LogHoursModal isOpen={showLogHours} onClose={() => setShowLogHours(false)}
        equipment={equipment} onSubmit={handleLogHours} isLoading={loggingHours} />
      <ShareEquipmentModal isOpen={showShareModal} onClose={() => setShowShareModal(false)}
        equipment={equipment} onSuccess={refresh} />
      <HideEquipmentModal isOpen={showHideModal} onClose={() => setShowHideModal(false)}
        equipment={equipment} onSuccess={refresh} />
    </PageWrapper>
  );
};

export default EquipmentDetail;
