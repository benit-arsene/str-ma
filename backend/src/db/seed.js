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

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await seedDestinations(client);
    await seedCategories(client);
    await client.query("COMMIT");
    console.log("Destinations and categories seeded successfully");
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