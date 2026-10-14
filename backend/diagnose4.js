import { pool } from './src/db.js';

async function diagnose() {
  const client = await pool.connect();
  try {
    // List all schemas
    const schemas = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      ORDER BY schema_name;
    `);
    console.log('\nSchemas:');
    console.table(schemas.rows);

    // For each schema, check for payment_transactions table
    for (const row of schemas.rows) {
      const schema = row.schema_name;
      const tabExists = await client.query(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = $1 AND table_name = 'payment_transactions'
        ) AS exists
      `, [schema]);
      if (tabExists.rows[0].exists) {
        console.log(`\nFound payment_transactions table in schema ${schema}:`);
        // List columns
        const cols = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = 'payment_transactions'
          ORDER BY ordinal_position;
        `, [schema]);
        console.table(cols.rows);
        // List constraints
        const cons = await client.query(`
          SELECT conname, contype
          FROM pg_constraint
          WHERE conrelid = $1.payment_transactions::regclass
          ORDER BY conname;
        `, [schema]);
        console.log('Constraints:');
        console.table(cons.rows);
      }
    }

    // Check for constraint name anywhere
    const consName = await client.query(`
      SELECT conname, conrelid::regclass as table_name, contype
      FROM pg_constraint
      WHERE conname = 'payment_transactions_gateway_fee_check'
    `);
    console.log('\nConstraint payment_transactions_gateway_fee_check exists anywhere:');
    if (consName.rows.length === 0) {
      console.log('No such constraint found.');
    } else {
      console.table(consName.rows);
    }

  } finally {
    client.release();
  }
}

diagnose().catch(console.error);
