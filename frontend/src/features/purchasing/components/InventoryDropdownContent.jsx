/**
 * InventoryDropdownContent - Dropdown content with search and category list
 */

import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { CategorySection, SkipOption } from './InventoryCategoryList';

const InventoryDropdownContent = ({ 
  inventory, 
  selectedId, 
  onSelect, 
  requestCategory,
  dropdownRef 
}) => {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Group inventory by category
  const groupedInventory = useMemo(() => {
    const groups = {};
    if (!inventory?.length) return groups;
    inventory.forEach(item => {
      const cat = item.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [inventory]);

  // Sort categories - matching category first
  const allCategories = useMemo(() => {
    const cats = Object.keys(groupedInventory);
    const categoryMatches = {
      'PPE': ['PPE'],
      'Material': ['Materials', 'Consumables', 'Spare_Parts'],
      'Materials': ['Materials', 'Consumables', 'Spare_Parts'],
    };
    const preferredCats = categoryMatches[requestCategory] || [];
    
    return cats.sort((a, b) => {
      const aIndex = preferredCats.indexOf(a);
      const bIndex = preferredCats.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [groupedInventory, requestCategory]);

  // Auto-expand first category
  useEffect(() => {
    if (allCategories.length > 0 && expandedCategories.length === 0) {
      setExpandedCategories([allCategories[0]]);
    }
  }, [allCategories]);

  // Filter by search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedInventory;
    const filtered = {};
    Object.entries(groupedInventory).forEach(([cat, items]) => {
      const matches = items.filter(item => 
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        (item.aliases || []).some(a => a.toLowerCase().includes(search.toLowerCase()))
      );
      if (matches.length) filtered[cat] = matches;
    });
    return filtered;
  }, [groupedInventory, search]);

  // Expand all when searching
  useEffect(() => {
    if (search.trim()) setExpandedCategories(Object.keys(filteredGroups));
  }, [search, filteredGroups]);

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const categoriesToShow = search.trim() ? Object.keys(filteredGroups) : allCategories;

  return (
    <div ref={dropdownRef} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-2xl overflow-hidden">
      {/* Search */}
      <div className="p-2 border-b dark:border-dark-border bg-white dark:bg-dark-surface">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card dark:text-dark-text dark:placeholder-gray-500"
            autoFocus
          />
        </div>
      </div>

      {/* Items list */}
      <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
        {categoriesToShow.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-dark-muted">
            No inventory items found
          </div>
        ) : (
          categoriesToShow.map(category => {
            const items = filteredGroups[category] || [];
            if (!items.length) return null;
            return (
              <CategorySection
                key={category}
                category={category}
                items={items}
                isExpanded={expandedCategories.includes(category)}
                onToggle={() => toggleCategory(category)}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            );
          })
        )}
        <SkipOption isSelected={selectedId === 'skip'} onSelect={onSelect} />
      </div>
    </div>
  );
};

export default InventoryDropdownContent;
