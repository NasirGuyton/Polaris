const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

const DEFAULT_SURVEY_ID = parseInt(process.env.DEFAULT_SURVEY_ID) || 1;

router.get("/active", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, mode, welcome_message, thank_you_message FROM survey_app.surveys WHERE id = $1 AND is_active = true`,
      [DEFAULT_SURVEY_ID]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "No active survey found." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch survey." });
  }
});

router.get("/:id/stats", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*) AS total_started,
         COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS total_completed,
         COUNT(*) FILTER (WHERE completed_at IS NULL) AS total_incomplete
       FROM survey_app.responses WHERE survey_id = $1`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

module.exports = router;