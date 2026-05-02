/**
 * ToolsLinkSection - Links tools to equipment items
 * Shows both engineer's tools and manager's additions
 */
import { useState, useEffect } from 'react';
import { Wrench, Check, Search, User, UserCog } from 'lucide-react';
import { api } from '@/services/api';

const ToolRow = ({ tool, index, inventory, linkedId, onLink }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const linkedItem = linkedId ? inventory.find(i => i.id === linkedId) : null;
  const SourceIcon = tool.source === 'manager' ? UserCog : User;

  // If tool is already from equipment list, show as linked
  const isFromEquipmentList = tool.isFromEquipmentList && tool.equipmentId;
  const preLinkedItem = isFromEquipmentList ? inventory.find(i => i.id === tool.equipmentId) : null;

  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-white/10">
      {/* Tool Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white truncate">
            {tool.name}
          </span>
          {tool.quantity > 1 && <span className="text-xs text-gray-500">x{tool.quantity}</span>}
          <SourceIcon className={`w-3 h-3 ${tool.source === 'manager' ? 'text-amber-500' : 'text-blue-500'}`} title={`Added by ${tool.source}`} />
          {isFromEquipmentList && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
              From Inventory
            </span>
          )}
        </div>
        {tool.specs && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{tool.specs}</p>
        )}
      </div>

      {/* Link Status / Dropdown */}
      <div className="relative w-64">
        {(linkedItem || preLinkedItem) ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-200 dark:border-green-500/30">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-400 truncate">
              {(linkedItem || preLinkedItem)?.name}
            </span>
            {!isFromEquipmentList && (
              <button 
                onClick={() => onLink(index, null)}
                className="ml-auto text-xs text-gray-500 hover:text-red-500"
              >
                Unlink
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Link to inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredInventory.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 text-center">No matching items</div>
                  ) : (
                    filteredInventory.slice(0, 10).map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onLink(index, item.id);
                          setShowDropdown(false);
                          setSearchTerm('');
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        <div className="text-gray-900 dark:text-white">{item.name}</div>
                        {item.sku && (
                          <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ToolsLinkSection = ({ request, toolLinks, onToolLink }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const details = request?.details || {};

  // Combine engineer's and manager's tools
  const allTools = [
    ...(details.tools || []).map(t => ({ ...t, source: 'engineer' })),
    ...(details.managerToolAdditions || []).map(t => ({ ...t, source: 'manager' })),
    ...(details.linkedTools || []).map(t => ({ ...t, source: t.source || 'engineer' }))
  ];

  // Remove duplicates by id
  const uniqueTools = allTools.filter((t, i, arr) => 
    arr.findIndex(x => x.id === t.id) === i
  );

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // Use inventory endpoint (same as materials)
        const res = await api.get('/purchasing/inventory');
        const data = res.data;
        setInventory(Array.isArray(data) ? data : data.data || data.items || []);
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  if (uniqueTools.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-purple-500" />
          Tools ({uniqueTools.length})
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <User className="w-3 h-3 text-blue-500" /> Engineer
          <UserCog className="w-3 h-3 text-amber-500" /> Manager
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-white/10 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {uniqueTools.map((tool, idx) => (
            <ToolRow
              key={tool.id || idx}
              tool={tool}
              index={idx}
              inventory={inventory}
              linkedId={toolLinks[idx] || tool.linkedEquipmentId}
              onLink={onToolLink}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Link tools to inventory items for tracking. Unlinked items will be sourced separately.
      </p>
    </div>
  );
};

export default ToolsLinkSection;
