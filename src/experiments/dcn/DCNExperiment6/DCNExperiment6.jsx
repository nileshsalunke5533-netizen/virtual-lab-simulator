// DCNExperiment6.jsx
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import "./DCNExperiment6.css";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const SWITCH_ID = "SWITCH";
const MAX_PC = 5;
const CATALOG = [
  { kind: "switch", label: "Switch", max: 1 },
  { kind: "pc", label: "Computer", max: MAX_PC },
];

// ─────────────────────────────────────────────────────────────
// Real Device Icons
// ─────────────────────────────────────────────────────────────
function NodeIcon({ kind, size = 44, active = false, ok = false }) {
  const ring = ok ? "#2db34a" : active ? "#2c3e7a" : "#c7cbd6";

  if (kind === "switch") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <rect x="3" y="17" width="42" height="16" rx="2" fill="#3a4a63" stroke={ring} strokeWidth="1.5" />
        {[...Array(8)].map((_, i) => (
          <rect key={i} x={7 + i * 5} y="21" width="3" height="4.5" fill={i % 3 === 0 ? "#2db34a" : "#6b7280"} />
        ))}
        <rect x="7" y="27.5" width="34" height="2" fill="#1a1a2e" opacity="0.4" />
      </svg>
    );
  }
  // pc
  return (
    <svg width={size} height={size} viewBox="0 0 46 46">
      <rect x="4" y="6" width="38" height="24" rx="2" fill="#1a1a2e" stroke={ring} strokeWidth="1.5" />
      <rect x="7" y="9" width="32" height="17" fill="#4a90d9" opacity="0.85" />
      <rect x="18" y="30" width="10" height="4" fill="#6b7280" />
      <rect x="12" y="34" width="22" height="3" rx="1.5" fill="#3a4a63" />
    </svg>
  );
}

function CableIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M4 12h6M18 12h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="4" cy="12" r="2.4" fill="currentColor" />
      <circle cx="20" cy="12" r="2.4" fill="currentColor" />
      <path d="M9 8v8M15 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Reusable Popup Modal (error / success)
// ─────────────────────────────────────────────────────────────
function Modal({ tone = "info", title, children, onClose, actionLabel = "Okay" }) {
  return (
    <div className="dcn1-overlay" onClick={onClose}>
      <div className={`dcn1-modal tone-${tone}`} onClick={(e) => e.stopPropagation()}>
        <h3 className="dcn1-modal-title">{title}</h3>
        <div className="dcn1-modal-body">{children}</div>
        <button type="button" className="btn-verify" onClick={onClose}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
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

export default function DCNExperiment6() {
  const navigate = useNavigate();
  const workspaceRef = useRef(null);

  const [placed, setPlaced] = useState([]); // [{id, kind, x, y}]
  const [connections, setConnections] = useState([]); // [{from, to}]
  const [cableMode, setCableMode] = useState(false);
  const [pendingNode, setPendingNode] = useState(null);
  const [testState, setTestState] = useState("idle"); // idle | testing | done
  const [submitted, setSubmitted] = useState(false);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procOpen, setProcOpen] = useState(false);
  const [errorPopup, setErrorPopup] = useState(null);
  const [successPopup, setSuccessPopup] = useState(false);

  const pcNodes = placed.filter((n) => n.kind === "pc");
  const switchNode = placed.find((n) => n.kind === "switch");
  const pcCount = pcNodes.length;
  const switchPlaced = !!switchNode;

  const placedById = Object.fromEntries(placed.map((p) => [p.id, p]));
  const isConnected = (id) => connections.some((c) => c.from === id || c.to === id);
  const connectedCount = pcNodes.filter((n) => isConnected(n.id)).length;
  const allConnected = switchPlaced && pcCount === MAX_PC && connectedCount === MAX_PC;

  const countOf = (kind) => placed.filter((p) => p.kind === kind).length;
  const remaining = (kind) => CATALOG.find((c) => c.kind === kind).max - countOf(kind);

  // ─────────────────────────────
  // Drag & Drop placement
  // ─────────────────────────────
  const onPaletteDragStart = (kind) => (e) => {
    if (remaining(kind) <= 0) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("kind", kind);
  };

  const onCanvasDragOver = (e) => e.preventDefault();

  const onCanvasDrop = (e) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData("kind");
    if (!kind) return;

    if (remaining(kind) <= 0) {
      setErrorPopup({
        title: "Not Allowed",
        message:
          kind === "switch"
            ? "Only one Switch can be placed on the workspace."
            : "All 5 Computers are already placed on the workspace.",
      });
      return;
    }

    const ws = workspaceRef.current.getBoundingClientRect();
    let x = e.clientX - ws.left - 22;
    let y = e.clientY - ws.top - 22;
    x = Math.max(6, Math.min(ws.width - 56, x));
    y = Math.max(6, Math.min(ws.height - 56, y));

    const id = kind === "switch" ? SWITCH_ID : `PC${pcCount + 1}`;
    setPlaced((p) => [...p, { id, kind, x, y }]);
  };

  // ─────────────────────────────
  // Tap to remove (only when cable mode is OFF)
  // ─────────────────────────────
  const removePlaced = (id) => {
    setPlaced((p) => p.filter((n) => n.id !== id));
    setConnections((c) => c.filter((l) => l.from !== id && l.to !== id));
    setTestState("idle");
  };

  // ─────────────────────────────
  // Cable tool
  // ─────────────────────────────
  const toggleCableMode = () => {
    if (!switchPlaced) {
      setErrorPopup({ title: "Switch Missing", message: "Place the Switch on the workspace before wiring cables." });
      return;
    }
    if (pcCount === 0) {
      setErrorPopup({ title: "No Computers Placed", message: "Place at least one Computer before using the cable tool." });
      return;
    }
    setPendingNode(null);
    setCableMode((m) => !m);
  };

  const handleNodeClick = (node) => {
    if (!cableMode) {
      removePlaced(node.id);
      return;
    }

    // cable mode: wiring logic
    if (!pendingNode) {
      setPendingNode(node.id);
      return;
    }
    if (pendingNode === node.id) {
      setPendingNode(null);
      return;
    }

    const a = placedById[pendingNode];
    const b = node;
    const involvesSwitch = a.kind === "switch" || b.kind === "switch";

    if (!involvesSwitch) {
      setErrorPopup({ title: "Invalid Connection", message: "Two Computers cannot be wired directly. Every Computer must connect to the Switch." });
      setPendingNode(null);
      return;
    }

    const pc = a.kind === "switch" ? b : a;
    if (isConnected(pc.id)) {
      setErrorPopup({ title: "Already Connected", message: `${pc.id} is already wired to the Switch.` });
      setPendingNode(null);
      return;
    }

    setConnections((c) => [...c, { from: pc.id, to: SWITCH_ID }]);
    setPendingNode(null);
  };

  // ─────────────────────────────
  // Test Network
  // ─────────────────────────────
  const handleTest = () => {
    if (!switchPlaced) {
      setErrorPopup({ title: "Switch Missing", message: "Place the Switch before testing the network." });
      return;
    }
    if (connections.length === 0) {
      setErrorPopup({ title: "No Connections", message: "Wire at least one Computer to the Switch before testing." });
      return;
    }
    setTestState("testing");
    setTimeout(() => {
      setTestState("done");
      if (switchPlaced && pcCount === MAX_PC && connectedCount === MAX_PC) {
        setSuccessPopup(true);
      }
    }, 1200);
  };

  // ─────────────────────────────
  // Reset
  // ─────────────────────────────
  const handleReset = () => {
    setPlaced([]);
    setConnections([]);
    setCableMode(false);
    setPendingNode(null);
    setTestState("idle");
  };

  // ─────────────────────────────
  // Submit
  // ─────────────────────────────

const handleSubmit = () => {
  if (!allConnected || submitted) return;

  setSubmitted(true);

  navigate("/dcn-result", {
    state: {
      experimentNo: 6,
      experimentName:
        "Connect Computers in Star Topology using Wired Media and Network Control Device",
      experimentRoute: "/dcn-experiment-6",
    },
  });
};

  const centerOf = (id) => {
    const n = placedById[id];
    const size = n.kind === "switch" ? 24 : 22;
    return { x: n.x + size, y: n.y + size };
  };

  // Fixed 5 observation rows regardless of placement order
  const obsRows = Array.from({ length: MAX_PC }, (_, i) => {
    const id = `PC${i + 1}`;
    const node = placedById[id];
    if (!node) return { id, status: "Not Placed" };
    return { id, status: isConnected(id) ? "Verified" : "Pending" };
  });

  return (
    <div className="DCNExperiment6-root">
      {/* Header */}
      <header className="exp-header">
      <button
  type="button"
  className="btn-back"
  onClick={() => navigate("/dcn-experiments")}
>
  ← Back
</button>
        <h1 className="exp-title">
          Experiment 6 : Connect Computers in Star Topology using Wired Media and Network Control Device
        </h1>
        <InlineHelp
          title="Experiment 6 Help"
          items={[
            "Place the computers and central switch in the workspace.",
            "Connect every computer to the switch using wired links.",
            "Verify the star topology and check the connection status for each computer.",
          ]}
        />
      </header>

      {/* Aim */}
      <section className="card aim-card">
        <h2 className="section-heading orange">Aim</h2>
        <p>To connect computers in Star Topology using Ethernet cables and a network control device (Switch).</p>
      </section>

      {/* Theory */}
      <section className="card collapsible-card">
        <div className="collapsible-header" onClick={() => setTheoryOpen(!theoryOpen)}>
          <h2 className="section-heading orange">Theory</h2>
          <span className="chevron">{theoryOpen ? "▲" : "▼"}</span>
        </div>
        {theoryOpen && (
          <div className="collapsible-body">
            <p>Star topology is a network topology in which all computers are connected to a central network device called a Switch.</p>
            <p>Data transmitted by any computer passes through the Switch before reaching its destination.</p>
            <p>If one cable fails, the remaining network continues to work, since every link is independent.</p>
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
              <li>Drag the Switch onto the workspace.</li>
              <li>Drag all five Computers onto the workspace.</li>
              <li>Turn on the Ethernet Cable tool.</li>
            </ol>
            <ol className="proc-col" start={4}>
              <li>Tap each Computer, then tap the Switch to wire it.</li>
              <li>Click "Test Network".</li>
              <li>Observe the result and submit.</li>
            </ol>
          </div>
        )}
      </section>

      {/* Simulation Row */}
      <div className="sim-row">
        {/* Components Panel */}
        <aside className="card inputs-panel">
          <h3 className="panel-heading">Components</h3>
          <p className="input-hint">Drag a device onto the workspace.</p>

          {CATALOG.map((c) => (
            <div
              key={c.kind}
              className={`dcn-comp-item ${remaining(c.kind) <= 0 ? "disabled" : ""}`}
              draggable={remaining(c.kind) > 0}
              onDragStart={onPaletteDragStart(c.kind)}
            >
              <NodeIcon kind={c.kind} size={28} active />
              <span className="dcn-comp-label">{c.label}</span>
              <span className="dcn-comp-count">{remaining(c.kind)} left</span>
            </div>
          ))}

          <button type="button" className={`dcn-cable-btn ${cableMode ? "on" : ""}`} onClick={toggleCableMode}>
            <CableIcon /> {cableMode ? "Cable: ON" : "Ethernet Cable"}
          </button>

          <p className="input-hint">
            {cableMode ? "Tap a Computer, then tap the Switch to link them." : "Tap a placed device to remove it."}
          </p>

          <h4 className="analysis-sub">Links {connectedCount}/{MAX_PC}</h4>
        </aside>

        {/* Canvas Panel */}
        <div className="card canvas-panel">
          <h3 className="panel-heading">Simulation Canvas</h3>

          <div className="canvas-area">
            <div ref={workspaceRef} className="dcn-workspace" onDragOver={onCanvasDragOver} onDrop={onCanvasDrop}>
              {placed.length === 0 && <div className="dcn-placeholder">Drag the Switch and Computers here</div>}

              <svg width="100%" height="100%">
                {connections.map((c, i) => {
                  const p1 = centerOf(c.from);
                  const p2 = centerOf(c.to);
                  const done = testState === "done";
                  const stroke = testState === "testing" ? "#e07b2a" : done ? "#2db34a" : "#3a5fbf";
                  return (
                    <line
                      key={i}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={stroke}
                      strokeWidth="2.5"
                      strokeDasharray={testState === "testing" ? "6 6" : "0"}
                      className={testState === "testing" ? "dcn-line-testing" : ""}
                    />
                  );
                })}
                {pendingNode && (
                  <circle
                    cx={centerOf(pendingNode).x}
                    cy={centerOf(pendingNode).y}
                    r="16"
                    fill="none"
                    stroke="#e07b2a"
                    strokeWidth="2"
                    className="dcn-pending-ring"
                  />
                )}
              </svg>

              {placed.map((n) => {
                const connected = n.kind === "switch" ? connections.length > 0 : isConnected(n.id);
                const ok = testState === "done" && connected;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNodeClick(n)}
                    className={`dcn-node ${cableMode ? "cable-mode" : ""} ${pendingNode === n.id ? "pending" : ""}`}
                    style={{ left: n.x, top: n.y }}
                    title={cableMode ? "Tap to wire" : "Tap to remove"}
                  >
                    <NodeIcon kind={n.kind} active={connected} ok={ok} />
                    <span className={`dcn-node-label ${connected ? "connected" : ""}`}>{n.id}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="canvas-actions">
            <button type="button" className="btn-verify" onClick={handleTest} disabled={testState === "testing"}>
              {testState === "testing" ? "Testing…" : "▶ Test Network"}
            </button>
            <button type="button" className="btn-reset" onClick={handleReset}>
              ↺ Reset
            </button>
          </div>
        </div>

        {/* Analysis / Result Panel */}
        <aside className="card analysis-panel">
          <h3 className="panel-heading orange">Result</h3>
          <div className="analysis-block">
            <h4 className="analysis-sub">Connection Status</h4>
            <table className="analysis-table">
              <tbody>
                {obsRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>=</td>
                    <td className={row.status === "Verified" ? "status-verified" : "status-pending"}>
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {testState === "done" && (
            <div className="analysis-block">
              <h4 className="analysis-sub">Conclusion</h4>
              <p className="conclusion-text">
                {allConnected
                  ? "All five PCs successfully reach the Switch. Star Topology Created Successfully."
                  : `${connectedCount}/${MAX_PC} PCs connected. Connect the remaining PCs to complete the topology.`}
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Observation Table */}
      <section className="card table-section">
        <h2 className="section-heading orange">Observation Table</h2>
        <table className="obs-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Computer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {obsRows.map((row, i) => (
              <tr key={row.id} className={row.status === "Verified" ? "row-verified" : ""}>
                <td>{i + 1}</td>
                <td>{row.id}</td>
                <td
                  className={
                    row.status === "Verified"
                      ? "status-verified"
                      : row.status === "Not Placed"
                      ? ""
                      : "status-pending"
                  }
                >
                  {row.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Submit */}
      <section className="submit-section">
        <button
          type="button"
          className={`btn-submit ${allConnected && !submitted ? "enabled" : "disabled"}`}
          onClick={handleSubmit}
          disabled={!allConnected || submitted}
        >
          Submit
        </button>
      </section>

      {/* Error Popup */}
      {errorPopup && (
        <Modal tone="error" title={"⚠ " + errorPopup.title} onClose={() => setErrorPopup(null)}>
          <p>{errorPopup.message}</p>
        </Modal>
      )}

      {/* Success Popup */}
      {successPopup && (
        <Modal tone="success" title="✅ Star Topology Created" onClose={() => setSuccessPopup(false)} actionLabel="Continue">
          <p>All 5 computers are correctly wired to the Switch. You may now submit the experiment.</p>
        </Modal>
      )}
    </div>
  );
}