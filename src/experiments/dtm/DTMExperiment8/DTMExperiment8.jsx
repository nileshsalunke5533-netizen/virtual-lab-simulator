import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DTMExperiment8.css";

// ─────────────────────────────────────────────────────────────
// JK Flip-Flop Logic
// ─────────────────────────────────────────────────────────────
function analyzeJK({ J, K, Qn }) {
  let outputQ;
  let operation;

  if (J === 0 && K === 0) {
    outputQ = Qn;
    operation = "No Change (Hold)";
  } else if (J === 0 && K === 1) {
    outputQ = 0;
    operation = "Reset";
  } else if (J === 1 && K === 0) {
    outputQ = 1;
    operation = "Set";
  } else {
    outputQ = Qn === 1 ? 0 : 1;
    operation = "Toggle";
  }

  const outputQBar = outputQ === 1 ? 0 : 1;

  return {
    outputQ,
    outputQBar,
    operation,
    conclusion: `J=${J}, K=${K}, Qn=${Qn} on clock pulse → ${operation}. Therefore Qn+1=${outputQ} and Q̄n+1=${outputQBar}.`,
  };
}

// ─────────────────────────────────────────────────────────────
// Initial Table Rows
// ─────────────────────────────────────────────────────────────
const INITIAL_ROWS = [
  { id: 1, J: 0, K: 0, Qn: 0 },
  { id: 2, J: 0, K: 0, Qn: 1 },
  { id: 3, J: 0, K: 1, Qn: 0 },
  { id: 4, J: 0, K: 1, Qn: 1 },
  { id: 5, J: 1, K: 0, Qn: 0 },
  { id: 6, J: 1, K: 0, Qn: 1 },
  { id: 7, J: 1, K: 1, Qn: 0 },
  { id: 8, J: 1, K: 1, Qn: 1 },
].map((r) => ({
  ...r,
  status: "Pending",
  outputQ: null,
  outputQBar: null,
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
// NAND Gate (shared shape)
// ─────────────────────────────────────────────────────────────
function NandGate({ x, y, w = 64, h = 50, active }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path
        d={`M0,0 L0,${h} L${w - 12},${h} A${h / 2},${h / 2} 0 0 0 ${w - 12},0 Z`}
        className={active ? "nand-body nand-body-active" : "nand-body"}
      />
      <circle cx={w - 4} cy={h / 2} r="5" className={active ? "nand-bubble nand-bubble-active" : "nand-bubble"} />
      <text x={(w - 12) / 2} y={h / 2 + 5} textAnchor="middle" className="nand-text">
        NAND
      </text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// Simulation Canvas
// ─────────────────────────────────────────────────────────────
function SimulationCanvas({ currentInputs, verifiedInputs, analysis, verified }) {
  const { J, K } = currentInputs;
  const CLK = verified ? 1 : 0;

  const jActive = verified && verifiedInputs.J === 1;
  const kActive = verified && verifiedInputs.K === 1;
  const clkActive = verified;
  const qActive = verified && analysis?.outputQ === 1;
  const qBarActive = verified && analysis?.outputQBar === 1;

  const greenVal = { fill: "var(--green)" };

  const wireClass = (active) => (active ? "wire active-wire" : "wire");
  const nodeClass = (active) => (active ? "wire-node active-node" : "wire-node");

  const NAND1 = { x: 150, y: 5, w: 80, h: 50, inTop: 20, inBot: 40, outY: 30, outX: 150 + 80 - 4 };
  const NAND2 = { x: 150, y: 165, w: 80, h: 50, inTop: 180, inBot: 200, outY: 190, outX: 150 + 80 - 4 };
  const NAND3 = { x: 330, y: 5, w: 80, h: 50, inTop: 20, inBot: 40, outY: 30, outX: 330 + 80 - 4 };
  const NAND4 = { x: 330, y: 165, w: 80, h: 50, inTop: 180, inBot: 200, outY: 190, outX: 330 + 80 - 4 };

  const crossX = 300;

  return (
    <div className="canvas-area">
      <svg viewBox="0 0 560 300" className="jk-svg" aria-label="JK Flip-Flop Simulation">

        <line x1="20" y1={NAND1.inTop} x2={NAND1.x} y2={NAND1.inTop} className={wireClass(jActive)} strokeWidth="2" />
        <circle cx="20" cy={NAND1.inTop} r="4" className={nodeClass(jActive)} />
        <text x="20" y={NAND1.inTop - 12} textAnchor="middle" className="svg-label">J</text>
        <text x="20" y={NAND1.inTop + 17} textAnchor="middle" className="svg-val" style={greenVal}>{J}</text>

        <line x1="20" y1={NAND2.inBot} x2={NAND2.x} y2={NAND2.inBot} className={wireClass(kActive)} strokeWidth="2" />
        <circle cx="20" cy={NAND2.inBot} r="4" className={nodeClass(kActive)} />
        <text x="20" y={NAND2.inBot - 12} textAnchor="middle" className="svg-label">K</text>
        <text x="20" y={NAND2.inBot + 17} textAnchor="middle" className="svg-val" style={greenVal}>{K}</text>

        <line x1="20" y1="110" x2="70" y2="110" className={wireClass(clkActive)} strokeWidth="2" />
        <circle cx="20" cy="110" r="4" className={nodeClass(clkActive)} />
        <circle cx="70" cy="110" r="3" className={nodeClass(clkActive)} />
        <text x="20" y="98" textAnchor="middle" className="svg-label">CLK</text>
        <text x="20" y="127" textAnchor="middle" className="svg-val" style={greenVal}>{CLK}</text>

        <line x1="70" y1="110" x2="70" y2={NAND1.inBot} className={wireClass(clkActive)} strokeWidth="2" />
        <line x1="70" y1={NAND1.inBot} x2={NAND1.x} y2={NAND1.inBot} className={wireClass(clkActive)} strokeWidth="2" />

        <line x1="70" y1="110" x2="70" y2={NAND2.inTop} className={wireClass(clkActive)} strokeWidth="2" />
        <line x1="70" y1={NAND2.inTop} x2={NAND2.x} y2={NAND2.inTop} className={wireClass(clkActive)} strokeWidth="2" />

        <NandGate x={NAND1.x} y={NAND1.y} w={NAND1.w} h={NAND1.h} active={jActive && clkActive} />
        <NandGate x={NAND2.x} y={NAND2.y} w={NAND2.w} h={NAND2.h} active={kActive && clkActive} />

        <line x1={NAND1.outX} y1={NAND1.outY} x2={NAND3.x} y2={NAND3.inTop} className={wireClass(qActive)} strokeWidth="2" />
        <line x1={NAND2.outX} y1={NAND2.outY} x2={NAND4.x} y2={NAND4.inBot} className={wireClass(qBarActive)} strokeWidth="2" />

        <NandGate x={NAND3.x} y={NAND3.y} w={NAND3.w} h={NAND3.h} active={qActive} />
        <NandGate x={NAND4.x} y={NAND4.y} w={NAND4.w} h={NAND4.h} active={qBarActive} />

        <line x1={NAND3.outX} y1={NAND3.outY} x2={crossX} y2={NAND4.inTop} className={wireClass(qActive)} strokeWidth="2" />
        <line x1={crossX} y1={NAND4.inTop} x2={NAND4.x} y2={NAND4.inTop} className={wireClass(qActive)} strokeWidth="2" />

        <line x1={NAND4.outX} y1={NAND4.outY} x2={crossX} y2={NAND3.inBot} className={wireClass(qBarActive)} strokeWidth="2" />
        <line x1={crossX} y1={NAND3.inBot} x2={NAND3.x} y2={NAND3.inBot} className={wireClass(qBarActive)} strokeWidth="2" />

        <circle cx={NAND3.outX} cy={NAND3.outY} r="3" className={nodeClass(qActive)} />
        <circle cx={NAND4.outX} cy={NAND4.outY} r="3" className={nodeClass(qBarActive)} />

        <line x1={NAND3.outX} y1={NAND3.outY} x2="480" y2={NAND3.outY} className={wireClass(qActive)} strokeWidth="2" />
        <text x="465" y={NAND3.outY - 12} textAnchor="middle" className="svg-label">Q</text>
        <circle cx="515" cy={NAND3.outY} r="16" className={`led-circle ${qActive ? "led-on" : "led-off"}`} />
        <text x="515" y={NAND3.outY + 33} textAnchor="middle" className="svg-val" style={greenVal}>
          {verified && analysis ? analysis.outputQ : 0}
        </text>

        <line x1={NAND4.outX} y1={NAND4.outY} x2="480" y2={NAND4.outY} className={wireClass(qBarActive)} strokeWidth="2" />
        <line x1="460" y1={NAND4.outY - 20} x2="470" y2={NAND4.outY - 20} className="svg-overline" strokeWidth="1.2" />
        <text x="465" y={NAND4.outY - 12} textAnchor="middle" className="svg-label">Q</text>
        <circle cx="515" cy={NAND4.outY} r="16" className={`led-circle ${qBarActive ? "led-on" : "led-off"}`} />
        <text x="515" y={NAND4.outY + 33} textAnchor="middle" className="svg-val" style={greenVal}>
          {verified && analysis ? analysis.outputQBar : 0}
        </text>

        <line x1="150" y1="270" x2="190" y2="270" className="wire" strokeWidth="2" />
        <text x="250" y="274" textAnchor="middle" className="svg-label">Inactive (0)</text>

        <line x1="320" y1="270" x2="360" y2="270" className="wire active-wire" strokeWidth="2" />
        <text x="415" y="274" textAnchor="middle" className="svg-label">Active (1)</text>

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

export default function DTMExperiment8() {
   const navigate = useNavigate();
   const [helpOpen, setHelpOpen] = useState(false);
  const defaultInputs = { J: 0, K: 0, Qn: 0 };

  const [currentInputs, setCurrentInputs] = useState({ ...defaultInputs });
  const [verifiedInputs, setVerifiedInputs] = useState({ ...defaultInputs });
  const [analysis, setAnalysis] = useState(null);
  const [verified, setVerified] = useState(false);
  const [clockApplied, setClockApplied] = useState(false);
  const [tableRows, setTableRows] = useState(INITIAL_ROWS);
  const [submitted, setSubmitted] = useState(false);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procOpen, setProcOpen] = useState(false);
  const [lastVerifiedInputs, setLastVerifiedInputs] = useState(null);

  const setInput = (key, val) => {
    setCurrentInputs((prev) => ({ ...prev, [key]: val }));
    setClockApplied(false);
    setVerified(false);
  };

  const alreadyDone = tableRows.some(
    (row) =>
      row.J === currentInputs.J &&
      row.K === currentInputs.K &&
      row.Qn === currentInputs.Qn &&
      row.status === "Verified"
  );

  const allVerified = tableRows.every((r) => r.status === "Verified");

  const handleClockPulse = () => {
    setClockApplied(true);
  };

  const handleVerify = () => {
    if (!clockApplied) return;

    const snap = { ...currentInputs };
    const result = analyzeJK(snap);

    setVerifiedInputs(snap);
    setAnalysis(result);
    setVerified(true);
    setLastVerifiedInputs(snap);

    setTableRows((rows) =>
      rows.map((row) => {
        if (
          row.J === snap.J &&
          row.K === snap.K &&
          row.Qn === snap.Qn &&
          row.status === "Pending"
        ) {
          return {
            ...row,
            outputQ: result.outputQ,
            outputQBar: result.outputQBar,
            status: "Verified",
          };
        }
        return row;
      })
    );

    setClockApplied(false);
  };

  const handleReset = () => {
    setCurrentInputs({ ...defaultInputs });
    setVerifiedInputs({ ...defaultInputs });
    setAnalysis(null);
    setVerified(false);
    setClockApplied(false);
    setLastVerifiedInputs(null);
  };

  const handleSubmit = () => {
    if (!allVerified || submitted) return;
    setSubmitted(true);
    navigate("/dtm-result", {
  state: {
    experimentNo: 8,
    experimentName: "Verify truth table of JK Flipflop",
    experimentRoute: "/dtm-experiment-8",
     },
   });
  };

  const statusLabel = verified
    ? "Verified"
    : clockApplied
    ? "Clock Applied"
    : "Not Verified";

  const statusClass = verified
    ? "status-value-verified"
    : clockApplied
    ? "status-value-clocked"
    : "status-value-pending";

  return (
    <div className="DTMExperiment8-root">

      {/* Header */}
      <header className="exp-header">
       <button
  className="btn-back"
  onClick={() => navigate("/dtm-experiments", { replace: true })}
>
  ← Back
</button>

        <h1 className="exp-title">
          Experiment 8 : Verify Truth table of JK Flip Flop
        </h1>

        <button className="btn-help" onClick={() => setHelpOpen(true)}> ? Help </button>
      </header>
      {renderHelpPopup(helpOpen, () => setHelpOpen(false), "Experiment 8 Help", [
        "Set the J, K, and clock inputs for the JK flip-flop.",
        "Apply a clock pulse to observe when the output holds, resets, sets, or toggles.",
        "Test the input combinations and compare Q with the JK truth table.",
      ])}

      {/* Aim */}
      <section className="card aim-card">
        <h2 className="section-heading orange">Aim</h2>
        <p>To Verify Truth Table of JK Flip Flop.</p>
      </section>

      {/* Theory */}
      <section className="card collapsible-card">
        <div className="collapsible-header" onClick={() => setTheoryOpen((v) => !v)}>
          <h2 className="section-heading orange">Theory</h2>
          <span className="chevron">{theoryOpen ? "▲" : "▼"}</span>
        </div>

        {theoryOpen && (
          <div className="collapsible-body">
            <p>JK flip-flop is a sequential circuit that stores one bit of data.</p>
            <p>
              It has two inputs J and K, one clock input (CLK) and two outputs
              Q and Q̄.
            </p>
          </div>
        )}
      </section>

      {/* Procedure */}
      <section className="card collapsible-card">
        <div className="collapsible-header" onClick={() => setProcOpen((v) => !v)}>
          <h2 className="section-heading orange">Procedure</h2>
          <span className="chevron">{procOpen ? "▲" : "▼"}</span>
        </div>

        {procOpen && (
          <div className="collapsible-body proc-grid">
            <ol className="proc-col">
              <li>Set values of J, K and previous state (Qn).</li>
              <li>Click on Clock Pulse to apply positive edge.</li>
              <li>Click on Verify to observe the outputs.</li>
            </ol>

            <ol className="proc-col" start={4}>
              <li>Complete all truth table entries.</li>
              <li>Click on Submit Experiment.</li>
            </ol>
          </div>
        )}
      </section>

      {/* Simulation Row */}
      <div className="sim-row">

        {/* Inputs */}
        <aside className="card inputs-panel">
          <h3 className="panel-heading">Inputs</h3>

          <ToggleSwitch label="J" value={currentInputs.J} onChange={(v) => setInput("J", v)} />
          <ToggleSwitch label="K" value={currentInputs.K} onChange={(v) => setInput("K", v)} />
          <ToggleSwitch
            label="Previous State (Qn)"
            value={currentInputs.Qn}
            onChange={(v) => setInput("Qn", v)}
          />

          <div className="clock-divider" />

          <div className="toggle-row">
            <span className="toggle-label">Clock Pulse</span>

            <div
              className={`toggle-switch ${clockApplied ? "on" : "off"}`}
              onClick={handleClockPulse}
              role="switch"
              aria-checked={clockApplied}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClockPulse();
                }
              }}
            >
              <div className="toggle-thumb" />
            </div>

            <span className="toggle-val">{clockApplied ? 1 : 0}</span>
          </div>

          <p className="input-hint">Click Clock Pulse to trigger state change.</p>

          {alreadyDone && (
            <p className="input-hint">Combination already recorded in observation table.</p>
          )}
        </aside>

        {/* Canvas */}
        <div className="card canvas-panel">
          <h3 className="panel-heading">Simulation Canvas</h3>

          <SimulationCanvas
            currentInputs={currentInputs}
            verifiedInputs={verifiedInputs}
            analysis={analysis}
            verified={verified}
          />

          <div className="canvas-actions">
            <button className="btn-verify" onClick={handleVerify} disabled={!clockApplied}>
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
            <h4 className="analysis-sub">Status</h4>
            <p className={statusClass}>{statusLabel}</p>
          </div>

          <div className="analysis-block">
            <h4 className="analysis-sub">Current Inputs</h4>

            <table className="analysis-table">
              <tbody>
                <tr>
                  <td>J</td>
                  <td>=</td>
                  <td>{verified ? verifiedInputs.J : "—"}</td>
                </tr>
                <tr>
                  <td>K</td>
                  <td>=</td>
                  <td>{verified ? verifiedInputs.K : "—"}</td>
                </tr>
                <tr>
                  <td>Previous State (Qn)</td>
                  <td>=</td>
                  <td>{verified ? verifiedInputs.Qn : "—"}</td>
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
                      <td>Q (Observed)</td>
                      <td>:</td>
                      <td>{analysis.outputQ}</td>
                    </tr>
                    <tr>
                      <td>Q̄ (Observed)</td>
                      <td>:</td>
                      <td>{analysis.outputQBar}</td>
                    </tr>
                    <tr>
                      <td>Operation</td>
                      <td>:</td>
                      <td>{analysis.operation}</td>
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

      {/* Observation Table */}
      <section className="card table-section">
        <h3 className="panel-heading orange">Observation Table (Truth Table)</h3>

        <div className="table-scroll">
          <table className="obs-table">
            <thead>
              <tr>
                <th rowSpan={2}>Sr. No.</th>
                <th rowSpan={2}>J</th>
                <th rowSpan={2}>K</th>
                <th rowSpan={2}>Previous State (Qn)</th>
                <th colSpan={2}>Outputs (Expected)</th>
                <th colSpan={2}>Outputs (Observed)</th>
                <th rowSpan={2}>Status</th>
              </tr>
              <tr>
                <th>Q</th>
                <th>Q̄</th>
                <th>Q</th>
                <th>Q̄</th>
              </tr>
            </thead>

            <tbody>
              {tableRows.map((row, idx) => {
                const expected = analyzeJK({ J: row.J, K: row.K, Qn: row.Qn });
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
                    <td>{row.J}</td>
                    <td>{row.K}</td>
                    <td>{row.Qn}</td>

                    <td>{expected.outputQ}</td>
                    <td>{expected.outputQBar}</td>

                    <td>{row.outputQ !== null ? row.outputQ : "—"}</td>
                    <td>{row.outputQBar !== null ? row.outputQBar : "—"}</td>

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
          ℹ Verify each combination (8 total). After all are verified, Submit
          button will be enabled.
        </p>
      </section>

      {/* Submit */}
      <section className="submit-section">
        <button
          className={`btn-submit ${allVerified && !submitted ? "enabled" : "disabled"}`}
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
              <p>All 8 combinations verified.</p>
              <p>You can now submit the experiment.</p>
            </>
          ) : (
            <p>
              {tableRows.filter((r) => r.status === "Verified").length} / 8
              combinations verified.
            </p>
          )}
        </div>
      </section>

    </div>
  );
}