import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DCNExperiment9.css";

// ─────────────────────────────────────────────────────────────
// Screen order (used to compute progress for the observation table)
// ─────────────────────────────────────────────────────────────
const SCREEN_ORDER = [
  "desktop",
  "control",
  "netCategory",
  "network",
  "adapterList",
  "adapter",
  "properties",
  "install",
  "ip",
  "saved",
  "test",
  "completed",
];

const OBS_STEPS = [
  { label: "Open Control Panel", threshold: "control" },
  { label: "Open Network and Internet", threshold: "netCategory" },
  { label: "Open Network and Sharing Center", threshold: "network" },
  { label: "Open Network Connections", threshold: "adapterList" },
  { label: "Select Ethernet Adapter", threshold: "adapter" },
  { label: "Open Ethernet Properties", threshold: "properties" },
  { label: "Install TCP/IP", threshold: "install" },
  { label: "Configure IP Address", threshold: "saved" },
  { label: "Test Connection", threshold: "test" },
];

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
  install: { icon: "⏳", title: "Installing TCP/IP Protocol", dialog: true },
  ip: { icon: "🌐", title: "Internet Protocol Version 4 (TCP/IPv4) Properties", dialog: true },
  saved: { icon: "✅", title: "Network Settings", dialog: true },
  test: { icon: "⬛", title: "Command Prompt", dialog: true },
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

function DCNExperiment9() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState("desktop");
  const [submitted, setSubmitted] = useState(false);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procOpen, setProcOpen] = useState(false);

  const screenIndex = SCREEN_ORDER.indexOf(screen);
  const isDone = (threshold) => screenIndex >= SCREEN_ORDER.indexOf(threshold);
  const allDone = screenIndex >= SCREEN_ORDER.indexOf("test");
  const doneCount = OBS_STEPS.filter((s) => isDone(s.threshold)).length;

const handleSubmit = () => {
  if (!allDone || submitted) return;

  setSubmitted(true);

  navigate("/dcn-result", {
    state: {
      experimentNo: 9,
      experimentName: "Installation of TCP/IP Protocol",
      experimentRoute: "/dcn-experiment-9",
    },
  });
};

  return (
    <div className="DCNExperiment9-root">
      {/* Header */}
      <header className="exp-header">
       <button
  type="button"
  className="btn-back"
  onClick={() => navigate("/dcn-experiments")}
>
  ← Back
</button>

        <h1 className="exp-title">Experiment 9 : Installation of TCP/IP Protocol</h1>

        <InlineHelp
          title="Experiment 9 Help"
          items={[
            "Open the network adapter settings in the simulation.",
            "Install or enable the TCP/IP protocol and review its properties.",
            "Apply the configuration and verify that the adapter reports the expected protocol status.",
          ]}
        />
      </header>

      {/* Aim */}
      <section className="card aim-card">
        <h2 className="section-heading orange">Aim</h2>
        <p>To install and configure TCP/IP protocol on a computer system.</p>
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
              TCP/IP (Transmission Control Protocol / Internet Protocol) is the standard communication
              protocol used in computer networks.
            </p>
            <p>
              It enables communication between devices connected to a network by defining how data is
              addressed, transmitted, routed, and received.
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
              <li>Open Network Connections.</li>
            </ol>

            <ol className="proc-col" start={5}>
              <li>Select Ethernet Adapter and open Properties.</li>
              <li>Install TCP/IP.</li>
              <li>Configure IP Address.</li>
              <li>Test Connection.</li>
            </ol>
          </div>
        )}
      </section>

      {/* Simulation Row */}
      <div className="sim-row">
        {/* Left: Progress Panel */}
        <aside className="card inputs-panel">
          <h3 className="panel-heading">Progress</h3>

          <p className="input-hint">Work through Control Panel to configure and test TCP/IP.</p>

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
                    <span>🖥 Your PC</span>
                    <span className="netmap-line">──────</span>
                    <span>🌐 Internet</span>
                  </div>

                  <p className="window-subtext">
                    View your active network — <strong>Home Network</strong> (Ethernet)
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

                    <button type="button" className="btn-verify" onClick={() => setScreen("install")}>
                      Install TCP/IP
                    </button>
                  </div>
                </WindowChrome>
              )}

              {/* ───── INSTALLING (dialog) ───── */}
              {screen === "install" && (
                <WindowChrome screenKey="install" onClose={() => setScreen("desktop")}>
                  <h3>Please wait...</h3>

                  <div className="loading-box">
                    <div className="loading-bar"></div>
                  </div>

                  <p>Installing Internet Protocol (TCP/IP)...</p>

                  <button type="button" className="btn-verify" onClick={() => setScreen("ip")}>
                    Next
                  </button>
                </WindowChrome>
              )}

              {/* ───── IPv4 CONFIG (dialog) ───── */}
              {screen === "ip" && (
                <WindowChrome screenKey="ip" onClose={() => setScreen("desktop")}>
                  <div className="ip-form">
                    <label>
                      IP Address
                      <input type="text" defaultValue="192.168.1.10" />
                    </label>

                    <label>
                      Subnet Mask
                      <input type="text" defaultValue="255.255.255.0" />
                    </label>

                    <label>
                      Default Gateway
                      <input type="text" defaultValue="192.168.1.1" />
                    </label>

                    <label>
                      Preferred DNS Server
                      <input type="text" defaultValue="8.8.8.8" />
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

                  <h2>TCP/IP Configuration Saved Successfully</h2>

                  <p>IP Address and Network Settings have been saved successfully.</p>

                  <div className="btn-group">
                    <button type="button" className="btn-verify" onClick={() => setScreen("test")}>
                      Test Connection
                    </button>
                  </div>
                </WindowChrome>
              )}

              {/* ───── TEST (dialog) ───── */}
              {screen === "test" && (
                <WindowChrome screenKey="test" onClose={() => setScreen("desktop")}>
                  <div className="terminal">
                    <p>C:\Users\Admin&gt; ping 192.168.1.1</p>
                    <br />
                    <p>Reply from 192.168.1.1:</p>
                    <p>Bytes = 32 Time &lt;1ms TTL = 128</p>

                    <p>Reply from 192.168.1.1:</p>
                    <p>Bytes = 32 Time &lt;1ms TTL = 128</p>

                    <p>Reply from 192.168.1.1:</p>
                    <p>Bytes = 32 Time &lt;1ms TTL = 128</p>

                    <p>Reply from 192.168.1.1:</p>
                    <p>Bytes = 32 Time &lt;1ms TTL = 128</p>

                    <hr />
                    <p>Packets : Sent = 4</p>
                    <p>Received = 4</p>
                    <p>Lost = 0 (0% loss)</p>
                  </div>

                  <div className="result-box success">✅ Connection Successful</div>

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

                  <h2>TCP/IP Installation Completed Successfully</h2>

                  <div className="result-card">
                    <p>✔ TCP/IP Installed</p>
                    <p>✔ IP Address Configured</p>
                    <p>✔ Gateway Configured</p>
                    <p>✔ DNS Configured</p>
                    <p>✔ Connection Tested Successfully</p>
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
              {screen === "install" && "Installing TCP/IP protocol..."}
              {screen === "ip" && "Configuring IPv4 address."}
              {screen === "saved" && "Configuration saved."}
              {screen === "test" && "Testing connection with ping."}
              {screen === "completed" && "All steps completed."}
            </p>
          </div>

          {allDone && (
            <div className="analysis-block">
              <h4 className="analysis-sub">Conclusion</h4>
              <p className="conclusion-text">
                TCP/IP protocol was installed, configured, and tested successfully. The connection test
                confirmed 0% packet loss.
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
          <p className="submit-hint">Reach the "Test Connection" step to enable Submit.</p>
        )}

        {submitted && <p className="submitted-note">✅ Submitted successfully</p>}
      </section>
    </div>
  );
}

export default DCNExperiment9;