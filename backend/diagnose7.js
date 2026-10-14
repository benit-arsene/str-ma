import { pool } from './src/db.js';

async function diagnose() {
  const client = await pool.connect();
  try {
    // Describe pgmigrations table
    const desc = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pgmigrations'
      ORDER BY ordinal_position;
    `);
    console.log('\nPgmigrations table structure:');
    console.table(desc.rows);

    // Select all rows with any extra info
    const rows = await client.query(`
      SELECT * FROM public.pgmigrations ORDER BY id;
    `);
    console.log('\nPgmigrations rows:');
    console.table(rows.rows);

  } finally {
    client.release();
  }
}

diagnose().catch(console.error);
