/**
 * DisbursedItemsCard
 * Shows materials and tools disbursed for a work order
 * Including items from additional requests
 */

import { Card } from '@/components/common';
import { Package, Wrench, Plus } from 'lucide-react';

const DisbursedItemsCard = ({ requestDetails, additionalRequests = [] }) => {
  if (!requestDetails && additionalRequests.length === 0) return null;

  const details = typeof requestDetails === 'string'
    ? JSON.parse(requestDetails)
    : requestDetails || {};

  // Original request items
  const materials = details?.linkedMaterials || details?.materials || [];
  const tools = details?.linkedTools || details?.tools || [];

  // Gather additional request items (only from Disbursed requests)
  const additionalMaterials = [];
  const additionalTools = [];

  additionalRequests.forEach(req => {
    const reqDetails = typeof req.details === 'string' 
      ? JSON.parse(req.details) 
      : req.details || {};
    
    // Only show items from disbursed additional requests
    if (req.status === 'Disbursed') {
      const mats = reqDetails.linkedMaterials || reqDetails.materials || [];
      const tls = reqDetails.linkedTools || reqDetails.tools || [];
      
      mats.forEach(m => additionalMaterials.push({ ...m, fromAdditional: true, requestId: req.id }));
      tls.forEach(t => additionalTools.push({ ...t, fromAdditional: true, requestId: req.id }));
    }
  });

  const allMaterials = [...materials, ...additionalMaterials];
  const allTools = [...tools, ...additionalTools];

  if (allMaterials.length === 0 && allTools.length === 0 && additionalRequests.length === 0) return null;

  // Group by source
  const originalMaterials = allMaterials.filter(m => !m.fromAdditional);
  const addedMaterials = allMaterials.filter(m => m.fromAdditional);
  const originalTools = allTools.filter(t => !t.fromAdditional);
  const addedTools = allTools.filter(t => t.fromAdditional);

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Package className="w-4 h-4" />
        Disbursed Items
      </h3>

      {/* Original Materials */}
      {originalMaterials.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            Materials
          </h4>
          <div className="space-y-2">
            {originalMaterials.map((item, idx) => (
              <ItemRow key={`mat-${idx}`} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Original Tools */}
      {originalTools.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5" />
            Tools
          </h4>
          <div className="space-y-2">
            {originalTools.map((item, idx) => (
              <ItemRow key={`tool-${idx}`} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Additional Request Items */}
      {(addedMaterials.length > 0 || addedTools.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            Additional Items Requested
          </h4>
          
          {addedMaterials.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Materials</p>
              <div className="space-y-2">
                {addedMaterials.map((item, idx) => (
                  <ItemRow key={`add-mat-${idx}`} item={item} isAdditional />
                ))}
              </div>
            </div>
          )}

          {addedTools.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tools</p>
              <div className="space-y-2">
                {addedTools.map((item, idx) => (
                  <ItemRow key={`add-tool-${idx}`} item={item} isAdditional />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pending Additional Requests */}
      <PendingAdditionalRequests additionalRequests={additionalRequests} />
    </Card>
  );
};

const ItemRow = ({ item, isAdditional = false }) => {
  const name = item.inventoryName || item.linkedInventoryName || item.name || item.item || 'Unknown';
  const qty = item.quantity || item.qty || 1;
  const isLinked = !!item.inventoryId || !!item.inventory_id || !!item.linkedInventoryId;

  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${
      isAdditional 
        ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20' 
        : 'bg-gray-50 dark:bg-gray-800'
    }`}>
      <div className="flex items-center gap-2">
        {isLinked ? (
          <span className="w-2 h-2 bg-green-500 rounded-full" title="Linked to inventory" />
        ) : (
          <span className="w-2 h-2 bg-amber-500 rounded-full" title="Not in inventory" />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
        {isAdditional && (
          <span className="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded">
            Added
          </span>
        )}
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        x{qty}
      </span>
    </div>
  );
};

const PendingAdditionalRequests = ({ additionalRequests }) => {
  const pendingRequests = additionalRequests.filter(r => 
    r.status !== 'Disbursed' && r.status !== 'Rejected' && r.status !== 'Cancelled'
  );

  if (pendingRequests.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
        Pending Additional Requests ({pendingRequests.length})
      </h4>
      <div className="space-y-2">
        {pendingRequests.map(req => {
          const reqDetails = typeof req.details === 'string' 
            ? JSON.parse(req.details) 
            : req.details || {};
          const itemCount = (reqDetails.materials?.length || 0) + (reqDetails.tools?.length || 0);
          
          return (
            <div 
              key={req.id}
              className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {itemCount} item(s) requested
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  req.status === 'Pending' 
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                    : req.status === 'Manager_Approved'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
                }`}>
                  {req.status === 'Manager_Approved' ? 'Awaiting Purchasing' : req.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {reqDetails.notes || 'No reason provided'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DisbursedItemsCard;
