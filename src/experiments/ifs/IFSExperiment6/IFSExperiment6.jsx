import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { buildIfsResult } from "../../../utils/ifsResult.js";
import "./IFSExperiment6.css";

/* =========================================================
   CAESAR CIPHER LOGIC
========================================================= */

function shiftChar(ch, shift) {
  const code = ch.charCodeAt(0);

  if (code >= 65 && code <= 90) {
    return String.fromCharCode(
      ((code - 65 + shift) % 26 + 26) % 26 + 65
    );
  }

  if (code >= 97 && code <= 122) {
    return String.fromCharCode(
      ((code - 97 + shift) % 26 + 26) % 26 + 97
    );
  }

  return ch;
}

function encryptWord(word, shift) {
  return word
    .split("")
    .map((ch) =>
      ch === " " ? " " : shiftChar(ch, shift)
    )
    .join("");
}

function decryptWord(word, shift) {
  return word
    .split("")
    .map((ch) =>
      ch === " " ? " " : shiftChar(ch, -shift)
    )
    .join("");
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/* =========================================================
   20 QUESTIONS
========================================================= */

const QUIZ = [
  {
    q: "What is the main principle of the Caesar Cipher?",
    options: [
      "Reversing the entire message",
      "Shifting each letter by a fixed number of positions",
      "Replacing letters with random characters",
      "Converting letters into binary",
    ],
    correct: 1,
  },
  {
    q: "In Caesar Cipher, what is the shift key?",
    options: [
      "The number of characters in the plaintext",
      "The number of positions by which letters are shifted",
      "The number of words in the message",
      "The number of possible ciphertexts",
    ],
    correct: 1,
  },
  {
    q: "What is plaintext?",
    options: [
      "The encrypted message",
      "The key used for encryption",
      "The original readable message",
      "The result of decryption",
    ],
    correct: 2,
  },
  {
    q: "How many unique shifts are normally possible for the English alphabet?",
    options: ["24", "25", "26", "52"],
    correct: 2,
  },
  {
    q: "What is the ciphertext of M using a shift key of 3?",
    options: ["O", "P", "Q", "R"],
    correct: 1,
  },
  {
    q: "What is the encrypted form of NETWORK using a shift key of 4?",
    options: ["RIXASVO", "RIXASOG", "QHWSZNG", "VIXASVO"],
    correct: 0,
  },
  {
    q: "What is the ciphertext of SECURE using a shift key of 2?",
    options: ["UGEWTG", "UGEWTC", "TGEWTG", "VHFVUH"],
    correct: 0,
  },
  {
    q: "What happens when Y is encrypted using a shift key of 4?",
    options: ["B", "D", "C", "E"],
    correct: 2,
  },
  {
    q: "Which operation is performed during Caesar Cipher decryption?",
    options: [
      "Shift letters forward by the key",
      "Shift letters backward by the key",
      "Reverse the complete message",
      "Randomly replace letters",
    ],
    correct: 1,
  },
  {
    q: "If the ciphertext is FRGH and the key is 3, what is the plaintext?",
    options: ["CODE", "DATA", "FILE", "USER"],
    correct: 0,
  },
  {
    q: "A student receives the ciphertext DWWDFN with key 3. What is the original message?",
    options: ["ATTACK", "ATTEND", "DEFEND", "ACCESS"],
    correct: 0,
  },
  {
    q: "If X was produced by encrypting a letter using key 3, which letter was the original?",
    options: ["U", "V", "W", "Y"],
    correct: 0,
  },
  {
    q: "A student wants to send the message MEET AT 5 using Caesar Cipher with key 2. What should happen to the number 5?",
    options: [
      "It should also be shifted",
      "It should be removed",
      "It should remain unchanged",
      "It should be converted to a letter",
    ],
    correct: 2,
  },
  {
    q: "A student encrypts XYZ using key 3. What is the result?",
    options: ["ABC", "YZA", "ZAB", "BCD"],
    correct: 0,
  },
  {
    q: "A student enters DATA PACKET! with key 3. Which output is correct?",
    options: [
      "GDWD SDFNHW!",
      "GDWD RDFNHW!",
      "FCVC SDFKHW!",
      "GDVE SDFNHW!",
    ],
    correct: 0,
  },
  {
    q: "A student uses key 5 to encrypt a message but gets an incorrect result. The student discovers that the program shifts letters but also changes spaces into letters. What is the problem?",
    options: [
      "The key is too large",
      "Spaces should be preserved",
      "The alphabet contains only 20 letters",
      "Decryption should be performed first",
    ],
    correct: 1,
  },
  {
    q: "Why is Caesar Cipher vulnerable to a brute-force attack?",
    options: [
      "It uses no alphabet",
      "It has a small number of possible keys",
      "It changes the key for every letter",
      "It uses very long keys",
    ],
    correct: 1,
  },
  {
    q: "An attacker intercepts the ciphertext FRGH but does not know the key. What is a simple brute-force approach?",
    options: [
      "Try all possible shift keys",
      "Delete the ciphertext",
      "Replace every letter with Z",
      "Reverse the computer's memory",
    ],
    correct: 0,
  },
  {
    q: "In a Caesar Cipher brute-force attack, what would the attacker examine?",
    options: [
      "Only key 1",
      "Only key 13",
      "All possible shift keys",
      "Only the original plaintext",
    ],
    correct: 2,
  },
  {
    q: "A company uses Caesar Cipher to protect highly sensitive information. Which statement is most appropriate?",
    options: [
      "Caesar Cipher provides strong modern security",
      "Caesar Cipher is secure if the message is long",
      "Caesar Cipher is weak because its small key space makes brute-force attacks easy",
      "Caesar Cipher cannot be decrypted without the original computer",
    ],
    correct: 2,
  },
];

/* =========================================================
   DEFAULT PREVIEW
========================================================= */

function DefaultPreview() {
  const shift = 3;

  return (
    <div className="default-preview">

      <div className="default-example">

        <div className="example-row">
          <span className="example-label">
            Plain Text
          </span>

          <span className="example-value">
            HELLO
          </span>
        </div>

        <div className="example-row">
          <span className="example-label">
            Shift Key
          </span>

          <span className="example-value">
            3
          </span>
        </div>

      </div>

      <div className="alphabet-title">
        Caesar Cipher Mapping
      </div>

      <div className="alphabet-scroll">

        <div className="mapping-board">

          <div className="mapping-row">

            {ALPHABET.map((letter) => (
              <div
                key={letter}
                className="map-box box-preview"
              >
                {letter}
              </div>
            ))}

          </div>

          <div className="mapping-row">

            {ALPHABET.map((letter) => (
              <div
                key={letter}
                className="map-arrow-cell"
              >
                <span className="arrow-glyph">
                  ↓
                </span>
              </div>
            ))}

          </div>

          <div className="mapping-row">

            {ALPHABET.map((letter) => (
              <div
                key={letter}
                className="map-box box-encrypted"
              >
                {shiftChar(letter, shift)}
              </div>
            ))}

          </div>

        </div>

      </div>

      <div className="default-word-preview">

        <span>Example:</span>

        <b>HELLO</b>

        <span>→</span>

        <b>KHOOR</b>

      </div>

    </div>
  );
}

/* =========================================================
   WORD SIMULATION
========================================================= */

function WordSimulation({
  sourceWord,
  mode,
  userAnswer,
  setUserAnswer,
  resultState,
  onCheck,
  onTryAgain,
  onStartDecrypt,
  onNewWord,
}) {

  const source = sourceWord.toUpperCase();

  const handleLetterChange = (index, value) => {

    const letter = value
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(-1);

    const answerArray = source
      .split("")
      .map((_, i) => userAnswer[i] || "");

    answerArray[index] = letter;

    setUserAnswer(answerArray.join(""));

    if (letter) {

      const nextInput =
        document.querySelector(
          `.letter-answer-input[data-index="${index + 1}"]`
        );

      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  return (
    <div className="word-simulation">

      <div className="simulation-mode">

        {mode === "encrypt"
          ? "🔒 Encryption"
          : "🔓 Decryption"}

      </div>

      <div className="word-row">

        <div className="word-row-label">

          {mode === "encrypt"
            ? "Plain Text"
            : "Encrypted Text"}

        </div>

        <div className="letter-box-row">

          {source.split("").map((letter, index) => (

            <div
              className="letter-column"
              key={index}
            >

              <div className="map-box source-box">
                {letter}
              </div>

            </div>

          ))}

        </div>

      </div>

      <div className="word-arrow">
        ↓
      </div>

      <div className="word-row">

        <div className="word-row-label">

          {mode === "encrypt"
            ? "Encrypted"
            : "Decrypted"}

        </div>

        <div className="letter-box-row answer-letter-row">

          {source.split("").map((letter, index) => {

            const answerLetter =
              userAnswer[index] || "";

            return (
              <div
                className="letter-column"
                key={index}
              >

                <input
                  type="text"
                  maxLength={1}
                  data-index={index}
                  className={`letter-answer-input ${
                    resultState === "correct"
                      ? "answer-correct"
                      : resultState === "wrong"
                      ? "answer-wrong"
                      : ""
                  }`}
                  value={answerLetter}
                  disabled={
                    resultState === "correct"
                  }
                  onChange={(e) =>
                    handleLetterChange(
                      index,
                      e.target.value
                    )
                  }
                />

              </div>
            );

          })}

        </div>

      </div>

      <div className="canvas-actions">

        {!resultState && (

          <button
            className="canvas-btn check-btn"
            onClick={onCheck}
          >
            ✓ Check{" "}
            {mode === "encrypt"
              ? "Encryption"
              : "Decryption"}
          </button>

        )}

        {resultState === "wrong" && (

          <button
            className="canvas-btn retry-btn"
            onClick={onTryAgain}
          >
            ↻ Try Again
          </button>

        )}

        {resultState === "correct" &&
          mode === "encrypt" && (

            <button
              className="canvas-btn decrypt-btn"
              onClick={onStartDecrypt}
            >
              🔓 Start Decryption
            </button>

          )}

        {resultState === "correct" &&
          mode === "decrypt" && (

            <button
              className="canvas-btn new-word-btn"
              onClick={onNewWord}
            >
              ＋ New Word
            </button>

          )}

      </div>

    </div>
  );
}

/* =========================================================
   ASSIGNMENT SCREEN
========================================================= */

function AssignmentScreen({
  answers,
  setAnswers,
}) {

  const selectAnswer = (
    qIndex,
    optionIndex
  ) => {

    setAnswers((prev) =>
      prev.map((value, index) =>
        index === qIndex
          ? optionIndex
          : value
      )
    );

  };

  return (
    <section className="card quiz-card">

      <div className="quiz-header">

        <div>

          <h3 className="panel-heading">
            Assignment — 20 Questions
          </h3>

          <p className="input-hint">
            Answer all questions based on the
            Caesar Cipher simulation.
          </p>

        </div>

        <div className="quiz-count">

          {answers.filter(
            (a) => a !== null
          ).length}

          /20 Answered

        </div>

      </div>

      <div className="quiz-list">

        {QUIZ.map((item, qIndex) => (

          <div
            key={qIndex}
            className="quiz-question"
          >

            <p className="quiz-question-text">

              <b>Q{qIndex + 1}.</b>{" "}

              {item.q}

            </p>

            <div className="quiz-options">

              {item.options.map(
                (option, optionIndex) => {

                  let optionClass =
                    "quiz-option";

                  if (
                    answers[qIndex] ===
                    optionIndex
                  ) {

                    optionClass +=
                      " quiz-selected";

                  }

                  return (
                    <button
                      type="button"
                      key={optionIndex}
                      className={optionClass}
                      onClick={() =>
                        selectAnswer(
                          qIndex,
                          optionIndex
                        )
                      }
                    >

                      <span className="option-letter">

                        {String.fromCharCode(
                          65 + optionIndex
                        )}

                      </span>

                      <span>
                        {option}
                      </span>

                    </button>
                  );

                }
              )}

            </div>

          </div>

        ))}

      </div>

      <div className="assignment-note">

        <span>ℹ</span>

        <p>

          Select an answer for all 20 questions.
          Your assignment score will be calculated
          automatically when you submit the experiment.

        </p>

      </div>

    </section>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CaesarCipherExperiment() {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState("simulation");

  const [theoryOpen, setTheoryOpen] =
    useState(false);

  const [procOpen, setProcOpen] =
    useState(false);

  const [helpOpen, setHelpOpen] =
    useState(false);

  /* =====================================================
     INPUT
  ===================================================== */

  const [plainText, setPlainText] =
    useState("");

  const [shift, setShift] =
    useState(3);

  /* =====================================================
     SIMULATION
  ===================================================== */

  const [mode, setMode] =
    useState(null);

  const [userAnswer, setUserAnswer] =
    useState("");

  const [resultState, setResultState] =
    useState(null);

  const [expectedResult, setExpectedResult] =
    useState("");

  const [currentWord, setCurrentWord] =
    useState("");

  const [cipherText, setCipherText] =
    useState("");

  const [decryptResult, setDecryptResult] =
    useState("");

  /* =====================================================
     ATTEMPTS
  ===================================================== */

  const [successfulAttempts, setSuccessfulAttempts] =
    useState(0);

  const [observations, setObservations] =
    useState([]);

  /* =====================================================
     ASSIGNMENT
  ===================================================== */

  const [answers, setAnswers] =
    useState(
      Array(QUIZ.length).fill(null)
    );

  const [submitted, setSubmitted] =
    useState(false);

  /* =====================================================
     TESTING MODE
  ===================================================== */

  const TESTING_MODE = true;

  const simulationCompleted =
    TESTING_MODE ||
    successfulAttempts >= 10;

  /* =========================================================
     VALIDATE INPUT
  ========================================================= */

  const validateInput = () => {

    const word = plainText.trim();

    if (!word) return false;

    if (word.length > 20) return false;

    if (!/^[A-Za-z ]+$/.test(word)) {
      return false;
    }

    if (shift < 1 || shift > 25) {
      return false;
    }

    return true;
  };

  /* =========================================================
     START ENCRYPTION
  ========================================================= */

  const handleStartEncrypt = () => {

    if (!validateInput()) {

      alert(
        "Please enter valid text and shift key."
      );

      return;
    }

    const word =
      plainText.trim().toUpperCase();

    setCurrentWord(word);

    setMode("encrypt");

    setUserAnswer("");

    setExpectedResult("");

    setResultState(null);

    setCipherText("");

    setDecryptResult("");
  };

  /* =========================================================
     CHECK ANSWER
  ========================================================= */

  const handleCheck = () => {

    if (!userAnswer.trim()) {

      alert(
        "Please enter your answer."
      );

      return;
    }

    const source = currentWord;

    const expected =
      mode === "encrypt"
        ? encryptWord(
            source,
            shift
          ).toUpperCase()
        : decryptWord(
            source,
            shift
          ).toUpperCase();

    const actual =
      userAnswer
        .trim()
        .toUpperCase();

    const isCorrect =
      actual === expected;

    setObservations((prev) => [
      ...prev,
      {
        attempt: prev.length + 1,

        operation:
          mode === "encrypt"
            ? "Encryption"
            : "Decryption",

        input: source,

        userAnswer: actual,

        expected,

        status: isCorrect
          ? "Correct"
          : "Wrong",
      },
    ]);

    if (isCorrect) {

      setResultState("correct");

      setExpectedResult(expected);

      setSuccessfulAttempts((prev) =>
        Math.min(prev + 1, 10)
      );

      if (mode === "encrypt") {

        setCipherText(expected);

      } else {

        setDecryptResult(expected);

      }

    } else {

      setResultState("wrong");

      setExpectedResult(expected);

    }
  };

  /* =========================================================
     TRY AGAIN
  ========================================================= */

  const handleTryAgain = () => {

    setUserAnswer("");

    setResultState(null);

    setExpectedResult("");

  };

  /* =========================================================
     START DECRYPTION
  ========================================================= */

  const handleStartDecrypt = () => {

    if (!cipherText) return;

    setCurrentWord(cipherText);

    setMode("decrypt");

    setUserAnswer("");

    setExpectedResult("");

    setResultState(null);

  };

  /* =========================================================
     NEW WORD
  ========================================================= */

  const handleNewWord = () => {

    setMode(null);

    setCurrentWord("");

    setUserAnswer("");

    setExpectedResult("");

    setResultState(null);

    setCipherText("");

    setDecryptResult("");

    setPlainText("");

  };

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset = () => {

    setPlainText("");

    setShift(3);

    setMode(null);

    setCurrentWord("");

    setUserAnswer("");

    setExpectedResult("");

    setResultState(null);

    setCipherText("");

    setDecryptResult("");

    setSuccessfulAttempts(0);

    setObservations([]);

    setActiveTab("simulation");

    setAnswers(
      Array(QUIZ.length).fill(null)
    );

    setSubmitted(false);

  };

  /* =========================================================
     FINAL SUBMIT
     RESULT PAGE INTEGRATION
  ========================================================= */

  const handleSubmit = () => {

    /* =====================================================
       CHECK ALL 20 QUESTIONS
    ===================================================== */

    const unanswered =
      answers.some(
        (answer) => answer === null
      );

    if (unanswered) {

      alert(
        "Please answer all 20 questions before submitting the experiment."
      );

      setActiveTab("assignment");

      return;
    }

    /* =====================================================
       PREVENT DOUBLE SUBMIT
    ===================================================== */

    if (submitted) return;

    /* =====================================================
       CALCULATE QUIZ SCORE
    ===================================================== */

    const quizScore =
      answers.reduce(
        (total, answer, index) =>
          total +
          (
            answer ===
            QUIZ[index].correct
              ? 1
              : 0
          ),
        0
      );

    const correctCount =
      quizScore;

    const incorrectCount =
      QUIZ.length - quizScore;

    /* =====================================================
       COMPLETE RESULT OBJECT
    ===================================================== */

    const resultData = buildIfsResult({

      completed: true,

      experimentNo: 6,

      experimentName:
        "Encrypt and Decrypt the Message using Caesar Cipher with Variable Key",

      experimentRoute:
        "/ifs-experiment-6",

      /* Simulation */

      successfulAttempts:
        successfulAttempts,

      totalRequiredAttempts:
        10,

      simulationCompleted:
        simulationCompleted,

      observations:
        observations,

      /* Assignment */

      quizScore:
        quizScore,

      quizTotal:
        QUIZ.length,

      correctCount:
        correctCount,

      incorrectCount:
        incorrectCount,

      quizAnswers:
        answers,

      quizQuestions:
        QUIZ,

      /* Date */

      date:
        new Date().toISOString(),
    });

    /* =====================================================
       SAVE RESULT IN LOCAL STORAGE
    ===================================================== */

    try {

      localStorage.setItem(
        "caesarCipherExp6Status",
        JSON.stringify(resultData)
      );

      localStorage.setItem("assignmentResult", JSON.stringify(resultData));

    } catch (error) {

      console.error(
        "Error saving Caesar Cipher result:",
        error
      );

    }

    /* =====================================================
       MARK AS SUBMITTED
    ===================================================== */

    setSubmitted(true);

    /* =====================================================
       NAVIGATE TO COMMON RESULT PAGE
    ===================================================== */

    navigate(
      "/result",
      {
        state: resultData,
      }
    );

  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="Caesar-root">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="exp-header">

        <button
          className="btn-back"
          onClick={() =>
            navigate("/ifs-experiments")
          }
        >
          ← Back
        </button>

        <h1 className="exp-title">
          Experiment 6: Caesar Cipher
          Encryption & Decryption
        </h1>

        <button
          className="btn-help"
          onClick={() =>
            setHelpOpen(true)
          }
        >
          ? Help
        </button>

      </header>

      {/* =====================================================
          AIM
      ===================================================== */}

      <section className="card">

        <h2 className="section-heading orange">
          Aim
        </h2>

        <p>
          To encrypt and decrypt a message using
          the Caesar Cipher technique with a
          variable shift key, and study basic
          cryptographic substitution.
        </p>

      </section>

      {/* =====================================================
          THEORY
      ===================================================== */}

      <section className="card">

        <div
          className="collapsible-header"
          onClick={() =>
            setTheoryOpen((v) => !v)
          }
        >

          <h2 className="section-heading orange">
            Theory
          </h2>

          <span className="chevron">
            {theoryOpen
              ? "▲"
              : "▼"}
          </span>

        </div>

        {theoryOpen && (

          <div className="collapsible-body">

            <p>
              Caesar Cipher is a substitution
              cipher in which every alphabet is
              shifted by a fixed number of positions.
            </p>

            <p>
              Encryption:
              <b>
                {" "}C = (P + K) mod 26
              </b>
            </p>

            <p>
              Decryption:
              <b>
                {" "}P = (C − K) mod 26
              </b>
            </p>

          </div>

        )}

      </section>

      {/* =====================================================
          PROCEDURE
      ===================================================== */}

      <section className="card">

        <div
          className="collapsible-header"
          onClick={() =>
            setProcOpen((v) => !v)
          }
        >

          <h2 className="section-heading orange">
            Procedure
          </h2>

          <span className="chevron">
            {procOpen
              ? "▲"
              : "▼"}
          </span>

        </div>

        {procOpen && (

          <div className="collapsible-body proc-grid">

            <ol className="proc-col">

              <li>
                Enter plaintext and select shift key.
              </li>

              <li>
                Start the encryption simulation.
              </li>

              <li>
                Enter the encrypted letters.
              </li>

              <li>
                Verify the encryption.
              </li>

              <li>
                Perform decryption.
              </li>

            </ol>

            <ol
              className="proc-col"
              start="6"
            >

              <li>
                Complete 10 successful operations.
              </li>

              <li>
                Open the Assignment tab.
              </li>

              <li>
                Answer all 20 questions.
              </li>

              <li>
                Submit the experiment.
              </li>

              <li>
                View the result and answers.
              </li>

            </ol>

          </div>

        )}

      </section>

      {/* =====================================================
          TWO TABS
      ===================================================== */}

      <div className="experiment-tabs">

        <button
          type="button"
          className={`experiment-tab ${
            activeTab === "simulation"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("simulation")
          }
        >

          🧪 Simulation

          {simulationCompleted && (

            <span className="tab-check">
              ✓
            </span>

          )}

        </button>

        <button
          type="button"
          className={`experiment-tab ${
            activeTab === "assignment"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab("assignment")
          }
        >

          📝 Assignment

        </button>

      </div>

      {/* =====================================================
          SIMULATION TAB
      ===================================================== */}

      {activeTab === "simulation" && (

        <>

          <div className="sim-row">

            {/* =================================================
                INPUT
            ================================================= */}

            <aside className="card inputs-panel">

              <h3 className="panel-heading">
                Inputs
              </h3>

              <label className="field-label">
                Plain Text
              </label>

              <input
                type="text"
                className="text-input"
                value={plainText}
                disabled={mode !== null}
                maxLength={20}
                placeholder="Enter word"
                onChange={(e) =>
                  setPlainText(
                    e.target.value
                  )
                }
              />

              <span className="char-count">
                {plainText.trim().length}/20
              </span>

              <label className="field-label shift-label">
                Shift Key (1–25)
              </label>

              <input
                type="range"
                min="1"
                max="25"
                value={shift}
                disabled={mode !== null}
                className="shift-slider"
                onChange={(e) =>
                  setShift(
                    Number(e.target.value)
                  )
                }
              />

              <div className="shift-value-row">

                <input
                  type="number"
                  min="1"
                  max="25"
                  className="shift-number"
                  value={shift}
                  disabled={mode !== null}
                  onChange={(e) =>
                    setShift(
                      Number(e.target.value)
                    )
                  }
                />

              </div>

              <div className="action-buttons">

                {!mode && (

                  <button
                    className="btn-verify full-width"
                    onClick={
                      handleStartEncrypt
                    }
                  >
                    🔒 Start Encryption
                  </button>

                )}

                <button
                  className="btn-reset full-width"
                  onClick={handleReset}
                >
                  ↺ Reset
                </button>

              </div>

            </aside>

            {/* =================================================
                CANVAS
            ================================================= */}

            <div className="card canvas-panel">

              <h3 className="panel-heading">
                Simulation Canvas
              </h3>

              <div className="canvas-area">

                {!mode && (
                  <DefaultPreview />
                )}

                {mode && (

                  <WordSimulation
                    sourceWord={currentWord}
                    mode={mode}
                    userAnswer={userAnswer}
                    setUserAnswer={setUserAnswer}
                    resultState={resultState}
                    onCheck={handleCheck}
                    onTryAgain={
                      handleTryAgain
                    }
                    onStartDecrypt={
                      handleStartDecrypt
                    }
                    onNewWord={
                      handleNewWord
                    }
                  />

                )}

              </div>

            </div>

            {/* =================================================
                LIVE ANALYSIS
            ================================================= */}

            <aside className="card analysis-panel">

              <h3 className="panel-heading orange">
                Live Analysis
              </h3>

              <div className="analysis-block">

                <h4 className="analysis-sub">
                  Current Operation
                </h4>

                <table className="analysis-table">

                  <tbody>

                    <tr>
                      <td>Operation</td>
                      <td>:</td>
                      <td>

                        {mode === "encrypt"
                          ? "Encryption"
                          : mode === "decrypt"
                          ? "Decryption"
                          : "—"}

                      </td>
                    </tr>

                    <tr>
                      <td>Input Word</td>
                      <td>:</td>
                      <td>
                        {currentWord || "—"}
                      </td>
                    </tr>

                    <tr>
                      <td>Shift Applied</td>
                      <td>:</td>
                      <td>

                        {mode
                          ? mode === "encrypt"
                            ? `+${shift}`
                            : `-${shift}`
                          : "—"}

                      </td>
                    </tr>

                    <tr>
                      <td>Status</td>
                      <td>:</td>
                      <td>

                        {!resultState && mode
                          ? "Waiting for answer"
                          : resultState ===
                            "correct"
                          ? "✔ Correct"
                          : resultState ===
                            "wrong"
                          ? "✕ Wrong"
                          : "—"}

                      </td>
                    </tr>

                  </tbody>

                </table>

              </div>

              {/* WRONG RESULT */}

              {resultState === "wrong" && (

                <div className="analysis-block wrong-analysis">

                  <h4 className="analysis-sub">
                    Wrong Answer
                  </h4>

                  <div className="wrong-row">

                    <span>
                      Your Answer
                    </span>

                    <b>
                      {userAnswer.toUpperCase()}
                    </b>

                  </div>

                  <div className="wrong-row">

                    <span>
                      Expected Result
                    </span>

                    <b>
                      {expectedResult}
                    </b>

                  </div>

                  <div className="wrong-message">

                    ✕ Answer is incorrect.
                    Try again.

                  </div>

                </div>

              )}

              {/* CORRECT RESULT */}

              {resultState === "correct" && (

                <div className="analysis-block correct-analysis">

                  <h4 className="analysis-sub">
                    Result
                  </h4>

                  <div className="correct-result">

                    <span>
                      Your Answer
                    </span>

                    <b>
                      {userAnswer.toUpperCase()}
                    </b>

                  </div>

                  <p className="verified-badge">
                    ✔ Correct Answer
                  </p>

                </div>

              )}

            </aside>

          </div>

          {/* =================================================
              OBSERVATION TABLE
          ================================================= */}

          <section className="card table-section">

            <h3 className="panel-heading orange">
              Observation Table
            </h3>

            <div className="table-scroll">

              <table className="obs-table">

                <thead>

                  <tr>
                    <th>Sr. No.</th>
                    <th>Operation</th>
                    <th>Input Word</th>
                    <th>User Answer</th>
                    <th>Expected Result</th>
                    <th>Status</th>
                  </tr>

                </thead>

                <tbody>

                  {observations.length === 0 ? (

                    <tr>

                      <td colSpan="6">
                        No attempts performed yet.
                      </td>

                    </tr>

                  ) : (

                    observations.map(
                      (row, index) => (

                        <tr
                          key={index}
                          className={
                            row.status ===
                            "Correct"
                              ? "row-correct"
                              : "row-wrong"
                          }
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {row.operation}
                          </td>

                          <td>
                            {row.input}
                          </td>

                          <td>
                            {row.userAnswer}
                          </td>

                          <td>
                            {row.expected}
                          </td>

                          <td>

                            {row.status ===
                            "Correct"
                              ? "✔ Correct"
                              : "✕ Wrong"}

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </section>

          {/* =================================================
              SIMULATION STATUS
          ================================================= */}

          <section className="simulation-progress-card">

            <div>

              <h3>
                Simulation Progress
              </h3>

              <p>

                Successful Operations:

                <b>
                  {" "}
                  {successfulAttempts}/10
                </b>

              </p>

            </div>

            <div
              className={`progress-badge ${
                simulationCompleted
                  ? "completed"
                  : ""
              }`}
            >

              {TESTING_MODE
                ? "🧪 Testing Mode"
                : simulationCompleted
                ? "✓ Simulation Completed"
                : `${10 - successfulAttempts} more required`}

            </div>

          </section>

        </>

      )}

      {/* =====================================================
          ASSIGNMENT TAB
      ===================================================== */}

      {activeTab === "assignment" && (

        <AssignmentScreen
          answers={answers}
          setAnswers={setAnswers}
        />

      )}

      {/* =====================================================
          FINAL SUBMIT
      ===================================================== */}

      <section className="submit-section">

        <button
          className={`btn-submit ${
            !submitted
              ? "enabled"
              : "disabled"
          }`}
          disabled={submitted}
          onClick={handleSubmit}
        >

          {submitted
            ? "Submitted"
            : "Submit Experiment"}

        </button>

        <div className="submit-status">

          {submitted ? (

            <p className="submit-success">
              Experiment Submitted Successfully
            </p>

          ) : (

            <p>

              Answer all 20 assignment questions
              and then click

              <b>
                {" "}Submit Experiment{" "}
              </b>

              to view your result.

            </p>

          )}

        </div>

      </section>

      {/* =====================================================
          HELP POPUP
      ===================================================== */}

      {helpOpen && (

        <div
          className="popup-overlay"
          onClick={() =>
            setHelpOpen(false)
          }
        >

          <div
            className="popup-box help-popup"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h3 className="section-heading orange">
              How Caesar Cipher Works
            </h3>

            <p>
              Example: <b>HELLO</b> with
              Shift <b>3</b>.
            </p>

            <p>
              Every alphabet is shifted by
              the selected key.
            </p>

            <p>
              Example result:
              <b> KHOOR</b>
            </p>

            <button
              className="btn-verify full-width"
              onClick={() =>
                setHelpOpen(false)
              }
            >
              Got it
            </button>

          </div>

        </div>

      )}

    </div>
  );
}