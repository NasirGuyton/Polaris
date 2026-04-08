require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const ipExtractor = require("./middleware/ipExtractor");
const { generalLimiter } = require("./middleware/rateLimiter");
const surveysRouter = require("./routes/surveys");
const responsesRouter = require("./routes/responses");
const pool = require("./db/pool");

const app = express();
const PORT = process.env.PORT || 3001;

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));
app.use(ipExtractor);
app.use(generalLimiter);

app.use("/api/surveys", surveysRouter);
app.use("/api/responses", responsesRouter);

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unhealthy", error: "Database unreachable." });
  }
});

const path = require("path");
const frontendBuild = path.join(__dirname, "../../frontend/build");

app.use(express.static(frontendBuild));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(frontendBuild, "index.html"), (err) => {
    if (err) next();
  });
});

app.use((req, res) => res.status(404).json({ error: "Route not found." }));
app.use((err, req, res, next) => res.status(500).json({ error: "Internal server error." }));

const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

function shutdown() {
  console.log("Shutting down gracefully...");
  server.close(() => {
    pool.end().then(() => {
      console.log("Connections drained. Exiting.");
      process.exit(0);
    });
  });
  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
