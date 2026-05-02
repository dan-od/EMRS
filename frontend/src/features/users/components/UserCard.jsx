import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge } from '@/components/common';
import { getRoleLabel } from '@/utils/constants';
import { Mail, Building, Shield, ChevronRight } from 'lucide-react';

export const UserCard = memo(({ user }) => {
  const navigate = useNavigate();
  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <div 
      onClick={() => navigate(`/users/${user.id}`)}
      className="bg-surface border border-border-light rounded-lg p-4 cursor-pointer
                 hover:border-primary/30 hover:shadow-md transition-all group"
    >
      {/* Header: Avatar + Name + Status */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={fullName} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary truncate">{fullName}</h3>
          <p className="text-xs text-text-muted truncate">{user.email}</p>
        </div>
        <Badge variant={user.is_active ? 'success' : 'error'} size="sm">
          {user.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Info rows */}
      <div className="space-y-2 text-sm border-t border-border-light pt-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-text-secondary">
            <Shield className="w-3.5 h-3.5 text-primary" />
            Role
          </span>
          <span className="font-medium text-text-primary text-right truncate max-w-[60%]">
            {getRoleLabel(user.role)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-text-secondary">
            <Building className="w-3.5 h-3.5 text-primary" />
            Department
          </span>
          <span className="font-medium text-text-primary">
            {user.department || 'Unassigned'}
          </span>
        </div>
      </div>

      {/* Footer arrow */}
      <div className="flex justify-end mt-3 pt-2 border-t border-border-light">
        <span className="text-xs text-text-muted group-hover:text-primary transition-colors flex items-center gap-1">
          View details <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
});

UserCard.displayName = 'UserCard';
