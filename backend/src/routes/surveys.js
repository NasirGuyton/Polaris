const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const adminAuth = require("../middleware/adminAuth");

const DEFAULT_SURVEY_ID = parseInt(process.env.DEFAULT_SURVEY_ID) || 1;

router.get("/active", async (req, res) => {
  try {
    const surveyResult = await pool.query(
      `SELECT id, name, description, mode, welcome_message, thank_you_message
       FROM survey_app.surveys WHERE id = $1 AND is_active = true`,
      [DEFAULT_SURVEY_ID]
    );
    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: "No active survey found." });
    }
    const survey = surveyResult.rows[0];

    const questionsResult = await pool.query(
      `SELECT id, frontend_id, text, type, frontend_type, label, helper,
              placeholder, accept, max_size_mb, is_required, max_selections, "order"
       FROM survey_app.questions
       WHERE survey_id = $1
       ORDER BY "order"`,
      [survey.id]
    );

    const questionIds = questionsResult.rows.map((q) => q.id);
    const optionsMap = {};

    if (questionIds.length > 0) {
      const optionsResult = await pool.query(
        `SELECT question_id, value, "order"
         FROM survey_app.options
         WHERE question_id = ANY($1)
         ORDER BY "order"`,
        [questionIds]
      );
      for (const opt of optionsResult.rows) {
        if (!optionsMap[opt.question_id]) optionsMap[opt.question_id] = [];
        optionsMap[opt.question_id].push({ value: opt.value, order: opt.order });
      }
    }

    survey.questions = questionsResult.rows.map(({ id, ...rest }) => ({
      ...rest,
      options: optionsMap[id] || [],
    }));

    res.json(survey);
  } catch (err) {
    console.error("Error fetching active survey:", err);
    res.status(500).json({ error: "Failed to fetch survey." });
  }
});

router.get("/:id/export", adminAuth, async (req, res) => {
  try {
    const surveyId = req.params.id;

    const questions = await pool.query(
      `SELECT frontend_id, label, text, "order"
       FROM survey_app.questions
       WHERE survey_id = $1
       ORDER BY "order"`,
      [surveyId]
    );

    if (questions.rows.length === 0) {
      return res.status(404).json({ error: "Survey not found." });
    }

    const responses = await pool.query(
      `SELECT id, user_type, started_at, completed_at
       FROM survey_app.responses
       WHERE survey_id = $1 AND completed_at IS NOT NULL
       ORDER BY completed_at`,
      [surveyId]
    );

    if (responses.rows.length === 0) {
      return res.status(404).json({ error: "No completed responses yet." });
    }

    const responseIds = responses.rows.map((r) => r.id);
    const answers = await pool.query(
      `SELECT response_id, frontend_id, value
       FROM survey_app.answers
       WHERE response_id = ANY($1)`,
      [responseIds]
    );

    const answerMap = {};
    for (const a of answers.rows) {
      if (!answerMap[a.response_id]) answerMap[a.response_id] = {};
      answerMap[a.response_id][a.frontend_id] = a.value;
    }

    const cols = questions.rows.map((q) => q.frontend_id);
    const headers = [
      "Response ID",
      "User Type",
      "Started At",
      "Completed At",
      ...questions.rows.map((q) => q.label || q.text),
    ];

    const escapeCSV = (val) => {
      if (val == null) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = [headers.map(escapeCSV).join(",")];

    for (const r of responses.rows) {
      const data = answerMap[r.id] || {};
      const row = [
        r.id,
        r.user_type || "",
        r.started_at ? new Date(r.started_at).toLocaleString() : "",
        r.completed_at ? new Date(r.completed_at).toLocaleString() : "",
        ...cols.map((fid) => data[fid] || ""),
      ];
      rows.push(row.map(escapeCSV).join(","));
    }

    const csv = rows.join("\r\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="survey-${surveyId}-responses.csv"`);
    res.send(csv);
  } catch (err) {
    console.error("Error exporting survey:", err);
    res.status(500).json({ error: "Failed to export responses." });
  }
});

router.get("/:id/stats", adminAuth, async (req, res) => {
  try {
    const totalsResult = await pool.query(
      `SELECT
         COUNT(*) AS total_started,
         COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS total_completed,
         COUNT(*) FILTER (WHERE completed_at IS NULL) AS total_incomplete
       FROM survey_app.responses WHERE survey_id = $1`,
      [req.params.id]
    );

    const dropOffResult = await pool.query(
      `SELECT
         COALESCE(last_question_frontend_id, '__unknown__') AS question_id,
         COUNT(*)::INTEGER AS drop_off_count
       FROM survey_app.responses
       WHERE survey_id = $1 AND completed_at IS NULL
       GROUP BY COALESCE(last_question_frontend_id, '__unknown__')
       ORDER BY drop_off_count DESC, question_id ASC`,
      [req.params.id]
    );

    res.json({
      ...totalsResult.rows[0],
      drop_off_by_question: dropOffResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

module.exports = router;
