import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, description, created_at, updated_at
       FROM categories
       ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/categories error:", err.message);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;