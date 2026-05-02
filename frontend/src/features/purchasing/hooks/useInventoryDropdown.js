/**
 * useInventoryDropdown - Hook for inventory dropdown logic
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useInventoryCategories } from './useInventoryCategories';

export const useInventoryDropdown = ({ inventory = [], selectedId, onSelect, requestCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const closeDropdown = useCallback(() => { setIsOpen(false); setSearch(''); }, []);

  // Get categorized/filtered inventory
  const { filteredGroups, categoriesToShow, selectedItem } = useInventoryCategories({
    inventory, selectedId, search, requestCategory
  });

  // Position dropdown
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, [isOpen]);

  // Auto-expand first category
  useEffect(() => {
    if (isOpen && categoriesToShow.length > 0 && expandedCategories.length === 0) {
      setExpandedCategories([categoriesToShow[0]]);
    }
  }, [isOpen, categoriesToShow, expandedCategories.length]);

  // Expand matching categories when searching
  useEffect(() => {
    if (search.trim()) setExpandedCategories(Object.keys(filteredGroups));
  }, [search, filteredGroups]);

  // Close handlers
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (!triggerRef.current?.contains(e.target) && !dropdownRef.current?.contains(e.target)) closeDropdown();
    };
    const handleEscape = (e) => e.key === 'Escape' && closeDropdown();
    const handleScroll = (e) => {
      if (!dropdownRef.current?.contains(e.target)) closeDropdown();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, closeDropdown]);

  const toggleCategory = (cat) => setExpandedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const handleSelect = (item) => { onSelect(item); closeDropdown(); };

  return {
    isOpen, setIsOpen, search, setSearch, expandedCategories,
    dropdownPosition, triggerRef, dropdownRef, filteredGroups,
    categoriesToShow, selectedItem, toggleCategory, handleSelect
  };
};
