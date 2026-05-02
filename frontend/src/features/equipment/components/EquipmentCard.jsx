/**
 * EquipmentCard - Updated for Tools vs Equipment
 */
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, StatusBadge } from '@/components/common';
import { formatNumber } from '@/utils/formatters';
import { Package, Wrench, Clock, Eye, EyeOff, Share2 } from 'lucide-react';

const formatType = (type) => {
  if (!type) return 'Unknown';
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const EquipmentCard = memo(({ equipment, onClick }) => {
  const navigate = useNavigate();
  const isHidden = equipment.is_hidden;
  const isShared = equipment.shared_with_departments?.length > 0;
  const isTool = equipment.asset_category === 'TOOL';

  const handleClick = () => {
    if (onClick) onClick(equipment);
    else navigate(`/equipment/${equipment.id}`);
  };

  const Icon = isTool ? Wrench : Package;
  const iconBg = isTool 
    ? 'bg-blue-100 dark:bg-blue-500/20' 
    : 'bg-primary-100 dark:bg-primary-500/20';
  const iconColor = isTool 
    ? 'text-blue-600 dark:text-blue-400' 
    : 'text-primary-600 dark:text-primary-400';

  return (
    <Card 
      className={`hover:bg-gray-50 dark:hover:bg-dark-card transition-colors cursor-pointer ${isHidden ? 'opacity-60' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-sm text-text-primary dark:text-dark-text truncate">
              {equipment.name}
            </h3>
            {isHidden && <EyeOff className="w-3.5 h-3.5 text-text-muted dark:text-dark-muted" />}
            {isShared && <Share2 className="w-3.5 h-3.5 text-green-500" />}
          </div>
          
          <p className="text-xs text-text-secondary dark:text-dark-muted mb-1.5">
            {equipment.serial_number || 'No S/N'} • {formatType(equipment.type)}
          </p>

          <div className="flex items-center gap-3 text-xs">
            {equipment.current_hours > 0 && (
              <div className="flex items-center gap-1 text-text-muted dark:text-dark-muted">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatNumber(equipment.current_hours)} hrs</span>
              </div>
            )}
            {equipment.quantity > 1 && (
              <Badge variant="secondary" size="sm">Qty: {equipment.quantity}</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={equipment.status} />
          {equipment.location && (
            <Badge variant="secondary" size="sm">{equipment.location}</Badge>
          )}
        </div>
      </div>
    </Card>
  );
});

EquipmentCard.displayName = 'EquipmentCard';
