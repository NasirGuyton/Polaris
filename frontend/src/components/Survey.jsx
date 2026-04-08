import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchActiveSurvey,
  startResponse,
  submitResponse,
} from "../services/api";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";

const TRANSITION_MS = 320;

function transformQuestions(survey) {
  const welcome = {
    id: "welcome",
    type: "welcome",
    title: survey.welcome_message || "Welcome",
    description: "This survey takes 8–10 minutes to complete.",
    buttonText: "Start",
  };

  const mapped = survey.questions.map((q) => ({
    id: q.frontend_id,
    type: q.frontend_type,
    label: q.label || q.text,
    helper: q.helper || undefined,
    placeholder: q.placeholder || undefined,
    optional: !q.is_required,
    max: q.max_selections || undefined,
    options: q.options?.length ? q.options.map((o) => o.value) : undefined,
  }));

  const results = { id: "results", type: "results" };

  return [welcome, ...mapped, results];
}

function Survey() {
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [responseId, setResponseId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [stageClass, setStageClass] = useState("stage-enter");
  const [isAnimating, setIsAnimating] = useState(false);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    fetchActiveSurvey()
      .then((data) => {
        setSurvey(data);
        setQuestions(transformQuestions(data));
      })
      .catch((err) => setApiError(err.message || "Failed to load survey."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    const direction = currentIndex > displayIndex ? "forward" : "backward";

    setIsAnimating(true);
    setStageClass(
      direction === "forward" ? "stage-exit-left" : "stage-exit-right"
    );

    const swapTimer = setTimeout(() => {
      setDisplayIndex(currentIndex);
      setStageClass(
        direction === "forward" ? "stage-enter-right" : "stage-enter-left"
      );

      const settleTimer = setTimeout(() => {
        setStageClass("stage-enter");
        setIsAnimating(false);
      }, 50);

      return () => clearTimeout(settleTimer);
    }, TRANSITION_MS);

    return () => clearTimeout(swapTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const question = questions[displayIndex];

  const visibleSteps = useMemo(
    () => questions.filter((q) => q.type !== "welcome" && q.type !== "results"),
    [questions]
  );

  const stepNumber = visibleSteps.findIndex((q) => q.id === question?.id) + 1;
  const totalSteps = visibleSteps.length;

  const validate = () => {
    if (!question) return false;
    if (question.type === "welcome" || question.type === "results") return true;
    if (question.optional) return true;

    const value = formData[question.id];

    if (question.type === "multi-select") {
      if (!Array.isArray(value) || value.length === 0) return false;
      if (typeof question.max === "number" && value.length > question.max) {
        return false;
      }
      return true;
    }

    if (question.type === "major") {
      const major = formData[question.id];
      if (!major) return false;
      if (major !== "Undecided" && !formData.major_confidence) return false;
      return true;
    }

    return value !== undefined && value !== null && String(value).trim() !== "";
  };

  const next = async () => {
    if (isAnimating) return;

    if (!validate()) {
      setError("Please answer before continuing.");
      return;
    }

    setError("");

    if (question?.type === "welcome" && !responseId && survey) {
      try {
        const data = await startResponse(survey.id);
        setResponseId(data.response_id);
      } catch {
        setError("Failed to start survey. Please try again.");
        return;
      }
    }

    const nextIdx = Math.min(currentIndex + 1, questions.length - 1);

    if (questions[nextIdx]?.type === "results" && responseId && !submitted) {
      try {
        await submitResponse(responseId, formData, survey.id);
        setSubmitted(true);
      } catch {
        setError("Failed to submit survey. Please try again.");
        return;
      }
    }

    setCurrentIndex(nextIdx);
  };

  const back = () => {
    if (isAnimating) return;
    setError("");
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const handleChange = (id, value) => {
    setError("");

    setFormData((prev) => {
      const nextState = {
        ...prev,
        [id]: value,
      };

      if (id === "intended_major" && value === "Undecided") {
        delete nextState.major_confidence;
      }

      return nextState;
    });
  };

  if (loading) {
    return (
      <div className="survey-shell">
        <div className="survey-frame">
          <div className="question-page">
            <h1 className="question-title">Loading survey…</h1>
          </div>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="survey-shell">
        <div className="survey-frame">
          <div className="question-page">
            <h1 className="question-title">Something went wrong</h1>
            <p className="question-subtitle">{apiError}</p>
            <div className="action-row">
              <button
                className="ok-btn"
                type="button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-shell">
      <div className="survey-topbar">
        <ProgressBar current={Math.max(stepNumber, 0)} total={totalSteps} />
      </div>

      <div className="survey-frame">
        {question?.type !== "welcome" && question?.type !== "results" && (
          <div className="step-chip">
            <span>{stepNumber}</span>
            <span className="step-chip-text">of {totalSteps}</span>
          </div>
        )}

        <div className="question-stage">
          <div className={`stage-panel ${stageClass}`}>
            {question?.type === "welcome" ? (
              <div className="question-page">
                <h1 className="question-title">{question.title}</h1>
                <p className="question-subtitle">{question.description}</p>

                <div className="action-row">
                  <button className="ok-btn" type="button" onClick={next}>
                    {question.buttonText || "Start"}
                  </button>
                </div>
              </div>
            ) : question?.type === "results" ? (
              <div className="question-page">
                <h1 className="question-title">Survey complete.</h1>
                <p className="question-subtitle">
                  {submitted
                    ? "Your responses have been submitted. Thank you!"
                    : "Your responses are ready for review."}
                </p>

                <button className="back-link" type="button" onClick={back}>
                  ← Back
                </button>
              </div>
            ) : (
              <QuestionCard
                question={question}
                formData={formData}
                onChange={handleChange}
                onNext={next}
                onBack={back}
                error={error}
                isAnimating={isAnimating}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Survey;
