/**
 * Maintenance requests — one per lifecycle stage.
 *
 *   1 Pending                     no work order yet
 *   2 Manager_Approved            no work order yet
 *   3 Approved + work order       WO Scheduled
 *   4 Approved + work order       WO In_Progress
 *   5 Approved + work order       WO Completed
 *
 * Stages 3-5 write workOrderId onto BOTH requests.work_order_id and
 * details.workOrderId, because the request detail UI reads the details key.
 */
const { SEED_TAG, SEED_KEY } = require('./seedConfig');
const { userByRole, equipmentIds, requireUser } = require('./seedLookup');

// [requestStatus, workOrderStatus | null, issue]
const STAGES = [
  ['Pending', null, 'Pump losing suction pressure under load'],
  ['Manager_Approved', null, 'Gearbox running hot, oil discoloured'],
  ['Approved', 'Scheduled', 'Control valve sticking on open cycle'],
  ['Approved', 'In_Progress', 'Vibration on drive shaft beyond tolerance'],
  ['Approved', 'Completed', 'Seal replacement on high pressure head'],
];

const insertRequest = async (client, { requester, approver, equipment, status, issue, index }) => {
  const isApproved = status !== 'Pending';
  const details = {
    seedTag: SEED_KEY,
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    issueDescription: issue,
    urgency: 'Medium',
    category: 'Repair',
    purpose: `${SEED_TAG} Maintenance fixture stage ${index + 1}`,
    costEstimate: isApproved ? 150000 + index * 25000 : null,
  };

  const { rows } = await client.query(
    `INSERT INTO requests
       (requester_id, type, status, priority, details, date_needed,
        approved_by, approved_at, manager_cost_estimate)
     VALUES ($1,'Maintenance',$2,'Medium',$3, CURRENT_DATE + 7, $4, $5, $6)
     RETURNING id`,
    [
      requester.id,
      status,
      JSON.stringify(details),
      isApproved ? approver.id : null,
      isApproved ? new Date() : null,
      isApproved ? details.costEstimate : null,
    ]
  );
  return rows[0].id;
};

const insertWorkOrder = async (client, { requestId, equipment, technician, status, issue }) => {
  const started = status !== 'Scheduled';
  const done = status === 'Completed';

  const { rows } = await client.query(
    `INSERT INTO maintenance_schedule
       (equipment_id, maintenance_type, description, scheduled_date, priority, status,
        estimated_cost, assigned_to, assigned_at, started_at, completed_at,
        actual_hours, actual_cost, completion_notes, request_id, created_from)
     VALUES ($1,'Repair',$2, CURRENT_DATE + 3,'Medium',$3,
             180000,$4, NOW(), $5, $6, $7, $8, $9, $10,'request')
     RETURNING id`,
    [
      equipment.id,
      `${SEED_TAG} ${issue}`,
      status,
      technician.id,
      started ? new Date() : null,
      done ? new Date() : null,
      done ? 6.5 : null,
      done ? 172500 : null,
      done ? 'Seal replaced, unit pressure-tested and returned to service.' : null,
      requestId,
    ]
  );
  return rows[0].id;
};

const seedMaintenance = async (client) => {
  const requester = requireUser(await userByRole(client, 'Field_Engineer'), 'Field_Engineer');
  const approver = requireUser(await userByRole(client, 'Maintenance_Manager'), 'Maintenance_Manager');
  const technician = (await userByRole(client, 'Maintenance_Technician')) || approver;
  const equipment = await equipmentIds(client, STAGES.length);
  if (!equipment.length) throw new Error('No equipment rows — cannot seed maintenance');

  for (let i = 0; i < STAGES.length; i++) {
    const [status, workOrderStatus, issue] = STAGES[i];
    const eq = equipment[i % equipment.length];

    const requestId = await insertRequest(client, {
      requester, approver, equipment: eq, status, issue, index: i,
    });

    if (!workOrderStatus) continue;

    const workOrderId = await insertWorkOrder(client, {
      requestId, equipment: eq, technician, status: workOrderStatus, issue,
    });

    await client.query(
      `UPDATE requests
         SET work_order_id = $1::uuid,
             details = details || jsonb_build_object('workOrderId', $2::text)
       WHERE id = $3`,
      [workOrderId, workOrderId, requestId]
    );
  }

  return STAGES.length;
};

module.exports = { seedMaintenance };
