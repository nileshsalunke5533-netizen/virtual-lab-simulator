import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DTMExperiment3.css";

// ─────────────────────────────────────────────────────────────
// De Morgan's First Theorem Logic
// Statement: (A + B)' = A'.B'   →  NOR = Bubbled AND
// ─────────────────────────────────────────────────────────────
function analyzeDeMorgan1({ A, B }) {
  const orOut = A === 1 || B === 1 ? 1 : 0;
  const norOut = orOut === 1 ? 0 : 1; // LHS : (A+B)'

  const notA = A === 1 ? 0 : 1;
  const notB = B === 1 ? 0 : 1;
  const andOut = notA === 1 && notB === 1 ? 1 : 0; // RHS : A'.B'

  const equal = norOut === andOut;

  const conclusion = equal
    ? `A=${A}, B=${B}. LHS (A+B)' = ${norOut} and RHS A'.B' = ${andOut}. Both outputs are EQUAL, hence De Morgan's First Theorem is verified for this combination.`
    : `A=${A}, B=${B}. LHS (A+B)' = ${norOut} and RHS A'.B' = ${andOut}. Outputs do NOT match — please recheck connections.`;

  return {
    orOut,
    norOut,
    notA,
    notB,
    andOut,
    equal,
    conclusion,
  };
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
  norOut: null,
  andOut: null,
}));

// ─────────────────────────────────────────────────────────────
// Toggle Switch
// ─────────────────────────────────────────────────────────────
function ToggleSwitch({ label, value, onChange }) {
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
  const { A, B } = verifiedInputs;

  const norOut = analysis?.norOut ?? "";
  const andOut = analysis?.andOut ?? "";
  const notA = analysis?.notA ?? "";
  const notB = analysis?.notB ?? "";

  const orActive = verified && analysis?.orOut === 1;
  const norActive = verified && norOut === 1;
  const notAActive = verified && notA === 1;
  const notBActive = verified && notB === 1;
  const andActive = verified && andOut === 1;

  const wireClass = (active = false) =>
    active ? "wire active-wire" : "wire";

  return (
    <div className="canvas-area">

      <svg
        viewBox="0 0 760 460"
        className="rs-svg"
      >
        {/* =========================
            SECTION LABELS
        ========================== */}

        <text x="150" y="30" className="section-label">
          LHS : NOR Gate → (A + B)'
        </text>

        <text x="150" y="255" className="section-label">
          RHS : Bubbled AND → A'.B'
        </text>

        {/* =========================
            LHS : OR + NOT (NOR)
        ========================== */}

        <text x="55" y="65" className="svg-label">A</text>
        <text x="55" y="115" className="svg-label">B</text>

        <text x="70" y="70" className="svg-val">{A}</text>
        <text x="70" y="120" className="svg-val">{B}</text>

        <circle cx="90" cy="60" r="5" className="wire-node" />
        <circle cx="90" cy="110" r="5" className="wire-node" />

        <line x1="90" y1="60" x2="140" y2="60" className={wireClass(orActive)} />
        <line x1="90" y1="110" x2="140" y2="110" className={wireClass(orActive)} />

        {/* OR gate */}
        <path
          d="
            M140 40
            L170 40
            Q220 40 220 85
            Q220 130 170 130
            L140 130
            Q160 85 140 40
            Z
          "
          className="or-gate"
        />

        <text x="170" y="90" textAnchor="middle" className="gate-tag">OR</text>

        <line x1="222" y1="85" x2="270" y2="85" className={wireClass(orActive)} />

        {/* NOT gate (bubble) */}
        <path
          d="
            M270 65
            L320 85
            L270 105
            Z
          "
          className="not-gate"
        />
        <circle cx="326" cy="85" r="6" className="gate-bubble" />

        <text x="295" y="55" textAnchor="middle" className="gate-tag small">NOT</text>

        <line x1="332" y1="85" x2="400" y2="85" className={wireClass(norActive)} />

        <text x="410" y="70" className="svg-label">Y1</text>
        <text x="410" y="100" className="svg-val">{norOut}</text>

        {/* LHS LED */}
        <circle
          cx="460"
          cy="85"
          r="22"
          className={`led-circle ${verified && norOut === 1 ? "led-on" : "led-off"}`}
        />
        <text x="460" y="130" textAnchor="middle" className="svg-label">
          (A+B)' LED
        </text>

        {/* =========================
            RHS : NOT + NOT + AND
        ========================== */}

        <text x="55" y="290" className="svg-label">A</text>
        <text x="55" y="380" className="svg-label">B</text>

        <text x="70" y="295" className="svg-val">{A}</text>
        <text x="70" y="385" className="svg-val">{B}</text>

        <circle cx="90" cy="285" r="5" className="wire-node" />
        <circle cx="90" cy="375" r="5" className="wire-node" />

        <line x1="90" y1="285" x2="130" y2="285" className={wireClass(notAActive)} />
        <line x1="90" y1="375" x2="130" y2="375" className={wireClass(notBActive)} />

        {/* NOT A */}
        <path
          d="
            M130 268
            L175 285
            L130 302
            Z
          "
          className="not-gate"
        />
        <circle cx="181" cy="285" r="6" className="gate-bubble" />

        <text x="100" y="255" textAnchor="middle" className="gate-tag small">NOT</text>

        <line x1="187" y1="285" x2="230" y2="285" className={wireClass(notAActive)} />
        <text x="200" y="270" className="svg-label small">A'</text>
        <text x="200" y="300" className="svg-val small">{notA}</text>

        {/* NOT B */}
        <path
          d="
            M130 358
            L175 375
            L130 392
            Z
          "
          className="not-gate"
        />
        <circle cx="181" cy="375" r="6" className="gate-bubble" />

        <text x="100" y="418" textAnchor="middle" className="gate-tag small">NOT</text>

        <line x1="187" y1="375" x2="230" y2="375" className={wireClass(notBActive)} />
        <text x="200" y="360" className="svg-label small">B'</text>
        <text x="200" y="390" className="svg-val small">{notB}</text>

        {/* AND gate */}
        <line x1="230" y1="285" x2="270" y2="300" className={wireClass(notAActive)} />
        <line x1="230" y1="375" x2="270" y2="360" className={wireClass(notBActive)} />

        <path
          d="
            M270 295
            L300 295
            Q340 295 340 330
            Q340 365 300 365
            L270 365
            Z
          "
          className="and-gate"
        />

        <text x="305" y="335" textAnchor="middle" className="gate-tag">AND</text>

        <line x1="342" y1="330" x2="400" y2="330" className={wireClass(andActive)} />

        <text x="410" y="315" className="svg-label">Y2</text>
        <text x="410" y="345" className="svg-val">{andOut}</text>

        {/* RHS LED */}
        <circle
          cx="460"
          cy="330"
          r="22"
          className={`led-circle ${verified && andOut === 1 ? "led-on" : "led-off"}`}
        />
        <text x="460" y="375" textAnchor="middle" className="svg-label">
          A'.B' LED
        </text>

        {/* =========================
            COMPARATOR
        ========================== */}

        <line x1="482" y1="85" x2="560" y2="85" className={wireClass(norActive)} />
        <line x1="482" y1="330" x2="560" y2="330" className={wireClass(andActive)} />
        <line x1="560" y1="85" x2="560" y2="330" className="wire" />
        <line x1="560" y1="207" x2="610" y2="207" className="wire" />

        <rect
          x="610"
          y="175"
          width="120"
          height="64"
          rx="10"
          className={
            verified
              ? analysis?.equal
                ? "compare-box equal"
                : "compare-box not-equal"
              : "compare-box"
          }
        />

        <text
          x="670"
          y="200"
          textAnchor="middle"
          className="compare-title"
        >
          Y1 = Y2 ?
        </text>

        <text
          x="670"
          y="225"
          textAnchor="middle"
          className="compare-result"
        >
          {verified
            ? analysis?.equal
              ? "✔ EQUAL"
              : "✘ NOT EQUAL"
            : "—"}
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

export default function DTMExperiment3() {
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
    setCurrentInputs((prev) => ({
      ...prev,
      [key]: value,
    }));

  const alreadyDone = tableRows.some(
    (row) =>
      row.A === currentInputs.A &&
      row.B === currentInputs.B &&
      row.status === "Verified"
  );

  const allVerified = tableRows.every(
    (row) => row.status === "Verified"
  );

  // ─────────────────────────────
  // Verify
  // ─────────────────────────────

  const handleVerify = () => {

    const snap = { ...currentInputs };

    const result = analyzeDeMorgan1(snap);

    setVerifiedInputs(snap);
    setAnalysis(result);
    setVerified(true);

    setTableRows((rows) =>
      rows.map((row) => {
        if (
          row.A === snap.A &&
          row.B === snap.B &&
          row.status === "Pending"
        ) {
          return {
            ...row,
            norOut: result.norOut,
            andOut: result.andOut,
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
    setCurrentInputs({ ...defaultInputs });
    setVerifiedInputs({ ...defaultInputs });
    setAnalysis(null);
    setVerified(false);
  };

  // ─────────────────────────────
  // Submit
  // ─────────────────────────────

  const handleSubmit = () => {
    if (!allVerified || submitted) return;
    setSubmitted(true);
    navigate("/dtm-result", {
    state: {

      experimentNo: 3,

      experimentName:
        "Verify Demorgan's 1st theorem",

      experimentRoute:
        "/dtm-experiment-3",
      
    }
  });
  };

  return (

    <div className="DTMExperiment3-root">

      {/* Header */}

      <header className="exp-header">

       <button
  className="btn-back"
  onClick={() => navigate("/dtm-experiments", { replace: true })}
>
  ← Back
</button>

        <h1 className="exp-title">
          Experiment 3 : Verify De Morgan's First Theorem
        </h1>

        <button className="btn-help" onClick={() => setHelpOpen(true)}> ? Help </button>

      </header>
      {renderHelpPopup(helpOpen, () => setHelpOpen(false), "Experiment 3 Help", [
        "Build the NOR-gate circuit for (A + B)'.",
        "Build the bubbled-AND circuit for A'.B' using the available gate inputs.",
        "Test all input combinations and compare both outputs to verify the theorem.",
      ])}

      {/* Aim */}

      <section className="card aim-card">

        <h2 className="section-heading orange">
          Aim
        </h2>

        <p>
          To verify De Morgan's First Theorem, (A + B)' = A'.B',
          using NOR gate and Bubbled AND (NOT-NOT-AND) circuit.
        </p>

      </section>

      {/* Theory */}

      <section className="card collapsible-card">

        <div
          className="collapsible-header"
          onClick={() => setTheoryOpen(!theoryOpen)}
        >

          <h2 className="section-heading orange">
            Theory
          </h2>

          <span className="chevron">
            {theoryOpen ? "▲" : "▼"}
          </span>

        </div>

        {theoryOpen && (

          <div className="collapsible-body procedure">

            <p>
              De Morgan's theorems are powerful tools used in digital
              design to solve expressions of Boolean Algebra. They
              state that the complement of the sum of two variables
              is equal to the product of their individual complements,
              and the complement of the product of two variables is
              equal to the sum of their individual complements.
            </p>

            <p className="theory-statement">
              <strong>Statement :</strong> The complement of the sum
              of two variables is equal to the product of their
              individual complements.
            </p>

            <p className="theory-formula">
              (A + B)' &nbsp;=&nbsp; A' . B' &nbsp;&nbsp;→&nbsp;&nbsp; NOR = Bubbled AND
            </p>

            <p>
              The left-hand side of this theorem represents the NOR
              gate with inputs A and B. The right-hand side
              represents the AND gate with inverted inputs, known as
              a Bubbled AND. If the outputs of both circuits match
              for every input combination, the theorem stands
              verified.
            </p>

          </div>

        )}

      </section>

      {/* Procedure */}

      <section className="card collapsible-card">

        <div
          className="collapsible-header"
          onClick={() => setProcOpen(!procOpen)}
        >

          <h2 className="section-heading orange">
            Procedure
          </h2>

          <span className="chevron">
            {procOpen ? "▲" : "▼"}
          </span>

        </div>

        {procOpen && (

          <div className="collapsible-body proc-grid procedure">

            <ol className="proc-col">

              <li>
                Set inputs A and B.
              </li>

              <li>
                Observe LHS (NOR) and RHS (Bubbled AND) circuits.
              </li>

              <li>
                Click Verify.
              </li>
              <li>
                Confirm Y1 equals Y2 for the combination.
              </li>

              <li>
                Verify all combinations to complete the table.
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
              Combination already recorded
              in observation table.
            </p>

          )}

        </aside>

        {/* Simulation Canvas */}

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

                {["A", "B"].map((k) => (

                  <tr key={k}>
                    <td>{k}</td>
                    <td>=</td>
                    <td>
                      {verified ? verifiedInputs[k] : "—"}
                    </td>
                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* Output */}

          {verified && analysis && (

            <>
              <div className="analysis-block">

                <h4 className="analysis-sub">
                  Output
                </h4>

                <table className="analysis-table">

                  <tbody>

                    <tr>
                      <td>A' . B'</td>
                      <td>:</td>
                      <td>{analysis.andOut}</td>
                    </tr>

                    <tr>
                      <td>(A + B)'</td>
                      <td>:</td>
                      <td>{analysis.norOut}</td>
                    </tr>

                    <tr>
                      <td>Match</td>
                      <td>:</td>
                      <td>
                        {analysis.equal ? "YES" : "NO"}
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
                  {analysis.conclusion}
                </p>

                {analysis.equal && (
                  <p className="verified-badge">
                    ✔ VERIFIED
                  </p>
                )}

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
                <th>A</th>
                <th>B</th>
                <th>A + B</th>
                <th>(A + B)'</th>
                <th>A'</th>
                <th>B'</th>
                <th>A' . B'</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {tableRows.map((row) => {

                const orVal = row.A === 1 || row.B === 1 ? 1 : 0;
                const notA = row.A === 1 ? 0 : 1;
                const notB = row.B === 1 ? 0 : 1;

                return (
                  <tr
                    key={row.id}
                    className={
                      row.status === "Verified" ? "row-verified" : ""
                    }
                  >

                    <td>{row.id}</td>
                    <td>{row.A}</td>
                    <td>{row.B}</td>
                    <td>{orVal}</td>
                    <td>{row.norOut ?? "—"}</td>
                    <td>{notA}</td>
                    <td>{notB}</td>
                    <td>{row.andOut ?? "—"}</td>

                    <td>
                      {row.status === "Verified" ? (
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
              })}

            </tbody>

          </table>

        </div>

      </section>

      {/* =========================
          SUBMIT SECTION
      ========================== */}

      <section className="submit-section">

        <button
          className={`btn-submit ${
            allVerified && !submitted ? "enabled" : "disabled"
          }`}
          onClick={handleSubmit}
          disabled={!allVerified || submitted}
        >

          🔒{" "}
          {submitted ? "Submitted" : "Submit Experiment"}

        </button>

        <div className="submit-status">

          {submitted ? (
            <p className="submit-success">
              Experiment Submitted Successfully
            </p>
          ) : allVerified ? (
            <>
              <p>All combinations verified.</p>
              <p>You can now submit the experiment.</p>
            </>
          ) : (
            <p>
              {
                tableRows.filter((r) => r.status === "Verified").length
              }{" "}
              / 4 combinations verified.
            </p>
          )}

        </div>

      </section>

    </div>
  );
}