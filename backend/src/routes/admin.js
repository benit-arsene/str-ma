import express from "express";

import { pool } from "../db.js";
import {
  SESSION_COOKIE_NAME,
  clearLoginAttempts,
  cookieOptions,
  destroyAdminSession,
  hashPassword,
  hashToken,
  generateSessionToken,
  parseCookieHeader,
  recordLoginAttempt,
  requireAdmin,
  requireSameOrigin,
  verifyPassword,
  checkLoginRateLimit,
  createAdminSession,
} from "../middleware/auth.js";

const router = express.Router();

const ALLOWED_STATUSES = ["pending", "confirmed", "cancelled", "completed"];
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SEARCH_LENGTH = 200;
const MIN_PAGE = 1;
const MAX_PAGE = 10000;
const DEFAULT_PAGE = 1;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const RESERVATION_COLUMNS = `
  r.id,
  r.tour_id,
  r.booking_reference,
  r.travel_date,
  r.travelers,
  r.full_name,
  r.email,
  r.phone,
  r.special_requests,
  r.status,
  r.created_at,
  r.updated_at,
  t.name AS tour_name,
  t.slug AS tour_slug,
  d.name AS destination_name
`;

function validationError(details) {
  return { error: "Validation failed", details };
}

function escapeLike(value) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function mapReservationRow(row) {
  return {
    id: row.id,
    bookingReference: row.booking_reference,
    status: row.status,
    travelDate: row.travel_date,
    travelers: row.travelers,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    specialRequests: row.special_requests,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tour: row.tour_name
      ? {
          id: row.tour_id,
          name: row.tour_name,
          slug: row.tour_slug,
          destinationName: row.destination_name,
        }
      : null,
  };
}

router.post("/login", requireSameOrigin, async (req, res) => {
  const clientKey = `login:${req.ip || "unknown"}`;
  const rateLimit = checkLoginRateLimit(clientKey);

  if (rateLimit.limited) {
    return res
      .status(429)
      .set("Retry-After", String(rateLimit.retryAfter))
      .json({
        error: "Too many login attempts. Please try again later.",
        retryAfter: rateLimit.retryAfter,
      });
  }

  try {
    const { username, password } = req.body || {};

    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      recordLoginAttempt(clientKey);
      return res.status(400).json(
        validationError([
          { field: "username", message: "Username and password are required" },
        ])
      );
    }

    const normalizedUsername = username.trim().toLowerCase();
    const result = await pool.query(
      `SELECT id, username, password_salt, password_hash
         FROM admins
        WHERE username = $1`,
      [normalizedUsername]
    );

    if (result.rows.length === 0) {
      await hashPassword(password);
      recordLoginAttempt(clientKey);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const admin = result.rows[0];
    const validPassword = await verifyPassword(
      password,
      admin.password_salt,
      admin.password_hash
    );

    if (!validPassword) {
      recordLoginAttempt(clientKey);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = generateSessionToken();
    await createAdminSession(admin.id, token);
    clearLoginAttempts(clientKey);

    return res
      .status(200)
      .set("Cache-Control", "no-store")
      .cookie(SESSION_COOKIE_NAME, token, cookieOptions())
      .json({ ok: true, admin: { id: admin.id, username: admin.username } });
  } catch (err) {
    console.error("POST /api/admin/login error:", err.message);
    return res.status(500).json({ error: "Failed to log in" });
  }
});

router.post("/logout", requireSameOrigin, async (req, res) => {
  try {
    const cookies = parseCookieHeader(req.get("Cookie"));
    const token = cookies[SESSION_COOKIE_NAME];

    if (token) {
      await destroyAdminSession(hashToken(token));
    }

    return res
      .status(200)
      .clearCookie(SESSION_COOKIE_NAME, { ...cookieOptions(), maxAge: 0 })
      .json({ ok: true });
  } catch (err) {
    console.error("POST /api/admin/logout error:", err.message);
    return res.status(500).json({ error: "Failed to log out" });
  }
});

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
              COUNT(*) FILTER (WHERE status = 'confirmed')::int AS confirmed,
              COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled,
              COUNT(*) FILTER (WHERE status = 'completed')::int AS completed
         FROM reservations`
    );

    const row = result.rows[0];
    return res.json({
      total: row.total,
      byStatus: {
        pending: row.pending,
        confirmed: row.confirmed,
        cancelled: row.cancelled,
        completed: row.completed,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/stats error:", err.message);
    return res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

router.get("/reservations", requireAdmin, async (req, res) => {
  try {
    const details = [];

    let page = DEFAULT_PAGE;
    if (req.query.page !== undefined) {
      page = Number(req.query.page);
      if (
        !Number.isInteger(page) ||
        page < MIN_PAGE ||
        page > MAX_PAGE
      ) {
        details.push({
          field: "page",
          message: `Page must be an integer between ${MIN_PAGE} and ${MAX_PAGE}`,
        });
      }
    }

    let limit = DEFAULT_LIMIT;
    if (req.query.limit !== undefined) {
      limit = Number(req.query.limit);
      if (
        !Number.isInteger(limit) ||
        limit < MIN_LIMIT ||
        limit > MAX_LIMIT
      ) {
        details.push({
          field: "limit",
          message: `Limit must be an integer between ${MIN_LIMIT} and ${MAX_LIMIT}`,
        });
      }
    }

    let status = null;
    if (req.query.status !== undefined && req.query.status !== "") {
      status = String(req.query.status).toLowerCase();
      if (!ALLOWED_STATUSES.includes(status)) {
        details.push({
          field: "status",
          message: "Status must be one of: pending, confirmed, cancelled, completed",
        });
      }
    }

    let searchPattern = null;
    if (req.query.q !== undefined && String(req.query.q).trim() !== "") {
      const search = String(req.query.q).trim();
      if (search.length > MAX_SEARCH_LENGTH) {
        details.push({
          field: "q",
          message: `Search query must be at most ${MAX_SEARCH_LENGTH} characters`,
        });
      } else {
        searchPattern = `%${escapeLike(search)}%`;
      }
    }

    if (details.length > 0) {
      return res.status(400).json(validationError(details));
    }

    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }

    if (searchPattern) {
      params.push(searchPattern);
      conditions.push(
        `(r.booking_reference ILIKE $${params.length}
            OR r.full_name ILIKE $${params.length}
            OR r.email ILIKE $${params.length})`
      );
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM reservations r ${whereClause}`,
      params
    );
    const total = countResult.rows[0].total;

    const offset = (page - 1) * limit;
    const listResult = await pool.query(
      `SELECT ${RESERVATION_COLUMNS}
         FROM reservations r
         LEFT JOIN tours t ON r.tour_id = t.id
         LEFT JOIN destinations d ON t.destination_id = d.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return res.json({
      items: listResult.rows.map(mapReservationRow),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("GET /api/admin/reservations error:", err.message);
    return res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

router.get("/reservations/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(400).json(
        validationError([
          { field: "id", message: "Reservation ID must be a valid UUID" },
        ])
      );
    }

    const result = await pool.query(
      `SELECT ${RESERVATION_COLUMNS}
         FROM reservations r
         LEFT JOIN tours t ON r.tour_id = t.id
         LEFT JOIN destinations d ON t.destination_id = d.id
        WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    return res.json(mapReservationRow(result.rows[0]));
  } catch (err) {
    console.error("GET /api/admin/reservations/:id error:", err.message);
    return res.status(500).json({ error: "Failed to fetch reservation" });
  }
});

router.patch(
  "/reservations/:id/status",
  requireSameOrigin,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const details = [];

      if (!UUID_REGEX.test(id)) {
        details.push({
          field: "id",
          message: "Reservation ID must be a valid UUID",
        });
      }

      const requestedStatus =
        typeof req.body?.status === "string"
          ? req.body.status.toLowerCase()
          : null;

      if (!requestedStatus || !ALLOWED_STATUSES.includes(requestedStatus)) {
        details.push({
          field: "status",
          message: "Status must be one of: pending, confirmed, cancelled, completed",
        });
      }

      if (details.length > 0) {
        return res.status(400).json(validationError(details));
      }

      const result = await pool.query(
        `UPDATE reservations
            SET status = $1, updated_at = now()
          WHERE id = $2
      RETURNING id, status, updated_at`,
        [requestedStatus, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Reservation not found" });
      }

      return res.json({
        id: result.rows[0].id,
        status: result.rows[0].status,
        updatedAt: result.rows[0].updated_at,
      });
    } catch (err) {
      console.error("PATCH /api/admin/reservations/:id/status error:", err.message);
      return res.status(500).json({ error: "Failed to update reservation status" });
    }
  }
);

export default router;
