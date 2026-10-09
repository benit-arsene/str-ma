import express from "express";
import toursRouter from "./routes/tours.js";
import destinationsRouter from "./routes/destinations.js";
import categoriesRouter from "./routes/categories.js";

const app = express();

app.use(express.json());
app.use("/api/tours", toursRouter);
app.use("/api/destinations", destinationsRouter);
app.use("/api/categories", categoriesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
