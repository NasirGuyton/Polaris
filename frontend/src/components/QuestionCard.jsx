function QuestionCard({ question, onNext, onChange, formData }) {
  if (!question) return <div>Loading...</div>;

  if (question.type === "form") {
    return (
      <div className="question-card">
        {question.fields.map(field => (
          <div key={field.id} className="field-group">
            <label>{field.label}</label>
            {field.type === "text" && (
              <input
                type="text"
                value={formData[field.id] || ""}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            )}
            {field.type === "number" && (
              <input
                type="number"
                value={formData[field.id] || ""}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
            )}
            {field.type === "select" && (
              <select
                value={formData[field.id] || ""}
                onChange={(e) => onChange(field.id, e.target.value)}
              >
                <option value="">Select an option</option>
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            {field.type === "multi-select" && (
              <select
                multiple
                value={formData[field.id] || []}
                onChange={(e) =>
                  onChange(
                    field.id,
                    Array.from(e.target.selectedOptions, option => option.value)
                  )
                }
              >
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
        ))}
        <button className="next-button" onClick={onNext}>Next</button>
      </div>
    );
  }

  // fallback for single select or text question
  return (
    <div className="question-card">
      <h2>{question.label}</h2>
      {question.type === "select" && (
        <select onChange={(e) => onChange(question.id, e.target.value)}>
          <option value="">Select an option</option>
          {question.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
      {question.type === "text" && (
        <input
          type="text"
          value={formData[question.id] || ""}
          onChange={(e) => onChange(question.id, e.target.value)}
        />
      )}
      {question.type === "number" && (
        <input
          type="number"
          value={formData[question.id] || ""}
          onChange={(e) => onChange(question.id, e.target.value)}
        />
      )}
      <button className="next-button" onClick={onNext}>Next</button>
    </div>
  );
}

export default QuestionCard;