import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, description, country, region, created_at, updated_at
       FROM destinations
       ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/destinations error:", err.message);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

export default router;