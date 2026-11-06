import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { buildIfsResult } from "../../../utils/ifsResult.js";
import "./IFSExperiment5.css";

const RESULT_STORAGE_KEY = "transpositionCipherExp8Status";

/* =========================================================
   NOTE ON OBSERVATION HISTORY

   Observations are intentionally kept in React state only —
   NOT localStorage. This means the Observation Table clears
   automatically on page refresh, and on Reset, so one
   learner's progress never leaks into the next session on
   the same device. If a device-persistent "resume later"
   feature is ever wanted, that should be scoped per-user
   (e.g. keyed by student ID), not global like before.
========================================================= */

/* =========================================================
   CIPHER LOGIC
========================================================= */

function cleanText(text) {
  return text
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

/**
 * Letters + spaces only, uppercased. This is the exact
 * sequence that gets written into the matrix (before padding),
 * with spaces still present as " ". Used to derive the
 * unambiguous "recoverable" decrypt target.
 */
function getSourceWithSpaces(text) {
  return text
    .toUpperCase()
    .replace(/[^A-Z ]/g, "");
}

function buildMatrix(text, columns) {
  const source = getSourceWithSpaces(text);

  const rows = Math.max(
    1,
    Math.ceil(source.length / columns)
  );

  const matrix = [];

  for (let i = 0; i < rows; i++) {
    const row = [];

    for (let j = 0; j < columns; j++) {
      const index = i * columns + j;

      if (index < source.length) {
        row.push(
          source[index] === " "
            ? "_"
            : source[index]
        );
      } else {
        row.push("_");
      }
    }

    matrix.push(row);
  }

  return matrix;
}

/**
 * The characters a learner can actually and unambiguously
 * recover from the ciphertext during the decryption step:
 * every letter of the source, with spaces shown as "_".
 * Trailing padding cells are intentionally excluded, because
 * within the source there is no way to distinguish a padding
 * "_" from a space "_" — including padding here previously
 * created an unresolvable ambiguity for the learner.
 */
function getExpectedDecryptChars(text) {
  return getSourceWithSpaces(text)
    .split("")
    .map((ch) => (ch === " " ? "_" : ch));
}

function getKeywordOrder(keyword) {
  const letters = keyword
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("");

  return letters
    .map((letter, index) => ({
      letter,
      index,
    }))
    .sort((a, b) => {
      const byLetter =
        a.letter.localeCompare(b.letter);

      return byLetter !== 0
        ? byLetter
        : a.index - b.index;
    })
    .reduce(
      (rankMap, item, rank) => {
        rankMap[item.index] = rank + 1;
        return rankMap;
      },
      []
    );
}

function getReadColumnIndexes(keyword) {
  return getKeywordOrder(keyword)
    .map((rank, index) => ({
      rank,
      index,
    }))
    .sort((a, b) => a.rank - b.rank)
    .map((item) => item.index);
}

function getCipherText(matrix, keyword) {
  const columnIndexes =
    getReadColumnIndexes(keyword);

  let result = "";

  columnIndexes.forEach((colIndex) => {
    matrix.forEach((row) => {
      result += row[colIndex];
    });
  });

  return result;
}

function getStatusArray(entered, expected) {
  return expected.map((exp, index) => {
    const value = entered[index];

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "wrong";
    }

    return String(value).toUpperCase() ===
      String(exp).toUpperCase()
      ? "correct"
      : "wrong";
  });
}

/* =========================================================
   QUIZ
========================================================= */

const QUIZ = [
  {
    q: "What is the main principle of Simple Transposition Cipher?",
    options: [
      "Replacing letters with other letters",
      "Rearranging the positions of plaintext letters",
      "Converting letters to numbers",
      "Adding random characters",
    ],
    correct: 1,
  },
  {
    q: "In transposition cipher, what does the key represent?",
    options: [
      "The shift amount for each letter",
      "The order in which columns are read",
      "The alphabet to be used",
      "The number of encryption rounds",
    ],
    correct: 1,
  },
  {
    q: "If plaintext is arranged in a 3×4 matrix, how many cells are there?",
    options: ["7", "12", "15", "9"],
    correct: 1,
  },
  {
    q: "What is a permutation key like '3 1 4 2' used for?",
    options: [
      "To shift each letter",
      "To specify column reading order",
      "To add padding characters",
      "To reverse the message",
    ],
    correct: 1,
  },
  {
    q: "If plaintext is HELLO and columns=2, what is the matrix arrangement?",
    options: [
      "H E / L L / O X",
      "H L O / E L X",
      "HE / LL / OX",
      "HELLO X",
    ],
    correct: 0,
  },
  {
    q: "For the key '2 1 3', which column is read first?",
    options: [
      "Column 1",
      "Column 2",
      "Column 3",
      "All together",
    ],
    correct: 1,
  },
  {
    q: "What must be the relationship between plaintext length and number of columns?",
    options: [
      "Plaintext must be exactly divisible by columns",
      "Plaintext can be any length, padding added if needed",
      "Columns must equal plaintext length",
      "Plaintext must be longer than columns",
    ],
    correct: 1,
  },
  {
    q: "If you have 12 characters and need 3 columns, how many rows are needed?",
    options: ["3", "4", "6", "2"],
    correct: 1,
  },
  {
    q: "Why is transposition cipher secure?",
    options: [
      "It is very secure for all messages",
      "It is weak because letter frequency is preserved",
      "It only works with short messages",
      "It changes the alphabet order",
    ],
    correct: 1,
  },
  {
    q: "What is the first step in encryption using transposition?",
    options: [
      "Apply the permutation key",
      "Arrange plaintext into a matrix",
      "Count the columns",
      "Replace vowels",
    ],
    correct: 1,
  },
  {
    q: "How many possible permutations exist for a 4-column transposition?",
    options: ["4", "8", "16", "24"],
    correct: 3,
  },
  {
    q: "For decryption, what must you know?",
    options: [
      "Only the ciphertext",
      "The key and number of columns used",
      "The original sender's name",
      "The encryption alphabet",
    ],
    correct: 1,
  },
  {
    q: "If ciphertext is LLELOHX, what was likely the permutation key used?",
    options: [
      "1 2 3",
      "2 1 3",
      "3 2 1",
      "1 3 2",
    ],
    correct: 1,
  },
  {
    q: "What padding character is commonly used in transposition?",
    options: ["A", "X", "Z", "0"],
    correct: 1,
  },
  {
    q: "Can two different keys produce the same ciphertext?",
    options: [
      "Always yes",
      "Never",
      "Only with same plaintext",
      "Rarely, but possibly",
    ],
    correct: 3,
  },
  {
    q: "What is the output format of transposition cipher?",
    options: [
      "Numbers only",
      "A rearrangement of input letters",
      "Mixed letters and numbers",
      "Encrypted symbols",
    ],
    correct: 1,
  },
  {
    q: "In a columnar transposition, reading columns in order produces what?",
    options: [
      "The original plaintext",
      "The ciphertext",
      "A new plaintext",
      "Random characters",
    ],
    correct: 1,
  },
  {
    q: "How many steps are involved in simple transposition encryption?",
    options: ["2", "3", "5", "7"],
    correct: 2,
  },
  {
    q: "What is the purpose of the permutation key?",
    options: [
      "To replace letters",
      "To determine column reading sequence",
      "To count characters",
      "To add noise",
    ],
    correct: 1,
  },
  {
    q: "Which characteristic makes transposition vulnerable to frequency analysis?",
    options: [
      "It changes letter frequency",
      "It preserves letter frequency",
      "It removes vowels",
      "It doubles consonants",
    ],
    correct: 1,
  },
];

/* =========================================================
   DEFAULT PREVIEW
========================================================= */

const REFERENCE_KEYWORD = "NICK";
const REFERENCE_RANKS = [4, 2, 1, 3];

const REFERENCE_MATRIX = [
  ["K", "R", "I", "S"],
  ["H", "N", "A", "_"],
  ["R", "A", "N", "J"],
  ["A", "N", "_", "_"],
];

const REFERENCE_CIPHER =
  "IAN_RNANS_J_KHRA";

function DefaultPreview() {
  return (
    <div className="tc-preview-scroll">
      <div className="default-preview">

        <div className="default-example">

          <div className="example-row">
            <span className="example-label">
              Given Text
            </span>

            <span className="example-value">
              KRISHNA RANJAN
            </span>
          </div>

          <div className="example-row">
            <span className="example-label">
              Keyword
            </span>

            <span className="example-value">
              NICK
            </span>
          </div>

        </div>

        <div className="tc-static-block">

          <h4 className="tc-static-title">
            1. Write the message row-wise
          </h4>

          <p className="tc-static-theory">
            The plaintext is written in rows under
            the keyword's letters. The keyword length
            fixes the number of columns. Spare cells
            are filled with "_".
          </p>

        </div>

        <div className="tc-static-block">

          <h4 className="tc-static-title">
            2. Number the keyword alphabetically
          </h4>

          <p className="tc-static-theory">
            C = 1, I = 2, K = 3, N = 4.
          </p>

        </div>

        <div className="tc-ref-table-wrap">

          <div className="tc-ref-table">

            <div className="tc-ref-row">
              {REFERENCE_KEYWORD.split("").map(
                (letter, i) => (
                  <div
                    className="tc-ref-cell head"
                    key={i}
                  >
                    {letter}
                  </div>
                )
              )}
            </div>

            <div className="tc-ref-row">
              {REFERENCE_RANKS.map(
                (rank, i) => (
                  <div
                    className="tc-ref-cell rank"
                    key={i}
                  >
                    {rank}

                    <span className="tc-ref-arrow">
                      ↓
                    </span>
                  </div>
                )
              )}
            </div>

            {REFERENCE_MATRIX.map(
              (row, ri) => (
                <div
                  className="tc-ref-row"
                  key={ri}
                >
                  {row.map(
                    (ch, ci) => (
                      <div
                        className="tc-ref-cell data"
                        key={ci}
                      >
                        {ch}
                      </div>
                    )
                  )}
                </div>
              )
            )}

          </div>

        </div>

        <div className="tc-static-block">

          <h4 className="tc-static-title">
            3. Read columns in rank order
          </h4>

          <p className="tc-static-theory">
            Read columns according to their
            alphabetical ranks.
          </p>

        </div>

        <div className="default-word-preview">
          <span>Cipher Text:</span>
          <b>{REFERENCE_CIPHER}</b>
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   INPUT COMPONENTS
========================================================= */

function ManualMatrixInput({
  values,
  statuses,
  rows,
  columns,
  onChange,
  disabled,
}) {
  return (
    <div className="manual-matrix">

      {Array.from({ length: rows }).map(
        (_, rowIndex) => (

          <div
            className="manual-matrix-row"
            key={rowIndex}
          >

            {Array.from({
              length: columns,
            }).map(
              (_, colIndex) => {

                const index =
                  rowIndex * columns +
                  colIndex;

                const status =
                  statuses[index];

                return (
                  <input
                    key={index}
                    className={`manual-cell ${
                      status === "correct"
                        ? "answer-correct"
                        : status === "wrong"
                        ? "answer-wrong"
                        : ""
                    }`}
                    value={
                      values[index] || ""
                    }
                    disabled={disabled}
                    maxLength={1}
                    onChange={(e) =>
                      onChange(
                        index,
                        e.target.value
                          .toUpperCase()
                          .replace(
                            /[^A-Z_]/g,
                            ""
                          )
                      )
                    }
                  />
                );
              }
            )}

          </div>
        )
      )}

    </div>
  );
}

function ManualLineInput({
  values,
  statuses,
  expectedLength,
  onChange,
  disabled,
  allowUnderscore = false,
}) {
  return (
    <div className="manual-line cipher-manual-line">

      {Array.from({
        length: expectedLength,
      }).map(
        (_, index) => {

          const status =
            statuses[index];

          return (
            <input
              key={index}
              className={`manual-cell ${
                status === "correct"
                  ? "answer-correct"
                  : status === "wrong"
                  ? "answer-wrong"
                  : ""
              }`}
              value={
                values[index] || ""
              }
              disabled={disabled}
              maxLength={1}
              onChange={(e) =>
                onChange(
                  index,
                  e.target.value
                    .toUpperCase()
                    .replace(
                      allowUnderscore
                        ? /[^A-Z_]/g
                        : /[^A-Z]/g,
                      ""
                    )
                )
              }
            />
          );
        }
      )}

    </div>
  );
}

function KeywordNumberInput({
  keyword,
  values,
  statuses,
  onChange,
  disabled,
}) {
  return (
    <div className="keyword-number-grid">

      {keyword.split("").map(
        (letter, index) => (

          <div
            className="keyword-number-column"
            key={index}
          >

            <div className="keyword-letter">
              {letter}
            </div>

            <div className="keyword-number-arrow">
              ↓
            </div>

            <input
              className={`manual-number ${
                statuses[index] ===
                "correct"
                  ? "answer-correct"
                  : statuses[index] ===
                    "wrong"
                  ? "answer-wrong"
                  : ""
              }`}
              value={
                values[index] || ""
              }
              disabled={disabled}
              maxLength={2}
              inputMode="numeric"
              onChange={(e) =>
                onChange(
                  index,
                  e.target.value.replace(
                    /[^0-9]/g,
                    ""
                  )
                )
              }
            />

          </div>
        )
      )}

    </div>
  );
}

/* =========================================================
   MANUAL CANVAS
========================================================= */

function ManualCanvasSimulation({
  plainText,
  keyword,
  phase,
  matrix,
  keyOrder,
  expectedCipher,
  expectedDecryptChars,

  matrixInputs,
  matrixStatus,

  keyInputs,
  keyStatus,

  cipherInputs,
  cipherStatus,

  decryptInputs,
  decryptStatus,

  matrixLocked,
  keyLocked,
  cipherLocked,
  decryptLocked,

  onMatrixChange,
  onKeyChange,
  onCipherChange,
  onDecryptChange,

  onCheckMatrix,
  onCheckKey,
  onCheckCipher,
  onCheckDecrypt,

  onContinue,
  onNewWord,
  onTryAgain,
}) {

  const rows = matrix.length;
  const columns = keyword.length;

  return (
    <div className="canvas-sim">

      <div className="sim-content">

        {/* STEP 1 */}

        {phase === 0 && (
          <div className="manual-step-block">

            <div className="manual-step-title">
              Step 1 — Arrange Plain Text in Rows and Columns
            </div>

            <p className="manual-step-theory">
              Write the plaintext row-wise. Use the
              keyword length as the number of columns.
              Empty cells are represented by "_".
            </p>

            <div className="manual-keyword-display">
              {keyword.split("").map(
                (letter, index) => (
                  <div
                    className="keyword-header-cell"
                    key={index}
                  >
                    {letter}
                  </div>
                )
              )}
            </div>

            <div className="manual-matrix-area">
              <ManualMatrixInput
                values={matrixInputs}
                statuses={matrixStatus}
                rows={rows}
                columns={columns}
                onChange={onMatrixChange}
                disabled={matrixLocked}
              />
            </div>

            <p className="manual-hint">
              Fill every matrix cell exactly as required.
            </p>

            <div className="canvas-actions">

              {!matrixLocked ? (
                <>
                  <button
                    type="button"
                    className="canvas-btn check-btn"
                    onClick={onCheckMatrix}
                  >
                    ✓ Check Arrangement
                  </button>

                  {matrixStatus.includes(
                    "wrong"
                  ) && (
                    <button
                      type="button"
                      className="canvas-btn retry-btn"
                      onClick={() =>
                        onTryAgain(0)
                      }
                    >
                      ↻ Try Again
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="canvas-btn decrypt-btn"
                  onClick={() =>
                    onContinue(1)
                  }
                >
                  Continue → Step 2
                </button>
              )}

            </div>

          </div>
        )}

        {/* STEP 2 */}

        {phase === 1 && (
          <div className="manual-step-block">

            <div className="manual-step-title">
              Step 2 — Number the Keyword Alphabetically
            </div>

            <p className="manual-step-theory">
              Assign numbers from 1 onward according
              to alphabetical order of the keyword letters.
            </p>

            <KeywordNumberInput
              keyword={keyword}
              values={keyInputs}
              statuses={keyStatus}
              onChange={onKeyChange}
              disabled={keyLocked}
            />

            <div className="key-note manual-note">
              Read columns according to the alphabetical
              number order.
            </div>

            <div className="canvas-actions">

              {!keyLocked ? (
                <>
                  <button
                    type="button"
                    className="canvas-btn check-btn"
                    onClick={onCheckKey}
                  >
                    ✓ Check Key Order
                  </button>

                  {keyStatus.includes(
                    "wrong"
                  ) && (
                    <button
                      type="button"
                      className="canvas-btn retry-btn"
                      onClick={() =>
                        onTryAgain(1)
                      }
                    >
                      ↻ Try Again
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="canvas-btn decrypt-btn"
                  onClick={() =>
                    onContinue(2)
                  }
                >
                  Continue → Step 3
                </button>
              )}

            </div>

          </div>
        )}

        {/* STEP 3 */}

        {phase === 2 && (
          <div className="manual-step-block">

            <div className="manual-step-title">
              Step 3 — Read Columns to Generate Cipher Text
            </div>

            <p className="manual-step-theory">
              Read the matrix column-by-column according
              to the alphabetical keyword order.
            </p>

            <div className="manual-order-display">

              {getReadColumnIndexes(
                keyword
              ).map(
                (columnIndex, index) => (
                  <div
                    className="order-chip"
                    key={columnIndex}
                  >
                    {index + 1} → Column{" "}
                    {columnIndex + 1}
                  </div>
                )
              )}

            </div>

            <div className="manual-mini-matrix">

              {matrix.map(
                (row, rowIndex) => (
                  <div
                    className="manual-matrix-row"
                    key={rowIndex}
                  >
                    {row.map(
                      (char, colIndex) => (
                        <div
                          className="manual-cell static-cell"
                          key={`${rowIndex}-${colIndex}`}
                        >
                          {char}
                        </div>
                      )
                    )}
                  </div>
                )
              )}

            </div>

            <div className="word-arrow">
              ↓
            </div>

            <ManualLineInput
              values={cipherInputs}
              statuses={cipherStatus}
              expectedLength={
                expectedCipher.length
              }
              onChange={onCipherChange}
              disabled={cipherLocked}
              allowUnderscore
            />

            <p className="manual-hint">
              Enter the complete ciphertext in the
              obtained column reading order.
            </p>

            <div className="canvas-actions">

              {!cipherLocked ? (
                <>
                  <button
                    type="button"
                    className="canvas-btn check-btn"
                    onClick={onCheckCipher}
                  >
                    ✓ Check Cipher Text
                  </button>

                  {cipherStatus.includes(
                    "wrong"
                  ) && (
                    <button
                      type="button"
                      className="canvas-btn retry-btn"
                      onClick={() =>
                        onTryAgain(2)
                      }
                    >
                      ↻ Try Again
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="canvas-btn decrypt-btn"
                  onClick={() =>
                    onContinue(3)
                  }
                >
                  Continue → Step 4
                </button>
              )}

            </div>

          </div>
        )}

        {/* STEP 4 */}

        {phase === 3 && (
          <div className="manual-step-block">

            <div className="manual-step-title">
              Step 4 — Decryption / Recover Plain Text
            </div>

            <p className="manual-step-theory">
              Recover the original plaintext from the
              ciphertext using the keyword order.
            </p>

            <div className="cipher-section">

              <div className="cipher-title">
                CIPHER TEXT
              </div>

              <div className="cipher-output">
                {expectedCipher}
              </div>

            </div>

            <div className="word-arrow">
              ↓
            </div>

            <ManualLineInput
              values={decryptInputs}
              statuses={decryptStatus}
              expectedLength={
                expectedDecryptChars.length
              }
              onChange={onDecryptChange}
              disabled={decryptLocked}
              allowUnderscore
            />

            <p className="manual-hint">
              Enter the recovered plaintext. Use "_"
              wherever the original message had a space.
              Do not include the trailing padding cells.
            </p>

            <div className="canvas-actions">

              {!decryptLocked ? (
                <>
                  <button
                    type="button"
                    className="canvas-btn check-btn"
                    onClick={onCheckDecrypt}
                  >
                    ✓ Check Decryption
                  </button>

                  {decryptStatus.includes(
                    "wrong"
                  ) && (
                    <button
                      type="button"
                      className="canvas-btn retry-btn"
                      onClick={() =>
                        onTryAgain(3)
                      }
                    >
                      ↻ Try Again
                    </button>
                  )}
                </>
              ) : (
                <div className="success-message">
                  ✓ Decryption Successful
                </div>
              )}

            </div>

          </div>
        )}

        {/* FINAL SCREEN */}

        {phase === 4 && (
          <div className="final-output-screen">

            <div className="final-output-header">

              <div className="final-success-icon">
                ✓
              </div>

              <h2>
                Encryption Completed Successfully
              </h2>

              <p>
                The transposition-permutation operation
                has been completed successfully.
              </p>

            </div>

            <div className="final-output-box">

              <div className="final-output-row">
                <span>Plaintext</span>

                <strong>
                  {cleanText(plainText)}
                </strong>
              </div>

              <div className="final-output-row">
                <span>Keyword</span>

                <strong>
                  {keyword}
                </strong>
              </div>

              <div className="final-output-row">
                <span>Columns</span>

                <strong>
                  {keyword.length}
                </strong>
              </div>

              <div className="final-output-row">
                <span>Key Order</span>

                <strong>
                  {keyOrder.join(" ")}
                </strong>
              </div>

              <div className="final-output-row final-cipher-row">

                <span>
                  Final Ciphertext
                </span>

                <strong>
                  {expectedCipher}
                </strong>

              </div>

            </div>

            <div className="final-output-note">
              ✓ This successful operation has been added
              to the Observation Table.
            </div>

            <div className="canvas-actions final-actions">

              <button
                type="button"
                className="canvas-btn new-word-btn"
                onClick={onNewWord}
              >
                ＋ New
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

/* =========================================================
   ASSIGNMENT
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
      prev.map(
        (value, index) =>
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
            transposition cipher simulation.
          </p>

        </div>

        <div className="quiz-count">
          {
            answers.filter(
              (a) => a !== null
            ).length
          }
          /20 Answered
        </div>

      </div>

      <div className="quiz-list">

        {QUIZ.map(
          (item, qIndex) => (

            <div
              key={qIndex}
              className="quiz-question"
            >

              <p className="quiz-question-text">
                <b>
                  Q{qIndex + 1}.
                </b>{" "}
                {item.q}
              </p>

              <div className="quiz-options">

                {item.options.map(
                  (
                    option,
                    optionIndex
                  ) => {

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
                        className={
                          optionClass
                        }
                        onClick={() =>
                          selectAnswer(
                            qIndex,
                            optionIndex
                          )
                        }
                      >

                        <span className="option-letter">
                          {String.fromCharCode(
                            65 +
                              optionIndex
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
          )
        )}

      </div>

      <div className="assignment-note">

        <span>ℹ</span>

        <p>
          Select an answer for all 20 questions.
          Your assignment score will be calculated
          automatically when you submit.
        </p>

      </div>

    </section>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TranspositionCipherExperiment() {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState("simulation");

  const [theoryOpen, setTheoryOpen] =
    useState(false);

  const [procOpen, setProcOpen] =
    useState(false);

  const [helpOpen, setHelpOpen] =
    useState(false);

  const [plainText, setPlainText] =
    useState("");

  const [keyword, setKeyword] =
    useState("");

  const [phase, setPhase] =
    useState(0);

  const [simulationStarted, setSimulationStarted] =
    useState(false);

  const [matrix, setMatrix] =
    useState([]);

  const [keyOrder, setKeyOrder] =
    useState([]);

  const [expectedCipher, setExpectedCipher] =
    useState("");

  const [expectedDecryptChars, setExpectedDecryptChars] =
    useState([]);

  const [matrixInputs, setMatrixInputs] =
    useState([]);

  const [matrixStatus, setMatrixStatus] =
    useState([]);

  const [matrixLocked, setMatrixLocked] =
    useState(false);

  const [keyInputs, setKeyInputs] =
    useState([]);

  const [keyStatus, setKeyStatus] =
    useState([]);

  const [keyLocked, setKeyLocked] =
    useState(false);

  const [cipherInputs, setCipherInputs] =
    useState([]);

  const [cipherStatus, setCipherStatus] =
    useState([]);

  const [cipherLocked, setCipherLocked] =
    useState(false);

  const [decryptInputs, setDecryptInputs] =
    useState([]);

  const [decryptStatus, setDecryptStatus] =
    useState([]);

  const [decryptLocked, setDecryptLocked] =
    useState(false);

  /* =====================================================
     OBSERVATION STATE

     In-memory only (see note above) — no localStorage
     read/write, so this always starts empty on load/refresh.
  ===================================================== */

  const [observations, setObservations] =
    useState([]);

  const [successfulAttempts, setSuccessfulAttempts] =
    useState(0);

  useEffect(() => {

    setSuccessfulAttempts(
      Math.min(
        observations.length,
        5
      )
    );

  }, [observations]);

  const [answers, setAnswers] =
    useState(
      Array(QUIZ.length).fill(null)
    );

  const [submitted, setSubmitted] =
    useState(false);

  const simulationCompleted =
    successfulAttempts >= 5;

  const allAssignmentAnswered =
    answers.every(
      (a) => a !== null
    );

  /* =====================================================
     VALIDATE INPUT
  ===================================================== */

  const validateInput = () => {

    const word =
      plainText.trim();

    const kw =
      keyword.trim().toUpperCase();

    if (
      !word ||
      word.length > 100
    ) {
      return false;
    }

    if (
      !/^[A-Za-z ]+$/.test(word)
    ) {
      return false;
    }

    if (
      !/^[A-Za-z]{2,8}$/.test(kw)
    ) {
      return false;
    }

    return true;
  };

  /* =====================================================
     START
  ===================================================== */

  const handleStartEncryption = () => {

    if (!validateInput()) {

      alert(
        "Please enter valid plaintext and a keyword containing 2 to 8 letters."
      );

      return;
    }

    const normalizedKeyword =
      keyword.trim().toUpperCase();

    const builtMatrix =
      buildMatrix(
        plainText,
        normalizedKeyword.length
      );

    const order =
      getKeywordOrder(
        normalizedKeyword
      );

    const cipher =
      getCipherText(
        builtMatrix,
        normalizedKeyword
      );

    const decryptChars =
      getExpectedDecryptChars(
        plainText
      );

    setKeyword(
      normalizedKeyword
    );

    setMatrix(
      builtMatrix
    );

    setKeyOrder(
      order
    );

    setExpectedCipher(
      cipher
    );

    setExpectedDecryptChars(
      decryptChars
    );

    setMatrixInputs(
      Array(
        builtMatrix.length *
          normalizedKeyword.length
      ).fill("")
    );

    setMatrixStatus(
      Array(
        builtMatrix.length *
          normalizedKeyword.length
      ).fill(null)
    );

    setMatrixLocked(false);

    setKeyInputs(
      Array(
        normalizedKeyword.length
      ).fill("")
    );

    setKeyStatus(
      Array(
        normalizedKeyword.length
      ).fill(null)
    );

    setKeyLocked(false);

    setCipherInputs(
      Array(cipher.length).fill("")
    );

    setCipherStatus(
      Array(cipher.length).fill(null)
    );

    setCipherLocked(false);

    setDecryptInputs(
      Array(decryptChars.length).fill("")
    );

    setDecryptStatus(
      Array(decryptChars.length).fill(null)
    );

    setDecryptLocked(false);

    setPhase(0);
    setSimulationStarted(true);
  };

  /* =====================================================
     STEP 1 CHECK
  ===================================================== */

  const handleCheckMatrix = () => {

    const expected =
      matrix.flat();

    const status =
      getStatusArray(
        matrixInputs,
        expected
      );

    setMatrixStatus(status);

    if (
      status.every(
        (item) =>
          item === "correct"
      )
    ) {

      setMatrixLocked(true);

    } else {

      alert(
        "Wrong arrangement! Please check the red cells and try again."
      );
    }
  };

  /* =====================================================
     STEP 2 CHECK
  ===================================================== */

  const handleCheckKey = () => {

    const status =
      getStatusArray(
        keyInputs,
        keyOrder
      );

    setKeyStatus(status);

    if (
      status.every(
        (item) =>
          item === "correct"
      )
    ) {

      setKeyLocked(true);

    } else {

      alert(
        "Wrong keyword numbering! Please correct the red cells and try again."
      );
    }
  };

  /* =====================================================
     STEP 3 CHECK
  ===================================================== */

  const handleCheckCipher = () => {

    const status =
      getStatusArray(
        cipherInputs,
        expectedCipher.split("")
      );

    setCipherStatus(status);

    if (
      status.every(
        (item) =>
          item === "correct"
      )
    ) {

      setCipherLocked(true);

    } else {

      alert(
        "Wrong ciphertext! Please check the red cells and try again."
      );
    }
  };

  /* =====================================================
     STEP 4 CHECK + SAVE OBSERVATION

     Every successful decryption is one new observation
     (up to a cap of 5). Duplicate plaintext/keyword
     combinations are still allowed as separate attempts —
     that's intentional, not a bug.
  ===================================================== */

  const handleCheckDecrypt = () => {

    const status =
      getStatusArray(
        decryptInputs,
        expectedDecryptChars
      );

    setDecryptStatus(status);

    const isCorrect =
      status.every(
        (item) =>
          item === "correct"
      );

    if (!isCorrect) {

      alert(
        "Wrong decrypted plaintext! Please try again."
      );

      return;
    }

    /* Lock successful decryption */
    setDecryptLocked(true);

    setObservations((prev) => {

      /* Stop adding observations after 5 */
      if (prev.length >= 5) {
        return prev;
      }

      const newObservation = {
        attempt: prev.length + 1,

        plaintext:
          cleanText(
            plainText
          ),

        keyword:
          keyword
            .toUpperCase()
            .trim(),

        columns:
          keyword.length,

        key:
          keyOrder.join(" "),

        ciphertext:
          expectedCipher,

        status:
          "Complete",

        timestamp:
          new Date().toISOString(),
      };

      return [
        ...prev,
        newObservation,
      ];
    });

    /* Open final screen */
    setPhase(4);
  };

  /* =====================================================
     TRY AGAIN
  ===================================================== */

  const handleTryAgain = (
    step
  ) => {

    if (step === 0) {

      setMatrixInputs(
        Array(
          matrix.length *
            keyword.length
        ).fill("")
      );

      setMatrixStatus(
        Array(
          matrix.length *
            keyword.length
        ).fill(null)
      );

      setMatrixLocked(false);
    }

    if (step === 1) {

      setKeyInputs(
        Array(
          keyword.length
        ).fill("")
      );

      setKeyStatus(
        Array(
          keyword.length
        ).fill(null)
      );

      setKeyLocked(false);
    }

    if (step === 2) {

      setCipherInputs(
        Array(
          expectedCipher.length
        ).fill("")
      );

      setCipherStatus(
        Array(
          expectedCipher.length
        ).fill(null)
      );

      setCipherLocked(false);
    }

    if (step === 3) {

      setDecryptInputs(
        Array(
          expectedDecryptChars.length
        ).fill("")
      );

      setDecryptStatus(
        Array(
          expectedDecryptChars.length
        ).fill(null)
      );

      setDecryptLocked(false);
    }
  };

  /* =====================================================
     NEW WORD
  ===================================================== */

  const handleNewWord = () => {

    setPlainText("");
    setKeyword("");

    setMatrix([]);
    setKeyOrder([]);
    setExpectedCipher("");
    setExpectedDecryptChars([]);

    setMatrixInputs([]);
    setMatrixStatus([]);

    setKeyInputs([]);
    setKeyStatus([]);

    setCipherInputs([]);
    setCipherStatus([]);

    setDecryptInputs([]);
    setDecryptStatus([]);

    setMatrixLocked(false);
    setKeyLocked(false);
    setCipherLocked(false);
    setDecryptLocked(false);

    setPhase(0);
    setSimulationStarted(false);
  };

  /* =====================================================
     RESET

     Reset now clears observation history automatically
     (along with the current in-progress attempt), so the
     Observation Table always starts clean — matching the
     automatic clear that already happens on page refresh
     and on successful submit.
  ===================================================== */

  const handleReset = () => {

    handleNewWord();

    setObservations([]);

    setActiveTab(
      "simulation"
    );

    setAnswers(
      Array(
        QUIZ.length
      ).fill(null)
    );

    setSubmitted(false);
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = () => {

    const unanswered =
      answers.some(
        (answer) =>
          answer === null
      );

    if (unanswered) {

      alert(
        "Please answer all 20 questions before submitting."
      );

      setActiveTab(
        "assignment"
      );

      return;
    }

    if (submitted) return;

    if (!simulationCompleted) {

      alert(
        "Please complete 5 successful encryption/decryption operations before submitting."
      );

      setActiveTab(
        "simulation"
      );

      return;
    }

    const quizScore =
      answers.reduce(
        (
          total,
          answer,
          index
        ) =>
          total +
          (
            answer ===
            QUIZ[index].correct
              ? 1
              : 0
          ),
        0
      );

    const resultData = buildIfsResult({

      completed: true,

      experimentNo: 5,

      experimentName:
        "Simple Transposition-Permutation Cipher",

      experimentRoute:
        "/ifs-experiment-5",

      successfulAttempts:
        Math.min(
          observations.length,
          5
        ),

      totalRequiredAttempts: 5,

      simulationCompleted:
        observations.length >= 5,

      observations,

      quizScore,

      quizTotal:
        QUIZ.length,

      correctCount:
        quizScore,

      incorrectCount:
        QUIZ.length -
        quizScore,

      quizAnswers:
        answers,

      quizQuestions:
        QUIZ,

      date:
        new Date().toISOString(),
    });

    try {

      localStorage.setItem(
        RESULT_STORAGE_KEY,
        JSON.stringify(
          resultData
        )
      );

      localStorage.setItem("assignmentResult", JSON.stringify(resultData));

    } catch (error) {

      console.error(
        "Error saving result:",
        error
      );

      alert(
        "Warning: your result could not be saved locally. Make sure the confirmation screen loads before closing this tab."
      );
    }

    setSubmitted(true);

    /* Clear this run's observation history once submitted —
       observations are in-memory only, but this keeps the
       on-screen table tidy if the learner stays on this
       page after submitting. */
    setObservations([]);

    navigate(
      "/result",
      {
        state: resultData,
      }
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="transposition-root">

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
          Experiment 5: Simple
          Transposition-Permutation Cipher
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

      <section className="card">

        <h2 className="section-heading orange">
          Aim
        </h2>

        <p>
          To understand and implement the Simple
          Transposition-Permutation cipher technique,
          where plaintext characters are rearranged
          based on a keyword to produce ciphertext.
        </p>

      </section>

      <section className="card">

        <div
          className="collapsible-header"
          onClick={() =>
            setTheoryOpen(
              (v) => !v
            )
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
              Block Transposition Cipher is a form
              of transposition cipher in which the
              plaintext is written in rows and read
              column by column.
            </p>

            <p>
              <b>Process:</b>
            </p>

            <ol>

              <li>
                Write the plaintext in rows.
              </li>

              <li>
                Use the keyword to determine the
                number of columns.
              </li>

              <li>
                Number keyword letters
                alphabetically.
              </li>

              <li>
                Read columns according to
                keyword order.
              </li>

              <li>
                Concatenate characters to form
                ciphertext.
              </li>

            </ol>

          </div>
        )}

      </section>

      <section className="card">

        <div
          className="collapsible-header"
          onClick={() =>
            setProcOpen(
              (v) => !v
            )
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
                Enter plaintext.
              </li>

              <li>
                Enter keyword of 2 to 8 letters.
              </li>

              <li>
                Start encryption simulation.
              </li>

              <li>
                Manually arrange plaintext.
              </li>

              <li>
                Manually enter keyword numbers.
              </li>

            </ol>

            <ol
              className="proc-col"
              start="6"
            >

              <li>
                Generate ciphertext manually.
              </li>

              <li>
                Manually perform decryption.
              </li>

              <li>
                Complete 5 successful operations.
              </li>

              <li>
                Answer all 20 questions.
              </li>

              <li>
                Submit the experiment.
              </li>

            </ol>

          </div>
        )}

      </section>

      <div className="experiment-tabs">

        <button
          type="button"
          className={`experiment-tab ${
            activeTab ===
            "simulation"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab(
              "simulation"
            )
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
            activeTab ===
            "assignment"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActiveTab(
              "assignment"
            )
          }
        >
          📝 Assignment
        </button>

      </div>

      {activeTab ===
        "simulation" && (
        <>

          <div className="sim-row">

            {/* INPUT PANEL */}

            <aside className="card inputs-panel">

              <h3 className="panel-heading">
                Inputs
              </h3>

              <label className="field-label">
                Plain Text
              </label>

              <textarea
                className="text-input"
                value={plainText}
                disabled={
                  simulationStarted
                }
                maxLength={100}
                placeholder="E.g., KRISHNA RANJAN"
                onChange={(e) =>
                  setPlainText(
                    e.target.value
                  )
                }
                rows={3}
              />

              <span className="char-count">
                {
                  plainText.trim()
                    .length
                }
                /100
              </span>

              <label className="field-label shift-label">
                Keyword
              </label>

              <input
                type="text"
                className="text-input"
                value={keyword}
                disabled={
                  simulationStarted
                }
                maxLength={8}
                placeholder="E.g., NICK"
                onChange={(e) =>
                  setKeyword(
                    e.target.value
                      .toUpperCase()
                      .replace(
                        /[^A-Z]/g,
                        ""
                      )
                  )
                }
              />

              <span className="hint-text">
                Keyword length = number of
                columns (2 to 8)
              </span>

              <div className="action-buttons">

                {!simulationStarted && (
                  <button
                    className="btn-verify full-width"
                    onClick={
                      handleStartEncryption
                    }
                  >
                    🔒 Start Encryption
                  </button>
                )}

                <button
                  className="btn-reset full-width"
                  onClick={
                    handleReset
                  }
                >
                  ↺ Reset
                </button>

              </div>

              <div className="input-note">

                <span>ℹ</span>

                <p>
                  Keyword determines the number
                  of columns and the order in
                  which columns are read.
                </p>

              </div>

            </aside>

            {/* CANVAS */}

            <div className="card canvas-panel">

              <h3 className="panel-heading">
                Simulation Canvas
              </h3>

              <div className="canvas-area">

                {!simulationStarted ? (
                  <DefaultPreview />
                ) : (
                  <ManualCanvasSimulation

                    plainText={
                      plainText
                    }

                    keyword={
                      keyword
                    }

                    phase={
                      phase
                    }

                    matrix={
                      matrix
                    }

                    keyOrder={
                      keyOrder
                    }

                    expectedCipher={
                      expectedCipher
                    }

                    expectedDecryptChars={
                      expectedDecryptChars
                    }

                    matrixInputs={
                      matrixInputs
                    }

                    matrixStatus={
                      matrixStatus
                    }

                    keyInputs={
                      keyInputs
                    }

                    keyStatus={
                      keyStatus
                    }

                    cipherInputs={
                      cipherInputs
                    }

                    cipherStatus={
                      cipherStatus
                    }

                    decryptInputs={
                      decryptInputs
                    }

                    decryptStatus={
                      decryptStatus
                    }

                    matrixLocked={
                      matrixLocked
                    }

                    keyLocked={
                      keyLocked
                    }

                    cipherLocked={
                      cipherLocked
                    }

                    decryptLocked={
                      decryptLocked
                    }

                    onMatrixChange={(
                      index,
                      value
                    ) => {

                      setMatrixInputs(
                        (prev) => {

                          const next =
                            [
                              ...prev,
                            ];

                          next[index] =
                            value;

                          return next;
                        }
                      );

                    }}

                    onKeyChange={(
                      index,
                      value
                    ) => {

                      setKeyInputs(
                        (prev) => {

                          const next =
                            [
                              ...prev,
                            ];

                          next[index] =
                            value;

                          return next;
                        }
                      );

                    }}

                    onCipherChange={(
                      index,
                      value
                    ) => {

                      setCipherInputs(
                        (prev) => {

                          const next =
                            [
                              ...prev,
                            ];

                          next[index] =
                            value;

                          return next;
                        }
                      );

                    }}

                    onDecryptChange={(
                      index,
                      value
                    ) => {

                      setDecryptInputs(
                        (prev) => {

                          const next =
                            [
                              ...prev,
                            ];

                          next[index] =
                            value;

                          return next;
                        }
                      );

                    }}

                    onCheckMatrix={
                      handleCheckMatrix
                    }

                    onCheckKey={
                      handleCheckKey
                    }

                    onCheckCipher={
                      handleCheckCipher
                    }

                    onCheckDecrypt={
                      handleCheckDecrypt
                    }

                    onContinue={
                      setPhase
                    }

                    onNewWord={
                      handleNewWord
                    }

                    onTryAgain={
                      handleTryAgain
                    }

                  />
                )}

              </div>

            </div>

            {/* ANALYSIS */}

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
                      <td>Status</td>
                      <td>:</td>
                      <td>
                        {!simulationStarted
                          ? "Waiting to start"
                          : phase === 4
                          ? "Completed"
                          : `Step ${
                              phase + 1
                            } of 4`}
                      </td>
                    </tr>

                    <tr>
                      <td>Input Text</td>
                      <td>:</td>
                      <td>
                        {plainText ||
                          "—"}
                      </td>
                    </tr>

                    <tr>
                      <td>Keyword</td>
                      <td>:</td>
                      <td>
                        {keyword ||
                          "—"}
                      </td>
                    </tr>

                    <tr>
                      <td>Columns</td>
                      <td>:</td>
                      <td>
                        {simulationStarted
                          ? keyword.length
                          : "—"}
                      </td>
                    </tr>

                    <tr>
                      <td>Key Order</td>
                      <td>:</td>
                      <td>
                        {simulationStarted
                          ? keyOrder.join(
                              " "
                            )
                          : "—"}
                      </td>
                    </tr>

                  </tbody>

                </table>

              </div>

              <div className="analysis-block">

                <h4 className="analysis-sub">
                  How It Works
                </h4>

                <ol className="how-it-works">

                  <li>
                    Write plaintext row-wise.
                  </li>

                  <li>
                    Number keyword letters.
                  </li>

                  <li>
                    Read columns in key order.
                  </li>

                  <li>
                    Form ciphertext.
                  </li>

                </ol>

              </div>

              {expectedCipher && (
                <div className="analysis-block">

                  <h4 className="analysis-sub">
                    Expected Cipher
                  </h4>

                  <p className="conclusion-text">
                    {expectedCipher}
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

                    <th>
                      Sr. No.
                    </th>

                    <th>
                      Plaintext
                    </th>

                    <th>
                      Keyword
                    </th>

                    <th>
                      Columns
                    </th>

                    <th>
                      Key Order
                    </th>

                    <th>
                      Ciphertext
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {observations.length === 0 ? (

                    <tr>

                      <td colSpan="7">
                        No encryptions performed yet.
                      </td>

                    </tr>

                  ) : (

                    observations.map(
                      (
                        row,
                        index
                      ) => (

                        <tr
                          key={
                            row.timestamp ||
                            index
                          }
                          className="row-correct"
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {row.plaintext}
                          </td>

                          <td>
                            {row.keyword}
                          </td>

                          <td>
                            {row.columns}
                          </td>

                          <td>
                            {row.key}
                          </td>

                          <td>
                            {row.ciphertext}
                          </td>

                          <td>
                            ✔{" "}
                            {row.status}
                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

            <div className="submit-status sim-status">

              <p>

                Successful Operations:

                <b>
                  {" "}
                  {
                    Math.min(
                      successfulAttempts,
                      5
                    )
                  }
                  /5
                </b>

                <br />

                {successfulAttempts < 5
                  ? `Complete ${
                      5 -
                      successfulAttempts
                    } more full encryption(s) to unlock the Assignment tab.`
                  : "✔ Simulation completed."}

              </p>

            </div>

          </section>

        </>
      )}

      {activeTab ===
        "assignment" && (
        <AssignmentScreen
          answers={
            answers
          }
          setAnswers={
            setAnswers
          }
        />
      )}

      <section className="submit-section">

        <button
          className={`btn-submit ${
            !submitted
              ? "enabled"
              : "disabled"
          }`}
          disabled={submitted}
          onClick={
            handleSubmit
          }
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

              Simulation:{" "}

              <b>
                {
                  Math.min(
                    successfulAttempts,
                    5
                  )
                }
                /5
              </b>

              {"  |  "}

              Assignment:{" "}

              <b>
                {allAssignmentAnswered
                  ? "Ready"
                  : "Pending"}
              </b>

            </p>

          )}

        </div>

      </section>

      {/* HELP POPUP */}

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
              Block Single Columnar
              Transposition
            </h3>

            <p>
              <b>Example:</b> Plaintext
              "KRISHNA RANJAN" with keyword
              "NICK".
            </p>

            <p>
              Keyword numbering:
              N=4, I=2, C=1, K=3.
            </p>

            <p>
              Read columns according to their
              alphabetical order.
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
