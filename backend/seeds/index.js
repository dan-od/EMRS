/**
 * Build Pass 1 — local test data for Safety, Maintenance and Jobs.
 *
 *   node seeds/index.js          seed (removes previous seeded rows first)
 *   node seeds/index.js --clean  remove seeded rows and exit
 *
 * Safe to re-run. Everything is scoped by the markers in seedConfig, so this
 * only ever touches rows it created — the local database also holds real
 * records and no table is truncated.
 */
require('dotenv').config();
const { pool } = require('../src/config/db');
const { clean } = require('./clean.seed');
const { seedSafety } = require('./safety.seed');
const { seedMaintenance } = require('./maintenance.seed');
const { seedJobs } = require('./jobs.seed');

const cleanOnly = process.argv.includes('--clean');

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await clean(client);
    if (cleanOnly) {
      await client.query('COMMIT');
      console.log('🧹 Seeded rows removed.');
      return;
    }

    const safety = await seedSafety(client);
    const maintenance = await seedMaintenance(client);
    const jobs = await seedJobs(client);

    await client.query('COMMIT');

    console.log('🌱 Build Pass 1 seed complete');
    console.log(`   safety_reports  ${safety} rows`);
    console.log(`   maintenance     ${maintenance} requests (3 with work orders)`);
    console.log(`   jobs            ${jobs.jobs} rows — ${jobs.statuses.join(', ')}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();
