/**
 * ManagerToolsSection - Tools management for manager approval
 */
import { useState } from 'react';
import { Wrench, Plus, Trash2 } from 'lucide-react';

const ManagerToolsSection = ({ 
  engineerTools = [], 
  additionalTools, 
  setAdditionalTools 
}) => {
  const [newTool, setNewTool] = useState({ name: '', specs: '' });

  const handleAdd = () => {
    if (!newTool.name.trim()) return;
    setAdditionalTools([...additionalTools, { ...newTool, id: Date.now(), isFromEquipmentList: false }]);
    setNewTool({ name: '', specs: '' });
  };

  const handleRemove = (id) => {
    setAdditionalTools(additionalTools.filter(t => t.id !== id));
  };

  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30">
      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
        <Wrench className="w-4 h-4" />
        Tools / Equipment
      </h4>
      
      {/* Engineer's tools */}
      {engineerTools.length > 0 ? (
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Requested by Engineer:</p>
          <div className="space-y-1">
            {engineerTools.map((t, idx) => (
              <div key={idx} className="text-sm p-2 bg-white dark:bg-gray-800 rounded text-gray-900 dark:text-white">
                {t.name || t.equipment?.name || 'Unknown Tool'}
                {t.specs && <span className="text-gray-500 dark:text-gray-400 ml-1">({t.specs})</span>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 italic">No tools requested by engineer</p>
      )}

      {/* Manager's additions */}
      {additionalTools.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">Your additions:</p>
          <div className="space-y-1">
            {additionalTools.map(t => (
              <div key={t.id} className="flex justify-between items-center text-sm p-2 bg-amber-100 dark:bg-amber-500/20 rounded text-gray-900 dark:text-white">
                <span>{t.name} {t.specs && <span className="text-gray-500 dark:text-gray-400">({t.specs})</span>}</span>
                <button type="button" onClick={() => handleRemove(t.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add tool */}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="Tool/Equipment name"
          value={newTool.name}
          onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
          className="flex-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newTool.name.trim()}
          className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ManagerToolsSection;
