import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         t.id, t.name, t.slug, t.short_description, t.full_description,
         t.duration_days, t.base_price, t.currency, t.group_size,
         t.group_size_is_minimum, t.is_featured,
         d.slug AS destination_slug, d.name AS destination_name,
         COALESCE(
           json_agg(
             json_build_object('slug', c.slug, 'name', c.name)
           ) FILTER (WHERE c.id IS NOT NULL),
           '[]'
         ) AS categories,
         CASE 
           WHEN ti.image_url IS NOT NULL THEN
             json_build_object('image_url', ti.image_url, 'alt_text', ti.alt_text)
           ELSE NULL
         END AS primary_image
       FROM tours t
       JOIN destinations d ON t.destination_id = d.id
       LEFT JOIN tour_categories tc ON t.id = tc.tour_id
       LEFT JOIN categories c ON tc.category_id = c.id
       LEFT JOIN tour_images ti ON ti.tour_id = t.id AND ti.is_primary = true
       GROUP BY t.id, d.slug, d.name, ti.image_url, ti.alt_text
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/tours error:", err.message);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT 
         t.id, t.name, t.slug, t.short_description, t.full_description,
         t.duration_days, t.base_price, t.currency, t.group_size,
         t.group_size_is_minimum, t.is_featured,
         d.slug AS destination_slug, d.name AS destination_name,
         COALESCE(
           json_agg(
             json_build_object('slug', c.slug, 'name', c.name)
           ) FILTER (WHERE c.id IS NOT NULL),
           '[]'
         ) AS categories,
         CASE 
           WHEN ti.image_url IS NOT NULL THEN
             json_build_object('image_url', ti.image_url, 'alt_text', ti.alt_text)
           ELSE NULL
         END AS primary_image
       FROM tours t
       JOIN destinations d ON t.destination_id = d.id
       LEFT JOIN tour_categories tc ON t.id = tc.tour_id
       LEFT JOIN categories c ON tc.category_id = c.id
       LEFT JOIN tour_images ti ON ti.tour_id = t.id AND ti.is_primary = true
       WHERE t.slug = $1
       GROUP BY t.id, d.slug, d.name, ti.image_url, ti.alt_text`,
      [slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/tours/:slug error:", err.message);
    res.status(500).json({ error: "Failed to fetch tour" });
  }
});

export default router;