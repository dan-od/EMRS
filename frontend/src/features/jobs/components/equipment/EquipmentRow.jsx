/**
 * EquipmentRow - Individual equipment item row with quantity controls
 */
import { Package, Plus, Minus, Check } from 'lucide-react';

export const EquipmentRow = ({ item, isSelected, quantity, onToggle, onQuantityChange }) => (
  <div 
    className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
      isSelected 
        ? 'bg-primary-500/10 border border-primary-500/50' 
        : 'bg-background-tertiary hover:bg-background-secondary border border-transparent'
    }`}
    onClick={() => onToggle(item.id)}
  >
    {/* Checkbox */}
    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
      isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-500'
    }`}>
      {isSelected && <Check className="w-3 h-3 text-white" />}
    </div>
    
    {/* Icon */}
    <Package className="w-5 h-5 text-primary-400 flex-shrink-0" />
    
    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
      <p className="text-xs text-text-secondary">{item.serial_number}</p>
    </div>
    
    {/* Quantity controls - only show when selected */}
    {isSelected && (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <button 
          onClick={() => onQuantityChange(item.id, Math.max(1, quantity - 1))}
          className="w-7 h-7 rounded bg-background-secondary hover:bg-background-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={e => onQuantityChange(item.id, Math.max(1, parseInt(e.target.value) || 1))}
          className="w-12 h-7 text-center text-sm bg-background-secondary border border-border-light rounded text-text-primary"
        />
        <button 
          onClick={() => onQuantityChange(item.id, quantity + 1)}
          className="w-7 h-7 rounded bg-background-secondary hover:bg-background-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    )}
  </div>
);

export default EquipmentRow;
