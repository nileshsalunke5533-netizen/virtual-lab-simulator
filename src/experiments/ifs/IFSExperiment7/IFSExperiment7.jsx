import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { buildIfsResult } from "../../../utils/ifsResult.js";
import "./IFSExperiment7.css";

/* =========================================================
   HILL CIPHER LOGIC (GENERIC n x n)
========================================================= */

const REQUIRED_SUCCESS = 5;

function charNum(ch) {
  return ch.toUpperCase().charCodeAt(0) - 65;
}

function numChar(n) {
  return String.fromCharCode((((n % 26) + 26) % 26) + 65);
}

function buildGroups(plaintext, n) {
  const letters = plaintext.toUpperCase().replace(/[^A-Z]/g, "");
  const groups = [];
  for (let i = 0; i < letters.length; i += n) {
    let group = letters.slice(i, i + n);
    while (group.length < n) group += "X";
    groups.push(group);
  }
  return groups;
}

function keyMatrixFromKeyword(keyword, n) {
  const letters = keyword.toUpperCase().replace(/[^A-Z]/g, "").split("");
  const nums = letters.map(charNum);
  return { letters, nums };
}

function computeRaw(keyNums, groupNums, n) {
  const raw = [];
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += keyNums[i * n + j] * groupNums[j];
    }
    raw.push(sum);
  }
  return raw;
}

function formulaRowText(i, keyNums, groupNums, n) {
  const parts = [];
  for (let j = 0; j < n; j++) {
    parts.push(`${keyNums[i * n + j]}×${groupNums[j]}`);
  }
  return parts.join(" + ");
}

function statusArray(entered, expected) {
  return expected.map((exp, i) => {
    const val = entered[i];
    if (val === "" || val === undefined || val === null) return null;
    return Number(val) === exp || (typeof exp === "string" && val === exp)
      ? "correct"
      : "wrong";
  });
}

/* =========================================================
   ASSIGNMENT QUESTION BANK
========================================================= */

const QUIZ = [
  {
    q: "What type of cipher is the Hill Cipher?",
    options: ["Monoalphabetic substitution cipher", "Polygraphic substitution cipher", "Transposition cipher", "Stream cipher"],
    correct: 1,
  },
  {
    q: "In the standard Hill Cipher, what numerical value is generally assigned to the letter A?",
    options: ["0", "1", "25", "26"],
    correct: 0,
  },
  {
    q: "Which mathematical operation is primarily used for Hill Cipher encryption?",
    options: ["Matrix multiplication", "Matrix addition only", "Division of matrices", "Scalar subtraction"],
    correct: 0,
  },
  {
    q: "If the plaintext is CAT, what numerical vector is obtained using A = 0?",
    options: ["[2, 0, 19]", "[3, 1, 20]", "[2, 1, 19]", "[2, 0, 18]"],
    correct: 0,
  },
  {
    q: "What is the purpose of taking the result modulo 26 in Hill Cipher?",
    options: [
      "To convert the result back into the range 0–25",
      "To increase the key size",
      "To remove repeated letters",
      "To change the matrix dimension",
    ],
    correct: 0,
  },
  {
    q: "For a 3×3 Hill Cipher, which condition must the key matrix satisfy for decryption to be possible?",
    options: [
      "Its determinant must be divisible by 26",
      "Its determinant must be relatively prime to 26",
      "Its determinant must always be 0",
      "Its determinant must always be 26",
    ],
    correct: 1,
  },
  {
    q: "If X is selected as the padding character, how would HELLO commonly be padded?",
    options: ["HELLOX", "HELLOXX", "XHELLO", "HELLOXXX"],
    correct: 0,
  },
  {
    q: "What is the first step when preparing plaintext for a basic Hill Cipher simulation?",
    options: [
      "Convert letters into their numerical equivalents",
      "Calculate the inverse matrix immediately",
      "Convert numbers into ASCII codes",
      "Multiply the plaintext by 26",
    ],
    correct: 0,
  },
  {
    q: "Which formula represents Hill Cipher encryption?",
    options: ["C = K × P mod 26", "C = P + K mod 26", "C = K ÷ P mod 26", "C = P − K mod 26"],
    correct: 0,
  },
  {
    q: "In the formula C = K × P mod 26, what does K represent?",
    options: ["Ciphertext vector", "Key matrix", "Plaintext vector", "Padding value"],
    correct: 1,
  },
  {
    q: "In the formula C = K × P mod 26, what does P represent?",
    options: ["Plaintext vector", "Padding value", "Inverse matrix", "Ciphertext vector"],
    correct: 0,
  },
  {
    q: "Which sequence correctly represents the basic Hill Cipher encryption process?",
    options: [
      "Convert letters → group into blocks → matrix multiplication → modulo 26 → convert to letters",
      "Matrix multiplication → convert letters → remove padding → modulo 26",
      "Convert letters → divide by key → transpose → convert to letters",
      "Convert letters → sort alphabetically → divide by 26 → encrypt",
    ],
    correct: 0,
  },
  {
    q: "A student enters a 3×3 key matrix whose determinant has no multiplicative inverse modulo 26. What will happen?",
    options: [
      "Encryption will automatically change the key",
      "Decryption cannot be properly performed using that key",
      "The plaintext will become longer",
      "The key matrix will become 2×2",
    ],
    correct: 1,
  },
  {
    q: "A student enters: SECURE. The simulator uses a 3×3 Hill Cipher. What should happen before encryption?",
    options: [
      "Nothing; length is already suitable",
      "Add one padding character",
      "Remove the last character",
      "Add two padding characters",
    ],
    correct: 0,
  },
  {
    q: "A plaintext contains exactly 12 letters. How many padding characters are required for a 3×3 Hill Cipher?",
    options: ["0", "1", "2", "3"],
    correct: 0,
  },
  {
    q: "A 2×2 Hill Cipher processes plaintext in blocks of 2. Therefore, a 3×3 Hill Cipher processes plaintext in blocks of:",
    options: ["2", "3", "6", "9"],
    correct: 1,
  },
  {
    q: "A student uses a 3×3 key matrix but divides plaintext into: AB | CD | EF. What is wrong?",
    options: [
      "Blocks should contain 3 letters",
      "Blocks should contain 4 letters",
      "A 3×3 key cannot encrypt text",
      "Blocks should contain 6 letters",
    ],
    correct: 0,
  },
  {
    q: "Which expression correctly represents Hill Cipher decryption?",
    options: ["P = K⁻¹ C (mod 26)", "P = K C⁻¹ (mod 26)", "P = K + C (mod 26)", "P = K⁻¹ + C (mod 26)"],
    correct: 0,
  },
  {
    q: "If a matrix multiplication produces a result that is reduced modulo 26, which values represent the reduced vector?",
    options: ["[0, 3, 15]", "[2, 3, 15]", "[0, 4, 16]", "[26, 3, 15]"],
    correct: 0,
  },
  {
    q: "Two students use the same plaintext and the same key matrix, but one student uses A = 0 and the other uses A = 1. What is most likely?",
    options: [
      "Both obtain the same ciphertext",
      "They obtain different ciphertexts",
      "Only the plaintext length changes",
      "The key matrix automatically changes",
    ],
    correct: 1,
  },
];

/* =========================================================
   DEFAULT PREVIEW (STATIC REFERENCE EXAMPLE — SCROLLABLE)
========================================================= */

function DefaultPreview() {
  return (
    <div className="hc-preview-scroll">
      <div className="default-preview">

        <div className="default-example">
          <div className="example-row">
            <span className="example-label">Keyword</span>
            <span className="example-value">HILL</span>
          </div>
          <div className="example-row">
            <span className="example-label">Plaintext</span>
            <span className="example-value">java</span>
          </div>
        </div>

        <div className="hc-static-steps">

          <div className="hc-static-block">
            <h4 className="hc-static-title">1. Keyword → Key Matrix</h4>
            <p className="hc-static-theory">
              Each letter of the keyword is assigned a number (A=0…Z=25) and arranged row-wise into an n×n matrix.
            </p>
            <div className="hc-matrix-row">
              <div className="hc-matrix">
                <div className="hc-matrix-row-inner"><span>H</span><span>I</span></div>
                <div className="hc-matrix-row-inner"><span>L</span><span>L</span></div>
              </div>
              <span className="hc-equals">=</span>
              <div className="hc-matrix num">
                <div className="hc-matrix-row-inner"><span>7</span><span>8</span></div>
                <div className="hc-matrix-row-inner"><span>11</span><span>11</span></div>
              </div>
            </div>
          </div>

          <div className="hc-static-block">
            <h4 className="hc-static-title">2. Plaintext → Digraphs</h4>
            <p className="hc-static-theory">
              The plaintext is split into groups of n letters, matching the matrix size (here n=2, so pairs).
            </p>
            <p className="hc-static-text">java → (JA) (VA)</p>
          </div>

          <div className="hc-static-block">
            <h4 className="hc-static-title">3. Number the letters</h4>
            <p className="hc-static-theory">
              Every letter in each group is converted to its numeric value using A=0 … Z=25.
            </p>
            <p className="hc-static-text">JA → (9, 0) &nbsp;&nbsp; VA → (21, 0)</p>
          </div>

          <div className="hc-static-block">
            <h4 className="hc-static-title">4. Multiply Key Matrix × Vector</h4>
            <p className="hc-static-theory">
              Each row of the key matrix is multiplied with the plaintext number vector and summed.
            </p>
            <div className="hc-mult-visual">
              <div className="hc-matrix">
                <div className="hc-matrix-row-inner"><span>9</span></div>
                <div className="hc-matrix-row-inner"><span>0</span></div>
              </div>
              <span className="hc-equals">×</span>
              <div className="hc-matrix num">
                <div className="hc-matrix-row-inner"><span>7</span><span>8</span></div>
                <div className="hc-matrix-row-inner"><span>11</span><span>11</span></div>
              </div>
              <span className="hc-equals">=</span>
              <div className="hc-matrix result">
                <div className="hc-matrix-row-inner"><span>7×9+8×0</span></div>
                <div className="hc-matrix-row-inner"><span>11×9+11×0</span></div>
              </div>
              <span className="hc-equals">=</span>
              <div className="hc-matrix num">
                <div className="hc-matrix-row-inner"><span>63</span></div>
                <div className="hc-matrix-row-inner"><span>99</span></div>
              </div>
            </div>
          </div>

          <div className="hc-static-block">
            <h4 className="hc-static-title">5. Mod 26</h4>
            <p className="hc-static-theory">
              Each resultant number is reduced modulo 26 so it maps back to a valid alphabet position (0–25).
            </p>
            <p className="hc-static-text">(63, 99) mod 26 = (11, 21)</p>
          </div>

          <div className="hc-static-block">
            <h4 className="hc-static-title">6. Translate to letters</h4>
            <p className="hc-static-theory">
              The final numbers are converted back to letters (0=A … 25=Z) to get the ciphertext for this group.
            </p>
            <p className="hc-static-text">11 → L &nbsp; 21 → V &nbsp;&nbsp; so JA → LV</p>
          </div>

          <div className="default-word-preview">
            <span>Full Result:</span>
            <b>java</b>
            <span>→</span>
            <b>lvrx</b>
          </div>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   REUSABLE INPUT GRID / ROW COMPONENTS
========================================================= */

function StatusMatrixInput({ values, statuses, onChange, disabled, n }) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    rows.push(
      <div className="hc-matrix-row-inner" key={i}>
        {Array.from({ length: n }).map((_, j) => {
          const idx = i * n + j;
          const st = statuses[idx];
          return (
            <input
              key={j}
              className={`hc-num-input ${st === "correct" ? "answer-correct" : st === "wrong" ? "answer-wrong" : ""}`}
              value={values[idx]}
              disabled={disabled}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                onChange(idx, v);
              }}
            />
          );
        })}
      </div>
    );
  }
  return <div className="hc-matrix input-matrix">{rows}</div>;
}

function StatusNumberRow({ values, statuses, onChange, disabled, n }) {
  return (
    <div className="hc-pair-row">
      {Array.from({ length: n }).map((_, i) => {
        const st = statuses[i];
        return (
          <div className="letter-column" key={i}>
            <input
              className={`hc-num-input wide ${st === "correct" ? "answer-correct" : st === "wrong" ? "answer-wrong" : ""}`}
              value={values[i]}
              disabled={disabled}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                onChange(i, v);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function StatusLetterRow({ values, statuses, onChange, disabled, n }) {
  return (
    <div className="hc-pair-row">
      {Array.from({ length: n }).map((_, i) => {
        const st = statuses[i];
        return (
          <div className="letter-column" key={i}>
            <input
              type="text"
              maxLength={1}
              className={`letter-answer-input ${st === "correct" ? "answer-correct" : st === "wrong" ? "answer-wrong" : ""}`}
              value={values[i]}
              disabled={disabled}
              onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
                onChange(i, v);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function HillCipherExperiment() {

  const navigate = useNavigate();

  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procOpen, setProcOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const [screen, setScreen] = useState("simulation");

  /* ---- MATRIX SIZE ---- */
  const [matrixSize, setMatrixSize] = useState(2);
  const requiredKeyLen = matrixSize * matrixSize;

  /* ---- INPUTS ---- */
  const [plainText, setPlainText] = useState("");
  const [keyword, setKeyword] = useState("");

  /* ---- WORD-LEVEL STATE ---- */
  const [mode, setMode] = useState(null);
  const [keyData, setKeyData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [cipherGroups, setCipherGroups] = useState([]);
  const [activeSize, setActiveSize] = useState(2);

  /* ---- PHASE ---- */
  const [phase, setPhase] = useState("key");

  /* ---- PER-PHASE INPUTS + STATUS ---- */
  const [keyInputs, setKeyInputs] = useState([]);
  const [keyStatus, setKeyStatus] = useState([]);
  const [keyLocked, setKeyLocked] = useState(false);

  const [numberInputs, setNumberInputs] = useState([]);
  const [numberStatus, setNumberStatus] = useState([]);
  const [numberLocked, setNumberLocked] = useState(false);

  const [multiplyInputs, setMultiplyInputs] = useState([]);
  const [multiplyStatus, setMultiplyStatus] = useState([]);
  const [multiplyLocked, setMultiplyLocked] = useState(false);

  const [modInputs, setModInputs] = useState([]);
  const [modStatus, setModStatus] = useState([]);
  const [modLocked, setModLocked] = useState(false);

  const [translateInputs, setTranslateInputs] = useState([]);
  const [translateStatus, setTranslateStatus] = useState([]);
  const [translateLocked, setTranslateLocked] = useState(false);

  /* ---- TRACKING ---- */
  const [successfulAttempts, setSuccessfulAttempts] = useState(0); // counts COMPLETED WORDS
  const [observations, setObservations] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  /* ---- ASSIGNMENT ---- */
  const [quizAnswers, setQuizAnswers] = useState(Array(QUIZ.length).fill(null));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const simulationComplete = successfulAttempts >= REQUIRED_SUCCESS;

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateInput = () => {
    const kw = keyword.trim();
    const pt = plainText.trim();

    if (!new RegExp(`^[A-Za-z]{${requiredKeyLen}}$`).test(kw)) return false;
    if (!/^[A-Za-z ]+$/.test(pt)) return false;
    if (pt.replace(/[^A-Za-z]/g, "").length < 1) return false;

    return true;
  };

  /* =========================================================
     START ENCRYPTION
  ========================================================= */

  const handleStart = () => {
    if (!validateInput()) return;

    const n = matrixSize;
    const kData = keyMatrixFromKeyword(keyword, n);
    const grps = buildGroups(plainText, n);

    setKeyData(kData);
    setGroups(grps);
    setGroupIndex(0);
    setCipherGroups([]);
    setActiveSize(n);
    setMode("running");
    setPhase("key");

    setKeyInputs(Array(n * n).fill(""));
    setKeyStatus(Array(n * n).fill(null));
    setKeyLocked(false);
  };

  /* =========================================================
     PHASE 1: KEY MATRIX
  ========================================================= */

  const handleCheckKey = () => {
    const st = statusArray(keyInputs, keyData.nums);
    setKeyStatus(st);
    if (st.every((s) => s === "correct")) setKeyLocked(true);
  };

  const handleContinueFromKey = () => {
    setPhase("grouplist");
  };

  /* =========================================================
     PHASE 2: GROUP LIST
  ========================================================= */

  const handleContinueFromGroupList = () => {
    setPhase("number");
    setNumberInputs(Array(activeSize).fill(""));
    setNumberStatus(Array(activeSize).fill(null));
    setNumberLocked(false);
  };

  /* =========================================================
     CURRENT GROUP HELPERS
  ========================================================= */

  const currentGroup = groups[groupIndex] || "";
  const groupNums = currentGroup.split("").map(charNum);

  const rawVals = keyData ? computeRaw(keyData.nums, groupNums, activeSize) : [];
  const modVals = rawVals.map((v) => ((v % 26) + 26) % 26);
  const cipherLetters = modVals.map(numChar);

  /* =========================================================
     PHASE 3: NUMBERING
  ========================================================= */

  const handleCheckNumbering = () => {
    const st = statusArray(numberInputs, groupNums);
    setNumberStatus(st);
    if (st.every((s) => s === "correct")) setNumberLocked(true);
  };

  const handleContinueFromNumbering = () => {
    setPhase("multiply");
    setMultiplyInputs(Array(activeSize).fill(""));
    setMultiplyStatus(Array(activeSize).fill(null));
    setMultiplyLocked(false);
  };

  /* =========================================================
     PHASE 4: MULTIPLY
  ========================================================= */

  const handleCheckMultiply = () => {
    const st = statusArray(multiplyInputs, rawVals);
    setMultiplyStatus(st);
    if (st.every((s) => s === "correct")) setMultiplyLocked(true);
  };

  const handleContinueFromMultiply = () => {
    setPhase("mod");
    setModInputs(Array(activeSize).fill(""));
    setModStatus(Array(activeSize).fill(null));
    setModLocked(false);
  };

  /* =========================================================
     PHASE 5: MOD 26
  ========================================================= */

  const handleCheckMod = () => {
    const st = statusArray(modInputs, modVals);
    setModStatus(st);
    if (st.every((s) => s === "correct")) setModLocked(true);
  };

  const handleContinueFromMod = () => {
    setPhase("translate");
    setTranslateInputs(Array(activeSize).fill(""));
    setTranslateStatus(Array(activeSize).fill(null));
    setTranslateLocked(false);
  };

  /* =========================================================
     PHASE 6: TRANSLATE (final step of a group)
     NOTE: does NOT increment successfulAttempts here —
     only a fully completed WORD counts as 1 operation.
  ========================================================= */

  const handleCheckTranslate = () => {
    const st = statusArray(translateInputs, cipherLetters);
    setTranslateStatus(st);

    if (st.every((s) => s === "correct")) {
      setTranslateLocked(true);
      setCipherGroups((prev) => [...prev, cipherLetters.join("")]);
    }
  };

  const handleNextGroup = () => {
    const nextIndex = groupIndex + 1;

    if (nextIndex < groups.length) {
      setGroupIndex(nextIndex);
      setPhase("number");
      setNumberInputs(Array(activeSize).fill(""));
      setNumberStatus(Array(activeSize).fill(null));
      setNumberLocked(false);
    } else {
      // WORD FINISHED — cipherGroups already holds every completed group
      // (including this last one, added in handleCheckTranslate), so we
      // must NOT append cipherLetters again here — that was the bug
      // causing duplicated/incorrect ciphertext in the observation table.
      setCipherGroups((finalGroups) => {
        const finalCipher = finalGroups.join("");

        setObservations((prev) => [
          ...prev,
          {
            sr: prev.length + 1,
            word: plainText.trim().toUpperCase(),
            keyword: keyword.trim().toUpperCase(),
            matrix: `${activeSize} x ${activeSize}`,
            cipher: finalCipher,
            status: "Correct",
          },
        ]);

        return finalGroups;
      });

      // 1 completed word = 1 successful operation
      setSuccessfulAttempts((prev) => Math.min(prev + 1, REQUIRED_SUCCESS));

      setPhase("worddone");
    }
  };

  /* =========================================================
     NEW WORD / RESET
  ========================================================= */

  const handleNewWord = () => {
    setMode(null);
    setPhase("key");
    setKeyData(null);
    setGroups([]);
    setGroupIndex(0);
    setCipherGroups([]);
    setPlainText("");
    setKeyword("");
  };

  const handleReset = () => {
    handleNewWord();
    setSuccessfulAttempts(0);
    setObservations([]);
    setSubmitted(false);
    setQuizAnswers(Array(QUIZ.length).fill(null));
    setQuizSubmitted(false);
    setQuizScore(0);
    setScreen("simulation");
  };

  const handleMatrixSizeChange = (size) => {
    if (mode) return;
    setMatrixSize(size);
    setKeyword("");
  };

  /* =========================================================
     TAB SWITCH — UNLOCKED FOR NOW (TESTING)
  ========================================================= */

  const goToScreen = (target) => {
    setScreen(target);
  };

  /* =========================================================
     QUIZ SUBMIT
  ========================================================= */

  const handleQuizSubmit = () => {
    const score = quizAnswers.reduce(
      (total, answer, index) =>
        total + (answer === QUIZ[index].correct ? 1 : 0),
      0
    );

    setQuizScore(score);
    setQuizSubmitted(true);
  };

  /* =========================================================
     FINAL SUBMIT
  ========================================================= */

  const canSubmit = simulationComplete && quizAnswers.every((a) => a !== null);

  const handleSubmit = () => {
    if (!canSubmit || submitted) return;

    const resultData = buildIfsResult({
      completed: true,
      experimentNo: 7,
      experimentName:
        "Encrypt a Message using Hill Cipher (2 x 2 / 3 x 3 Key Matrix)",
      experimentRoute: "/ifs-experiment-7",
      successfulAttempts,
      observations,
      quizQuestions: QUIZ,
      quizAnswers,
      date: new Date().toISOString(),
    });

    setSubmitted(true);

    try {
      localStorage.setItem(
        "hillCipherExpStatus",
        JSON.stringify({
          completed: true,
          successfulAttempts,
          observations,
          quizScore,
          quizTotal: QUIZ.length,
          date: new Date().toISOString(),
        })
      );
      localStorage.setItem("assignmentResult", JSON.stringify(resultData));
    } catch (error) {
      console.log(error);
    }

    navigate("/result", { state: resultData });
  };

  /* =========================================================
     RENDER SIMULATION CANVAS
  ========================================================= */

  const renderSimulationCanvas = () => {

    if (!mode) {
      return <DefaultPreview />;
    }

    const n = activeSize;

    if (phase === "key") {
      return (
        <div className="hc-step-block">
          <div className="hc-step-title">Step 1 — Convert Keyword into Key Matrix</div>
          <p className="hc-step-theory">
            Every letter of your keyword is assigned a number using A=0, B=1 … Z=25.
            Arrange these numbers row-wise into a {n}×{n} matrix — this is your Key Matrix,
            used to transform every plaintext group in this word.
          </p>

          <div className="hc-matrix-row">
            <div className="hc-matrix">
              {Array.from({ length: n }).map((_, i) => (
                <div className="hc-matrix-row-inner" key={i}>
                  {Array.from({ length: n }).map((_, j) => (
                    <span key={j}>{keyData.letters[i * n + j]}</span>
                  ))}
                </div>
              ))}
            </div>

            <span className="hc-equals">=</span>

            <StatusMatrixInput
              values={keyInputs}
              statuses={keyStatus}
              disabled={keyLocked}
              n={n}
              onChange={(idx, v) => {
                setKeyInputs((prev) => {
                  const c = [...prev];
                  c[idx] = v;
                  return c;
                });
              }}
            />
          </div>

          <div className="canvas-actions">
            {!keyLocked && (
              <button type="button" className="canvas-btn check-btn" onClick={handleCheckKey}>
                ✓ Check Key Matrix
              </button>
            )}
            {keyLocked && (
              <button type="button" className="canvas-btn decrypt-btn" onClick={handleContinueFromKey}>
                Continue → Step 2
              </button>
            )}
          </div>
        </div>
      );
    }

    if (phase === "grouplist") {
      return (
        <div className="hc-step-block">
          <div className="hc-step-title">
            Step 2 — Convert Plaintext into {n === 2 ? "Digraphs" : "Trigraphs"}
          </div>
          <p className="hc-step-theory">
            The plaintext is split into groups of {n} letters each, matching the size of the
            key matrix. If the final group is short, an 'X' is added to complete it.
          </p>

          <div className="hc-digraph-chips">
            {groups.map((grp, i) => (
              <span className="hc-digraph-chip" key={i}>
                ({grp.split("").join(") (")})
              </span>
            ))}
          </div>

          <div className="canvas-actions">
            <button type="button" className="canvas-btn decrypt-btn" onClick={handleContinueFromGroupList}>
              Continue → Step 3
            </button>
          </div>
        </div>
      );
    }

    if (phase === "number") {
      return (
        <div className="hc-step-block">
          <div className="hc-step-title">
            Step 3 — Number the Group ({groupIndex + 1}/{groups.length}): {currentGroup}
          </div>
          <p className="hc-step-theory">
            Convert every letter of this group into its numeric value using A=0 … Z=25.
          </p>

          <div className="hc-pair-row">
            {currentGroup.split("").map((letter, i) => (
              <div className="letter-column" key={i}>
                <div className="map-box source-box">{letter}</div>
              </div>
            ))}
          </div>

          <div className="word-arrow">↓</div>

          <StatusNumberRow
            values={numberInputs}
            statuses={numberStatus}
            disabled={numberLocked}
            n={n}
            onChange={(i, v) => {
              setNumberInputs((prev) => {
                const c = [...prev];
                c[i] = v;
                return c;
              });
            }}
          />

          <div className="canvas-actions">
            {!numberLocked && (
              <button type="button" className="canvas-btn check-btn" onClick={handleCheckNumbering}>
                ✓ Check Numbers
              </button>
            )}
            {numberLocked && (
              <button type="button" className="canvas-btn decrypt-btn" onClick={handleContinueFromNumbering}>
                Continue → Step 4
              </button>
            )}
          </div>
        </div>
      );
    }

    if (phase === "multiply") {
      return (
        <div className="hc-step-block">
          <div className="hc-step-title">Step 4 — Multiply Key Matrix × Plaintext Vector</div>
          <p className="hc-step-theory">
            Each row of the key matrix is multiplied element-wise with the plaintext number
            vector, and the products in that row are summed to get one result value.
          </p>

          <div className="hc-mult-visual">
            <div className="hc-matrix">
              {groupNums.map((val, i) => (
                <div className="hc-matrix-row-inner" key={i}>
                  <span>{val}</span>
                </div>
              ))}
            </div>

            <span className="hc-equals">×</span>

            <div className="hc-matrix num">
              {Array.from({ length: n }).map((_, i) => (
                <div className="hc-matrix-row-inner" key={i}>
                  {Array.from({ length: n }).map((_, j) => (
                    <span key={j}>{keyData.nums[i * n + j]}</span>
                  ))}
                </div>
              ))}
            </div>

            <span className="hc-equals">=</span>

            <div className="hc-matrix result">
              {Array.from({ length: n }).map((_, i) => (
                <div className="hc-matrix-row-inner" key={i}>
                  <span className="formula-cell">{formulaRowText(i, keyData.nums, groupNums, n)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="word-arrow">↓</div>

          <StatusNumberRow
            values={multiplyInputs}
            statuses={multiplyStatus}
            disabled={multiplyLocked}
            n={n}
            onChange={(i, v) => {
              setMultiplyInputs((prev) => {
                const c = [...prev];
                c[i] = v;
                return c;
              });
            }}
          />

          <div className="canvas-actions">
            {!multiplyLocked && (
              <button type="button" className="canvas-btn check-btn" onClick={handleCheckMultiply}>
                ✓ Check Multiplication
              </button>
            )}
            {multiplyLocked && (
              <button type="button" className="canvas-btn decrypt-btn" onClick={handleContinueFromMultiply}>
                Continue → Step 5
              </button>
            )}
          </div>
        </div>
      );
    }

    if (phase === "mod") {
      return (
        <div className="hc-step-block">
          <div className="hc-step-title">Step 5 — Perform Mod 26</div>
          <p className="hc-step-theory">
            Since letters only go from 0 to 25, every multiplication result is reduced
            modulo 26 (the remainder after dividing by 26) so it wraps back into a valid range.
          </p>

          <p className="hc-formula">({rawVals.join(", ")}) mod 26 = ?</p>

          <StatusNumberRow
            values={modInputs}
            statuses={modStatus}
            disabled={modLocked}
            n={n}
            onChange={(i, v) => {
              setModInputs((prev) => {
                const c = [...prev];
                c[i] = v;
                return c;
              });
            }}
          />

          <div className="canvas-actions">
            {!modLocked && (
              <button type="button" className="canvas-btn check-btn" onClick={handleCheckMod}>
                ✓ Check Mod 26
              </button>
            )}
            {modLocked && (
              <button type="button" className="canvas-btn decrypt-btn" onClick={handleContinueFromMod}>
                Continue → Step 6
              </button>
            )}
          </div>
        </div>
      );
    }

    if (phase === "translate") {
      return (
        <div className="hc-step-block">
          <div className="hc-step-title">Step 6 — Translate Numbers to Cipher Letters</div>
          <p className="hc-step-theory">
            Finally, convert each mod-26 number back into its alphabet letter (0=A … 25=Z)
            to get the ciphertext for this group.
          </p>

          <p className="hc-formula">{modVals.join(" , ")} → ?</p>

          <StatusLetterRow
            values={translateInputs}
            statuses={translateStatus}
            disabled={translateLocked}
            n={n}
            onChange={(i, v) => {
              setTranslateInputs((prev) => {
                const c = [...prev];
                c[i] = v;
                return c;
              });
            }}
          />

          <div className="canvas-actions">
            {!translateLocked && (
              <button type="button" className="canvas-btn check-btn" onClick={handleCheckTranslate}>
                ✓ Check Cipher Letters
              </button>
            )}
            {translateLocked && (
              <button type="button" className="canvas-btn decrypt-btn" onClick={handleNextGroup}>
                {groupIndex + 1 < groups.length ? "Next Group →" : "Finish Word →"}
              </button>
            )}
          </div>
        </div>
      );
    }

    if (phase === "worddone") {
      const fullCipher = cipherGroups.join("");
      return (
        <div className="hc-step-block">
          <div className="hc-step-title">✔ Encryption Complete</div>

          <div className="default-word-preview">
            <span>Plaintext:</span>
            <b>{plainText.trim().toUpperCase()}</b>
            <span>→</span>
            <b>{fullCipher}</b>
          </div>

          <div className="canvas-actions">
            <button type="button" className="canvas-btn new-word-btn" onClick={handleNewWord}>
              ＋ New Word
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="Caesar-root hc-root">

      <header className="exp-header">
        <button type="button" className="btn-back" onClick={() => navigate("/ifs-experiments")}>
          ← Back
        </button>

        <h1 className="exp-title">
          Experiment 7 : Hill Cipher Encryption (2×2 / 3×3 Key Matrix)
        </h1>

        <button type="button" className="btn-help" onClick={() => setHelpOpen(true)}>
          ? Help
        </button>
      </header>

      <section className="card">
        <h2 className="section-heading orange">Aim</h2>
        <p>
          To encrypt a message using the Hill Cipher technique with a selectable 2×2 or 3×3
          key matrix, and study multi-letter substitution cryptography.
        </p>
      </section>

      <section className="card">
        <div className="collapsible-header" onClick={() => setTheoryOpen((v) => !v)}>
          <h2 className="section-heading orange">Theory</h2>
          <span className="chevron">{theoryOpen ? "▲" : "▼"}</span>
        </div>

        {theoryOpen && (
          <div className="collapsible-body">
            <p>
              Hill Cipher is a multi-letter cipher developed by mathematician Lester Hill in 1929.
              It works on multiple letters at the same time instead of one letter at a time.
            </p>
            <p>
              The encryption algorithm takes m successive plaintext letters and substitutes them
              with m ciphertext letters. The substitution is determined by m linear equations, in
              which each character is assigned a numerical value (A = 0, B = 1, … Z = 25).
            </p>
            <p>
              The keyword is converted into a key matrix (2×2 or 3×3), the plaintext is grouped
              into digraphs/trigraphs, each group is multiplied by the key matrix, the result is
              reduced modulo 26, and finally converted back into letters to get the ciphertext.
            </p>
          </div>
        )}
      </section>

      <section className="card">
        <div className="collapsible-header" onClick={() => setProcOpen((v) => !v)}>
          <h2 className="section-heading orange">Procedure</h2>
          <span className="chevron">{procOpen ? "▲" : "▼"}</span>
        </div>

        {procOpen && (
          <div className="collapsible-body proc-grid">
            <ol className="proc-col">
              <li>Select a matrix size (2×2 or 3×3).</li>
              <li>Enter a plaintext and a matching-length keyword.</li>
              <li>Click Start Encryption.</li>
            </ol>
            <ol className="proc-col" start="4">
              <li>Convert the keyword into its numeric key matrix.</li>
              <li>For each group — number, multiply, mod 26, and translate to cipher letters.</li>
              <li>Complete {REQUIRED_SUCCESS} full words to unlock the Assignment tab.</li>
            </ol>
          </div>
        )}
      </section>

      {/* ===================================================
          STEP TABS
      =================================================== */}

      <div className="caesar-step-tabs">
        <button
          type="button"
          className={`caesar-step-tab ${screen === "simulation" ? "active" : ""}`}
          onClick={() => goToScreen("simulation")}
        >
          1. Simulation {simulationComplete && "✓"}
        </button>

        <button
          type="button"
          className={`caesar-step-tab ${screen === "assignment" ? "active" : ""}`}
          onClick={() => goToScreen("assignment")}
        >
          2. Assignment {quizSubmitted && "✓"}
        </button>
      </div>

      {/* ===================================================
          SIMULATION SCREEN
      =================================================== */}

      {screen === "simulation" && (
        <>
          <div className="sim-row">

            <aside className="card inputs-panel">
              <h3 className="panel-heading">Inputs</h3>

              <label className="field-label">Matrix Size</label>
              <div className="hc-size-toggle">
                <button
                  type="button"
                  className={`hc-size-btn ${matrixSize === 2 ? "active" : ""}`}
                  disabled={mode !== null}
                  onClick={() => handleMatrixSizeChange(2)}
                >
                  2 × 2
                </button>
                <button
                  type="button"
                  className={`hc-size-btn ${matrixSize === 3 ? "active" : ""}`}
                  disabled={mode !== null}
                  onClick={() => handleMatrixSizeChange(3)}
                >
                  3 × 3
                </button>
              </div>

              <label className="field-label">Plain Text</label>
              <input
                type="text"
                className="text-input"
                value={plainText}
                disabled={mode !== null}
                maxLength={24}
                placeholder="e.g. java"
                onChange={(e) => setPlainText(e.target.value)}
              />

              <label className="field-label">
                Keyword ({requiredKeyLen} letters)
              </label>
              <input
                type="text"
                className="text-input"
                value={keyword}
                disabled={mode !== null}
                maxLength={requiredKeyLen}
                placeholder={matrixSize === 2 ? "e.g. HILL" : `e.g. ${requiredKeyLen}-letter word`}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <span className="char-count">{keyword.trim().length}/{requiredKeyLen}</span>

              <div className="action-buttons">
                {!mode && (
                  <button type="button" className="btn-verify full-width" onClick={handleStart}>
                    🔒 Start Encryption
                  </button>
                )}

                <button type="button" className="btn-reset full-width" onClick={handleReset}>
                  ↺ Reset
                </button>
              </div>
            </aside>

            <div className="card canvas-panel">
              <h3 className="panel-heading">Simulation Canvas</h3>
              <div className="canvas-area hc-canvas-area">
                {renderSimulationCanvas()}
              </div>
            </div>

            <aside className="card analysis-panel">
              <h3 className="panel-heading orange">Live Analysis</h3>

              <div className="analysis-block">
                <h4 className="analysis-sub">Current Progress</h4>

                <table className="analysis-table">
                  <tbody>
                    <tr>
                      <td>Matrix Size</td>
                      <td>:</td>
                      <td>{matrixSize} x {matrixSize}</td>
                    </tr>
                    <tr>
                      <td>Keyword</td>
                      <td>:</td>
                      <td>{keyword ? keyword.toUpperCase() : "—"}</td>
                    </tr>
                    <tr>
                      <td>Group</td>
                      <td>:</td>
                      <td>{mode ? `${groupIndex + 1}/${groups.length}` : "—"}</td>
                    </tr>
                    <tr>
                      <td>Current Step</td>
                      <td>:</td>
                      <td>
                        {!mode
                          ? "—"
                          : phase === "key"
                          ? "Key Matrix"
                          : phase === "grouplist"
                          ? "Grouping"
                          : phase === "number"
                          ? "Numbering"
                          : phase === "multiply"
                          ? "Multiplication"
                          : phase === "mod"
                          ? "Mod 26"
                          : phase === "translate"
                          ? "Translate"
                          : "Done"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {cipherGroups.length > 0 && (
                <div className="analysis-block correct-analysis">
                  <h4 className="analysis-sub">Ciphertext So Far</h4>
                  <p className="conclusion-text">{cipherGroups.join("")}</p>
                </div>
              )}
            </aside>

          </div>

          <section className="card table-section">
            <h3 className="panel-heading orange">Observation Table</h3>

            <div className="table-scroll">
              <table className="obs-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Plaintext Word</th>
                    <th>Keyword</th>
                    <th>Matrix Size</th>
                    <th>Cipher Text</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {observations.length === 0 ? (
                    <tr>
                      <td colSpan="6">No word completed yet.</td>
                    </tr>
                  ) : (
                    observations.map((row, index) => (
                      <tr key={index} className="row-correct">
                        <td>{index + 1}</td>
                        <td>{row.word}</td>
                        <td>{row.keyword}</td>
                        <td>{row.matrix}</td>
                        <td>{row.cipher}</td>
                        <td>✔ Correct</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="submit-status sim-status">
              <p>
                Successful Words Completed:
                <b> {successfulAttempts}/{REQUIRED_SUCCESS}</b>
                <br />
                {successfulAttempts < REQUIRED_SUCCESS
                  ? `Complete ${REQUIRED_SUCCESS - successfulAttempts} more full word(s) to unlock the Assignment tab.`
                  : "✔ Simulation completed. Assignment tab unlocked below."}
              </p>
            </div>
          </section>
        </>
      )}

      {/* ===================================================
          ASSIGNMENT SCREEN
      =================================================== */}

      {screen === "assignment" && (
        <section className="card quiz-card">
          <h3 className="panel-heading orange">Assignment ({QUIZ.length} Questions)</h3>
          <p className="input-hint">
            Answer all questions based on the Hill Cipher simulation you just completed.
          </p>

          {QUIZ.map((item, qIdx) => (
            <div key={qIdx} className="quiz-item">
              <p className="quiz-question">{qIdx + 1}. {item.q}</p>

              <div className="quiz-options">
                {item.options.map((opt, oIdx) => {
                  let cls = "quiz-option";

                  if (quizSubmitted) {
                    if (oIdx === item.correct) cls += " correct";
                    else if (oIdx === quizAnswers[qIdx]) cls += " wrong";
                  } else if (quizAnswers[qIdx] === oIdx) {
                    cls += " selected";
                  }

                  return (
                    <div
                      key={oIdx}
                      className={cls}
                      onClick={() => {
                        if (quizSubmitted) return;
                        setQuizAnswers((prev) => prev.map((v, i) => (i === qIdx ? oIdx : v)));
                      }}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ===================================================
          SUBMIT
      =================================================== */}

      <section className="submit-section">
        <button
          type="button"
          className={`btn-submit ${canSubmit && !submitted ? "enabled" : "disabled"}`}
          disabled={!canSubmit || submitted}
          onClick={handleSubmit}
        >
          {submitted ? "Submitted" : "Submit Experiment"}
        </button>

        <div className="submit-status">
          {submitted ? (
            <p className="submit-success">Experiment Submitted Successfully</p>
          ) : (
            <p>
              Simulation: <b>{simulationComplete ? "✔ Complete" : `${successfulAttempts}/${REQUIRED_SUCCESS}`}</b>
              {"  |  "}
              Assignment: <b>{quizSubmitted ? `✔ ${quizScore}/${QUIZ.length}` : "Pending"}</b>
            </p>
          )}
        </div>
      </section>

      {/* ===================================================
          HELP (BASED ON REFERENCE NOTES)
      =================================================== */}

      {helpOpen && (
        <div className="popup-overlay" onClick={() => setHelpOpen(false)}>
          <div className="popup-box help-popup hc-help-popup" onClick={(e) => e.stopPropagation()}>
            <h3 className="section-heading orange">Hill Cipher</h3>

            <p>
              Another interesting multi-letter cipher is the Hill cipher, developed by the
              mathematician Lester Hill in 1929. Hill cipher works on multiple letters at the same time.
            </p>

            <p>
              The encryption algorithm takes m successive plaintext letters and substitutes for them
              m ciphertext letters. The substitution is determined by m linear equations in which
              each character is assigned a numerical value (a = 0, b = 1, … z = 25).
            </p>

            <h4 className="hc-help-subhead">Encryption Process:</h4>
            <ol className="hc-help-list">
              <li>First convert the key word into key matrix (2 × 2) or (3 × 3). If keyword not provided, select any random key matrix.</li>
              <li>Convert plaintext into diagraph for 2 × 2 key matrix or trigraph for 3 × 3 key matrix.</li>
              <li>Number the plain text alphabets in diagraph or trigraph (A = 0 …… Z = 25).</li>
              <li>Multiply two matrices, plain text matrix and key matrix.</li>
              <li>Perform mod 26 of above resultant matrix.</li>
              <li>Again, translate the numbers to alphabets to get cipher text.</li>
            </ol>

            <h4 className="hc-help-subhead">Example (2 × 2):</h4>
            <p>Keyword = HILL, Plaintext = java</p>
            <p>Key matrix: [H I / L L] = [7 8 / 11 11]</p>
            <p>Digraphs: (J A) (V A) → numbers (9,0) and (21,0)</p>
            <p>(9,0) × [7 8 / 11 11] = (63, 99) → mod 26 = (11, 21) → LV</p>
            <p>(21,0) × [7 8 / 11 11] = (147, 231) → mod 26 = (17, 23) → RX</p>
            <p><b>Result: java → lvrx</b></p>

            <button type="button" className="btn-verify full-width" onClick={() => setHelpOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}