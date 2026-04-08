const API_BASE = process.env.REACT_APP_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export function fetchActiveSurvey() {
  return request("/api/surveys/active");
}

export function startResponse(surveyId) {
  return request("/api/responses/start", {
    method: "POST",
    body: JSON.stringify({ survey_id: surveyId }),
  });
}

export function submitResponse(responseId, formData, surveyId) {
  return request(`/api/responses/${responseId}/submit`, {
    method: "POST",
    body: JSON.stringify({ formData, survey_id: surveyId }),
  });
}
