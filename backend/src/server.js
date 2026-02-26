require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ipExtractor = require("./middleware/ipExtractor");
const { generalLimiter } = require("./middleware/rateLimiter");
const surveysRouter = require("./routes/surveys");
const responsesRouter = require("./routes/responses");

const app = express();
const PORT = process.env.PORT || 3001;

app.set("trust proxy", 1);
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json());
app.use(ipExtractor);
app.use(generalLimiter);

app.use("/api/surveys", surveysRouter);
app.use("/api/responses", responsesRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use((req, res) => res.status(404).json({ error: "Route not found." }));
app.use((err, req, res, next) => res.status(500).json({ error: "Internal server error." }));

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});