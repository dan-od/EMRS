import { INVENTORY_CATEGORIES } from '@/utils/constants';

export const CATEGORY_OPTIONS = Object.entries(INVENTORY_CATEGORIES).map(([key, value]) => ({
  value: key,
  label: value.replace(/_/g, ' ')
}));

export const UNIT_OPTIONS = [
  { value: 'pieces', label: 'Pieces' },
  { value: 'pairs', label: 'Pairs' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'liters', label: 'Liters' },
  { value: 'meters', label: 'Meters' },
  { value: 'reams', label: 'Reams' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'rolls', label: 'Rolls' }
];
