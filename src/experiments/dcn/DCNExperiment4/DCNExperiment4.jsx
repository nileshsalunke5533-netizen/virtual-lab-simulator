import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DCNExperiment4.css";
import NetworkDiagrams from "./NetworkDiagrams";

/* ────────────────────────────────────────────────────────────────────────────
   Image imports
   NOTE: adjust the relative path below to match where this file actually
   lives relative to src/assets/dcn/networkDevices/. If you place this file
   at src/pages/dcn/DCNExperiment4.jsx the path stays "../../assets/...".
   If it lives directly under src/, use "../assets/...".
──────────────────────────────────────────────────────────────────────────── */
const deviceImageModules = import.meta.glob(
  "../../../assets/dcn/networkDevices/*.png",
  { eager: true }
);
const realViewImageModules = import.meta.glob(
  "../../../assets/dcn//real-view/*.png",
  { eager: true }
);

function getImage(modules, filename) {
  const entry = Object.entries(modules).find(([path]) => path.endsWith(filename));
  return entry ? entry[1].default : "";
}

/* ────────────────────────────────────────────────────────────────────────────
   Device data
──────────────────────────────────────────────────────────────────────────── */
const DEVICES = [
  {
    key: "router",
    name: "Router",
    purpose: "Connects different networks and routes data packets between them.",
    workingPrinciple:
      "Operates at Network layer (Layer 3) and uses routing tables to forward data to the best path.",
    specifications: [
      "Ports: 4 LAN, 1 WAN",
      "Speed: 10/100/1000 Mbps",
      "Protocols: IP, ICMP, RIP, OSPF, BGP",
      "Frequency: 2.4 GHz / 5 GHz",
      "Power: 12V DC",
    ],
    applications: "Internet sharing, connecting LAN to WAN, branch office connectivity, VPN.",
  },
  {
    key: "switch",
    name: "Switch",
    purpose: "Connects multiple devices within the same network and forwards data only to the intended recipient.",
    workingPrinciple:
      "Operates at Data Link layer (Layer 2) and uses MAC address tables to switch frames to the correct port.",
    specifications: [
      "Ports: 24/48 Gigabit",
      "Speed: 10/100/1000 Mbps",
      "Switching capacity: up to 100 Gbps",
      "Supports VLAN tagging",
      "Power: PoE / 12V DC",
    ],
    applications: "LAN segmentation, connecting computers, printers and servers within an office.",
  },
  {
    key: "hub",
    name: "Hub",
    purpose: "Connects multiple devices in a network and broadcasts data to every connected port.",
    workingPrinciple:
      "Operates at Physical layer (Layer 1) with no intelligence; simply repeats incoming signals to all ports.",
    specifications: [
      "Ports: 4/8/16",
      "Speed: 10/100 Mbps",
      "Half-duplex operation",
      "No MAC address awareness",
      "Power: 5V/9V DC",
    ],
    applications: "Small legacy networks, basic device connectivity for testing and labs.",
  },
  {
    key: "bridge",
    name: "Bridge",
    purpose: "Connects two similar network segments and filters traffic based on MAC addresses.",
    workingPrinciple:
      "Operates at Data Link layer (Layer 2); inspects frame MAC addresses to decide whether to forward or block them.",
    specifications: [
      "Ports: 2 (dual-port)",
      "Speed: 10/100 Mbps",
      "Filtering: MAC address table",
      "Reduces collision domains",
      "Power: 12V DC",
    ],
    applications: "Segmenting large LANs, extending network reach while reducing traffic congestion.",
  },
  {
    key: "gateway",
    name: "Gateway",
    purpose: "Connects two networks using different protocols and translates data between them.",
    workingPrinciple:
      "Operates across multiple OSI layers (up to Layer 7), performing protocol conversion between dissimilar networks.",
    specifications: [
      "Protocol translation: TCP/IP, IPX, SNA",
      "Speed: up to 1 Gbps",
      "Supports firewall / NAT functions",
      "Application-aware filtering",
      "Power: 12V DC",
    ],
    applications: "Connecting an internal network to the internet, linking dissimilar network architectures.",
  },
  {
    key: "modem",
    name: "Modem",
    purpose: "Modulates and demodulates signals to enable digital data transmission over analog lines.",
    workingPrinciple:
      "Converts digital signals from a computer into analog signals for transmission and back again at the receiving end.",
    specifications: [
      "Type: DSL / Cable / Fiber ONT",
      "Speed: up to 1 Gbps (fiber)",
      "Interfaces: RJ11 / Coaxial / Ethernet",
      "Supports PPPoE authentication",
      "Power: 12V DC",
    ],
    applications: "Providing internet connectivity from an ISP line to a home or office router.",
  },
  {
    key: "repeater",
    name: "Repeater",
    purpose: "Regenerates and amplifies a network signal to extend its transmission distance.",
    workingPrinciple:
      "Operates at Physical layer (Layer 1); receives a weakened signal, boosts it, and retransmits it further.",
    specifications: [
      "Range extension: up to 100m (wired)",
      "Speed: matches source signal",
      "No data filtering capability",
      "Supports wired and wireless variants",
      "Power: 5V/9V DC",
    ],
    applications: "Extending Wi-Fi coverage, boosting signal over long cable runs.",
  },
  {
    key: "access-point",
    name: "Access Point",
    purpose: "Allows wireless devices to connect to a wired network using Wi-Fi.",
    workingPrinciple:
      "Operates at Data Link layer (Layer 2); bridges wireless clients to the wired LAN over radio frequencies.",
    specifications: [
      "Standard: Wi-Fi 5 / Wi-Fi 6",
      "Frequency: 2.4 GHz / 5 GHz",
      "Speed: up to 1.2 Gbps",
      "Supports multiple SSIDs",
      "Power: PoE / 12V DC",
    ],
    applications: "Wireless internet access in homes, offices, campuses and public hotspots.",
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Assessment questions
──────────────────────────────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    text: "Which network device operates at Layer 3 and forwards data using routing tables?",
    options: ["Router", "Hub", "Repeater", "Modem"],
    answer: 0,
    deviceKey: "router",
  },
  {
    text: "Which device forwards frames only to the intended port using MAC address tables?",
    options: ["Hub", "Switch", "Gateway", "Modem"],
    answer: 1,
    deviceKey: "switch",
  },
  {
    text: "Which device simply broadcasts incoming signals to every connected port with no intelligence?",
    options: ["Bridge", "Router", "Hub", "Access Point"],
    answer: 2,
    deviceKey: "hub",
  },
  {
    text: "Which network control device is used to connect two similar networks and filters data based on MAC addresses?",
    options: ["Router", "Switch", "Bridge", "Repeater"],
    answer: 2,
    deviceKey: "bridge",
  },
  {
    text: "Which device connects two networks using different protocols and performs protocol translation?",
    options: ["Gateway", "Hub", "Repeater", "Switch"],
    answer: 0,
    deviceKey: "gateway",
  },
  {
    text: "Which device converts digital signals to analog and back for transmission over telephone or cable lines?",
    options: ["Router", "Modem", "Bridge", "Access Point"],
    answer: 1,
    deviceKey: "modem",
  },
  {
    text: "Which device regenerates and amplifies a signal to extend the transmission distance?",
    options: ["Repeater", "Gateway", "Switch", "Hub"],
    answer: 0,
    deviceKey: "repeater",
  },
  {
    text: "Which device allows wireless devices to join a wired network over Wi-Fi?",
    options: ["Modem", "Bridge", "Access Point", "Router"],
    answer: 2,
    deviceKey: "access-point",
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Small inline network diagram (Internet → Device → Devices)
──────────────────────────────────────────────────────────────────────────── */


/* ────────────────────────────────────────────────────────────────────────────
   Main component
──────────────────────────────────────────────────────────────────────────── */
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

export default function DCNExperiment4() {
  const navigate = useNavigate();

  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procedureOpen, setProcedureOpen] = useState(false);

  const [explored, setExplored] = useState(new Set([DEVICES[0].key]));
  const [selectedKey, setSelectedKey] = useState(DEVICES[0].key);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});

  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const selectedDevice = DEVICES.find((d) => d.key === selectedKey);
  const question = QUESTIONS[currentQ];

  const allExplored = explored.size === DEVICES.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUESTIONS.length;
  const canSubmit = allExplored && allAnswered && !submitted;

  function handleSelectDevice(key) {
    setSelectedKey(key);
    setExplored((prev) => new Set(prev).add(key));
  }

  function handleSelectOption(optionIndex) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [currentQ]: optionIndex }));
  }

  function handlePrev() {
    setCurrentQ((q) => Math.max(0, q - 1));
  }

  function handleNext() {
    setCurrentQ((q) => Math.min(QUESTIONS.length - 1, q + 1));
  }


function handleSubmit() {
  if (!canSubmit) return;

  let s = 0;

  QUESTIONS.forEach((q, i) => {
    if (answers[i] === q.answer) s += 1;
  });

  setScore(s);
  setSubmitted(true);

  navigate("/dcn-result", {
    state: {
      experimentNo: 4,
      experimentName:
        "Identify Network Control Devices and Study Their Specifications",
      experimentRoute: "/dcn-experiment-4",
      score: s,
      totalQuestions: QUESTIONS.length,
    },
  });
}


  return (
    <div className="dcnexperiment4-root">
      {/* ── Header ── */}
      <div className="exp-header">
        <button
  type="button"
  className="btn-back"
  onClick={() => navigate("/dcn-experiments")}
>
  ← Back
</button>
        <div className="exp-title">Experiment 4 : Identify Network Control Devices and Study Their Specifications</div>
        <InlineHelp
          title="Experiment 4 Help"
          items={[
            "Review each network control device and match it with its function.",
            "Inspect the device specifications and compare its intended use in the network.",
            "Complete the experiment questions and submit to view the result.",
          ]}
        />
      </div>

      {/* ── Aim ── */}
      <div className="card">
        <div className="section-heading orange">Aim</div>
        <p>
          To identify different network control devices and study their purpose, working principle,
          specifications and applications.
        </p>
      </div>

      {/* ── Theory ── */}
      <div className="card">
        <div className="collapsible-header" onClick={() => setTheoryOpen((o) => !o)}>
          <div className="section-heading orange">Theory</div>
          <span className={`chevron ${theoryOpen ? "open" : ""}`}>▼</span>
        </div>
        {theoryOpen && (
          <div className="collapsible-body">
            <p>
              Network control devices are hardware components that manage, control and direct the flow
              of data in a computer network.
            </p>
            <p>
              Each device performs a specific task based on the OSI model. Some devices forward packets,
              some connect network segments, while others extend communication range or provide wireless
              access.
            </p>
            <p>
              Understanding the purpose, specifications and practical use of these devices is essential
              for designing, troubleshooting and maintaining computer networks.
            </p>
          </div>
        )}
      </div>

      {/* ── Procedure ── */}
      <div className="card">
        <div className="collapsible-header" onClick={() => setProcedureOpen((o) => !o)}>
          <div className="section-heading orange">Procedure</div>
          <span className={`chevron ${procedureOpen ? "open" : ""}`}>▼</span>
        </div>
        {procedureOpen && (
          <div className="collapsible-body proc-grid">
            <ol className="proc-col">
              <li>Expand the Device Exploration section.</li>
              <li>Click on a network device.</li>
              <li>Observe its image carefully.</li>
              <li>Study its purpose and working principle.</li>
              <li>Read its specifications.</li>
            </ol>
            <ol className="proc-col" start={6}>
              <li>Understand its practical applications.</li>
              <li>Repeat for all remaining devices.</li>
              <li>After exploring all devices, complete the assessment.</li>
              <li>Submit the experiment to view the result.</li>
            </ol>
          </div>
        )}
      </div>

      {/* ── Device Exploration ── */}
      <div className="card">
        <div className="explore-head-row">
          <div className="section-heading" style={{ color: "var(--blue-header)" }}>
            Device Exploration
          </div>
          <div className="explore-progress-pill">
            Explored {explored.size} / {DEVICES.length}
          </div>
        </div>
        <div className="explore-hint">Click on any device to explore its information.</div>

        <div className="device-grid" style={{ marginTop: 14 }}>
          {DEVICES.map((d) => {
            const isDone = explored.has(d.key);
            const isSelected = selectedKey === d.key;
            return (
              <div
                key={d.key}
                className={`device-card ${isDone ? "explored" : ""} ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectDevice(d.key)}
              >
                <span className={`device-status-dot ${isDone ? "done" : "pending"}`}>
                  {isDone ? "✓" : ""}
                </span>
                <div className="device-thumb-box">
                  <img src={getImage(deviceImageModules, `${d.key}.png`)} alt={d.name} />
                </div>
                <div className="device-name">{d.name}</div>
                <div className={`device-underline ${isDone ? "done" : ""}`} />
              </div>
            );
          })}
        </div>

        {/* ── Selected device panel ── */}
        {selectedDevice && (
          <>
            <div style={{ marginTop: 20, display: "flex", alignItems: "center" }}>
              <div className="section-heading" style={{ color: "var(--blue-header)", marginBottom: 0 }}>
                Selected Device
              </div>
              <span className="selected-badge">You are viewing: {selectedDevice.name}</span>
            </div>

            <div className="selected-device-row">
              {/* Device image */}
              <div className="device-panel-col">
                <div className="device-panel-title">Device Image</div>
                <div className="device-image-box">
                  <img
                    src={getImage(deviceImageModules, `${selectedDevice.key}.png`)}
                    alt={selectedDevice.name}
                  />
                </div>
              </div>

              {/* Device info */}
              <div className="device-panel-col">
                <div className="device-panel-title">Device Information</div>
                <div className="info-row">
                  <div className="info-icon">◆</div>
                  <div>
                    <div className="info-label">Purpose</div>
                    <div className="info-text">{selectedDevice.purpose}</div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon">⚙</div>
                  <div>
                    <div className="info-label">Working Principle</div>
                    <div className="info-text">{selectedDevice.workingPrinciple}</div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon">✕</div>
                  <div>
                    <div className="info-label">Specifications</div>
                    <div className="info-text">
                      <ul>
                        {selectedDevice.specifications.map((spec, i) => (
                          <li key={i}>{spec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon">▦</div>
                  <div>
                    <div className="info-label">Applications</div>
                    <div className="info-text">{selectedDevice.applications}</div>
                  </div>
                </div>
              </div>

              {/* Real world view + diagram */}
              <div className="device-panel-col">
                <div className="device-panel-title">Real World View</div>
                <div className="real-world-box">
                  <img
                    src={getImage(realViewImageModules, `${selectedDevice.key}-real-view.png`)}
                    alt={`${selectedDevice.name} real world view`}
                  />
                </div>
                <div className="device-panel-title" style={{ marginTop: 4 }}>
                  Network Diagram
                </div>
                <div className="diagram-box">
                 <NetworkDiagrams deviceKey={selectedDevice.key} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Assessment ── */}
      <div className="card">
        <div className="assessment-head-row">
          <div className="section-heading" style={{ color: "var(--blue-header)", marginBottom: 0 }}>
            Assessment
          </div>
          <span className="question-pill">
            Question {currentQ + 1} of {QUESTIONS.length}
          </span>
        </div>

        <div className="assessment-body">
          <div className="assessment-device-thumb">
            <img
              src={getImage(deviceImageModules, `${question.deviceKey}.png`)}
              alt={question.deviceKey}
            />
          </div>
          <div className="assessment-question-block">
            <div className="question-text">{question.text}</div>
            <div className="options-list">
              {question.options.map((opt, i) => (
                <div
                  key={i}
                  className={`option-row ${answers[currentQ] === i ? "selected" : ""}`}
                  onClick={() => handleSelectOption(i)}
                >
                  <span className="option-radio" />
                  <span>
                    {String.fromCharCode(65 + i)}. {opt}
                  </span>
                </div>
              ))}
            </div>

            <div className="assessment-nav">
              <button className="btn-prev" onClick={handlePrev} disabled={currentQ === 0}>
                ← Previous
              </button>
              <button
                className="btn-next"
                onClick={handleNext}
                disabled={currentQ === QUESTIONS.length - 1}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="submit-section">
        <button
          className={`btn-submit ${canSubmit || submitted ? "enabled" : "disabled"}`}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Submit Experiment
        </button>
        <div className="submit-status">
          {submitted ? (
            <span className="submit-success">
              ✓ Submitted! Score: {score} / {QUESTIONS.length}
            </span>
          ) : allExplored && allAnswered ? (
            "All set — click submit to view your result."
          ) : (
            `Explore all devices (${explored.size}/${DEVICES.length}) and answer all questions (${answeredCount}/${QUESTIONS.length}) to unlock submission.`
          )}
        </div>
      </div>
    </div>
  );
}