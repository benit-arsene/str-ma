/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('payment_transactions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    reservation_id: {
      type: 'uuid',
      notNull: true,
      references: 'reservations(id)',
      onDelete: 'RESTRICT',
    },
    amount: {
      type: 'numeric(12,2)',
      notNull: true,
      check: 'amount > 0',
    },
    currency: {
      type: 'char(3)',
      notNull: true,
      check: "currency ~ '^[A-Z]{3}$'",
    },
    gateway_fee: {
      type: 'numeric(12,2)',
      notNull: true,
      check: 'gateway_fee >= 0',
    },
    merchant_net: {
      type: 'numeric(12,2)',
      notNull: true,
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'initiated',
      check: "status IN ('initiated', 'processing', 'succeeded', 'failed', 'cancelled')",
    },
    provider: {
      type: 'text',
      notNull: true,
      default: 'simulated',
      check: "provider = 'simulated'",
    },
    provider_reference: {
      type: 'text',
    },
    idempotency_key: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    transaction_reference: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // Column-level unique constraints already create unique indexes for idempotency_key and transaction_reference
  pgm.createIndex('payment_transactions', 'reservation_id');
  pgm.createIndex('payment_transactions', 'status');
  pgm.createIndex('payment_transactions', 'provider_reference');

  // Prevent more than one successful payment per reservation
  pgm.createIndex('payment_transactions', 'reservation_id', {
    unique: true,
    where: "status = 'succeeded'",
    name: 'idx_payment_transactions_one_success_per_reservation',
  });

  // Ensure merchant_net = amount - gateway_fee (exact numeric arithmetic)
  pgm.addConstraint('payment_transactions', 'payment_transactions_merchant_net_check', {
    check: 'merchant_net = amount - gateway_fee',
  });

  // Enforce 3% gateway fee with PostgreSQL ROUND (half away from zero for numeric type)
  pgm.addConstraint('payment_transactions', 'payment_transactions_gateway_fee_check', {
    check: "gateway_fee = ROUND(amount * 0.03, 2)",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('payment_transactions', { ifExists: true });
};