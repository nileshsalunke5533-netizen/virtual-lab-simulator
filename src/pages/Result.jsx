
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAttempt } from "../context/attempt.js";
import usePersistAttempt from "../hooks/usePersistAttempt";
import "./Result.css";

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeAttempt } = useAttempt();

  const resultData = useMemo(() => {
    if (location.state) return location.state;
    const saved = localStorage.getItem("assignmentResult");
    if (!saved) return {};
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Unable to load result:", error);
      return {};
    }
  }, [location.state]);

  const [showAnswers, setShowAnswers] = useState(false);

  const {
    subjectCode: resultSubjectCode,
    experimentNo: resultExperimentNo,
    experimentName = "Experiment",
    experimentRoute = "/dashboard",
    quizScore = 0,
    quizTotal = 20,
    quizQuestions = [],
    quizAnswers = [],
  } = resultData;
  const subjectCode = resultSubjectCode || activeAttempt?.subjectCode;
  const experimentNo = resultExperimentNo ?? activeAttempt?.experimentNo;
  const completionPayload = useMemo(
    () => ({
      ...resultData,
      score: Number(quizScore),
      maxScore: Number(quizTotal),
    }),
    [resultData, quizScore, quizTotal]
  );
  const persistenceError = usePersistAttempt(
    subjectCode,
    experimentNo,
    completionPayload
  );

  // Convert IFS/DST answers into one common format
  const answers = quizQuestions.map((question, index) => {
    const selected =
      quizAnswers[index] ??
      quizAnswers[index]?.selectedAnswer ??
      null;

    const correct = question.correct ?? question.correctAnswer;

    const isCorrect =
      selected !== null &&
      selected !== undefined &&
      selected !== "" &&
      (typeof selected === "number" &&
      typeof correct === "number"
        ? selected === correct
        : String(selected).trim().toLowerCase() ===
          String(correct).trim().toLowerCase());

    return {
      questionNo: index + 1,
      questionText:
        question.q ?? question.questionText ?? question.question ?? "",
      options: question.options ?? [],
      selectedAnswer: selected,
      correctAnswer: correct,
      isCorrect,
    };
  });

  // Also support answers returned by a future backend API
  const backendAnswers = resultData.answers || [];

  const finalAnswers =
    backendAnswers.length > 0
      ? backendAnswers.map((item, index) => ({
          questionNo: item.questionNo ?? index + 1,
          questionText: item.questionText ?? "",
          options: item.options ?? [],
          selectedAnswer: item.selectedAnswer ?? null,
          correctAnswer: item.correctAnswer ?? "",
          isCorrect: Boolean(item.isCorrect),
        }))
      : answers;

  const correctCount =
    resultData.correctCount ??
    finalAnswers.filter((answer) => answer.isCorrect).length;

  const incorrectCount =
    resultData.incorrectCount ??
    Math.max(0, quizTotal - correctCount);

  const formatAnswer = (answer, options = []) => {
    if (answer === null || answer === undefined || answer === "") {
      return "Not Answered";
    }

    if (typeof answer === "number" && options[answer] !== undefined) {
      return `${String.fromCharCode(65 + answer)}. ${options[answer]}`;
    }

    return String(answer);
  };

  const formatCorrectAnswer = (answer, options = []) => {
    if (typeof answer === "number" && options[answer] !== undefined) {
      return `${String.fromCharCode(65 + answer)}. ${options[answer]}`;
    }

    return answer === null || answer === undefined || answer === ""
      ? "Not available"
      : String(answer);
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleRetry = () => {
    navigate(experimentRoute);
  };

  const handleViewAnswers = () => {
    setShowAnswers((previous) => !previous);
  };

  return (
    <div className="result-page">
      <div className="result-card">
        <div className="success-icon">✔</div>

        <h1>Experiment Completed</h1>

        <p>Your assignment has been submitted</p>
        {persistenceError && (
          <p role="alert">
            Your result is shown, but the attempt could not be saved: {persistenceError}
          </p>
        )}

        <h2>
          {subjectCode} - Experiment {experimentNo}
        </h2>

        <h3>{experimentName}</h3>

        {/* SCORE */}
        <div className="score-box">
          <div className="score-main">
            <span className="score-label">Score</span>
            <strong>
              {quizScore} / {quizTotal}
            </strong>
          </div>

          <div className="score-details">
            <div className="score-item correct">
              <span>Correct</span>
              <b>{correctCount}</b>
            </div>

            <div className="score-item incorrect">
              <span>Incorrect</span>
              <b>{incorrectCount}</b>
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        <div className="result-msg">
          <h5>
            Your experiment assignment has been submitted successfully.
          </h5>
        </div>

        {/* BUTTONS */}
        <div className="result-buttons">
          <button
            type="button"
            className="dashboard-btn"
            onClick={handleDashboard}
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            className="retry-btn"
            onClick={handleRetry}
          >
            Try Again
          </button>
        </div>

        {/* VIEW ANSWERS */}
        <button
          type="button"
          className="view-answers-btn"
          onClick={handleViewAnswers}
          aria-expanded={showAnswers}
        >
          {showAnswers ? "Hide Answers ▲" : "View Answers ▼"}
        </button>

        {/* ANSWERS */}
        {showAnswers && (
          <div className="answers-section">
            <h4>Assignment Answers</h4>

            {finalAnswers.length === 0 ? (
              <p className="no-answers">
                Answer details are not available.
              </p>
            ) : (
              <div className="answers-list">
                {finalAnswers.map((answer, index) => (
                  <div
                    key={answer.questionNo ?? index}
                    className={`answer-item ${
                      answer.isCorrect
                        ? "answer-item-correct"
                        : "answer-item-wrong"
                    }`}
                  >
                    <div className="answer-top">
                      <span className="answer-number">
                        Q{answer.questionNo}
                      </span>

                      <span
                        className={`answer-status ${
                          answer.isCorrect
                            ? "status-correct"
                            : "status-wrong"
                        }`}
                      >
                        {answer.isCorrect
                          ? "✔ Correct"
                          : "✕ Incorrect"}
                      </span>
                    </div>

                    <p className="answer-question">
                      {answer.questionText}
                    </p>

                    <div className="answer-values">
                      <div>
                        <span>Your Answer</span>
                        <b>
                          {formatAnswer(
                            answer.selectedAnswer,
                            answer.options
                          )}
                        </b>
                      </div>

                      <div>
                        <span>Correct Answer</span>
                        <b>
                          {formatCorrectAnswer(
                            answer.correctAnswer,
                            answer.options
                          )}
                        </b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
