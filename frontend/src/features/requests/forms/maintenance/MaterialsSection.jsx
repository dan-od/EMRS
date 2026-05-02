/**
 * MaterialsSection - Free-text materials/parts entry
 * Purchasing will link these to inventory later
 */
import { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';

const MaterialsSection = ({ materials = [], onChange }) => {
  const [newMaterial, setNewMaterial] = useState({ name: '', specs: '', quantity: 1, unit: 'pcs' });

  const handleAdd = () => {
    if (!newMaterial.name.trim()) return;
    
    onChange([...materials, { 
      ...newMaterial, 
      id: Date.now(),
      linkedInventoryId: null // Purchasing will fill this
    }]);
    setNewMaterial({ name: '', specs: '', quantity: 1, unit: 'pcs' });
  };

  const handleRemove = (id) => {
    onChange(materials.filter(m => m.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        <Package className="w-4 h-4 inline mr-1" />
        Materials / Parts Needed
      </label>
      
      {/* Material List */}
      {materials.length > 0 && (
        <div className="space-y-2">
          {materials.map((material, idx) => (
            <div 
              key={material.id || idx}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {material.name}
                </p>
                {material.specs && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {material.specs}
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {material.quantity} {material.unit}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(material.id)}
                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Material */}
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
        <input
          type="text"
          placeholder="Material name *"
          value={newMaterial.name}
          onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
          onKeyPress={handleKeyPress}
          className="col-span-6 sm:col-span-4 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="Specs/Description"
          value={newMaterial.specs}
          onChange={(e) => setNewMaterial(prev => ({ ...prev, specs: e.target.value }))}
          onKeyPress={handleKeyPress}
          className="col-span-6 sm:col-span-4 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white placeholder-gray-400"
        />
        <input
          type="number"
          placeholder="Qty"
          min="1"
          value={newMaterial.quantity}
          onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
          onKeyPress={handleKeyPress}
          className="col-span-2 sm:col-span-1 px-2 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white text-center"
        />
        <select
          value={newMaterial.unit}
          onChange={(e) => setNewMaterial(prev => ({ ...prev, unit: e.target.value }))}
          className="col-span-3 sm:col-span-2 px-2 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white"
        >
          <option value="pcs">pcs</option>
          <option value="sets">sets</option>
          <option value="liters">liters</option>
          <option value="kg">kg</option>
          <option value="meters">meters</option>
          <option value="rolls">rolls</option>
          <option value="boxes">boxes</option>
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newMaterial.name.trim()}
          className="col-span-1 sm:col-span-1 flex items-center justify-center p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Enter materials/parts needed. Purchasing will link to inventory.
      </p>
    </div>
  );
};

export default MaterialsSection;
