// DCNExperiment7.jsx
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import "./DCNExperiment7.css";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const MAX_PC = 4;
const ALL_PC_IDS = ["PC1", "PC2", "PC3", "PC4"];

// All unique pairs needed for a full mesh (P2P — every PC to every PC)
const REQUIRED_LINKS = [];
for (let i = 0; i < ALL_PC_IDS.length; i++) {
  for (let j = i + 1; j < ALL_PC_IDS.length; j++) {
    REQUIRED_LINKS.push([ALL_PC_IDS[i], ALL_PC_IDS[j]]);
  }
}
const linkKey = (a, b) => [a, b].sort().join("-");
const REQUIRED_KEYS = new Set(REQUIRED_LINKS.map(([a, b]) => linkKey(a, b)));

// ─────────────────────────────────────────────────────────────
// Real PC Icon
// ─────────────────────────────────────────────────────────────
function PCIcon({ size = 44, active = false, ok = false }) {
  const ring = ok ? "#2db34a" : active ? "#2c3e7a" : "#c7cbd6";
  return (
    <svg width={size} height={size} viewBox="0 0 46 46">
      <rect x="4" y="6" width="38" height="24" rx="2" fill="#1a1a2e" stroke={ring} strokeWidth="1.5" />
      <rect x="7" y="9" width="32" height="17" fill="#4a90d9" opacity="0.85" />
      <rect x="18" y="30" width="10" height="4" fill="#6b7280" />
      <rect x="12" y="34" width="22" height="3" rx="1.5" fill="#3a4a63" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Reusable Modal
// ─────────────────────────────────────────────────────────────
function Modal({ tone = "error", title, children, onClose, actionLabel = "Okay" }) {
  return (
    <div className="dcn7-overlay" onClick={onClose}>
      <div className={`dcn7-modal tone-${tone}`} onClick={(e) => e.stopPropagation()}>
        <h3 className="dcn7-modal-title">{title}</h3>
        <div className="dcn7-modal-body">{children}</div>
        <button type="button" className="btn-verify" onClick={onClose}>{actionLabel}</button>
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

export default function DCNExperiment7() {
  const navigate = useNavigate();
  const workspaceRef = useRef(null);

  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procOpen, setProcOpen] = useState(false);

  const [placed, setPlaced] = useState([]); // [{id, x, y}]
  const [connections, setConnections] = useState([]); // [{from, to}]
  const [cableMode, setCableMode] = useState(false);
  const [pendingNode, setPendingNode] = useState(null);
  const [testState, setTestState] = useState("idle"); // idle | testing | done

  const [demoFrom, setDemoFrom] = useState("PC1");
  const [demoTo, setDemoTo] = useState("PC3");
  const [demoResult, setDemoResult] = useState(null);

  const [errorPopup, setErrorPopup] = useState(null);
  const [successPopup, setSuccessPopup] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const placedById = Object.fromEntries(placed.map((p) => [p.id, p]));
  const madeKeys = new Set(connections.map((c) => linkKey(c.from, c.to)));
  const isConnected = (id) => connections.some((c) => c.from === id || c.to === id);

  const allPlaced = placed.length === MAX_PC;
  const allWired = REQUIRED_KEYS.size === madeKeys.size && [...REQUIRED_KEYS].every((k) => madeKeys.has(k));
  const meshVerified = testState === "done" && allWired;

  const showError = (title, message) => setErrorPopup({ title, message });

  // ─────────────────────────────
  // Drag & Drop placement
  // ─────────────────────────────
  const onPaletteDragStart = (e) => {
    if (placed.length >= MAX_PC) { e.preventDefault(); return; }
    e.dataTransfer.setData("kind", "pc");
  };

  const onCanvasDragOver = (e) => e.preventDefault();

  const onCanvasDrop = (e) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData("kind");
    if (kind !== "pc") return;

    if (placed.length >= MAX_PC) {
      showError("Limit Reached", `A peer-to-peer network in this experiment uses exactly ${MAX_PC} computers. Remove one before adding another.`);
      return;
    }

    const ws = workspaceRef.current.getBoundingClientRect();
    let x = e.clientX - ws.left - 22;
    let y = e.clientY - ws.top - 22;
    x = Math.max(6, Math.min(ws.width - 56, x));
    y = Math.max(6, Math.min(ws.height - 56, y));

    const id = ALL_PC_IDS[placed.length];
    setPlaced((p) => [...p, { id, x, y }]);
  };

  // ─────────────────────────────
  // Tap to remove (cable mode off)
  // ─────────────────────────────
  const removePlaced = (id) => {
    setPlaced((p) => p.filter((n) => n.id !== id));
    setConnections((c) => c.filter((l) => l.from !== id && l.to !== id));
    setTestState("idle");
  };

  // ─────────────────────────────
  // Cable tool — direct peer wiring (NO switch/server allowed)
  // ─────────────────────────────
  const toggleCableMode = () => {
    if (!allPlaced) {
      showError("Placement Incomplete", `Place all ${MAX_PC} computers on the workspace before wiring peer connections.`);
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
    if (!pendingNode) {
      setPendingNode(node.id);
      return;
    }
    if (pendingNode === node.id) {
      setPendingNode(null);
      return;
    }
    const key = linkKey(pendingNode, node.id);
    if (madeKeys.has(key)) {
      showError("Already Connected", `${pendingNode} and ${node.id} are already directly linked.`);
      setPendingNode(null);
      return;
    }
    setConnections((c) => [...c, { from: pendingNode, to: node.id }]);
    setPendingNode(null);
  };

  const handleVerify = () => {
    if (!allWired) {
      showError(
        "Mesh Incomplete",
        `Only ${connections.length}/${REQUIRED_LINKS.length} direct peer links are wired. In a P2P network, every computer must connect directly to every other computer — with no central device.`
      );
      setTestState("idle");
      return;
    }
    setTestState("testing");
    setTimeout(() => {
      setTestState("done");
      setSuccessPopup(true);
    }, 1100);
  };

  const handleReset = () => {
    setPlaced([]);
    setConnections([]);
    setCableMode(false);
    setPendingNode(null);
    setTestState("idle");
    setDemoResult(null);
  };

  // ─────────────────────────────
  // Peer Access Demo
  // ─────────────────────────────
  const runDemo = () => {
    if (!meshVerified) {
      showError("Network Not Verified", "Verify the peer-to-peer mesh successfully before testing direct peer access.");
      return;
    }
    if (demoFrom === demoTo) {
      showError("Invalid Selection", "Select two different computers to demonstrate a direct peer request.");
      return;
    }
    setDemoResult(null);
    setTimeout(() => {
      setDemoResult({ from: demoFrom, to: demoTo });
    }, 600);
  };

  const allDone = meshVerified && !!demoResult;

const handleSubmit = () => {
  if (!allDone || submitted) return;

  setSubmitted(true);

  navigate("/dcn-result", {
    state: {
      experimentNo: 7,
      experimentName: "Create a Network Using Peer to Peer Network Model",
      experimentRoute: "/dcn-experiment-7",
    },
  });
};

  const centerOf = (id) => {
    const n = placedById[id];
    return { x: n.x + 22, y: n.y + 22 };
  };

  const obsRows = [
    { label: "Place all 4 computers on the workspace", done: allPlaced },
    { label: "Wire direct peer-to-peer links (no central device)", done: allWired },
    { label: "Verify the peer-to-peer mesh network", done: meshVerified },
    { label: "Demonstrate direct resource access between two peers", done: !!demoResult },
  ];
  const doneCount = obsRows.filter((r) => r.done).length;

  return (
    <div className="DCNExperiment7-root">
      {/* Header */}
      <header className="exp-header">
       <button
  type="button"
  className="btn-back"
  onClick={() => navigate("/dcn-experiments")}
>
  ← Back
</button>
        <h1 className="exp-title">Experiment 7 : Create a Network Using Peer to Peer Network Model</h1>
        <InlineHelp
          title="Experiment 7 Help"
          items={[
            "Place the four computers on the workspace to create peer nodes.",
            "Connect every peer directly to the other peers; do not add a central switch.",
            "Verify the mesh links and demonstrate direct resource access between peers.",
          ]}
        />
      </header>

      {/* Aim */}
      <section className="card aim-card">
        <h2 className="section-heading orange">Aim</h2>
        <p>To use the peer-to-peer network model for a given situation and create a network in which every computer communicates directly with every other computer.</p>
      </section>

      {/* Theory */}
      <section className="card collapsible-card">
        <div className="collapsible-header" onClick={() => setTheoryOpen(!theoryOpen)}>
          <h2 className="section-heading orange">Theory</h2>
          <span className="chevron">{theoryOpen ? "▲" : "▼"}</span>
        </div>
        {theoryOpen && (
          <div className="collapsible-body">
            <p>In a Peer-to-Peer (P2P) network, every computer has equal status — there is no dedicated server. Each computer, called a peer, can act as both a client and a server, directly sharing its resources with other peers.</p>
            <p>Unlike a client-server model, requests do not pass through any central control device. This makes P2P networks simple and inexpensive, though harder to secure and manage as the number of peers grows.</p>
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
              <li>Drag all 4 computers onto the workspace.</li>
              <li>Turn on the Peer Link tool.</li>
              <li>Connect every computer directly to every other computer.</li>
            </ol>
            <ol className="proc-col" start={4}>
              <li>Click "Verify Mesh" to confirm the P2P network.</li>
              <li>Select two peers and test direct resource access.</li>
              <li>Submit once the demonstration succeeds.</li>
            </ol>
          </div>
        )}
      </section>

      {/* Simulation Row */}
      <div className="sim-row">
        {/* Components Panel */}
        <aside className="card inputs-panel">
          <h3 className="panel-heading">Peers</h3>
          <p className="input-hint">Drag a computer onto the workspace ({placed.length}/{MAX_PC} placed).</p>

          <div className={`dcn-comp-item ${placed.length >= MAX_PC ? "disabled" : ""}`} draggable={placed.length < MAX_PC} onDragStart={onPaletteDragStart}>
            <PCIcon size={28} active />
            <span className="dcn-comp-label">Computer</span>
            <span className="dcn-comp-count">{MAX_PC - placed.length} left</span>
          </div>

          <button type="button" className={`dcn-cable-btn ${cableMode ? "on" : ""}`} onClick={toggleCableMode}>
            🔗 {cableMode ? "Peer Link: ON" : "Peer Link Tool"}
          </button>
          <p className="input-hint">{cableMode ? "Tap two computers to link them directly." : "Tap a placed computer to remove it."}</p>

          <h4 className="analysis-sub">Direct Links {connections.length}/{REQUIRED_LINKS.length}</h4>
        </aside>

        {/* Canvas Panel */}
        <div className="card canvas-panel">
          <h3 className="panel-heading">Simulation Canvas — No Central Server</h3>
          <div className="canvas-area">
            <div ref={workspaceRef} className="dcn-workspace" onDragOver={onCanvasDragOver} onDrop={onCanvasDrop}>
              {placed.length === 0 && <div className="dcn-placeholder">Drag computers here — no switch or server allowed in P2P</div>}

              <svg width="100%" height="100%">
                {connections.map((c, i) => {
                  const p1 = centerOf(c.from);
                  const p2 = centerOf(c.to);
                  const stroke = testState === "testing" ? "#e07b2a" : testState === "done" ? "#2db34a" : "#3a5fbf";
                  return (
                    <line
                      key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                      stroke={stroke} strokeWidth="2.2"
                      strokeDasharray={testState === "testing" ? "6 6" : "0"}
                      className={testState === "testing" ? "dcn-line-testing" : ""}
                    />
                  );
                })}
                {pendingNode && (
                  <circle cx={centerOf(pendingNode).x} cy={centerOf(pendingNode).y} r="16" fill="none" stroke="#e07b2a" strokeWidth="2" className="dcn-pending-ring" />
                )}
              </svg>

              {placed.map((n) => {
                const connected = isConnected(n.id);
                const ok = testState === "done" && connected;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNodeClick(n)}
                    className={`dcn-node ${cableMode ? "cable-mode" : ""} ${pendingNode === n.id ? "pending" : ""}`}
                    style={{ left: n.x, top: n.y }}
                    title={cableMode ? "Tap to link" : "Tap to remove"}
                  >
                    <PCIcon active={connected} ok={ok} />
                    <span className={`dcn-node-label ${connected ? "connected" : ""}`}>{n.id}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="canvas-actions">
            <button type="button" className="btn-verify" onClick={handleVerify} disabled={testState === "testing"}>
              {testState === "testing" ? "Verifying…" : "▶ Verify Mesh"}
            </button>
            <button type="button" className="btn-reset" onClick={handleReset}>↺ Reset</button>
          </div>

          {/* Direct Peer Access Demo */}
          <div className="dcn7-demo">
            <h4 className="analysis-sub">Direct Peer Access Demo</h4>
            <div className="dcn7-demo-row">
              <select className="dcn7-select" value={demoFrom} onChange={(e) => setDemoFrom(e.target.value)}>
                {ALL_PC_IDS.map((id) => <option key={id} value={id}>{id}</option>)}
              </select>
              <span className="dcn7-arrow">requests file directly from →</span>
              <select className="dcn7-select" value={demoTo} onChange={(e) => setDemoTo(e.target.value)}>
                {ALL_PC_IDS.map((id) => <option key={id} value={id}>{id}</option>)}
              </select>
              <button type="button" className="btn-verify small" onClick={runDemo}>Run</button>
            </div>
            {demoResult && (
              <div className="dcn7-demo-result">
                ✅ {demoResult.from} accessed a shared file on {demoResult.to} directly — no server or switch was involved in the request.
              </div>
            )}
          </div>
        </div>

        {/* Result Panel */}
        <aside className="card analysis-panel">
          <h3 className="panel-heading orange">Result</h3>
          <div className="analysis-block">
            <h4 className="analysis-sub">Mesh Status</h4>
            <p className="conclusion-text">{connections.length}/{REQUIRED_LINKS.length} direct links wired</p>
          </div>
          {testState === "done" && (
            <div className="analysis-block">
              <h4 className="analysis-sub">Conclusion</h4>
              <p className="conclusion-text">
                {allWired
                  ? "All 4 peers are directly interconnected. Peer-to-Peer network created successfully — every computer can act as both client and server."
                  : "Mesh incomplete. Some peers are missing direct connections."}
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Observation Table */}
      <section className="card table-section">
        <h2 className="section-heading orange">Observation Table</h2>
        <table className="obs-table">
          <thead><tr><th>Sr. No.</th><th>Task Performed</th><th>Status</th></tr></thead>
          <tbody>
            {obsRows.map((row, i) => (
              <tr key={i} className={row.done ? "row-verified" : ""}>
                <td>{i + 1}</td>
                <td style={{ textAlign: "left" }}>{row.label}</td>
                <td className={row.done ? "status-verified" : "status-pending"}>{row.done ? "Completed" : "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Submit */}
      <section className="submit-section">
        <button
          type="button"
          className={`btn-submit ${allDone && !submitted ? "enabled" : "disabled"}`}
          onClick={handleSubmit}
          disabled={!allDone || submitted}
        >
          Submit
        </button>
      </section>
      {!allDone && <p className="submit-hint-center">{doneCount}/{obsRows.length} steps completed.</p>}

      {/* Error Popup */}
      {errorPopup && (
        <Modal tone="error" title={"⚠ " + errorPopup.title} onClose={() => setErrorPopup(null)}>
          <p>{errorPopup.message}</p>
        </Modal>
      )}

      {/* Success Popup */}
      {successPopup && (
        <Modal tone="success" title="✅ Peer-to-Peer Mesh Verified" onClose={() => setSuccessPopup(false)} actionLabel="Continue">
          <p>All 4 computers are directly interconnected with no central device. Now run the Direct Peer Access Demo below to complete the experiment.</p>
        </Modal>
      )}
    </div>
  );
}