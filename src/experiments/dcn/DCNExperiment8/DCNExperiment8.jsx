import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./DCNExperiment8.css";

// ─────────────────────────────────────────────────────────────
// Required commands for this experiment (order shown in Progress /
// Observation Table). "open" completes the moment the terminal window
// is opened; the rest complete the moment a matching command is typed
// into the simulated Command Prompt — in any order, exactly like a
// real terminal.
// ─────────────────────────────────────────────────────────────
const OBS_STEPS = [
  { id: "open", label: "Open Command Prompt" },
  { id: "ipconfig", label: "Check IP configuration (ipconfig)" },
  { id: "ping", label: "Test connectivity (ping)" },
  { id: "tracert", label: "Trace the route (tracert)" },
  { id: "nslookup", label: "Resolve a domain name (nslookup)" },
  { id: "netstat", label: "View active connections (netstat)" },
  { id: "telnet", label: "Test a port / service (telnet)" },
];

// Matched on the command's first word only (case-insensitive) — an
// argument may or may not follow. This is deliberately lenient: as
// long as the student types the right command, the step is marked
// done, regardless of exact spacing/flags/arguments used.
const COMMAND_TO_STEP = {
  ipconfig: "ipconfig",
  ping: "ping",
  tracert: "tracert",
  traceroute: "tracert",
  nslookup: "nslookup",
  netstat: "netstat",
  telnet: "telnet",
};

const QUICK_COMMANDS = [
  { label: "ipconfig", value: "ipconfig" },
  { label: "ipconfig /all", value: "ipconfig /all" },
  { label: "ping google.com", value: "ping google.com" },
  { label: "tracert google.com", value: "tracert google.com" },
  { label: "nslookup college.edu", value: "nslookup college.edu" },
  { label: "netstat", value: "netstat" },
  { label: "telnet college.edu 80", value: "telnet college.edu 80" },
];

// ─────────────────────────────────────────────────────────────
// Window chrome meta (title bar only — terminal / completed are dialogs)
// ─────────────────────────────────────────────────────────────
const WINDOW_META = {
  terminal: { icon: "⬛", title: "Command Prompt — C:\\Windows\\system32\\cmd.exe", dialog: true },
  completed: { icon: "🎉", title: "Experiment Completed", dialog: true },
};

function WindowChrome({ screenKey, onClose, children }) {
  const meta = WINDOW_META[screenKey];
  if (!meta) return children;

  return (
    <div className={`win ${meta.dialog ? "win-dialog" : ""}`}>
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
      <div className="win-body">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Fake-but-consistent network data helpers
// ─────────────────────────────────────────────────────────────
const HOSTNAME = "LAB-PC07";
const LOCAL_IP = "192.168.1.47";
const GATEWAY = "192.168.1.1";
const MAC = "3C-84-6A-9F-2B-1D";

function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function fakeIpFor(host) {
  const s = seedFromString(host.toLowerCase());
  return `${142 + (s % 40)}.${(s >> 3) % 256}.${(s >> 7) % 256}.${1 + ((s >> 11) % 253)}`;
}
function jitterMs(seed, i) {
  return 8 + ((seed >> (i % 20)) % 55);
}

const KNOWN_HOSTS = {
  "google.com": "142.250.194.14",
  "www.google.com": "142.250.194.14",
  "youtube.com": "142.250.195.78",
  "college.edu": "203.192.14.55",
  localhost: "127.0.0.1",
};

function resolveHost(host) {
  const h = host.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1") return "127.0.0.1";
  return KNOWN_HOSTS[h] || fakeIpFor(h);
}

const HELP_TEXT = `Supported commands for this experiment:
  ipconfig            show basic IP configuration
  ipconfig /all        show detailed adapter configuration
  ping <host>          send ICMP echo requests to <host>
  ping -t <host>       ping continuously until Ctrl+C (type stop)
  tracert <host>       trace the route packets take to <host>
  nslookup <host>      query DNS for <host>
  netstat              show active connections
  telnet <host> <port> open a TCP session to <host> on <port>
  cls / clear          clear the screen
  help                 show this help text`;

function buildIpconfig(all) {
  if (!all) {
    return [
      "",
      "Windows IP Configuration",
      "",
      "Ethernet adapter Ethernet0:",
      "",
      "   Connection-specific DNS Suffix  . : college.local",
      `   IPv4 Address. . . . . . . . . . . : ${LOCAL_IP}`,
      "   Subnet Mask . . . . . . . . . . . : 255.255.255.0",
      `   Default Gateway . . . . . . . . . : ${GATEWAY}`,
      "",
    ].join("\n");
  }
  return [
    "",
    "Windows IP Configuration",
    "",
    `   Host Name . . . . . . . . . . . . : ${HOSTNAME}`,
    "   Primary Dns Suffix  . . . . . . . : college.local",
    "   Node Type . . . . . . . . . . . . : Hybrid",
    "   IP Routing Enabled. . . . . . . . : No",
    "",
    "Ethernet adapter Ethernet0:",
    "",
    "   Connection-specific DNS Suffix  . : college.local",
    "   Description . . . . . . . . . . . : Realtek PCIe GbE Family Controller",
    `   Physical Address. . . . . . . . . : ${MAC}`,
    "   DHCP Enabled. . . . . . . . . . . : Yes",
    "   Autoconfiguration Enabled . . . . : Yes",
    `   IPv4 Address. . . . . . . . . . . : ${LOCAL_IP}(Preferred)`,
    "   Subnet Mask . . . . . . . . . . . : 255.255.255.0",
    `   Default Gateway . . . . . . . . . : ${GATEWAY}`,
    "   DHCP Server . . . . . . . . . . . : 192.168.1.1",
    "   DNS Servers . . . . . . . . . . . : 8.8.8.8",
    "                                       8.8.4.4",
    "",
  ].join("\n");
}

function buildPing(host, count, seed) {
  const ip = resolveHost(host);
  const lines = [`Pinging ${host} [${ip}] with 32 bytes of data:`, ""];
  const times = [];
  let lost = 0;
  for (let i = 0; i < count; i++) {
    const drop = (seed + i) % 17 === 0;
    if (drop) {
      lines.push("Request timed out.");
      lost++;
    } else {
      const t = jitterMs(seed, i);
      times.push(t);
      lines.push(`Reply from ${ip}: bytes=32 time=${t}ms TTL=118`);
    }
  }
  lines.push("");
  lines.push(`Ping statistics for ${ip}:`);
  const sent = count;
  const received = count - lost;
  lines.push(
    `    Packets: Sent = ${sent}, Received = ${received}, Lost = ${lost} (${Math.round(
      (lost / sent) * 100
    )}% loss),`
  );
  if (times.length) {
    lines.push("Approximate round trip times in milli-seconds:");
    lines.push(
      `    Minimum = ${Math.min(...times)}ms, Maximum = ${Math.max(
        ...times
      )}ms, Average = ${Math.round(times.reduce((a, b) => a + b, 0) / times.length)}ms`
    );
  }
  return lines.join("\n");
}

function buildTracert(host, seed) {
  const destIp = resolveHost(host);
  const hops = 4 + (seed % 6);
  const lines = [`Tracing route to ${host} [${destIp}]`, "over a maximum of 30 hops:", ""];
  for (let i = 1; i <= hops; i++) {
    const isLast = i === hops;
    const hopIp = isLast
      ? destIp
      : `10.${(seed + i) % 256}.${(seed * i) % 256}.${1 + (i % 250)}`;
    const t1 = jitterMs(seed, i);
    const t2 = jitterMs(seed, i + 1);
    const t3 = jitterMs(seed, i + 2);
    const label = isLast ? host : i === 1 ? "gateway.college.local" : `hop-${i}.isp-network.net`;
    lines.push(
      `  ${i}    ${t1} ms    ${t2} ms    ${t3} ms  ${hopIp}  ${i <= 2 ? "[" + label + "]" : ""}`.trimEnd()
    );
  }
  lines.push("");
  lines.push("Trace complete.");
  return lines.join("\n");
}

function buildNslookup(host) {
  const ip = resolveHost(host);
  return [
    "Server:  dns.college.local",
    "Address:  8.8.8.8",
    "",
    "Non-authoritative answer:",
    `Name:    ${host}`,
    `Address:  ${ip}`,
  ].join("\n");
}

function buildNetstat() {
  return [
    "",
    "Active Connections",
    "",
    "  Proto  Local Address          Foreign Address        State",
    "  TCP    192.168.1.47:52341     142.250.194.14:443     ESTABLISHED",
    "  TCP    192.168.1.47:52360     203.192.14.55:80       TIME_WAIT",
    "  TCP    192.168.1.47:445       0.0.0.0:0              LISTENING",
    "  TCP    192.168.1.47:139       0.0.0.0:0              LISTENING",
    "",
  ].join("\n");
}

function buildTelnetOpen(host, port) {
  const closedPorts = ["21", "23"];
  if (closedPorts.includes(port)) {
    return {
      lines: [`Connecting To ${host}...Could not open connection to the host, on port ${port}: Connect failed`],
      sessionOpen: false,
    };
  }
  return {
    lines: [
      `Connecting To ${host}...`,
      "",
      "Trying " + resolveHost(host) + "...",
      `Connected to ${host}.`,
      "Escape character is '^]'.",
      "",
      "*** Session established. Type 'exit' to close the connection. ***",
    ],
    sessionOpen: true,
  };
}

let lineIdCounter = 0;
function nextId() {
  lineIdCounter += 1;
  return lineIdCounter;
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

function DCNExperiment8() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState("desktop");
  const [submitted, setSubmitted] = useState(false);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procOpen, setProcOpen] = useState(false);

  const [doneSteps, setDoneSteps] = useState(new Set());
  const [terminalHistory, setTerminalHistory] = useState([
    {
      id: nextId(),
      type: "system",
      text: `Microsoft Windows [Version 10.0.19045.4529]\n(c) College Networking Lab. All rights reserved.\n\nType 'help' to see the list of supported commands.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [cmdLog, setCmdLog] = useState([]);
  const [telnetSession, setTelnetSession] = useState(null);
  const [cmdHistoryList, setCmdHistoryList] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const [lastAction, setLastAction] = useState("");
  const [errorToast, setErrorToast] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const errorTimerRef = useRef(null);

  const showError = useCallback((message) => {
    setErrorToast(message);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorToast(null), 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const isDone = (id) => (id === "open" ? screen !== "desktop" || doneSteps.has("open") : doneSteps.has(id));
  const allDone = OBS_STEPS.every((s) => isDone(s.id));
  const doneCount = OBS_STEPS.filter((s) => isDone(s.id)).length;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [terminalHistory]);

  const focusInput = useCallback(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (screen === "terminal") focusInput();
  }, [screen, focusInput]);

  function pushLine(type, text) {
    setTerminalHistory((h) => [...h, { id: nextId(), type, text }]);
  }

  function runCommand(raw) {
    const trimmed = raw.trim();
    if (trimmed === "") return;

    pushLine("prompt", trimmed);
    setCmdLog((log) => [...log, trimmed]);

    if (telnetSession) {
      if (trimmed.toLowerCase() === "exit") {
        pushLine("output", "Connection to host lost.");
        setTelnetSession(null);
      } else {
        pushLine(
          "output",
          `'${trimmed}' — no such service configured on ${telnetSession.host}:${telnetSession.port} (simulated session)`
        );
        showError(`No such service on ${telnetSession.host}:${telnetSession.port}`);
      }
      return;
    }

    // check which required step this command satisfies — based only on
    // the first word typed, so any valid invocation counts
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const stepId = COMMAND_TO_STEP[cmd];
    if (stepId) {
      setDoneSteps((prev) => {
        const next = new Set(prev);
        next.add(stepId);
        return next;
      });
      const step = OBS_STEPS.find((s) => s.id === stepId);
      if (step) setLastAction(step.label + " — done.");
    }
    const seed = seedFromString(trimmed);

    switch (cmd) {
      case "help":
        pushLine("output", HELP_TEXT);
        break;

      case "cls":
      case "clear":
        setTerminalHistory([]);
        break;

      case "ipconfig":
        pushLine("output", buildIpconfig(parts[1] === "/all"));
        break;

      case "ping": {
        const isContinuous = parts[1] === "-t";
        const host = isContinuous ? parts[2] : parts[1];
        if (!host) {
          pushLine("output", "Usage: ping [-t] <host>");
          showError("ping needs a target — e.g. ping google.com");
          break;
        }
        pushLine(
          "output",
          buildPing(host, isContinuous ? 6 : 4, seed) +
            (isContinuous
              ? "\n\n(showing first 6 replies — real 'ping -t' repeats until you press Ctrl+C)"
              : "")
        );
        break;
      }

      case "tracert":
      case "traceroute": {
        const host = parts[1];
        if (!host) {
          pushLine("output", "Usage: tracert <host>");
          showError("tracert needs a target — e.g. tracert google.com");
          break;
        }
        pushLine("output", buildTracert(host, seed));
        break;
      }

      case "nslookup": {
        const host = parts[1];
        if (!host) {
          pushLine("output", "Usage: nslookup <host>");
          showError("nslookup needs a domain — e.g. nslookup college.edu");
          break;
        }
        pushLine("output", buildNslookup(host));
        break;
      }

      case "netstat":
        pushLine("output", buildNetstat());
        break;

      case "telnet": {
        const host = parts[1];
        const port = parts[2] || "23";
        if (!host) {
          pushLine("output", "Usage: telnet <host> <port>");
          showError("telnet needs a host and port — e.g. telnet college.edu 80");
          break;
        }
        const result = buildTelnetOpen(host, port);
        pushLine("output", result.lines.join("\n"));
        if (result.sessionOpen) {
          setTelnetSession({ host, port });
        } else {
          showError(`Could not connect to ${host} on port ${port}`);
        }
        break;
      }

      default:
        pushLine(
          "output",
          `'${parts[0]}' is not recognized as an internal or external command,\noperable program or batch file.`
        );
        showError(`'${parts[0]}' is not a recognized command`);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      runCommand(input);
      setCmdHistoryList((l) => [...l, input]);
      setHistoryPointer(-1);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistoryList.length === 0) return;
      const nextPointer = historyPointer === -1 ? cmdHistoryList.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextPointer);
      setInput(cmdHistoryList[nextPointer]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyPointer === -1) return;
      const nextPointer = historyPointer + 1;
      if (nextPointer >= cmdHistoryList.length) {
        setHistoryPointer(-1);
        setInput("");
      } else {
        setHistoryPointer(nextPointer);
        setInput(cmdHistoryList[nextPointer]);
      }
    }
  }

  function runQuick() {
    // Reference-only: these chips must NOT execute or fill the terminal.
    // Commands can only be run by actually typing them and pressing Enter.
    showError("Commands must be typed into the terminal yourself — clicking a suggestion won't run it.");
  }

const handleSubmit = () => {
  if (submitted) return;

  if (!allDone) {
    showError("Please run every required command before submitting.");
    return;
  }

  setSubmitted(true);

  navigate("/dcn-result", {
    state: {
      experimentNo: 8,
      experimentName: "Troubleshoot Computer Network using Commands",
      experimentRoute: "/dcn-experiment-8",
    },
  });
};

  return (
    <div className="DCNExperiment8-root">
      {errorToast && (
        <div className="error-toast" role="alert">
          ⚠ {errorToast}
        </div>
      )}

      {/* Header */}
      <header className="exp-header">
<button
  type="button"
  className="btn-back"
  onClick={() => navigate("/dcn-experiments")}
>
  ← Back
</button>

        <h1 className="exp-title">Experiment 8 : Troubleshoot Computer Network using Commands</h1>

        <InlineHelp
          title="Experiment 8 Help"
          items={[
            "Use the simulated terminal to run the available network troubleshooting commands.",
            "Try ipconfig to inspect settings, ping to test reachability, and tracert to view a route.",
            "Use nslookup for name resolution and netstat to inspect simulated connections; follow the terminal feedback.",
          ]}
        />
      </header>

      {/* Aim */}
      <section className="card aim-card">
        <h2 className="section-heading orange">Aim</h2>
        <p>
          To troubleshoot a computer network using command-line utilities such as ipconfig, ping,
          tracert, nslookup, netstat and telnet.
        </p>
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
              Network troubleshooting relies on a small set of command-line utilities built into
              every operating system. These commands let an administrator inspect a machine's own
              configuration, test whether a remote host is reachable, see the path packets take to
              get there, and verify whether a specific service is listening on a given port.
            </p>
            <p>
              <strong>ipconfig</strong> displays the IP address, subnet mask, and gateway assigned
              to the local machine. <strong>ping</strong> sends ICMP echo requests to check basic
              reachability. <strong>tracert</strong> reveals every hop between the source and
              destination. <strong>nslookup</strong> queries DNS to resolve a domain name to an IP
              address. <strong>netstat</strong> lists active TCP connections, and{" "}
              <strong>telnet</strong> opens a raw TCP session to test whether a particular port is
              open.
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
              <li>Open Command Prompt.</li>
              <li>Run ipconfig to view IP configuration.</li>
              <li>Run ping to test connectivity to a host.</li>
              <li>Run tracert to trace the route to a host.</li>
            </ol>

            <ol className="proc-col" start={5}>
              <li>Run nslookup to resolve a domain name.</li>
              <li>Run netstat to view active connections.</li>
              <li>Run telnet to test a specific port.</li>
              <li>Review the output and note your observations.</li>
            </ol>
          </div>
        )}
      </section>

      {/* Simulation Row */}
      <div className="sim-row">
        {/* Left: Progress Panel */}
        <aside className="card inputs-panel">
          <h3 className="panel-heading">Progress</h3>

          <p className="input-hint">Open Command Prompt and run each command to complete this experiment.</p>

          <h4 className="analysis-sub">
            Steps {doneCount}/{OBS_STEPS.length}
          </h4>

          {OBS_STEPS.map((step) => {
            const done = isDone(step.id);
            return (
              <div key={step.id} className="toggle-row">
                <span className="toggle-label">{step.label}</span>
                <span className={done ? "status-verified" : "status-pending"}>{done ? "●" : "○"}</span>
              </div>
            );
          })}
        </aside>

        {/* Center: Simulation Canvas */}
        <div className="card canvas-panel">
          <h3 className="panel-heading">Simulation Canvas</h3>

          <div className="canvas-area os-screen">
            <div className="os-desktop-area">
              {/* ───── DESKTOP ───── */}
              {screen === "desktop" && (
                <div className="desktop">
                  <div
                    className="desktop-icon"
                    onClick={() => {
                      setDoneSteps((prev) => new Set(prev).add("open"));
                      setScreen("terminal");
                    }}
                  >
                    <div className="desktop-icon-glyph">⬛</div>
                    <span>Command Prompt</span>
                  </div>

                  <div
                    className="desktop-icon disabled"
                    onClick={() => showError("'This PC' is not part of this experiment. Open Command Prompt to continue.")}
                  >
                    <div className="desktop-icon-glyph">🖥</div>
                    <span>This PC</span>
                  </div>

                  <div
                    className="desktop-icon disabled"
                    onClick={() => showError("'Network' is not part of this experiment. Open Command Prompt to continue.")}
                  >
                    <div className="desktop-icon-glyph">🌐</div>
                    <span>Network</span>
                  </div>

                  <div
                    className="desktop-icon disabled"
                    onClick={() => showError("'Recycle Bin' is not part of this experiment. Open Command Prompt to continue.")}
                  >
                    <div className="desktop-icon-glyph">🗑</div>
                    <span>Recycle Bin</span>
                  </div>

                  <div
                    className="desktop-icon disabled"
                    onClick={() => showError("'Settings' is not part of this experiment. Open Command Prompt to continue.")}
                  >
                    <div className="desktop-icon-glyph">🛠</div>
                    <span>Settings</span>
                  </div>
                </div>
              )}

              {/* ───── COMMAND PROMPT (dialog) ───── */}
              {screen === "terminal" && (
                <WindowChrome screenKey="terminal" onClose={() => setScreen("desktop")}>
                  <div className="terminal-screen" ref={scrollRef} onClick={focusInput}>
                    {terminalHistory.map((line) => (
                      <div key={line.id} className={`term-line term-${line.type}`}>
                        {line.type === "prompt" ? (
                          <>
                            <span className="term-prompt-lead">
                              {telnetSession ? `${telnetSession.host}>` : "C:\\Users\\Student>"}
                            </span>{" "}
                            {line.text}
                          </>
                        ) : (
                          <pre>{line.text}</pre>
                        )}
                      </div>
                    ))}
                    <div className="term-line term-inputline">
                      <span className="term-prompt-lead">
                        {telnetSession ? `${telnetSession.host}>` : "C:\\Users\\Student>"}
                      </span>
                      <input
                        ref={inputRef}
                        className="term-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        autoComplete="off"
                        aria-label="Command input"
                      />
                    </div>
                  </div>

                  <p className="quick-cmd-hint">Reference only — type these commands yourself:</p>
                  <div className="quick-cmd-row">
                    {QUICK_COMMANDS.map((q) => (
                      <button
                        key={q.value}
                        type="button"
                        className="quick-cmd-chip"
                        title="Type this command yourself — clicking will not run it"
                        onClick={runQuick}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>

                  <div className="btn-group">
                    <button type="button" className="btn-reset" onClick={() => setScreen("desktop")}>
                      Back
                    </button>

                    {allDone && (
                      <button type="button" className="btn-verify" onClick={() => setScreen("completed")}>
                        Finish
                      </button>
                    )}
                  </div>
                </WindowChrome>
              )}

              {/* ───── COMPLETED (dialog) ───── */}
              {screen === "completed" && (
                <WindowChrome screenKey="completed" onClose={() => setScreen("desktop")}>
                  <div className="success-icon big">🎉</div>

                  <h2>Network Troubleshooting Completed Successfully</h2>

                  <div className="result-card">
                    <p>✔ IP configuration checked (ipconfig)</p>
                    <p>✔ Connectivity tested (ping)</p>
                    <p>✔ Route traced (tracert)</p>
                    <p>✔ Domain name resolved (nslookup)</p>
                    <p>✔ Active connections viewed (netstat)</p>
                    <p>✔ Port connectivity tested (telnet)</p>
                  </div>

                  <div className="btn-group">
                    <button type="button" className="btn-reset" onClick={() => setScreen("terminal")}>
                      ↺ Back to Terminal
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
              {screen === "desktop" && "Open Command Prompt to begin."}
              {screen === "terminal" && (lastAction || "Type a command to get started (try 'help').")}
              {screen === "completed" && "All steps completed."}
            </p>
          </div>

          {cmdLog.length > 0 && (
            <div className="analysis-block">
              <h4 className="analysis-sub">Commands Run</h4>
              <ul className="cmd-log-list">
                {cmdLog.map((c, i) => (
                  <li key={i}>
                    <code>{c}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {allDone && (
            <div className="analysis-block">
              <h4 className="analysis-sub">Conclusion</h4>
              <p className="conclusion-text">
                All required network commands were executed successfully — the machine's
                configuration was inspected, connectivity and the route to a remote host were
                verified, a domain name was resolved, active connections were listed, and a
                specific port was tested.
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
              const done = isDone(step.id);
              return (
                <tr key={step.id} className={done ? "row-verified" : ""}>
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
            disabled={submitted}
          >
            Submit
          </button>
        </div>

        {!allDone && <p className="submit-hint">Run every listed command to enable Submit.</p>}

        {submitted && <p className="submitted-note">✅ Submitted successfully</p>}
      </section>
    </div>
  );
}

export default DCNExperiment8;
