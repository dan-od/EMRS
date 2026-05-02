/**
 * InventoryLinkDropdown - Searchable dropdown to link request items to inventory
 */

import { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useInventoryDropdown } from '../hooks/useInventoryDropdown';
import { TriggerButton, SearchInput, CategorySection, SkipOption } from './InventoryDropdownParts';

const InventoryLinkDropdown = ({ inventory = [], selectedId, onSelect, requestCategory }) => {
  const {
    isOpen, setIsOpen, search, setSearch, expandedCategories,
    dropdownPosition, triggerRef, dropdownRef, filteredGroups,
    categoriesToShow, selectedItem, toggleCategory, handleSelect
  } = useInventoryDropdown({ inventory, selectedId, onSelect, requestCategory });

  const dropdownContent = isOpen && createPortal(
    <DropdownPanel
      ref={dropdownRef}
      position={dropdownPosition}
      search={search}
      setSearch={setSearch}
      categories={categoriesToShow}
      filteredGroups={filteredGroups}
      expandedCategories={expandedCategories}
      toggleCategory={toggleCategory}
      selectedId={selectedId}
      onSelect={handleSelect}
    />,
    document.body
  );

  return (
    <div className="relative">
      <TriggerButton
        ref={triggerRef}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        selectedId={selectedId}
        selectedItem={selectedItem}
      />
      {dropdownContent}
    </div>
  );
};

// Dropdown panel wrapper
const DropdownPanel = forwardRef(({ position, search, setSearch, categories, filteredGroups, expandedCategories, toggleCategory, selectedId, onSelect }, ref) => (
  <div 
    ref={ref}
    className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-2xl overflow-hidden"
    style={{ position: 'fixed', top: position.top, left: position.left, width: position.width, zIndex: 9999, maxHeight: '300px' }}
  >
    <SearchInput value={search} onChange={setSearch} />
    <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
      {categories.length === 0 ? (
        <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-dark-muted">No inventory items found</div>
      ) : (
        categories.map(cat => (
          <CategorySection
            key={cat}
            category={cat}
            items={filteredGroups[cat] || []}
            isExpanded={expandedCategories.includes(cat)}
            onToggle={() => toggleCategory(cat)}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))
      )}
      <SkipOption selectedId={selectedId} onSelect={onSelect} />
    </div>
  </div>
));

DropdownPanel.displayName = 'DropdownPanel';

export default InventoryLinkDropdown;
