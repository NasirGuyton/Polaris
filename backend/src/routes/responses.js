const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { normalizeUserType } = require("../config/userTypeMap");
const { submissionLimiter } = require("../middleware/rateLimiter");

const DEFAULT_SURVEY_ID = parseInt(process.env.DEFAULT_SURVEY_ID) || 1;

router.post("/start", submissionLimiter, async (req, res) => {
  const surveyId = req.body.survey_id || DEFAULT_SURVEY_ID;
  const ipAddress = req.clientIp || null;
  try {
    const result = await pool.query(
      `INSERT INTO survey_app.responses (survey_id, ip_address) VALUES ($1, $2) RETURNING id, started_at`,
      [surveyId, ipAddress]
    );
    res.status(201).json({ response_id: result.rows[0].id, started_at: result.rows[0].started_at });
  } catch (err) {
    console.error("Error starting response:", err);
    res.status(500).json({ error: "Failed to start survey." });
  }
});

router.post("/:responseId/submit", submissionLimiter, async (req, res) => {
  const { responseId } = req.params;
  const { formData, survey_id } = req.body;
  const surveyId = survey_id || DEFAULT_SURVEY_ID;

  if (!formData || typeof formData !== "object") {
    return res.status(400).json({ error: "formData is required." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const responseCheck = await client.query(
      `SELECT id FROM survey_app.responses WHERE id = $1 AND survey_id = $2`,
      [responseId, surveyId]
    );
    if (responseCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Response not found." });
    }

    const questionsResult = await client.query(
      `SELECT id, frontend_id, is_required FROM survey_app.questions WHERE survey_id = $1`,
      [surveyId]
    );
    const questionMap = {};
    for (const q of questionsResult.rows) {
      questionMap[q.frontend_id] = { id: q.id, is_required: q.is_required };
    }

    const userType = normalizeUserType(formData.role);

    for (const [frontendId, value] of Object.entries(formData)) {
      const question = questionMap[frontendId];
      if (!question) continue;
      const serialized = Array.isArray(value) ? JSON.stringify(value) : String(value ?? "");
      await client.query(
        `INSERT INTO survey_app.answers (response_id, question_id, frontend_id, value) VALUES ($1, $2, $3, $4)`,
        [responseId, question.id, frontendId, serialized]
      );
    }

    await client.query(
      `UPDATE survey_app.responses SET completed_at = CURRENT_TIMESTAMP, user_type = $1 WHERE id = $2`,
      [userType, responseId]
    );

    await client.query("COMMIT");
    res.status(200).json({ message: "Survey submitted successfully.", response_id: parseInt(responseId), user_type: userType });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error submitting:", err);
    res.status(500).json({ error: "Failed to submit survey." });
  } finally {
    client.release();
  }
});

router.get("/:responseId", async (req, res) => {
  const { responseId } = req.params;
  try {
    const response = await pool.query(`SELECT * FROM survey_app.responses WHERE id = $1`, [responseId]);
    if (response.rows.length === 0) return res.status(404).json({ error: "Not found." });
    const answers = await pool.query(`SELECT frontend_id, value, created_at FROM survey_app.answers WHERE response_id = $1`, [responseId]);
    res.json({ response: response.rows[0], answers: answers.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch response." });
  }
});

module.exports = router;