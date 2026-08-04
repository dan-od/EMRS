/**
 * Job status helpers — the single place that knows about status casing drift.
 *
 * workflow.queries.js writes TitleCase (Draft, Team_Assigned, Approved,
 * In_Progress, Post_Job, Completed, Cancelled) while the frontend constants
 * are keyed SCREAMING_SNAKE_CASE, so any raw lookup misses and falls through.
 */
import { JOB_STATUS_CONFIG } from '../constants';

const normalize = (status) => (status || '').toUpperCase();

// Team_Assigned is what submitJob actually writes; PENDING_APPROVAL is the
// frontend's name for that same step and the only key the config carries.
const ALIASES = { TEAM_ASSIGNED: 'PENDING_APPROVAL' };

// Maps a stored status onto the key the frontend constants use, so callers
// can index into JOB_STATUS_CONFIG or STATUS_FLOW without knowing about drift.
export const resolveStatusKey = (status) => {
  const key = normalize(status);
  return ALIASES[key] || key;
};

export const statusIs = (status, ...values) => {
  const s = normalize(status);
  return values.some((v) => normalize(v) === s);
};

export const getJobStatusConfig = (status) =>
  JOB_STATUS_CONFIG[resolveStatusKey(status)] || { label: status || 'Unknown', color: 'gray' };
