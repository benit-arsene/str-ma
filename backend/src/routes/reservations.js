import express from "express";
import { pool } from "../db.js";

const router = express.Router();

function generateBookingReference() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "HP-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function validateReservationInput(body) {
  const errors = [];

  if (!body.tourId || typeof body.tourId !== "string") {
    errors.push({ field: "tourId", message: "Tour ID is required" });
  }

  if (!body.travelDate || typeof body.travelDate !== "string") {
    errors.push({ field: "travelDate", message: "Travel date is required" });
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.travelDate)) {
      errors.push({ field: "travelDate", message: "Travel date must be in YYYY-MM-DD format" });
    } else {
      const travelDate = new Date(body.travelDate + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (travelDate < today) {
        errors.push({ field: "travelDate", message: "Travel date cannot be in the past" });
      }
    }
  }

  const travelers = Number(body.travelers);
  if (!body.travelers || Number.isNaN(travelers)) {
    errors.push({ field: "travelers", message: "Number of travelers is required" });
  } else if (!Number.isInteger(travelers) || travelers < 1 || travelers > 20) {
    errors.push({ field: "travelers", message: "Travelers must be an integer between 1 and 20" });
  }

  if (!body.fullName || typeof body.fullName !== "string" || !body.fullName.trim()) {
    errors.push({ field: "fullName", message: "Full name is required" });
  }

  if (!body.email || typeof body.email !== "string" || !body.email.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  if (!body.phone || typeof body.phone !== "string" || !body.phone.trim()) {
    errors.push({ field: "phone", message: "Phone number is required" });
  }

  return errors;
}

router.post("/", async (req, res) => {
  try {
    const validationErrors = validateReservationInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: validationErrors });
    }

    const {
      tourId,
      travelDate,
      travelers,
      fullName,
      email,
      phone,
      specialRequests,
    } = req.body;

    const tourResult = await pool.query(
      `SELECT id FROM tours WHERE id = $1`,
      [tourId]
    );
    if (tourResult.rows.length === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }

    let bookingReference;
    let insertResult;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      bookingReference = generateBookingReference();
      try {
        insertResult = await pool.query(
          `INSERT INTO reservations (
              tour_id, travel_date, travelers, full_name, email, phone, special_requests, status, booking_reference
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, booking_reference, status, created_at`,
          [
            tourId,
            travelDate,
            travelers,
            fullName.trim(),
            email.trim().toLowerCase(),
            phone.trim(),
            specialRequests?.trim() || null,
            "pending",
            bookingReference,
          ]
        );
        break;
      } catch (err) {
        if (err.code === "23505") {
          if (err.constraint === "reservations_booking_reference_key" ||
              err.constraint === "idx_reservations_unique_active") {
            attempts++;
            continue;
          }
        }
        throw err;
      }
    }

    if (!insertResult) {
      return res.status(500).json({ error: "Failed to generate unique booking reference" });
    }

    const reservation = insertResult.rows[0];
    return res.status(201).json({
      id: reservation.id,
      bookingReference: reservation.booking_reference,
      status: reservation.status,
      createdAt: reservation.created_at,
    });
  } catch (err) {
    console.error("POST /api/reservations error:", err.message);
    if (err.code === "23505") {
      if (err.constraint === "idx_reservations_unique_active") {
        return res.status(409).json({ error: "An active reservation already exists for this tour, date, and email" });
      }
      if (err.constraint === "reservations_booking_reference_key") {
        return res.status(500).json({ error: "Failed to generate unique booking reference" });
      }
      if (err.constraint === "reservations_email_check") {
        return res.status(400).json({ error: "Validation failed", details: [{ field: "email", message: "Invalid email format" }] });
      }
      if (err.constraint === "reservations_travelers_check") {
        return res.status(400).json({ error: "Validation failed", details: [{ field: "travelers", message: "Travelers must be between 1 and 20" }] });
      }
      if (err.constraint === "reservations_status_check") {
        return res.status(500).json({ error: "Invalid reservation status" });
      }
    }
    if (err.code === "23503") {
      return res.status(404).json({ error: "Tour not found" });
    }
    return res.status(500).json({ error: "Failed to create reservation" });
  }
});

export default router;