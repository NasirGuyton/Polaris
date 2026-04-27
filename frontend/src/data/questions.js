const questions = [
  {
    id: "welcome",
    type: "welcome",
    title: "Let's Find the Right College Fit",
    description: "This survey takes 8–10 minutes to complete.",
    buttonText: "Start",
  },

  {
    id: "role",
    type: "select",
    label: "Who is filling this out today?",
    options: [
      "I am a student",
      "I am a parent",
      "I am both a student & parent",
    ],
  },

  {
    id: "student_name",
    type: "text",
    label: "What is the student's name?",
    placeholder: "Type your answer here...",
  },
  {
    id: "graduation_year",
    type: "select",
    label: "What is the student's graduation year?",
    options: ["2026", "2027", "2028", "2029"],
  },
  {
    id: "current_school",
    type: "text",
    label: "What is the student's current school?",
    placeholder: "Type your answer here...",
  },
  {
    id: "city_state",
    type: "text",
    label: "What city and state is the student in?",
    placeholder: "Type your answer here...",
    optional: true,
  },

  {
    id: "gpa",
    type: "number",
    label: "What is the student's GPA?",
    placeholder: "Enter a number...",
  },
  {
    id: "weighted_unweighted",
    type: "select",
    label: "Is that weighted or unweighted?",
    options: ["Weighted", "Unweighted"],
  },
  {
    id: "sat_act",
    type: "number",
    label: "What is the student's SAT or ACT score?",
    placeholder: "Enter a number...",
    optional: true,
  },
  {
    id: "ap_ib",
    type: "number",
    label: "How many AP / IB / Honors courses has the student taken?",
    placeholder: "Enter a number...",
  },
  {
    id: "class_rank",
    type: "number",
    label: "What is the student's class rank?",
    placeholder: "Enter a number...",
    optional: true,
  },

  {
    id: "intended_major",
    type: "major",
    label: "What major is the student considering?",
    options: [
      "Engineering",
      "Business",
      "Biology",
      "Computer Science",
      "Undecided",
    ],
  },

  {
    id: "academic_interests",
    type: "multi-select",
    label: "What are the student's strongest subject areas?",
    helper: "Select up to 3",
    options: ["Math", "Science", "Humanities", "Arts", "Business", "Technology"],
    max: 3,
  },

  {
    id: "preferred_states",
    type: "multi-select",
    label: "Which states are preferred?",
    helper: "Select all that apply",
    options: ["California", "New York", "Texas", "Other", "Open to anywhere"],
  },
  {
    id: "distance",
    type: "select",
    label: "How far from home should the college be?",
    options: [
      "Close (within 2 hours)",
      "Moderate (same region)",
      "Far / Out of state",
    ],
  },
  {
    id: "climate",
    type: "text",
    label: "Is there a climate preference?",
    placeholder: "Type your answer here...",
    optional: true,
  },

  {
    id: "campus_type",
    type: "select",
    label: "What campus type feels best?",
    options: ["Urban", "Suburban", "Rural", "No preference"],
  },
  {
    id: "school_size",
    type: "select",
    label: "What school size is preferred?",
    options: ["Small (<5,000)", "Medium (5,000–15,000)", "Large (15,000+)"],
  },

  {
    id: "budget",
    type: "select",
    label: "What is the estimated budget per year?",
    options: ["$0–$20,000", "$20,000–$40,000", "$40,000–$60,000", "Flexible"],
  },
  {
    id: "financial_aid",
    type: "select",
    label: "Will financial aid be needed?",
    options: ["Yes", "No", "Unsure"],
  },
  {
    id: "school_type",
    type: "select",
    label: "Is the student open to public, private, or both?",
    options: ["Public universities", "Private universities", "Both"],
  },

  {
    id: "campus_culture",
    type: "multi-select",
    label: "What matters most in the college experience?",
    helper: "Select up to 3",
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
    max: 3,
  },

  {
    id: "extracurricular",
    type: "text",
    label: "What extracurricular interests does the student have?",
    placeholder: "Type your answer here...",
    optional: true,
  },

  {
    id: "first_gen",
    type: "select",
    label: "Is the student first-generation?",
    options: ["Yes", "No"],
  },
  {
    id: "learning_accom",
    type: "text",
    label: "Are any learning accommodations needed?",
    placeholder: "Type your answer here...",
    optional: true,
  },
  {
    id: "scholarships",
    type: "select",
    label: "Is the student interested in scholarships?",
    options: ["Yes", "No"],
  },

  {
    id: "supporting_documents",
    type: "file",
    label: "Upload supporting documents",
    helper:
      "Please attach any files you would like us to consider, such as transcripts, test scores, class schedules, or school documents.",
    optional: true,
    accept: "image/*,.pdf,.doc,.docx",
    maxSizeMB: 10,
  },

  {
    id: "final_reflection",
    type: "text",
    label: "In one sentence, what would make college successful for this student?",
    placeholder: "Type your answer here...",
  },

  {
    id: "results",
    type: "results",
  },
];

export default questions;