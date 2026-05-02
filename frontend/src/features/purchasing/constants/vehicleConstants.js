/**
 * Vehicle Constants
 */
import { CheckCircle, Truck, Wrench, XCircle } from 'lucide-react';

export const VEHICLE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'Pickup', label: 'Pickup' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Bus', label: 'Bus' },
  { value: 'Truck', label: 'Truck' },
  { value: 'Sedan', label: 'Sedan' },
  { value: 'Van', label: 'Van' }
];

export const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Available', label: 'Available' },
  { value: 'In_Use', label: 'In Use' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Out_of_Service', label: 'Out of Service' }
];

export const FUEL_TYPES = [
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Petrol', label: 'Petrol' },
  { value: 'Electric', label: 'Electric' },
  { value: 'Hybrid', label: 'Hybrid' }
];

export const STATUS_CONFIG = {
  Available: { color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400', icon: CheckCircle },
  In_Use: { color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400', icon: Truck },
  Maintenance: { color: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400', icon: Wrench },
  Out_of_Service: { color: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400', icon: XCircle }
};

export const TYPE_ICONS = {
  Pickup: '🛻',
  SUV: '🚙',
  Bus: '🚌',
  Truck: '🚛',
  Sedan: '🚗',
  Van: '🚐'
};

export const STAT_COLORS = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  purple: 'text-purple-600 dark:text-purple-400',
  yellow: 'text-yellow-600 dark:text-yellow-400'
};
