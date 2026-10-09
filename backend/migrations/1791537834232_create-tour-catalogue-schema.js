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
  // destinations table
  pgm.createTable('destinations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
      type: 'text',
      notNull: true,
    },
    slug: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    description: {
      type: 'text',
    },
    country: {
      type: 'text',
    },
    region: {
      type: 'text',
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

  pgm.createIndex('destinations', 'slug');
  pgm.createIndex('destinations', 'country');

  // tours table
  pgm.createTable('tours', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    destination_id: {
      type: 'uuid',
      notNull: false,
      references: 'destinations(id)',
      onDelete: 'SET NULL',
    },
    name: {
      type: 'text',
      notNull: true,
    },
    slug: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    short_description: {
      type: 'text',
    },
    full_description: {
      type: 'text',
    },
    duration_days: {
      type: 'integer',
      notNull: false,
      check: 'duration_days > 0',
    },
    base_price: {
      type: 'numeric(12,2)',
      notNull: false,
      check: 'base_price >= 0',
    },
    currency: {
      type: 'char(3)',
      notNull: true,
      default: 'USD',
      check: "currency ~ '^[A-Z]{3}$'",
    },
    group_size: {
      type: 'integer',
      notNull: false,
      check: 'group_size > 0',
    },
    group_size_is_minimum: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    is_featured: {
      type: 'boolean',
      notNull: true,
      default: false,
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

  pgm.createIndex('tours', 'slug');
  pgm.createIndex('tours', 'destination_id');
  pgm.createIndex('tours', 'is_featured');

  // categories table
  pgm.createTable('categories', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    slug: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    description: {
      type: 'text',
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

  pgm.createIndex('categories', 'slug');

  // tour_categories table (many-to-many)
  pgm.createTable('tour_categories', {
    tour_id: {
      type: 'uuid',
      notNull: true,
      references: 'tours(id)',
      onDelete: 'CASCADE',
    },
    category_id: {
      type: 'uuid',
      notNull: true,
      references: 'categories(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('tour_categories', 'tour_categories_pkey', {
    primaryKey: ['tour_id', 'category_id'],
  });

  pgm.createIndex('tour_categories', 'tour_id');
  pgm.createIndex('tour_categories', 'category_id');

  // tour_images table
  pgm.createTable('tour_images', {
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
      onDelete: 'CASCADE',
    },
    image_url: {
      type: 'text',
      notNull: true,
    },
    alt_text: {
      type: 'text',
    },
    display_order: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    is_primary: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('tour_images', 'tour_id');
  pgm.createIndex('tour_images', ['tour_id', 'is_primary'], { unique: true, where: 'is_primary = true' });

  // tour_itinerary table
  pgm.createTable('tour_itinerary', {
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
      onDelete: 'CASCADE',
    },
    day_number: {
      type: 'integer',
      notNull: true,
      check: 'day_number > 0',
    },
    day_label: {
      type: 'text',
      notNull: true,
    },
    title: {
      type: 'text',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    display_order: {
      type: 'integer',
      notNull: true,
      default: 0,
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

  pgm.createIndex('tour_itinerary', 'tour_id');
  pgm.addConstraint('tour_itinerary', 'tour_itinerary_tour_day_unique', {
    unique: ['tour_id', 'day_number'],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('tour_itinerary', { ifExists: true });
  pgm.dropTable('tour_images', { ifExists: true });
  pgm.dropTable('tour_categories', { ifExists: true });
  pgm.dropTable('categories', { ifExists: true });
  pgm.dropTable('tours', { ifExists: true });
  pgm.dropTable('destinations', { ifExists: true });
};