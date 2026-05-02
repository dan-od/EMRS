/**
 * All Requests Page — Admin/Super_Admin only
 * Shows every request in the system across all departments
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { TableSkeleton } from '@/components/feedback';
import { useAllRequests } from '../hooks/useRequests';
import {
  Search, Clock, CheckCircle, XCircle, ChevronRight, RefreshCw,
  HardHat, Package, Truck, Wrench, Settings, Globe
} from 'lucide-react';

const TYPE_ICONS = {
  PPE: { icon: HardHat, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-500/20' },
  Material: { icon: Package, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/20' },
  Transport: { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' },
  Equipment: { icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/20' },
  Maintenance: { icon: Settings, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/20' }
};

const STATUS_STYLES = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  Approved: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
  Manager_Approved: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  Disbursed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300',
  Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  Cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300'
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

const RequestRow = ({ request, onClick }) => {
  const type = request.type || request.request_type || 'Request';
  const cfg = TYPE_ICONS[type] || { icon: Package, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-500/20' };
  const Icon = cfg.icon;
  const status = request.status || 'Pending';
  const dept = request.requester_department || '';

  return (
    <div onClick={onClick} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-500 transition-all cursor-pointer group">
      <div className={`w-9 h-9 sm:w-10 sm:h-10 ${cfg.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{type} Request</h4>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
          {request.requester_name}{dept ? ` \u2022 ${dept}` : ''} \u2022 {formatDate(request.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-medium rounded-full whitespace-nowrap ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}>
          {status.replace(/_/g, ' ')}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors hidden sm:block" />
      </div>
    </div>
  );
};

const AllRequests = () => {
  const navigate = useNavigate();
  const { requests, isLoading, error, refresh } = useAllRequests();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filtered = (requests || []).filter(r => {
    const type = r.type || r.request_type || '';
    const matchSearch = type.toLowerCase().includes(search.toLowerCase()) ||
      r.requester_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.requester_department?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchType = typeFilter === 'ALL' || type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const types = [...new Set((requests || []).map(r => r.type || r.request_type).filter(Boolean))];
  const pending = (requests || []).filter(r => r.status === 'Pending').length;
  const approved = (requests || []).filter(r => ['Approved', 'Manager_Approved'].includes(r.status)).length;

  return (
    <PageWrapper title="All Requests">
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl p-3 border bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{(requests || []).length}</p>
          </div>
          <div className="rounded-xl p-3 border bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30">
            <p className="text-xs text-yellow-700 dark:text-yellow-400">Pending</p>
            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{pending}</p>
          </div>
          <div className="rounded-xl p-3 border bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30">
            <p className="text-xs text-green-700 dark:text-green-400">Approved</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-400">{approved}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Search by name, type, or department..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-gray-900 dark:text-white">
              <option value="ALL">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Manager_Approved">Manager Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Disbursed">Disbursed</option>
              <option value="Completed">Completed</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card text-gray-900 dark:text-white">
              <option value="ALL">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={refresh} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl hover:bg-gray-50 dark:hover:bg-dark-card text-gray-700 dark:text-gray-300">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No requests found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(r => <RequestRow key={r.id} request={r} onClick={() => navigate(`/requests/${r.id}`)} />)}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AllRequests;
