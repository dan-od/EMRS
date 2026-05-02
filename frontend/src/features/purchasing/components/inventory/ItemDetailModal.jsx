import { Modal, ModalFooter, Button, Badge } from '@/components/common';
import { MovementHistory } from './MovementHistory';
import { useStockMovements } from '../../hooks/useInventory';
import { Package, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export const ItemDetailModal = ({ isOpen, onClose, item, onEdit, onAdjustStock }) => {
  const { movements, isLoading } = useStockMovements(item?.id);

  if (!item) return null;

  const isLowStock = item.quantity <= item.reorder_level;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Item Details" size="md">
      {/* Item Info Card */}
      <div className="bg-gray-50 dark:bg-dark-card/50 rounded-xl p-4 mb-5 border border-gray-100 dark:border-white/10">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${isLowStock ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-primary-100 dark:bg-primary-500/20'}`}>
            {isLowStock ? (
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            ) : (
              <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text">{item.name}</h3>
              {isLowStock && <Badge variant="warning" size="sm">Low Stock</Badge>}
            </div>
            <Badge variant="secondary" size="sm" className="mt-1">
              {item.category?.replace(/_/g, ' ')}
            </Badge>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold text-text-primary dark:text-dark-text">{item.quantity}</p>
            <p className="text-sm text-text-muted dark:text-dark-muted">{item.unit}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-dark-muted">
            <MapPin className="w-4 h-4 text-text-muted dark:text-dark-muted" />
            {item.location || 'No location set'}
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-dark-muted">
            <AlertTriangle className="w-4 h-4 text-text-muted dark:text-dark-muted" />
            Reorder at: {item.reorder_level} {item.unit}
          </div>
        </div>
      </div>

      {/* Movement History */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary dark:text-dark-text mb-3">Stock Movement History</h4>
        <MovementHistory movements={movements} isLoading={isLoading} />
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button variant="outline" onClick={() => { onClose(); onAdjustStock(item); }}>
          Add Stock
        </Button>
        <Button onClick={() => { onClose(); onEdit(item); }}>Edit Item</Button>
      </ModalFooter>
    </Modal>
  );
};
