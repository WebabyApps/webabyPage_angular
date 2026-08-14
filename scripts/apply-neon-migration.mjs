import { readFile } from 'node:fs/promises';
import pg from 'pg';

const migrationFiles = process.argv.slice(2);
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}
if (!migrationFiles.length) {
  throw new Error('Pass at least one SQL migration file');
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: true },
  max: 1,
});

try {
  for (const migrationFile of migrationFiles) {
    const sql = await readFile(migrationFile, 'utf8');
    await pool.query(sql);
    console.log(`Applied migration: ${migrationFile}`);
  }
} finally {
  await pool.end();
}
