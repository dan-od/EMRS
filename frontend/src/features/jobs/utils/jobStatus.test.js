import { describe, it, expect } from 'vitest';
import { getJobStatusConfig, statusIs, resolveStatusKey } from './jobStatus';
import { STATUS_FLOW, JOB_STATUS_CONFIG } from '../constants';

/**
 * These cover the drift that made every job status badge render gray: the
 * database stores TitleCase, the frontend constants are keyed
 * SCREAMING_SNAKE_CASE, and nothing normalized between them.
 */

// The literal strings workflow.queries.js writes. Verified against the
// database, not copied from the constants file.
const STORED_STATUSES = [
  'Draft', 'Team_Assigned', 'Approved', 'In_Progress', 'Post_Job', 'Completed', 'Cancelled',
];

describe('getJobStatusConfig', () => {
  it.each([
    ['Draft', 'Draft', 'gray'],
    ['Team_Assigned', 'Pending Approval', 'yellow'],
    ['Approved', 'Approved', 'blue'],
    ['In_Progress', 'In Progress', 'primary'],
    ['Post_Job', 'Post Job', 'purple'],
    ['Completed', 'Completed', 'green'],
    ['Cancelled', 'Cancelled', 'red'],
  ])('maps stored %s to its intended label and colour', (stored, label, color) => {
    expect(getJobStatusConfig(stored)).toMatchObject({ label, color });
  });

  it('never falls through to the placeholder for a real stored status', () => {
    // The original bug: every badge hit the fallback. Checking the resolved key
    // is a real config entry, since several labels equal the stored string.
    for (const status of STORED_STATUSES) {
      expect(JOB_STATUS_CONFIG).toHaveProperty(resolveStatusKey(status));
    }
  });

  it('aliases Team_Assigned onto PENDING_APPROVAL', () => {
    // Uppercasing alone yields TEAM_ASSIGNED, which the config has no key for,
    // so this case needs the alias and not just case-insensitivity.
    expect(resolveStatusKey('Team_Assigned')).toBe('PENDING_APPROVAL');
    expect(getJobStatusConfig('Team_Assigned')).toEqual(getJobStatusConfig('PENDING_APPROVAL'));
  });

  it('falls back to gray for an unknown status without throwing', () => {
    expect(getJobStatusConfig('Totally_Unknown')).toEqual({ label: 'Totally_Unknown', color: 'gray' });
  });

  it.each([undefined, null, ''])('survives %p', (input) => {
    expect(getJobStatusConfig(input)).toEqual({ label: 'Unknown', color: 'gray' });
  });
});

describe('statusIs', () => {
  // WorkflowActions depends on this being a plain case-insensitive compare.
  // If aliasing ever leaks in here, its per-status button logic changes shape.
  it('compares case-insensitively', () => {
    expect(statusIs('Draft', 'DRAFT')).toBe(true);
    expect(statusIs('In_Progress', 'in_progress')).toBe(true);
  });

  it('does NOT alias — Team_Assigned alone must not match PENDING_APPROVAL', () => {
    expect(statusIs('Team_Assigned', 'PENDING_APPROVAL')).toBe(false);
    expect(statusIs('Team_Assigned', 'TEAM_ASSIGNED')).toBe(true);
  });

  it('matches when any candidate matches, as WorkflowActions calls it', () => {
    expect(statusIs('Team_Assigned', 'PENDING_APPROVAL', 'TEAM_ASSIGNED')).toBe(true);
  });

  it('returns false for non-matches and empty input', () => {
    expect(statusIs('Completed', 'DRAFT')).toBe(false);
    expect(statusIs(null, 'DRAFT')).toBe(false);
  });
});

describe('JobStatusTracker status resolution', () => {
  // Guards the second instance of the same drift: the tracker indexed
  // STATUS_FLOW with the raw status, so indexOf returned -1 for every job.
  it.each([
    ['Draft', 0], ['Team_Assigned', 1], ['Approved', 2],
    ['In_Progress', 3], ['Post_Job', 4], ['Completed', 5],
  ])('resolves %s to flow index %i', (stored, index) => {
    expect(STATUS_FLOW.indexOf(resolveStatusKey(stored))).toBe(index);
  });

  it('would have failed with a raw lookup', () => {
    expect(STATUS_FLOW.indexOf('Team_Assigned')).toBe(-1);
  });

  it('treats Cancelled as outside the flow', () => {
    expect(STATUS_FLOW.indexOf(resolveStatusKey('Cancelled'))).toBe(-1);
    expect(statusIs('Cancelled', 'CANCELLED')).toBe(true);
  });
});
