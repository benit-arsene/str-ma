import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

try {
  const history = await pool.query(
    "SELECT name, run_on FROM public.pgmigrations ORDER BY run_on"
  );
  console.log("\nMIGRATION HISTORY:");
  console.table(history.rows);

  const tables = await pool.query(`
    SELECT
      to_regclass('public.payment_transactions') AS payment_table,
      to_regclass('public.reservations') AS reservations_table
  `);
  console.log("\nTABLES:");
  console.table(tables.rows);

  if (tables.rows[0].payment_table) {
    const constraints = await pool.query(`
      SELECT conname, contype, pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE conrelid = 'public.payment_transactions'::regclass
      ORDER BY conname
    `);
    console.log("\nPAYMENT CONSTRAINTS:");
    console.table(constraints.rows);
  }
} catch (error) {
  console.error("DIAGNOSTIC ERROR:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
