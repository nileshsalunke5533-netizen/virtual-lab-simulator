import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./DTMExperiment9.css";

// ─────────────────────────────────────────────
// Master Slave JK Flip-Flop Logic
// ─────────────────────────────────────────────

function analyzeMasterSlaveJK({ CLK, J, K }) {

  let Qnext = "-";
  let QbarNext = "-";
  let remark = "";

  if (CLK === 0) {

    Qnext = "Qn";
    QbarNext = "Q̅n";
    remark = "No Change";

  }

  else {

    if (J === 0 && K === 0) {

      Qnext = "Qn";
      QbarNext = "Q̅n";
      remark = "No Change";

    }

    else if (J === 0 && K === 1) {

      Qnext = 0;
      QbarNext = 1;
      remark = "Reset";

    }

    else if (J === 1 && K === 0) {

      Qnext = 1;
      QbarNext = 0;
      remark = "Set";

    }

    else if (J === 1 && K === 1) {

      Qnext = "Q̅n";
      QbarNext = "Qn";
      remark = "Toggle";

    }

  }

  return {

    Qnext,
    QbarNext,
    remark,

    conclusion:
      remark === "No Change"
        ? "Output remains unchanged."
        : remark === "Reset"
        ? "Flip-Flop is reset."
        : remark === "Set"
        ? "Flip-Flop is set."
        : "Flip-Flop toggles its state.",

  };

}

// ─────────────────────────────────────────────
// Observation Table
// ─────────────────────────────────────────────

const INITIAL_ROWS = [

  {
    id: 1,
    CLK: "X",
    J: 0,
    K: 0,
    expectedQ: "Qn",
    expectedQbar: "Q̅n",
    remark: "No Change",
    observedQ: null,
    observedQbar: null,
    status: "Pending",
  },

  {
    id: 2,
    CLK: "↑",
    J: 0,
    K: 0,
    expectedQ: "Qn",
    expectedQbar: "Q̅n",
    remark: "No Change",
    observedQ: null,
    observedQbar: null,
    status: "Pending",
  },

  {
    id: 3,
    CLK: "↑",
    J: 0,
    K: 1,
    expectedQ: 0,
    expectedQbar: 1,
    remark: "Reset",
    observedQ: null,
    observedQbar: null,
    status: "Pending",
  },

  {
    id: 4,
    CLK: "↑",
    J: 1,
    K: 0,
    expectedQ: 1,
    expectedQbar: 0,
    remark: "Set",
    observedQ: null,
    observedQbar: null,
    status: "Pending",
  },

  {
    id: 5,
    CLK: "↑",
    J: 1,
    K: 1,
    expectedQ: "Q̅n",
    expectedQbar: "Qn",
    remark: "Toggle",
    observedQ: null,
    observedQbar: null,
    status: "Pending",
  },

];

// ─────────────────────────────────────────────
// Toggle Switch
// ─────────────────────────────────────────────

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
      >

        <div className="toggle-thumb" />

      </div>

      <span className="toggle-val">
        {value}
      </span>

    </div>

  );

}

function SimulationCanvas({ verifiedInputs, analysis, verified }) {
  // LED glows only when that output is numerically HIGH (1).
  // "No Change" / "Toggle" cases give symbolic Qn/Q̅n — unknown previous state, so LED stays off.
  const qHigh = verified && Number(analysis?.Qnext) === 1;
  const qbarHigh = verified && Number(analysis?.QbarNext) === 1;

  return (
    <div className="canvas-area">
      <svg viewBox="0 0 1200 470" className="jk-svg" preserveAspectRatio="xMidYMid meet">

        {/* ===== BOXES ===== */}
        <rect x="120" y="40" width="360" height="320" rx="10" className="master-box" />
        <text x="250" y="65" className="section-title">MASTER</text>

        <rect x="680" y="40" width="360" height="320" rx="10" className="slave-box" />
        <text x="820" y="65" className="section-title">SLAVE</text>

        {/* ===== J / K / CLK INPUTS ===== */}
        <text x="35" y="95" className="j-label">J</text>
        <line x1="60" y1="90" x2="170" y2="90" className="wire wire-pink" />

        <text x="35" y="315" className="k-label">K</text>
        <line x1="60" y1="310" x2="170" y2="310" className="wire wire-pink" />

        <text x="5" y="210" className="clk-label">CLK</text>
        <line x1="60" y1="205" x2="130" y2="205" className="wire wire-blue" />
        <circle cx="130" cy="205" r="6" className="wire-node" fill="#3a5fbf" />

        {/* CLK fanout inside master + down to inverter */}
        <path d="M130,205 L130,120 L170,120" className="wire wire-blue" />
        <path d="M130,205 L130,280 L170,280" className="wire wire-blue" />
        <path d="M130,205 L130,430 L520,430" className="wire wire-blue" />

        {/* ===== MASTER NAND 1 (J, CLK) ===== */}
        <path d="M170,75 L210,75 A30,30 0 0 1 210,135 L170,135 Z" className="nand-gate" />
        <circle cx="246" cy="105" r="6" className="gate-bubble" />

        {/* ===== MASTER NAND 2 (CLK, K) ===== */}
        <path d="M170,265 L210,265 A30,30 0 0 1 210,325 L170,325 Z" className="nand-gate" />
        <circle cx="246" cy="295" r="6" className="gate-bubble" />

        {/* ===== MASTER LATCH TOP -> M ===== */}
        <path d="M320,140 L360,140 A30,30 0 0 1 360,200 L320,200 Z" className="nand-gate" />
        <circle cx="396" cy="170" r="6" className="gate-bubble" />

        {/* ===== MASTER LATCH BOTTOM -> M' ===== */}
        <path d="M320,220 L360,220 A30,30 0 0 1 360,280 L320,280 Z" className="nand-gate" />
        <circle cx="396" cy="250" r="6" className="gate-bubble" />

        {/* Gate1 -> Latch Top (top input) */}
        <line x1="252" y1="105" x2="320" y2="155" className="wire wire-pink" />
        {/* Gate2 -> Latch Bottom (bottom input) */}
        <line x1="252" y1="295" x2="320" y2="265" className="wire wire-pink" />

        {/* Cross coupling (X) */}
        <line x1="402" y1="170" x2="320" y2="235" className="wire" />
        <line x1="402" y1="250" x2="320" y2="185" className="wire" />

        {/* ===== M OUTPUT -> Slave Gate1 top input ===== */}
        <circle cx="408" cy="170" r="5" fill="#ec4899" />
        <line x1="408" y1="170" x2="460" y2="170" className="wire wire-pink" />
        <text x="470" y="158" className="m-label">M</text>
        <path d="M408,170 L600,170 L600,90 L780,90" className="wire wire-blue" />

        {/* ===== M' OUTPUT -> Slave Gate2 bottom input ===== */}
        <circle cx="408" cy="250" r="5" fill="#ec4899" />
        <line x1="408" y1="250" x2="460" y2="250" className="wire wire-pink" />
        <text x="465" y="272" className="m-label">M'</text>
        <path d="M408,250 L600,250 L600,310 L780,310" className="wire wire-blue" />

        {/* ===== INVERTER (CLK-bar) ===== */}
        <polygon points="520,410 520,450 560,430" className="inverter-gate" />
        <circle cx="567" cy="430" r="7" className="gate-bubble" />
        <path d="M574,430 L740,430 L740,205" className="wire wire-blue" />
        {/* CLK-bar -> Slave Gate1 bottom input */}
        <path d="M740,205 L740,120 L780,120" className="wire wire-blue" />
        {/* CLK-bar -> Slave Gate2 top input */}
        <path d="M740,205 L740,280 L780,280" className="wire wire-blue" />

        {/* ===== SLAVE NAND TOP (M, CLK') ===== */}
        <path d="M780,75 L820,75 A30,30 0 0 1 820,135 L780,135 Z" className="nand-gate" />
        <circle cx="856" cy="105" r="6" className="gate-bubble" />

        {/* ===== SLAVE NAND BOTTOM (CLK', M') ===== */}
        <path d="M780,265 L820,265 A30,30 0 0 1 820,325 L780,325 Z" className="nand-gate" />
        <circle cx="856" cy="295" r="6" className="gate-bubble" />

        <line x1="862" y1="105" x2="920" y2="155" className="wire wire-green" />
        <line x1="862" y1="295" x2="920" y2="265" className="wire wire-green" />

        {/* ===== SLAVE LATCH TOP -> Q ===== */}
        <path d="M920,140 L960,140 A30,30 0 0 1 960,200 L920,200 Z" className="nand-gate" />
        <circle cx="996" cy="170" r="6" className="gate-bubble" />

        {/* ===== SLAVE LATCH BOTTOM -> Q' ===== */}
        <path d="M920,220 L960,220 A30,30 0 0 1 960,280 L920,280 Z" className="nand-gate" />
        <circle cx="996" cy="250" r="6" className="gate-bubble" />

        {/* Cross coupling (X) */}
        <line x1="1002" y1="170" x2="920" y2="235" className="wire" />
        <line x1="1002" y1="250" x2="920" y2="185" className="wire" />

        {/* ===== OUTPUT Q + LED ===== */}
        <line x1="1002" y1="170" x2="1080" y2="170" className="wire wire-amber" />
        <circle cx="1080" cy="170" r="6" fill="#b45309" />
        <text x="1095" y="176" className="output-label">Q</text>
        <circle cx="1130" cy="170" r="9" className={`led-circle ${qHigh ? "led-on" : "led-off"}`} />

        {/* ===== OUTPUT Q' + LED ===== */}
        <line x1="1002" y1="250" x2="1080" y2="250" className="wire wire-amber" />
        <circle cx="1080" cy="250" r="6" fill="#92400e" />
        <text x="1095" y="256" className="output-label">Q'</text>
        <circle cx="1130" cy="250" r="9" className={`led-circle ${qbarHigh ? "led-on" : "led-off"}`} />

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

export default function DTMExperiment9() {

const navigate = useNavigate();
const [helpOpen, setHelpOpen] = useState(false);


  const defaultInputs = {

    CLK: 0,
    J: 0,
    K: 0,

  };

  // ─────────────────────────────────────
  // Input States
  // ─────────────────────────────────────

  const [currentInputs, setCurrentInputs] =
    useState(defaultInputs);

  const [verifiedInputs, setVerifiedInputs] =
    useState(defaultInputs);

  const [analysis, setAnalysis] =
    useState(null);

  const [verified, setVerified] =
    useState(false);

  // ─────────────────────────────────────
  // Observation Table
  // ─────────────────────────────────────

  const [tableRows, setTableRows] =
    useState(INITIAL_ROWS);

  // ─────────────────────────────────────
  // Submit Status
  // ─────────────────────────────────────

  const [submitted, setSubmitted] =
    useState(false);

  // ─────────────────────────────────────
  // Accordion States
  // ─────────────────────────────────────

  const [theoryOpen, setTheoryOpen] =
    useState(false);

  const [procOpen, setProcOpen] =
    useState(false);

  // ─────────────────────────────────────
  // Input Handler
  // ─────────────────────────────────────

  const setInput = (key, value) => {

    setCurrentInputs((prev) => ({

      ...prev,

      [key]: value,

    }));

  };

  // ─────────────────────────────────────
  // Verify Function
  // ─────────────────────────────────────

  const handleVerify = () => {

    const result =
      analyzeMasterSlaveJK(currentInputs);

    setVerifiedInputs({
      ...currentInputs,
    });

    setAnalysis(result);

    setVerified(true);

    setTableRows((rows) =>
      rows.map((row) => {

        const clkMatch =

          (row.CLK === "X" &&
            currentInputs.J === row.J &&
            currentInputs.K === row.K)

          ||

          (row.CLK === "↑" &&
            currentInputs.CLK === 1 &&
            currentInputs.J === row.J &&
            currentInputs.K === row.K);

        if (
          clkMatch &&
          row.status === "Pending"
        ) {

          return {

            ...row,

            observedQ:
              result.Qnext,

            observedQbar:
              result.QbarNext,

            status:
              "Verified",

          };

        }

        return row;

      })
    );

  };

  // ─────────────────────────────────────
  // Reset Function
  // ─────────────────────────────────────

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

  // ─────────────────────────────────────
  // All Verified ?
  // ─────────────────────────────────────

  const allVerified =
    tableRows.every(
      (row) =>
        row.status === "Verified"
    );

  // ─────────────────────────────────────
  // Submit Function
  // ─────────────────────────────────────

 const handleSubmit = () => {

  // Existing Conditions (Same)
  if (
    !allVerified ||
    submitted
  )
    return;

  // Existing Code (Same)
  setSubmitted(true);

  // ───────────────────────────────
  // Open Common Result Page
  // ───────────────────────────────
  navigate("/dtm-result", {
    state: {

      experimentNo: 9,

      experimentName:
        "Master Slave JK Flip-Flop",

      experimentRoute:
        "/dtm-experiment-9",
      
    }
  });

};


  // ─────────────────────────────────────
  // Already Verified ?
  // ─────────────────────────────────────

  const alreadyDone =
    tableRows.some((row) => {

      const clkMatch =

        (row.CLK === "X" &&
          currentInputs.J === row.J &&
          currentInputs.K === row.K)

        ||

        (row.CLK === "↑" &&
          currentInputs.CLK === 1 &&
          currentInputs.J === row.J &&
          currentInputs.K === row.K);

      return (
        clkMatch &&
        row.status === "Verified"
      );

    });

  // ─────────────────────────────────────
  // JSX Start
  // ─────────────────────────────────────

  return (

    <div className="DTMExperiment9-root">

      {/* ==========================
            HEADER
      ========================== */}

      <header className="exp-header">

       <button
  className="btn-back"
  onClick={() => navigate("/dtm-experiments", { replace: true })}
>
  ← Back
</button>

        <h1 className="exp-title">

          Experiment 9 :
          Verify Truth Table of
          Master Slave JK Flip-Flop

        </h1>

        <button
          className="btn-help"
          onClick={() => setHelpOpen(true)}
        >
          ? Help
        </button>

      </header>
      {renderHelpPopup(helpOpen, () => setHelpOpen(false), "Experiment 9 Help", [
        "Set the master-slave JK inputs J, K, and clock as required by the simulator.",
        "Observe the master stage capture the inputs and the slave stage update on the clock transition.",
        "Check the final Q and Q-bar outputs against the Master-Slave JK truth table.",
      ])}
      {/* ==========================
              AIM
      ========================== */}

      <section className="card aim-card">

        <h2 className="section-heading orange">
          Aim
        </h2>

        <p>
          To verify the truth table of
          Master Slave JK Flip-Flop.
        </p>

      </section>

      {/* ==========================
             THEORY
      ========================== */}

      <section className="card collapsible-card">

        <div
          className="collapsible-header"
          onClick={() =>
            setTheoryOpen((v) => !v)
          }
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

              Master Slave JK Flip-Flop is a
              sequential circuit constructed
              using two JK latches connected
              in cascade.

            </p>

            <p>

              The first latch is called the
              Master and the second latch is
              called the Slave.

            </p>

            <p>

              The Master is enabled during
              one phase of clock while the
              Slave is enabled during the
              opposite phase.

            </p>

            <p>

              This arrangement eliminates
              the race around condition
              present in basic JK Flip-Flops.

            </p>

          </div>

        )}

      </section>

      {/* ==========================
            PROCEDURE
      ========================== */}

      <section className="card collapsible-card">

        <div
          className="collapsible-header"
          onClick={() =>
            setProcOpen((v) => !v)
          }
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

              <li>
                Set J input.
              </li>

              <li>
                Set K input.
              </li>

              <li>
                Apply clock pulse.
              </li>

            </ol>

            <ol
              className="proc-col"
              start={4}
            >

              <li>
                Click Verify.
              </li>

              <li>
                Observe outputs.
              </li>

              <li>
                Complete truth table.
              </li>

            </ol>

          </div>

        )}

      </section>

      {/* ==========================
          SIMULATION SECTION
      ========================== */}

      <div className="sim-row">

        {/* ==========================
              INPUT PANEL
        ========================== */}

        <aside className="card inputs-panel">

          <h3 className="panel-heading">

            Inputs

          </h3>

          <ToggleSwitch
            label="CLK"
            value={currentInputs.CLK}
            onChange={(v) =>
              setInput("CLK", v)
            }
          />

          <ToggleSwitch
            label="J"
            value={currentInputs.J}
            onChange={(v) =>
              setInput("J", v)
            }
          />

          <ToggleSwitch
            label="K"
            value={currentInputs.K}
            onChange={(v) =>
              setInput("K", v)
            }
          />

          {alreadyDone && (

            <p className="input-hint">

              Combination already
              recorded in observation
              table.

            </p>

          )}

        </aside>
        {/* ==========================
            SIMULATION CANVAS
        ========================== */}

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

        {/* ==========================
            ANALYSIS PANEL
        ========================== */}

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

                <tr>
                  <td>CLK</td>
                  <td>=</td>
                  <td>
                    {
                      verified
                        ? verifiedInputs.CLK
                        : "—"
                    }
                  </td>
                </tr>

                <tr>
                  <td>J</td>
                  <td>=</td>
                  <td>
                    {
                      verified
                        ? verifiedInputs.J
                        : "—"
                    }
                  </td>
                </tr>

                <tr>
                  <td>K</td>
                  <td>=</td>
                  <td>
                    {
                      verified
                        ? verifiedInputs.K
                        : "—"
                    }
                  </td>
                </tr>

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

                      <td>
                        Qn+1
                      </td>

                      <td>:</td>

                      <td>
                        {
                          analysis.Qnext
                        }
                      </td>

                    </tr>

                    <tr>

                      <td>
                        Q̅n+1
                      </td>

                      <td>:</td>

                      <td>
                        {
                          analysis.QbarNext
                        }
                      </td>

                    </tr>

                    <tr>

                      <td>
                        Operation
                      </td>

                      <td>:</td>

                      <td>
                        {
                          analysis.remark
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
      {/* ==========================
          OBSERVATION TABLE
      ========================== */}

      <section className="card table-section">

        <h3 className="panel-heading orange">
          Observation Table
        </h3>

        <div className="table-scroll">

          <table className="obs-table">

            <thead>

              <tr>

                <th>Sr No.</th>

                <th>CLK</th>

                <th>J</th>

                <th>K</th>

                <th>Qn+1 (Expected)</th>

                <th>Q̅n+1 (Expected)</th>

                <th>Qn+1 (Observed)</th>

                <th>Q̅n+1 (Observed)</th>

                <th>Remark</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {tableRows.map((row) => (

                <tr
                  key={row.id}
                  className={
                    row.status === "Verified"
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
                    {row.J}
                  </td>

                  <td>
                    {row.K}
                  </td>

                  <td>
                    {row.expectedQ}
                  </td>

                  <td>
                    {row.expectedQbar}
                  </td>

                  <td>
                    {
                      row.observedQ !== null
                        ? row.observedQ
                        : "—"
                    }
                  </td>

                  <td>
                    {
                      row.observedQbar !== null
                        ? row.observedQbar
                        : "—"
                    }
                  </td>

                  <td>
                    {row.remark}
                  </td>

                  <td>

                    {row.status ===
                    "Verified" ? (

                      <span
                        className="
                        status-verified
                        "
                      >
                        ✔ Verified
                      </span>

                    ) : (

                      <span
                        className="
                        status-pending
                        "
                      >
                        Pending
                      </span>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <p className="table-hint">

          ℹ Complete all 5 truth
          table combinations to
          enable submission.

        </p>

      </section>
      {/* ==========================
            SUBMIT SECTION
      ========================== */}

      <section className="submit-section">

        <button
          className={`btn-submit ${
            allVerified && !submitted
              ? "enabled"
              : "disabled"
          }`}
          onClick={handleSubmit}
          disabled={
            !allVerified ||
            submitted
          }
        >

          🔒 {

            submitted
              ? "Submitted"
              : "Submit Experiment"

          }

        </button>

        <div className="submit-status">

          {submitted ? (

            <p className="submit-success">

              Experiment Submitted
              Successfully

            </p>

          ) : allVerified ? (

            <>

              <p>
                All 5 combinations
                verified.
              </p>

              <p>
                You can now submit
                the experiment.
              </p>

            </>

          ) : (

            <p>

              {

                tableRows.filter(
                  (row) =>
                    row.status ===
                    "Verified"
                ).length

              }

              {" / 5 combinations verified."}

            </p>

          )}

        </div>

      </section>

    </div>

  );

}