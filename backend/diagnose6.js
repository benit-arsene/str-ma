import { pool } from './src/db.js';

async function diagnose() {
  const client = await pool.connect();
  try {
    // Check for any relation named payment_transactions (table, view, foreign table, materialized view)
    const rel = await client.query(`
      SELECT relname, relkind
      FROM pg_class
      WHERE relname = 'payment_transactions'
        AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `);
    console.log('\nRelation payment_transactions in public schema:');
    if (rel.rows.length === 0) {
      console.log('No such relation found.');
    } else {
      console.table(rel.rows);
    }

    // Also check if there is any constraint with that name on any relation
    const cons = await client.query(`
      SELECT conname, conrelid::regclass as table_name, contype
      FROM pg_constraint
      WHERE conname = 'payment_transactions_gateway_fee_check'
    `);
    console.log('\nConstraint payment_transactions_gateway_fee_check:');
    if (cons.rows.length === 0) {
      console.log('No such constraint found.');
    } else {
      console.table(cons.rows);
    }

  } finally {
    client.release();
  }
}

diagnose().catch(console.error);
