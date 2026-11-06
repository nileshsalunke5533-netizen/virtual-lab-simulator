import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DTMExperiment5.css";

// ─────────────────────────────────────────────────────────────
// MUX Logic
// ─────────────────────────────────────────────────────────────
function analyzeMux({ E, D0, D1, D2, D3, S1, S0 }) {
  if (E === 0) {
    return {
      selectedInput: "None",
      selectedValue: 0,
      outputY: 0,
      ledStatus: "OFF",
      conclusion: "E=0, MUX disabled. Therefore Y=0 and LED is OFF.",
    };
  }

  const selMap = {
    "00": { name: "D0", value: D0 },
    "01": { name: "D1", value: D1 },
    "10": { name: "D2", value: D2 },
    "11": { name: "D3", value: D3 },
  };

  const key = `${S1}${S0}`;
  const { name, value } = selMap[key];

  return {
    selectedInput: name,
    selectedValue: value,
    outputY: value,
    ledStatus: value === 1 ? "ON" : "OFF",
    conclusion: `E=1 and S1S0=${key} selected ${name}, therefore Y=${name}=${value} and LED is ${
      value === 1 ? "ON" : "OFF"
    }.`,
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
  D0: null,
  D1: null,
  D2: null,
  D3: null,
  outputY: null,
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
  const { E, D0, D1, D2, D3, S1, S0 } = verifiedInputs;

  const selected = analysis?.selectedInput;

  const inputWireClass = (name) =>
    verified && selected === name && E === 1
      ? "wire active-wire"
      : "wire";

  // changed logic
  const outputWireClass = () =>
    verified && E === 1
      ? "wire active-wire"
      : "wire";

  const textLabel = (name, y) => (
    <text
      x="178"
      y={y + 5}
      className={
        verified && selected === name && E === 1
          ? "mux-input-active"
          : "mux-input-label"
      }
    >
      {name}
    </text>
  );

  return (
    <div className="canvas-area">
      <svg
        viewBox="0 0 480 380"
        className="mux-svg"
        aria-label="4:1 MUX Simulation"
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

        {/* MUX */}
        <rect
          x="160"
          y="100"
          width="160"
          height="170"
          rx="8"
          className="mux-block"
        />

        {textLabel("D0",125)}
        {textLabel("D1",155)}
        {textLabel("D2",185)}
        {textLabel("D3",215)}

        <text
          x="240"
          y="178"
          textAnchor="middle"
          className="mux-label-top"
        >
          4:1
        </text>

        <text
          x="240"
          y="205"
          textAnchor="middle"
          className="mux-label-bot"
        >
          MUX
        </text>

        {/* Inputs */}
        {[
          { name: "D0", val: D0, y: 125 },
          { name: "D1", val: D1, y: 155 },
          { name: "D2", val: D2, y: 185 },
          { name: "D3", val: D3, y: 215 },
        ].map(({ name, val, y }) => (
          <g key={name}>
            <line
              x1="60"
              y1={y}
              x2="160"
              y2={y}
              className={inputWireClass(name)}
              strokeWidth="2"
            />

            <circle
              cx="60"
              cy={y}
              r="5"
              className={
                verified && selected === name && E === 1
                  ? "wire-node active-node"
                  : "wire-node"
              }
            />

            <text
              x="55"
              y={y - 8}
              textAnchor="end"
              className="svg-label"
            >
              {name}
            </text>

            <text
              x="72"
              y={y + 15}
              textAnchor="middle"
              className="svg-val"
            >
              {val}
            </text>
          </g>
        ))}

        {/* Output */}
        <line
          x1="320"
          y1="185"
          x2="400"
          y2="185"
          className={outputWireClass()}
          strokeWidth="2"
        />

        <text
          x="380"
          y="175"
          textAnchor="middle"
          className="svg-label"
        >
          Y (Output)
        </text>

        <text
          x="380"
          y="200"
          textAnchor="middle"
          className="svg-val"
        >
          {verified ? analysis?.outputY : ""}
        </text>

        {/* LED */}
        <circle
          cx="420"
          cy="185"
          r="20"
          className={`led-circle ${
            verified && analysis?.ledStatus === "ON"
              ? "led-on"
              : "led-off"
          }`}
        />

        <text
          x="420"
          y="218"
          textAnchor="middle"
          className="svg-label"
        >
          LED
        </text>

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

export default function DTMExperiment5() {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const defaultInputs = {
    E: 0,
    D0: 0,
    D1: 0,
    D2: 0,
    D3: 0,
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

  // prevents pressing verify repeatedly on same values
  const [lastVerifiedInputs, setLastVerifiedInputs] = useState(null);

  const setInput = (key, val) =>
    setCurrentInputs((prev) => ({
      ...prev,
      [key]: val,
    }));

  // combination already verified?
  const alreadyDone = tableRows.some(
    (row) =>
      row.E === currentInputs.E &&
      row.S1 === currentInputs.S1 &&
      row.S0 === currentInputs.S0 &&
      row.status === "Verified"
  );

  // all combinations verified?
  const allVerified = tableRows.every(
    (r) => r.status === "Verified"
  );

  // ───────────────────────────────────────
  // Verify
  // ───────────────────────────────────────
const handleVerify = () => {

  const snap = { ...currentInputs };

  const result = analyzeMux(snap);

  // Always update simulation and analysis
  setVerifiedInputs(snap);

  setAnalysis(result);

  setVerified(true);

  // Keep dependency unchanged
  setLastVerifiedInputs(snap);

  // Record combination only once in observation table
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
          D0: snap.D0,
          D1: snap.D1,
          D2: snap.D2,
          D3: snap.D3,
          outputY: result.outputY,
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
  // ───────────────────────────────
  // Open Common Result Page
  // ───────────────────────────────
  navigate("/dtm-result", {
    state: {

      experimentNo:5,

      experimentName:
        "4:1 Multiplexer ",

      experimentRoute:
        "/dtm-experiment-5",
      
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
        Experiment 5 : Verify 4:1 Multiplexer Truth Table
      </h1>

      <button className="btn-help" onClick={() => setHelpOpen(true)}> ? Help </button>
    </header>
    {renderHelpPopup(helpOpen, () => setHelpOpen(false), "Experiment 5 Help", [
      "Set the four data inputs and two select inputs for the 4:1 multiplexer.",
      "Change the select lines to choose which data input reaches the output.",
      "Run each combination and verify the observed output against the truth table.",
    ])}

    {/* Aim */}
    <section className="card aim-card">
      <h2 className="section-heading orange">
        Aim
      </h2>

      <p>
        Verify 4:1 Multiplexer Truth Table.
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
            A multiplexer (MUX) is a combinational circuit that selects one
            of many input lines and forwards it to a single output line.
          </p>

          <p>
            A 4:1 MUX contains four data inputs D0-D3, two select lines
            S1 and S0, one enable input E and one output Y.
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
            <li>Set D0, D1, D2 and D3.</li>
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

        {["E", "D0", "D1", "D2", "D3", "S1", "S0"].map((key) => (
          <ToggleSwitch
            key={key}
            label={key === "E" ? "E (Enable)" : key}
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

              {["E", "D0", "D1", "D2", "D3", "S1", "S0"].map((k) => (
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
                Output
              </h4>

              <table className="analysis-table">
                <tbody>

                  <tr>
                    <td>Selected Input</td>
                    <td>:</td>
                    <td>{analysis.selectedInput}</td>
                  </tr>

                  <tr>
                    <td>Output Y</td>
                    <td>:</td>
                    <td>{analysis.outputY}</td>
                  </tr>

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
              <th>D0</th>
              <th>D1</th>
              <th>D2</th>
              <th>D3</th>
              <th>Output Y (Expected)</th>
              <th>Output Y (Observed)</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {tableRows.map((row, idx) => {

              let expectedY;

              if (row.E === 0)
                expectedY = 0;
              else if (row.S1 === 0 && row.S0 === 0)
                expectedY = "D0";
              else if (row.S1 === 0 && row.S0 === 1)
                expectedY = "D1";
              else if (row.S1 === 1 && row.S0 === 0)
                expectedY = "D2";
              else
                expectedY = "D3";

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

                  <td>{row.D0 !== null ? row.D0 : "X"}</td>

                  <td>{row.D1 !== null ? row.D1 : "X"}</td>

                  <td>{row.D2 !== null ? row.D2 : "X"}</td>

                  <td>{row.D3 !== null ? row.D3 : "X"}</td>

                  <td>{expectedY}</td>

                  <td>
                    {row.outputY !== null
                      ? row.outputY
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