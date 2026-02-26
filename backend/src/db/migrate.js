const pool = require("./pool");

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Running migrations...");
    await client.query("BEGIN");

    await client.query(`CREATE SCHEMA IF NOT EXISTS survey_app;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS survey_app.users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS survey_app.surveys (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        mode VARCHAR(50) DEFAULT 'both' CHECK (mode IN ('parent','student','both')),
        welcome_message TEXT,
        thank_you_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES survey_app.users(id) ON DELETE SET NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS survey_app.questions (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER NOT NULL REFERENCES survey_app.surveys(id) ON DELETE CASCADE,
        frontend_id VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_required BOOLEAN DEFAULT FALSE,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS survey_app.options (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES survey_app.questions(id) ON DELETE CASCADE,
        value TEXT NOT NULL,
        "order" INTEGER NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS survey_app.conditions (
        id SERIAL PRIMARY KEY,
        source_question_id INTEGER NOT NULL REFERENCES survey_app.questions(id) ON DELETE CASCADE,
        target_question_id INTEGER NOT NULL REFERENCES survey_app.questions(id) ON DELETE CASCADE,
        condition_type VARCHAR(50) NOT NULL,
        value TEXT NOT NULL,
        action VARCHAR(50) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS survey_app.responses (
        id SERIAL PRIMARY KEY,
        survey_id INTEGER NOT NULL REFERENCES survey_app.surveys(id) ON DELETE CASCADE,
        user_type VARCHAR(50) CHECK (user_type IN ('parent','student','both')),
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        ip_address INET,
        is_spam BOOLEAN DEFAULT FALSE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS survey_app.answers (
        id SERIAL PRIMARY KEY,
        response_id INTEGER NOT NULL REFERENCES survey_app.responses(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES survey_app.questions(id) ON DELETE CASCADE,
        frontend_id VARCHAR(100) NOT NULL,
        value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS survey_app.audit_logs (
        id SERIAL PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INTEGER NOT NULL,
        action VARCHAR(50) NOT NULL,
        user_id INTEGER REFERENCES survey_app.users(id) ON DELETE SET NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        details JSONB
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_survey_id ON survey_app.questions(survey_id);
      CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON survey_app.responses(survey_id);
      CREATE INDEX IF NOT EXISTS idx_answers_response_id ON survey_app.answers(response_id);
    `);

    await client.query("COMMIT");
    console.log("✅ Migration complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();