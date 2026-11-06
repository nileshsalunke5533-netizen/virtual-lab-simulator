import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { buildIfsResult } from "../../../utils/ifsResult.js";
import "./IFSExperiment4.css";

/* =========================================================
   IFS EXPERIMENT 4
   Use of Keylogger and Anti-Keylogger to Secure Your System

   SAFE VIRTUAL LAB:
   This simulation does NOT capture real system-wide keyboard input.
   All keylogger activity is represented by simulated
   drag-and-drop components.
========================================================= */

const REQUIRED_SUCCESSFUL_ATTEMPTS = 1;

const STEPS = [
  "Input",
  "Keylogger",
  "Detection",
  "Protection",
  "Verification",
];

const ASSIGNMENT_QUESTIONS = [
  {
    question: "What is the objective of this practical?",
    correctAnswer: 0,
    options: [
      "To simulate detecting and blocking keylogging activity",
      "To install a keylogger on the computer",
      "To collect real keystrokes from the operating system",
      "To test network download speed",
    ],
  },
  {
    question: "Why does this simulation use sample text instead of capturing real keyboard input?",
    correctAnswer: 1,
    options: [
      "To make the simulation run faster",
      "To keep the activity safe and avoid collecting real input",
      "To prevent the scanner from working",
      "To save the text as a password",
    ],
  },
  {
    question: "What does the Sample Input represent in the experiment?",
    correctAnswer: 2,
    options: [
      "A security alert",
      "A protection rule",
      "Benign test text entered for the simulation",
      "A network connection",
    ],
  },
  {
    question: "What is the purpose of the Keyboard Input zone?",
    correctAnswer: 3,
    options: [
      "To display the experiment score",
      "To verify the protection shield",
      "To scan installed applications",
      "To receive the sample input component",
    ],
  },
  {
    question: "What role does the simulated keylogger component represent?",
    correctAnswer: 0,
    options: [
      "Software that could monitor keystrokes without authorization",
      "A tool for encrypting files",
      "A firewall rule",
      "A keyboard driver update",
    ],
  },
  {
    question: "Why is the keylogger placed in the Monitoring Zone during the simulation?",
    correctAnswer: 1,
    options: [
      "To start the experiment",
      "To represent the monitoring behavior being examined",
      "To record a successful attempt",
      "To clear the observations table",
    ],
  },
  {
    question: "What is the purpose of the Scanner component?",
    correctAnswer: 2,
    options: [
      "To enter sample text",
      "To reset the simulation",
      "To identify suspicious activity in the simulation",
      "To submit the experiment",
    ],
  },
  {
    question: "Which zone represents detection of suspicious activity?",
    correctAnswer: 3,
    options: [
      "Keyboard Input Zone",
      "Protection Zone",
      "Monitoring Zone",
      "Detection Zone",
    ],
  },
  {
    question: "What observation indicates that keylogging activity has been detected?",
    correctAnswer: 0,
    options: [
      "The detection result is marked as Detected",
      "The sample text field is empty",
      "The experiment returns to the first step",
      "The submit button changes its label",
    ],
  },
  {
    question: "What does the Anti-Keylogger Shield represent?",
    correctAnswer: 1,
    options: [
      "A way to collect more sample text",
      "A protective control that blocks the simulated activity",
      "A component that creates monitoring activity",
      "A record of incorrect placements",
    ],
  },
  {
    question: "Why should suspicious activity be detected before protection is applied?",
    correctAnswer: 2,
    options: [
      "So the sample input can be changed",
      "So the attempt count can be reset",
      "So the threat can be identified before applying a response",
      "So monitoring can continue without review",
    ],
  },
  {
    question: "What is the correct order of the four drag-and-drop steps?",
    correctAnswer: 3,
    options: [
      "Scanner, Shield, Sample Input, Keylogger",
      "Shield, Scanner, Keylogger, Sample Input",
      "Keylogger, Sample Input, Shield, Scanner",
      "Sample Input, Keylogger, Scanner, Shield",
    ],
  },
  {
    question: "What happens when a component is dropped into the wrong zone?",
    correctAnswer: 0,
    options: [
      "The simulation shows an error and does not advance",
      "Protection is automatically verified",
      "The experiment is submitted",
      "The component is recorded as successful",
    ],
  },
  {
    question: "What must be completed before Verify Protection can succeed?",
    correctAnswer: 1,
    options: [
      "The observations must be deleted",
      "All required components must be placed in the correct zones",
      "The page must be refreshed",
      "The experiment must be submitted first",
    ],
  },
  {
    question: "What result is recorded after protection is verified successfully?",
    correctAnswer: 2,
    options: [
      "Activity Pending",
      "Detection Failed",
      "Protected",
      "Input Rejected",
    ],
  },
  {
    question: "How do the observations help you review each attempt?",
    correctAnswer: 0,
    options: [
      "They show the input, detection, protection, and result",
      "They change the experiment instructions",
      "They reveal real keystrokes from the device",
      "They disable the simulation controls",
    ],
  },
  {
    question: "Why is it useful to repeat the practical?",
    correctAnswer: 1,
    options: [
      "To remove the need for detection",
      "To practice the workflow and confirm consistent results",
      "To install additional software",
      "To collect real user credentials",
    ],
  },
  {
    question: "How can security software help reduce the risk of keylogging?",
    correctAnswer: 2,
    options: [
      "By disabling all user input",
      "By saving every keystroke to a file",
      "By helping detect or block suspicious monitoring behavior",
      "By making passwords public",
    ],
  },
  {
    question: "Which is a safe practice when entering sensitive information?",
    correctAnswer: 0,
    options: [
      "Use trusted devices and keep their security software updated",
      "Enter credentials into any pop-up that requests them",
      "Reuse the same password on every service",
      "Ignore unexpected security warnings",
    ],
  },
  {
    question: "How do detection and protection work together in this practical?",
    correctAnswer: 2,
    options: [
      "Detection records the input, then protection starts monitoring",
      "Protection identifies the threat, then detection disables the scanner",
      "Detection identifies suspicious activity, then protection blocks it",
      "Both steps collect real keyboard input",
    ],
  },
];

export default function IFSExperiment4() {
  const navigate = useNavigate();

  /* =========================================================
     UI STATE
  ========================================================= */

  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procedureOpen, setProcedureOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("simulation");
  const [assignmentAnswers, setAssignmentAnswers] = useState({});

  /* =========================================================
     INPUT
  ========================================================= */

  const [sampleText, setSampleText] = useState("");

  /* =========================================================
     SIMULATION
  ========================================================= */

  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);

  const [inputPlaced, setInputPlaced] = useState(false);
  const [keyloggerPlaced, setKeyloggerPlaced] = useState(false);
  const [scannerPlaced, setScannerPlaced] = useState(false);
  const [shieldPlaced, setShieldPlaced] = useState(false);
  const [verified, setVerified] = useState(false);

  /* =========================================================
     OBSERVATIONS / ATTEMPTS
  ========================================================= */

  const [observations, setObservations] = useState([]);

  const [successfulAttempts, setSuccessfulAttempts] =
    useState(0);

  const [submitted, setSubmitted] = useState(false);

  /* =========================================================
     POPUP
  ========================================================= */

  const [popup, setPopup] = useState("");

  const showPopup = (message) => {
    setPopup(message);
  };

  /* =========================================================
     RESET CURRENT SIMULATION
     
     IMPORTANT:
     Successful attempt count is NOT cleared.
     This allows the student to perform the experiment
    multiple times until the required successful attempt count.
  ========================================================= */

  const resetSimulation = () => {
    setSampleText("");
    setStarted(false);
    setPhase(0);
    setDraggedItem(null);

    setInputPlaced(false);
    setKeyloggerPlaced(false);
    setScannerPlaced(false);
    setShieldPlaced(false);
    setVerified(false);

    setActiveTab("simulation");
    setPopup("");
  };

  /* =========================================================
     START EXPERIMENT
  ========================================================= */

  const startExperiment = () => {
    if (!sampleText.trim()) {
      showPopup(
        "Please enter sample text before starting the experiment."
      );
      return;
    }

    setStarted(true);
    setPhase(0);
    setVerified(false);
    setPopup(
      "Experiment started. Drag the highlighted Sample Input to the Keyboard Input zone."
    );
  };

  /* =========================================================
     DRAG START
  ========================================================= */

  const handleDragStart = (item) => {
    if (!started) {
      showPopup("Start the experiment first.");
      return;
    }

    setDraggedItem(item);
  };

  /* =========================================================
     DROP
  ========================================================= */

  const handleDrop = (target) => {
    if (!started || !draggedItem) return;

    const correct =
      (phase === 0 &&
        draggedItem === "sample" &&
        target === "keyboard") ||
      (phase === 1 &&
        draggedItem === "keylogger" &&
        target === "monitoring") ||
      (phase === 2 &&
        draggedItem === "scanner" &&
        target === "detection") ||
      (phase === 3 &&
        draggedItem === "shield" &&
        target === "protection");

    if (!correct) {
      setDraggedItem(null);

      showPopup(
        "❌ Wrong placement! Follow the highlighted instruction and drag the correct component to its matching zone."
      );

      return;
    }

    /* STEP 1 */
    if (phase === 0) {
      setInputPlaced(true);
      setPhase(1);

      showPopup(
        "✅ Correct! Now drag the Keylogger to the Monitoring Zone."
      );
    }

    /* STEP 2 */
    else if (phase === 1) {
      setKeyloggerPlaced(true);
      setPhase(2);

      showPopup(
        "✅ Keylogger placed. Now drag the Scanner to the Detection Zone."
      );
    }

    /* STEP 3 */
    else if (phase === 2) {
      setScannerPlaced(true);
      setPhase(3);

      showPopup(
        "✅ Suspicious keylogging activity detected. Now drag the Anti-Keylogger Shield to the Protection Zone."
      );
    }

    /* STEP 4 */
    else if (phase === 3) {
      setShieldPlaced(true);
      setPhase(4);

      showPopup(
        "✅ Protection component placed. Click Verify Protection to finish the simulation."
      );
    }

    setDraggedItem(null);
  };

  /* =========================================================
     VERIFY PROTECTION
  ========================================================= */

  const verifyProtection = () => {
    if (phase !== 4 || !shieldPlaced) {
      showPopup(
        "Complete all drag-and-drop steps first."
      );
      return;
    }

    if (verified) return;

    setVerified(true);

    /* Increase successful attempts */
    setSuccessfulAttempts((prev) =>
      Math.min(prev + 1, REQUIRED_SUCCESSFUL_ATTEMPTS)
    );

    /* Store observation */
    setObservations((prev) => [
      ...prev,
      {
        sr: prev.length + 1,
        input: sampleText.toUpperCase(),
        detection: "Detected",
        protection: "Active",
        result: "Protected",
      },
    ]);

    showPopup(
      "✅ Verification successful! The simulated keylogging activity has been blocked."
    );
  };

  /* =========================================================
     SUBMIT EXPERIMENT
  ========================================================= */

  const submitExperiment = () => {
    if (successfulAttempts < REQUIRED_SUCCESSFUL_ATTEMPTS) {
      return;
    }

    if (submitted) {
      return;
    }

    if (Object.keys(assignmentAnswers).length < ASSIGNMENT_QUESTIONS.length) {
      setActiveTab("assignment");
      showPopup("Please answer all 20 assignment questions before submitting the experiment.");
      return;
    }

    const quizScore = ASSIGNMENT_QUESTIONS.reduce(
      (score, question, index) =>
        score + (assignmentAnswers[index] === question.correctAnswer ? 1 : 0),
      0
    );

    const resultData = buildIfsResult({
      completed: true,
      experimentNo: 4,
      experimentName:
        "Use of Keylogger and Anti-Keylogger to Secure Your System",
      experimentRoute: "/ifs-experiment-4",
      observations,
      verified,
      successfulAttempts,
      totalRequiredAttempts: REQUIRED_SUCCESSFUL_ATTEMPTS,
      simulationCompleted:
        successfulAttempts >= REQUIRED_SUCCESSFUL_ATTEMPTS,
      quizScore,
      quizTotal: ASSIGNMENT_QUESTIONS.length,
      correctCount: quizScore,
      incorrectCount: ASSIGNMENT_QUESTIONS.length - quizScore,
      quizQuestions: ASSIGNMENT_QUESTIONS,
      quizAnswers: assignmentAnswers,
      date: new Date().toISOString(),
    });

    try {
      localStorage.setItem(
        "IFSExperiment4Observations",
        JSON.stringify(observations)
      );
      localStorage.setItem(
        "IFSExperiment4Status",
        JSON.stringify(resultData)
      );
      localStorage.setItem("assignmentResult", JSON.stringify(resultData));
    } catch (error) {
      console.error("Error saving Experiment 4 result:", error);
    }

    setSubmitted(true);
    navigate("/result", {
      state: resultData,
    });
  };

  /* =========================================================
     DRAG ITEM
  ========================================================= */

  const renderDragItem = (
    type,
    icon,
    title,
    instruction,
    used
  ) => {
    const active =
      started &&
      ((phase === 0 && type === "sample") ||
        (phase === 1 && type === "keylogger") ||
        (phase === 2 && type === "scanner") ||
        (phase === 3 && type === "shield"));

    return (
      <div
        draggable={started && !used}
        onDragStart={() =>
          handleDragStart(type)
        }
        onDragEnd={() =>
          setDraggedItem(null)
        }
        className={`drag-item ${
          active ? "drag-highlight" : ""
        } ${
          used ? "drag-used" : ""
        }`}
      >
        <span className="drag-icon">
          {icon}
        </span>

        <span className="drag-content">
          <b>{title}</b>

          <small>
            {used
              ? "Placed ✓"
              : instruction}
          </small>
        </span>

        {!used && started && (
          <span className="drag-handle">
            ⋮⋮
          </span>
        )}
      </div>
    );
  };

  /* =========================================================
     DROP ZONE
  ========================================================= */

  const renderDropZone = (
    target,
    icon,
    title,
    subtitle,
    completed,
    active
  ) => (
    <div
      className={`drop-zone ${
        active ? "drop-active" : ""
      } ${
        completed
          ? "drop-completed"
          : ""
      }`}
      onDragOver={(e) =>
        e.preventDefault()
      }
      onDrop={(e) => {
        e.preventDefault();
        handleDrop(target);
      }}
    >
      <div className="drop-icon">
        {completed ? "✓" : icon}
      </div>

      <b>{title}</b>

      <small>
        {completed
          ? "Correctly placed"
          : subtitle}
      </small>
    </div>
  );

  /* =========================================================
     SIMULATION CANVAS
  ========================================================= */

  const renderCanvas = () => {
    /* DEFAULT PREVIEW */
    if (!started) {
      return (
        <div className="default-preview">
          <div className="preview-card">
            <div className="preview-title">
              Keylogger & Anti-Keylogger
              Simulation
            </div>

            <p>
              Enter sample text and start
              the experiment. Then manually
              drag each component into its
              correct drop zone.
            </p>

            <div className="preview-flow">
              <span>⌨️ Input</span>
              <b>→</b>

              <span>🕵️ Keylogger</span>
              <b>→</b>

              <span>🔎 Detection</span>
              <b>→</b>

              <span>🛡️ Protection</span>
            </div>

            <div className="preview-note">
              <b>Important:</b>{" "}
              This is a virtual educational
              simulation. It does not monitor
              real keyboard activity.
            </div>
          </div>
        </div>
      );
    }

    /* ACTIVE SIMULATION */
    return (
      <div className="simulation-canvas">

        <div className="canvas-instruction">
          <span>
            Step {phase + 1} of 5
          </span>

          <b>
            {phase === 0 &&
              "Drag Sample Input → Keyboard Input"}

            {phase === 1 &&
              "Drag Keylogger → Monitoring Zone"}

            {phase === 2 &&
              "Drag Scanner → Detection Zone"}

            {phase === 3 &&
              "Drag Anti-Keylogger → Protection Zone"}

            {phase === 4 &&
              "Click Verify Protection"}
          </b>
        </div>

        <div className="system-flow">

          <div
            className={`system-node ${
              inputPlaced
                ? "node-done"
                : ""
            }`}
          >
            <span>👤</span>
            <b>User</b>
          </div>

          <div className="flow-arrow">
            →
          </div>

          {renderDropZone(
            "keyboard",
            "⌨️",
            "Keyboard Input",
            "Drop Sample Input",
            inputPlaced,
            phase === 0
          )}

          <div className="flow-arrow">
            →
          </div>

          {renderDropZone(
            "monitoring",
            "🕵️",
            "Monitoring Zone",
            "Drop Keylogger",
            keyloggerPlaced,
            phase === 1
          )}

          <div className="flow-arrow">
            →
          </div>

          {renderDropZone(
            "detection",
            "🔎",
            "Detection Zone",
            "Drop Scanner",
            scannerPlaced,
            phase === 2
          )}

          <div className="flow-arrow">
            →
          </div>

          {renderDropZone(
            "protection",
            "🛡️",
            "Protection Zone",
            "Drop Anti-Keylogger",
            shieldPlaced,
            phase === 3
          )}
        </div>

        <div className="sample-display-card">
          <span>
            SIMULATED KEYBOARD INPUT
          </span>

          <b>
            {sampleText.toUpperCase()}
          </b>
        </div>

        {phase === 4 && (
          <div className="verification-area">

            <div className="security-chain">

              <div>
                ⌨️
                <small>Input</small>
              </div>

              <span>→</span>

              <div>
                🕵️
                <small>Detected</small>
              </div>

              <span>→</span>

              <div>
                🚫
                <small>Blocked</small>
              </div>

              <span>→</span>

              <div>
                🛡️
                <small>Protected</small>
              </div>

            </div>

            {!verified ? (
              <button
                className="verify-canvas-btn"
                onClick={
                  verifyProtection
                }
              >
                ✓ Verify Protection
              </button>
            ) : (
              <div className="verified-message">
                ✓ SYSTEM PROTECTED —
                Verification Passed
              </div>
            )}

          </div>
        )}
      </div>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="ifs4-root">

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
          Experiment 4:
          Keylogger & Anti-Keylogger
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
          SEPARATE - NO DROPDOWN
      ===================================================== */}

      <section className="card aim-card">

        <h2 className="section-heading orange">
          Aim
        </h2>

        <p>
          To understand the concept of
          keylogging and demonstrate how
          anti-keylogger protection can
          detect and block unauthorized
          keylogging activity.
        </p>

      </section>

      {/* =====================================================
          THEORY
          SEPARATE COLLAPSIBLE CARD
      ===================================================== */}

      <section className="card theory-card">

        <div
          className="collapsible-header"
          onClick={() =>
            setTheoryOpen(
              (value) => !value
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
              A keylogger represents a
              mechanism that records keyboard
              input.
            </p>

            <p>
              Anti-keylogger protection helps
              identify suspicious monitoring
              and prevent unauthorized
              collection of keyboard
              information.
            </p>

            <p>
              In this virtual experiment,
              keylogging and anti-keylogging
              activities are represented using
              simulated drag-and-drop
              components.
            </p>

          </div>
        )}

      </section>

      {/* =====================================================
          PROCEDURE
      ===================================================== */}

      <section className="card procedure-card">

        <div
          className="collapsible-header"
          onClick={() =>
            setProcedureOpen(
              (value) => !value
            )
          }
        >

          <h2 className="section-heading orange">
            Procedure
          </h2>

          <span className="chevron">
            {procedureOpen
              ? "▲"
              : "▼"}
          </span>

        </div>

        {procedureOpen && (
          <div className="collapsible-body proc-grid">

            <ol className="proc-col">

              <li>
                Enter harmless sample text.
              </li>

              <li>
                Click Start Experiment.
              </li>

              <li>
                Drag Sample Input to
                Keyboard Input.
              </li>

              <li>
                Drag Keylogger to
                Monitoring Zone.
              </li>

            </ol>

            <ol
              className="proc-col"
              start="5"
            >

              <li>
                Drag Scanner to
                Detection Zone.
              </li>

              <li>
                Drag Anti-Keylogger to
                Protection Zone.
              </li>

              <li>
                Click Verify Protection.
              </li>

              <li>
                Repeat the experiment
                successfully once to complete
                the practical.
              </li>

            </ol>

          </div>
        )}

      </section>

      {/* =====================================================
          TABS
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

          {verified && (
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
                INPUT PANEL
            ================================================= */}

            <aside className="card inputs-panel">

              <h3 className="panel-heading">
                Input Panel
              </h3>

              <label className="field-label">
                Enter Sample Text
              </label>

              <input
                className="text-input"
                type="text"
                value={sampleText}
                disabled={started}
                maxLength={24}
                placeholder="e.g. HELLO"
                onChange={(e) =>
                  setSampleText(
                    e.target.value
                      .toUpperCase()
                      .replace(
                        /[^A-Z ]/g,
                        ""
                      )
                  )
                }
              />

              <span className="char-count">
                {sampleText.length}/24
              </span>

              <p className="input-note">
                Use only sample text for the
                virtual experiment. Real
                system-wide keystrokes are
                never captured.
              </p>

              <div className="drag-heading">

                <b>
                  DRAG & DROP COMPONENTS
                </b>

                <small>
                  Follow the highlighted step
                </small>

              </div>

              <div className="drag-items">

                {renderDragItem(
                  "sample",
                  "⌨️",
                  "Sample Input",
                  "Drag → Keyboard Input",
                  inputPlaced
                )}

                {renderDragItem(
                  "keylogger",
                  "🕵️",
                  "Keylogger",
                  "Drag → Monitoring Zone",
                  keyloggerPlaced
                )}

                {renderDragItem(
                  "scanner",
                  "🔎",
                  "Detection Scanner",
                  "Drag → Detection Zone",
                  scannerPlaced
                )}

                {renderDragItem(
                  "shield",
                  "🛡️",
                  "Anti-Keylogger",
                  "Drag → Protection Zone",
                  shieldPlaced
                )}

              </div>

              <div className="action-buttons">

                {!started && (
                  <button
                    className="btn-start full-width"
                    onClick={
                      startExperiment
                    }
                  >
                    ▶ Start Experiment
                  </button>
                )}

                <button
                  className="btn-reset full-width"
                  onClick={
                    resetSimulation
                  }
                >
                  ↺ Reset
                </button>

              </div>

            </aside>

            {/* =================================================
                SIMULATION CANVAS
            ================================================= */}

            <section className="card canvas-panel">

              <h3 className="panel-heading">
                Simulation Canvas
              </h3>

              <div className="canvas-area">
                {renderCanvas()}
              </div>

            </section>

            {/* =================================================
                LIVE ANALYSIS
            ================================================= */}

            <aside className="card analysis-panel">

              <h3 className="panel-heading orange">
                Live Analysis
              </h3>

              <div className="analysis-block">

                <h4 className="analysis-sub">
                  Current Progress
                </h4>

                <table className="analysis-table">

                  <tbody>

                    <tr>
                      <td>Input</td>
                      <td>:</td>
                      <td>
                        {inputPlaced
                          ? "Placed ✓"
                          : "Pending"}
                      </td>
                    </tr>

                    <tr>
                      <td>Keylogger</td>
                      <td>:</td>
                      <td>
                        {keyloggerPlaced
                          ? "Detected ✓"
                          : "Pending"}
                      </td>
                    </tr>

                    <tr>
                      <td>Detection</td>
                      <td>:</td>
                      <td>
                        {scannerPlaced
                          ? "Complete ✓"
                          : "Pending"}
                      </td>
                    </tr>

                    <tr>
                      <td>Protection</td>
                      <td>:</td>
                      <td>
                        {shieldPlaced
                          ? "Active ✓"
                          : "Inactive"}
                      </td>
                    </tr>

                    <tr>
                      <td>Verification</td>
                      <td>:</td>
                      <td>
                        {verified
                          ? "Passed ✓"
                          : "Pending"}
                      </td>
                    </tr>

                  </tbody>

                </table>

              </div>

              <div
                className={`security-status ${
                  verified
                    ? "secure"
                    : ""
                }`}
              >

                <div className="status-icon">
                  {verified
                    ? "🛡️"
                    : "⚠️"}
                </div>

                <b>
                  {verified
                    ? "SYSTEM PROTECTED"
                    : "PROTECTION PENDING"}
                </b>

                <small>
                  {verified
                    ? "Simulated keylogging activity blocked."
                    : "Complete the drag-and-drop steps."}
                </small>

              </div>

              <div className="current-step-box">

                <span>
                  Current Step
                </span>

                <b>
                  {started
                    ? `${phase + 1}. ${
                        STEPS[phase]
                      }`
                    : "Not Started"}
                </b>

              </div>

            </aside>

          </div>

          {/* =================================================
              OBSERVATION TABLE
          ================================================= */}

          <section className="card observation-section">

            <h3 className="panel-heading orange">
              Observation Table
            </h3>

            <div className="table-scroll">

              <table className="obs-table">

                <thead>

                  <tr>
                    <th>Sr. No.</th>
                    <th>Sample Input</th>
                    <th>
                      Keylogger Detection
                    </th>
                    <th>
                      Anti-Keylogger
                    </th>
                    <th>
                      Final Result
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {observations.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        No observation recorded
                        yet.
                      </td>
                    </tr>
                  ) : (
                    observations.map(
                      (row) => (
                        <tr key={row.sr}>

                          <td>
                            {row.sr}
                          </td>

                          <td>
                            {row.input}
                          </td>

                          <td>
                            {row.detection}
                          </td>

                          <td>
                            {row.protection}
                          </td>

                          <td className="result-cell">
                            ✓ {row.result}
                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>

        </>
      )}

      {/* =====================================================
          ASSIGNMENT TAB
      ===================================================== */}

      {activeTab === "assignment" && (
        <section className="card assignment-card">

          <h3 className="panel-heading orange">
            Assignment
          </h3>

          <p className="assignment-text">
            Answer these questions based on the keylogger detection and protection practical.
          </p>

          <ol className="assignment-questions">
            {ASSIGNMENT_QUESTIONS.map((item, questionIndex) => (
              <li className="assignment-question" key={item.question}>
                <p>{item.question}</p>
                <div className="assignment-options">
                  {item.options.map((option, optionIndex) => (
                    <label
                      className="assignment-option"
                      key={option}
                      htmlFor={`ifs4-assignment-${questionIndex}-${optionIndex}`}
                    >
                      <input
                        checked={assignmentAnswers[questionIndex] === optionIndex}
                        id={`ifs4-assignment-${questionIndex}-${optionIndex}`}
                        name={`ifs4-assignment-${questionIndex}`}
                        onChange={() =>
                          setAssignmentAnswers((previous) => ({
                            ...previous,
                            [questionIndex]: optionIndex,
                          }))
                        }
                        type="radio"
                      />
                      <strong className="assignment-option-letter">
                        {String.fromCharCode(65 + optionIndex)}.
                      </strong>
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ol>

        </section>
      )}

      {/* =====================================================
          SUBMIT SECTION
          
          Required successful attempt count.
      ===================================================== */}

      <section className="submit-section">

        <p className="submit-requirement">
          Perform the experiment successfully
          {REQUIRED_SUCCESSFUL_ATTEMPTS} time to enable the Submit
          Experiment button.
        </p>

        <button
          className={`btn-submit ${
            successfulAttempts >= REQUIRED_SUCCESSFUL_ATTEMPTS &&
            !submitted
              ? "enabled"
              : "disabled"
          }`}
          disabled={
            successfulAttempts < REQUIRED_SUCCESSFUL_ATTEMPTS ||
            submitted
          }
          onClick={
            submitExperiment
          }
        >
          {submitted
            ? "Experiment Submitted ✓"
            : "Submit Experiment"}
        </button>

      </section>

      {/* =====================================================
          SIMULATION POPUP
      ===================================================== */}

      {popup && (
        <div
          className="popup-overlay"
          onClick={() =>
            setPopup("")
          }
        >

          <div
            className="popup-box"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="popup-icon">
              🔐
            </div>

            <p>{popup}</p>

            <button
              className="popup-ok"
              onClick={() =>
                setPopup("")
              }
            >
              OK
            </button>

          </div>

        </div>
      )}

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
              How to Perform This Experiment
            </h3>

            <ol>

              <li>
                Enter sample text.
              </li>

              <li>
                Click Start Experiment.
              </li>

              <li>
                Drag the highlighted
                component to its matching
                zone.
              </li>

              <li>
                Wrong placement shows an
                error popup.
              </li>

              <li>
                Complete all four
                drag-and-drop steps.
              </li>

              <li>
                Click Verify Protection.
              </li>

              <li>
                Repeat the experiment
                successfully once to complete
                the practical.
              </li>

            </ol>

            <p className="help-note">
              <b>Safety:</b>{" "}
              This is a virtual lab
              simulation and does not
              capture real keyboard activity.
            </p>

            <button
              className="popup-ok full-width"
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