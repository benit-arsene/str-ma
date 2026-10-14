import { pool } from './src/db.js';

async function diagnose() {
  const client = await pool.connect();
  try {
    // Check pgmigrations
    let migRes;
    try {
      migRes = await client.query('SELECT * FROM public.pgmigrations ORDER BY id;');
    } catch (e) {
      console.log('Error querying pgmigrations (maybe table does not exist):', e.message);
      migRes = { rows: [] };
    }
    console.log('Applied migrations:', migRes.rows.map(r => r.name));

    // Check if reservations table has price_per_person and currency
    const resCols = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'reservations'
      ORDER BY ordinal_position;
    `);
    console.log('\nReservations columns:');
    console.table(resCols.rows);

    // Check if payment_transactions table exists in any schema
    const tabExists = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_tables
        WHERE schemaname = ANY (current_schemas(false))
          AND tablename = 'payment_transactions'
      ) AS exists
    `);
    console.log('\nPayment transactions table exists in any schema:', tabExists.rows[0].exists);

    if (tabExists.rows[0].exists) {
      // Get the schema and table details
      const tabInfo = await client.query(`
        SELECT schemaname, tablename, tableowner, hasindexes
        FROM pg_catalog.pg_tables
        WHERE schemaname = ANY (current_schemas(false))
          AND tablename = 'payment_transactions'
      `);
      console.log('\nPayment transactions table info:');
      console.table(tabInfo.rows);

      // List columns
      const ptCols = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = ANY (current_schemas(false)) AND table_name = 'payment_transactions'
        ORDER BY ordinal_position;
      `);
      console.log('\nPayment transactions columns:');
      console.table(ptCols.rows);

      // List constraints
      const cons = await client.query(`
        SELECT conname, contype
        FROM pg_constraint
        WHERE conrelid = 'payment_transactions'::regclass
        ORDER BY conname;
      `);
      console.log('\nPayment transactions constraints:');
      console.table(cons.rows);

      // List indexes
      const idx = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = ANY (current_schemas(false)) AND tablename = 'payment_transactions'
        ORDER BY indexname;
      `);
      console.log('\nPayment transactions indexes:');
      console.table(idx.rows);
    }

    // Check if the constraint name exists anywhere
    const consNameExists = await client.query(`
      SELECT conname, conrelid::regclass as table_name, contype
      FROM pg_constraint
      WHERE conname = 'payment_transactions_gateway_fee_check'
    `);
    console.log('\nConstraint payment_transactions_gateway_fee_check exists anywhere:');
    if (consNameExists.rows.length === 0) {
      console.log('No such constraint found.');
    } else {
      console.table(consNameExists.rows);
    }

  } finally {
    client.release();
  }
}

diagnose().catch(console.error);
