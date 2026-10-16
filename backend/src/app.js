import express from "express";
import toursRouter from "./routes/tours.js";
import destinationsRouter from "./routes/destinations.js";
import categoriesRouter from "./routes/categories.js";
import reservationsRouter from "./routes/reservations.js";
import paymentsRouter from "./routes/payments.js";
import adminRouter from "./routes/admin.js";

const app = express();

// Trust only the immediate reverse proxy (narrow trust for hosted platforms
// that terminate TLS in front of this process). Do not blindly trust all
// forwarded headers.
app.set("trust proxy", 1);

// CORS: allow only the configured frontend origin with credentials.
// Fail-closed: when FRONTEND_ORIGIN is unset or the request Origin does not
// match, no Access-Control-Allow-Origin header is sent and browsers block
// the response. Preflight (OPTIONS) is handled here so route handlers never
// see unsupported methods.
const allowedOrigin = process.env.FRONTEND_ORIGIN;

app.use((req, res, next) => {
  const origin = req.get("Origin");

  if (origin && allowedOrigin && origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(204).end();
  }

  next();
});

app.use(express.json());
app.use("/api/tours", toursRouter);
app.use("/api/destinations", destinationsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
