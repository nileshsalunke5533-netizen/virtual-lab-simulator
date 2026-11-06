// DTMExperiment6.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./DTMExperiment6.css";

// ─────────────────────────────────────────────────────────────
// DEMUX Logic
// ─────────────────────────────────────────────────────────────
function analyzeDemux({ E, D, S1, S0 }) {
  if (E === 0) {
    return {
      selectedOutput: "None",
      outputs: { Y0: 0, Y1: 0, Y2: 0, Y3: 0 },
      conclusion: "E=0, DEMUX disabled. Therefore all outputs Y0-Y3=0 and all LEDs are OFF.",
    };
  }

  const selMap = {
    "00": "Y0",
    "01": "Y1",
    "10": "Y2",
    "11": "Y3",
  };

  const key = `${S1}${S0}`;
  const selectedOutput = selMap[key];

  const outputs = { Y0: 0, Y1: 0, Y2: 0, Y3: 0 };
  outputs[selectedOutput] = D;

  return {
    selectedOutput,
    outputs,
    conclusion: `E=1 and S1S0=${key} routes D to ${selectedOutput}, therefore ${selectedOutput}=D=${D} and all other outputs are 0.`,
  };
}

// ─────────────────────────────────────────────────────────────
// Initial Table Rows
// ─────────────────────────────────────────────────────────────
const INITIAL_ROWS = [
  { id: 1, E: 0, S1: 0, S0: 0 },
  { id: 2, E: 0, S1: 0, S0: 1 },
  { id: 3, E: 0, S1: 1, S0: 0 },
  { id: 4, E: 0, S1: 1, S0: 1 },
  { id: 5, E: 1, S1: 0, S0: 0 },
  { id: 6, E: 1, S1: 0, S0: 1 },
  { id: 7, E: 1, S1: 1, S0: 0 },
  { id: 8, E: 1, S1: 1, S0: 1 },
].map((r) => ({
  ...r,
  status: "Pending",
  D: null,
  Y0: null,
  Y1: null,
  Y2: null,
  Y3: null,
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
// Simulation Canvas
// ─────────────────────────────────────────────────────────────
function SimulationCanvas({ verifiedInputs, analysis, verified }) {
  const { E, D, S1, S0 } = verifiedInputs;

  const selected = analysis?.selectedOutput;

  const inputWireClass = () =>
    verified && E === 1 ? "wire active-wire" : "wire";

  const outputWireClass = (name) =>
    verified && selected === name && E === 1
      ? "wire active-wire"
      : "wire";

  const textLabel = (name, y) => (
    <text
      x="302"
      y={y + 5}
      className={
        verified && selected === name && E === 1
          ? "demux-output-active"
          : "demux-output-label"
      }
    >
      {name}
    </text>
  );

  return (
    <div className="canvas-area">
      <svg
        viewBox="0 0 480 380"
        className="demux-svg"
        aria-label="1:4 DEMUX Simulation"
      >

        {/* Enable */}
        <line x1="238" y1="30" x2="238" y2="100" className="wire" strokeWidth="2"/>
        <circle cx="238" cy="30" r="4" className="wire-node"/>
        <text x="238" y="22" textAnchor="middle" className="svg-label">
          E (Enable)
        </text>
        <text x="238" y="45" textAnchor="middle" className="svg-val">
          {E}
        </text>

        {/* DEMUX */}
        <rect
          x="160"
          y="100"
          width="160"
          height="170"
          rx="8"
          className="demux-block"
        />

        <text
          x="240"
          y="178"
          textAnchor="middle"
          className="demux-label-top"
        >
          1:4
        </text>

        <text
          x="240"
          y="205"
          textAnchor="middle"
          className="demux-label-bot"
        >
          DEMUX
        </text>

        {/* Input D */}
        <line
          x1="80"
          y1="170"
          x2="160"
          y2="170"
          className={inputWireClass()}
          strokeWidth="2"
        />

        <circle
          cx="80"
          cy="170"
          r="5"
          className={verified && E === 1 ? "wire-node active-node" : "wire-node"}
        />

        <text x="75" y="155" textAnchor="end" className="svg-label">
          D (Input)
        </text>

        <text x="92" y="190" textAnchor="middle" className="svg-val">
          {D}
        </text>

        {/* Outputs */}
        {[
          { name: "Y0", y: 125 },
          { name: "Y1", y: 155 },
          { name: "Y2", y: 185 },
          { name: "Y3", y: 215 },
        ].map(({ name, y }) => (
          <g key={name}>
            {textLabel(name, y)}

            <line
              x1="320"
              y1={y}
              x2="400"
              y2={y}
              className={outputWireClass(name)}
              strokeWidth="2"
            />

            {/* LED */}
            <circle
              cx="420"
              cy={y}
              r="11"
              className={`led-circle ${
                verified && analysis?.outputs?.[name] === 1
                  ? "led-on"
                  : "led-off"
              }`}
            />

            <text
              x="420"
              y={y + 25}
              textAnchor="middle"
              className="svg-label"
            >
              {name}
            </text>

            <text
              x="365"
              y={y - 8}
              textAnchor="middle"
              className="svg-val"
            >
              {verified ? analysis?.outputs?.[name] : ""}
            </text>
          </g>
        ))}

        {/* Select Lines */}
        <line x1="200" y1="270" x2="200" y2="340" className="wire" strokeWidth="2"/>
        <line x1="270" y1="270" x2="270" y2="340" className="wire" strokeWidth="2"/>

        <circle cx="200" cy="340" r="4" className="wire-node"/>
        <circle cx="270" cy="340" r="4" className="wire-node"/>

        <text x="200" y="357" textAnchor="middle" className="svg-label">
          S1
        </text>

        <text x="270" y="357" textAnchor="middle" className="svg-label">
          S0
        </text>

        <text
          x="200"
          y="370"
          textAnchor="middle"
          className="svg-val"
          style={{ fill: "var(--green)" }}
        >
          {S1}
        </text>

        <text
          x="270"
          y="370"
          textAnchor="middle"
          className="svg-val"
          style={{ fill: "var(--green)" }}
        >
          {S0}
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

export default function DTMExperiment6() {
  
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);

  const defaultInputs = {
    E: 0,
    D: 0,
    S1: 0,
    S0: 0,
  };

  const [currentInputs, setCurrentInputs] = useState({ ...defaultInputs });

  const [verifiedInputs, setVerifiedInputs] = useState({ ...defaultInputs });

  const [analysis, setAnalysis] = useState(null);

  const [verified, setVerified] = useState(false);

  const [tableRows, setTableRows] = useState(INITIAL_ROWS);

  const [submitted, setSubmitted] = useState(false);

  const [theoryOpen, setTheoryOpen] = useState(false);

  const [procOpen, setProcOpen] = useState(false);

  const [lastVerifiedInputs, setLastVerifiedInputs] = useState(null);

  const setInput = (key, val) =>
    setCurrentInputs((prev) => ({
      ...prev,
      [key]: val,
    }));

  const alreadyDone = tableRows.some(
    (row) =>
      row.E === currentInputs.E &&
      row.S1 === currentInputs.S1 &&
      row.S0 === currentInputs.S0 &&
      row.status === "Verified"
  );

  const allVerified = tableRows.every(
    (r) => r.status === "Verified"
  );

  // ───────────────────────────────────────
  // Verify
  // ───────────────────────────────────────
  const handleVerify = () => {

    const snap = { ...currentInputs };

    const result = analyzeDemux(snap);

    setVerifiedInputs(snap);

    setAnalysis(result);

    setVerified(true);

    setLastVerifiedInputs(snap);

    setTableRows((rows) =>
      rows.map((row) => {

        if (
          row.E === snap.E &&
          row.S1 === snap.S1 &&
          row.S0 === snap.S0 &&
          row.status === "Pending"
        ) {

          return {
            ...row,
            D: snap.D,
            Y0: result.outputs.Y0,
            Y1: result.outputs.Y1,
            Y2: result.outputs.Y2,
            Y3: result.outputs.Y3,
            status: "Verified",
          };

        }

        return row;

      })
    );

  };

  // ───────────────────────────────────────
  // Reset
  // ───────────────────────────────────────
  const handleReset = () => {

    setCurrentInputs({ ...defaultInputs });

    setVerifiedInputs({ ...defaultInputs });

    setAnalysis(null);

    setVerified(false);

    setLastVerifiedInputs(null);

  };

  // ───────────────────────────────────────
  // Submit
  // ───────────────────────────────────────
  const handleSubmit = () => {

    if (!allVerified || submitted) return;

    setSubmitted(true);
      navigate("/dtm-result", {
    state: {

      experimentNo: 6,

      experimentName:
        " Verify 1:4 DEMUX truth table ",

      experimentRoute:
        "/dtm-experiment-6",
      
    }
  })

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
          Experiment 6 : Verify 1:4 Demultiplexer Truth Table
        </h1>

        <button className="btn-help" onClick={() => setHelpOpen(true)}> ? Help </button>
      </header>
      {renderHelpPopup(helpOpen, () => setHelpOpen(false), "Experiment 6 Help", [
        "Set the data input and four select inputs for the 1:4 demultiplexer.",
        "Change the select lines to route the input to the selected output.",
        "Test all select combinations and verify the active output in the truth table.",
      ])}

      {/* Aim */}
      <section className="card aim-card">
        <h2 className="section-heading orange">
          Aim
        </h2>

        <p>
          Verify 1:4 Demultiplexer Truth Table.
        </p>
      </section>

      {/* Theory */}
      <section className="card collapsible-card">

        <div
          className="collapsible-header"
          onClick={() => setTheoryOpen((v) => !v)}
        >

          <h2 className="section-heading orange">
            Theory
          </h2>

          <span className="chevron">
            {theoryOpen ? "▲" : "▼"}
          </span>

        </div>

        {theoryOpen && (
          <div className="collapsible-body">

            <p>
              A demultiplexer (DEMUX) is a combinational circuit that takes a
              single data input and routes it to one of several output lines.
            </p>

            <p>
              A 1:4 DEMUX contains one data input D, two select lines
              S1 and S0, one enable input E and four outputs Y0-Y3.
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

          <h2 className="section-heading orange">
            Procedure
          </h2>

          <span className="chevron">
            {procOpen ? "▲" : "▼"}
          </span>

        </div>

        {procOpen && (
          <div className="collapsible-body proc-grid">

            <ol className="proc-col">
              <li>Set D (data input).</li>
              <li>Select S1 and S0.</li>
              <li>Set Enable E.</li>
            </ol>

            <ol className="proc-col" start={4}>
              <li>Click Verify.</li>
              <li>Complete all combinations.</li>
              <li>Submit experiment.</li>
            </ol>

          </div>
        )}

      </section>

      {/* Simulation Row */}
      <div className="sim-row">

        {/* Inputs */}
        <aside className="card inputs-panel">

          <h3 className="panel-heading">
            Inputs
          </h3>

          {["E", "D", "S1", "S0"].map((key) => (
            <ToggleSwitch
              key={key}
              label={key === "E" ? "E (Enable)" : key === "D" ? "D (Input)" : key}
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

        {/* Canvas */}
        <div className="card canvas-panel">

          <h3 className="panel-heading">
            Simulation Canvas
          </h3>

          <SimulationCanvas
            verifiedInputs={verifiedInputs}
            analysis={analysis}
            verified={verified}
          />

          <div className="canvas-actions">

            <button
              className="btn-verify"
              onClick={handleVerify}
            >
              ✔ Verify
            </button>

            <button
              className="btn-reset"
              onClick={handleReset}
            >
              ↺ Reset
            </button>

          </div>

        </div>

        {/* Analysis */}
        <aside className="card analysis-panel">

          <h3 className="panel-heading orange">
            Verification Analysis
          </h3>

          <div className="analysis-block">

            <h4 className="analysis-sub">
              Current Inputs
            </h4>

            <table className="analysis-table">
              <tbody>

                {["E", "D", "S1", "S0"].map((k) => (
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

                <h4 className="analysis-sub">
                  Outputs
                </h4>

                <table className="analysis-table">
                  <tbody>

                    <tr>
                      <td>Selected Output</td>
                      <td>:</td>
                      <td>{analysis.selectedOutput}</td>
                    </tr>

                    {["Y0", "Y1", "Y2", "Y3"].map((k) => (
                      <tr key={k}>
                        <td>{k}</td>
                        <td>:</td>
                        <td>{analysis.outputs[k]}</td>
                      </tr>
                    ))}

                  </tbody>
                </table>

              </div>

              <div className="analysis-block">

                <h4 className="analysis-sub">
                  Conclusion
                </h4>

                <p className="conclusion-text">
                  {analysis.conclusion}
                </p>

                <p className="verified-badge">
                  ✔ VERIFIED
                </p>

              </div>

            </>
          )}

        </aside>

      </div>

      {/* Observation Table */}
      <section className="card table-section">

        <h3 className="panel-heading orange">
          Observation Table (Truth Table)
        </h3>

        <div className="table-scroll">

          <table className="obs-table">

            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>E</th>
                <th>S1</th>
                <th>S0</th>
                <th>D</th>
                <th>Y0 (Expected)</th>
                <th>Y1 (Expected)</th>
                <th>Y2 (Expected)</th>
                <th>Y3 (Expected)</th>
                <th>Observed Outputs</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {tableRows.map((row, idx) => {

                let expectedY0, expectedY1, expectedY2, expectedY3;

                if (row.E === 0) {
                  expectedY0 = expectedY1 = expectedY2 = expectedY3 = 0;
                } else {
                  expectedY0 = row.S1 === 0 && row.S0 === 0 ? "D" : 0;
                  expectedY1 = row.S1 === 0 && row.S0 === 1 ? "D" : 0;
                  expectedY2 = row.S1 === 1 && row.S0 === 0 ? "D" : 0;
                  expectedY3 = row.S1 === 1 && row.S0 === 1 ? "D" : 0;
                }

                const isDivider = idx === 3;

                return (
                  <tr
                    key={row.id}
                    className={`
                      ${row.status === "Verified" ? "row-verified" : ""}
                      ${isDivider ? "row-divider" : ""}
                    `}
                  >

                    <td>{row.id}</td>

                    <td>{row.E}</td>

                    <td>{row.S1}</td>

                    <td>{row.S0}</td>

                    <td>{row.D !== null ? row.D : "X"}</td>

                    <td>{expectedY0}</td>

                    <td>{expectedY1}</td>

                    <td>{expectedY2}</td>

                    <td>{expectedY3}</td>

                    <td>
                      {row.Y0 !== null
                        ? `Y0=${row.Y0}, Y1=${row.Y1}, Y2=${row.Y2}, Y3=${row.Y3}`
                        : "—"}
                    </td>

                    <td>
                      {row.status === "Verified"
                        ? (
                          <span className="status-verified">
                            ✔ Verified
                          </span>
                        )
                        : (
                          <span className="status-pending">
                            Pending
                          </span>
                        )}
                    </td>

                  </tr>
                );

              })}

            </tbody>

          </table>

        </div>

        <p className="table-hint">
          ℹ Verify each combination (8 total). After all are verified,
          Submit button will be enabled.
        </p>

      </section>


      {/* Submit */}
      <section className="submit-section">

        <button
          className={`btn-submit ${
            allVerified && !submitted
              ? "enabled"
              : "disabled"
          }`}
          onClick={handleSubmit}
          disabled={!allVerified || submitted}
        >

          🔒 {submitted
            ? "Submitted"
            : "Submit Experiment"}

        </button>

        <div className="submit-status">

          {submitted ? (

            <p className="submit-success">
              Experiment Submitted Successfully
            </p>

          ) : allVerified ? (

            <>
              <p>
                All 8 combinations verified.
              </p>

              <p>
                You can now submit the experiment.
              </p>
            </>

          ) : (

            <p>
              {
                tableRows.filter(
                  (r) => r.status === "Verified"
                ).length
              }
              {" / 8 combinations verified."}
            </p>

          )}

        </div>

      </section>

    </div>
  );
}