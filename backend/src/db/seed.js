const pool = require("./pool");

const QUESTIONS = [
  {
    frontend_id: "role",
    text: "Who is filling this out today?",
    label: "Who is filling this out today?",
    type: "multiple_choice_single",
    frontend_type: "select",
    is_required: true,
    order: 1,
    options: ["I am a student", "I am a parent", "I am both a student & parent"],
  },
  {
    frontend_id: "student_name",
    text: "Student Name",
    label: "What is the student's name?",
    type: "short_text",
    frontend_type: "text",
    is_required: true,
    order: 2,
    placeholder: "Type your answer here...",
  },
  {
    frontend_id: "graduation_year",
    text: "Graduation Year",
    label: "What is the student's graduation year?",
    type: "dropdown",
    frontend_type: "select",
    is_required: true,
    order: 3,
    options: ["2026", "2027", "2028", "2029"],
  },
  {
    frontend_id: "current_school",
    text: "Current School",
    label: "What is the student's current school?",
    type: "short_text",
    frontend_type: "text",
    is_required: true,
    order: 4,
    placeholder: "Type your answer here...",
  },
  {
    frontend_id: "city_state",
    text: "City & State",
    label: "What city and state is the student in?",
    type: "short_text",
    frontend_type: "text",
    is_required: false,
    order: 5,
    placeholder: "Type your answer here...",
  },
  {
    frontend_id: "gpa",
    text: "GPA",
    label: "What is the student's GPA?",
    type: "short_text",
    frontend_type: "number",
    is_required: true,
    order: 6,
    placeholder: "Enter a number...",
  },
  {
    frontend_id: "weighted_unweighted",
    text: "Weighted or Unweighted?",
    label: "Is that weighted or unweighted?",
    type: "multiple_choice_single",
    frontend_type: "select",
    is_required: true,
    order: 7,
    options: ["Weighted", "Unweighted"],
  },
  {
    frontend_id: "sat_act",
    text: "SAT or ACT Score",
    label: "What is the student's SAT or ACT score?",
    type: "short_text",
    frontend_type: "number",
    is_required: false,
    order: 8,
    placeholder: "Enter a number...",
  },
  {
    frontend_id: "ap_ib",
    text: "Number of AP / IB / Honors Courses",
    label: "How many AP / IB / Honors courses has the student taken?",
    type: "short_text",
    frontend_type: "number",
    is_required: true,
    order: 9,
    placeholder: "Enter a number...",
  },
  {
    frontend_id: "class_rank",
    text: "Class Rank",
    label: "What is the student's class rank?",
    type: "short_text",
    frontend_type: "number",
    is_required: false,
    order: 10,
    placeholder: "Enter a number...",
  },
  {
    frontend_id: "intended_major",
    text: "What major is the student considering?",
    label: "What major is the student considering?",
    type: "multiple_choice_single",
    frontend_type: "major",
    is_required: true,
    order: 11,
    options: ["Engineering", "Business", "Biology", "Computer Science", "Undecided"],
  },
  {
    frontend_id: "academic_interests",
    text: "Strongest Subject Areas",
    label: "What are the student's strongest subject areas?",
    helper: "Select up to 3",
    type: "multiple_choice_multiple",
    frontend_type: "multi-select",
    is_required: true,
    order: 12,
    max_selections: 3,
    options: ["Math", "Science", "Humanities", "Arts", "Business", "Technology"],
  },
  {
    frontend_id: "preferred_states",
    text: "Preferred States",
    label: "Which states are preferred?",
    helper: "Select all that apply",
    type: "multiple_choice_multiple",
    frontend_type: "multi-select",
    is_required: true,
    order: 13,
    options: ["California", "New York", "Texas", "Other", "Open to anywhere"],
  },
  {
    frontend_id: "distance",
    text: "Distance from Home",
    label: "How far from home should the college be?",
    type: "multiple_choice_single",
    frontend_type: "select",
    is_required: true,
    order: 14,
    options: ["Close (within 2 hours)", "Moderate (same region)", "Far / Out of state"],
  },
  {
    frontend_id: "climate",
    text: "Climate Preference",
    label: "Is there a climate preference?",
    type: "short_text",
    frontend_type: "text",
    is_required: false,
    order: 15,
    placeholder: "Type your answer here...",
  },
  {
    frontend_id: "campus_type",
    text: "Campus Type Preference",
    label: "What campus type feels best?",
    type: "multiple_choice_single",
    frontend_type: "select",
    is_required: true,
    order: 16,
    options: ["Urban", "Suburban", "Rural", "No preference"],
  },
  {
    frontend_id: "school_size",
    text: "Preferred School Size",
    label: "What school size is preferred?",
    type: "multiple_choice_single",
    frontend_type: "select",
    is_required: true,
    order: 17,
    options: ["Small (<5,000)", "Medium (5,000–15,000)", "Large (15,000+)"],
  },
  {
    frontend_id: "budget",
    text: "Estimated Budget Per Year",
    label: "What is the estimated budget per year?",
    type: "multiple_choice_single",
    frontend_type: "select",
    is_required: true,
    order: 18,
    options: ["$0–$20,000", "$20,000–$40,000", "$40,000–$60,000", "Flexible"],
  },
  {
    frontend_id: "financial_aid",
    text: "Will require financial aid?",
    label: "Will financial aid be needed?",
    type: "multiple_choice_single",
    frontend_type: "select",
    is_required: true,
    order: 19,
    options: ["Yes", "No", "Unsure"],
  },
  {
    frontend_id: "school_type",
    text: "Open to:",
    label: "Is the student open to public, private, or both?",
    type: "multiple_choice_single",
    frontend_type: "select",
    is_required: true,
    order: 20,
    options: ["Public universities", "Private universities", "Both"],
  },
  {
    frontend_id: "campus_culture",
    text: "Select Top 3 Most Important Factors",
    label: "What matters most in the college experience?",
    helper: "Select up to 3",
    type: "multiple_choice_multiple",
    frontend_type: "multi-select",
    is_required: true,
    order: 21,
    max_selections: 3,
    options: [
      "Strong academics",
      "School spirit / athletics",
      "Social life",
      "Internship opportunities",
      "Research opportunities",
      "Diversity",
      "Small class sizes",
      "Career placement",
    ],
  },
  {
    frontend_id: "extracurricular",
    text: "Extracurricular Interests",
    label: "What extracurricular interests does the student have?",
    type: "long_text",
    frontend_type: "text",
    is_required: false,
    order: 22,
    placeholder: "Type your answer here...",
  },
  {
    frontend_id: "first_gen",
    text: "First-generation college student?",
    label: "Is the student first-generation?",
    type: "multiple_choice_single",
    frontend_type: "select",
    is_required: true,
    order: 23,
    options: ["Yes", "No"],
  },
  {
    frontend_id: "learning_accom",
    text: "Any learning accommodations needed?",
    label: "Are any learning accommodations needed?",
    type: "short_text",
    frontend_type: "text",
    is_required: false,
    order: 24,
    placeholder: "Type your answer here...",
  },
  {
    frontend_id: "scholarships",
    text: "Interested in scholarships?",
    label: "Is the student interested in scholarships?",
    type: "multiple_choice_single",
    frontend_type: "select",
    is_required: true,
    order: 25,
    options: ["Yes", "No"],
  },
  {
    frontend_id: "supporting_documents",
    text: "Upload supporting documents",
    label: "Upload supporting documents",
    helper: "Please attach a resume, transcript, or other relevant files.",
    type: "file_upload",
    frontend_type: "file",
    is_required: false,
    order: 26,
    accept: ".pdf,.doc,.docx,.xls,.xlsx",
    max_size_mb: 10,
  },
  {
    frontend_id: "final_reflection",
    text: "What would make the college experience successful?",
    label: "In one sentence, what would make college successful for this student?",
    type: "long_text",
    frontend_type: "text",
    is_required: true,
    order: 27,
    placeholder: "Type your answer here...",
  },
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

    const existingCheck = await client.query(
      `SELECT id FROM survey_app.surveys WHERE name = 'College Fit Survey' LIMIT 1`
    );
    if (existingCheck.rows.length > 0) {
      console.log("⏭️  Survey already exists — skipping seed.");
      await client.query("COMMIT");
      return;
    }

    const surveyResult = await client.query(`
      INSERT INTO survey_app.surveys (name, description, is_active, mode, welcome_message, thank_you_message, created_by)
      VALUES ('College Fit Survey', 'Helps find the right college fit.', true, 'both', 'Let''s Find the Right College Fit', 'Thank you!', $1)
      RETURNING id;
    `, [adminId]);

    const surveyId = surveyResult.rows[0].id;
    console.log(`✅ Survey created with id: ${surveyId}`);
    console.log(`   → Update DEFAULT_SURVEY_ID=${surveyId} in your .env if not already 1`);

    for (const q of QUESTIONS) {
      const questionResult = await client.query(`
        INSERT INTO survey_app.questions
          (survey_id, frontend_id, text, type, frontend_type, label, helper, placeholder, accept, max_size_mb, is_required, max_selections, "order")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        surveyId,
        q.frontend_id,
        q.text,
        q.type,
        q.frontend_type,
        q.label,
        q.helper || null,
        q.placeholder || null,
        q.accept || null,
        q.max_size_mb || null,
        q.is_required,
        q.max_selections || null,
        q.order,
      ]);

      if (q.options && q.options.length > 0) {
        const questionId = questionResult.rows[0].id;
        for (let i = 0; i < q.options.length; i++) {
          await client.query(`
            INSERT INTO survey_app.options (question_id, value, "order")
            VALUES ($1, $2, $3)
          `, [questionId, q.options[i], i + 1]);
        }
      }
    }

    console.log(`✅ ${QUESTIONS.length} questions inserted with options.`);
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
