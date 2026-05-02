/**
 * Maintenance Form Constants
 */
import { Wrench, Truck, Building } from 'lucide-react';

export const MAINTENANCE_CATEGORIES = [
  { id: 'Equipment', label: 'Equipment', icon: Wrench, description: 'Machinery, tools, instruments', routesTo: 'Purchasing' },
  { id: 'Vehicle', label: 'Vehicle', icon: Truck, description: 'Company vehicles, fleet', routesTo: 'Purchasing' },
  { id: 'Other', label: 'Other (Building/Facility)', icon: Building, description: 'Infrastructure, electrical, plumbing', routesTo: 'Safety' }
];

export const SERVICE_TYPES = [
  { id: 'In-House', label: 'In-House', description: 'Our team handles the repair' },
  { id: 'External', label: 'External', description: 'Send to external vendor' },
  { id: 'Mixed', label: 'Mixed', description: 'Both in-house & external work' }
];

export const OTHER_SUBCATEGORIES = [
  'Building cracks/damage',
  'Walkway/flooring damage',
  'Electrical/Cable issues',
  'Plumbing issues',
  'HVAC/Air conditioning',
  'Security systems',
  'Other (specify below)'
];

export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export const INITIAL_FORM_DATA = {
  priority: 'Medium',
  maintenanceCategory: '',
  equipmentId: '',
  vehicleId: '',
  otherCategory: '',
  otherDescription: '',
  location: '',
  issueDescription: '',
  severity: 'Medium',
  dateNeeded: '',
  // New fields for enhanced flow
  serviceType: '',           // 'In-House', 'External', 'Mixed'
  materials: [],             // Array of { name, specs, quantity, unit }
  tools: [],                 // Array of { equipmentId?, name, specs?, isFromEquipmentList }
  vendorRecommendation: {}   // { vendorId?, vendorName, contact?, notes? }
};
