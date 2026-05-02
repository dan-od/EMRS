const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const migrationsDir = path.join(__dirname, '../../migrations');

/**
 * Split a SQL string into individual executable statements.
 *
 * Tracks $$ and $tag$ dollar-quoted blocks (PL/pgSQL function bodies, etc.)
 * so that semicolons inside those blocks are never treated as boundaries.
 * Filters out empty chunks and comment-only chunks.
 */
function splitStatements(sql) {
  const statements = [];
  let current = '';
  let dollarTag = null; // null = outside a dollar-quoted block; string = open tag content

  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];

    if (ch === '$') {
      // Try to parse a dollar-quote tag: $tag$ (empty tag → $$, named tag → $func$ etc.)
      // Tags cannot span lines, so stop scanning at newline.
      let j = i + 1;
      while (j < sql.length && sql[j] !== '$' && sql[j] !== '\n') j++;

      if (j < sql.length && sql[j] === '$') {
        const tag = sql.slice(i + 1, j); // content between the two $ signs
        const fullTag = `$${tag}$`;

        if (dollarTag === null) {
          // Opening a dollar-quoted block
          dollarTag = tag;
          current += fullTag;
          i = j + 1;
          continue;
        } else if (tag === dollarTag) {
          // Closing the current dollar-quoted block
          dollarTag = null;
          current += fullTag;
          i = j + 1;
          continue;
        }
        // A $other$ tag inside an already-open block — not a boundary, fall through
      }
      current += ch;
      i++;
    } else if (ch === ';' && dollarTag === null) {
      // Statement boundary — only valid outside a dollar-quoted block
      current += ch;
      const stmt = current.trim();
      if (stmt && stmt !== ';' && !isCommentOnly(stmt)) {
        statements.push(stmt);
      }
      current = '';
      i++;
    } else {
      current += ch;
      i++;
    }
  }

  // Capture any trailing content not terminated by a semicolon
  const trailing = current.trim();
  if (trailing && !isCommentOnly(trailing)) {
    statements.push(trailing);
  }

  return statements;
}

function isCommentOnly(text) {
  return text.split('\n').every(line => {
    const t = line.trim();
    return t === '' || t.startsWith('--');
  });
}

const runMigrations = async () => {
  console.log('🚀 Running database migrations...\n');

  try {
    // Bootstrap the tracking table — idempotent, safe to run every time
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const { rows: executed } = await pool.query('SELECT name FROM migrations');
    const executedNames = executed.map(r => r.name);

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
      const statements = splitStatements(sql);

      for (const stmt of statements) {
        try {
          await pool.query(stmt);
        } catch (err) {
          const preview = stmt.length > 100 ? `${stmt.slice(0, 100)}...` : stmt;
          console.error(`❌ Statement failed: ${preview}`);
          throw err;
        }
      }

      // Tracking row inserted only after ALL statements in the file succeed
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
