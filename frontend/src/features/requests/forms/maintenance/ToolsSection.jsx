/**
 * ToolsSection - Equipment/Tools needed for maintenance
 * Can select from equipment list OR enter free-text
 */
import { useState } from 'react';
import { Plus, Trash2, Wrench } from 'lucide-react';

const ToolsSection = ({ tools = [], onChange, equipment = [] }) => {
  const [mode, setMode] = useState('select'); // 'select' or 'custom'
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [customTool, setCustomTool] = useState({ name: '', specs: '' });

  // Ensure equipment is an array
  const equipmentList = Array.isArray(equipment) ? equipment : [];

  const handleAddFromEquipment = () => {
    if (!selectedEquipment) return;
    
    const eq = equipmentList.find(e => e.id === selectedEquipment);
    if (!eq) return;

    // Check if already added
    if (tools.some(t => t.equipmentId === eq.id)) {
      alert('This equipment is already added');
      return;
    }

    onChange([...tools, {
      id: Date.now(),
      equipmentId: eq.id,
      name: eq.name,
      serialNumber: eq.serial_number,
      isFromEquipmentList: true
    }]);
    setSelectedEquipment('');
  };

  const handleAddCustom = () => {
    if (!customTool.name.trim()) return;

    onChange([...tools, {
      id: Date.now(),
      equipmentId: null,
      name: customTool.name,
      specs: customTool.specs,
      isFromEquipmentList: false,
      linkedEquipmentId: null // Purchasing will fill this
    }]);
    setCustomTool({ name: '', specs: '' });
  };

  const handleRemove = (id) => {
    onChange(tools.filter(t => t.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (mode === 'custom') handleAddCustom();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        <Wrench className="w-4 h-4 inline mr-1" />
        Tools / Equipment Needed
      </label>

      {/* Tools List */}
      {tools.length > 0 && (
        <div className="space-y-2">
          {tools.map((tool, idx) => (
            <div 
              key={tool.id || idx}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {tool.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tool.isFromEquipmentList 
                    ? `S/N: ${tool.serialNumber}` 
                    : (tool.specs || 'Custom entry - Purchasing will link')}
                </p>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                tool.isFromEquipmentList 
                  ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
              }`}>
                {tool.isFromEquipmentList ? 'From Inventory' : 'Custom'}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(tool.id)}
                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('select')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            mode === 'select'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Select from Equipment
        </button>
        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            mode === 'custom'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          Enter Custom
        </button>
      </div>

      {/* Add Tool - Select Mode */}
      {mode === 'select' && (
        <div className="flex gap-2">
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white"
          >
            <option value="">Select equipment...</option>
            {equipmentList.map(eq => (
              <option key={eq.id} value={eq.id}>
                {eq.name} ({eq.serial_number})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddFromEquipment}
            disabled={!selectedEquipment}
            className="flex items-center gap-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      )}

      {/* Add Tool - Custom Mode */}
      {mode === 'custom' && (
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <input
            type="text"
            placeholder="Tool/Equipment name *"
            value={customTool.name}
            onChange={(e) => setCustomTool(prev => ({ ...prev, name: e.target.value }))}
            onKeyPress={handleKeyPress}
            className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="Specs (optional)"
            value={customTool.specs}
            onChange={(e) => setCustomTool(prev => ({ ...prev, specs: e.target.value }))}
            onKeyPress={handleKeyPress}
            className="w-full sm:w-40 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            disabled={!customTool.name.trim()}
            className="flex items-center gap-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {mode === 'select' 
          ? 'Select tools from company equipment inventory'
          : 'Enter custom tool name - Purchasing will link to inventory/equipment'}
      </p>
    </div>
  );
};

export default ToolsSection;
