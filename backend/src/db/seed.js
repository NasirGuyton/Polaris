const pool = require("./pool");

const QUESTIONS = [
  { frontend_id: "role",               text: "Who is filling this out today?",                           type: "multiple_choice_single",   is_required: true,  order: 1 },
  { frontend_id: "student_name",       text: "Student Name",                                             type: "short_text",               is_required: true,  order: 2 },
  { frontend_id: "graduation_year",    text: "Graduation Year",                                          type: "dropdown",                 is_required: true,  order: 3 },
  { frontend_id: "current_school",     text: "Current School",                                           type: "short_text",               is_required: true,  order: 4 },
  { frontend_id: "city_state",         text: "City & State (Optional)",                                  type: "short_text",               is_required: false, order: 5 },
  { frontend_id: "gpa",                text: "GPA",                                                      type: "short_text",               is_required: true,  order: 6 },
  { frontend_id: "weighted_unweighted",text: "Weighted or Unweighted?",                                  type: "multiple_choice_single",   is_required: true,  order: 7 },
  { frontend_id: "sat_act",            text: "SAT or ACT Score (Optional)",                              type: "short_text",               is_required: false, order: 8 },
  { frontend_id: "ap_ib",              text: "Number of AP / IB / Honors Courses",                       type: "short_text",               is_required: true,  order: 9 },
  { frontend_id: "class_rank",         text: "Class Rank (Optional)",                                    type: "short_text",               is_required: false, order: 10 },
  { frontend_id: "intended_major",     text: "What major is the student considering?",                   type: "multiple_choice_single",   is_required: true,  order: 11 },
  { frontend_id: "academic_interests", text: "Strongest Subject Areas (Select up to 3)",                 type: "multiple_choice_multiple", is_required: true,  order: 12 },
  { frontend_id: "preferred_states",   text: "Preferred States",                                         type: "multiple_choice_multiple", is_required: false, order: 13 },
  { frontend_id: "distance",           text: "Distance from Home",                                       type: "multiple_choice_single",   is_required: true,  order: 14 },
  { frontend_id: "climate",            text: "Climate Preference (Optional)",                            type: "short_text",               is_required: false, order: 15 },
  { frontend_id: "campus_type",        text: "Campus Type Preference",                                   type: "multiple_choice_single",   is_required: true,  order: 16 },
  { frontend_id: "school_size",        text: "Preferred School Size",                                    type: "multiple_choice_single",   is_required: true,  order: 17 },
  { frontend_id: "budget",             text: "Estimated Budget Per Year",                                type: "multiple_choice_single",   is_required: true,  order: 18 },
  { frontend_id: "financial_aid",      text: "Will require financial aid?",                              type: "multiple_choice_single",   is_required: true,  order: 19 },
  { frontend_id: "school_type",        text: "Open to:",                                                 type: "multiple_choice_single",   is_required: true,  order: 20 },
  { frontend_id: "campus_culture",     text: "Select Top 3 Most Important Factors",                      type: "multiple_choice_multiple", is_required: true,  order: 21 },
  { frontend_id: "extracurricular",    text: "Extracurricular Interests",                                type: "long_text",                is_required: false, order: 22 },
  { frontend_id: "first_gen",          text: "First-generation college student?",                        type: "multiple_choice_single",   is_required: true,  order: 23 },
  { frontend_id: "learning_accom",     text: "Any learning accommodations needed?",                      type: "short_text",               is_required: false, order: 24 },
  { frontend_id: "scholarships",       text: "Interested in scholarships?",                              type: "multiple_choice_single",   is_required: true,  order: 25 },
  { frontend_id: "final_reflection",   text: "What would make the college experience successful?",       type: "long_text",                is_required: false, order: 26 },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userResult = await client.query(`
      INSERT INTO survey_app.users (username, email, role)
      VALUES ('system', 'system@survey.local', 'admin')
      ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
      RETURNING id;
    `);
    const adminId = userResult.rows[0].id;

    const surveyResult = await client.query(`
      INSERT INTO survey_app.surveys (name, description, is_active, mode, welcome_message, thank_you_message, created_by)
      VALUES ('College Fit Survey', 'Helps find the right college fit.', true, 'both', 'Let''s Find the Right College Fit', 'Thank you!', $1)
      RETURNING id;
    `, [adminId]);

    const surveyId = surveyResult.rows[0].id;
    console.log(`✅ Survey created with id: ${surveyId}`);
    console.log(`   → Update DEFAULT_SURVEY_ID=${surveyId} in your .env if not already 1`);

    for (const q of QUESTIONS) {
      await client.query(`
        INSERT INTO survey_app.questions (survey_id, frontend_id, text, type, is_required, "order")
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [surveyId, q.frontend_id, q.text, q.type, q.is_required, q.order]);
    }

    console.log(`✅ ${QUESTIONS.length} questions inserted.`);
    await client.query("COMMIT");
    console.log("✅ Seed complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();