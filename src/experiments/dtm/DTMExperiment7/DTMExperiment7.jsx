import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./DTMExperiment7.css";

// ─────────────────────────────────────────────────────────────
// Clocked RS Flip-Flop Logic
// ─────────────────────────────────────────────────────────────
function analyzeRSFlipFlop({ CLK, S, R, prevQ }) {
  let Q = prevQ;
  let Qbar = prevQ === 1 ? 0 : 1;

  let state = "HOLD";
  let conclusion = "";

  // Clock Disabled
  if (CLK === 0) {
    state = "CLOCK DISABLED";

    conclusion =
      "CLK=0. Clock is disabled, therefore flip-flop does not respond to inputs and retains its previous state.";

    return {
      state,
      Q,
      Qbar,
      activePath: "NONE",
      conclusion,
    };
  }

  // Clock Enabled
  if (S === 0 && R === 0) {
    state = "HOLD";

    conclusion =
      "CLK=1 and S=0, R=0. Flip-Flop remains in HOLD state and preserves previous output.";
  }

  else if (S === 1 && R === 0) {
    state = "SET";

    Q = 1;
    Qbar = 0;

    conclusion =
      "CLK=1 and S=1, R=0. Flip-Flop enters SET state. Therefore Q=1 and Q̅=0.";
  }

  else if (S === 0 && R === 1) {
    state = "RESET";

    Q = 0;
    Qbar = 1;

    conclusion =
      "CLK=1 and S=0, R=1. Flip-Flop enters RESET state. Therefore Q=0 and Q̅=1.";
  }

  else {
    state = "INVALID";

    conclusion =
      "CLK=1 and S=1, R=1. This is an INVALID condition for Clocked RS Flip-Flop.";
  }

  return {
    state,
    Q,
    Qbar,
    activePath:
      state === "SET"
        ? "SET"
        : state === "RESET"
        ? "RESET"
        : "NONE",
    conclusion,
  };
}

// ─────────────────────────────────────────────────────────────
// Initial Observation Table
// ─────────────────────────────────────────────────────────────
const INITIAL_ROWS = [
  { id: 1, CLK: 0, S: 0, R: 0 },
  { id: 2, CLK: 0, S: 0, R: 1 },
  { id: 3, CLK: 0, S: 1, R: 0 },
  { id: 4, CLK: 0, S: 1, R: 1 },

  { id: 5, CLK: 1, S: 0, R: 0 },
  { id: 6, CLK: 1, S: 0, R: 1 },
  { id: 7, CLK: 1, S: 1, R: 0 },
  { id: 8, CLK: 1, S: 1, R: 1 },
].map((row) => ({
  ...row,
  status: "Pending",
  prevQ: null,
  Q: null,
  Qbar: null,
}));

// ─────────────────────────────────────────────────────────────
// Toggle Switch
// ─────────────────────────────────────────────────────────────
function ToggleSwitch({
  label,
  value,
  onChange,
}) {
  return (
    <div className="toggle-row">

      <span className="toggle-label">
        {label}
      </span>

      <div
        className={`toggle-switch ${
          value === 1 ? "on" : "off"
        }`}
        onClick={() =>
          onChange(value === 1 ? 0 : 1)
        }
        role="switch"
        aria-checked={value === 1}
        tabIndex={0}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" ||
            e.key === " "
          ) {
            e.preventDefault();

            onChange(
              value === 1 ? 0 : 1
            );
          }
        }}
      >
        <div className="toggle-thumb" />
      </div>

      <span className="toggle-val">
        {value}
      </span>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Simulation Canvas
// ─────────────────────────────────────────────────────────────
function SimulationCanvas({
  verifiedInputs,
  analysis,
  verified,
}) {
  const { CLK, S, R } =
    verifiedInputs;

  const state =
    analysis?.state || "";

  const Q =
    analysis?.Q ?? "";

  const Qbar =
    analysis?.Qbar ?? "";

  const isSet =
    verified &&
    state === "SET";

  const isReset =
    verified &&
    state === "RESET";

  const isInvalid =
    verified &&
    state === "INVALID";

  const wireClass = (
    active = false
  ) =>
    active
      ? "wire active-wire"
      : "wire";

  return (
    <div className="canvas-area">

      <svg
        viewBox="0 0 700 440"
        className="rs-svg"
      >
        {/* =========================
            INPUT LABELS
        ========================== */}

        <text
          x="90"
          y="70"
          className="svg-label"
        >
          S
        </text>

        <text
          x="90"
          y="305"
          className="svg-label"
        >
          R
        </text>

        <text
          x="20"
          y="190"
          className="svg-label"
        >
          CLK
        </text>

        {/* S INPUT */}
        <circle
          cx="100"
          cy="80"
          r="5"
          className="wire-node"
        />

        <line
          x1="100"
          y1="80"
          x2="150"
          y2="80"
          className={wireClass(isSet)}
        />

        {/* R INPUT */}
        <circle
          cx="100"
          cy="320"
          r="5"
          className="wire-node"
        />

        <line
          x1="100"
          y1="320"
          x2="150"
          y2="320"
          className={wireClass(isReset)}
        />

        {/* CLOCK SPLIT */}

        <circle
          cx="70"
          cy="200"
          r="5"
          className="wire-node"
        />

        <line
          x1="70"
          y1="200"
          x2="130"
          y2="200"
          className="wire"
        />

        <line
          x1="130"
          y1="200"
          x2="130"
          y2="120"
          className="wire"
        />

        <line
          x1="130"
          y1="200"
          x2="130"
          y2="280"
          className="wire"
        />

        <text
          x="55"
          y="218"
          className="svg-val"
        >
          {CLK}
        </text>

        {/* =========================
            NAND A
        ========================== */}

        <path
          d="
            M150 50
            L210 50
            Q260 50 260 100
            Q260 150 210 150
            L150 150
            Z
          "
          className="nand-gate"
        />

        <circle
          cx="270"
          cy="100"
          r="7"
          className="gate-bubble"
        />

        {/* =========================
            NAND B
        ========================== */}

        <path
          d="
            M150 250
            L210 250
            Q260 250 260 300
            Q260 350 210 350
            L150 350
            Z
          "
          className="nand-gate"
        />

        <circle
          cx="270"
          cy="300"
          r="7"
          className="gate-bubble"
        />

        {/* CLOCK TO NANDS */}

        <line
          x1="130"
          y1="120"
          x2="150"
          y2="120"
          className="wire"
        />

        <line
          x1="130"
          y1="280"
          x2="150"
          y2="280"
          className="wire"
        />

        {/* NAND OUTPUTS */}

        <line
          x1="277"
          y1="100"
          x2="340"
          y2="100"
          className={wireClass(isSet)}
        />

        <line
          x1="277"
          y1="300"
          x2="340"
          y2="300"
          className={wireClass(isReset)}
        />

        {/* =========================
            NAND C (TOP LATCH)
        ========================== */}

        <path
          d="
            M340 50
            L400 50
            Q450 50 450 100
            Q450 150 400 150
            L340 150
            Z
          "
          className={
            isInvalid
              ? "nand-gate invalid-gate"
              : "nand-gate"
          }
        />

        <circle
          cx="460"
          cy="100"
          r="7"
          className="gate-bubble"
        />

        {/* =========================
            NAND D (BOTTOM LATCH)
        ========================== */}

        <path
          d="
            M340 250
            L400 250
            Q450 250 450 300
            Q450 350 400 350
            L340 350
            Z
          "
          className={
            isInvalid
              ? "nand-gate invalid-gate"
              : "nand-gate"
          }
        />

        <circle
          cx="460"
          cy="300"
          r="7"
          className="gate-bubble"
        />

        {/* =========================
            FEEDBACK WIRES
        ========================== */}

        <path
          d="
            M467 100
            C560 100
             560 250
             340 250
          "
          className={
            isInvalid
              ? "wire invalid-wire"
              : "feedback-blue"
          }
        />

        <path
          d="
            M467 300
            C560 300
             560 150
             340 150
          "
          className={
            isInvalid
              ? "wire invalid-wire"
              : "feedback-red"
          }
        />
        {/* =========================
            Q OUTPUT
        ========================== */}

        <line
          x1="467"
          y1="100"
          x2="570"
          y2="100"
          className={wireClass(isSet)}
        />

        <text
          x="535"
          y="85"
          className="svg-label"
        >
          Q
        </text>

        <text
          x="535"
          y="120"
          className="svg-val"
        >
          {Q}
        </text>

        {/* Q LED */}

        <circle
          cx="620"
          cy="100"
          r="24"
          className={`led-circle ${
            verified && Q === 1
              ? "led-on"
              : "led-off"
          }`}
        />

        <text
          x="620"
          y="140"
          textAnchor="middle"
          className="svg-label"
        >
          Q LED
        </text>

        {/* =========================
            Q BAR OUTPUT
        ========================== */}

        <line
          x1="467"
          y1="300"
          x2="570"
          y2="300"
          className={wireClass(isReset)}
        />

        <text
          x="525"
          y="285"
          className="svg-label"
        >
          Q̅
        </text>

        <text
          x="525"
          y="320"
          className="svg-val"
        >
          {Qbar}
        </text>

        {/* Q BAR LED */}

        <circle
          cx="620"
          cy="300"
          r="24"
          className={`led-circle ${
            verified && Qbar === 1
              ? "led-on"
              : "led-off"
          }`}
        />

        <text
          x="620"
          y="340"
          textAnchor="middle"
          className="svg-label"
        >
          Q̅ LED
        </text>

        {/* =========================
            INPUT VALUES
        ========================== */}

        <text
          x="110"
          y="70"
          className="svg-val"
        >
          {S}
        </text>

        <text
          x="110"
          y="310"
          className="svg-val"
        >
          {R}
        </text>


        {/* =========================
            INVALID WARNING
        ========================== */}

        {verified &&
          state === "INVALID" && (
            <>
              <rect
                x="0"
                y="0"
                width="0"
                height="0"
                rx="0"
                className="warning-box"
              />

              <text
                x="0"
                y="0"
                textAnchor="middle"
                className="warning-text"
              >
                ⚠ INVALID STATE (S=1, R=1)
              </text>
            </>
          )}

      </svg>

    </div>
  );
}
function renderHelpPopup(open, onClose, title, items) {
  if (!open) return null;
  return (
    <div className="dtm-help-overlay" onClick={onClose}>
      <section className="dtm-help-dialog" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="dtm-help-header"><h2>{title}</h2><button className="dtm-help-close" type="button" aria-label="Close help" onClick={onClose}>×</button></div>
        <ul className="dtm-help-items">{items.map((item) => <li key={item}>{item}</li>)}</ul>
        <button className="dtm-help-done" type="button" onClick={onClose}>Got it</button>
      </section>
    </div>
  );
}

export default function DTMExperiment7() {

  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);

  const defaultInputs = {
    CLK: 0,
    S: 0,
    R: 0,
  };

  const [currentInputs, setCurrentInputs] =
    useState({ ...defaultInputs });

  const [verifiedInputs, setVerifiedInputs] =
    useState({ ...defaultInputs });

  const [analysis, setAnalysis] =
    useState(null);

  const [verified, setVerified] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [prevQ, setPrevQ] =
    useState(0);

  const [tableRows, setTableRows] =
    useState(INITIAL_ROWS);

  const [theoryOpen, setTheoryOpen] =
    useState(false);

  const [procOpen, setProcOpen] =
    useState(false);

  const setInput = (key, value) =>
    setCurrentInputs((prev) => ({
      ...prev,
      [key]: value,
    }));

  const alreadyDone = tableRows.some(
    (row) =>
      row.CLK === currentInputs.CLK &&
      row.S === currentInputs.S &&
      row.R === currentInputs.R &&
      row.status === "Verified"
  );

  const allVerified =
    tableRows.every(
      (row) =>
        row.status === "Verified"
    );

  // ─────────────────────────────
  // Verify
  // ─────────────────────────────

  const handleVerify = () => {

    const snap = {
      ...currentInputs,
    };

    const result =
      analyzeRSFlipFlop({
        ...snap,
        prevQ,
      });

    setVerifiedInputs(snap);

    setAnalysis(result);

    setVerified(true);

    if (
      result.state !== "INVALID"
    ) {
      setPrevQ(result.Q);
    }

    setTableRows((rows) =>
      rows.map((row) => {

        if (
          row.CLK === snap.CLK &&
          row.S === snap.S &&
          row.R === snap.R &&
          row.status === "Pending"
        ) {

          return {
            ...row,
            prevQ,
            Q: result.Q,
            Qbar: result.Qbar,
            status: "Verified",
          };

        }

        return row;

      })
    );

  };

  // ─────────────────────────────
  // Reset
  // ─────────────────────────────

  const handleReset = () => {

    setCurrentInputs({
      ...defaultInputs,
    });

    setVerifiedInputs({
      ...defaultInputs,
    });

    setAnalysis(null);

    setVerified(false);

  };

  // ─────────────────────────────
  // Submit
  // ─────────────────────────────

  const handleSubmit = () => {

    if (
      !allVerified ||
      submitted
    )
      return;

    setSubmitted(true);
    navigate("/dtm-result", {
  state: {
    experimentNo: 7,
    experimentName: "Clocked RS Flip-Flop",
    experimentRoute: "/dtm-experiment-7",
     },
   });

  };

  return (

    <div className="DTMExperiment5-root">

      {/* Header */}

      <header className="exp-header">

        <button
  className="btn-back"
  onClick={() => navigate("/dtm-experiments", { replace: true })}
>
  ← Back
</button>

        <h1 className="exp-title">
          Experiment 7 : Verify Clocked RS Flip-Flop
        </h1>

        <button className="btn-help" onClick={() => setHelpOpen(true)}> ? Help </button>

      </header>
      {renderHelpPopup(helpOpen, () => setHelpOpen(false), "Experiment 7 Help", [
        "Set the R, S, and clock inputs for the clocked RS flip-flop.",
        "Apply the clock to capture the input state and observe Q and Q-bar.",
        "Compare each input combination with the expected clocked RS truth table.",
      ])}

      {/* Aim */}

      <section className="card aim-card">

        <h2 className="section-heading orange">
          Aim
        </h2>

        <p>
          To verify the truth table of
          Clocked RS Flip-Flop using
          NAND gates.
        </p>

      </section>

      {/* Theory */}

      <section className="card collapsible-card">

        <div
          className="collapsible-header"
          onClick={() =>
            setTheoryOpen(
              !theoryOpen
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
              Clocked RS Flip-Flop is
              a sequential circuit used
              to store one bit of data.
            </p>

            <p>
              Inputs S and R affect the
              output only when Clock
              input is HIGH.
            </p>

            <p>
              It has four operating
              conditions:
            </p>

            <ul>
              <li>Hold</li>
              <li>Set</li>
              <li>Reset</li>
              <li>Invalid</li>
            </ul>

          </div>

        )}

      </section>

      {/* Procedure */}

      <section className="card collapsible-card">

        <div
          className="collapsible-header"
          onClick={() =>
            setProcOpen(
              !procOpen
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
                Set CLK, S and R.
              </li>

              <li>
                Observe circuit.
              </li>

              <li>
                Click Verify.
              </li>

            </ol>

            <ol
              className="proc-col"
              start={4}
            >

              <li>
                Verify all combinations.
              </li>

              <li>
                Complete observation table.
              </li>

              <li>
                Submit experiment.
              </li>

            </ol>

          </div>

        )}

      </section>
        {/* =========================
          Simulation Row
      ========================== */}

      <div className="sim-row">

        {/* Inputs Panel */}

        <aside className="card inputs-panel">

          <h3 className="panel-heading">
            Inputs
          </h3>

          {["CLK", "S", "R"].map(
            (key) => (

              <ToggleSwitch
                key={key}
                label={key}
                value={
                  currentInputs[key]
                }
                onChange={(v) =>
                  setInput(key, v)
                }
              />

            )
          )}

          {alreadyDone && (

            <p className="input-hint">
              Combination already
              recorded in observation
              table.
            </p>

          )}

        </aside>

        {/* Simulation Canvas */}

        <div className="card canvas-panel">

          <h3 className="panel-heading">
            Simulation Canvas
          </h3>

          <SimulationCanvas
            verifiedInputs={
              verifiedInputs
            }
            analysis={analysis}
            verified={verified}
          />

          <div className="canvas-actions">

            <button
              className="btn-verify"
              onClick={
                handleVerify
              }
            >
              ✔ Verify
            </button>

            <button
              className="btn-reset"
              onClick={
                handleReset
              }
            >
              ↺ Reset
            </button>

          </div>

        </div>

        {/* Analysis Panel */}

        <aside className="card analysis-panel">

          <h3 className="panel-heading orange">
            Verification Analysis
          </h3>

          {/* Current Inputs */}

          <div className="analysis-block">

            <h4 className="analysis-sub">
              Current Inputs
            </h4>

            <table className="analysis-table">

              <tbody>

                {[
                  "CLK",
                  "S",
                  "R",
                ].map((k) => (

                  <tr key={k}>

                    <td>{k}</td>

                    <td>=</td>

                    <td>
                      {verified
                        ? verifiedInputs[
                            k
                          ]
                        : "—"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* Output */}

          {verified &&
            analysis && (

              <>
                <div className="analysis-block">

                  <h4 className="analysis-sub">
                    Output
                  </h4>

                  <table className="analysis-table">

                    <tbody>

                      <tr>

                        <td>
                          State
                        </td>

                        <td>
                          :
                        </td>

                        <td>
                          {
                            analysis.state
                          }
                        </td>

                      </tr>

                      <tr>

                        <td>
                          Q
                        </td>

                        <td>
                          :
                        </td>

                        <td>
                          {
                            analysis.Q
                          }
                        </td>

                      </tr>

                      <tr>

                        <td>
                          Q̅
                        </td>

                        <td>
                          :
                        </td>

                        <td>
                          {
                            analysis.Qbar
                          }
                        </td>

                      </tr>

                    </tbody>

                  </table>

                </div>

                {/* Conclusion */}

                <div className="analysis-block">

                  <h4 className="analysis-sub">
                    Conclusion
                  </h4>

                  <p className="conclusion-text">

                    {
                      analysis.conclusion
                    }

                  </p>

                  <p className="verified-badge">
                    ✔ VERIFIED
                  </p>

                </div>

              </>

            )}

        </aside>

      </div>
      {/* =========================
          OBSERVATION TABLE
      ========================== */}

      <section className="card table-section">

        <h3 className="panel-heading orange">
          Observation Table (Truth Table)
        </h3>

        <div className="table-scroll">

          <table className="obs-table">

            <thead>

              <tr>

                <th>Sr. No.</th>
                <th>CLK</th>
                <th>S</th>
                <th>R</th>
                <th>Prev Q</th>
                <th>Q</th>
                <th>Q̅</th>
                <th>Expected</th>
                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {tableRows.map(
                (row, idx) => {

                  let expected;

                  if (row.CLK === 0) {
                    expected =
                      "No Change";
                  } else if (
                    row.S === 0 &&
                    row.R === 0
                  ) {
                    expected = "HOLD";
                  } else if (
                    row.S === 1 &&
                    row.R === 0
                  ) {
                    expected = "SET";
                  } else if (
                    row.S === 0 &&
                    row.R === 1
                  ) {
                    expected = "RESET";
                  } else {
                    expected =
                      "INVALID";
                  }

                  return (
                    <tr
                      key={row.id}
                      className={
                        row.status ===
                        "Verified"
                          ? "row-verified"
                          : ""
                      }
                    >

                      <td>
                        {row.id}
                      </td>

                      <td>
                        {row.CLK}
                      </td>

                      <td>
                        {row.S}
                      </td>

                      <td>
                        {row.R}
                      </td>

                      <td>
                        {row.prevQ ?? "—"}
                      </td>

                      <td>
                        {row.Q ?? "—"}
                      </td>

                      <td>
                        {row.Qbar ?? "—"}
                      </td>

                      <td>
                        {expected}
                      </td>

                      <td>
                        {row.status ===
                        "Verified" ? (
                          <span className="status-verified">
                            ✔ Verified
                          </span>
                        ) : (
                          <span className="status-pending">
                            Pending
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =========================
          SUBMIT SECTION
      ========================== */}
{/* ==========================
    Submit Section (ADD-ON ONLY)
========================== */}

<div className="submit-section">

  <button
  className={
    allVerified
      ? "submit-btn"
      : "submit-btn disabled-submit"
  }
  disabled={!allVerified || submitted}
  onClick={handleSubmit}
>
  {allVerified
    ? "✅ Submit Experiment"
    : "🔒 Submit Experiment"}
</button>

  {/* NOTE: ye sirf UI message hai, logic untouched */}
  {!allVerified && (
    <p className="submit-note">
      Complete all combinations to enable submit.
    </p>
  )}

</div>

   

    </div>
  );
}