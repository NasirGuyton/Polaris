const API_BASE = process.env.REACT_APP_API_URL || "";

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...(options.headers || {}) }
    : { "Content-Type": "application/json", ...(options.headers || {}) };
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
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

export function trackResponseProgress(responseId, payload) {
  return request(`/api/responses/${responseId}/progress`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function trackResponseAbandon(responseId, payload) {
  const beacon = new Blob([JSON.stringify(payload)], { type: "application/json" });
  return navigator.sendBeacon(`${API_BASE}/api/responses/${responseId}/progress`, beacon);
}

export function uploadResponseFile(responseId, payload) {
  const form = new FormData();
  form.append("file", payload.file);
  form.append("survey_id", String(payload.survey_id));
  form.append("question_frontend_id", payload.question_frontend_id);
  return request(`/api/responses/${responseId}/files`, {
    method: "POST",
    body: form,
  });
}
