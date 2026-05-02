/**
 * Request Hub Page
 * Central hub for creating different types of requests
 * Role-based filtering: not all departments see all request types
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { useAuthStore } from '@/store/authStore';
import { 
  HardHat, 
  Package, 
  Wrench, 
  Truck, 
  Settings,
  ChevronRight 
} from 'lucide-react';

const REQUEST_TYPES = [
  {
    id: 'PPE',
    title: 'PPE Request',
    description: 'Request safety equipment and protective gear',
    icon: HardHat,
    lightBg: 'bg-red-50',
    darkBg: 'dark:bg-red-500/10',
    iconBg: 'bg-red-100 dark:bg-red-500/20',
    iconColor: 'text-red-500',
    border: 'border-red-200/60 dark:border-red-500/20',
    hoverBorder: 'hover:border-red-300 dark:hover:border-red-500/40',
    // PPE available to everyone - safety is universal
    allowedRoles: null
  },
  {
    id: 'MATERIAL',
    title: 'Material Request',
    description: 'Request office supplies and materials',
    icon: Package,
    lightBg: 'bg-green-50',
    darkBg: 'dark:bg-green-500/10',
    iconBg: 'bg-green-100 dark:bg-green-500/20',
    iconColor: 'text-green-600 dark:text-green-400',
    border: 'border-green-200/60 dark:border-green-500/20',
    hoverBorder: 'hover:border-green-300 dark:hover:border-green-500/40',
    // Materials available to everyone
    allowedRoles: null
  },
  {
    id: 'EQUIPMENT',
    title: 'Equipment Request',
    description: 'Request tools and field equipment',
    icon: Wrench,
    lightBg: 'bg-orange-50',
    darkBg: 'dark:bg-orange-500/10',
    iconBg: 'bg-orange-100 dark:bg-orange-500/20',
    iconColor: 'text-orange-500',
    border: 'border-orange-200/60 dark:border-orange-500/20',
    hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-500/40',
    // Equipment only for field/technical roles - not Accounts/HR/Finance
    allowedDepartments: ['Operations', 'Maintenance', 'Workshop', 'Safety', 'IT'],
    allowedRoles: ['Super_Admin', 'Admin', 'IT_Support', 'Field_Engineer', 'Operations_Manager', 
                   'Maintenance_Manager', 'Safety_Manager', 'Safety_Officer', 'Purchasing_Manager', 'Purchasing_Staff']
  },
  {
    id: 'TRANSPORT',
    title: 'Transport Request',
    description: 'Request vehicle for field operations',
    icon: Truck,
    lightBg: 'bg-purple-50',
    darkBg: 'dark:bg-purple-500/10',
    iconBg: 'bg-purple-100 dark:bg-purple-500/20',
    iconColor: 'text-purple-500 dark:text-purple-400',
    border: 'border-purple-200/60 dark:border-purple-500/20',
    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-500/40',
    // Transport available to most - field teams need vehicles
    allowedRoles: null
  },
  {
    id: 'MAINTENANCE',
    title: 'Maintenance Request',
    description: 'Report equipment issues and request repairs',
    icon: Settings,
    lightBg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-500/10',
    iconBg: 'bg-amber-100 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200/60 dark:border-amber-500/20',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-500/40',
    // Maintenance available to everyone - anyone can report issues
    allowedRoles: null
  }
];

const RequestTypeCard = ({ type, onClick }) => {
  const Icon = type.icon;
  
  return (
    <div 
      onClick={onClick}
      className={`
        ${type.lightBg} ${type.darkBg} 
        border ${type.border} ${type.hoverBorder}
        rounded-2xl p-5 cursor-pointer transition-all duration-200
        hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/20
        backdrop-blur-sm
      `}
    >
      {/* Icon */}
      <div className={`w-12 h-12 ${type.iconBg} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${type.iconColor}`} />
      </div>
      
      {/* Title */}
      <h3 className="text-base font-semibold text-text-primary dark:text-dark-text mb-1">
        {type.title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-text-secondary dark:text-dark-muted mb-3 line-clamp-2">
        {type.description}
      </p>
      
      {/* Action Link */}
      <button className={`flex items-center gap-1 text-sm font-medium ${type.iconColor}`}>
        Create Request
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const RequestHub = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  // Filter request types based on user role and department
  const availableTypes = useMemo(() => {
    if (!user) return REQUEST_TYPES;
    
    return REQUEST_TYPES.filter(type => {
      // If no restrictions, show to everyone
      if (!type.allowedRoles && !type.allowedDepartments) return true;
      
      // Check role-based access
      if (type.allowedRoles && type.allowedRoles.includes(user.role)) return true;
      
      // Check department-based access
      if (type.allowedDepartments && type.allowedDepartments.includes(user.department)) return true;
      
      // Super_Admin and Admin always see everything
      if (['Super_Admin', 'Admin'].includes(user.role)) return true;
      
      return false;
    });
  }, [user]);

  const handleTypeSelect = (typeId) => {
    navigate(`/requests/new?type=${typeId}`);
  };

  return (
    <PageWrapper title="Request Hub">
      <div className="max-w-5xl">
        {/* Header */}
        <p className="text-text-secondary dark:text-dark-muted mb-6">
          Select a request type to create a new request
        </p>

        {/* Request Type Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTypes.map((type) => (
            <RequestTypeCard
              key={type.id}
              type={type}
              onClick={() => handleTypeSelect(type.id)}
            />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default RequestHub;