import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// Date formatters
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '-';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsed) ? format(parsed, formatStr) : '-';
};

export const formatDateTime = (date) => formatDate(date, 'MMM d, yyyy HH:mm');

export const formatTime = (date) => formatDate(date, 'HH:mm');

export const formatRelativeTime = (date) => {
  if (!date) return '-';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return isValid(parsed) ? formatDistanceToNow(parsed, { addSuffix: true }) : '-';
};

// Currency formatter (Nigerian Naira)
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount == null || isNaN(amount)) return '-';
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  return showSymbol ? `₦${formatted}` : formatted;
};

// Number formatters
export const formatNumber = (num, decimals = 0) => {
  if (num == null || isNaN(num)) return '-';
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

export const formatHours = (hours) => {
  if (hours == null || isNaN(hours)) return '-';
  return `${formatNumber(hours, 1)} hrs`;
};

// Text formatters
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatRole = (role) => {
  if (!role) return '';
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};

// Phone formatter
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

// Request type formatter
export const formatRequestType = (type) => {
  if (!type) return '';
  const types = {
    PPE: 'PPE',
    Transport: 'Transport',
    Equipment: 'Equipment',
    Material: 'Material',
    Maintenance: 'Maintenance'
  };
  return types[type] || type.replace(/_/g, ' ');
};

// Severity formatter
export const formatSeverity = (severity) => {
  if (!severity) return '';
  const severities = {
    Low: 'Low',
    Medium: 'Medium',
    High: 'High',
    Critical: 'Critical'
  };
  return severities[severity] || severity.replace(/_/g, ' ');
};

// Status formatter
export const formatStatus = (status) => {
  if (!status) return '';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};
