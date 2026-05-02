/**
 * EquipmentListSection - Equipment list display and management
 */
import { memo, useState } from 'react';
import { Card, CardContent, Button } from '@/components/common';
import { Package, Building, ShoppingCart, Trash2 } from 'lucide-react';
import { AddEquipmentModal } from './AddEquipmentModal';
import { useEquipmentItemActions } from '../hooks';
import { ITEM_STATUS_CONFIG } from '../constants';

const ItemRow = ({ item, canEdit, onRemove }) => {
  const name = item.source === 'INVENTORY' ? item.equipment_name : item.source === 'CLIENT' ? item.client_equipment_name : item.requested_item_name;
  const Icon = item.source === 'CLIENT' ? Building : item.source === 'NEW_REQUEST' ? ShoppingCart : Package;
  const st = ITEM_STATUS_CONFIG[item.status] || { label: item.status };
  return (
    <div className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg">
      <Icon className="w-4 h-4 text-primary-400" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{name}</p>
        {item.serial_number && <p className="text-xs text-text-secondary">{item.serial_number}</p>}
      </div>
      <span className="text-sm text-text-secondary">x{item.quantity}</span>
      <span className="text-xs px-2 py-0.5 rounded bg-background-secondary text-text-secondary border border-border-light">{st.label}</span>
      {canEdit && <button onClick={() => onRemove(item.id)} className="p-1 text-text-muted hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>}
    </div>
  );
};

export const EquipmentListSection = memo(({ jobId, items = [], onRefresh, canEdit }) => {
  const [show, setShow] = useState(false);
  const [type, setType] = useState('inventory');
  const { removeItem } = useEquipmentItemActions();

  const handleRemove = async (id) => { if (confirm('Remove?')) { await removeItem(jobId, id); onRefresh?.(); } };
  const open = (t) => { setType(t); setShow(true); };

  const inv = items.filter(i => i.source === 'INVENTORY');
  const cli = items.filter(i => i.source === 'CLIENT');
  const req = items.filter(i => i.source === 'NEW_REQUEST');

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2"><Package className="w-5 h-5 text-primary-500" />Equipment ({items.length})</h3>
            {canEdit && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => open('inventory')} title="Our equipment"><Package className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => open('client')} title="Client equipment"><Building className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => open('new-request')} title="New request"><ShoppingCart className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
          {items.length === 0 ? <p className="text-sm text-text-muted text-center py-4">No equipment added</p> : (
            <div className="space-y-4">
              {inv.length > 0 && <div><p className="text-xs font-medium text-text-muted uppercase mb-2">Our Equipment</p><div className="space-y-2">{inv.map(i => <ItemRow key={i.id} item={i} canEdit={canEdit} onRemove={handleRemove} />)}</div></div>}
              {cli.length > 0 && <div><p className="text-xs font-medium text-text-muted uppercase mb-2">Client</p><div className="space-y-2">{cli.map(i => <ItemRow key={i.id} item={i} canEdit={canEdit} onRemove={handleRemove} />)}</div></div>}
              {req.length > 0 && <div><p className="text-xs font-medium text-text-muted uppercase mb-2">Requests</p><div className="space-y-2">{req.map(i => <ItemRow key={i.id} item={i} canEdit={canEdit} onRemove={handleRemove} />)}</div></div>}
            </div>
          )}
        </CardContent>
      </Card>
      {show && <AddEquipmentModal jobId={jobId} type={type} existingItems={inv.map(i => i.equipment_id)} onClose={() => setShow(false)} onSuccess={() => { setShow(false); onRefresh?.(); }} />}
    </>
  );
});
EquipmentListSection.displayName = 'EquipmentListSection';
export default EquipmentListSection;
