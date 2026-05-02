/**
 * SelectedChip - Selected items summary chip
 */
import { X } from 'lucide-react';

export const SelectedChip = ({ item, quantity, onRemove }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 text-primary-300 rounded-full text-sm">
    <span className="font-medium">{item.name}</span>
    <span className="text-primary-400">×{quantity}</span>
    <button onClick={() => onRemove(item.id)} className="hover:text-white transition-colors">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

export default SelectedChip;
