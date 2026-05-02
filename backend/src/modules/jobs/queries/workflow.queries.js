/**
 * Jobs Queries - Workflow Operations
 * Status transitions and history
 * 
 * Enum values: Draft, Team_Assigned, Planning, Inspection, Approved, Equipped, 
 *              In_Transit, In_Progress, Completing, Post_Job, Completed, On_Hold, Cancelled
 */

const submit = `
  UPDATE jobs SET status = 'Team_Assigned', submitted_at = NOW(),
    submitted_by = $2, updated_at = NOW()
  WHERE id = $1 AND UPPER(status::text) = 'DRAFT' RETURNING *
`;

const approve = `
  UPDATE jobs SET status = 'Approved', approved_at = NOW(),
    approved_by = $2, updated_at = NOW()
  WHERE id = $1 AND UPPER(status::text) = 'TEAM_ASSIGNED' RETURNING *
`;

const reject = `
  UPDATE jobs SET status = 'Draft', submitted_at = NULL,
    submitted_by = NULL, updated_at = NOW()
  WHERE id = $1 AND UPPER(status::text) = 'TEAM_ASSIGNED' RETURNING *
`;

const signoff = `
  UPDATE jobs SET signoff_completed = TRUE, signoff_at = NOW(),
    signoff_by = $2, signoff_notes = $3, updated_at = NOW()
  WHERE id = $1 AND UPPER(status::text) = 'APPROVED' RETURNING *
`;

const start = `
  UPDATE jobs SET status = 'In_Progress', started_at = NOW(),
    started_by = $2, updated_at = NOW()
  WHERE id = $1 AND UPPER(status::text) = 'APPROVED' AND signoff_completed = TRUE RETURNING *
`;

const moveToPostJob = `
  UPDATE jobs SET status = 'Post_Job', updated_at = NOW()
  WHERE id = $1 AND UPPER(status::text) = 'IN_PROGRESS' RETURNING *
`;

const complete = `
  UPDATE jobs SET status = 'Completed', completed_at = NOW(),
    actual_end_date = CURRENT_DATE, updated_at = NOW()
  WHERE id = $1 AND UPPER(status::text) = 'POST_JOB' RETURNING *
`;

const cancel = `
  UPDATE jobs SET status = 'Cancelled', updated_at = NOW()
  WHERE id = $1 AND UPPER(status::text) NOT IN ('IN_PROGRESS', 'POST_JOB', 'COMPLETED') RETURNING *
`;

// Status history
const addHistory = `
  INSERT INTO job_status_history (job_id, from_status, to_status, changed_by, notes)
  VALUES ($1, $2, $3, $4, $5) RETURNING *
`;

const getHistory = `
  SELECT jsh.*, changer.first_name || ' ' || changer.last_name as changed_by_name
  FROM job_status_history jsh
  LEFT JOIN users changer ON jsh.changed_by = changer.id
  WHERE jsh.job_id = $1 ORDER BY jsh.created_at DESC
`;

module.exports = {
  submit, approve, reject, signoff, start,
  moveToPostJob, complete, cancel,
  addHistory, getHistory
};
