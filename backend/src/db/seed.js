import { pool } from "../db.js";

const destinations = [
  {
    name: "Greece",
    slug: "greece",
    country: "Greece",
    description: "Sun-drenched islands, whitewashed villages, and crystal-clear waters await.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpuBhszKEb8YEYa1gqfHLP9r-VxKT5-74FUnOXdZ8SULmYwTuRoKZOk6og&s=10",
  },
  {
    name: "Switzerland",
    slug: "switzerland",
    country: "Switzerland",
    description: "Journey through Switzerland's breathtaking mountains, lakes, and charming villages.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPQWAyDiiNAY0kGKh0NuG8ecd_h2eCBwfTbylS5sXs2UJAr4N0Mg5MgXY&s=10",
  },
  {
    name: "India",
    slug: "india",
    country: "India",
    description: "Explore the Thar Desert's majestic forts and camel safaris under starlit skies.",
    imageUrl: "https://www.agoda.com/wp-content/uploads/2024/04/Agra-cover-1244x700.jpg",
  },
  {
    name: "Thailand",
    slug: "thailand",
    country: "Thailand",
    description: "Discover Thailand's vibrant culture, stunning beaches, and ancient temples.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQSujSPrAkTmeam-MrAedSwZeDQuWZyX-He0bE7Ye04A&s=10",
  },
  {
    name: "Italy",
    slug: "italy",
    country: "Italy",
    description: "Art, history, and cuisine across Italy's most iconic cities.",
    imageUrl: "https://images.goway.com/production/styles/article_featured_image_3xl/s3/featured_images/Gornergrat-tourist-train-with-waterfall%2C-bridge-and-Matterhorn%2C-Zermatt%2C-Switzerland_AdobeStock_357392613.jpeg.webp?VersionId=9mo5ly3faIhUY3lxrPODTVvbzc801sS6&h=0875ea28&itok=M1d-5FQZ",
  },
];

const categories = [
  { name: "Cultural", slug: "cultural", description: "Immerse yourself in local traditions, arts, and heritage." },
  { name: "Adventure", slug: "adventure", description: "Thrilling experiences for the bold and curious traveler." },
  { name: "Historical", slug: "historical", description: "Journey through time to explore ancient sites and landmarks." },
  { name: "Seaside", slug: "seaside", description: "Relax on beautiful coastlines and enjoy ocean views." },
  { name: "Discovery", slug: "discovery", description: "Uncover hidden gems and off-the-beaten-path destinations." },
];

const tours = [
  {
    slug: "aegean-dreams-santorini-mykonos",
    destinationSlug: "greece",
    name: "Aegean Dreams: Santorini & Mykonos",
    shortDescription: "Sun-drenched islands, whitewashed villages, and crystal-clear waters await.",
    fullDescription: "Experience the magic of the Aegean Sea with visits to Santorini's iconic caldera and Mykonos' vibrant nightlife. Discover whitewashed villages perched on cliffs, sample fresh seafood, and watch unforgettable sunsets over the Mediterranean.",
    durationDays: 7, // "6 days 3 hours" rounded up to next whole day
    basePrice: 2500.00,
    currency: "USD",
    groupSize: 15,
    groupSizeIsMinimum: true,
    isFeatured: true,
  },
  {
    slug: "golden-sands-rajasthan-desert-safari",
    destinationSlug: "india",
    name: "Golden Sands of Rajasthan and Desert Safari",
    shortDescription: "Explore the Thar Desert's majestic forts and camel safaris under starlit skies.",
    fullDescription: "Journey into the heart of Rajasthan's Thar Desert. Visit the golden city of Jaisalmer with its magnificent fort, ride camels across rolling sand dunes, and spend nights under starlit skies at desert camps. Experience Rajasthani culture, music, and cuisine.",
    durationDays: 2, // "1 day 8 hours" rounded up to next whole day
    basePrice: 750.00,
    currency: "USD",
    groupSize: 50,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "alpine-majesty-peaks-glaciers",
    destinationSlug: "switzerland",
    name: "Alpine Majesty: Peaks & Glaciers",
    shortDescription: "Journey through Switzerland's breathtaking mountains, lakes, and charming villages.",
    fullDescription: "Discover Switzerland's alpine wonders from towering peaks to pristine glacial lakes. Ride scenic mountain railways, visit car-free villages like Zermatt, and marvel at the Matterhorn. Experience Swiss hospitality in charming mountain chalets.",
    durationDays: 8, // "7 days 8 hours" rounded up to next whole day
    basePrice: 750.00,
    currency: "USD",
    groupSize: 50,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
  {
    slug: "italian-splendor-rome-florence-venice",
    destinationSlug: "italy",
    name: "Italian Splendor: Rome, Florence & Venice",
    shortDescription: "Art, history, and cuisine across Italy's most iconic cities.",
    fullDescription: "Explore the cultural treasures of Italy's three most iconic cities. In Rome, walk through ancient ruins and Vatican museums. In Florence, admire Renaissance masterpieces. In Venice, glide through canals and visit St. Mark's Square. Savor authentic Italian cuisine throughout.",
    durationDays: 8, // "7 days 8 hours" rounded up to next whole day
    basePrice: 1200.00,
    currency: "USD",
    groupSize: 50,
    groupSizeIsMinimum: true,
    isFeatured: false,
  },
];

const tourCategories = {
  "aegean-dreams-santorini-mykonos": ["seaside", "discovery", "cultural"],
  "golden-sands-rajasthan-desert-safari": ["adventure", "cultural", "discovery"],
  "alpine-majesty-peaks-glaciers": ["adventure", "discovery"],
  "italian-splendor-rome-florence-venice": ["cultural", "historical", "discovery"],
};

const tourImages = {
  "aegean-dreams-santorini-mykonos": [
    {
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKnf2s2cwypBVZhtw3Zx8lfJNKvTrRrUV4aBc2Ksn5OA&s=10",
      altText: "Aegean Dreams: Santorini & Mykonos tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "golden-sands-rajasthan-desert-safari": [
    {
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmyrUYgA10vOt3udjR7BrdzcmJIVyw1FHk_BYWmRfZRyatwyLckV25b5Y&s=10",
      altText: "Golden Sands of Rajasthan and Desert Safari tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "alpine-majesty-peaks-glaciers": [
    {
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPQWAyDiiNAY0kGKh0NuG8ecd_h2eCBwfTbylS5sXs2UJAr4N0Mg5MgXY&s=10",
      altText: "Alpine Majesty: Peaks & Glaciers tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
  "italian-splendor-rome-florence-venice": [
    {
      imageUrl: "https://images.goway.com/production/styles/article_featured_image_3xl/s3/featured_images/Gornergrat-tourist-train-with-waterfall%2C-bridge-and-Matterhorn%2C-Zermatt%2C-Switzerland_AdobeStock_357392613.jpeg.webp?VersionId=9mo5ly3faIhUY3lxrPODTVvbzc801sS6&h=0875ea28&itok=M1d-5FQZ",
      altText: "Italian Splendor: Rome, Florence & Venice tour",
      displayOrder: 0,
      isPrimary: true,
    },
  ],
};

async function seedDestinations(client) {
  for (const dest of destinations) {
    await client.query(
      `INSERT INTO destinations (name, slug, country, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         country = EXCLUDED.country,
         description = EXCLUDED.description,
         updated_at = now()`,
      [dest.name, dest.slug, dest.country, dest.description]
    );
  }
}

async function seedCategories(client) {
  for (const cat of categories) {
    await client.query(
      `INSERT INTO categories (name, slug, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         updated_at = now()`,
      [cat.name, cat.slug, cat.description]
    );
  }
}

async function seedTours(client) {
  for (const tour of tours) {
    const destResult = await client.query(
      `SELECT id FROM destinations WHERE slug = $1`,
      [tour.destinationSlug]
    );
    if (destResult.rows.length === 0) {
      throw new Error(`Destination not found for slug: ${tour.destinationSlug}`);
    }
    const destinationId = destResult.rows[0].id;

    await client.query(
      `INSERT INTO tours (destination_id, name, slug, short_description, full_description, duration_days, base_price, currency, group_size, group_size_is_minimum, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (slug) DO UPDATE SET
         destination_id = EXCLUDED.destination_id,
         name = EXCLUDED.name,
         short_description = EXCLUDED.short_description,
         full_description = EXCLUDED.full_description,
         duration_days = EXCLUDED.duration_days,
         base_price = EXCLUDED.base_price,
         currency = EXCLUDED.currency,
         group_size = EXCLUDED.group_size,
         group_size_is_minimum = EXCLUDED.group_size_is_minimum,
         is_featured = EXCLUDED.is_featured,
         updated_at = now()`,
      [
        destinationId,
        tour.name,
        tour.slug,
        tour.shortDescription,
        tour.fullDescription,
        tour.durationDays,
        tour.basePrice,
        tour.currency,
        tour.groupSize,
        tour.groupSizeIsMinimum,
        tour.isFeatured,
      ]
    );
  }
}

async function seedTourCategories(client) {
  for (const [tourSlug, categorySlugs] of Object.entries(tourCategories)) {
    const tourResult = await client.query(
      `SELECT id FROM tours WHERE slug = $1`,
      [tourSlug]
    );
    if (tourResult.rows.length === 0) {
      throw new Error(`Tour not found for slug: ${tourSlug}`);
    }
    const tourId = tourResult.rows[0].id;

    for (const categorySlug of categorySlugs) {
      const catResult = await client.query(
        `SELECT id FROM categories WHERE slug = $1`,
        [categorySlug]
      );
      if (catResult.rows.length === 0) {
        throw new Error(`Category not found for slug: ${categorySlug}`);
      }
      const categoryId = catResult.rows[0].id;

      await client.query(
        `INSERT INTO tour_categories (tour_id, category_id)
         VALUES ($1, $2)
         ON CONFLICT (tour_id, category_id) DO NOTHING`,
        [tourId, categoryId]
      );
    }
  }
}

async function seedTourImages(client) {
  for (const [tourSlug, images] of Object.entries(tourImages)) {
    const tourResult = await client.query(
      `SELECT id FROM tours WHERE slug = $1`,
      [tourSlug]
    );
    if (tourResult.rows.length === 0) {
      throw new Error(`Tour not found for slug: ${tourSlug}`);
    }
    const tourId = tourResult.rows[0].id;

    // Delete existing images for this tour to ensure idempotency
    await client.query(
      `DELETE FROM tour_images WHERE tour_id = $1`,
      [tourId]
    );

    for (const img of images) {
      await client.query(
        `INSERT INTO tour_images (tour_id, image_url, alt_text, display_order, is_primary)
         VALUES ($1, $2, $3, $4, $5)`,
        [tourId, img.imageUrl, img.altText, img.displayOrder, img.isPrimary]
      );
    }
  }
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await seedDestinations(client);
    await seedCategories(client);
    await seedTours(client);
    await seedTourCategories(client);
    await seedTourImages(client);
    await client.query("COMMIT");
    console.log("Destinations, categories, tours, tour-category associations, and tour images seeded successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(() => process.exit(1));