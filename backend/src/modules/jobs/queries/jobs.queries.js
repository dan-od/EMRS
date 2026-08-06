/**
 * Jobs Queries — job-level reads.
 *
 * This file previously held a near-copy of equipment.queries.js, so every
 * queries.jobs.* lookup resolved to undefined and the list, detail and stats
 * endpoints failed with "Client was passed a null or undefined query". The
 * job queries had never existed in the repository.
 *
 * Read path only. create, update and generateNumber are deliberately NOT
 * defined here: they are write-path work that needs decisions this file
 * cannot infer (job_number format, update semantics). Leaving them absent
 * makes updateJob fail loudly rather than silently running the equipment
 * UPDATE it used to resolve to.
 *
 * Status comparisons go through lower(status::text) because job_status_expanded
 * carries both TitleCase members (what workflow.queries.js writes) and
 * SCREAMING_CASE duplicates.
 */

// Column list shared by the list views. Kept narrow: the detail query
// returns the full row, the lists only need what JobCard renders.
const LIST_COLUMNS = `
  j.id, j.job_number, j.client, j.location, j.well_name, j.description,
  j.status, j.priority, j.department,
  j.start_date, j.end_date, j.expected_end_date,
  j.supervisor_id, j.created_by, j.created_at, j.updated_at,
  (SELECT COUNT(*) FROM job_team t
    WHERE t.job_id = j.id AND t.removed_at IS NULL) AS team_count,
  (SELECT COUNT(*) FROM job_equipment_items i
    WHERE i.job_id = j.id) AS equipment_count
`;

// $1 status (nullable), $2 search (nullable)
const LIST_FILTER = `
  ($1::text IS NULL OR LOWER(j.status::text) = LOWER($1::text))
  AND (
    $2::text IS NULL OR
    j.job_number ILIKE '%' || $2 || '%' OR
    j.client ILIKE '%' || $2 || '%' OR
    j.location ILIKE '%' || $2 || '%' OR
    COALESCE(j.well_name, '') ILIKE '%' || $2 || '%'
  )
`;

const findAll = `
  SELECT ${LIST_COLUMNS}
  FROM jobs j
  WHERE ${LIST_FILTER}
  ORDER BY j.created_at DESC
  LIMIT $3 OFFSET $4
`;

const countAll = `
  SELECT COUNT(*)::int AS total
  FROM jobs j
  WHERE ${LIST_FILTER}
`;

// A job is "mine" if I am on the team, supervising it, or created it.
// $1 userId, $2 status (nullable)
const MY_JOBS_FILTER = `
  (jt.user_id IS NOT NULL OR j.supervisor_id = $1 OR j.created_by = $1)
  AND ($2::text IS NULL OR LOWER(j.status::text) = LOWER($2::text))
`;

const MY_JOBS_JOIN = `
  LEFT JOIN job_team jt
    ON jt.job_id = j.id AND jt.user_id = $1 AND jt.removed_at IS NULL
`;

const findMyJobs = `
  SELECT ${LIST_COLUMNS}, jt.role::text AS my_role
  FROM jobs j
  ${MY_JOBS_JOIN}
  WHERE ${MY_JOBS_FILTER}
  ORDER BY j.created_at DESC
  LIMIT $3 OFFSET $4
`;

const countMyJobs = `
  SELECT COUNT(*)::int AS total
  FROM jobs j
  ${MY_JOBS_JOIN}
  WHERE ${MY_JOBS_FILTER}
`;

const findById = `
  SELECT
    j.*,
    sup.first_name || ' ' || sup.last_name AS supervisor_name,
    crt.first_name || ' ' || crt.last_name AS created_by_name,
    apr.first_name || ' ' || apr.last_name AS approved_by_name,
    sgn.first_name || ' ' || sgn.last_name AS signoff_by_name
  FROM jobs j
  LEFT JOIN users sup ON sup.id = j.supervisor_id
  LEFT JOIN users crt ON crt.id = j.created_by
  LEFT JOIN users apr ON apr.id = j.approved_by
  LEFT JOIN users sgn ON sgn.id = j.signoff_by
  WHERE j.id = $1
`;

// Keys match what JobList reads off the stats response.
// pending_approval is the Team_Assigned state, which is what submitJob writes.
const getStats = `
  SELECT
    COUNT(*) FILTER (WHERE LOWER(status::text) = 'draft')         AS draft,
    COUNT(*) FILTER (WHERE LOWER(status::text) = 'team_assigned') AS pending_approval,
    COUNT(*) FILTER (WHERE LOWER(status::text) = 'approved')      AS approved,
    COUNT(*) FILTER (WHERE LOWER(status::text) = 'in_progress')   AS in_progress,
    COUNT(*) FILTER (WHERE LOWER(status::text) = 'post_job')      AS post_job,
    COUNT(*) FILTER (WHERE LOWER(status::text) = 'completed')     AS completed,
    COUNT(*) FILTER (WHERE LOWER(status::text) = 'cancelled')     AS cancelled,
    COUNT(*)                                                      AS total
  FROM jobs
`;

// $1 jobId, $2 userId
const isTeamMember = `
  SELECT EXISTS (
    SELECT 1 FROM job_team
    WHERE job_id = $1 AND user_id = $2 AND removed_at IS NULL
  ) AS is_member
`;

// jobs.supervisor_id is authoritative; the job_team role covers members
// assigned as supervisor without the column being set.
const isSupervisor = `
  SELECT EXISTS (
    SELECT 1 FROM jobs j
    LEFT JOIN job_team jt
      ON jt.job_id = j.id AND jt.user_id = $2 AND jt.removed_at IS NULL
    WHERE j.id = $1 AND (j.supervisor_id = $2 OR jt.role = 'SUPERVISOR')
  ) AS is_supervisor
`;

const getUserRole = `
  SELECT role::text AS role
  FROM job_team
  WHERE job_id = $1 AND user_id = $2 AND removed_at IS NULL
  LIMIT 1
`;

module.exports = {
  findAll, countAll,
  findMyJobs, countMyJobs,
  findById, getStats,
  isTeamMember, isSupervisor, getUserRole,
};
