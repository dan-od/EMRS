/**
 * Shared markers for Build Pass 1 local test data.
 *
 * Every row this seed writes carries one of these markers so it can be
 * found and removed without touching real data. The local dev DB already
 * holds genuine records (users, equipment, requests), so this seed is
 * strictly additive — it never truncates a table.
 */

// Prefixes free-text columns (safety_reports.title, maintenance descriptions).
const SEED_TAG = '[SEED]';

// Stamped into requests.details JSONB, which has no title column to prefix.
const SEED_KEY = 'BUILD-PASS-1';

// jobs.job_number is NOT NULL + human-facing, so it carries its own prefix.
const JOB_PREFIX = 'SEED-JOB-';

module.exports = { SEED_TAG, SEED_KEY, JOB_PREFIX };
