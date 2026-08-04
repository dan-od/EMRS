/**
 * Safety reports — 18 rows.
 *
 * Coverage (every enum value appears at least twice):
 *   type      Incident 6 | Hazard 6 | Near_Miss 6
 *   severity  Critical 4 | High 5 | Medium 5 | Low 4
 *   status    Open 6 | In_Progress 4 | Resolved 4 | Closed 4
 *
 * resolved_at is stamped only for 'Resolved', never 'Closed' — the stats
 * query's resolved_count keys off 'Resolved' specifically, so keeping the
 * two distinct is what makes that stat card verifiable.
 */
const { SEED_TAG } = require('./seedConfig');
const { usersAcrossDepartments } = require('./seedLookup');

// [type, severity, status, title, location]
const REPORTS = [
  ['Incident', 'Critical', 'Open', 'Hydraulic line rupture on pump skid', 'Field Site Alpha'],
  ['Incident', 'High', 'In_Progress', 'Operator hand injury during hose connection', 'Warehouse A'],
  ['Incident', 'Medium', 'Resolved', 'Minor chemical splash during transfer', 'Mixing Plant'],
  ['Incident', 'Low', 'Closed', 'Slip on wet workshop floor, no injury', 'Workshop'],
  ['Incident', 'Critical', 'Resolved', 'Uncontrolled pressure release at wellhead', 'Well Pad 7'],
  ['Incident', 'High', 'Open', 'Crane load swing struck scaffold', 'Yard'],
  ['Hazard', 'Low', 'Open', 'Poor lighting in rear storage aisle', 'Warehouse B'],
  ['Hazard', 'Medium', 'In_Progress', 'Frayed sling on lifting rack', 'Yard'],
  ['Hazard', 'High', 'Resolved', 'Exposed live wiring near pump controls', 'Field Site Alpha'],
  ['Hazard', 'Critical', 'Closed', 'H2S monitor out of calibration', 'Well Pad 3'],
  ['Hazard', 'Low', 'In_Progress', 'Blocked emergency exit in admin block', 'Head Office'],
  ['Hazard', 'Medium', 'Open', 'Missing guard on grinding wheel', 'Workshop'],
  ['Near_Miss', 'Medium', 'Open', 'Forklift near-collision with pedestrian', 'Warehouse A'],
  ['Near_Miss', 'Low', 'Resolved', 'Dropped hand tool from platform, area clear', 'Well Pad 7'],
  ['Near_Miss', 'High', 'Closed', 'Vehicle reversed without banksman', 'Motor Pool'],
  ['Near_Miss', 'Critical', 'In_Progress', 'Nitrogen line pressurised during maintenance', 'Field Site Bravo'],
  ['Near_Miss', 'Medium', 'Closed', 'Unsecured load shifted in transit', 'Access Road'],
  ['Near_Miss', 'High', 'Open', 'Worker entered exclusion zone during lift', 'Yard'],
];

// One row is anonymous (reporter_id NULL) to exercise that path.
const ANONYMOUS_INDEX = 4;

const seedSafety = async (client) => {
  const reporters = await usersAcrossDepartments(client, 8);
  if (!reporters.length) throw new Error('No active users found — cannot seed safety reports');

  for (let i = 0; i < REPORTS.length; i++) {
    const [type, severity, status, title, location] = REPORTS[i];
    const isAnonymous = i === ANONYMOUS_INDEX;
    const reporterId = isAnonymous ? null : reporters[i % reporters.length].id;
    const isResolved = status === 'Resolved';

    await client.query(
      `INSERT INTO safety_reports
         (reporter_id, type, severity, status, title, description, location,
          incident_date, is_anonymous, resolution, resolved_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, CURRENT_DATE - ($8::int), $9, $10, $11)`,
      [
        reporterId,
        type,
        severity,
        status,
        `${SEED_TAG} ${title}`,
        `Seeded ${severity.toLowerCase()}-severity ${type.replace('_', ' ').toLowerCase()} for local testing. ${title}.`,
        location,
        i, // staggers incident_date across the last 18 days
        isAnonymous,
        isResolved ? 'Corrective action completed and verified by Safety.' : null,
        isResolved ? new Date() : null,
      ]
    );
  }

  return REPORTS.length;
};

module.exports = { seedSafety };
