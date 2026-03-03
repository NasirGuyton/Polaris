function QuestionCard({ question, onNext, onBack, onChange, formData, canNext, error }) {
  if (!question) return <div>Loading...</div>;

  const renderField = (field) => {
    const value = formData[field.id] ?? (field.type === "multi-select" ? [] : "");
    const isOptional = !!field.optional;

    return (
      <div key={field.id} className="field-group">
        <label className="label">
          {field.label} {!isOptional && <span className="req">*</span>}
        </label>

        {field.type === "text" && (
          <input
            className="input"
            type="text"
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        )}

        {field.type === "number" && (
          <input
            className="input"
            type="number"
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        )}

        {field.type === "select" && (
          <select
            className="select"
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
          >
            <option value="">Select an option</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}

        {field.type === "multi-select" && (
          <>
            <select
              className="select"
              multiple
              value={value}
              onChange={(e) =>
                onChange(
                  field.id,
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {typeof field.max === "number" && (
              <div className="hint">Select up to {field.max}.</div>
            )}
          </>
        )}
      </div>
    );
  };

  // Normalize: if question has fields, treat it like a form step
  const fields = question.fields ?? null;

  // Major special case: add confidence follow-up if major selected and not Undecided
  const majorSelected = question.type === "major" ? (formData[question.id] ?? "") : "";
  const showMajorConfidence = question.type === "major" && majorSelected && majorSelected !== "Undecided";

  return (
    <div className="card">
      {question.label && <h2 className="title">{question.label}</h2>}

      {/* Fields-based steps (form/location/etc.) */}
      {fields?.length ? (
        <div className="fields">
          {fields.map((f) => renderField(f))}
        </div>
      ) : (
        <div className="fields">
          {/* Single-question steps */}
          {question.type === "select" && (
            <select
              className="select"
              value={formData[question.id] ?? ""}
              onChange={(e) => onChange(question.id, e.target.value)}
            >
              <option value="">Select an option</option>
              {question.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {question.type === "text" && (
            <input
              className="input"
              type="text"
              value={formData[question.id] ?? ""}
              onChange={(e) => onChange(question.id, e.target.value)}
            />
          )}

          {question.type === "number" && (
            <input
              className="input"
              type="number"
              value={formData[question.id] ?? ""}
              onChange={(e) => onChange(question.id, e.target.value)}
            />
          )}

          {question.type === "multi-select" && (
            <>
              <select
                className="select"
                multiple
                value={formData[question.id] ?? []}
                onChange={(e) =>
                  onChange(
                    question.id,
                    Array.from(e.target.selectedOptions, (option) => option.value)
                  )
                }
              >
                {question.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <div className="hint">Select up to 3.</div>
            </>
          )}

          {question.type === "major" && (
            <>
              <select
                className="select"
                value={formData[question.id] ?? ""}
                onChange={(e) => onChange(question.id, e.target.value)}
              >
                <option value="">Select an option</option>
                {question.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

              {showMajorConfidence && (
                <div className="field-group">
                  <label className="label">How confident are you in this choice? <span className="req">*</span></label>
                  <select
                    className="select"
                    value={formData.major_confidence ?? ""}
                    onChange={(e) => onChange("major_confidence", e.target.value)}
                  >
                    <option value="">Select an option</option>
                    {["Very confident", "Somewhat confident", "Still exploring"].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <div className="actions">
        <button className="btn secondary" onClick={onBack} type="button">
          Back
        </button>
        <button className="btn primary" onClick={onNext} disabled={!canNext} type="button">
          Next
        </button>
      </div>
    </div>
  );
}

export default QuestionCard;