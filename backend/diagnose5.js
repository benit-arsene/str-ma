import { pool } from './src/db.js';

async function diagnose() {
  const client = await pool.connect();
  try {
    // List all constraints in the database
    const cons = await client.query(`
      SELECT conname, conrelid::regclass as table_name, contype
      FROM pg_constraint
      ORDER BY conname;
    `);
    console.log('\nAll constraints in database:');
    if (cons.rows.length === 0) {
      console.log('No constraints found.');
    } else {
      console.table(cons.rows);
    }

  } finally {
    client.release();
  }
}

diagnose().catch(console.error);
