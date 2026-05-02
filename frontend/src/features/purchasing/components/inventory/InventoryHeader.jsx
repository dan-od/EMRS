import { Button } from '@/components/common';
import { Plus, RefreshCw } from 'lucide-react';

export const InventoryHeader = ({ onRefresh, onAddItem }) => (
  <div className="flex items-center justify-end gap-2 mb-6">
    <Button variant="ghost" onClick={onRefresh} leftIcon={<RefreshCw className="w-4 h-4" />}>
      Refresh
    </Button>
    <Button onClick={onAddItem} leftIcon={<Plus className="w-4 h-4" />}>
      Add Item
    </Button>
  </div>
);
