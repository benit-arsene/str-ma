import express from "express";
import toursRouter from "./routes/tours.js";

const app = express();

app.use(express.json());
app.use("/api/tours", toursRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
