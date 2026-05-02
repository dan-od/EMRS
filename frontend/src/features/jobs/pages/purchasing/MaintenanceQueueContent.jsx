/**
 * MaintenanceQueueContent - Renders maintenance-related items in purchasing queue
 * Shows both Maintenance Approvals (for Work Order creation) and Additional Requests
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, PriorityBadge } from '@/components/common';
import { EmptyState, PageLoader } from '@/components/feedback';
import { Wrench, Package, Plus, Eye, Clock, User, ChevronRight } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

const MaintenanceQueueContent = ({ items = [], isLoading, onRefresh }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  
  if (isLoading) return <PageLoader />;
  
  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => 
        filter === 'maintenance' 
          ? item.queueType === 'maintenance_approval'
          : (item.queueType === 'additional_request' || item.queueType === 'material_request')
      );
  
  const maintenanceCount = items.filter(i => i.queueType === 'maintenance_approval').length;
  const materialCount = items.filter(i => i.queueType === 'additional_request' || i.queueType === 'material_request').length;

  if (!items.length) {
    return (
      <EmptyState
        icon={Wrench}
        title="No maintenance items"
        description="Maintenance approvals and additional requests will appear here"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <FilterTab label="All" count={items.length} active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterTab label="Work Order Approvals" count={maintenanceCount} active={filter === 'maintenance'} onClick={() => setFilter('maintenance')} icon={Wrench} />
        <FilterTab label="Additional Requests" count={materialCount} active={filter === 'materials'} onClick={() => setFilter('materials')} icon={Plus} />
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.map(item => (
          item.queueType === 'maintenance_approval' 
            ? <MaintenanceApprovalCard key={item.id} request={item} navigate={navigate} />
            : <AdditionalRequestCard key={item.id} request={item} navigate={navigate} />
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <EmptyState icon={Package} title="No items match filter" description="Change filter to see other items" />
      )}
    </div>
  );
};

const FilterTab = ({ label, count, active, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {label}
    <span className={`px-1.5 py-0.5 rounded-full text-xs ${active ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>{count}</span>
  </button>
);

const MaintenanceApprovalCard = ({ request, navigate }) => {
  const details = typeof request.details === 'string' ? JSON.parse(request.details) : request.details;
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white">Maintenance Approval</h4>
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Ready for Work Order</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{details?.equipmentName || details?.issueDescription || 'Equipment maintenance'}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{request.requester_name || 'Unknown'}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(request.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={request.priority} />
          <Button variant="outline" size="sm" onClick={() => navigate(`/requests/${request.id}`)}><Eye className="w-4 h-4 mr-1" />Review</Button>
        </div>
      </div>
    </Card>
  );
};

const AdditionalRequestCard = ({ request, navigate }) => {
  const details = typeof request.details === 'string' ? JSON.parse(request.details) : request.details;
  const materials = details?.materials || [];
  const tools = details?.tools || [];
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white">Additional Request</h4>
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">From Work Order</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{details?.equipmentName} • WO #{details?.workOrderId?.slice(0, 8)}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {materials.length > 0 && <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"><Package className="w-3 h-3" />{materials.length} material{materials.length > 1 ? 's' : ''}</span>}
              {tools.length > 0 && <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"><Wrench className="w-3 h-3" />{tools.length} tool{tools.length > 1 ? 's' : ''}</span>}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{request.requester_name || 'Engineer'}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(request.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={request.priority} />
          <Button variant="primary" size="sm" onClick={() => navigate(`/requests/${request.id}`)}>Process<ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </div>
    </Card>
  );
};

export default MaintenanceQueueContent;
