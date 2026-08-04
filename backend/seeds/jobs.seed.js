/**
 * Jobs — one per real status, plus team and equipment.
 *
 * The 7 statuses below are the literal strings workflow.queries.js actually
 * writes (TitleCase). The job_status_expanded enum also carries SCREAMING_CASE
 * duplicates (APPROVED / POST_JOB / IN_PROGRESS) and six never-written members;
 * those are dead and deliberately not seeded.
 */
const { SEED_TAG, JOB_PREFIX } = require('./seedConfig');
const { userByRole, fillDistinctUsers, equipmentIds, requireUser } = require('./seedLookup');

const STATUSES = [
  'Draft', 'Team_Assigned', 'Approved', 'In_Progress', 'Post_Job', 'Completed', 'Cancelled',
];

// job_team.role is the job_team_role enum; role_in_job is a parallel varchar.
const TEAM_ROLES = ['SUPERVISOR', 'CHIEF_OPERATOR', 'DAQ', 'ENGINEER'];

const AFTER_SUBMIT = ['Team_Assigned', 'Approved', 'In_Progress', 'Post_Job', 'Completed'];
const AFTER_APPROVE = ['Approved', 'In_Progress', 'Post_Job', 'Completed'];
const AFTER_START = ['In_Progress', 'Post_Job', 'Completed'];

const insertJob = async (client, { index, status, supervisor, manager, engineer }) => {
  const submitted = AFTER_SUBMIT.includes(status);
  const approved = AFTER_APPROVE.includes(status);
  const started = AFTER_START.includes(status);

  const { rows } = await client.query(
    `INSERT INTO jobs
       (job_number, client, location, description, status, department, priority,
        created_by, supervisor_id, start_date, expected_end_date,
        submitted_at, submitted_by, approved_at, approved_by,
        signoff_completed, signoff_at, signoff_by,
        started_at, started_by, completed_at, well_name)
     VALUES ($1,$2,$3,$4,$5,'Operations',$6,
             $7,$8, CURRENT_DATE + 2, CURRENT_DATE + 12,
             $9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     RETURNING id`,
    [
      `${JOB_PREFIX}${String(index + 1).padStart(3, '0')}`,
      `${SEED_TAG} Client ${String.fromCharCode(65 + index)}`,
      `Field Site ${String.fromCharCode(65 + index)}`,
      `${SEED_TAG} Fixture job parked at ${status} for local testing.`,
      status,
      index % 2 === 0 ? 'High' : 'Medium',
      engineer.id,
      supervisor.id,
      submitted ? new Date() : null,
      submitted ? supervisor.id : null,
      approved ? new Date() : null,
      approved ? manager.id : null,
      approved,                       // sign-off gates startJob
      approved ? new Date() : null,
      approved ? supervisor.id : null,
      started ? new Date() : null,
      started ? supervisor.id : null,
      status === 'Completed' ? new Date() : null,
      `WELL-${String(index + 1).padStart(2, '0')}`,
    ]
  );
  return rows[0].id;
};

const addTeam = async (client, jobId, members, assignedBy) => {
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    if (!member) continue;
    await client.query(
      `INSERT INTO job_team (job_id, user_id, role, role_in_job, assigned_by)
       VALUES ($1,$2,$3,$4,$5)`,
      [jobId, member.id, TEAM_ROLES[i], TEAM_ROLES[i], assignedBy.id]
    );
  }
};

const seedJobs = async (client) => {
  const supervisor = requireUser(await userByRole(client, 'Operations_Manager'), 'Operations_Manager');
  const manager = requireUser(await userByRole(client, 'Maintenance_Manager'), 'Maintenance_Manager');
  const engineer = requireUser(await userByRole(client, 'Field_Engineer'), 'Field_Engineer');
  const operator = await userByRole(client, 'Operator');
  const daq = await userByRole(client, 'Technician');

  // One distinct user per TEAM_ROLES slot, in that order.
  const team = await fillDistinctUsers(client, [supervisor, operator, daq, engineer], TEAM_ROLES.length);
  if (team.length < TEAM_ROLES.length) throw new Error('Need at least 4 active users to seed job teams');

  const equipment = await equipmentIds(client, STATUSES.length * 2);
  if (!equipment.length) throw new Error('No equipment rows — cannot seed jobs');

  for (let i = 0; i < STATUSES.length; i++) {
    const jobId = await insertJob(client, {
      index: i, status: STATUSES[i], supervisor, manager, engineer,
    });

    await addTeam(client, jobId, team, supervisor);

    // Draft jobs intentionally get no equipment: submitJob requires a non-empty
    // equipment list, so this leaves the guard genuinely exercisable.
    if (STATUSES[i] === 'Draft') continue;

    for (const eq of [equipment[(i * 2) % equipment.length], equipment[(i * 2 + 1) % equipment.length]]) {
      await client.query(
        `INSERT INTO job_equipment (job_id, equipment_id, assigned_by) VALUES ($1,$2,$3)`,
        [jobId, eq.id, supervisor.id]
      );
    }
  }

  return { jobs: STATUSES.length, statuses: STATUSES };
};

module.exports = { seedJobs };
