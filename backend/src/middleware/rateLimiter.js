const rateLimit = require("express-rate-limit");

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res.status(429).json({ error: "Too many submissions. Please try again later." });
  },
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
});

module.exports = { submissionLimiter, generalLimiter };