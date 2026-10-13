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
  pgm.createTable('reservations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    tour_id: {
      type: 'uuid',
      notNull: true,
      references: 'tours(id)',
      onDelete: 'RESTRICT',
    },
    travel_date: {
      type: 'date',
      notNull: true,
    },
    travelers: {
      type: 'integer',
      notNull: true,
      check: 'travelers > 0 AND travelers <= 20',
    },
    full_name: {
      type: 'text',
      notNull: true,
    },
    email: {
      type: 'text',
      notNull: true,
      check: "email ~* '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'",
    },
    phone: {
      type: 'text',
      notNull: true,
    },
    special_requests: {
      type: 'text',
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'pending',
      check: "status IN ('pending', 'confirmed', 'cancelled', 'completed')",
    },
    booking_reference: {
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

  pgm.createIndex('reservations', 'tour_id');
  pgm.createIndex('reservations', 'travel_date');
  pgm.createIndex('reservations', 'email');
  pgm.createIndex('reservations', 'status');
  pgm.createIndex('reservations', 'booking_reference');

  // Partial unique index to prevent duplicate active reservations
  // for the same tour, travel date, and normalized email
  pgm.createIndex('reservations', ['tour_id', 'travel_date', 'lower(email)'], {
    unique: true,
    where: "status IN ('pending', 'confirmed')",
    name: 'idx_reservations_unique_active',
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('reservations', { ifExists: true });
};