import express from "express";
import { randomBytes, randomUUID } from "node:crypto";
import { env } from "node:process";
import { pool } from "../db.js";

const router = express.Router();

const SIMULATED_PROVIDER = "simulated";

// Payment simulation is a DEMO-ONLY capability. It is disabled unless explicitly
// enabled via the PAYMENT_SIMULATION_ENABLED environment variable. When enabled,
// callers may drive simulated outcomes (success/failure/cancellation), but this
// NEVER proves that money was received and must NOT be used as a real payment
// provider. See backend/.env.example.
const PAYMENT_SIMULATION_ENABLED = env.PAYMENT_SIMULATION_ENABLED === "true";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TRANSACTION_REFERENCE_REGEX = /^HP-PAY-[0-9a-f]{8,64}$/i;

// Terminal statuses can never be overwritten by a subsequent request.
const TERMINAL_STATUSES = new Set(["succeeded", "failed", "cancelled"]);
// Only non-terminal statuses may have an outcome simulated against them.
const PROCESSABLE_STATUSES = new Set(["initiated", "processing"]);

// Defined valid payment state transitions. Enforcement happens via conditional
// UPDATEs (WHERE status IN (...)) plus affected-row checks below.
const PAYMENT_TRANSITIONS = {
  initiated: ["processing", "succeeded", "failed", "cancelled"],
  processing: ["succeeded", "failed", "cancelled"],
};

function canTransition(from, to) {
  return PAYMENT_TRANSITIONS[from]?.includes(to) === true;
}

function generateTransactionReference() {
  // 128 bits of cryptographic randomness behind the HP-PAY- prefix.
  return `HP-PAY-${randomBytes(16).toString("hex")}`;
}

// A unique per-transaction token. It is NOT relied upon for retry safety:
// idempotency is provided by the reservation-scoped active/succeeded checks.
function generateIdempotencyKey() {
  return randomUUID();
}

function validateInitiatePaymentBody(body) {
  const errors = [];
  if (!body || typeof body.reservationId !== "string" || !body.reservationId.trim()) {
    errors.push({ field: "reservationId", message: "Reservation ID is required" });
  } else if (!UUID_REGEX.test(body.reservationId.trim())) {
    errors.push({ field: "reservationId", message: "Reservation ID must be a valid UUID" });
  }
  return errors;
}

function validateSimulateOutcomeBody(body) {
  const errors = [];
  if (!body || typeof body.transactionReference !== "string" || !body.transactionReference.trim()) {
    errors.push({ field: "transactionReference", message: "Transaction reference is required" });
  } else if (!TRANSACTION_REFERENCE_REGEX.test(body.transactionReference.trim())) {
    errors.push({ field: "transactionReference", message: "Invalid transaction reference format" });
  }
  const outcome = body?.outcome;
  if (!outcome || !["success", "failure", "cancellation"].includes(outcome)) {
    errors.push({ field: "outcome", message: "Outcome must be one of: success, failure, cancellation" });
  }
  return errors;
}

router.post("/initiate", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const validationErrors = validateInitiatePaymentBody(req.body);
    if (validationErrors.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Validation failed", details: validationErrors });
    }

    const reservationId = req.body.reservationId.trim();

    const reservationResult = await client.query(
      `SELECT id, status, price_per_person, currency, travelers
       FROM reservations
       WHERE id = $1
       FOR UPDATE`,
      [reservationId]
    );

    if (reservationResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Reservation not found" });
    }

    const reservation = reservationResult.rows[0];

    if (reservation.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: `Cannot initiate payment for reservation with status: ${reservation.status}`,
      });
    }

    // The price snapshot stored on the reservation is authoritative. A NULL
    // snapshot means no price was captured; never fall back to current pricing.
    if (reservation.price_per_person === null || reservation.currency === null) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Reservation is missing price snapshot. Cannot calculate payment amount.",
      });
    }

    // Repeated initiation must reuse an existing successful transaction
    // (idempotent) rather than creating a duplicate.
    const existingSuccessResult = await client.query(
      `SELECT id, transaction_reference, status, amount, currency,
              gateway_fee, merchant_net, created_at
       FROM payment_transactions
       WHERE reservation_id = $1 AND status = 'succeeded'`,
      [reservationId]
    );

    if (existingSuccessResult.rows.length > 0) {
      await client.query("ROLLBACK");
      const existing = existingSuccessResult.rows[0];
      return res.status(200).json({
        message: "Reservation already has a successful payment",
        transactionReference: existing.transaction_reference,
        status: existing.status,
        amount: existing.amount,
        currency: existing.currency,
        gatewayFee: existing.gateway_fee,
        merchantNet: existing.merchant_net,
        createdAt: existing.created_at,
      });
    }

    // Reuse an existing active (in-flight) transaction rather than creating a
    // second concurrent attempt for the same reservation.
    const existingActiveResult = await client.query(
      `SELECT id, transaction_reference, status, amount, currency,
              gateway_fee, merchant_net, created_at
       FROM payment_transactions
       WHERE reservation_id = $1 AND status IN ('initiated', 'processing')
       ORDER BY created_at DESC
       LIMIT 1`,
      [reservationId]
    );

    if (existingActiveResult.rows.length > 0) {
      await client.query("ROLLBACK");
      const existing = existingActiveResult.rows[0];
      return res.status(200).json({
        message: "Active payment transaction already exists",
        transactionReference: existing.transaction_reference,
        status: existing.status,
        amount: existing.amount,
        currency: existing.currency,
        gatewayFee: existing.gateway_fee,
        merchantNet: existing.merchant_net,
        createdAt: existing.created_at,
      });
    }

    // All monetary values are computed with PostgreSQL numeric arithmetic so the
    // database (with its gateway_fee/merchant_net check constraints) is the
    // authoritative source. JavaScript never performs the money math.
    const idempotencyKey = generateIdempotencyKey();
    const transactionReference = generateTransactionReference();

    let insertResult;
    try {
      insertResult = await client.query(
        `INSERT INTO payment_transactions (
            reservation_id, amount, currency, gateway_fee, merchant_net,
            status, provider, idempotency_key, transaction_reference
          ) VALUES (
            $1,
            $2::numeric * $3::numeric,
            $4,
            ROUND(($2::numeric * $3::numeric) * 0.03, 2),
            ($2::numeric * $3::numeric) - ROUND(($2::numeric * $3::numeric) * 0.03, 2),
            'initiated',
            $5,
            $6,
            $7
          )
          RETURNING id, transaction_reference, status,
                    amount, gateway_fee, merchant_net, created_at`,
        [
          reservationId,
          reservation.price_per_person,
          reservation.travelers,
          reservation.currency,
          SIMULATED_PROVIDER,
          idempotencyKey,
          transactionReference,
        ]
      );
    } catch (err) {
      if (err.code === "23505") {
        if (
          err.constraint === "payment_transactions_idempotency_key_key" ||
          err.constraint === "payment_transactions_transaction_reference_key"
        ) {
          await client.query("ROLLBACK");
          return res.status(409).json({
            error: "Transaction reference or idempotency key collision",
          });
        }
      }
      throw err;
    }

    await client.query("COMMIT");

    const payment = insertResult.rows[0];
    return res.status(201).json({
      transactionReference: payment.transaction_reference,
      status: payment.status,
      amount: payment.amount,
      currency: reservation.currency,
      gatewayFee: payment.gateway_fee,
      merchantNet: payment.merchant_net,
      createdAt: payment.created_at,
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("POST /api/payments/initiate error:", err.message);
    return res.status(500).json({ error: "Failed to initiate payment" });
  } finally {
    client.release();
  }
});

router.post(
  "/simulate",
  async (req, res) => {
    if (!PAYMENT_SIMULATION_ENABLED) {
      return res
        .status(404)
        .json({ error: "Payment simulation is not available in this environment" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const validationErrors = validateSimulateOutcomeBody(req.body);
      if (validationErrors.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Validation failed", details: validationErrors });
      }

      const transactionReference = req.body.transactionReference.trim();
      const outcome = req.body.outcome;

      let newStatus;
      if (outcome === "success") {
        newStatus = "succeeded";
      } else if (outcome === "failure") {
        newStatus = "failed";
      } else {
        newStatus = "cancelled";
      }

      // Lock order: payment row first, then reservation. initiation only locks
      // the reservation, so this ordering introduces no cross-lock cycle and
      // reduces deadlock risk across the two routes.
       const paymentResult = await client.query(
         `SELECT id, reservation_id, status, amount, currency,
                 gateway_fee, merchant_net, transaction_reference
          FROM payment_transactions
          WHERE transaction_reference = $1
          FOR UPDATE`,
         [transactionReference]
       );

      if (paymentResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Payment transaction not found" });
      }

      const payment = paymentResult.rows[0];

      // Terminal transactions must never be overwritten. Repeated success
      // requests return the existing result idempotently (no re-confirmation).
      if (TERMINAL_STATUSES.has(payment.status)) {
        await client.query("ROLLBACK");
        return res.status(200).json({
          message: `Payment already ${payment.status}`,
          transactionReference: payment.transaction_reference,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          gatewayFee: payment.gateway_fee,
          merchantNet: payment.merchant_net,
        });
      }

      if (!PROCESSABLE_STATUSES.has(payment.status)) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Cannot simulate outcome for payment in status: ${payment.status}`,
        });
      }

      if (!canTransition(payment.status, newStatus)) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          error: `Cannot transition payment from ${payment.status} to ${newStatus}`,
        });
      }

      if (outcome === "success") {
        // Confirm the reservation within the same transaction. Lock the
        // reservation AFTER the payment so lock ordering is consistent.
        const reservationResult = await client.query(
          `SELECT id, status FROM reservations WHERE id = $1 FOR UPDATE`,
          [payment.reservation_id]
        );

        if (reservationResult.rows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({ error: "Reservation not found" });
        }

        const reservation = reservationResult.rows[0];

        // A successful payment must never confirm a cancelled, completed, or
        // otherwise ineligible (non-pending) reservation.
        if (reservation.status !== "pending") {
          await client.query("ROLLBACK");
          return res.status(409).json({
            error: `Cannot confirm reservation with status: ${reservation.status}`,
            transactionReference,
            paymentStatus: payment.status,
          });
        }

        const confirmResult = await client.query(
          `UPDATE reservations
           SET status = 'confirmed', updated_at = now()
           WHERE id = $1 AND status = 'pending'
           RETURNING id, status`,
          [payment.reservation_id]
        );

        // If the conditional update affected no rows, another transaction
        // changed the reservation in the meantime: roll back the complete
        // payment operation. Do NOT run a separate failure update that could
        // overwrite a concurrent successful transaction.
        if (confirmResult.rowCount === 0) {
          await client.query("ROLLBACK");
          return res.status(409).json({
            error: "Reservation status changed during payment confirmation",
            transactionReference,
            paymentStatus: payment.status,
          });
        }

        const succeedUpdate = await client.query(
          `UPDATE payment_transactions
           SET status = 'succeeded', updated_at = now()
           WHERE id = $1 AND status IN ('initiated', 'processing')`,
          [payment.id]
        );

        if (succeedUpdate.rowCount === 0) {
          await client.query("ROLLBACK");
          return res.status(409).json({
            error: "Payment status changed during confirmation",
            transactionReference,
            paymentStatus: payment.status,
          });
        }
      } else {
        // Failure or cancellation must leave the reservation pending; it is
        // never confirmed here. The transition is atomic within this tx.
        const outcomeUpdate = await client.query(
          `UPDATE payment_transactions
           SET status = $1, updated_at = now()
           WHERE id = $2 AND status IN ('initiated', 'processing')`,
          [newStatus, payment.id]
        );

        if (outcomeUpdate.rowCount === 0) {
          await client.query("ROLLBACK");
          return res.status(409).json({
            error: "Payment status changed during outcome simulation",
            transactionReference,
          });
        }
      }

      await client.query("COMMIT");

      const finalStatus = outcome === "success" ? "succeeded" : newStatus;
      return res.status(200).json({
        transactionReference: payment.transaction_reference,
        status: finalStatus,
        amount: payment.amount,
        currency: payment.currency,
        gatewayFee: payment.gateway_fee,
        merchantNet: payment.merchant_net,
      });
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("POST /api/payments/simulate error:", err.message);
      if (
        err.code === "23505" &&
        err.constraint === "idx_payment_transactions_one_success_per_reservation"
      ) {
        return res.status(409).json({ error: "Reservation already has a successful payment" });
      }
      return res.status(500).json({ error: "Failed to simulate payment outcome" });
    } finally {
      client.release();
    }
  }
);

router.get("/:transactionReference", async (req, res) => {
  try {
    const { transactionReference } = req.params;

    if (!TRANSACTION_REFERENCE_REGEX.test(transactionReference)) {
      return res.status(400).json({ error: "Invalid transaction reference format" });
    }

    const result = await pool.query(
      `SELECT
         transaction_reference, amount, currency, gateway_fee, merchant_net,
         status, provider, created_at, updated_at
       FROM payment_transactions
       WHERE transaction_reference = $1`,
      [transactionReference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payment transaction not found" });
    }

    const payment = result.rows[0];
    res.set("Cache-Control", "no-store");
    return res.status(200).json({
      transactionReference: payment.transaction_reference,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      gatewayFee: payment.gateway_fee,
      merchantNet: payment.merchant_net,
      provider: payment.provider,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    });
  } catch (err) {
    console.error("GET /api/payments/:transactionReference error:", err.message);
    return res.status(500).json({ error: "Failed to fetch payment transaction" });
  }
});

export default router;
