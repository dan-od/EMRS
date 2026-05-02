const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'equipment' 
  ORDER BY ordinal_position
`).then(r => {
  console.table(r.rows);
  pool.end();
}).catch(err => {
  console.error(err);
  pool.end();
});