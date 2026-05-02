import { Card, Avatar, Badge } from '@/components/common';
import { formatRole, formatDateTime } from '@/utils/formatters';
import { Mail, Building, Shield, Calendar, Phone } from 'lucide-react';

const UserInfoCard = ({ user, isSelf, children }) => {
  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <Card className="p-4 sm:p-6 dark:bg-dark-surface dark:border-dark-border">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <Avatar name={fullName} size="xl" />

        <div className="flex-1 w-full">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2">
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text">{fullName}</h2>
            <Badge variant={user.is_active ? 'success' : 'error'}>
              {user.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {isSelf && <Badge variant="info">You</Badge>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-text-secondary dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-text-muted dark:text-gray-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-text-muted dark:text-gray-400 shrink-0" />
              {formatRole(user.role)}
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-text-muted dark:text-gray-400 shrink-0" />
              {user.department || 'No department'}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-text-muted dark:text-gray-400 shrink-0" />
              {user.phone || 'No phone'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-text-muted dark:text-gray-400 shrink-0" />
              Joined {formatDateTime(user.created_at)}
            </div>
          </div>
        </div>
      </div>

      {children}
    </Card>
  );
};

export default UserInfoCard;
