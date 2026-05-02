/**
 * DisbursedItemsPanel
 * Shows ALL inventory items currently out in the field
 * - Regular disbursed requests (status = Disbursed)
 * - Maintenance approved requests (materials/tools for Work Orders)
 * Grouped by: Requester or flat list
 */

import { useState } from 'react';
import { Card, Badge, Button } from '@/components/common';
import { EmptyState } from '@/components/feedback';
import { 
  Package, User, AlertTriangle, Search, 
  ChevronDown, ChevronUp, ExternalLink, Wrench
} from 'lucide-react';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/helpers';

const DisbursedItemsPanel = ({ requests = [], maintenanceRequests = [], isLoading }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [groupBy, setGroupBy] = useState('requester');
  const [expandedGroups, setExpandedGroups] = useState({});

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse h-24 bg-gray-100 dark:bg-white/10 rounded-lg" />
        ))}
      </div>
    );
  }

  // Extract all disbursed items
  const disbursedItems = [];

  // 1. Process REGULAR disbursed requests (PPE, Material, Equipment, Transport)
  requests.forEach(request => {
    const details = typeof request.details === 'string' 
      ? JSON.parse(request.details) 
      : request.details || {};
    
    const requesterName = request.requester_name || request.requesterName || 'Unknown';
    const requesterDept = request.requester_department || request.requesterDepartment || '-';
    const disbursedAt = request.disbursed_at || request.disbursedAt;
    const expectedReturn = request.expected_return_date || request.expectedReturnDate;

    // PPE/Material items array
    const items = details.items || [];
    items.forEach(item => {
      if (!item.isConsumable) {
        disbursedItems.push({
          name: item.name || item.item || 'Unknown',
          quantity: item.quantity || 1,
          type: request.type,
          isMaintenance: false,
          requestId: request.id,
          requesterName,
          requesterDept,
          disbursedAt,
          expectedReturn: item.returnDate || expectedReturn,
          linkedInventoryId: item.inventoryId || item.linkedInventoryId
        });
      }
    });

    // Linked materials
    const linkedMaterials = details.linkedMaterials || [];
    linkedMaterials.forEach(mat => {
      if (!mat.isConsumable) {
        disbursedItems.push({
          name: mat.name || mat.inventoryName || 'Unknown',
          quantity: mat.quantity || 1,
          type: 'Material',
          isMaintenance: false,
          requestId: request.id,
          requesterName,
          requesterDept,
          disbursedAt,
          expectedReturn: mat.returnDate || expectedReturn,
          linkedInventoryId: mat.inventoryId || mat.linkedInventoryId
        });
      }
    });

    // Linked tools
    const linkedTools = details.linkedTools || [];
    linkedTools.forEach(tool => {
      disbursedItems.push({
        name: tool.name || tool.inventoryName || 'Unknown',
        quantity: tool.quantity || 1,
        type: 'Tool',
        isMaintenance: false,
        requestId: request.id,
        requesterName,
        requesterDept,
        disbursedAt,
        expectedReturn: tool.returnDate || expectedReturn,
        linkedInventoryId: tool.inventoryId || tool.linkedInventoryId
      });
    });

    // Equipment request (single item)
    if (request.type === 'Equipment' && details.equipmentName) {
      disbursedItems.push({
        name: details.equipmentName,
        quantity: 1,
        type: 'Equipment',
        isMaintenance: false,
        requestId: request.id,
        requesterName,
        requesterDept,
        disbursedAt,
        expectedReturn,
        linkedInventoryId: details.equipmentId
      });
    }

    // If no specific items found but it's a disbursed request, show a general entry
    if (items.length === 0 && linkedMaterials.length === 0 && linkedTools.length === 0 && 
        request.type !== 'Equipment' && request.type !== 'Maintenance') {
      disbursedItems.push({
        name: details.description || `${request.type} Request`,
        quantity: 1,
        type: request.type,
        isMaintenance: false,
        requestId: request.id,
        requesterName,
        requesterDept,
        disbursedAt,
        expectedReturn
      });
    }
  });

  // 2. Process MAINTENANCE approved requests (Work Order items)
  maintenanceRequests.forEach(request => {
    const details = typeof request.details === 'string' 
      ? JSON.parse(request.details) 
      : request.details || {};
    
    const requesterName = request.requester_name || request.requesterName || 'Unknown';
    const requesterDept = request.requester_department || request.requesterDepartment || '-';
    const equipmentName = details.equipmentName || request.equipment_name;
    const workOrderId = details.workOrderId;

    // Materials from maintenance
    const materials = details.linkedMaterials || details.materials || [];
    materials.forEach(mat => {
      disbursedItems.push({
        name: mat.name || mat.inventoryName || mat.item || 'Unknown',
        quantity: mat.quantity || 1,
        type: 'Material',
        isMaintenance: true,
        requestId: request.id,
        workOrderId,
        equipmentName,
        requesterName,
        requesterDept,
        disbursedAt: request.approved_at || request.updated_at,
        expectedReturn: null,
        linkedInventoryId: mat.inventoryId || mat.linkedInventoryId
      });
    });

    // Tools from maintenance
    const tools = details.linkedTools || details.tools || [];
    tools.forEach(tool => {
      disbursedItems.push({
        name: tool.name || tool.inventoryName || tool.item || 'Unknown',
        quantity: tool.quantity || 1,
        type: 'Tool',
        isMaintenance: true,
        requestId: request.id,
        workOrderId,
        equipmentName,
        requesterName,
        requesterDept,
        disbursedAt: request.approved_at || request.updated_at,
        expectedReturn: null,
        linkedInventoryId: tool.inventoryId || tool.linkedInventoryId
      });
    });
  });

  // Filter items
  const filteredItems = disbursedItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterType === 'overdue') {
      matchesFilter = item.expectedReturn && isPast(new Date(item.expectedReturn));
    } else if (filterType === 'due-soon') {
      if (!item.expectedReturn) return false;
      const dueDate = new Date(item.expectedReturn);
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      matchesFilter = !isPast(dueDate) && dueDate <= threeDaysFromNow;
    } else if (filterType === 'maintenance') {
      matchesFilter = item.isMaintenance === true;
    } else if (filterType === 'regular') {
      matchesFilter = !item.isMaintenance;
    }

    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const overdueCount = disbursedItems.filter(i => i.expectedReturn && isPast(new Date(i.expectedReturn))).length;
  const maintenanceCount = disbursedItems.filter(i => i.isMaintenance).length;
  const regularCount = disbursedItems.filter(i => !i.isMaintenance).length;
  const uniqueRequesters = [...new Set(disbursedItems.map(i => i.requesterName))].length;

  // Group items
  const groupedItems = {};
  if (groupBy === 'requester') {
    filteredItems.forEach(item => {
      const key = item.requesterName || 'Unknown';
      if (!groupedItems[key]) {
        groupedItems[key] = {
          label: item.requesterName,
          sublabel: item.requesterDept,
          items: [],
          overdueCount: 0
        };
      }
      groupedItems[key].items.push(item);
      if (item.expectedReturn && isPast(new Date(item.expectedReturn))) {
        groupedItems[key].overdueCount++;
      }
    });
  } else {
    groupedItems['all'] = { label: 'All Items', items: filteredItems, overdueCount: overdueCount };
  }

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleViewClick = (item) => {
    if (item.workOrderId) {
      navigate(`/work-orders/${item.workOrderId}`);
    } else {
      navigate(`/requests/${item.requestId}`);
    }
  };

  if (disbursedItems.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No items currently out"
        description="All disbursed items have been returned"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard value={disbursedItems.length} label="Total Items Out" color="blue" />
        <StatCard value={regularCount} label="Regular" color="green" />
        <StatCard value={maintenanceCount} label="Maintenance" color="orange" />
        <StatCard value={uniqueRequesters} label="People" color="purple" />
        <StatCard value={overdueCount} label="Overdue" color={overdueCount > 0 ? "red" : "green"} />
      </div>

      {/* Search, Filter, Group controls */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search items, people, equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
        >
          <option value="all">All Items</option>
          <option value="regular">Regular Only</option>
          <option value="maintenance">Maintenance Only</option>
          <option value="overdue">Overdue</option>
          <option value="due-soon">Due Soon (3 days)</option>
        </select>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
        >
          <option value="requester">Group by Person</option>
          <option value="flat">Flat List</option>
        </select>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {Object.entries(groupedItems).map(([key, group]) => (
          <Card key={key} className="overflow-hidden">
            {/* Group Header */}
            {groupBy !== 'flat' && (
              <button
                onClick={() => toggleGroup(key)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{group.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{group.sublabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                    </p>
                    {group.overdueCount > 0 && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {group.overdueCount} overdue
                      </p>
                    )}
                  </div>
                  {expandedGroups[key] === false ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
            )}

            {/* Items - Show by default */}
            {(groupBy === 'flat' || expandedGroups[key] !== false) && (
              <div className={cn(
                "divide-y divide-gray-100 dark:divide-dark-border",
                groupBy !== 'flat' && "border-t border-gray-200 dark:border-dark-border"
              )}>
                {group.items.map((item, idx) => (
                  <ItemRow key={idx} item={item} onViewClick={handleViewClick} />
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && disbursedItems.length > 0 && (
        <EmptyState
          icon={Search}
          title="No matches"
          description="Try adjusting your search or filter"
        />
      )}
    </div>
  );
};

const StatCard = ({ value, label, color }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400',
    red: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400',
  };

  return (
    <div className={cn("p-3 rounded-lg border", colors[color])}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
};

const ItemRow = ({ item, onViewClick }) => {
  const isOverdue = item.expectedReturn && isPast(new Date(item.expectedReturn));

  return (
    <div className={cn(
      "p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3",
      isOverdue && "bg-red-50/50 dark:bg-red-500/5"
    )}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={cn(
          "w-2 h-2 rounded-full flex-shrink-0",
          isOverdue ? "bg-red-500" : item.isMaintenance ? "bg-orange-500" : "bg-green-500"
        )} />
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {item.name}
            {item.quantity > 1 && <span className="text-gray-500 dark:text-gray-400 ml-1">x{item.quantity}</span>}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Badge size="sm" variant="outline">{item.type}</Badge>
            {item.linkedInventoryId && (
              <span className="text-green-600 dark:text-green-400">- Inventory</span>
            )}
            {item.isMaintenance && (
              <Badge size="sm" variant="warning">
                <Wrench className="w-3 h-3 mr-1" />
                Maintenance
              </Badge>
            )}
            {item.equipmentName && (
              <span className="text-blue-600 dark:text-blue-400 truncate max-w-[150px]">
                - {item.equipmentName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0 pl-5 sm:pl-0">
        <div className="text-left sm:text-right">
          {item.isMaintenance ? (
            <p className="text-sm text-orange-600 dark:text-orange-400">For Work Order</p>
          ) : item.expectedReturn ? (
            <>
              <p className={cn(
                "text-sm font-medium",
                isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
              )}>
                {isOverdue ? 'Overdue!' : 'Due:'} {format(new Date(item.expectedReturn), 'MMM d')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(item.expectedReturn), { addSuffix: true })}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No return date</p>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewClick(item)}
          title={item.workOrderId ? 'View Work Order' : 'View Request'}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DisbursedItemsPanel;
