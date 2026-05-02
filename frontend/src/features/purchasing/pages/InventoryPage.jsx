import { useState, useCallback } from 'react';
import { PageWrapper } from '@/components/layout';
import { useUIStore } from '@/store/uiStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useInventory, useLowStock, useInventoryActions } from '../hooks/useInventory';
import {
  InventoryHeader,
  InventoryFilters,
  InventoryTable,
  InventoryStats,
  LowStockAlert,
  AddItemModal,
  EditItemModal,
  StockAdjustModal,
  ItemDetailModal
} from '../components/inventory';

const initialFilters = { search: '', category: '' };

const InventoryPage = () => {
  const { addNotification } = useUIStore();
  const [filters, setFilters] = useState(initialFilters);
  const debouncedSearch = useDebounce(filters.search, 300);
  
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, item: null });
  const [stockModal, setStockModal] = useState({ open: false, item: null });
  const [detailModal, setDetailModal] = useState({ open: false, item: null });

  const { items, isLoading, refresh } = useInventory({
    search: debouncedSearch, category: filters.category
  });
  const { items: lowStockItems, refresh: refreshLowStock } = useLowStock();
  const { createItem, updateItem, addStock, isLoading: actionLoading } = useInventoryActions();

  const refreshAll = useCallback(() => { refresh(); refreshLowStock(); }, [refresh, refreshLowStock]);

  const handleAddItem = async (data) => {
    try {
      await createItem(data);
      addNotification({ type: 'success', message: 'Item added successfully' });
      setAddModal(false);
      refreshAll();
    } catch (err) {
      addNotification({ type: 'error', message: err.message || 'Failed to add item' });
    }
  };

  const handleEditItem = async (id, data) => {
    try {
      await updateItem(id, data);
      addNotification({ type: 'success', message: 'Item updated successfully' });
      setEditModal({ open: false, item: null });
      refreshAll();
    } catch (err) {
      addNotification({ type: 'error', message: err.message || 'Failed to update item' });
    }
  };

  const handleAddStock = async (id, quantity, notes) => {
    try {
      await addStock(id, quantity, notes);
      addNotification({ type: 'success', message: 'Stock added successfully' });
      setStockModal({ open: false, item: null });
      refreshAll();
    } catch (err) {
      addNotification({ type: 'error', message: err.message || 'Failed to add stock' });
    }
  };

  return (
    <PageWrapper title="Inventory Management">
      <InventoryHeader onRefresh={refreshAll} onAddItem={() => setAddModal(true)} />
      <InventoryStats items={items} lowStockItems={lowStockItems} />
      <LowStockAlert items={lowStockItems} onViewAll={() => setFilters(initialFilters)} />
      <InventoryFilters filters={filters} onChange={setFilters} onClear={() => setFilters(initialFilters)} />
      
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
        <InventoryTable
          items={items}
          isLoading={isLoading}
          onEdit={(item) => setEditModal({ open: true, item })}
          onAdjustStock={(item) => setStockModal({ open: true, item })}
          onViewDetails={(item) => setDetailModal({ open: true, item })}
        />
      </div>

      <AddItemModal isOpen={addModal} onClose={() => setAddModal(false)} onSubmit={handleAddItem} isLoading={actionLoading} />
      <EditItemModal isOpen={editModal.open} onClose={() => setEditModal({ open: false, item: null })} item={editModal.item} onSubmit={handleEditItem} isLoading={actionLoading} />
      <StockAdjustModal isOpen={stockModal.open} onClose={() => setStockModal({ open: false, item: null })} item={stockModal.item} onSubmit={handleAddStock} isLoading={actionLoading} />
      <ItemDetailModal 
        isOpen={detailModal.open} 
        onClose={() => setDetailModal({ open: false, item: null })} 
        item={detailModal.item}
        onEdit={(item) => { setDetailModal({ open: false, item: null }); setEditModal({ open: true, item }); }}
        onAdjustStock={(item) => { setDetailModal({ open: false, item: null }); setStockModal({ open: true, item }); }}
      />
    </PageWrapper>
  );
};

export default InventoryPage;
