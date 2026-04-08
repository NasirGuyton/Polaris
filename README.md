# Polaris

A college-fit survey that helps students and parents find the right school. Built with React and Express + PostgreSQL.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
cp .env.example .env        # edit with your DB credentials and admin key
npm install
npm run migrate
npm run seed
npm run dev                  # starts on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # starts on http://localhost:3000
```

The frontend proxies `/api` requests to the backend automatically during development.

---

## Accessing Collected Data

All admin endpoints require an API key. Set `ADMIN_API_KEY` in your backend `.env`, then pass it as a header or query parameter:

```
Header:  x-api-key: your-secret-key
  — or —
Query:   ?key=your-secret-key
```

### Export to Spreadsheet (CSV)

The fastest way to get all responses into Excel or Google Sheets:

```
GET http://localhost:3001/api/surveys/1/export?key=your-secret-key
```

Open that URL in your browser — it downloads a CSV file where each row is one respondent and each column is a survey question. The file includes:

| Column | Description |
|--------|-------------|
| Response ID | Unique identifier for each submission |
| User Type | `student`, `parent`, or `both` |
| Started At | When the user clicked "Start" |
| Completed At | When the user submitted their answers |
| *(remaining columns)* | One column per survey question, in order |

You can open the CSV directly in Excel, Google Sheets, or Numbers.

### View Survey Stats

Get a quick count of how many people started, completed, or abandoned the survey:

```
GET http://localhost:3001/api/surveys/1/stats
```

```bash
curl -H "x-api-key: your-secret-key" http://localhost:3001/api/surveys/1/stats
```

Returns:

```json
{
  "total_started": "12",
  "total_completed": "8",
  "total_incomplete": "4"
}
```

### View a Single Response

Look up one respondent's full answers by their response ID:

```
GET http://localhost:3001/api/responses/3
```

```bash
curl -H "x-api-key: your-secret-key" http://localhost:3001/api/responses/3
```

Returns the response metadata and all their answers:

```json
{
  "response": {
    "id": 3,
    "survey_id": 1,
    "user_type": "student",
    "started_at": "2026-04-06T...",
    "completed_at": "2026-04-06T..."
  },
  "answers": [
    { "frontend_id": "role", "value": "I am a student", "created_at": "..." },
    { "frontend_id": "student_name", "value": "Jane", "created_at": "..." }
  ]
}
```

### Query the Database Directly

If you need more flexibility, connect to PostgreSQL and query the tables directly:

```bash
psql -d polaris
```

```sql
-- All completed responses
SELECT id, user_type, started_at, completed_at
FROM survey_app.responses
WHERE completed_at IS NOT NULL
ORDER BY completed_at DESC;

-- All answers for a specific response
SELECT frontend_id, value
FROM survey_app.answers
WHERE response_id = 3;

-- Every answer pivoted by question (one row per respondent)
SELECT
  r.id,
  r.user_type,
  r.completed_at,
  MAX(CASE WHEN a.frontend_id = 'student_name' THEN a.value END) AS student_name,
  MAX(CASE WHEN a.frontend_id = 'gpa' THEN a.value END) AS gpa,
  MAX(CASE WHEN a.frontend_id = 'intended_major' THEN a.value END) AS intended_major
FROM survey_app.responses r
JOIN survey_app.answers a ON a.response_id = r.id
WHERE r.completed_at IS NOT NULL
GROUP BY r.id
ORDER BY r.completed_at DESC;
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_PORT` | Yes | PostgreSQL port (default `5432`) |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `PORT` | No | Server port (default `3001`) |
| `CORS_ORIGIN` | No | Allowed frontend origin (default `http://localhost:3000`) |
| `DEFAULT_SURVEY_ID` | No | Active survey ID (default `1`) |
| `ADMIN_API_KEY` | Yes | Secret key for admin API endpoints |
| `DB_POOL_MAX` | No | Max DB connections (default `10`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | No | Backend URL for production. Leave empty when using the dev proxy or a same-origin reverse proxy. |
