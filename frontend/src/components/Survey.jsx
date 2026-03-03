import { useEffect, useMemo, useState } from "react";
import questions from "../data/questions";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";

const STORAGE_KEY = "college_survey_draft_v1";

function Survey() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  // Resume draft (design win + prevents rage quits)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData ?? {});
        setCurrentIndex(parsed.currentIndex ?? 0);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentIndex, formData }));
  }, [currentIndex, formData]);

  const currentQuestion = questions[currentIndex];

  const totalSteps = useMemo(() => questions.filter(q => q.type !== "results").length, []);
  const currentStepNumber = useMemo(() => {
    // show step count excluding welcome/results
    const steps = questions.filter(q => q.type !== "welcome" && q.type !== "results");
    const idx = steps.findIndex(q => q.id === currentQuestion?.id);
    return idx >= 0 ? idx + 1 : 0;
  }, [currentQuestion]);

  const handleBack = () => {
    setError("");
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const validateStep = () => {
    setError("");

    if (!currentQuestion) return false;
    if (currentQuestion.type === "welcome") return true;
    if (currentQuestion.type === "results") return true;

    // Fields-based step
    const fields = currentQuestion.fields;
    if (Array.isArray(fields)) {
      for (const f of fields) {
        if (f.optional) continue;
        const v = formData[f.id];

        const empty =
          v === undefined ||
          v === null ||
          (typeof v === "string" && v.trim() === "") ||
          (Array.isArray(v) && v.length === 0);

        if (empty) {
          setError(`Please fill out: ${f.label}`);
          return false;
        }

        // enforce max selection if provided
        if (f.type === "multi-select" && typeof f.max === "number" && Array.isArray(v) && v.length > f.max) {
          setError(`Please select up to ${f.max} for: ${f.label}`);
          return false;
        }
      }
      return true;
    }

    // Single question step
    const id = currentQuestion.id;
    const v = formData[id];

    if (currentQuestion.type === "multi-select") {
      if (!Array.isArray(v) || v.length === 0) {
        setError("Please select at least one option.");
        return false;
      }
      if (v.length > 3) {
        setError("Please select up to 3 options.");
        return false;
      }
      return true;
    }

    const needsValue = ["select", "text", "number", "major"].includes(currentQuestion.type);
    if (needsValue) {
      const empty = v === undefined || v === null || (typeof v === "string" && v.trim() === "");
      if (empty) {
        setError("Please answer the question before continuing.");
        return false;
      }
    }

    // Major confidence required if major chosen and not Undecided
    if (currentQuestion.type === "major") {
      const major = formData[id];
      if (major && major !== "Undecided") {
        const conf = formData.major_confidence;
        if (!conf) {
          setError("Please select your confidence level.");
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = () => {
    const ok = validateStep();
    if (!ok) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleChange = (id, value) => {
    setError("");
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const canNext = useMemo(() => {
    // simple approach: allow click, validation happens on Next
    // or you can run validateStep() here (but it sets state/errors)
    return true;
  }, []);

  return (
    <div className="survey-shell">
      <div className="survey-container">
        <ProgressBar current={currentIndex} total={questions.length - 1} />

        {currentQuestion?.type !== "welcome" && currentQuestion?.type !== "results" && (
          <div className="step-label">
            Step {currentStepNumber} of {totalSteps - 1}
          </div>
        )}

        {currentQuestion?.type === "welcome" ? (
          <div className="card welcome">
            <h2 className="title">{currentQuestion.title}</h2>
            <p className="subtitle">{currentQuestion.description}</p>
            <div className="actions">
              <button className="btn primary" onClick={handleNext} type="button">
                {currentQuestion.buttonText}
              </button>
            </div>
          </div>
        ) : currentQuestion?.type === "results" ? (
          <div className="card">
            <h2 className="title">Survey Complete!</h2>
            <p className="subtitle">Thanks — your responses are ready to submit.</p>
            <pre className="codeblock">{JSON.stringify(formData, null, 2)}</pre>
          </div>
        ) : (
          <QuestionCard
            question={currentQuestion}
            onNext={handleNext}
            onBack={handleBack}
            onChange={handleChange}
            formData={formData}
            canNext={canNext}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

export default Survey;