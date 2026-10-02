require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// CLIENT_URL can hold one or more comma-separated URLs (your Vercel domain)
const extra = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", ...extra],
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => res.send("FinFlow API is running"));
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/budgets", require("./routes/budgetRoutes"));
app.use("/api/goals", require("./routes/goalRoutes"));
app.use("/api/recurring", require("./routes/recurringRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB().then(() =>
  app.listen(port, () => console.log(`API on port ${port}`)),
);
