import { useEffect, useMemo, useRef, useState } from "react";
import questions from "../data/questions";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import bgImage from "../assets/welcome-illustration.png";

const TRANSITION_MS = 320;

function Survey() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [stageClass, setStageClass] = useState("stage-enter");
  const [isAnimating, setIsAnimating] = useState(false);
  const firstRenderRef = useRef(true);

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
  }, [currentIndex, displayIndex]);

  const question = questions[displayIndex];

  const visibleSteps = useMemo(
    () => questions.filter((q) => q.type !== "welcome" && q.type !== "results"),
    []
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

    return value !== undefined && value !== null && String(value).trim() !== "";
  };

  const next = (instantAnswer = null) => {
    if (isAnimating) return;

    const dataToValidate = instantAnswer
      ? {
          ...formData,
          [instantAnswer.id]: instantAnswer.value,
        }
      : formData;

    if (!validateWithData(dataToValidate)) {
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
                  <div className="quote-mark">“</div>

                  <h1 className="welcome-title">Let’s get started.</h1>

                  <p className="welcome-text">
                    Congratulations on taking the first step! Our team at North
                    Star is excited to help you through your college admissions
                    journey.
                  </p>

                  <p className="welcome-text">
                    For the best results, we recommend students and parents fill
                    this out together. Please share as much detail as possible
                    to help us prepare.
                  </p>

                  <button className="welcome-btn" type="button" onClick={next}>
                    Continue
                  </button>
                </div>
              </div>
            ) : question?.type === "results" ? (
              <div className="question-page">
                <h1 className="question-title">Survey complete.</h1>
                <p className="question-subtitle">
                  Your responses are ready for review.
                </p>

                <pre className="results-block">
                  {JSON.stringify(formData, null, 2)}
                </pre>

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