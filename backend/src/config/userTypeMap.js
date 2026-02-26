const USER_TYPE_MAP = {
  "I am a student": "student",
  "I am a parent": "parent",
  "I am both a student & parent": "both",
};

function normalizeUserType(roleValue) {
  if (!roleValue) return null;
  return USER_TYPE_MAP[roleValue] ?? null;
}

module.exports = { normalizeUserType };