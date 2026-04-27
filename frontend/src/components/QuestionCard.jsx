import { useEffect, useRef } from "react";

function QuestionCard({
  question,
  formData,
  error,
  onNext,
  onBack,
  onChange,
  isAnimating,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (question?.type === "text" || question?.type === "number") {
      inputRef.current?.focus();
    }
  }, [question]);

  if (!question) return null;

  const value =
    formData[question.id] ?? (question.type === "multi-select" ? [] : "");

  const isOptional = !!question.optional;

  const handleTextKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="question-page">
      <div className="question-copy">
        <h1 className="question-title">
          {question.label}
          {!isOptional && <span className="required-mark">*</span>}
        </h1>

        {question.helper && (
          <p className="question-subtitle">{question.helper}</p>
        )}
      </div>

      <div className="question-answer">
        {question.type === "text" && (
          <>
            <input
              ref={inputRef}
              className="line-input"
              type="text"
              value={value}
              onChange={(e) => onChange(question.id, e.target.value)}
              onKeyDown={handleTextKeyDown}
              placeholder={question.placeholder || "Type your answer..."}
            />

            <div className="action-row">
              <button className="ok-btn" type="button" onClick={() => onNext()}>
                OK
              </button>
            </div>
          </>
        )}

        {question.type === "number" && (
          <>
            <input
              ref={inputRef}
              className="line-input"
              type="number"
              value={value}
              onChange={(e) => onChange(question.id, e.target.value)}
              onKeyDown={handleTextKeyDown}
              placeholder={question.placeholder || "Enter a number..."}
            />

            <div className="action-row">
              <button className="ok-btn" type="button" onClick={() => onNext()}>
                OK
              </button>
            </div>
          </>
        )}

        {question.type === "select" && (
          <div className="option-list">
            {question.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`choice-btn ${value === opt ? "selected" : ""}`}
                disabled={isAnimating}
                onClick={() => {
                  onNext({ id: question.id, value: opt });
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {question.type === "multi-select" && (
          <>
            <div className="option-list">
              {question.options.map((opt) => {
                const selected = value.includes(opt);
                const maxReached =
                  typeof question.max === "number" &&
                  !selected &&
                  value.length >= question.max;

                return (
                  <button
                    key={opt}
                    type="button"
                    className={`choice-btn ${selected ? "selected" : ""}`}
                    disabled={maxReached || isAnimating}
                    onClick={() => {
                      if (selected) {
                        onChange(
                          question.id,
                          value.filter((v) => v !== opt)
                        );
                      } else {
                        onChange(question.id, [...value, opt]);
                      }
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="action-row">
              <button className="ok-btn" type="button" onClick={() => onNext()}>
                Next
              </button>
            </div>
          </>
        )}

        {question.type === "major" && (
          <>
            <div className="option-list">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`choice-btn ${
                    formData[question.id] === opt ? "selected" : ""
                  }`}
                  disabled={isAnimating}
                  onClick={() => {
                    if (opt === "Undecided") {
                      onNext({ id: question.id, value: opt });
                    } else {
                      onChange(question.id, opt);
                    }
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {formData[question.id] &&
              formData[question.id] !== "Undecided" && (
                <div className="followup-block">
                  <p className="question-subtitle followup-label">
                    How confident are you in this choice?
                  </p>

                  <div className="option-list compact">
                    {[
                      "Very confident",
                      "Somewhat confident",
                      "Still exploring",
                    ].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`choice-btn ${
                          formData.major_confidence === opt ? "selected" : ""
                        }`}
                        disabled={isAnimating}
                        onClick={() => {
                          onNext({ id: "major_confidence", value: opt });
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </>
        )}

        {question.type === "file" && (
          <>
            <label className="file-upload-box">
              <input
                className="file-input"
                type="file"
                accept={question.accept || "image/*,.pdf,.doc,.docx"}
                onChange={(e) => {
                  const file = e.target.files[0];

                  if (!file) return;

                  const maxSize = (question.maxSizeMB || 10) * 1024 * 1024;

                  if (file.size > maxSize) {
                    onChange(question.id, "");
                    alert(
                      `File must be smaller than ${
                        question.maxSizeMB || 10
                      }MB.`
                    );
                    return;
                  }

                  onChange(question.id, {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                  });
                }}
              />

              <div className="upload-icon">☁</div>

              <div className="upload-text">
                <strong>
                  {value?.name ? value.name : "Choose file or drag here"}
                </strong>
                <span>Size limit: {question.maxSizeMB || 10}MB</span>
              </div>
            </label>

            <div className="action-row">
              <button className="ok-btn" type="button" onClick={() => onNext()}>
                OK
              </button>
            </div>
          </>
        )}

        {error && <div className="error-text">{error}</div>}

        {question.id !== "role" && (
          <button className="back-link" type="button" onClick={onBack}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestionCard;