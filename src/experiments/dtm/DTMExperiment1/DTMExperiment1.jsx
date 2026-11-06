import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DTMExperiment1.css";

// ─────────────────────────────────────────────────────────────
// Gate Logic
// ─────────────────────────────────────────────────────────────
const GATES = ["AND", "OR", "NOT"];

const GATE_INFO = {
  AND: {
    expression: "Y = A . B",
    ic: "IC 74LS08",
    desc: "Output is HIGH only when BOTH inputs are HIGH.",
    inputs: 2,
  },
  OR: {
    expression: "Y = A + B",
    ic: "IC 74LS32",
    desc: "Output is HIGH when AT LEAST ONE input is HIGH.",
    inputs: 2,
  },
  NOT: {
    expression: "Y = A̅",
    ic: "IC 74LS04",
    desc: "Output is always the complement (inverse) of the input.",
    inputs: 1,
  },
};

function gateOutput(gate, A, B) {
  if (gate === "AND") return A & B;
  if (gate === "OR") return A | B;
  return A === 1 ? 0 : 1; // NOT
}

function buildConclusion(gate, A, B, Y) {
  const status = Y === 1 ? "ON" : "OFF";

  if (gate === "AND") {
    return `A=${A} and B=${B}, therefore Y=A.B=${Y}. LED is ${status}.`;
  }
  if (gate === "OR") {
    return `A=${A} and B=${B}, therefore Y=A+B=${Y}. LED is ${status}.`;
  }
  return `A=${A}, therefore Y=A̅=${Y}. LED is ${status}.`;
}

// ─────────────────────────────────────────────────────────────
// Initial Observation Tables
// ─────────────────────────────────────────────────────────────
function buildInitialTables() {
  const AND = [
    { id: 1, A: 0, B: 0 },
    { id: 2, A: 0, B: 1 },
    { id: 3, A: 1, B: 0 },
    { id: 4, A: 1, B: 1 },
  ].map((r) => ({ ...r, output: null, status: "Pending" }));

  const OR = [
    { id: 1, A: 0, B: 0 },
    { id: 2, A: 0, B: 1 },
    { id: 3, A: 1, B: 0 },
    { id: 4, A: 1, B: 1 },
  ].map((r) => ({ ...r, output: null, status: "Pending" }));

  const NOT = [
    { id: 1, A: 0 },
    { id: 2, A: 1 },
  ].map((r) => ({ ...r, output: null, status: "Pending" }));

  return { AND, OR, NOT };
}

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
// Gate Symbol (SVG shape switches with selected gate)
// fill/stroke applied via inline `style` because a global
// stylesheet was overriding .gate-shape's fill (stroke showed,
// fill didn't). Inline styles beat external stylesheets unless
// the external rule uses !important, so this guarantees color.
// ─────────────────────────────────────────────────────────────
const GATE_LABEL_POS = {
  AND: { x: 40, y: 60 },
  OR: { x: 38, y: 60 },
  NOT: { x: 40, y: 60 },
};

const GATE_BODY_STYLE = {
  fill: "#3a5fbf",
  stroke: "#1f3585",
  strokeWidth: 1.5,
  filter: "drop-shadow(1px 2px 3px rgba(0,0,0,0.2))",
};

const GATE_BUBBLE_STYLE = {
  fill: "#f9fafb",
  stroke: "#1f3585",
  strokeWidth: 1.5,
};

function GateShape({ gate }) {
  if (gate === "AND") {
    return (
      <path
        d="M0,0 L58,0 A60,60 0 0 1 58,120 L0,120 Z"
        className="gate-shape"
        style={GATE_BODY_STYLE}
      />
    );
  }
  if (gate === "OR") {
    return (
      <path
        d="M0,0 C42,0 72,25 92,60 C72,95 42,120 0,120 C22,80 22,40 0,0 Z"
        className="gate-shape"
        style={GATE_BODY_STYLE}
      />
    );
  }
  // NOT
  return (
    <>
      <path
        d="M0,0 L0,120 L96,60 Z"
        className="gate-shape"
        style={GATE_BODY_STYLE}
      />
      <circle
        cx="108"
        cy="60"
        r="11"
        className="gate-shape-bubble"
        style={GATE_BUBBLE_STYLE}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Simulation Canvas
// ─────────────────────────────────────────────────────────────
function SimulationCanvas({ gate, verifiedInputs, analysis, verified }) {
  const { A, B } = verifiedInputs;

  const inputAY = gate === "NOT" ? 150 : 105;
  const inputBY = 195;

  const outputStartX = gate === "NOT" ? 296 : gate === "OR" ? 272 : 298;

  const wireOnClass = (on) => (verified && on ? "wire active-wire" : "wire");
  const nodeOnClass = (on) =>
    verified && on ? "wire-node active-node" : "wire-node";

  const labelPos = GATE_LABEL_POS[gate];

  const ledOn = verified && analysis?.output === 1;
  const ledStyle = ledOn
    ? {
        fill: "#e53935",
        filter:
          "drop-shadow(0 0 8px rgba(229,57,53,0.8)) drop-shadow(0 0 16px rgba(229,57,53,0.4))",
      }
    : { fill: "#8b0000", opacity: 0.6 };

  return (
    <div className="canvas-area">
      <svg viewBox="0 0 480 280" className="gate-svg" aria-label={`${gate} gate simulation`}>
        {/* Input A */}
        <line
          x1="60"
          y1={inputAY}
          x2="180"
          y2={inputAY}
          className={wireOnClass(A === 1)}
          strokeWidth="2"
        />
        <circle cx="60" cy={inputAY} r="5" className={nodeOnClass(A === 1)} />
        <text x="55" y={inputAY - 10} textAnchor="end" className="svg-label">
          A
        </text>
        <text x="72" y={inputAY + 18} textAnchor="middle" className="svg-val">
          {A}
        </text>

        {/* Input B (hidden for NOT) */}
        {gate !== "NOT" && (
          <>
            <line
              x1="60"
              y1={inputBY}
              x2="180"
              y2={inputBY}
              className={wireOnClass(B === 1)}
              strokeWidth="2"
            />
            <circle
              cx="60"
              cy={inputBY}
              r="5"
              className={nodeOnClass(B === 1)}
            />
            <text
              x="55"
              y={inputBY - 10}
              textAnchor="end"
              className="svg-label"
            >
              B
            </text>
            <text
              x="72"
              y={inputBY + 18}
              textAnchor="middle"
              className="svg-val"
            >
              {B}
            </text>
          </>
        )}

        {/* Gate shape */}
        <g transform="translate(180,90)">
          <GateShape gate={gate} />

          <text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="gate-name-label"
          >
            {gate}
          </text>
        </g>

        {/* Output */}
        <line
          x1={outputStartX}
          y1="150"
          x2="390"
          y2="150"
          className={verified && analysis?.output === 1 ? "wire active-wire" : "wire"}
          strokeWidth="2"
        />

        <text x="368" y="140" textAnchor="middle" className="svg-label">
          Y (Output)
        </text>

        <text x="368" y="165" textAnchor="middle" className="svg-val">
          {verified ? analysis?.output : ""}
        </text>

        {/* LED */}
        <circle
          cx="420"
          cy="150"
          r="20"
          className="led-circle"
          style={ledStyle}
        />
        <text x="420" y="185" textAnchor="middle" className="svg-label">
          LED
        </text>
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

export default function DTMExperiment1() {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);

  const [selectedGate, setSelectedGate] = useState("AND");

  const [currentInputs, setCurrentInputs] = useState({ A: 0, B: 0 });

  const [verifiedInputs, setVerifiedInputs] = useState({ A: 0, B: 0 });

  const [analysis, setAnalysis] = useState(null);

  const [verified, setVerified] = useState(false);

  const [tables, setTables] = useState(buildInitialTables());

  const [submitted, setSubmitted] = useState(false);

  const [theoryOpen, setTheoryOpen] = useState(false);

  const [procOpen, setProcOpen] = useState(false);

  const setInput = (key, val) =>
    setCurrentInputs((prev) => ({ ...prev, [key]: val }));

  const handleGateChange = (gate) => {
    setSelectedGate(gate);
    setCurrentInputs({ A: 0, B: 0 });
    setVerifiedInputs({ A: 0, B: 0 });
    setAnalysis(null);
    setVerified(false);
  };

  // combination already verified for this gate?
  const alreadyDone = tables[selectedGate].some((row) =>
    selectedGate === "NOT"
      ? row.A === currentInputs.A && row.status === "Verified"
      : row.A === currentInputs.A &&
        row.B === currentInputs.B &&
        row.status === "Verified"
  );

  // rows for the CURRENTLY SELECTED gate only — used by observation table
  const currentGateRows = tables[selectedGate].map((r) => ({
    ...r,
    gate: selectedGate,
  }));

  // all rows across every gate — used only for overall submit progress
  const allRows = [
    ...tables.AND.map((r) => ({ ...r, gate: "AND" })),
    ...tables.OR.map((r) => ({ ...r, gate: "OR" })),
    ...tables.NOT.map((r) => ({ ...r, gate: "NOT" })),
  ];

  const verifiedCount = allRows.filter((r) => r.status === "Verified").length;

  const allVerified = verifiedCount === allRows.length;

  // ───────────────────────────────────────
  // Verify
  // ───────────────────────────────────────
  const handleVerify = () => {
    const snap = { ...currentInputs };

    const output = gateOutput(selectedGate, snap.A, snap.B);

    const conclusion = buildConclusion(selectedGate, snap.A, snap.B, output);

    setVerifiedInputs(snap);

    setAnalysis({ output, conclusion });

    setVerified(true);

    setTables((prev) => {
      const rows = prev[selectedGate].map((row) => {
        const matches =
          selectedGate === "NOT"
            ? row.A === snap.A
            : row.A === snap.A && row.B === snap.B;

        if (matches && row.status === "Pending") {
          return { ...row, output, status: "Verified" };
        }
        return row;
      });

      return { ...prev, [selectedGate]: rows };
    });
  };

  // ───────────────────────────────────────
  // Reset
  // ───────────────────────────────────────
  const handleReset = () => {
    setCurrentInputs({ A: 0, B: 0 });
    setVerifiedInputs({ A: 0, B: 0 });
    setAnalysis(null);
    setVerified(false);
  };

  // ───────────────────────────────────────
  // Submit
  // ───────────────────────────────────────
const handleSubmit = () => {
  if (!allVerified || submitted) return;

  setSubmitted(true);

  navigate("/dtm-result", {
    state: {
      experimentNo: 1,
      experimentName: "Assemble and Test Basic Logic Gates",
      experimentRoute: "/dtm-experiment-1",
    },
  });
};

  const info = GATE_INFO[selectedGate];
  const gateVerifiedCount = currentGateRows.filter(
    (r) => r.status === "Verified"
  ).length;

  return (
    <div className="DTMExperiment1-root">
      {/* Header */}
      <header className="exp-header">
       <button
  className="btn-back"
  onClick={() => navigate("/dtm-experiments", { replace: true })}
>
  ← Back
</button>

        <h1 className="exp-title">
          Experiment 1 : Assemble and Test Basic Logic Gates
        </h1>

        <button className="btn-help" onClick={() => setHelpOpen(true)}> ? Help </button>
      </header>
      {renderHelpPopup(helpOpen, () => setHelpOpen(false), "Experiment 1 Help", [
        "Select a basic logic gate and set its input values.",
        "Run the circuit to observe the output, then compare it with the truth table.",
        "Repeat the checks for AND, OR, and NOT gates before submitting.",
      ])}

      {/* Aim */}
      <section className="card aim-card">
        <h2 className="section-heading orange">Aim</h2>
        <p>Assemble and test basic logic gates.</p>
      </section>

      {/* Apparatus */}
      <section className="card">
        <h2 className="section-heading orange">Apparatus Required</h2>
        <ul className="apparatus-list">
          <li>Trainer kit for verifying truth tables of basic logic gates.</li>
          <li>
            IC 74LS08 (AND), 74LS32 (OR), 74LS04 (NOT), connecting
            wires/BNC cables etc.
          </li>
        </ul>
      </section>

      {/* Theory */}
      <section className="card collapsible-card">
        <div
          className="collapsible-header"
          onClick={() => setTheoryOpen((v) => !v)}
        >
          <h2 className="section-heading orange">Theory</h2>
          <span className="chevron">{theoryOpen ? "▲" : "▼"}</span>
        </div>

        {theoryOpen && (
          <div className="collapsible-body">
            <p>
              Logic gates are electronic circuits built from semiconductor
              devices that operate on two levels — HIGH/LOW, TRUE/FALSE, or
              1/0. A truth table lists all possible combinations of inputs
              and the corresponding output.
            </p>
            <p>
              <b>AND gate</b> — Output is HIGH only when every input is
              HIGH. Boolean expression: Y = A.B (74LS08).
            </p>
            <p>
              <b>OR gate</b> — Output is HIGH when at least one input is
              HIGH. Boolean expression: Y = A + B (74LS32).
            </p>
            <p>
              <b>NOT gate</b> — Also called an inverter, has a single input
              and output that is always the complement of the input.
              Boolean expression: Y = A̅ (74LS04).
            </p>
          </div>
        )}
      </section>

      {/* Procedure */}
      <section className="card collapsible-card">
        <div
          className="collapsible-header"
          onClick={() => setProcOpen((v) => !v)}
        >
          <h2 className="section-heading orange">Procedure</h2>
          <span className="chevron">{procOpen ? "▲" : "▼"}</span>
        </div>

        {procOpen && (
          <div className="collapsible-body proc-grid">
            <ol className="proc-col">
              <li>Select the gate to test from the dropdown in the Inputs panel.</li>
              <li>Connect inputs to the input switches as per pin diagram.</li>
              <li>Connect outputs to the O/P LED switches.</li>
            </ol>

            <ol className="proc-col" start={4}>
              <li>Apply input combinations as per the truth table.</li>
              <li>Click Verify and observe the O/P LED condition.</li>
              <li>Repeat for AND, OR and NOT until all rows are verified.</li>
            </ol>
          </div>
        )}
      </section>

      {/* Simulation Row */}
      <div className="sim-row">
        {/* Inputs */}
        <aside className="card inputs-panel">
          <h3 className="panel-heading">Inputs</h3>

          <div className="gate-select-wrap">
            <label htmlFor="gate-select" className="gate-select-label">
              Select Gate
            </label>
            <select
              id="gate-select"
              className="gate-select"
              value={selectedGate}
              onChange={(e) => handleGateChange(e.target.value)}
            >
              {GATES.map((g) => (
                <option key={g} value={g}>
                  {g} Gate
                </option>
              ))}
            </select>
          </div>

          <ToggleSwitch
            label="A"
            value={currentInputs.A}
            onChange={(v) => setInput("A", v)}
          />

          {selectedGate !== "NOT" && (
            <ToggleSwitch
              label="B"
              value={currentInputs.B}
              onChange={(v) => setInput("B", v)}
            />
          )}

          <p className="gate-desc">{info.desc}</p>
          <p className="gate-meta">
            {info.expression} &nbsp;•&nbsp; {info.ic}
          </p>

          {alreadyDone && (
            <p className="input-hint">
              Combination already recorded in observation table.
            </p>
          )}
        </aside>

        {/* Canvas */}
        <div className="card canvas-panel">
          <h3 className="panel-heading">Simulation Canvas</h3>

          <SimulationCanvas
            gate={selectedGate}
            verifiedInputs={verifiedInputs}
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

        {/* Analysis */}
        <aside className="card analysis-panel">
          <h3 className="panel-heading orange">Verification Analysis</h3>

          <div className="analysis-block">
            <h4 className="analysis-sub">Current Inputs</h4>

            <table className="analysis-table">
              <tbody>
                <tr>
                  <td>A</td>
                  <td>=</td>
                  <td>{verified ? verifiedInputs.A : "—"}</td>
                </tr>

                {selectedGate !== "NOT" && (
                  <tr>
                    <td>B</td>
                    <td>=</td>
                    <td>{verified ? verifiedInputs.B : "—"}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {verified && analysis && (
            <>
              <div className="analysis-block">
                <h4 className="analysis-sub">Output</h4>

                <table className="analysis-table">
                  <tbody>
                    <tr>
                      <td>Gate</td>
                      <td>:</td>
                      <td>{selectedGate}</td>
                    </tr>

                    <tr>
                      <td>Output Y</td>
                      <td>:</td>
                      <td>{analysis.output}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="analysis-block">
                <h4 className="analysis-sub">Conclusion</h4>

                <p className="conclusion-text">{analysis.conclusion}</p>

                <p className="verified-badge">✔ VERIFIED</p>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Observation Table — only the CURRENTLY SELECTED gate's truth table */}
      <section className="card table-section">
        <h3 className="panel-heading orange">
          Observation Table (Truth Table — {selectedGate} Gate)
        </h3>

        <div className="table-scroll">
          <table className="obs-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>A</th>
                <th>B</th>
                <th>Output Y (Expected)</th>
                <th>Output Y (Observed)</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {currentGateRows.map((row) => {
                const expectedY = gateOutput(row.gate, row.A, row.B ?? 0);

                return (
                  <tr
                    key={`${row.gate}-${row.id}`}
                    className={row.status === "Verified" ? "row-verified" : ""}
                  >
                    <td>{row.id}</td>

                    <td>{row.A}</td>

                    <td>{row.gate === "NOT" ? "—" : row.B}</td>

                    <td>{expectedY}</td>

                    <td>{row.output !== null ? row.output : "—"}</td>

                    <td>
                      {row.status === "Verified" ? (
                        <span className="status-verified">✔ Verified</span>
                      ) : (
                        <span className="status-pending">Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="table-hint">
          ℹ {gateVerifiedCount} / {currentGateRows.length} combinations
          verified for the {selectedGate} gate. Overall progress:{" "}
          {verifiedCount} / {allRows.length} across AND, OR &amp; NOT.
          Submit unlocks once all 10 are verified.
        </p>
      </section>

      {/* Submit */}
      <section className="submit-section">
        <button
          className={`btn-submit ${
            allVerified && !submitted ? "enabled" : "disabled"
          }`}
          onClick={handleSubmit}
          disabled={!allVerified || submitted}
        >
          🔒 {submitted ? "Submitted" : "Submit Experiment"}
        </button>

        <div className="submit-status">
          {submitted ? (
            <p className="submit-success">Experiment Submitted Successfully</p>
          ) : allVerified ? (
            <>
              <p>All 10 combinations verified.</p>
              <p>You can now submit the experiment.</p>
            </>
          ) : (
            <p>
              Complete all {allRows.length} combinations across AND, OR &amp;
              NOT gates to unlock submission.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}