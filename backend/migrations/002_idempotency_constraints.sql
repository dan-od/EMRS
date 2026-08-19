-- 002 — Constraints that make duplicated side effects impossible.
--
-- Field staff work over unreliable mobile links: a request can reach the
-- server, commit, and never deliver its response, so the user taps again.
-- These indexes hold regardless of which code path performs the write, which
-- an application-layer check cannot promise.

-- ---------------------------------------------------------------------------
-- 1. One work order per request.
--
-- This has already happened in practice: a request was approved twice and
-- produced two work orders four minutes apart. Existing duplicates are
-- DETACHED rather than deleted — a work order may carry real maintenance
-- history, so the earliest one keeps the link and later ones are unlinked
-- with a note explaining why.
-- ---------------------------------------------------------------------------
WITH ranked AS (
  SELECT id,
         request_id,
         ROW_NUMBER() OVER (PARTITION BY request_id ORDER BY created_at, id) AS rn
  FROM maintenance_schedule
  WHERE request_id IS NOT NULL
)
UPDATE maintenance_schedule m
SET request_id = NULL,
    -- This literal originally had to avoid semicolons: splitStatements() in
    -- src/config/migrate.js cut statements on any ; including inside strings
    -- and comments. That is fixed, but the wording is left as-is because this
    -- migration has already been applied.
    notes = COALESCE(m.notes || E'\n', '')
            || '[migration 002] Detached from request ' || r.request_id
            || ' as a duplicate work order. The earliest work order for that '
            || 'request keeps the link. This row is preserved for history.'
FROM ranked r
WHERE m.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_maintenance_schedule_request
  ON maintenance_schedule (request_id)
  WHERE request_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. Job numbers — ALREADY UNIQUE, deliberately not re-added.
--
-- 001_init.sql declares jobs.job_number UNIQUE, which Postgres backs with
-- jobs_job_number_key, so the protection the Jobs write path will need is
-- already in place. A second index on the same column would cost write
-- throughput and disk for no additional guarantee.
--
-- The requirement still stands for E3-018: generateNumber will be a
-- read-then-insert and will race under retry. It must handle a unique
-- violation as "someone else took that number, pick the next one" rather
-- than assuming its SELECT is still true by the time it INSERTs.
-- ---------------------------------------------------------------------------
DROP INDEX IF EXISTS uniq_jobs_job_number;

-- ---------------------------------------------------------------------------
-- 3. One review per vendor per reviewer.
--
-- A replayed rating would otherwise insert a second row and skew the vendor
-- average. Partial, because reviewed_by is nullable and NULLs do not conflict.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uniq_vendor_reviews_vendor_reviewer
  ON vendor_reviews (vendor_id, reviewed_by)
  WHERE reviewed_by IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 4. One pending extension per request line.
--
-- Extensions are per item (item_index), and only one may be outstanding at a
-- time — requests.has_pending_extension already assumes this. COALESCE because
-- item_index is nullable and NULL would otherwise never collide.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uniq_return_extensions_pending
  ON return_extensions (request_id, COALESCE(item_index, -1))
  WHERE status = 'Pending';
