import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DCNExperiment10.css";

const SCREEN_ORDER = [
  "desktop",
  "control",
  "netCategory",
  "network",
  "adapterList",
  "adapter",
  "properties",
  "ipConfig",
  "saved",
  "ipconfigCheck",
  "testPing",
  "completed",
];

const OBS_STEPS = [
  { label: "Open Control Panel", threshold: "control" },
  { label: "Open Network and Internet", threshold: "netCategory" },
  { label: "Open Network and Sharing Center", threshold: "network" },
  { label: "Open Network Connections", threshold: "adapterList" },
  { label: "Select Ethernet Adapter", threshold: "adapter" },
  { label: "Open TCP/IPv4 Properties", threshold: "properties" },
  { label: "Configure IP for PC-A & PC-B", threshold: "ipConfig" },
  { label: "Save Network Configuration", threshold: "saved" },
  { label: "Verify using ipconfig", threshold: "ipconfigCheck" },
  { label: "Test LAN connectivity (ping)", threshold: "testPing" },
];

// ─────────────────────────────────────────────────────────────
// Step guidance shown above the canvas — tells the student exactly
// what to do next, so a student on a real PC and a student on this
// web app follow the identical sequence of actions.
// ─────────────────────────────────────────────────────────────
const STEP_GUIDE = {
  desktop: "Double-click the Control Panel icon on the desktop to begin.",
  control: "Click on the Network and Internet category.",
  netCategory: "Click on Network and Sharing Center.",
  network: "Click on Change adapter settings.",
  adapterList: "Click on the Ethernet adapter.",
  adapter: "Click on Properties to open Ethernet Properties.",
  properties:
    "Select 'Internet Protocol Version 4 (TCP/IPv4)' and click Properties to configure the IP address.",
  ipConfig:
    "Switch between PC-A and PC-B, enter an IP Address and Subnet Mask for each in the same network range, then click Save.",
  saved: "Click Verify Configuration to check the settings using ipconfig.",
  ipconfigCheck: "Click Test Connectivity to ping PC-B from PC-A.",
  testPing: "Click Finish once the ping reply confirms LAN connectivity.",
  completed: "Experiment completed! Click Perform Again to redo it, or scroll down to Submit.",
};

// ─────────────────────────────────────────────────────────────
// Meta info for window chrome (title bar + breadcrumb) per screen
// ─────────────────────────────────────────────────────────────
const WINDOW_META = {
  control: {
    icon: "🗂",
    title: "Control Panel",
    crumb: ["Control Panel"],
  },
  netCategory: {
    icon: "🌐",
    title: "Network and Internet",
    crumb: ["Control Panel", "Network and Internet"],
  },
  network: {
    icon: "🌐",
    title: "Network and Sharing Center",
    crumb: ["Control Panel", "Network and Internet", "Network and Sharing Center"],
  },
  adapterList: {
    icon: "🔌",
    title: "Network Connections",
    crumb: ["Control Panel", "Network and Internet", "Network and Sharing Center", "Network Connections"],
  },
  adapter: {
    icon: "🌐",
    title: "Ethernet Status",
    crumb: ["Control Panel", "Network and Internet", "Network Connections", "Ethernet Status"],
  },
  properties: {
    icon: "⚙",
    title: "Ethernet Properties",
    crumb: ["Control Panel", "Network and Internet", "Network Connections", "Ethernet Status", "Properties"],
  },
  ipConfig: { icon: "🌐", title: "Internet Protocol Version 4 (TCP/IPv4) Properties", dialog: true },
  saved: { icon: "✅", title: "Network Settings", dialog: true },
  ipconfigCheck: { icon: "⬛", title: "Command Prompt - ipconfig", dialog: true },
  testPing: { icon: "⬛", title: "Command Prompt - ping", dialog: true },
  completed: { icon: "🎉", title: "Experiment Completed", dialog: true },
};

// ─────────────────────────────────────────────────────────────
// Reusable "real OS window" chrome — title bar + breadcrumb
// ─────────────────────────────────────────────────────────────
function WindowChrome({ screenKey, onClose, children }) {
  const meta = WINDOW_META[screenKey];
  if (!meta) return children;

  return (
    <div className={`win ${meta.dialog ? "win-dialog" : ""}`}>
      {/* Title bar */}
      <div className="win-titlebar">
        <div className="win-title-left">
          <span className="win-title-icon">{meta.icon}</span>
          <span className="win-title-text">{meta.title}</span>
        </div>
        <div className="win-controls">
          <button type="button" className="win-btn win-min" title="Minimize">
            ─
          </button>
          <button type="button" className="win-btn win-max" title="Maximize">
            □
          </button>
          <button type="button" className="win-btn win-close" title="Close" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {/* Breadcrumb address bar (Explorer-style windows only) */}
      {!meta.dialog && (
        <div className="win-breadcrumb">
          <span className="crumb-arrow">←</span>
          <span className="crumb-arrow disabled">→</span>
          <div className="crumb-path">
            {meta.crumb.map((c, i) => (
              <span key={c} className="crumb-part">
                {i > 0 && <span className="crumb-sep">›</span>}
                {c}
              </span>
            ))}
          </div>
          <div className="crumb-search">🔍 Search</div>
        </div>
      )}

      <div className="win-body">{children}</div>
    </div>
  );
}

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

function DCNExperiment10() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState("desktop");
  const [submitted, setSubmitted] = useState(false);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procOpen, setProcOpen] = useState(false);

  // Two-node LAN state
  const [activePC, setActivePC] = useState("A");
  const [pcA, setPcA] = useState({ ip: "192.168.1.10", subnet: "255.255.255.0" });
  const [pcB, setPcB] = useState({ ip: "192.168.1.11", subnet: "255.255.255.0" });

  const current = activePC === "A" ? pcA : pcB;
  const setCurrent = activePC === "A" ? setPcA : setPcB;

  const screenIndex = SCREEN_ORDER.indexOf(screen);
  const isDone = (threshold) => screenIndex >= SCREEN_ORDER.indexOf(threshold);
  const allDone = screenIndex >= SCREEN_ORDER.indexOf("testPing");
  const doneCount = OBS_STEPS.filter((s) => isDone(s.threshold)).length;

const handleSubmit = () => {
  if (!allDone || submitted) return;

  setSubmitted(true);

  navigate("/dcn-result", {
    state: {
      experimentNo: 10,
      experimentName: "Implementing a TCP/IP Network Configuration",
      experimentRoute: "/dcn-experiment-10",
    },
  });
};

  return (
    <div className="DCNExperiment10-root">
      {/* Header */}
      <header className="exp-header">
      <button
  type="button"
  className="btn-back"
  onClick={() => navigate("/dcn-experiments")}
>
  ← Back
</button>

        <h1 className="exp-title">Experiment 10 : Implementing a TCP/IP Network Configuration</h1>

        <InlineHelp
          title="Experiment 10 Help"
          items={[
            "Configure a unique IP address and the matching subnet mask for each computer.",
            "Ensure both computers use addresses in the same network range.",
            "Apply the settings and use the available connectivity checks to verify communication.",
          ]}
        />
      </header>

      {/* Aim */}
      <section className="card aim-card">
        <h2 className="section-heading orange">Aim</h2>
        <p>To configure LAN using TCP/IP protocol and implement a TCP/IP network configuration between two computers.</p>
      </section>

      {/* Theory */}
      <section className="card collapsible-card">
        <div className="collapsible-header" onClick={() => setTheoryOpen(!theoryOpen)}>
          <h2 className="section-heading orange">Theory</h2>
          <span className="chevron">{theoryOpen ? "▲" : "▼"}</span>
        </div>

        {theoryOpen && (
          <div className="collapsible-body">
            <p>
              To connect computers in a Local Area Network (LAN) using TCP/IP, every computer must be
              assigned a unique <strong>IP Address</strong> from the same network range, along with a
              matching <strong>Subnet Mask</strong>. The subnet mask decides which part of the IP address
              identifies the network and which part identifies the host.
            </p>
            <p>
              Since the computers communicate directly within the same LAN, a default gateway is not
              required. After configuration, the <strong>ipconfig</strong> command is used to verify the
              assigned settings, and the <strong>ping</strong> command is used to test whether the
              computers can reach each other over the network.
            </p>
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
              <li>Open Control Panel.</li>
              <li>Open Network and Internet.</li>
              <li>Open Network and Sharing Center.</li>
              <li>Open Network Connections (Change adapter settings).</li>
            </ol>

            <ol className="proc-col" start={5}>
              <li>Select Ethernet Adapter → Properties → TCP/IPv4 Properties.</li>
              <li>Assign IP Address and Subnet Mask to PC-A and PC-B in the same network.</li>
              <li>Save the configuration and verify using ipconfig.</li>
              <li>Test connectivity between PC-A and PC-B using ping.</li>
            </ol>
          </div>
        )}
      </section>

      {/* Simulation Row */}
      <div className="sim-row">
        {/* Left: Progress Panel */}
        <aside className="card inputs-panel">
          <h3 className="panel-heading">Progress</h3>

          <p className="input-hint">Configure both PCs on the same LAN, then verify connectivity.</p>

          <h4 className="analysis-sub">Steps {doneCount}/{OBS_STEPS.length}</h4>

          {OBS_STEPS.map((step) => {
            const done = isDone(step.threshold);
            return (
              <div key={step.label} className="toggle-row">
                <span className="toggle-label">{step.label}</span>
                <span className={done ? "status-verified" : "status-pending"}>{done ? "●" : "○"}</span>
              </div>
            );
          })}
        </aside>

        {/* Center: Simulation Canvas (acts like a monitor screen) */}
        <div className="card canvas-panel">
          <h3 className="panel-heading">Simulation Canvas</h3>

          {/* Step guidance banner — same instructions whether performed on a real PC or here */}
          <div className="step-guide">
            <span className="step-guide-icon">👉</span>
            <div className="step-guide-text">
              <span className="step-guide-count">Next step</span>
              <strong>{STEP_GUIDE[screen]}</strong>
            </div>
          </div>

          <div className="canvas-area os-screen">
            <div className="os-desktop-area">
              {/* ───── DESKTOP ───── */}
              {screen === "desktop" && (
                <div className="desktop">
                  <div className="desktop-icon" onClick={() => setScreen("control")}>
                    <div className="desktop-icon-glyph">⚙</div>
                    <span>Control Panel</span>
                  </div>

                  <div className="desktop-icon disabled">
                    <div className="desktop-icon-glyph">🖥</div>
                    <span>This PC</span>
                  </div>

                  <div className="desktop-icon disabled">
                    <div className="desktop-icon-glyph">🌐</div>
                    <span>Network</span>
                  </div>

                  <div className="desktop-icon disabled">
                    <div className="desktop-icon-glyph">🗑</div>
                    <span>Recycle Bin</span>
                  </div>

                  <div className="desktop-icon disabled">
                    <div className="desktop-icon-glyph">🛠</div>
                    <span>Settings</span>
                  </div>
                </div>
              )}

              {/* ───── CONTROL PANEL CATEGORIES ───── */}
              {screen === "control" && (
                <WindowChrome screenKey="control" onClose={() => setScreen("desktop")}>
                  <p className="window-subtext">Adjust your computer's settings</p>

                  <div className="cp-grid">
                    <div className="cp-card active" onClick={() => setScreen("netCategory")}>
                      <div className="cp-icon">🌐</div>
                      <span>Network and Internet</span>
                    </div>

                    <div className="cp-card disabled">
                      <div className="cp-icon">🛡</div>
                      <span>System and Security</span>
                    </div>

                    <div className="cp-card disabled">
                      <div className="cp-icon">📦</div>
                      <span>Programs</span>
                    </div>

                    <div className="cp-card disabled">
                      <div className="cp-icon">👤</div>
                      <span>User Accounts</span>
                    </div>

                    <div className="cp-card disabled">
                      <div className="cp-icon">🎨</div>
                      <span>Appearance and Personalization</span>
                    </div>

                    <div className="cp-card disabled">
                      <div className="cp-icon">🔊</div>
                      <span>Hardware and Sound</span>
                    </div>

                    <div className="cp-card disabled">
                      <div className="cp-icon">🕒</div>
                      <span>Clock and Region</span>
                    </div>

                    <div className="cp-card disabled">
                      <div className="cp-icon">♿</div>
                      <span>Ease of Access</span>
                    </div>
                  </div>
                </WindowChrome>
              )}

              {/* ───── NETWORK AND INTERNET CATEGORY ───── */}
              {screen === "netCategory" && (
                <WindowChrome screenKey="netCategory" onClose={() => setScreen("desktop")}>
                  <div className="netcat-list">
                    <div className="netcat-item active" onClick={() => setScreen("network")}>
                      <span className="netcat-icon">🌐</span>
                      <div>
                        <strong>Network and Sharing Center</strong>
                        <p>View network status and tasks</p>
                      </div>
                    </div>

                    <div className="netcat-item disabled">
                      <span className="netcat-icon">👥</span>
                      <div>
                        <strong>HomeGroup</strong>
                        <p>Change HomeGroup settings</p>
                      </div>
                    </div>

                    <div className="netcat-item disabled">
                      <span className="netcat-icon">🧭</span>
                      <div>
                        <strong>Internet Options</strong>
                        <p>Change your homepage or manage browser add-ons</p>
                      </div>
                    </div>
                  </div>

                  <div className="btn-group">
                    <button type="button" className="btn-reset" onClick={() => setScreen("control")}>
                      Back
                    </button>
                  </div>
                </WindowChrome>
              )}

              {/* ───── NETWORK AND SHARING CENTER ───── */}
              {screen === "network" && (
                <WindowChrome screenKey="network" onClose={() => setScreen("desktop")}>
                  <div className="netmap-box">
                    <span>🖥 PC-A</span>
                    <span className="netmap-line">──────</span>
                    <span>🖥 PC-B</span>
                  </div>

                  <p className="window-subtext">
                    View your active network — <strong>Local Area Network</strong> (Ethernet, 2 computers)
                  </p>

                  <div className="cp-sidebar-link" onClick={() => setScreen("adapterList")}>
                    ⚡ Change adapter settings
                  </div>
                  <div className="cp-sidebar-link disabled">🔧 Change advanced sharing settings</div>
                  <div className="cp-sidebar-link disabled">📶 Manage wireless networks</div>

                  <div className="btn-group">
                    <button type="button" className="btn-reset" onClick={() => setScreen("netCategory")}>
                      Back
                    </button>
                  </div>
                </WindowChrome>
              )}

              {/* ───── NETWORK CONNECTIONS (MULTIPLE ADAPTERS) ───── */}
              {screen === "adapterList" && (
                <WindowChrome screenKey="adapterList" onClose={() => setScreen("desktop")}>
                  <div className="adapter-list">
                    <div className="adapter-item active" onClick={() => setScreen("adapter")}>
                      <div className="adapter-item-icon">🌐</div>
                      <div>
                        <h4>Ethernet</h4>
                        <p>Connected</p>
                      </div>
                    </div>

                    <div className="adapter-item disabled">
                      <div className="adapter-item-icon">📶</div>
                      <div>
                        <h4>Wi-Fi</h4>
                        <p>Not connected</p>
                      </div>
                    </div>

                    <div className="adapter-item disabled">
                      <div className="adapter-item-icon">📡</div>
                      <div>
                        <h4>Bluetooth Network Connection</h4>
                        <p>Not connected</p>
                      </div>
                    </div>
                  </div>

                  <div className="btn-group">
                    <button type="button" className="btn-reset" onClick={() => setScreen("network")}>
                      Back
                    </button>
                  </div>
                </WindowChrome>
              )}

              {/* ───── ETHERNET ADAPTER STATUS ───── */}
              {screen === "adapter" && (
                <WindowChrome screenKey="adapter" onClose={() => setScreen("desktop")}>
                  <div className="adapter-card">
                    <div className="adapter-icon">🌐</div>
                    <div>
                      <h3>Ethernet</h3>
                      <p>Status : Connected</p>
                      <p>Speed : 100 Mbps</p>
                    </div>
                  </div>

                  <div className="btn-group">
                    <button type="button" className="btn-reset" onClick={() => setScreen("adapterList")}>
                      Back
                    </button>
                    <button type="button" className="menu-btn" onClick={() => setScreen("properties")}>
                      Properties
                    </button>
                  </div>
                </WindowChrome>
              )}

              {/* ───── ETHERNET PROPERTIES ───── */}
              {screen === "properties" && (
                <WindowChrome screenKey="properties" onClose={() => setScreen("desktop")}>
                  <h3>This connection uses:</h3>

                  <div className="checkbox-list">
                    <label>
                      <input type="checkbox" checked readOnly />
                      Client for Microsoft Networks
                    </label>

                    <label>
                      <input type="checkbox" checked readOnly />
                      File and Printer Sharing
                    </label>

                    <label>
                      <input type="checkbox" checked readOnly />
                      Internet Protocol Version 4 (TCP/IPv4)
                    </label>

                    <label>
                      <input type="checkbox" />
                      Internet Protocol Version 6 (TCP/IPv6)
                    </label>
                  </div>

                  <div className="btn-group">
                    <button type="button" className="btn-reset" onClick={() => setScreen("adapter")}>
                      Back
                    </button>

                    <button type="button" className="btn-verify" onClick={() => setScreen("ipConfig")}>
                      Configure IPv4
                    </button>
                  </div>
                </WindowChrome>
              )}

              {/* ───── IP CONFIG FOR TWO-NODE LAN (dialog) ───── */}
              {screen === "ipConfig" && (
                <WindowChrome screenKey="ipConfig" onClose={() => setScreen("desktop")}>
                  <div className="pc-tabs">
                    <div
                      className={`pc-tab configured ${activePC === "A" ? "active" : ""}`}
                      onClick={() => setActivePC("A")}
                    >
                      💻 PC - A
                    </div>
                    <div
                      className={`pc-tab configured ${activePC === "B" ? "active" : ""}`}
                      onClick={() => setActivePC("B")}
                    >
                      💻 PC - B
                    </div>
                  </div>

                  <p className="window-subtext">
                    Assign an IP address to <strong>{activePC === "A" ? "PC-A" : "PC-B"}</strong> in the same
                    network range so both computers can communicate over the LAN.
                  </p>

                  <div className="ip-form">
                    <label>
                      IP Address
                      <input
                        type="text"
                        value={current.ip}
                        onChange={(e) => setCurrent({ ...current, ip: e.target.value })}
                      />
                    </label>

                    <label>
                      Subnet Mask
                      <input
                        type="text"
                        value={current.subnet}
                        onChange={(e) => setCurrent({ ...current, subnet: e.target.value })}
                      />
                    </label>
                  </div>

                  <div className="btn-group">
                    <button type="button" className="btn-reset" onClick={() => setScreen("properties")}>
                      Back
                    </button>

                    <button type="button" className="btn-verify" onClick={() => setScreen("saved")}>
                      Save Configuration
                    </button>
                  </div>
                </WindowChrome>
              )}

              {/* ───── SAVED (dialog) ───── */}
              {screen === "saved" && (
                <WindowChrome screenKey="saved" onClose={() => setScreen("desktop")}>
                  <div className="success-icon">✅</div>

                  <h2>TCP/IP Network Configuration Saved</h2>

                  <div className="policy-summary">
                    <span className="policy-summary-group-label">PC-A</span>
                    <div className="policy-chip">
                      <span>IP Address</span>
                      <span>{pcA.ip}</span>
                    </div>
                    <div className="policy-chip">
                      <span>Subnet Mask</span>
                      <span>{pcA.subnet}</span>
                    </div>

                    <span className="policy-summary-group-label">PC-B</span>
                    <div className="policy-chip">
                      <span>IP Address</span>
                      <span>{pcB.ip}</span>
                    </div>
                    <div className="policy-chip">
                      <span>Subnet Mask</span>
                      <span>{pcB.subnet}</span>
                    </div>
                  </div>

                  <div className="btn-group">
                    <button type="button" className="btn-verify" onClick={() => setScreen("ipconfigCheck")}>
                      Verify Configuration
                    </button>
                  </div>
                </WindowChrome>
              )}

              {/* ───── IPCONFIG CHECK (dialog) ───── */}
              {screen === "ipconfigCheck" && (
                <WindowChrome screenKey="ipconfigCheck" onClose={() => setScreen("desktop")}>
                  <div className="terminal">
                    <p className="terminal-heading">C:\Users\PC-A&gt; ipconfig</p>
                    <p>Ethernet adapter Ethernet:</p>
                    <p>&nbsp;&nbsp;IPv4 Address. . . . . . . . . . . : {pcA.ip}</p>
                    <p>&nbsp;&nbsp;Subnet Mask . . . . . . . . . . . : {pcA.subnet}</p>

                    <hr className="terminal-divider" />

                    <p className="terminal-heading">C:\Users\PC-B&gt; ipconfig</p>
                    <p>Ethernet adapter Ethernet:</p>
                    <p>&nbsp;&nbsp;IPv4 Address. . . . . . . . . . . : {pcB.ip}</p>
                    <p>&nbsp;&nbsp;Subnet Mask . . . . . . . . . . . : {pcB.subnet}</p>
                  </div>

                  <div className="result-box success">✅ Both computers are configured on the same network</div>

                  <div className="btn-group">
                    <button type="button" className="btn-reset" onClick={() => setScreen("saved")}>
                      Back
                    </button>
                    <button type="button" className="btn-verify" onClick={() => setScreen("testPing")}>
                      Test Connectivity
                    </button>
                  </div>
                </WindowChrome>
              )}

              {/* ───── TEST PING (dialog) ───── */}
              {screen === "testPing" && (
                <WindowChrome screenKey="testPing" onClose={() => setScreen("desktop")}>
                  <div className="terminal">
                    <p>C:\Users\PC-A&gt; ping {pcB.ip}</p>
                    <br />
                    <p>Reply from {pcB.ip}:</p>
                    <p>Bytes = 32 Time &lt;1ms TTL = 128</p>

                    <p>Reply from {pcB.ip}:</p>
                    <p>Bytes = 32 Time &lt;1ms TTL = 128</p>

                    <p>Reply from {pcB.ip}:</p>
                    <p>Bytes = 32 Time &lt;1ms TTL = 128</p>

                    <p>Reply from {pcB.ip}:</p>
                    <p>Bytes = 32 Time &lt;1ms TTL = 128</p>

                    <hr className="terminal-divider" />
                    <p>Packets : Sent = 4</p>
                    <p>Received = 4</p>
                    <p>Lost = 0 (0% loss)</p>
                  </div>

                  <div className="result-box success">
                    ✅ PC-A successfully communicates with PC-B over the LAN
                  </div>

                  <div className="btn-group">
                    <button type="button" className="btn-verify" onClick={() => setScreen("completed")}>
                      Finish
                    </button>
                  </div>
                </WindowChrome>
              )}

              {/* ───── COMPLETED (dialog) ───── */}
              {screen === "completed" && (
                <WindowChrome screenKey="completed" onClose={() => setScreen("desktop")}>
                  <div className="success-icon big">🎉</div>

                  <h2>TCP/IP Network Configuration Completed Successfully</h2>

                  <div className="result-card">
                    <p>✔ IP Address Configured for PC-A ({pcA.ip})</p>
                    <p>✔ IP Address Configured for PC-B ({pcB.ip})</p>
                    <p>✔ Network Configuration Saved</p>
                    <p>✔ Verified Using ipconfig</p>
                    <p>✔ LAN Connectivity Tested Successfully (ping)</p>
                  </div>

                  <div className="btn-group">
                    <button type="button" className="btn-reset" onClick={() => setScreen("desktop")}>
                      ↺ Perform Again
                    </button>
                  </div>
                </WindowChrome>
              )}
            </div>
          </div>
        </div>

        {/* Right: Result Panel */}
        <aside className="card analysis-panel">
          <h3 className="panel-heading orange">Result</h3>

          <div className="analysis-block">
            <h4 className="analysis-sub">Current Step</h4>
            <p className="conclusion-text">
              {screen === "desktop" && "Open Control Panel to begin."}
              {screen === "control" && "Control Panel opened."}
              {screen === "netCategory" && "Network and Internet category opened."}
              {screen === "network" && "Network and Sharing Center opened."}
              {screen === "adapterList" && "Network Connections opened."}
              {screen === "adapter" && "Ethernet Adapter selected."}
              {screen === "properties" && "Reviewing Ethernet Properties."}
              {screen === "ipConfig" && `Configuring IP address for ${activePC === "A" ? "PC-A" : "PC-B"}.`}
              {screen === "saved" && "Network configuration saved for both computers."}
              {screen === "ipconfigCheck" && "Verifying configuration using ipconfig."}
              {screen === "testPing" && "Testing LAN connectivity using ping."}
              {screen === "completed" && "All steps completed."}
            </p>
          </div>

          {allDone && (
            <div className="analysis-block">
              <h4 className="analysis-sub">Conclusion</h4>
              <p className="conclusion-text">
                PC-A ({pcA.ip}) and PC-B ({pcB.ip}) were configured with valid IP addresses in the same
                subnet ({pcA.subnet}). The configuration was verified using ipconfig, and connectivity
                between the two computers was confirmed with 0% packet loss using ping.
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
              <th>Step</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {OBS_STEPS.map((step, i) => {
              const done = isDone(step.threshold);
              return (
                <tr key={step.label} className={done ? "row-verified" : ""}>
                  <td>{i + 1}</td>
                  <td>{step.label}</td>
                  <td className={done ? "status-verified" : "status-pending"}>
                    {done ? "Completed" : "Pending"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Submit */}
      <section className="submit-section-wrap">
        <div className="submit-section">
          <button
            type="button"
            className={`btn-submit ${allDone && !submitted ? "enabled" : "disabled"}`}
            onClick={handleSubmit}
            disabled={!allDone || submitted}
          >
            Submit
          </button>
        </div>

        {!allDone && (
          <p className="submit-hint">Reach the "Test Connectivity" step to enable Submit.</p>
        )}

        {submitted && <p className="submitted-note">✅ Submitted successfully</p>}
      </section>
    </div>
  );
}

export default DCNExperiment10;
