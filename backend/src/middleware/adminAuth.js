function adminAuth(req, res, next) {
  const apiKey = process.env.ADMIN_API_KEY;

  if (!apiKey) {
    return res.status(503).json({ error: "Admin access is not configured." });
  }

  const provided = req.headers["x-api-key"] || req.query.key;

  if (!provided || provided !== apiKey) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  next();
}

module.exports = adminAuth;
