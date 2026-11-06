import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DTMExperiment4.css";

// ─────────────────────────────────────────────────────────────
// De Morgan's Second Theorem Logic
// Statement : (A.B)' = A' + B'   →   NAND  ≡  Bubbled OR
// ─────────────────────────────────────────────────────────────
function analyzeDeMorgan2({ A, B }) {
  const Abar = A === 1 ? 0 : 1;
  const Bbar = B === 1 ? 0 : 1;

  const AB = A === 1 && B === 1 ? 1 : 0;
  const NAND_out = AB === 1 ? 0 : 1; // (A.B)'
  const OR_out = Abar === 1 || Bbar === 1 ? 1 : 0; // A' + B'

  const match = NAND_out === OR_out;

  let conclusion = "";

  if (A === 0 && B === 0) {
    conclusion =
      "A=0, B=0. Both A' and B' are HIGH, so LHS=(A.B)'=1 and RHS=A'+B'=1. Outputs match.";
  } else if (A === 0 && B === 1) {
    conclusion =
      "A=0, B=1. A' is HIGH, so LHS=(A.B)'=1 and RHS=A'+B'=1. Outputs match.";
  } else if (A === 1 && B === 0) {
    conclusion =
      "A=1, B=0. B' is HIGH, so LHS=(A.B)'=1 and RHS=A'+B'=1. Outputs match.";
  } else {
    conclusion =
      "A=1, B=1. Both A' and B' are LOW, so LHS=(A.B)'=0 and RHS=A'+B'=0. Outputs match.";
  }

  return { Abar, Bbar, AB, NAND_out, OR_out, match, conclusion };
}

// ─────────────────────────────────────────────────────────────
// Initial Observation Table
// ─────────────────────────────────────────────────────────────
const INITIAL_ROWS = [
  { id: 1, A: 0, B: 0 },
  { id: 2, A: 0, B: 1 },
  { id: 3, A: 1, B: 0 },
  { id: 4, A: 1, B: 1 },
].map((row) => ({
  ...row,
  status: "Pending",
  Abar: null,
  Bbar: null,
  AB: null,
  NAND_out: null,
  OR_out: null,
}));

// ─────────────────────────────────────────────────────────────
// Toggle Switch
// ─────────────────────────────────────────────────────────────
function ToggleSwitch({ label, value, onChange }) {
  return (
    <div className="toggle-row">
      <span className="toggle-label">{label}</span>

      <div
        className={`toggle-switch ${value === 1 ? "on" : "off"}`}
        onClick={() => onChange(value === 1 ? 0 : 1)}
        role="switch"
        aria-checked={value === 1}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(value === 1 ? 0 : 1);
          }
        }}
      >
        <div className="toggle-thumb" />
      </div>

      <span className="toggle-val">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Simulation Canvas — LHS (NAND) ≡ RHS (Bubbled OR), centered
// LEDs reflect the actual output value (1 = ON, 0 = OFF)
// ─────────────────────────────────────────────────────────────
function SimulationCanvas({ inputs, analysis, verified }) {
  const { A, B } = inputs;

  const Abar = analysis?.Abar ?? "";
  const Bbar = analysis?.Bbar ?? "";
  const NAND_out = analysis?.NAND_out ?? "";
  const OR_out = analysis?.OR_out ?? "";
  const match = verified && analysis?.match;

  const activeWire = (cond) => (cond ? "wire active-wire" : "wire");

  return (
    <div className="canvas-area">
      <svg viewBox="0 0 920 380" className="dm-svg">
        <defs>
          <linearGradient id="gradBlue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5b7fe0" />
            <stop offset="100%" stopColor="#2a47a8" />
          </linearGradient>
          <linearGradient id="gradTeal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#33c9c7" />
            <stop offset="100%" stopColor="#0b8180" />
          </linearGradient>
        </defs>

        {/* ============ TITLES ============ */}
        <text x="225" y="32" textAnchor="middle" className="side-title">
          LHS &nbsp;·&nbsp; (A . B)&apos;
        </text>
        <text x="695" y="32" textAnchor="middle" className="side-title">
          RHS &nbsp;·&nbsp; A&apos; + B&apos;
        </text>

        {/* ============ LHS : NAND GATE ============ */}
        <circle cx="55" cy="100" r="5" className="wire-node" />
        <text x="30" y="88" className="svg-label">A</text>
        <line x1="55" y1="100" x2="150" y2="100" className={activeWire(verified && A === 1)} />
        <text x="95" y="93" className="svg-val">{verified ? A : ""}</text>

        <circle cx="55" cy="220" r="5" className="wire-node" />
        <text x="30" y="208" className="svg-label">B</text>
        <line x1="55" y1="220" x2="150" y2="220" className={activeWire(verified && B === 1)} />
        <text x="95" y="213" className="svg-val">{verified ? B : ""}</text>

        <path
          d="M150,70 L210,70 Q265,70 265,160 Q265,250 210,250 L150,250 Z"
          className="nand-gate"
        />
        <circle cx="274" cy="160" r="8" className="gate-bubble" />

        <line
          x1="282"
          y1="160"
          x2="350"
          y2="160"
          className={activeWire(verified && NAND_out === 1)}
        />

        <circle
          cx="372"
          cy="160"
          r="28"
          className={`led-circle ${verified && NAND_out === 1 ? "led-on" : "led-off"}`}
        />
        <text x="372" y="167" textAnchor="middle" className="led-val">
          {verified ? NAND_out : "?"}
        </text>
        <text x="372" y="207" textAnchor="middle" className="svg-label">
          (A.B)&apos;
        </text>

        {/* ============ DIVIDER ============ */}
        <line x1="460" y1="15" x2="460" y2="365" className="divider" />
        <text x="460" y="168" textAnchor="middle" className="equiv-sym">≡</text>

        {/* ============ RHS : NOT + NOT + OR ============ */}
        <circle cx="560" cy="100" r="5" className="wire-node" />
        <text x="535" y="88" className="svg-label">A</text>
        <line x1="560" y1="100" x2="600" y2="100" className={activeWire(verified && A === 1)} />

        <polygon points="600,80 600,120 640,100" className="not-gate" />
        <circle cx="648" cy="100" r="6" className="gate-bubble" />
        <text x="620" y="70" textAnchor="middle" className="svg-val small">{verified ? Abar : ""}</text>

        <line x1="654" y1="100" x2="700" y2="100" className={activeWire(verified && Abar === 1)} />

        <circle cx="560" cy="220" r="5" className="wire-node" />
        <text x="535" y="208" className="svg-label">B</text>
        <line x1="560" y1="220" x2="600" y2="220" className={activeWire(verified && B === 1)} />

        <polygon points="600,200 600,240 640,220" className="not-gate" />
        <circle cx="648" cy="220" r="6" className="gate-bubble" />
        <text x="620" y="192" textAnchor="middle" className="svg-val small">{verified ? Bbar : ""}</text>

        <line x1="654" y1="220" x2="700" y2="220" className={activeWire(verified && Bbar === 1)} />

        <path
          d="M700,70 Q745,70 780,160 Q745,250 700,250 Q725,160 700,70 Z"
          className="or-gate"
        />

        <line
          x1="788"
          y1="160"
          x2="840"
          y2="160"
          className={activeWire(verified && OR_out === 1)}
        />

        <circle
          cx="862"
          cy="160"
          r="28"
          className={`led-circle ${verified && OR_out === 1 ? "led-on" : "led-off"}`}
        />
        <text x="862" y="167" textAnchor="middle" className="led-val">
          {verified ? OR_out : "?"}
        </text>
        <text x="862" y="207" textAnchor="middle" className="svg-label">
          A&apos;+B&apos;
        </text>

        {/* ============ MATCH / MISMATCH BANNER ============ */}
        {verified && (
          <>
            <rect
              x="300"
              y="300"
              width="320"
              height="46"
              rx="10"
              className={match ? "match-box" : "warning-box"}
            />
            <text
              x="460"
              y="329"
              textAnchor="middle"
              className={match ? "match-text" : "warning-text"}
            >
              {match
                ? "✓ (A.B)' = A' + B'  — VERIFIED"
                : "⚠ Outputs do not match"}
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

export default function DTMExperiment4() {
  const navigate=useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const defaultInputs = { A: 0, B: 0 };

  const [currentInputs, setCurrentInputs] = useState({ ...defaultInputs });
  const [verifiedInputs, setVerifiedInputs] = useState({ ...defaultInputs });
  const [analysis, setAnalysis] = useState(null);
  const [verified, setVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tableRows, setTableRows] = useState(INITIAL_ROWS);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procOpen, setProcOpen] = useState(false);

  const setInput = (key, value) =>
    setCurrentInputs((prev) => ({ ...prev, [key]: value }));

  const alreadyDone = tableRows.some(
    (row) =>
      row.A === currentInputs.A &&
      row.B === currentInputs.B &&
      row.status === "Verified"
  );

  const allVerified = tableRows.every((row) => row.status === "Verified");

  const handleVerify = () => {
    const snap = { ...currentInputs };
    const result = analyzeDeMorgan2(snap);

    setVerifiedInputs(snap);
    setAnalysis(result);
    setVerified(true);

    setTableRows((rows) =>
      rows.map((row) => {
        if (row.A === snap.A && row.B === snap.B && row.status === "Pending") {
          return {
            ...row,
            Abar: result.Abar,
            Bbar: result.Bbar,
            AB: result.AB,
            NAND_out: result.NAND_out,
            OR_out: result.OR_out,
            status: "Verified",
          };
        }
        return row;
      })
    );
  };

  const handleReset = () => {
    setCurrentInputs({ ...defaultInputs });
    setVerifiedInputs({ ...defaultInputs });
    setAnalysis(null);
    setVerified(false);
  };

  const handleSubmit = () => {
    if (!allVerified || submitted) return;
    setSubmitted(true);
      navigate("/dtm-result", {
    state: {

      experimentNo: 4,

      experimentName:
        "Verify Demorgan's 2st theorem",

      experimentRoute:
        "/dtm-experiment-4",
      
    }
  });
  };

  return (
    <div className="DTMExperiment4-root">
      {/* Header */}
      <header className="exp-header">
      <button
  className="btn-back"
  onClick={() => navigate("/dtm-experiments", { replace: true })}
>
  ← Back
</button>

        <h1 className="exp-title">
          Experiment 4 : Verify De Morgan&apos;s Second Theorem
        </h1>

        <button className="btn-help" onClick={() => setHelpOpen(true)}> ? Help </button>
      </header>
      {renderHelpPopup(helpOpen, () => setHelpOpen(false), "Experiment 4 Help", [
        "Build the (A.B)' circuit using the available NAND, NOT, and OR gates.",
        "Build the equivalent A' + B' circuit and test all input combinations.",
        "Compare both outputs in the truth table to verify De Morgan's Second Theorem.",
      ])}

      {/* Aim */}
      <section className="card aim-card">
        <h2 className="section-heading orange">Aim</h2>
        <p>
          To verify De Morgan&apos;s Second Theorem, (A.B)&apos; = A&apos; + B&apos;,
          using NAND, NOT and OR gates.
        </p>
      </section>

      {/* Theory */}
      <section className="card collapsible-card">
        <div className="collapsible-header" onClick={() => setTheoryOpen(!theoryOpen)}>
          <h2 className="section-heading orange">Theory</h2>
          <span className="chevron">{theoryOpen ? "▲" : "▼"}</span>
        </div>

        {theoryOpen && (
          <div className="collapsible-body">
            <p>
              De Morgan&apos;s Second Theorem states that the complement of the
              product of two variables is equal to the sum of the individual
              complements of those variables.
            </p>

            <p className="theory-equation">(A . B)&apos; = A&apos; + B&apos;</p>

            <p>
              The left-hand side is realised using a single NAND gate with
              inputs A and B. The right-hand side is realised using two NOT
              gates, which invert A and B individually, followed by an OR
              gate that combines the inverted signals.
            </p>

            <p>
              A NAND gate is therefore logically equivalent to a
              &quot;Bubbled OR&quot; gate — an OR gate whose inputs are first
              inverted. If, for every combination of A and B, the NAND output
              equals the Bubbled-OR output, the theorem stands verified.
            </p>
          </div>
        )}
      </section>

      {/* Procedure */}
      <section className="card collapsible-card">
        <div className="collapsible-header" onClick={() => setProcOpen(!procOpen)}>
          <h2 className="section-heading orange">Procedure</h2>
          <span className="chevron">{procOpen ? "▲" : "▼"}</span>
        </div>

        {procOpen && (
          <div className="collapsible-body proc-grid">
            <ol className="proc-col">
              <li>Set inputs A and B using the toggle switches.</li>
              <li>Observe both the NAND circuit and the Bubbled-OR circuit.</li>
              <li>Click Verify to compute and compare both outputs.</li>
            </ol>

            <ol className="proc-col" start={4}>
              <li>Repeat for all four input combinations.</li>
              <li>Complete the observation table.</li>
              <li>Submit the experiment once all rows are verified.</li>
            </ol>
          </div>
        )}
      </section>

      {/* Simulation Row */}
      <div className="sim-row">
        {/* Inputs Panel */}
        <aside className="card inputs-panel">
          <h3 className="panel-heading">Inputs</h3>

          {["A", "B"].map((key) => (
            <ToggleSwitch
              key={key}
              label={key}
              value={currentInputs[key]}
              onChange={(v) => setInput(key, v)}
            />
          ))}

          {alreadyDone && (
            <p className="input-hint">
              Combination already recorded in observation table.
            </p>
          )}
        </aside>

        {/* Simulation Canvas */}
        <div className="card canvas-panel">
          <h3 className="panel-heading">Simulation Canvas</h3>

          <SimulationCanvas
            inputs={verifiedInputs}
            analysis={analysis}
            verified={verified}
          />

          <div className="canvas-actions">
            <button className="btn-verify" onClick={handleVerify}>
              ✔ Verify
            </button>
            <button className="btn-reset" onClick={handleReset}>
              ↺ Reset
            </button>
          </div>
        </div>

        {/* Analysis Panel */}
        <aside className="card analysis-panel">
          <h3 className="panel-heading orange">Verification Analysis</h3>

          <div className="analysis-block">
            <h4 className="analysis-sub">Current Inputs</h4>
            <table className="analysis-table">
              <tbody>
                {["A", "B"].map((k) => (
                  <tr key={k}>
                    <td>{k}</td>
                    <td>=</td>
                    <td>{verified ? verifiedInputs[k] : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {verified && analysis && (
            <>
              <div className="analysis-block">
                <h4 className="analysis-sub">Outputs</h4>
                <table className="analysis-table">
                  <tbody>
                    <tr>
                      <td>(A.B)&apos;</td>
                      <td>=</td>
                      <td>{analysis.NAND_out}</td>
                    </tr>
                    <tr>
                      <td>A&apos;+B&apos;</td>
                      <td>=</td>
                      <td>{analysis.OR_out}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="analysis-block">
                <h4 className="analysis-sub">Conclusion</h4>
                <p className="conclusion-text">{analysis.conclusion}</p>
              </div>

              <div className={`result-pill ${analysis.match ? "ok" : "bad"}`}>
                {analysis.match ? "✓ VERIFIED" : "⚠ MISMATCH"}
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Observation Table */}
      <section className="card">
        <h2 className="section-heading orange">Observation Table (Truth Table)</h2>

        <table className="obs-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>A</th>
              <th>B</th>
              <th>A&apos;</th>
              <th>B&apos;</th>
              <th>A.B</th>
              <th>(A.B)&apos;</th>
              <th>A&apos;+B&apos;</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {tableRows.map((row, i) => (
              <tr key={row.id} className={row.status === "Verified" ? "row-verified" : ""}>
                <td>{i + 1}</td>
                <td>{row.A}</td>
                <td>{row.B}</td>
                <td>{row.status === "Verified" ? row.Abar : "—"}</td>
                <td>{row.status === "Verified" ? row.Bbar : "—"}</td>
                <td>{row.status === "Verified" ? row.AB : "—"}</td>
                <td>{row.status === "Verified" ? row.NAND_out : "—"}</td>
                <td>{row.status === "Verified" ? row.OR_out : "—"}</td>
                <td>
                  {row.status === "Verified" ? (
                    <span className="status-verified">✓ Verified</span>
                  ) : (
                    <span className="status-pending">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Submit */}
      <section className="card submit-section">
        <button
          className={`btn-submit ${allVerified && !submitted ? "enabled" : "disabled"}`}
          onClick={handleSubmit}
          disabled={!allVerified || submitted}
        >
          🔒 Submit Experiment
        </button>

        <p className="submit-hint">
          {submitted
            ? "Experiment submitted successfully."
            : allVerified
            ? "All combinations verified. You can now submit the experiment."
            : "Verify all 4 input combinations to unlock submission."}
        </p>
      </section>
    </div>
  );
}