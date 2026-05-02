/**
 * Department Requests Page
 * Shows requests from users in the manager's department
 * Tabs: Requests, Return Extensions, Job Requests (for Ops Managers)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { useDeptRequests } from '../hooks/useRequests';
import { usePendingExtensionsManager, extensionActions } from '../hooks/useExtensions';
import PendingExtensionsPanel from '../components/PendingExtensionsPanel';
import { useAuthStore } from '@/store/authStore';
import {
  Search, Clock, CheckCircle, XCircle, ChevronRight, RefreshCw,
  HardHat, Package, Truck, Wrench, Settings, ArrowRightLeft
} from 'lucide-react';

// ============================================
// CONSTANTS
// ============================================
const TYPE_CONFIG = {
  PPE: { icon: HardHat, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-500/20' },
  Material: { icon: Package, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/20' },
  Transport: { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' },
  Equipment: { icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/20' },
  Maintenance: { icon: Settings, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/20' }
};

const STATUS_CONFIG = {
  Pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300', icon: Clock },
  PENDING: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300', icon: Clock },
  Approved: { color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300', icon: CheckCircle },
  APPROVED: { color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300', icon: CheckCircle },
  Rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300', icon: XCircle },
  REJECTED: { color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300', icon: XCircle },
  Completed: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300', icon: CheckCircle },
  Cancelled: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300', icon: XCircle }
};

// Jobs module is NOT in MVP — Job Requests tab removed

// ============================================
// SUB-COMPONENTS
// ============================================
const StatCard = ({ label, value, variant = 'default' }) => {
  const variants = {
    default: 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border',
    yellow: 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30',
    green: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30',
    red: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30',
    purple: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30',
    orange: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30'
  };
  
  const textColors = {
    default: 'text-gray-900 dark:text-white',
    yellow: 'text-yellow-700 dark:text-yellow-400',
    green: 'text-green-700 dark:text-green-400',
    red: 'text-red-700 dark:text-red-400',
    purple: 'text-purple-700 dark:text-purple-400',
    orange: 'text-orange-700 dark:text-orange-400'
  };

  return (
    <div className={`rounded-xl p-3 border ${variants[variant]}`}>
      <p className={`text-xs ${variant === 'default' ? 'text-gray-500 dark:text-gray-400' : textColors[variant]}`}>
        {label}
      </p>
      <p className={`text-xl font-bold ${textColors[variant]}`}>{value}</p>
    </div>
  );
};

const TabButton = ({ active, onClick, children, count, countVariant = 'yellow' }) => {
  const countColors = {
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
        active
          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {children}
      {count > 0 && (
        <span className={`px-1.5 py-0.5 text-xs rounded-full ${countColors[countVariant]}`}>
          {count}
        </span>
      )}
    </button>
  );
};

const RequestRow = ({ request, onClick, userDepartment }) => {
  const requestType = request.type || request.request_type || 'Request';
  const typeConfig = TYPE_CONFIG[requestType] || { icon: Package, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-500/20' };
  const TypeIcon = typeConfig.icon;
  const status = request.status || 'Pending';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

  const isTransferred = !!request.transferred_to;
  const isOrigin = isTransferred && request.requester_department === userDepartment;
  const isDestination = isTransferred && request.transferred_to === userDepartment;
  const transferLabel = isOrigin
    ? `Transferred to ${request.transferred_to}`
    : isDestination
    ? `Transferred from ${request.requester_department}`
    : null;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-500 transition-all cursor-pointer group"
    >
      <div className={`w-9 h-9 sm:w-10 sm:h-10 ${typeConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <TypeIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${typeConfig.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
          {requestType} Request
        </h4>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
          {request.requester_name} • {formatDate(request.created_at)}
        </p>
        {transferLabel && (
          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 text-xs font-medium rounded bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400">
            <ArrowRightLeft className="w-3 h-3 flex-shrink-0" />
            {transferLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-medium rounded-full whitespace-nowrap ${statusConfig.color}`}>
          {status}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors hidden sm:block" />
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const DeptRequests = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { requests, isLoading, error, refresh } = useDeptRequests();
  const { extensions, isLoading: extensionsLoading, refresh: refreshExtensions } = usePendingExtensionsManager();
  
  const [activeTab, setActiveTab] = useState('requests');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Extension handlers
  const handleExtensionApprove = async (id, notes) => {
    try {
      await extensionActions.managerApprove(id, notes);
      refreshExtensions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve extension');
    }
  };

  const handleExtensionReject = async (id, notes) => {
    try {
      await extensionActions.managerReject(id, notes);
      refreshExtensions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject extension');
    }
  };

  // Filter requests
  const filteredRequests = (requests || []).filter(request => {
    const requestType = request.type || request.request_type || '';
    const matchesSearch = requestType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || requestType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const requestTypes = [...new Set((requests || []).map(r => r.type || r.request_type).filter(Boolean))];
  const pendingCount = (requests || []).filter(r => ['Pending', 'PENDING'].includes(r.status)).length;
  const approvedCount = (requests || []).filter(r => ['Approved', 'APPROVED'].includes(r.status)).length;
  const rejectedCount = (requests || []).filter(r => ['Rejected', 'REJECTED'].includes(r.status)).length;
  const extensionsCount = extensions?.length || 0;

  const handleRefresh = () => {
    refresh();
    refreshExtensions();
  };

  return (
    <PageWrapper title="Department Requests">
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <StatCard label="Total Requests" value={(requests || []).length} />
          <StatCard label="Pending Review" value={pendingCount} variant="yellow" />
          <StatCard label="Approved" value={approvedCount} variant="green" />
          <StatCard label="Rejected" value={rejectedCount} variant="red" />
          <StatCard label="Extensions" value={extensionsCount} variant="purple" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-dark-border overflow-x-auto">
          <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} count={pendingCount}>
            Requests
          </TabButton>
          <TabButton active={activeTab === 'extensions'} onClick={() => setActiveTab('extensions')} count={extensionsCount} countVariant="purple">
            Return Extensions
          </TabButton>
        </div>

        {/* Tab Content */}
        {activeTab === 'requests' && (
          <RequestsTabContent
            requests={filteredRequests}
            isLoading={isLoading}
            error={error}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            requestTypes={requestTypes}
            onRefresh={handleRefresh}
            onRequestClick={(r) => navigate(`/requests/${r.id}`)}
            userDepartment={user?.department}
          />
        )}

        {activeTab === 'extensions' && (
          <ExtensionsTabContent
            extensions={extensions}
            isLoading={extensionsLoading}
            onApprove={handleExtensionApprove}
            onReject={handleExtensionReject}
            onRefresh={refreshExtensions}
          />
        )}

      </div>
    </PageWrapper>
  );
};

// ============================================
// TAB CONTENT COMPONENTS
// ============================================
const RequestsTabContent = ({
  requests, isLoading, error, searchTerm, setSearchTerm,
  statusFilter, setStatusFilter, typeFilter, setTypeFilter,
  requestTypes, onRefresh, onRequestClick, userDepartment
}) => (
  <div className="space-y-4">
    {/* Filters */}
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-gray-900 dark:text-white"
        >
          <option value="ALL">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-gray-900 dark:text-white"
        >
          <option value="ALL">All Types</option>
          {requestTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      <button onClick={onRefresh} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl hover:bg-gray-50 dark:hover:bg-dark-card text-gray-700 dark:text-gray-300">
        <RefreshCw className="w-4 h-4" /> Refresh
      </button>
    </div>

    {/* List */}
    {isLoading ? (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ) : error ? (
      <div className="text-center py-12 text-red-500">{error}</div>
    ) : requests.length === 0 ? (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No requests found</p>
      </div>
    ) : (
      <div className="space-y-2">
        {requests.map(r => <RequestRow key={r.id} request={r} onClick={() => onRequestClick(r)} userDepartment={userDepartment} />)}
      </div>
    )}
  </div>
);

const ExtensionsTabContent = ({ extensions, isLoading, onApprove, onReject, onRefresh }) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Return Extensions</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review equipment return extension requests</p>
      </div>
      <button onClick={onRefresh} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card text-gray-700 dark:text-gray-300">
        <RefreshCw className="w-4 h-4" /> Refresh
      </button>
    </div>
    <PendingExtensionsPanel
      extensions={extensions}
      isLoading={isLoading}
      role="manager"
      onApprove={onApprove}
      onReject={onReject}
      onRefresh={onRefresh}
    />
  </div>
);

export default DeptRequests;
