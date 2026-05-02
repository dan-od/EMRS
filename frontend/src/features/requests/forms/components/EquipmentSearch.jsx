/**
 * EquipmentSearch - Search and select equipment from database
 */

import { useState, useMemo } from 'react';
import { Search, Loader2, Plus } from 'lucide-react';

const EquipmentSearch = ({ 
  equipmentList = [], 
  isLoading, 
  selectedIds = [],
  onSelect, 
  onRequestNew 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter equipment based on search - show all equipment, not just available
  const filteredEquipment = useMemo(() => {
    if (!equipmentList || equipmentList.length === 0) return [];
    
    if (!searchTerm.trim()) return equipmentList.slice(0, 15);
    
    const term = searchTerm.toLowerCase();
    return equipmentList.filter(e => 
      e.name?.toLowerCase().includes(term) ||
      e.category?.toLowerCase().includes(term) ||
      e.serial_number?.toLowerCase().includes(term) ||
      e.location?.toLowerCase().includes(term)
    );
  }, [equipmentList, searchTerm]);

  const handleSelect = (equipment) => {
    onSelect(equipment);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700';
      case 'In_Use': return 'bg-blue-100 text-blue-700';
      case 'Maintenance': return 'bg-orange-100 text-orange-700';
      case 'Out_of_Service': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search equipment by name, category, serial number..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1a1f26] text-text-primary dark:text-white focus:ring-2 focus:ring-primary-500"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>
        <button
          type="button"
          onClick={onRequestNew}
          className="flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-500/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Request New
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredEquipment.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              {equipmentList.length === 0 
                ? 'No equipment in database. Use "Request New" to add items.'
                : 'No matching equipment found. Try a different search or "Request New".'}
            </div>
          ) : (
            filteredEquipment.map(equipment => {
              const isSelected = selectedIds.includes(equipment.id);
              const isAvailable = equipment.status === 'Available';
              return (
                <button
                  key={equipment.id}
                  type="button"
                  onClick={() => handleSelect(equipment)}
                  disabled={isSelected || !isAvailable}
                  className={`w-full text-left px-4 py-3 border-b dark:border-dark-border last:border-b-0 transition-colors
                    ${isSelected ? 'bg-green-50 dark:bg-green-900/20 cursor-not-allowed' :
                      !isAvailable ? 'bg-gray-50 dark:bg-dark-card cursor-not-allowed opacity-60' :
                      'hover:bg-gray-50 dark:hover:bg-dark-card'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-dark-text">{equipment.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {equipment.category} • {equipment.serial_number || 'No S/N'} • {equipment.location || 'Unknown'}
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Selected</span>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(equipment.status)}`}>
                        {equipment.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)} />
      )}
    </div>
  );
};

export default EquipmentSearch;
