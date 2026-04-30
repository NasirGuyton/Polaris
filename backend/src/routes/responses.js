const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const pool = require("../db/pool");
const { normalizeUserType } = require("../config/userTypeMap");
const { submissionLimiter } = require("../middleware/rateLimiter");
const adminAuth = require("../middleware/adminAuth");

const DEFAULT_SURVEY_ID = parseInt(process.env.DEFAULT_SURVEY_ID) || 1;
const MAX_VALUE_LENGTH = 5000;
const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const ALLOWED_UPLOAD_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".xls", ".xlsx"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
});

function serializeAnswerValue(value) {
  if (Array.isArray(value) || (value && typeof value === "object")) {
    return JSON.stringify(value);
  }
  return String(value ?? "");
}

router.post("/start", submissionLimiter, async (req, res) => {
  const surveyId = req.body.survey_id || DEFAULT_SURVEY_ID;
  const ipAddress = req.clientIp || null;
  try {
    const result = await pool.query(
      `INSERT INTO survey_app.responses (survey_id, ip_address)
       VALUES ($1, $2)
       RETURNING id, started_at`,
      [surveyId, ipAddress]
    );
    res.status(201).json({ response_id: result.rows[0].id, started_at: result.rows[0].started_at });
  } catch (err) {
    console.error("Error starting response:", err);
    res.status(500).json({ error: "Failed to start survey." });
  }
});

router.post("/:responseId/progress", async (req, res) => {
  const { responseId } = req.params;
  const {
    survey_id,
    current_question_frontend_id: currentQuestionFrontendId,
    current_question_order: currentQuestionOrder,
    event,
  } = req.body;
  const surveyId = survey_id || DEFAULT_SURVEY_ID;
  const isAbandonEvent = event === "abandon";

  if (
    currentQuestionOrder !== undefined &&
    (!Number.isInteger(currentQuestionOrder) || currentQuestionOrder < 1 || currentQuestionOrder > 1000)
  ) {
    return res.status(400).json({ error: "current_question_order must be a positive integer." });
  }

  if (
    currentQuestionFrontendId !== undefined &&
    (typeof currentQuestionFrontendId !== "string" || currentQuestionFrontendId.length > 100)
  ) {
    return res.status(400).json({ error: "current_question_frontend_id must be a string up to 100 chars." });
  }

  try {
    const result = await pool.query(
      `UPDATE survey_app.responses
       SET
         last_activity_at = CURRENT_TIMESTAMP,
         last_question_frontend_id = COALESCE($1, last_question_frontend_id),
         last_question_order = COALESCE($2, last_question_order),
         abandoned_at = CASE WHEN $3 THEN CURRENT_TIMESTAMP ELSE abandoned_at END
       WHERE id = $4 AND survey_id = $5 AND completed_at IS NULL
       RETURNING id, last_activity_at, last_question_frontend_id, last_question_order, abandoned_at`,
      [currentQuestionFrontendId || null, currentQuestionOrder || null, isAbandonEvent, responseId, surveyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Active response not found." });
    }

    return res.status(200).json({ message: "Progress saved.", response: result.rows[0] });
  } catch (err) {
    console.error("Error saving progress:", err);
    return res.status(500).json({ error: "Failed to save progress." });
  }
});

router.post("/:responseId/files", submissionLimiter, upload.single("file"), async (req, res) => {
  const { responseId } = req.params;
  const surveyId = parseInt(req.body.survey_id) || DEFAULT_SURVEY_ID;
  const questionFrontendId = req.body.question_frontend_id;
  const file = req.file;

  if (!questionFrontendId || typeof questionFrontendId !== "string" || questionFrontendId.length > 100) {
    return res.status(400).json({ error: "question_frontend_id is required." });
  }

  if (!file) {
    return res.status(400).json({ error: "File is required." });
  }

  const extension = path.extname(file.originalname || "").toLowerCase();
  const hasAllowedMime = ALLOWED_UPLOAD_MIME_TYPES.has(file.mimetype);
  const hasAllowedExtension = ALLOWED_UPLOAD_EXTENSIONS.has(extension);
  if (!hasAllowedMime && !hasAllowedExtension) {
    return res.status(400).json({ error: "Unsupported file type. Allowed: PDF, DOC, DOCX, XLS, XLSX." });
  }

  if (file.size <= 0) {
    return res.status(400).json({ error: "Uploaded file is empty." });
  }

  try {
    const responseCheck = await pool.query(
      `SELECT id FROM survey_app.responses
       WHERE id = $1 AND survey_id = $2 AND completed_at IS NULL`,
      [responseId, surveyId]
    );
    if (responseCheck.rows.length === 0) {
      return res.status(404).json({ error: "Active response not found." });
    }

    const result = await pool.query(
      `INSERT INTO survey_app.response_files
         (response_id, question_frontend_id, original_filename, mime_type, file_size_bytes, file_data)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (response_id, question_frontend_id)
       DO UPDATE SET
         original_filename = EXCLUDED.original_filename,
         mime_type = EXCLUDED.mime_type,
         file_size_bytes = EXCLUDED.file_size_bytes,
         file_data = EXCLUDED.file_data,
         uploaded_at = CURRENT_TIMESTAMP
       RETURNING id, question_frontend_id, original_filename, mime_type, file_size_bytes, uploaded_at`,
      [responseId, questionFrontendId, file.originalname, file.mimetype, file.size, file.buffer]
    );

    return res.status(201).json({ message: "File uploaded.", file: result.rows[0] });
  } catch (err) {
    console.error("Error uploading file:", err);
    return res.status(500).json({ error: "Failed to upload file." });
  }
});

router.post("/:responseId/submit", submissionLimiter, async (req, res) => {
  const { responseId } = req.params;
  const { formData, survey_id } = req.body;
  const surveyId = survey_id || DEFAULT_SURVEY_ID;

  if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
    return res.status(400).json({ error: "formData must be a non-null object." });
  }

  if (Object.keys(formData).length > 100) {
    return res.status(400).json({ error: "Too many fields in formData." });
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

    const missing = [];
    for (const [fid, q] of Object.entries(questionMap)) {
      if (!q.is_required) continue;
      const val = formData[fid];
      if (val === undefined || val === null) {
        missing.push(fid);
      } else if (typeof val === "string" && val.trim() === "") {
        missing.push(fid);
      } else if (Array.isArray(val) && val.length === 0) {
        missing.push(fid);
      }
    }
    if (missing.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Missing required fields.", fields: missing });
    }

    for (const [key, value] of Object.entries(formData)) {
      const serialized = serializeAnswerValue(value);
      if (serialized.length > MAX_VALUE_LENGTH) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Value for "${key}" exceeds maximum length.` });
      }
    }

    const userType = normalizeUserType(formData.role);

    for (const [frontendId, value] of Object.entries(formData)) {
      const question = questionMap[frontendId];
      if (!question) continue;
      const serialized = serializeAnswerValue(value);
      await client.query(
        `INSERT INTO survey_app.answers (response_id, question_id, frontend_id, value) VALUES ($1, $2, $3, $4)`,
        [responseId, question.id, frontendId, serialized]
      );
    }

    await client.query(
      `UPDATE survey_app.responses
       SET
         completed_at = CURRENT_TIMESTAMP,
         last_activity_at = CURRENT_TIMESTAMP,
         abandoned_at = NULL,
         user_type = $1
       WHERE id = $2`,
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

router.get("/:responseId", adminAuth, async (req, res) => {
  const { responseId } = req.params;
  try {
    const response = await pool.query(
      `SELECT id, survey_id, user_type, started_at, completed_at FROM survey_app.responses WHERE id = $1`,
      [responseId]
    );
    if (response.rows.length === 0) return res.status(404).json({ error: "Not found." });
    const answers = await pool.query(
      `SELECT frontend_id, value, created_at FROM survey_app.answers WHERE response_id = $1`,
      [responseId]
    );
    const files = await pool.query(
      `SELECT id, question_frontend_id, original_filename, mime_type, file_size_bytes, uploaded_at
       FROM survey_app.response_files
       WHERE response_id = $1
       ORDER BY uploaded_at`,
      [responseId]
    );
    res.json({ response: response.rows[0], answers: answers.rows, files: files.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch response." });
  }
});

module.exports = router;
