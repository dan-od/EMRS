import { Input, Select } from '@/components/common';
import { DEPARTMENTS, DEPARTMENT_ROLES, getRoleLabel } from '@/utils/constants';
import { useAuthStore } from '@/store/authStore';
import { Mail, User, Phone, Shield, Building, AlertTriangle } from 'lucide-react';

// Build department dropdown options from constants
const DEPT_OPTIONS = Object.values(DEPARTMENTS).map(dept => ({
  value: dept.name,
  label: dept.name
}));

const UserFormFields = ({ formData, onChange, errors = {}, isEdit = false }) => {
  const currentUser = useAuthStore(s => s.user);
  const isTopAdmin = ['Super_Admin', 'Admin'].includes(currentUser?.role);

  // Email editable: always on create, only admins on edit
  const emailDisabled = isEdit && !isTopAdmin;

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    if (field === 'department') {
      const deptAllowed = DEPARTMENT_ROLES[value] || ['Staff'];
      const filtered = isTopAdmin
        ? deptAllowed
        : deptAllowed.filter(r => !['Super_Admin', 'Admin'].includes(r));
      const roleStillValid = filtered.includes(formData.role);

      onChange({
        ...formData,
        department: value,
        role: roleStillValid ? formData.role : ''
      });
    } else {
      onChange({ ...formData, [field]: value });
    }
  };

  // Get roles available for selected department, filtered by logged-in user privilege
  const selectedDept = formData.department;
  const ADMIN_ONLY_ROLES = ['Super_Admin', 'Admin'];
  const deptRoles = selectedDept ? (DEPARTMENT_ROLES[selectedDept] || ['Staff']) : [];
  const availableRoles = isTopAdmin
    ? deptRoles
    : deptRoles.filter(r => !ADMIN_ONLY_ROLES.includes(r));

  const roleOptions = availableRoles.map(role => ({
    value: role,
    label: getRoleLabel(role)
  }));

  return (
    <div className="space-y-5">
      {/* Name Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={formData.firstName || ''}
          onChange={handleChange('firstName')}
          error={errors.firstName}
          placeholder="Enter first name"
          icon={User}
          required
        />
        <Input
          label="Last Name"
          value={formData.lastName || ''}
          onChange={handleChange('lastName')}
          error={errors.lastName}
          placeholder="Enter last name"
          icon={User}
          required
        />
      </div>

      {/* Email */}
      <div>
        <Input
          label="Email Address"
          type="email"
          value={formData.email || ''}
          onChange={handleChange('email')}
          error={errors.email}
          placeholder="user@wellfluid.com"
          icon={Mail}
          required
          disabled={emailDisabled}
        />
        {isEdit && isTopAdmin && (
          <div className="flex items-start gap-2 mt-2 p-2 bg-warning/10 dark:bg-warning/20 border border-warning/30 dark:border-warning/40 rounded text-xs text-warning">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Changing login email is immediate. The user must use the new email to sign in. 
              Notify them before saving.
            </span>
          </div>
        )}
      </div>

      {/* Password - only for create */}
      {!isEdit && (
        <Input
          label="Password"
          type="password"
          value={formData.password || ''}
          onChange={handleChange('password')}
          error={errors.password}
          placeholder="Minimum 8 characters"
          required
        />
      )}

      {/* Phone */}
      <Input
        label="Phone Number"
        type="tel"
        value={formData.phone || ''}
        onChange={handleChange('phone')}
        error={errors.phone}
        placeholder="+234 XXX XXX XXXX"
        icon={Phone}
      />

      {/* Department first, then Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Department"
          value={formData.department || ''}
          onChange={handleChange('department')}
          error={errors.department}
          icon={Building}
          required
        >
          <option value="">Select department...</option>
          {DEPT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>

        <Select
          label="Role"
          value={formData.role || ''}
          onChange={handleChange('role')}
          error={errors.role}
          icon={Shield}
          required
          disabled={!selectedDept}
        >
          <option value="">
            {selectedDept ? 'Select role...' : 'Select department first'}
          </option>
          {roleOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default UserFormFields;
