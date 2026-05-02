/**
 * ManagerMaterialsSection - Materials management for manager approval
 */
import { useState } from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';

const ManagerMaterialsSection = ({ 
  engineerMaterials = [], 
  additionalMaterials, 
  setAdditionalMaterials 
}) => {
  const [newMaterial, setNewMaterial] = useState({ name: '', specs: '', quantity: 1, unit: 'pcs' });

  const handleAdd = () => {
    if (!newMaterial.name.trim()) return;
    setAdditionalMaterials([...additionalMaterials, { ...newMaterial, id: Date.now() }]);
    setNewMaterial({ name: '', specs: '', quantity: 1, unit: 'pcs' });
  };

  const handleRemove = (id) => {
    setAdditionalMaterials(additionalMaterials.filter(m => m.id !== id));
  };

  return (
    <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/30">
      <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
        <Package className="w-4 h-4" />
        Materials / Parts
      </h4>
      
      {/* Engineer's materials */}
      {engineerMaterials.length > 0 ? (
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Requested by Engineer:</p>
          <div className="space-y-1">
            {engineerMaterials.map((m, idx) => (
              <div key={idx} className="flex justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded text-gray-900 dark:text-white">
                <span>{m.name} {m.specs && <span className="text-gray-500 dark:text-gray-400">({m.specs})</span>}</span>
                <span className="text-gray-600 dark:text-gray-300">{m.quantity} {m.unit}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 italic">No materials requested by engineer</p>
      )}

      {/* Manager's additions */}
      {additionalMaterials.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-green-700 dark:text-green-400 mb-2">Your additions:</p>
          <div className="space-y-1">
            {additionalMaterials.map(m => (
              <div key={m.id} className="flex justify-between items-center text-sm p-2 bg-green-100 dark:bg-green-500/20 rounded text-gray-900 dark:text-white">
                <span>{m.name} {m.specs && <span className="text-gray-500 dark:text-gray-400">({m.specs})</span>}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-300">{m.quantity} {m.unit}</span>
                  <button type="button" onClick={() => handleRemove(m.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add material */}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="Material name"
          value={newMaterial.name}
          onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
          className="flex-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
        />
        <input
          type="number"
          placeholder="Qty"
          value={newMaterial.quantity}
          onChange={(e) => setNewMaterial({ ...newMaterial, quantity: parseInt(e.target.value) || 1 })}
          className="w-16 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
        />
        <select
          value={newMaterial.unit}
          onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
          className="w-20 px-2 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
        >
          <option value="pcs">pcs</option>
          <option value="kg">kg</option>
          <option value="liters">liters</option>
          <option value="meters">meters</option>
          <option value="sets">sets</option>
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newMaterial.name.trim()}
          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ManagerMaterialsSection;
