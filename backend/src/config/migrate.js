const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const migrationsDir = path.join(__dirname, '../../migrations');

const runMigrations = async () => {
  console.log('🚀 Running database migrations...\n');
  
  try {
    // Create migrations tracking table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Get already executed migrations
    const { rows: executed } = await pool.query('SELECT name FROM migrations');
    const executedNames = executed.map(r => r.name);

    // Get migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    let migrationsRun = 0;

    for (const file of files) {
      if (executedNames.includes(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`📝 Running ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await pool.query(sql);
      await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      
      console.log(`✅ ${file} completed`);
      migrationsRun++;
    }

    if (migrationsRun === 0) {
      console.log('\n✨ All migrations already up to date');
    } else {
      console.log(`\n🎉 ${migrationsRun} migration(s) completed successfully`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations();
