/**
 * Jobs Queries - Team Operations
 * Supports: SUPERVISOR, CHIEF_OPERATOR, DAQ, ENGINEER roles
 */

const getByJobId = `
  SELECT jt.*, u.first_name, u.last_name, u.email, u.role as system_role, u.department
  FROM job_team jt
  JOIN users u ON jt.user_id = u.id
  WHERE jt.job_id = $1
  ORDER BY 
    CASE jt.role 
      WHEN 'SUPERVISOR' THEN 1 
      WHEN 'CHIEF_OPERATOR' THEN 2 
      WHEN 'DAQ' THEN 3 
      ELSE 4 
    END, 
    jt.assigned_at
`;

const add = `
  INSERT INTO job_team (job_id, user_id, role, assigned_by)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (job_id, user_id) DO UPDATE SET role = $3
  RETURNING *
`;

const remove = `DELETE FROM job_team WHERE job_id = $1 AND user_id = $2 RETURNING *`;

const updateRole = `
  UPDATE job_team SET role = $3, updated_at = NOW()
  WHERE job_id = $1 AND user_id = $2
  RETURNING *
`;

const getSupervisor = `
  SELECT jt.*, u.first_name, u.last_name, u.email
  FROM job_team jt
  JOIN users u ON jt.user_id = u.id
  WHERE jt.job_id = $1 AND jt.role = 'SUPERVISOR'
`;

const getByRole = `
  SELECT jt.*, u.first_name, u.last_name, u.email
  FROM job_team jt
  JOIN users u ON jt.user_id = u.id
  WHERE jt.job_id = $1 AND jt.role = $2
`;

const canRequest = `
  SELECT EXISTS(
    SELECT 1 FROM job_team 
    WHERE job_id = $1 AND user_id = $2 
    AND role IN ('SUPERVISOR', 'CHIEF_OPERATOR', 'DAQ')
  ) as can_request
`;

const isSupervisor = `
  SELECT EXISTS(
    SELECT 1 FROM job_team 
    WHERE job_id = $1 AND user_id = $2 AND role = 'SUPERVISOR'
  ) as is_supervisor
`;

module.exports = { 
  getByJobId, add, remove, updateRole, 
  getSupervisor, getByRole, canRequest, isSupervisor 
};
