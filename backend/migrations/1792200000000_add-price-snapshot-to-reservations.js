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
  pgm.addColumn('reservations', {
    price_per_person: {
      type: 'numeric(12,2)',
      notNull: false,
      check: 'price_per_person >= 0',
    },
    currency: {
      type: 'char(3)',
      notNull: false,
      check: "currency ~ '^[A-Z]{3}$'",
    },
  });

  pgm.createIndex('reservations', 'currency');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropColumn('reservations', ['price_per_person', 'currency']);
};