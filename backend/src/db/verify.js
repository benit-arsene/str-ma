import { pool } from "../db.js";

async function verify() {
  const client = await pool.connect();
  try {
    console.log("=== Destinations ===");
    const destResult = await client.query(
      `SELECT slug, name, country FROM destinations ORDER BY slug`
    );
    console.log(`Count: ${destResult.rows.length}`);
    destResult.rows.forEach(r => console.log(`  ${r.slug} | ${r.name} | ${r.country}`));

    console.log("\n=== Categories ===");
    const catResult = await client.query(
      `SELECT slug, name FROM categories ORDER BY slug`
    );
    console.log(`Count: ${catResult.rows.length}`);
    catResult.rows.forEach(r => console.log(`  ${r.slug} | ${r.name}`));

    console.log("\n=== Tours ===");
    const tourResult = await client.query(
      `SELECT t.slug, t.name, t.base_price, t.currency, t.duration_days, d.slug AS destination_slug
       FROM tours t
       JOIN destinations d ON t.destination_id = d.id
       ORDER BY t.slug`
    );
    console.log(`Count: ${tourResult.rows.length}`);
    tourResult.rows.forEach(r => console.log(`  ${r.slug} | $${r.base_price} ${r.currency} | ${r.duration_days} days | dest: ${r.destination_slug}`));

    console.log("\n=== Tour-Category Associations ===");
    const tcResult = await client.query(
      `SELECT t.slug AS tour, c.slug AS category
       FROM tour_categories tc
       JOIN tours t ON tc.tour_id = t.id
       JOIN categories c ON tc.category_id = c.id
       ORDER BY t.slug, c.slug`
    );
    console.log(`Count: ${tcResult.rows.length}`);
    tcResult.rows.forEach(r => console.log(`  ${r.tour} -> ${r.category}`));

    console.log("\n=== Tour Images ===");
    const imgResult = await client.query(
      `SELECT t.slug AS tour, ti.image_url, ti.is_primary, ti.display_order
       FROM tour_images ti
       JOIN tours t ON ti.tour_id = t.id
       ORDER BY t.slug, ti.display_order`
    );
    console.log(`Count: ${imgResult.rows.length}`);
    const primaryCounts = {};
    imgResult.rows.forEach(r => {
      console.log(`  ${r.tour} | primary: ${r.is_primary} | order: ${r.display_order} | ${r.image_url.substring(0, 80)}...`);
      primaryCounts[r.tour] = (primaryCounts[r.tour] || 0) + (r.is_primary ? 1 : 0);
    });
    console.log("\nPrimary image counts per tour:");
    Object.entries(primaryCounts).forEach(([tour, count]) => {
      console.log(`  ${tour}: ${count} primary image(s)`);
    });

    console.log("\n=== Integrity Checks ===");
    
    // Check for tours without destination
    const noDest = await client.query(
      `SELECT t.slug FROM tours t LEFT JOIN destinations d ON t.destination_id = d.id WHERE d.id IS NULL`
    );
    if (noDest.rows.length > 0) {
      console.log(`WARNING: Tours without valid destination: ${noDest.rows.map(r => r.slug).join(", ")}`);
    } else {
      console.log("OK: All tours have valid destination references");
    }

    // Check for tour_categories without valid tour/category
    const orphanTc = await client.query(
      `SELECT tc.tour_id, tc.category_id
       FROM tour_categories tc
       LEFT JOIN tours t ON tc.tour_id = t.id
       LEFT JOIN categories c ON tc.category_id = c.id
       WHERE t.id IS NULL OR c.id IS NULL`
    );
    if (orphanTc.rows.length > 0) {
      console.log(`WARNING: Orphan tour_categories: ${orphanTc.rows.length}`);
    } else {
      console.log("OK: All tour_categories have valid tour and category references");
    }

    // Check duplicate slugs
    const dupDest = await client.query(
      `SELECT slug, COUNT(*) FROM destinations GROUP BY slug HAVING COUNT(*) > 1`
    );
    const dupCat = await client.query(
      `SELECT slug, COUNT(*) FROM categories GROUP BY slug HAVING COUNT(*) > 1`
    );
    const dupTour = await client.query(
      `SELECT slug, COUNT(*) FROM tours GROUP BY slug HAVING COUNT(*) > 1`
    );
    if (dupDest.rows.length > 0) console.log(`WARNING: Duplicate destination slugs: ${dupDest.rows.map(r => r.slug).join(", ")}`);
    if (dupCat.rows.length > 0) console.log(`WARNING: Duplicate category slugs: ${dupCat.rows.map(r => r.slug).join(", ")}`);
    if (dupTour.rows.length > 0) console.log(`WARNING: Duplicate tour slugs: ${dupTour.rows.map(r => r.slug).join(", ")}`);
    if (dupDest.rows.length === 0 && dupCat.rows.length === 0 && dupTour.rows.length === 0) {
      console.log("OK: No duplicate slugs in destinations, categories, or tours");
    }

  } catch (err) {
    console.error("Verification failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

verify().catch(() => process.exit(1));