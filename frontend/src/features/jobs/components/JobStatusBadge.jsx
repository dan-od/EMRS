/**
 * JobStatusBadge - Displays job status with color
 */
import { JOB_STATUS_CONFIG } from '../constants';

const colors = {
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
};

export const JobStatusBadge = ({ status, size = 'md' }) => {
  const cfg = JOB_STATUS_CONFIG[status] || { label: status, color: 'gray' };
  const sz = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return <span className={`inline-flex items-center font-medium rounded-full ${colors[cfg.color]} ${sz}`}>{cfg.label}</span>;
};

export default JobStatusBadge;
