// DCNExperiment1.jsx
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import "./DCNExperiment1.css";
import NetworkDiagrams, { ReferenceTopologyDiagram } from "./NetworkDiagrams";

/* ══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const CATALOG = [
  {
    kind: "router", label: "Router", max: 1,
    info: {
      name: "Router", type: "Layer 3 Networking Device",
      func: "A router connects your local network to other networks, including the Internet. It reads the destination IP address of every packet and decides the best path to forward it, effectively acting as a traffic controller between different networks.",
      ports: "4 LAN Ports + 1 WAN Port", speed: "Up to 1 Gbps (Gigabit Ethernet)",
      layer: "Network Layer (L3)", example: "TP-Link Archer C6, Cisco ISR 4000 Series",
      diagramNotes: ["WAN port connects to the ISP / Internet line", "LAN ports connect to the Switch or directly to PCs", "Antennas provide optional Wi-Fi broadcast", "Routing table stores paths to known networks"],
      realWorldUse: "In a college lab, the router sits at the entry point of the network — the ISP's fiber/cable line terminates at a wall socket, runs into the router's WAN port, and the router then distributes Internet access to the entire lab through the Switch.",
      pros: ["Connects multiple networks together", "Enables Internet sharing across many devices", "Can enforce basic firewall/NAT security", "Often includes built-in Wi-Fi"],
      cons: ["More expensive than a switch or hub", "Requires configuration (IP, DHCP, DNS)", "Can become a single point of failure"],
      commonIssues: ["Incorrect WAN configuration blocking Internet access", "Outdated firmware causing slow routing", "IP address conflicts on the LAN side"],
      photoImg: "/devices/router-photo.jpg", realImg: "/devices/router-real.jpg",
    },
  },
  {
    kind: "switch", label: "Switch", max: 1,
    info: {
      name: "Switch", type: "Layer 2 Networking Device",
      func: "A switch is the central connecting device of a LAN. It maintains a MAC address table and forwards each incoming frame only to the port where the destination device is connected, instead of broadcasting it to every device.",
      ports: "24 RJ45 Ports", speed: "100 Mbps – 1 Gbps per port",
      layer: "Data Link Layer (L2)", example: "Cisco Catalyst 2960, D-Link DGS-1024D",
      diagramNotes: ["Each port has its own collision domain", "MAC address table is built automatically", "LED indicators show link status per port", "Uplink port typically connects to the Router"],
      realWorldUse: "Mounted in a server rack or on the lab wall, the switch is wired to every PC, the printer, and the access point using patch cables run through the room's cable trunking, with one uplink cable going to the router.",
      pros: ["Reduces network congestion vs a hub", "Supports full-duplex communication", "Scalable — more ports for more devices", "Improves overall network performance"],
      cons: ["Cannot connect two different networks (needs a router)", "Managed switches require configuration knowledge", "More costly than a basic hub"],
      commonIssues: ["Loose or damaged RJ45 connectors", "Port showing 'no link' due to faulty cable", "Broadcast storms in poorly segmented networks"],
      photoImg: "/devices/switch-photo.jpg", realImg: "/devices/switch-real.jpg",
    },
  },
  {
    kind: "printer", label: "Printer", max: 1,
    info: {
      name: "Network Printer", type: "Shared Peripheral Device",
      func: "A printer that is connected to the network (via Ethernet or shared from a host PC) so that every authorized computer on the LAN can send print jobs to it without needing a direct cable connection.",
      ports: "1 Ethernet Port", speed: "100 Mbps (network interface)",
      layer: "Application Layer (L7)", example: "HP LaserJet Pro M15w, Canon imageCLASS",
      diagramNotes: ["Assigned a static/reserved IP on the LAN", "Print spooler queues jobs from multiple PCs", "Can be shared via a host PC or connected directly"],
      realWorldUse: "Placed near the lab instructor's desk, the printer connects to the Switch with a single Ethernet cable, letting any student PC on the network send print jobs without walking over with a USB drive.",
      pros: ["No need to connect to a single PC via USB", "Multiple users can print simultaneously (queued)", "Can be accessed from anywhere on the LAN"],
      cons: ["Needs a stable network connection to function", "Shared queue can cause delays during peak use", "Requires driver installation on every client PC"],
      commonIssues: ["Print jobs stuck in the spooler queue", "Printer IP changing after a router restart", "Paper jam / low toner interrupting shared jobs"],
      photoImg: "/devices/printer-photo.jpg", realImg: "/devices/printer-real.jpg",
    },
  },
  {
    kind: "ap", label: "Access Point", max: 1,
    info: {
      name: "Wireless Access Point", type: "Wireless Networking Device",
      func: "An access point extends a wired LAN by broadcasting a Wi-Fi signal, allowing laptops, phones and tablets to join the same network without a physical cable.",
      ports: "1 LAN Uplink Port", speed: "300 Mbps – 1 Gbps (802.11ac/ax)",
      layer: "Data Link Layer (L2)", example: "TP-Link EAP225, Ubiquiti UniFi AP",
      diagramNotes: ["Uplinks to the Switch via Ethernet cable", "Broadcasts SSID for wireless clients", "Multiple APs can extend coverage across a lab"],
      realWorldUse: "Mounted on the ceiling in the middle of the lab, the access point uplinks to the switch and broadcasts a Wi-Fi SSID so students' personal laptops and phones can join the lab network alongside the wired lab PCs.",
      pros: ["Removes the need for cables to reach every device", "Easy to add mobile devices to the network", "Can cover a wide physical area"],
      cons: ["Wireless signal can be weaker through walls", "More vulnerable to interference/security risks", "Shared bandwidth among many wireless users"],
      commonIssues: ["Weak signal in far corners of the room", "SSID not broadcasting after a firmware update", "Too many connected devices slowing down Wi-Fi"],
      photoImg: "/devices/ap-photo.jpg", realImg: "/devices/ap-real.jpg",
    },
  },
  {
    kind: "pc", label: "Computer", max: 4,
    info: {
      name: "Workstation (Client PC)", type: "End-User Client Device",
      func: "A desktop or laptop computer connected to the LAN using a NIC (Network Interface Card) and an Ethernet cable, used to access shared files, printers and the Internet.",
      ports: "1 RJ45 NIC Port", speed: "100 Mbps – 1 Gbps",
      layer: "Application Layer (L7)", example: "Desktop PC, Laptop with Ethernet/Wi-Fi",
      diagramNotes: ["Connects to the Switch, never directly to the Router in this lab", "Each PC has a unique IP address on the LAN", "NIC handles framing and MAC addressing"],
      realWorldUse: "Each student workstation sits on a lab bench with a patch cable running from its NIC to a wall-mounted RJ45 socket, which is internally wired back to the Switch in the server rack.",
      pros: ["Direct access to all shared network resources", "Wired connection is stable and fast", "Easy to troubleshoot individually"],
      cons: ["Requires a physical cable run to every desk", "Limited mobility compared to Wi-Fi devices"],
      commonIssues: ["No network access due to unplugged/faulty cable", "IP conflict with another PC on the same subnet", "Outdated NIC drivers causing slow speeds"],
      photoImg: "/devices/pc-photo.jpg", realImg: "/devices/pc-real.jpg",
    },
  },
];
const CAT_MAP = Object.fromEntries(CATALOG.map((c) => [c.kind, c]));

const linkKey = (a, b) => [a, b].sort().join("-");
const isValidPair = (kindA, kindB) => {
  const wireKinds = ["pc", "printer", "ap"];
  return (
    (wireKinds.includes(kindA) && kindB === "switch") ||
    (wireKinds.includes(kindB) && kindA === "switch") ||
    (kindA === "switch" && kindB === "router") ||
    (kindA === "router" && kindB === "switch")
  );
};
const TOTAL_REQUIRED = CATALOG.reduce((s, c) => s + c.max, 0);
const TOTAL_LINKS = 7;



/* ══════════════════════════════════════════════════════════
   ICONS (small icons used in grid / palette / layout floor)
═══════════════════════════════════════════════════════════ */
function DeviceIcon({ kind, size = 44, active = false, ok = false }) {
  const ring = ok ? "#2db34a" : active ? "#2c3e7a" : "#c7cbd6";
  if (kind === "router") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <rect x="4" y="22" width="40" height="14" rx="3" fill="#2c3e7a" stroke={ring} strokeWidth="1.5" />
        <line x1="14" y1="22" x2="9" y2="8" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="22" x2="39" y2="8" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="2" fill="#e07b2a" />
        <circle cx="39" cy="7" r="2" fill="#e07b2a" />
        {[0, 1, 2].map((i) => (<circle key={i} cx={13 + i * 9} cy="29" r="1.8" fill="#2db34a" />))}
        <rect x="30" y="26" width="10" height="5" rx="1" fill="#f4f6fb" opacity="0.85" />
      </svg>
    );
  }
  if (kind === "switch") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <rect x="3" y="17" width="42" height="16" rx="2" fill="#3a4a63" stroke={ring} strokeWidth="1.5" />
        {[...Array(8)].map((_, i) => (<rect key={i} x={7 + i * 5} y="21" width="3" height="4.5" fill={i % 3 === 0 ? "#2db34a" : "#6b7280"} />))}
      </svg>
    );
  }
  if (kind === "printer") {
    return (
      <svg width={size} height={size} viewBox="0 0 46 46">
        <rect x="8" y="4" width="20" height="10" fill="#e7eaf2" stroke="#9aa1b0" strokeWidth="1" />
        <rect x="4" y="14" width="28" height="16" rx="2" fill="#4a5468" stroke={ring} strokeWidth="1.5" />
        <circle cx="26" cy="19" r="1.5" fill="#2db34a" />
        <rect x="8" y="26" width="20" height="10" fill="#f4f6fb" stroke="#9aa1b0" strokeWidth="1" />
        <rect x="11" y="29" width="14" height="2" fill="#cfd4de" />
      </svg>
    );
  }
  if (kind === "ap") {
    return (
      <svg width={size} height={size} viewBox="0 0 46 46">
        <rect x="17" y="26" width="12" height="6" rx="1.5" fill="#f4f6fb" stroke="#3a4a63" strokeWidth="1.5" />
        <circle cx="23" cy="29" r="1.3" fill="#2db34a" />
        <path d="M13 22 A14 14 0 0 1 33 22" stroke="#e07b2a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M17 25 A8 8 0 0 1 29 25" stroke="#e07b2a" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.7" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 46 46">
      <rect x="4" y="6" width="38" height="24" rx="2" fill="#1a1a2e" stroke={ring} strokeWidth="1.5" />
      <rect x="7" y="9" width="32" height="17" fill="#4a90d9" opacity="0.85" />
      <rect x="18" y="30" width="10" height="4" fill="#6b7280" />
      <rect x="12" y="34" width="22" height="3" rx="1.5" fill="#3a4a63" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════════ */
function Modal({ tone = "info", title, children, onClose, actionLabel = "Got it" }) {
  return (
    <div className="dcn1-overlay" onClick={onClose}>
      <div className={`dcn1-modal tone-${tone}`} onClick={(e) => e.stopPropagation()}>
        <h3 className="dcn1-modal-title">{title}</h3>
        <div className="dcn1-modal-body">{children}</div>
        <button type="button" className="btn-verify" onClick={onClose}>{actionLabel}</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   IDENTIFY SCREEN (device grid + full detail page)
═══════════════════════════════════════════════════════════ */
const TABS = ["overview", "specifications", "photos", "working", "usecase", "proscons"];
const TAB_LABELS = {
  overview: "Overview", specifications: "Specifications", photos: "Photos & Diagram",
  working: "Working Principle", usecase: "Real-World Use", proscons: "Pros & Cons",
};

// Map catalog kind -> NetworkDiagrams deviceKey (catalog uses "ap", diagrams file uses "access-point")
const DIAGRAM_KEY = { router: "router", switch: "switch", printer: "printer", ap: "access-point", pc: "pc" };

function DeviceDetailPage({ device, onBack, onMarkStudied, alreadyStudied }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [viewedTabs, setViewedTabs] = useState(new Set(["overview"]));

  const openTab = (tab) => { setActiveTab(tab); setViewedTabs((s) => new Set(s).add(tab)); };
  const allTabsViewed = TABS.every((t) => viewedTabs.has(t));

  return (
    <div className="card dcn1-detail-page">
      <div className="dcn1-detail-header">
        <button type="button" className="btn-reset" onClick={onBack}>← Back to Devices</button>
        <h2 className="dcn1-detail-title">{device.info.name}</h2>
        <span className="dcn1-detail-tag">{device.info.type}</span>
      </div>

      <div className="dcn1-detail-tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={`dcn1-detail-tab ${activeTab === t ? "active" : ""} ${viewedTabs.has(t) ? "viewed" : ""}`} onClick={() => openTab(t)}>
            {TAB_LABELS[t]} {viewedTabs.has(t) && "✓"}
          </button>
        ))}
      </div>

      <div className="dcn1-detail-body">
        {activeTab === "overview" && (
          <>
            <div className="dcn1-detail-icon-row"><DeviceIcon kind={device.kind} size={72} active ok /></div>
            <p className="dcn1-detail-text">{device.info.func}</p>
            <div className="dcn1-detail-quickfacts">
              <div><b>OSI Layer</b><span>{device.info.layer}</span></div>
              <div><b>Example</b><span>{device.info.example}</span></div>
            </div>
          </>
        )}

        {activeTab === "specifications" && (
          <table className="dcn1-spec-table">
            <tbody>
              <tr><td>Device Type</td><td>{device.info.type}</td></tr>
              <tr><td>Ports</td><td>{device.info.ports}</td></tr>
              <tr><td>Speed</td><td>{device.info.speed}</td></tr>
              <tr><td>OSI Layer</td><td>{device.info.layer}</td></tr>
              <tr><td>Example Model</td><td>{device.info.example}</td></tr>
            </tbody>
          </table>
        )}

        {activeTab === "photos" && (
          <div className="dcn1-photo-grid">
            <div className="dcn1-photo-box">
              <h4 className="dcn1-detail-subhead">Device Image</h4>
              <img
                src={device.info.photoImg}
                alt={device.info.name}
                className="dcn1-photo-img"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <div className="dcn1-photo-box">
              <h4 className="dcn1-detail-subhead">Real-World Setup</h4>
              <img
                src={device.info.realImg}
                alt={`${device.info.name} in use`}
                className="dcn1-photo-img"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <div className="dcn1-photo-box full">
              <h4 className="dcn1-detail-subhead">Network Diagram</h4>
              <NetworkDiagrams deviceKey={DIAGRAM_KEY[device.kind]} />
            </div>
          </div>
        )}

        {activeTab === "working" && (
          <>
            <p className="dcn1-detail-text">{device.info.func}</p>
            <ul className="dcn1-detail-list">{device.info.diagramNotes.map((n, i) => (<li key={i}>{n}</li>))}</ul>
          </>
        )}

        {activeTab === "usecase" && (
          <>
            <h4 className="dcn1-detail-subhead">In This Lab</h4>
            <p className="dcn1-detail-text">{device.info.realWorldUse}</p>
            <h4 className="dcn1-detail-subhead">Common Issues Faced</h4>
            <ul className="dcn1-detail-list">{device.info.commonIssues.map((n, i) => (<li key={i}>{n}</li>))}</ul>
          </>
        )}

        {activeTab === "proscons" && (
          <div className="dcn1-proscons-grid">
            <div className="dcn1-pros">
              <h4 className="dcn1-detail-subhead">✓ Advantages</h4>
              <ul className="dcn1-detail-list">{device.info.pros.map((n, i) => (<li key={i}>{n}</li>))}</ul>
            </div>
            <div className="dcn1-cons">
              <h4 className="dcn1-detail-subhead">✗ Limitations</h4>
              <ul className="dcn1-detail-list">{device.info.cons.map((n, i) => (<li key={i}>{n}</li>))}</ul>
            </div>
          </div>
        )}
      </div>

      <div className="dcn1-detail-footer">
        <span className="input-hint">{viewedTabs.size}/{TABS.length} sections read</span>
        <button type="button" className="btn-verify" disabled={!allTabsViewed} onClick={onMarkStudied}>
          {alreadyStudied ? "✓ Studied — Back to Devices" : allTabsViewed ? "Mark as Studied →" : "Read all sections to continue"}
        </button>
      </div>
    </div>
  );
}

function IdentifyScreen({ identified, setIdentified, onProceed, showError }) {
  const [openDevice, setOpenDevice] = useState(null);
  const allIdentified = identified.size === CATALOG.length;

  const handleMarkStudied = () => { setIdentified((s) => new Set(s).add(openDevice.kind)); setOpenDevice(null); };
  const handleProceed = () => {
    if (!allIdentified) { showError("Identification Incomplete", "Please study every device (read all 6 sections of each) before proceeding to the layout stage."); return; }
    onProceed();
  };

  if (openDevice) {
    return <DeviceDetailPage device={openDevice} onBack={() => setOpenDevice(null)} onMarkStudied={handleMarkStudied} alreadyStudied={identified.has(openDevice.kind)} />;
  }

  return (
    <div className="card identify-card">
      <div className="identify-head">
        <h3 className="panel-heading">Step 1 — Identify Network Components</h3>
        <span className="input-hint">{identified.size}/{CATALOG.length} identified</span>
      </div>
      <div className="dcn1-grid">
        {CATALOG.map((c) => (
          <div key={c.kind} className={`dcn1-card ${identified.has(c.kind) ? "done" : ""}`} onClick={() => setOpenDevice(c)}>
            <DeviceIcon kind={c.kind} size={48} active={identified.has(c.kind)} ok={identified.has(c.kind)} />
            <span className="dcn1-card-label">{c.label}</span>
            <span className={identified.has(c.kind) ? "status-verified" : "status-pending"}>
              {identified.has(c.kind) ? "☑ Identified" : "☐ Tap to Identify"}
            </span>
          </div>
        ))}
      </div>
      <button type="button" className="btn-verify wide" onClick={handleProceed}>Proceed to Draw Layout →</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   LAYOUT SCREEN (drag-drop + wiring + verify)
═══════════════════════════════════════════════════════════ */
function ReferenceDiagram() {
  return (
    <div className="dcn1-reference">
      <h4 className="analysis-sub">📌 Target Lab Layout (Reference)</h4>
      <ReferenceTopologyDiagram />
      <p className="input-hint">Drag devices onto the floor to match this arrangement.</p>
    </div>
  );
}

function LayoutScreen({ placed, setPlaced, connections, setConnections, cableMode, setCableMode, pendingNode, setPendingNode, verifyResult, setVerifyResult, showError, setSuccessPopup }) {
  const floorRef = useRef(null);
  const countOf = (kind) => placed.filter((p) => p.kind === kind).length;
  const remaining = (kind) => CAT_MAP[kind].max - countOf(kind);
  const allPlaced = placed.length === TOTAL_REQUIRED;
  const placedById = Object.fromEntries(placed.map((p) => [p.id, p]));
  const madeKeys = new Set(connections.map((c) => linkKey(c.from, c.to)));
  const isNodeConnected = (id) => connections.some((c) => c.from === id || c.to === id);
  const allWired = connections.length === TOTAL_LINKS;

  const onPaletteDragStart = (kind) => (e) => { if (remaining(kind) <= 0) { e.preventDefault(); return; } e.dataTransfer.setData("kind", kind); };
  const onFloorDragOver = (e) => e.preventDefault();

  const onFloorDrop = (e) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData("kind");
    if (!kind) return;
    if (remaining(kind) <= 0) { showError("Not Allowed", `All ${CAT_MAP[kind].label}(s) are already placed on the layout.`); return; }
    const rect = floorRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left - 22;
    let y = e.clientY - rect.top - 22;
    x = Math.max(4, Math.min(rect.width - 48, x));
    y = Math.max(4, Math.min(rect.height - 48, y));
    const id = `${kind.toUpperCase()}${countOf(kind) + 1}`;
    setPlaced((p) => [...p, { id, kind, x, y }]);
  };

  const removePlaced = (id) => {
    if (cableMode) return;
    setPlaced((p) => p.filter((n) => n.id !== id));
    setConnections((c) => c.filter((l) => l.from !== id && l.to !== id));
  };

  const toggleCableMode = () => {
    if (!allPlaced) { showError("Placement Incomplete", `Place all ${TOTAL_REQUIRED} devices on the lab floor before wiring cables.`); return; }
    setPendingNode(null);
    setCableMode((m) => !m);
  };

  const handleNodeTap = (node) => {
    if (!cableMode) return;
    if (!pendingNode) { setPendingNode(node.id); return; }
    if (pendingNode === node.id) { setPendingNode(null); return; }
    const a = placedById[pendingNode];
    const b = node;
    if (!isValidPair(a.kind, b.kind)) { showError("Invalid Connection", `A ${CAT_MAP[a.kind].label} cannot be directly wired to a ${CAT_MAP[b.kind].label}. Check the standard LAN wiring order.`); setPendingNode(null); return; }
    if (madeKeys.has(linkKey(a.id, b.id))) { showError("Already Connected", "This link already exists on the layout."); setPendingNode(null); return; }
    setConnections((c) => [...c, { from: a.id, to: b.id }]);
    setPendingNode(null);
  };

  const handleVerify = () => {
    if (!allWired) { showError("Layout Incomplete", `Only ${connections.length}/${TOTAL_LINKS} required links are wired. Connect every PC, Printer and AP to the Switch, and the Switch to the Router.`); setVerifyResult(false); return; }
    setVerifyResult(true);
    setSuccessPopup(true);
  };

  const handleReset = () => { setPlaced([]); setConnections([]); setCableMode(false); setPendingNode(null); setVerifyResult(null); };
  const centerOf = (id) => { const n = placedById[id]; return { x: n.x + 22, y: n.y + 22 }; };

  return (
    <div className="sim-row">
      <aside className="card inputs-panel">
        <h3 className="panel-heading">Component Palette</h3>
        <p className="input-hint">Drag a device onto the lab floor.</p>
        {CATALOG.map((c) => (
          <div key={c.kind} className={`dcn-comp-item ${remaining(c.kind) <= 0 ? "disabled" : ""}`} draggable={remaining(c.kind) > 0} onDragStart={onPaletteDragStart(c.kind)}>
            <DeviceIcon kind={c.kind} size={30} active />
            <span className="dcn-comp-label">{c.label}</span>
            <span className="dcn-comp-count">{remaining(c.kind)} left</span>
          </div>
        ))}
        <h4 className="analysis-sub" style={{ marginTop: 10 }}>Links {connections.length}/{TOTAL_LINKS}</h4>
        <button type="button" className={`dcn-cable-btn ${cableMode ? "on" : ""}`} onClick={toggleCableMode}>🔌 {cableMode ? "Cable: ON" : "LAN Cable Tool"}</button>
      </aside>

      <div className="card canvas-panel">
        <h3 className="panel-heading">Lab Floor Plan — Drag &amp; Drop Devices</h3>
        <div className="canvas-area">
          <div ref={floorRef} className="dcn1-floor" onDragOver={onFloorDragOver} onDrop={onFloorDrop}>
            <div className="dcn1-floor-label">Computer Network Lab — Room 204</div>
            <div className="dcn1-cloud">☁ INTERNET</div>
            <svg width="100%" height="100%" className="dcn1-svg">
              {connections.map((l, i) => {
                const p1 = centerOf(l.from); const p2 = centerOf(l.to);
                const stroke = verifyResult === true ? "#2db34a" : "#2c3e7a";
                return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={stroke} strokeWidth="2.5" />;
              })}
              {pendingNode && (<circle cx={centerOf(pendingNode).x} cy={centerOf(pendingNode).y} r="17" fill="none" stroke="#e07b2a" strokeWidth="2" className="dcn1-pending-ring" />)}
            </svg>
            {placed.length === 0 && <div className="dcn1-empty-hint">Drag devices here from the palette →</div>}
            {placed.map((n) => (
              <div key={n.id} className={`dcn1-node ${cableMode ? "cable-mode" : ""} ${pendingNode === n.id ? "pending" : ""}`} style={{ left: n.x, top: n.y }} onClick={() => (cableMode ? handleNodeTap(n) : removePlaced(n.id))} title={cableMode ? "Tap to wire" : "Tap to remove"}>
                <DeviceIcon kind={n.kind} size={40} active={isNodeConnected(n.id)} ok={verifyResult === true} />
                <span className={`dcn1-label ${isNodeConnected(n.id) ? "connected" : ""}`}>{n.id}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="canvas-actions">
          <button type="button" className="btn-verify" onClick={handleVerify}>▶ Verify Layout</button>
          <button type="button" className="btn-reset" onClick={handleReset}>↺ Reset</button>
        </div>
      </div>

      <aside className="card analysis-panel">
        <ReferenceDiagram />
        <h3 className="panel-heading orange">Result</h3>
        <div className="analysis-block"><h4 className="analysis-sub">Placement</h4><p className="conclusion-text">{placed.length}/{TOTAL_REQUIRED} devices placed</p></div>
        <div className="analysis-block"><h4 className="analysis-sub">Wiring</h4><p className="conclusion-text">{connections.length}/{TOTAL_LINKS} links made</p></div>
        {verifyResult !== null && (
          <div className="analysis-block">
            <h4 className="analysis-sub">Conclusion</h4>
            <p className="conclusion-text">{verifyResult ? "✅ Correct Network Infrastructure Layout." : "❌ Layout incorrect — recheck wiring."}</p>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
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

export default function DCNExperiment1() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState("identify");
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procOpen, setProcOpen] = useState(false);

  const [identified, setIdentified] = useState(new Set());
  const [placed, setPlaced] = useState([]);
  const [connections, setConnections] = useState([]);
  const [cableMode, setCableMode] = useState(false);
  const [pendingNode, setPendingNode] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  const [errorPopup, setErrorPopup] = useState(null);
  const [successPopup, setSuccessPopup] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const showError = (title, message) => setErrorPopup({ title, message });
  const allIdentified = identified.size === CATALOG.length;
  const layoutVerified = verifyResult === true;
  const canSubmit = allIdentified && layoutVerified;

const handleFinalSubmit = () => {
  if (!allIdentified) {
    showError(
      "Experiment Incomplete",
      "Complete Step 1 — Identify all network components first."
    );
    return;
  }

  if (!layoutVerified) {
    showError(
      "Experiment Incomplete",
      "Complete Step 2 — Verify the lab layout wiring first."
    );
    return;
  }

  if (submitted) return;

  setSubmitted(true);

  navigate("/dcn-result", {
    state: {
      experimentNo: 1,
      experimentName:
        "Survey Existing Network Infrastructure and Draw Layout of Computer Network Lab",
      experimentRoute: "/dcn-experiment-1",
    },
  });
};

  const goToStep = (step) => {
    if (step === "layout" && !allIdentified) { showError("Identification Incomplete", "Please identify every device before moving to the Layout step."); return; }
    setScreen(step);
  };

  return (
    <div className="DCNExperiment1-root">
      <header className="exp-header">
        <button
  type="button"
  className="btn-back"
  onClick={() => navigate("/dcn-experiments")}
>
  ← Back
</button>

        <h1 className="exp-title">Experiment 1 : Survey Existing Network Infrastructure of Computer Network Lab</h1>
        <InlineHelp
          title="Experiment 1 Help"
          items={[
            "Identify each network device shown in the lab and review its role and specifications.",
            "Complete the device identification step before opening the layout activity.",
            "Arrange the devices to represent the lab network layout, then submit the experiment.",
          ]}
        />
      </header>

      <section className="card aim-card">
        <h2 className="section-heading orange">Aim</h2>
        <p>To observe the various components of the network in your Computer Network Lab, study each device in detail, and draw the layout of the lab.</p>
      </section>

      <section className="card collapsible-card">
        <div className="collapsible-header" onClick={() => setTheoryOpen(!theoryOpen)}>
          <h2 className="section-heading orange">Theory</h2>
          <span className="chevron">{theoryOpen ? "▲" : "▼"}</span>
        </div>
        {theoryOpen && (
          <div className="collapsible-body">
            <p>A network infrastructure consists of hardware such as routers, switches, printers, access points and cabling that together enable communication within a lab.</p>
            <p>Every device operates at a specific layer of the OSI model and performs a distinct role — from raw signal transmission to intelligent packet routing between networks.</p>
            <p>Surveying the infrastructure means identifying every device, understanding its specification, and mapping how it is physically wired to draw an accurate lab layout.</p>
          </div>
        )}
      </section>

      <section className="card collapsible-card">
        <div className="collapsible-header" onClick={() => setProcOpen(!procOpen)}>
          <h2 className="section-heading orange">Procedure</h2>
          <span className="chevron">{procOpen ? "▲" : "▼"}</span>
        </div>
        {procOpen && (
          <div className="collapsible-body proc-grid">
            <ol className="proc-col">
              <li><b>Step 1 — Identify:</b> Tap each device card and study its specs, photos and function.</li>
              <li>Complete all 5 devices before proceeding.</li>
              <li><b>Step 2 — Layout:</b> Drag every device onto the lab floor plan.</li>
              <li>Use the LAN Cable tool to wire PCs, Printer and AP to the Switch, and Switch to Router.</li>
            </ol>
            <ol className="proc-col" start={5}>
              <li>Click "Verify Layout" to confirm correct wiring.</li>
              <li>Submit the experiment after identifying all devices and verifying the layout.</li>
            </ol>
          </div>
        )}
      </section>

      <div className="dcn1-step-tabs">
        <button type="button" className={`dcn1-step-tab ${screen === "identify" ? "active" : ""}`} onClick={() => setScreen("identify")}>1. Identify {allIdentified && "✓"}</button>
        <button type="button" className={`dcn1-step-tab ${screen === "layout" ? "active" : ""}`} onClick={() => goToStep("layout")}>2. Layout {layoutVerified && "✓"}</button>
      </div>

      {screen === "identify" && (<IdentifyScreen identified={identified} setIdentified={setIdentified} onProceed={() => goToStep("layout")} showError={showError} />)}
      {screen === "layout" && (
        <LayoutScreen placed={placed} setPlaced={setPlaced} connections={connections} setConnections={setConnections} cableMode={cableMode} setCableMode={setCableMode} pendingNode={pendingNode} setPendingNode={setPendingNode} verifyResult={verifyResult} setVerifyResult={setVerifyResult} showError={showError} setSuccessPopup={setSuccessPopup} />
      )}


      <section className="card table-section">
        <h2 className="section-heading orange">Observation Table</h2>
        <table className="obs-table compact">
          <thead><tr><th>Stage</th><th>Status</th></tr></thead>
          <tbody>
            <tr className={allIdentified ? "row-verified" : ""}><td>Device Identification</td><td className={allIdentified ? "status-verified" : "status-pending"}>{allIdentified ? "Completed" : "Pending"}</td></tr>
            <tr className={layoutVerified ? "row-verified" : ""}><td>Lab Layout Wiring</td><td className={layoutVerified ? "status-verified" : "status-pending"}>{layoutVerified ? "Verified" : "Pending"}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="submit-section">
        <button type="button" className={`btn-submit ${canSubmit && !submitted ? "enabled" : "disabled"}`} onClick={handleFinalSubmit} disabled={!canSubmit || submitted}>Submit Experiment</button>
      </section>

      {errorPopup && (<Modal tone="error" title={"⚠ " + errorPopup.title} onClose={() => setErrorPopup(null)} actionLabel="Okay"><p>{errorPopup.message}</p></Modal>)}
      {successPopup && (<Modal tone="success" title="✅ Correct Network Infrastructure" onClose={() => setSuccessPopup(false)} actionLabel="Continue"><p>All devices are correctly identified and wired as per the standard LAN layout.</p></Modal>)}
    </div>
  );
}