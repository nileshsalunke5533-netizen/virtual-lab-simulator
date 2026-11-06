import React, { useState, useEffect } from "react";
import "./DCNExperiment5.css";
import { useNavigate } from "react-router-dom";
// ==========================================================================
// ASSET IMPORTS
// These live under src/assets/dcn/real-view/rj45/ — files under `src` must
// be imported (not referenced by string path) so Vite bundles them.
// Adjust the relative path below if this component ever moves in the tree.
// ==========================================================================
import rj45ConnectorZoom from "../../../assets/dcn/rj45/rj45-connector-zoom.png";
import rj45ConnectorSmall from "../../../assets/dcn/rj45/rj45-connector-small.png";
import crimpingToolImg from "../../../assets/dcn/rj45/crimping-tool.png";
import lanTesterImg from "../../../assets/dcn/rj45/lan-tester.png";

const IMAGES = {
  connectorZoom: rj45ConnectorZoom, // straight-on front view, used large on the canvas
  connectorSmall: rj45ConnectorSmall, // angled reference shot, used as the small tray icon
  crimpingTool: crimpingToolImg,
  lanTester: lanTesterImg, // single combined Master+Remote unit photo
};

// Percentage coordinates (relative to the connector-image-frame container)
// where each of the 8 pin slots should sit. These were measured directly
// from rj45-connector-zoom.png (530×590px) by detecting the gold pin pixels,
// so they line up with THIS specific photo. If you swap the photo, re-measure.
// y is the TOP of each pin (where a wire would plug in); slots are anchored
// by their bottom edge to that point (see .pin-slot-overlay transform).
const PIN_POSITIONS = [
  { x: 21.4, y: 64.7 },
  { x: 29.8, y: 64.9 },
  { x: 38.0, y: 65.1 },
  { x: 46.3, y: 65.3 },
  { x: 54.8, y: 65.3 },
  { x: 63.1, y: 65.3 },
  { x: 71.5, y: 65.4 },
  { x: 79.7, y: 65.3 },
];

function InlineHelp({ title, items }) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="btn-help" onClick={() => setOpen(true)}> ? Help </button>
    {open && <div className="dcn-help-overlay" onClick={() => setOpen(false)}>
      <section className="dcn-help-dialog" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="dcn-help-header"><h2>{title}</h2><button className="dcn-help-close" type="button" aria-label="Close help" onClick={() => setOpen(false)}>×</button></div>
        <ul className="dcn-help-items">{items.map((item) => <li key={item}>{item}</li>)}</ul>
        <button className="dcn-help-done" type="button" onClick={() => setOpen(false)}>Got it</button>
      </section>
    </div>}
  </>;
}

export default function DCNExperiment5() {
    const navigate = useNavigate();
  // ==========================================
  // STATIC CONFIG
  // ==========================================
  const AVAILABLE_WIRES = [
    { id: "WO", name: "White - Orange", color: "#FF8C00", stripe: true },
    { id: "O", name: "Orange", color: "#FF8C00", stripe: false },
    { id: "WG", name: "White - Green", color: "#228B22", stripe: true },
    { id: "B", name: "Blue", color: "#0000FF", stripe: false },
    { id: "WB", name: "White - Blue", color: "#0000FF", stripe: true },
    { id: "G", name: "Green", color: "#228B22", stripe: false },
    { id: "WBR", name: "White - Brown", color: "#8B4513", stripe: true },
    { id: "BR", name: "Brown", color: "#8B4513", stripe: false },
  ];

  const STANDARD_SEQUENCES = {
    T568A: ["WG", "G", "WO", "B", "WB", "O", "WBR", "BR"],
    T568B: ["WO", "O", "WG", "B", "WB", "G", "WBR", "BR"],
  };

  // ==========================================
  // ACCORDIONS
  // ==========================================
  const [showTheory, setShowTheory] = useState(false);
  const [showProcedure, setShowProcedure] = useState(false);

  // ==========================================
  // CABLE CONFIG
  // ==========================================
  const [cableType, setCableType] = useState("straight");
  const currentLeftStandard = cableType === "straight" ? "T568B" : "T568A";
  const currentRightStandard = "T568B";

  // ==========================================
  // DRAG STATE (single source: either the connector, or a wire)
  // ==========================================
  const [draggedItem, setDraggedItem] = useState(null); // { kind: 'connector' } | { kind:'wire', ...wire }

  // ==========================================
  // WORKSPACE LIFECYCLE STATE
  // ==========================================
  const [connectorPlaced, setConnectorPlaced] = useState(false);
  const [placedWires, setPlacedWires] = useState(Array(8).fill(null));
  const [isCrimping, setIsCrimping] = useState(false); // animation in progress
  const [isCrimped, setIsCrimped] = useState(false);

  // ==========================================
  // LAN TESTER STATE
  // ==========================================
  const [testerPanelVisible, setTesterPanelVisible] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testExecuted, setTestExecuted] = useState(false);
  const [currentTestPin, setCurrentTestPin] = useState(null);
  const [masterActivePins, setMasterActivePins] = useState([]);
  const [remoteActivePins, setRemoteActivePins] = useState([]);
  const [pinVerificationResults, setPinVerificationResults] = useState([]);

  // ==========================================
  // IMAGE FALLBACK FLAGS
  // ==========================================
  const [imgError, setImgError] = useState({
    connectorZoom: false,
    connectorSmall: false,
    crimpingTool: false,
    lanTester: false,
  });
  const markImgError = (key) => setImgError((prev) => ({ ...prev, [key]: true }));

  // ==========================================
  // OBSERVATION TABLE
  // ==========================================
  const [tableRows, setTableRows] = useState([
    { id: 1, label: "Straight Through", leftStandard: "T568B", rightStandard: "T568B", testResult: null, status: "Pending" },
    { id: 2, label: "Cross Over", leftStandard: "T568A", rightStandard: "T568B", testResult: null, status: "Pending" },
  ]);
  const [submitted, setSubmitted] = useState(false);

  // Full reset whenever the cable type changes — each configuration must be
  // built and tested from scratch.
  useEffect(() => {
    handleReset();
     
  }, [cableType]);

  // ==========================================
  // DRAG HANDLERS
  // ==========================================
  const handleConnectorDragStart = () => {
    if (connectorPlaced) return;
    setDraggedItem({ kind: "connector" });
  };

  const handleWireDragStart = (wire) => {
    if (!connectorPlaced || isCrimped) return;
    setDraggedItem({ kind: "wire", ...wire });
  };

  const handleCanvasDrop = () => {
    if (draggedItem?.kind === "connector" && !connectorPlaced) {
      setConnectorPlaced(true);
    }
    setDraggedItem(null);
  };

  const handlePinDrop = (index) => {
    if (draggedItem?.kind !== "wire" || !connectorPlaced || isCrimped) {
      setDraggedItem(null);
      return;
    }
    const updated = [...placedWires];
    updated[index] = { id: draggedItem.id, name: draggedItem.name, color: draggedItem.color, stripe: draggedItem.stripe };
    setPlacedWires(updated);
    setDraggedItem(null);
  };

  const handleClearPin = (index) => {
    if (isCrimped) return;
    const updated = [...placedWires];
    updated[index] = null;
    setPlacedWires(updated);
  };

  const isReadyToCrimp = connectorPlaced && placedWires.every((p) => p !== null) && !isCrimped;

  // ==========================================
  // CRIMP (animated)
  // ==========================================
  const handleCrimpClick = () => {
    if (!isReadyToCrimp || isCrimping) return;
    setIsCrimping(true);
    setTimeout(() => {
      setIsCrimped(true);
      setIsCrimping(false);
    }, 900);
  };

  // ==========================================
  // LAN TESTER SIMULATION
  // ==========================================
  const handleStartLANTest = () => {
    if (!isCrimped || isTesting) return;

    setTesterPanelVisible(true);
    setIsTesting(true);
    setTestExecuted(false);
    setCurrentTestPin(null);
    setMasterActivePins([]);
    setRemoteActivePins([]);
    setPinVerificationResults([]);

    let step = 0;
    const expectedSequence = STANDARD_SEQUENCES[currentLeftStandard];
    const temporaryResults = [];

    const testInterval = setInterval(() => {
      if (step < 8) {
        const pinNumber = step + 1;
        setCurrentTestPin(pinNumber);
        setMasterActivePins((prev) => [...prev, pinNumber]);

        const userAssignedWire = placedWires[step];
        const correctWireId = expectedSequence[step];
        const isPinCorrect = userAssignedWire && userAssignedWire.id === correctWireId;

        temporaryResults.push({ pin: pinNumber, passed: isPinCorrect });
        setPinVerificationResults([...temporaryResults]);

        if (cableType === "straight") {
          if (isPinCorrect) setRemoteActivePins((prev) => [...prev, pinNumber]);
        } else {
          const crossoverMapping = { 1: 3, 2: 6, 3: 1, 4: 4, 5: 5, 6: 2, 7: 7, 8: 8 };
          if (isPinCorrect) setRemoteActivePins((prev) => [...prev, crossoverMapping[pinNumber]]);
        }

        step++;
      } else {
        clearInterval(testInterval);
        finalizeTestResults(temporaryResults);
      }
    }, 600);
  };

  const finalizeTestResults = (results) => {
    setIsTesting(false);
    setTestExecuted(true);
    setCurrentTestPin(null);

    const totalPassed = results.filter((r) => r.passed).length;
    const isOverallPass = totalPassed === 8;
    const finalOutcomeText = isOverallPass ? "PASS" : "FAIL";

    setTableRows((prevRows) =>
      prevRows.map((row) => {
        if (cableType === "straight" && row.id === 1) {
          return { ...row, testResult: finalOutcomeText, status: isOverallPass ? "Completed" : "Pending" };
        }
        if (cableType === "crossover" && row.id === 2) {
          return { ...row, testResult: finalOutcomeText, status: isOverallPass ? "Completed" : "Pending" };
        }
        return row;
      })
    );
  };

  const handleReset = () => {
    setConnectorPlaced(false);
    setPlacedWires(Array(8).fill(null));
    setIsCrimping(false);
    setIsCrimped(false);
    setTesterPanelVisible(false);
    setIsTesting(false);
    setTestExecuted(false);
    setCurrentTestPin(null);
    setMasterActivePins([]);
    setRemoteActivePins([]);
    setPinVerificationResults([]);
    setDraggedItem(null);
  };

  const verifiedCount = pinVerificationResults.filter((r) => r.passed).length;
  const overallTestPassed = testExecuted && verifiedCount === 8;
  const allRowsCompleted = tableRows.every((row) => row.status === "Completed");

 const handleSubmit = () => {
  if (!allRowsCompleted || submitted) return;

  setSubmitted(true);

  navigate("/dcn-result", {
    state: {
      experimentNo: 5,
      experimentName:
        "Create Standard Straight and Cross Over Cable using RJ45 Connector and Test using LAN Tester",
      experimentRoute: "/dcn-experiment-5",
    },
  });
};

  return (
    <div className="lab-container">
      {/* Header */}
      <header className="lab-header">
       <button
  type="button"
  className="btn-back"
  onClick={() => navigate("/dcn-experiments")}
>
  ← Back
</button>
        <h2 className="exp-title">
          Experiment 5 : Create Standard Straight and Cross Over Cable using RJ45 Connector and Test using LAN Tester
        </h2>
        <InlineHelp
          title="Experiment 5 Help"
          items={[
            "Choose the cable standard and place the eight wires in the matching RJ45 pin order.",
            "Assemble the connector and repeat for the second cable end when required.",
            "Use the virtual LAN Tester to check continuity and confirm the cable type.",
          ]}
        />
      </header>

      {/* Aim */}
      <section className="card aim-section">
        <h3 className="panel-heading orange">Aim</h3>
        <p className="panel-text">
          Create Straight-through and Cross-over Ethernet cables using RJ45 connectors and verify them using a virtual LAN Tester.
        </p>
      </section>

      {/* Theory */}
      <section className="card collapsible-section">
        <div className="collapsible-header" onClick={() => setShowTheory(!showTheory)}>
          <h3 className="panel-heading orange">Theory</h3>
          <span className="arrow">{showTheory ? "▲" : "▼"}</span>
        </div>
        {showTheory && (
          <div className="collapsible-content">
            <p>Ethernet cables use twisted pair wiring terminating into RJ45 structural modules. The order of wires dictates standard behavior:</p>
            <ul>
              <li><strong>T568A Standard:</strong> White-Green, Green, White-Orange, Blue, White-Blue, Orange, White-Brown, Brown.</li>
              <li><strong>T568B Standard:</strong> White-Orange, Orange, White-Green, Blue, White-Blue, Green, White-Brown, Brown.</li>
            </ul>
            <p>
              A <strong>Straight-Through</strong> cable uses the same assignment standard on both terminations (e.g., T568B to T568B). A{" "}
              <strong>Cross-Over</strong> cable switches transmission and reception pathways by terminating one side using T568A configurations and the
              opposing end via T568B arrangements.
            </p>
          </div>
        )}
      </section>

      {/* Procedure */}
      <section className="card collapsible-section">
        <div className="collapsible-header" onClick={() => setShowProcedure(!showProcedure)}>
          <h3 className="panel-heading orange">Procedure</h3>
          <span className="arrow">{showProcedure ? "▲" : "▼"}</span>
        </div>
        {showProcedure && (
          <div className="collapsible-content">
            <ol>
              <li>Select your target cable construction format inside the configuration dashboard.</li>
              <li>Drag the <strong>RJ45 Connector</strong> from the components tray into the workspace canvas.</li>
              <li>Drag the individual colored conductors onto the 8 pin slots that appear over the connector.</li>
              <li>Click <strong>Crimp Connector</strong> to lock the wires in place.</li>
              <li>Click <strong>Start LAN Test</strong> to run the Master/Remote diagnostic sequence pin-by-pin.</li>
            </ol>
          </div>
        )}
      </section>

      {/* Main simulation layout */}
      <div className="sim-row">
        {/* Left column */}
        <div className="sim-sidebar">
          <section className="card control-panel">
            <h3 className="panel-subheading">1. Select Cable Type</h3>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="cableTypeSelect"
                  checked={cableType === "straight"}
                  onChange={() => setCableType("straight")}
                  disabled={isTesting}
                />
                Straight Through (T568B - T568B)
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="cableTypeSelect"
                  checked={cableType === "crossover"}
                  onChange={() => setCableType("crossover")}
                  disabled={isTesting}
                />
                Cross Over (T568A - T568B)
              </label>
            </div>
            <div className="selected-badge">
              <span className="badge-title">SELECTED STANDARD</span>
              <span className="badge-value">
                {currentLeftStandard} - {currentRightStandard}
              </span>
            </div>
          </section>

          <section className="card inventory-panel">
            <h3 className="panel-subheading">2. Components</h3>
            <div className="component-tray">
              <div
                className={`component-tray-item ${connectorPlaced ? "used" : "draggable"}`}
                draggable={!connectorPlaced}
                onDragStart={handleConnectorDragStart}
              >
                {imgError.connectorSmall ? (
                  <div className="tray-img-fallback">RJ45<br />Connector</div>
                ) : (
                  <img src={IMAGES.connectorSmall} alt="RJ45 Connector" className="tray-img" onError={() => markImgError("connectorSmall")} />
                )}
                <span className="tray-item-label">RJ45 Connector</span>
              </div>

              <div className={`component-tray-item ${isReadyToCrimp || isCrimped ? "active" : "disabled"}`}>
                {imgError.crimpingTool ? (
                  <div className="tray-img-fallback">Crimping<br />Tool</div>
                ) : (
                  <img src={IMAGES.crimpingTool} alt="Crimping Tool" className="tray-img" onError={() => markImgError("crimpingTool")} />
                )}
                <span className="tray-item-label">Crimping Tool</span>
              </div>

              <div className={`component-tray-item ${isCrimped ? "active" : "disabled"}`}>
                {imgError.lanTester ? (
                  <div className="tray-img-fallback">LAN<br />Tester</div>
                ) : (
                  <img src={IMAGES.lanTester} alt="LAN Tester" className="tray-img" onError={() => markImgError("lanTester")} />
                )}
                <span className="tray-item-label">LAN Tester</span>
              </div>
            </div>
            <p className="tray-instruction">
              Drag the RJ45 Connector into the workspace to begin. The Crimping Tool and LAN Tester activate automatically as you progress.
            </p>
          </section>
        </div>

        {/* Center workspace */}
        <div className="sim-workspace-container">
          <section className="card workspace-panel">
            <h3 className="panel-subheading">Simulation Workspace</h3>

            <div className={`status-banner ${isCrimped ? "banner-locked" : "banner-ready"}`}>
              {isTesting
                ? "⚠️ Real-time hardware diagnostic run in progress..."
                : isCrimped
                ? "🔒 Connector crimped and locked. Ready for LAN testing."
                : connectorPlaced
                ? "💡 Connector placed. Drag wires onto the pin slots below."
                : "📥 Drag the RJ45 Connector from the components tray into the canvas below."}
            </div>

            <div className="reference-guide-box">
              <div className="guide-title">📚 Target Sequence Reference ({currentLeftStandard})</div>
              <div className="guide-sequence-row">
                {STANDARD_SEQUENCES[currentLeftStandard].map((wireId, idx) => {
                  const pattern = AVAILABLE_WIRES.find((w) => w.id === wireId);
                  return (
                    <div key={idx} className="guide-chip">
                      <span className="guide-index">{idx + 1}</span>
                      <span
                        className="guide-color"
                        style={{
                          backgroundColor: pattern?.color,
                          border: pattern?.stripe ? "2px dashed #FFF" : `1px solid ${pattern?.color}`,
                        }}
                      />
                      <span className="guide-name">{pattern?.name.split(" - ")[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Canvas stage: drop zone for the connector, then pin overlay once placed */}
            <div
              className="rj45-canvas-stage"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleCanvasDrop}
            >
              {!connectorPlaced ? (
                <div className="drop-instruction-banner">
                  <span className="drop-icon">⬇</span>
                  <p>Please drag the RJ45 Connector into the workspace</p>
                </div>
              ) : (
                <div className="connector-image-frame">
                  {imgError.connectorZoom ? (
                    <div className="connector-img-fallback">RJ45 Connector</div>
                  ) : (
                    <img src={IMAGES.connectorZoom} alt="RJ45 Connector" className="connector-image" onError={() => markImgError("connectorZoom")} />
                  )}

                  {/* Pin slots overlaid on top of the connector image, anchored
                      to the top of each pin (bottom-edge anchored via CSS transform) */}
                  {placedWires.map((wire, idx) => {
                    const pos = PIN_POSITIONS[idx];
                    const canClear = wire && !isCrimped;
                    return (
                      <div
                        key={idx}
                        className={`pin-slot-overlay ${currentTestPin === idx + 1 ? "pin-testing-highlight" : ""}`}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handlePinDrop(idx);
                        }}
                        onClick={() => canClear && handleClearPin(idx)}
                        title={wire ? `Pin ${idx + 1}: ${wire.name}${canClear ? " (click to remove)" : ""}` : `Pin ${idx + 1}: drop a wire here`}
                      >
                        <span className="pin-index-tag">{idx + 1}</span>
                        {wire ? (
                          <div className={`inserted-wire-mini ${canClear ? "removable" : ""}`} style={{ backgroundColor: wire.color }}>
                            {wire.stripe && <div className="wire-stripe-overlay"></div>}
                          </div>
                        ) : (
                          <div className="empty-slot-dot" />
                        )}
                      </div>
                    );
                  })}

                  {/* Crimping tool animated overlay */}
                  {isCrimping && (
                    <div className="crimp-tool-overlay crimp-tool-animate">
                      {imgError.crimpingTool ? (
                        <div className="tray-img-fallback">Crimping Tool</div>
                      ) : (
                        <img src={IMAGES.crimpingTool} alt="Crimping Tool" onError={() => markImgError("crimpingTool")} />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wire tray — only once connector is placed and not yet crimped */}
            {connectorPlaced && !isCrimped && (
              <div className="wire-tray-section">
                <h4 className="tray-heading">Available Conductor Wire Sets (Drag to Pins)</h4>
                <div className="wire-grid-mesh">
                  {AVAILABLE_WIRES.map((wire) => (
                    <div
                      key={wire.id}
                      className="draggable-wire-card"
                      draggable
                      onDragStart={() => handleWireDragStart(wire)}
                    >
                      <div className="wire-color-preview-bar" style={{ backgroundColor: wire.color }}>
                        {wire.stripe && <div className="wire-stripe-overlay"></div>}
                      </div>
                      <span className="wire-text-name">{wire.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="workspace-actions-row">
              <button
                className={`btn-action crimp-btn ${isReadyToCrimp ? "ready" : "disabled"}`}
                onClick={handleCrimpClick}
                disabled={!isReadyToCrimp || isCrimping}
              >
                {isCrimping ? "⚙️ Crimping..." : "⚙️ Crimp Connector"}
              </button>
              <button
                className={`btn-action test-btn ${isCrimped && !isTesting ? "ready" : "disabled"}`}
                onClick={handleStartLANTest}
                disabled={!isCrimped || isTesting}
              >
                ▶ Start LAN Test
              </button>
              <button className="btn-action reset-btn" onClick={handleReset}>
                🔄 Reset Workspace
              </button>
            </div>

            {/* LAN Tester panel — appears below the workspace once the test starts */}
            {testerPanelVisible && (
              <div className="lan-hardware-simulator-card">
                <h4 className="tester-hardware-title">📟 LAN Tester Module Diagnostics</h4>

                {imgError.lanTester ? (
                  <div className="tester-img-fallback tester-reference-fallback">LAN Tester (Master + Remote)</div>
                ) : (
                  <img
                    src={IMAGES.lanTester}
                    alt="LAN Tester — Master and Remote units"
                    className="tester-reference-image"
                    onError={() => markImgError("lanTester")}
                  />
                )}

                <div className="tester-split-grid">
                  <div className="tester-unit-box master-unit">
                    <div className="unit-header-label">MASTER UNIT</div>
                    <div className="led-matrix-row">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                        const isActive = masterActivePins.includes(num);
                        const isCurrent = currentTestPin === num;
                        return (
                          <div key={num} className={`led-node ${isActive ? "led-on" : ""} ${isCurrent ? "led-pulsing" : ""}`}>
                            <span className="led-lbl">{num}</span>
                            <div className="led-bulb"></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="tester-unit-box remote-unit">
                    <div className="unit-header-label">REMOTE UNIT</div>
                    <div className="led-matrix-row">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                        const isActive = remoteActivePins.includes(num);
                        return (
                          <div key={num} className={`led-node ${isActive ? "led-on-remote" : ""}`}>
                            <span className="led-lbl">{num}</span>
                            <div className="led-bulb"></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="diagnostic-console-log">
                  <h5>📋 Diagnostic Log Trace</h5>
                  <div className="console-scroll-box">
                    {pinVerificationResults.map((res, index) => (
                      <div key={index} className={`console-line ${res.passed ? "line-pass" : "line-fail"}`}>
                        ● Pin {res.pin}: {res.passed ? "CONTINUITY MATCHED" : "MISWIRING DETECTED"}
                      </div>
                    ))}
                    {isTesting && <div className="console-line pulsing-line">Scanning continuity...</div>}
                    {testExecuted && (
                      <div className={`final-verdict-summary ${overallTestPassed ? "pass-text" : "fail-text"}`}>
                        RESULT: {overallTestPassed ? "PASS" : "FAIL"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right column: verification / analysis */}
        <div className="sim-analyzer-sidebar">
          <section className="card analysis-panel">
            <h3 className="panel-heading orange">Verification / Analysis</h3>

            <div className="analysis-block">
              <h4 className="block-sub-title">CURRENT CONFIGURATION</h4>
              <div className="metric-row">
                <strong>Cable Type:</strong> <span>{cableType === "straight" ? "Straight Through" : "Cross Over"}</span>
              </div>
              <div className="metric-row">
                <strong>Left End Standard:</strong> <span>{currentLeftStandard}</span>
              </div>
              <div className="metric-row">
                <strong>Right End Standard:</strong> <span>{currentRightStandard}</span>
              </div>
            </div>

            <div className="analysis-block border-top-dash">
              <h4 className="block-sub-title">TEST RESULT</h4>
              <div className="metric-row">
                <strong>Status:</strong>
                <span className={`status-pill ${testExecuted ? (overallTestPassed ? "pass" : "fail") : "waiting"}`}>
                  {isTesting ? "Testing..." : testExecuted ? (overallTestPassed ? "PASS" : "FAIL") : "Waiting"}
                </span>
              </div>
              <div className="metric-row">
                <strong>Verified Pins:</strong> <span>{testExecuted ? `${verifiedCount} / 8` : "— / 8"}</span>
              </div>
              <div className="metric-row">
                <strong>Errors Detected:</strong> <span>{testExecuted ? 8 - verifiedCount : "—"}</span>
              </div>
            </div>

            <div className="analysis-block summary-conclusion-block">
              <h4 className="block-sub-title">CONCLUSION</h4>
              <p className="conclusion-feedback-text">
                {overallTestPassed
                  ? "Excellent! The wiring sequence matches the selected standard exactly. Progress logged successfully."
                  : testExecuted
                  ? "Continuity error detected. The wire sequence deviates from the selected standard. Reset the workspace and re-wire."
                  : "Drag the connector in, wire all 8 pins to match the reference sequence, crimp, then run the LAN test for a full validation report."}
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Observation table */}
      <section className="card table-section">
        <h3 className="panel-heading orange">Observation Table</h3>
        <div className="table-scroll">
          <table className="obs-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Cable Type</th>
                <th>Left End Standard</th>
                <th>Right End Standard</th>
                <th>Test Result</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.id} className={row.status === "Completed" ? "row-verified" : ""}>
                  <td>{row.id}</td>
                  <td>{row.label}</td>
                  <td>{row.leftStandard}</td>
                  <td>{row.rightStandard}</td>
                  <td>
                    <span className={`result-tag-cell ${row.testResult === "PASS" ? "cell-pass" : row.testResult === "FAIL" ? "cell-fail" : ""}`}>
                      {row.testResult ? row.testResult : "—"}
                    </span>
                  </td>
                  <td>
                    {row.status === "Completed" ? <span className="status-verified">✔ Completed</span> : <span className="status-pending">Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-hint">ℹ Complete and PASS both cable types. After both are completed, the Submit button will be enabled.</p>
      </section>

      {/* Submit */}
      <section className="submit-section">
        <button
          className={`btn-submit ${allRowsCompleted && !submitted ? "enabled" : "disabled"}`}
          onClick={handleSubmit}
          disabled={!allRowsCompleted || submitted}
        >
          🔒 {submitted ? "Submitted" : "Submit Experiment"}
        </button>
        <div className="submit-status">
          {submitted ? (
            <p className="submit-success">Experiment Submitted Successfully! Results committed to academic server files.</p>
          ) : allRowsCompleted ? (
            <>
              <p><strong>Both configurations verified successfully!</strong></p>
              <p>The assignment package is ready for final submission.</p>
            </>
          ) : (
            <p>{tableRows.filter((r) => r.status === "Completed").length} / 2 configurations currently validated.</p>
          )}
        </div>
      </section>
    </div>
  );
}