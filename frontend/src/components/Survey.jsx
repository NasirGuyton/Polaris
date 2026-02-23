import { useState } from "react";
import questions from "../data/questions";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";

function Survey() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({});

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <div className="survey-container">
      <ProgressBar
        current={currentIndex}
        total={questions.length - 1} // exclude results step
      />

      {currentQuestion.type === "welcome" ? (
        <div className="welcome-screen">
          <h2>{currentQuestion.title}</h2>
          <p>{currentQuestion.description}</p>
          <button onClick={handleNext}>{currentQuestion.buttonText}</button>
        </div>
      ) : currentQuestion.type === "results" ? (
        <div className="results-screen">
          <h2>Survey Complete!</h2>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </div>
      ) : (
        <QuestionCard
          question={currentQuestion}
          onNext={handleNext}
          onChange={handleChange}
          formData={formData}
        />
      )}
    </div>
  );
}

export default Survey;