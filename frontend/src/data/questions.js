const questions = [
  {
    id: "welcome",
    type: "welcome",
    title: "Let's Find the Right College Fit",
    description: "This survey takes 8–10 minutes to complete.",
    buttonText: "Start"
  },
  {
    id: "role",
    type: "select",
    label: "Who is filling this out today?",
    options: ["I am a student", "I am a parent", "I am both a student & parent"]
  },
  {
    id: "student_info",
    type: "form",
    fields: [
      { id: "student_name", label: "Student Name", type: "text" },
      { id: "graduation_year", label: "Graduation Year", type: "select", options: ["2026","2027","2028","2029"] },
      { id: "current_school", label: "Current School", type: "text" },
      { id: "city_state", label: "City & State (Optional)", type: "text", optional: true }
    ]
  },
  {
    id: "academic_profile",
    type: "form",
    fields: [
      { id: "gpa", label: "GPA", type: "number" },
      { id: "weighted_unweighted", label: "Weighted or Unweighted?", type: "select", options: ["Weighted","Unweighted"] },
      { id: "sat_act", label: "SAT or ACT Score (Optional)", type: "number", optional: true },
      { id: "ap_ib", label: "Number of AP / IB / Honors Courses", type: "number" },
      { id: "class_rank", label: "Class Rank (Optional)", type: "number", optional: true }
    ]
  },
  {
    id: "intended_major",
    type: "major",
    label: "What major is the student considering?",
    options: ["Engineering","Business","Biology","Computer Science","Undecided"]
  },
  {
    id: "academic_interests",
    type: "multi-select",
    label: "Strongest Subject Areas (Select up to 3)",
    options: ["Math","Science","Humanities","Arts","Business","Technology"]
  },
  {
    id: "location_preferences",
    type: "location",
    fields: [
      { id: "preferred_states", label: "Preferred States (Multi-select or 'Open to Anywhere')", type: "multi-select", options: ["CA","NY","TX","Other"] },
      { id: "distance", label: "Distance from Home", type: "select", options: ["Close (within 2 hours)","Moderate (same region)","Far / Out of state"] },
      { id: "climate", label: "Climate Preference (Optional)", type: "text", optional: true }
    ]
  },
  {
    id: "campus_type",
    type: "form",
    fields: [
      { id: "campus_type", label: "Campus Type Preference", type: "select", options: ["Urban","Suburban","Rural","No preference"] },
      { id: "school_size", label: "Preferred School Size", type: "select", options: ["Small (<5,000)","Medium (5,000–15,000)","Large (15,000+)"] }
    ]
  },
  {
    id: "financial",
    type: "form",
    fields: [
      { id: "budget", label: "Estimated Budget Per Year", type: "select", options: ["$0–$20,000","$20,000–$40,000","$40,000–$60,000","Flexible"] },
      { id: "financial_aid", label: "Will require financial aid?", type: "select", options: ["Yes","No","Unsure"] },
      { id: "school_type", label: "Open to:", type: "select", options: ["Public universities","Private universities","Both"] }
    ]
  },
  {
    id: "campus_culture",
    type: "multi-select",
    label: "Select Top 3 Most Important Factors",
    options: ["Strong academics","School spirit / athletics","Social life","Internship opportunities","Research opportunities","Diversity","Small class sizes","Career placement"]
  },
  {
    id: "extracurricular",
    type: "text",
    label: "Extracurricular Interests (Short Answer)"
  },
  {
    id: "support",
    type: "form",
    fields: [
      { id: "first_gen", label: "First-generation college student?", type: "select", options: ["Yes","No"] },
      { id: "learning_accom", label: "Any learning accommodations needed?", type: "text", optional: true },
      { id: "scholarships", label: "Interested in scholarships?", type: "select", options: ["Yes","No"] }
    ]
  },
  {
    id: "final_reflection",
    type: "text",
    label: "In one sentence, what would make the college experience successful for this student?"
  },
  {
    id: "results",
    type: "results"
  }
];

export default questions;