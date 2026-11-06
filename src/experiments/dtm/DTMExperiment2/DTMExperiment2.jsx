import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DTMExperiment2.css";

// ─────────────────────────────────────────────────────────────
// Gate Logic — Universal (NAND, NOR) & Special (XOR, XNOR) Gates
// ─────────────────────────────────────────────────────────────
const GATES = ["NAND", "NOR", "XOR", "XNOR"];

const GATE_INFO = {
  NAND: {
    expression: "Y = (A . B)̅",
    ic: "IC 74LS00",
    desc: "Output is LOW only when BOTH inputs are HIGH. A universal gate.",
    inputs: 2,
  },
  NOR: {
    expression: "Y = (A + B)̅",
    ic: "IC 74LS02",
    desc: "Output is HIGH only when BOTH inputs are LOW. A universal gate.",
    inputs: 2,
  },
  XOR: {
    expression: "Y = A ⊕ B",
    ic: "IC 74LS86",
    desc: "Output is HIGH when the inputs are DIFFERENT from each other.",
    inputs: 2,
  },
  XNOR: {
    expression: "Y = (A ⊕ B)̅",
    ic: "IC 74LS266",
    desc: "Output is HIGH when the inputs are the SAME as each other.",
    inputs: 2,
  },
};

function gateOutput(gate, A, B) {
  if (gate === "NAND") return A & B ? 0 : 1;
  if (gate === "NOR") return A | B ? 0 : 1;
  if (gate === "XOR") return A ^ B;
  return A ^ B ? 0 : 1; // XNOR
}

function buildConclusion(gate, A, B, Y) {
  const status = Y === 1 ? "ON" : "OFF";
  const expr = GATE_INFO[gate].expression.replace("Y = ", "");
  return `A=${A} and B=${B}, therefore Y=${expr}=${Y}. LED is ${status}.`;
}

// ─────────────────────────────────────────────────────────────
// Initial Observation Tables
// ─────────────────────────────────────────────────────────────
function buildInitialTables() {
  const rows = () =>
    [
      { id: 1, A: 0, B: 0 },
      { id: 2, A: 0, B: 1 },
      { id: 3, A: 1, B: 0 },
      { id: 4, A: 1, B: 1 },
    ].map((r) => ({ ...r, output: null, status: "Pending" }));

  const tables = {};
  GATES.forEach((g) => {
    tables[g] = rows();
  });

  return tables;
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
// Bubbles sit flush against each gate body's output tip.
// Labels are centered exactly on the visual centroid of each
// shape's solid body (curved input line on XOR/XNOR is excluded
// from the centroid calc since it's not part of the filled body).
// ─────────────────────────────────────────────────────────────
const GATE_LABEL_POS = {
  NAND: { x: 46, y: 60 },
  NOR: { x: 36, y: 60 },
  XOR: { x: 52, y: 60 },
  XNOR: { x: 50, y: 60 },
};

function GateShape({ gate }) {
  if (gate === "NAND") {
    return (
      <>
        <path
          d="M0,0 L58,0 A60,60 0 0 1 58,120 L0,120 Z"
          className="gate-shape"
        />
        {/* bubble sits flush against the AND-body tip (x=118) */}
        <circle cx="128" cy="60" r="10" className="gate-shape-bubble" />
      </>
    );
  }

  if (gate === "NOR") {
    return (
      <>
        <path
          d="M0,0 C42,0 72,25 92,60 C72,95 42,120 0,120 C22,80 22,40 0,0 Z"
          className="gate-shape"
        />
        {/* bubble sits flush against the OR-body tip (x=92) */}
        <circle cx="101" cy="60" r="9" className="gate-shape-bubble" />
      </>
    );
  }

  if (gate === "XOR") {
    return (
      <>
        <path
          d="M0,0 C22,40 22,80 0,120"
          className="gate-shape-extra-line"
        />
        <path
          d="M14,0 C36,0 66,25 86,60 C66,95 36,120 14,120 C36,80 36,40 14,0 Z"
          className="gate-shape"
        />
      </>
    );
  }

  // XNOR
  return (
    <>
      <path d="M0,0 C22,40 22,80 0,120" className="gate-shape-extra-line" />
      <path
        d="M14,0 C36,0 66,25 86,60 C66,95 36,120 14,120 C36,80 36,40 14,0 Z"
        className="gate-shape"
      />
      {/* bubble sits flush against the XOR-body tip (x=86) */}
      <circle cx="95" cy="60" r="9" className="gate-shape-bubble" />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Simulation Canvas
// ─────────────────────────────────────────────────────────────
function SimulationCanvas({ gate, verifiedInputs, analysis, verified }) {
  const { A, B } = verifiedInputs;

  const inputAY = 105;
  const inputBY = 195;

  const outputStartXMap = {
    NAND: 318,
    NOR: 292,
    XOR: 266,
    XNOR: 286,
  };
  const outputStartX = outputStartXMap[gate];

  const wireOnClass = (on) => (verified && on ? "wire active-wire" : "wire");
  const nodeOnClass = (on) =>
    verified && on ? "wire-node active-node" : "wire-node";

  const labelPos = GATE_LABEL_POS[gate];

  return (
    <div className="canvas-area">
      <svg viewBox="0 0 480 280" className="gate-svg" aria-label={`${gate} gate simulation`}>
        <defs>
          <linearGradient id="gateGradient2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#33c9c7" />
            <stop offset="100%" stopColor="#0b8180" />
          </linearGradient>
        </defs>

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

        {/* Input B */}
        <line
          x1="60"
          y1={inputBY}
          x2="180"
          y2={inputBY}
          className={wireOnClass(B === 1)}
          strokeWidth="2"
        />
        <circle cx="60" cy={inputBY} r="5" className={nodeOnClass(B === 1)} />
        <text x="55" y={inputBY - 10} textAnchor="end" className="svg-label">
          B
        </text>
        <text x="72" y={inputBY + 18} textAnchor="middle" className="svg-val">
          {B}
        </text>

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
          className={`led-circle ${
            verified && analysis?.output === 1 ? "led-on" : "led-off"
          }`}
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

export default function DTMExperiment2() {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedGate, setSelectedGate] = useState("NAND");

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

  const alreadyDone = tables[selectedGate].some(
    (row) =>
      row.A === currentInputs.A &&
      row.B === currentInputs.B &&
      row.status === "Verified"
  );

  const currentGateRows = tables[selectedGate].map((r) => ({
    ...r,
    gate: selectedGate,
  }));

  const allRows = GATES.flatMap((g) =>
    tables[g].map((r) => ({ ...r, gate: g }))
  );

  const verifiedCount = allRows.filter((r) => r.status === "Verified").length;

  const allVerified = verifiedCount === allRows.length;

  const handleVerify = () => {
    const snap = { ...currentInputs };

    const output = gateOutput(selectedGate, snap.A, snap.B);

    const conclusion = buildConclusion(selectedGate, snap.A, snap.B, output);

    setVerifiedInputs(snap);

    setAnalysis({ output, conclusion });

    setVerified(true);

    setTables((prev) => {
      const rows = prev[selectedGate].map((row) => {
        const matches = row.A === snap.A && row.B === snap.B;

        if (matches && row.status === "Pending") {
          return { ...row, output, status: "Verified" };
        }
        return row;
      });

      return { ...prev, [selectedGate]: rows };
    });
  };

  const handleReset = () => {
    setCurrentInputs({ A: 0, B: 0 });
    setVerifiedInputs({ A: 0, B: 0 });
    setAnalysis(null);
    setVerified(false);
  };

  const handleSubmit = () => {
    if (!allVerified || submitted) return;
    setSubmitted(true);
      navigate("/dtm-result", {
    state: {

      experimentNo: 2,

      experimentName:
        "Assemble and test universal and special logic gates.",

      experimentRoute:
        "/dtm-experiment-2",
      
    }
  });
  };

  const info = GATE_INFO[selectedGate];
  const gateVerifiedCount = currentGateRows.filter(
    (r) => r.status === "Verified"
  ).length;

  return (
    <div className="DTMExperiment2-root">
      {/* Header */}
      <header className="exp-header">
       <button
  className="btn-back"
  onClick={() => navigate("/dtm-experiments", { replace: true })}
>
  ← Back
</button>

        <h1 className="exp-title">
          Experiment 2 : Assemble and Test Universal and Special Logic Gates
        </h1>

        <button className="btn-help" onClick={() => setHelpOpen(true)}> ? Help </button>
      </header>
      {renderHelpPopup(helpOpen, () => setHelpOpen(false), "Experiment 2 Help", [
        "Choose a universal or special logic gate and enter its input combination.",
        "Run the gate to view its output and compare the result against the truth table.",
        "Check NAND, NOR, XOR, and XNOR behavior before submitting.",
      ])}

      {/* Aim */}
      <section className="card aim-card">
        <h2 className="section-heading orange">Aim</h2>
        <p>Assemble and test universal and special logic gates.</p>
      </section>

      {/* Apparatus */}
      <section className="card">
        <h2 className="section-heading orange">Apparatus Required</h2>
        <ul className="apparatus-list">
          <li>Trainer kit for verifying truth tables of universal and special logic gates.</li>
          <li>
            IC 74LS00 (NAND), 74LS02 (NOR), 74LS86 (XOR), 74LS266 (XNOR),
            connecting wires/BNC cables etc.
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
              NAND and NOR gates are called <b>universal gates</b> because
              any Boolean expression, and hence any other logic gate, can be
              realised using only NAND gates or only NOR gates.
            </p>
            <p>
              <b>NAND gate</b> — Complement of AND. Output is LOW only when
              every input is HIGH. Boolean expression: Y = (A.B)̅ (74LS00).
            </p>
            <p>
              <b>NOR gate</b> — Complement of OR. Output is HIGH only when
              every input is LOW. Boolean expression: Y = (A+B)̅ (74LS02).
            </p>
            <p>
              XOR and XNOR are called <b>special gates</b> as their output
              depends on whether the inputs agree or differ, unlike basic
              AND/OR/NOT logic.
            </p>
            <p>
              <b>XOR gate</b> — Output is HIGH only when the inputs are
              different. Boolean expression: Y = A⊕B (74LS86).
            </p>
            <p>
              <b>XNOR gate</b> — Complement of XOR. Output is HIGH only
              when the inputs are equal. Boolean expression: Y = (A⊕B)̅
              (74LS266).
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
              <li>Repeat for NAND, NOR, XOR and XNOR until all rows are verified.</li>
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

          <ToggleSwitch
            label="B"
            value={currentInputs.B}
            onChange={(v) => setInput("B", v)}
          />

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

                <tr>
                  <td>B</td>
                  <td>=</td>
                  <td>{verified ? verifiedInputs.B : "—"}</td>
                </tr>
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
                const expectedY = gateOutput(row.gate, row.A, row.B);

                return (
                  <tr
                    key={`${row.gate}-${row.id}`}
                    className={row.status === "Verified" ? "row-verified" : ""}
                  >
                    <td>{row.id}</td>

                    <td>{row.A}</td>

                    <td>{row.B}</td>

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
          {verifiedCount} / {allRows.length} across NAND, NOR, XOR &amp;
          XNOR. Submit unlocks once all 16 are verified.
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
              <p>All 16 combinations verified.</p>
              <p>You can now submit the experiment.</p>
            </>
          ) : (
            <p>{verifiedCount} / 16 combinations verified.</p>
          )}
        </div>
      </section>
    </div>
  );
}