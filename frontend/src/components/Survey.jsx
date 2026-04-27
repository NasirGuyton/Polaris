import { useEffect, useMemo, useRef, useState } from "react";
import { fetchActiveSurvey } from "../services/api";
import localQuestions from "../data/questions";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import bgImage from "../assets/welcome-illustration.png";

const TRANSITION_MS = 180;

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
    accept: q.accept || undefined,
    maxSizeMB: q.max_size_mb || 10,
    options: q.options?.length ? q.options.map((o) => o.value) : undefined,
  }));

  return [welcome, ...mapped, { id: "results", type: "results" }];
}

function Survey() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setQuestions(transformQuestions(data));
      })
      .catch(() => {
        console.warn("Backend not available — using local questions.js");
        setQuestions(localQuestions);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
  if (firstRenderRef.current) {
    firstRenderRef.current = false;
    return;
  }

  setIsAnimating(true);
  setStageClass("stage-slide-out");

  const timer = setTimeout(() => {
    setDisplayIndex(currentIndex);
    setStageClass("stage-slide-in");
    setIsAnimating(false);
  }, TRANSITION_MS);

  return () => clearTimeout(timer);
}, [currentIndex]);

  const question = questions[displayIndex];

  const visibleSteps = useMemo(
    () => questions.filter((q) => q.type !== "welcome" && q.type !== "results"),
    [questions]
  );

  const stepNumber = visibleSteps.findIndex((q) => q.id === question?.id) + 1;
  const totalSteps = visibleSteps.length;

  const validateWithData = (dataToValidate) => {
    if (!question) return false;
    if (question.type === "welcome" || question.type === "results") return true;
    if (question.optional) return true;

    const value = dataToValidate[question.id];

    if (question.type === "multi-select") {
      return Array.isArray(value) && value.length > 0;
    }

    if (question.type === "major") {
      const major = dataToValidate[question.id];
      if (!major) return false;
      if (major !== "Undecided" && !dataToValidate.major_confidence) {
        return false;
      }
      return true;
    }

    if (question.type === "file") {
      return !!value;
    }

    return value !== undefined && value !== null && String(value).trim() !== "";
  };

  const next = (instantAnswer = null) => {
    if (isAnimating) return;

    const updatedData = instantAnswer
      ? {
          ...formData,
          [instantAnswer.id]: instantAnswer.value,
        }
      : formData;

    if (!validateWithData(updatedData)) {
      setError("Please answer before continuing.");
      return;
    }

    setError("");

    if (instantAnswer) {
      setFormData((prev) => {
        const nextState = {
          ...prev,
          [instantAnswer.id]: instantAnswer.value,
        };

        if (
          instantAnswer.id === "intended_major" &&
          instantAnswer.value === "Undecided"
        ) {
          delete nextState.major_confidence;
        }

        return nextState;
      });
    }

    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
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
    return <h1 style={{ padding: 40 }}>Loading survey…</h1>;
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
              <div className="welcome-page">
                <div
                  className="welcome-bg"
                  style={{ backgroundImage: `url(${bgImage})` }}
                />

                <div className="welcome-content">
                  <h1 className="welcome-title">Let’s get started.</h1>

                  <p className="welcome-text">
                    We’re excited to help guide your college journey.
                  </p>

                  <button className="welcome-btn" onClick={next}>
                    Continue
                  </button>
                </div>
              </div>
            ) : question?.type === "results" ? (
              <div className="question-page">
                <h1 className="question-title">Survey complete.</h1>
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