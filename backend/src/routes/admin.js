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
const STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: ["pending"],
  completed: [],
};
// Payment transaction statuses accepted by the finance endpoint. Kept in sync
// with the CHECK constraint on payment_transactions.status.
const PAYMENT_STATUSES = [
  "initiated",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
];
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SEARCH_LENGTH = 200;
const MIN_PAGE = 1;
const MAX_PAGE = 10000;
const DEFAULT_PAGE = 1;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

// Payment status is derived only from the server-side payment_transactions
// table (never from a client-supplied value). The aggregate runs as a LATERAL
// subquery over the reservation_id index, so every reservation on the page is
// resolved inside the single listing query (no N+1) and any number of payment
// attempts can never duplicate a reservation row.
//
// Precedence matches the payment rules: a successful payment always wins, even
// over a later failed or cancelled attempt.
//   paid     -> at least one transaction succeeded
//   pending  -> no success, and a transaction is initiated or processing
//   not_paid -> no transactions at all, or only failed/cancelled attempts
const PAYMENT_STATUS_JOIN = `
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(bool_or(p.status = 'succeeded'), false) AS has_success,
      COALESCE(bool_or(p.status IN ('initiated', 'processing')), false) AS has_pending
      FROM payment_transactions p
     WHERE p.reservation_id = r.id
  ) pay ON true
`;

// Requires PAYMENT_STATUS_JOIN to be present in the query.
const PAYMENT_STATUS_COLUMN = `
  CASE
    WHEN pay.has_success THEN 'paid'
    WHEN pay.has_pending THEN 'pending'
    ELSE 'not_paid'
  END AS payment_status
`;

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
  ${PAYMENT_STATUS_COLUMN},
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
    // "paid" | "pending" | "not_paid", computed by the database above.
    paymentStatus: row.payment_status,
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

router.get("/finance", requireAdmin, async (req, res) => {
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
      if (!PAYMENT_STATUSES.includes(status)) {
        details.push({
          field: "status",
          message:
            "Status must be one of: initiated, processing, succeeded, failed, cancelled",
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

    // Aggregates are computed entirely in SQL from persisted rows. Currency is
    // never combined: every metric is grouped by currency. "Collected" counts
    // succeeded transactions only; "pending" sums in-flight attempts (which is
    // NOT the same as unique amounts owed, since one reservation may have more
    // than one initiated/processing attempt). Gateway fees and merchant net are
    // read from the stored columns, which the schema enforces as
    // gateway_fee = ROUND(amount * 0.03, 2) and merchant_net = amount - gateway_fee.
    const summaryResult = await pool.query(
      `SELECT currency,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'initiated')::int AS initiated,
              COUNT(*) FILTER (WHERE status = 'processing')::int AS processing,
              COUNT(*) FILTER (WHERE status = 'succeeded')::int AS succeeded,
              COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
              COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled,
              COALESCE(SUM(amount) FILTER (WHERE status = 'succeeded'), 0)::numeric AS collected,
              COALESCE(SUM(amount) FILTER (WHERE status IN ('initiated', 'processing')), 0)::numeric AS pending,
              COALESCE(SUM(gateway_fee) FILTER (WHERE status = 'succeeded'), 0)::numeric AS gatewayFees,
              COALESCE(SUM(merchant_net) FILTER (WHERE status = 'succeeded'), 0)::numeric AS merchantNet,
              COUNT(*) FILTER (WHERE status IN ('initiated', 'processing'))::int AS pendingCount
         FROM payment_transactions
        GROUP BY currency
        ORDER BY currency`
    );

    const summary = {};
    for (const row of summaryResult.rows) {
      summary[row.currency] = {
        collected: row.collected,
        pending: row.pending,
        gatewayFees: row.gatewayFees,
        merchantNet: row.merchantNet,
        counts: {
          total: row.total,
          initiated: row.initiated,
          processing: row.processing,
          succeeded: row.succeeded,
          failed: row.failed,
          cancelled: row.cancelled,
        },
        pendingCount: row.pendingCount,
      };
    }

    // Reservations are "paid" when they have at least one succeeded transaction.
    // A reservation with only failed/cancelled attempts, or no attempts at all,
    // is unpaid. This is resolved in a single LATERAL subquery per reservation,
    // so multiple attempts can never duplicate the reservation row.
    const reservationResult = await pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE pay.has_success) AS paid
         FROM reservations r
         LEFT JOIN LATERAL (
           SELECT COALESCE(bool_or(p.status = 'succeeded'), false) AS has_success
             FROM payment_transactions p
            WHERE p.reservation_id = r.id
         ) pay ON true`
    );
    const reservationRow = reservationResult.rows[0];
    const totalReservations = reservationRow.total;
    const paidReservations = Number(reservationRow.paid);

    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`p.status = $${params.length}`);
    }

    if (searchPattern) {
      params.push(searchPattern);
      conditions.push(
        `(p.transaction_reference ILIKE $${params.length}
            OR r.booking_reference ILIKE $${params.length})`
      );
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
         FROM payment_transactions p
         JOIN reservations r ON r.id = p.reservation_id
        ${whereClause}`,
      params
    );
    const totalTransactions = countResult.rows[0].total;

    const offset = (page - 1) * limit;
    const listResult = await pool.query(
      `SELECT p.transaction_reference,
              r.booking_reference,
              p.amount,
              p.currency,
              p.gateway_fee AS gatewayFees,
              p.merchant_net AS merchantNet,
              p.status,
              p.provider,
              p.created_at
         FROM payment_transactions p
         JOIN reservations r ON r.id = p.reservation_id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return res.json({
      simulated: true,
      generatedAt: new Date().toISOString(),
      summary,
      reservations: {
        total: totalReservations,
        paid: paidReservations,
        unpaid: totalReservations - paidReservations,
      },
      transactions: {
        items: listResult.rows,
        pagination: {
          total: totalTransactions,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(totalTransactions / limit)),
        },
      },
    });
  } catch (err) {
    console.error("GET /api/admin/finance error:", err.message);
    return res.status(500).json({ error: "Failed to fetch finance data" });
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
       ${PAYMENT_STATUS_JOIN}
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
       ${PAYMENT_STATUS_JOIN}
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

      let client;

      try {
        client = await pool.connect();
        await client.query("BEGIN");

        const currentResult = await client.query(
          `SELECT id, status, updated_at
             FROM reservations
            WHERE id = $1
            FOR UPDATE`,
          [id]
        );

        if (currentResult.rows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({ error: "Reservation not found" });
        }

        const currentRow = currentResult.rows[0];

        if (currentRow.status === requestedStatus) {
          await client.query("ROLLBACK");
          return res.json({
            id: currentRow.id,
            status: currentRow.status,
            updatedAt: currentRow.updated_at,
          });
        }

        const permitted = STATUS_TRANSITIONS[currentRow.status] || [];

        if (!permitted.includes(requestedStatus)) {
          await client.query("ROLLBACK");
          const permittedText =
            permitted.length > 0 ? permitted.join(", ") : "none";
          return res.status(400).json({
            error: `Cannot change reservation status from "${currentRow.status}" to "${requestedStatus}". Permitted next status: ${permittedText}.`,
          });
        }

        const updateResult = await client.query(
          `UPDATE reservations
              SET status = $1, updated_at = now()
            WHERE id = $2
        RETURNING id, status, updated_at`,
          [requestedStatus, id]
        );

        await client.query("COMMIT");

        return res.json({
          id: updateResult.rows[0].id,
          status: updateResult.rows[0].status,
          updatedAt: updateResult.rows[0].updated_at,
        });
      } catch (err) {
        if (client) {
          try {
            await client.query("ROLLBACK");
          } catch {
            // Rollback failure does not change the original error outcome.
          }
        }

        if (
          err.code === "23505" &&
          err.constraint === "idx_reservations_unique_active"
        ) {
          return res.status(409).json({
            error:
              "An active reservation already exists for this guest, tour, and travel date.",
          });
        }

        console.error(
          "PATCH /api/admin/reservations/:id/status error:",
          err.message
        );
        return res
          .status(500)
          .json({ error: "Failed to update reservation status" });
      } finally {
        if (client) {
          client.release();
        }
      }
    } catch (err) {
      console.error(
        "PATCH /api/admin/reservations/:id/status error:",
        err.message
      );
      return res
        .status(500)
        .json({ error: "Failed to update reservation status" });
    }
  }
);

export default router;
