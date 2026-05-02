require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { pool, query } = require('../src/config/db');

const DEPARTMENTS = ['IT', 'HR', 'Logistics', 'Workshop'];

const PPE_DETAILS = {
  items: [{ name: 'Safety Helmet', quantity: 1, unit: 'pcs', specifications: 'Class E, ANSI Z89.1' }],
  purpose: 'Field operations PPE requirement',
  additionalNotes: 'Seed data — transfer test'
};

async function run() {
  try {
    const { rows: users } = await query(
      `SELECT id, first_name, last_name, department FROM users
       WHERE role IN ('Field_Engineer', 'Staff') AND is_active = true
       LIMIT 4`
    );

    if (!users.length) {
      console.error('No Field_Engineer or Staff users found. Seed some users first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} requester(s): ${users.map(u => `${u.first_name} ${u.last_name}`).join(', ')}`);
    console.log('');

    let created = 0;
    for (const dept of DEPARTMENTS) {
      for (let i = 0; i < 2; i++) {
        const requester = users[i % users.length];
        const { rows } = await query(
          `INSERT INTO requests
             (requester_id, type, priority, status, details, date_needed,
              transferred_to, transferred_at, transfer_notes, updated_at)
           VALUES ($1, 'PPE', 'Medium', 'Pending', $2, NOW() + interval '3 days',
                   $3, NOW(), 'Transferred for department review', NOW())
           RETURNING id, type, status, transferred_to`,
          [requester.id, JSON.stringify(PPE_DETAILS), dept]
        );
        const r = rows[0];
        console.log(`  [${dept}] ${r.id} — status: ${r.status}, transferred_to: ${r.transferred_to}`);
        created++;
      }
    }

    console.log(`\nDone. ${created} requests created (2 per department × 4 departments).`);
  } finally {
    await pool.end();
  }
}

run().catch(err => { console.error(err.message); process.exit(1); });
