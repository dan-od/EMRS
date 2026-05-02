/**
 * useInventoryCategories - Categorize and filter inventory items
 */

import { useMemo } from 'react';

export const useInventoryCategories = ({ inventory = [], selectedId, search, requestCategory }) => {
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

  // Get all categories sorted by relevance
  const allCategories = useMemo(() => {
    const cats = Object.keys(groupedInventory);
    const preferredCats = {
      PPE: ['PPE'],
      Material: ['Materials', 'Consumables'],
      Materials: ['Materials', 'Consumables'],
      Equipment: ['Spare_Parts', 'Equipment']
    }[requestCategory] || [];
    
    return cats.sort((a, b) => {
      const aIdx = preferredCats.indexOf(a);
      const bIdx = preferredCats.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      return aIdx !== -1 ? -1 : bIdx !== -1 ? 1 : a.localeCompare(b);
    });
  }, [groupedInventory, requestCategory]);

  // Filter by search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedInventory;
    const filtered = {};
    Object.entries(groupedInventory).forEach(([cat, items]) => {
      const matches = items.filter(item => 
        item.name?.toLowerCase().includes(search.toLowerCase())
      );
      if (matches.length) filtered[cat] = matches;
    });
    return filtered;
  }, [groupedInventory, search]);

  // Categories to show (filtered or all)
  const categoriesToShow = search.trim() ? Object.keys(filteredGroups) : allCategories;

  // Selected item
  const selectedItem = inventory.find(i => i.id === selectedId);

  return { groupedInventory, filteredGroups, allCategories, categoriesToShow, selectedItem };
};
