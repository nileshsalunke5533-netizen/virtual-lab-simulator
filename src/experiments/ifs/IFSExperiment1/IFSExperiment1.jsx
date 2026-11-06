import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { buildIfsResult } from "../../../utils/ifsResult.js";
import "./IFSExperiment1.css";

/* =========================================================
   WINDOWS OS SECURITY FEATURE CATALOG
========================================================= */

const FEATURES = [
  {
    id: "defender-av",
    icon: "🛡️",
    name: "Windows Defender Antivirus",
    tagline: "Virus & Threat Protection",
    overview:
      "Windows Defender Antivirus is the built-in anti-malware engine included with Windows. It continuously scans files, downloads, and running processes to detect and remove viruses, worms, trojans, ransomware, and other malicious software.",
    howItWorks: [
      "Real-time protection scans files as they are opened, downloaded, or executed.",
      "Cloud-delivered protection checks suspicious files against Microsoft's threat database.",
      "Periodic full/quick scans check the entire system for dormant threats.",
      "Automatic sample submission helps Microsoft analyse new, unknown threats.",
    ],
    whereToFind:
      "Settings → Update & Security → Windows Security → Virus & threat protection",
    whyItMatters: [
      "Provides a baseline layer of protection with zero extra cost or installation.",
      "Automatically updates its virus definitions to detect newly discovered malware.",
      "Blocks known ransomware behaviour through 'Controlled folder access'.",
    ],
  },
  {
    id: "firewall",
    icon: "🧱",
    name: "Windows Defender Firewall",
    tagline: "Network Traffic Filtering",
    overview:
      "Windows Defender Firewall is a network security feature that monitors and controls incoming and outgoing network traffic based on a defined set of security rules, acting as a barrier between the device and untrusted networks.",
    howItWorks: [
      "Inbound rules control which unsolicited connections from the network are allowed to reach the device.",
      "Outbound rules control which apps on the device are allowed to send traffic out.",
      "Separate profiles exist for Domain, Private, and Public networks, each with its own rule set.",
      "Apps must be explicitly allowed through the firewall to receive inbound connections.",
    ],
    whereToFind:
      "Control Panel → System and Security → Windows Defender Firewall, or Settings → Network & Internet → Windows Firewall",
    whyItMatters: [
      "Blocks unsolicited inbound connections that could be used to probe or attack the device.",
      "Limits which applications can communicate over the network, reducing attack surface.",
      "Different rules for public Wi-Fi vs. trusted home/office networks add situational protection.",
    ],
  },
  {
    id: "uac",
    icon: "🔐",
    name: "User Account Control (UAC)",
    tagline: "Privilege Elevation Prompt",
    overview:
      "User Account Control is a security feature that prompts for permission or an administrator password before allowing changes that could affect the system, preventing unauthorized or unintended changes from being made silently.",
    howItWorks: [
      "Standard user actions run with limited (non-admin) privileges by default.",
      "When an action requires administrator rights, UAC shows a consent prompt on a secure desktop.",
      "The UAC slider lets users choose how strict the notification level should be.",
      "Malware attempting silent system changes is forced to trigger a visible prompt.",
    ],
    whereToFind:
      "Control Panel → User Accounts → Change User Account Control settings",
    whyItMatters: [
      "Stops malicious software from silently making administrator-level changes.",
      "Makes the user consciously aware of and consent to sensitive system changes.",
      "Reduces the impact of running daily tasks with a standard, non-admin account.",
    ],
  },
  {
    id: "bitlocker",
    icon: "💽",
    name: "BitLocker Drive Encryption",
    tagline: "Full Disk Encryption",
    overview:
      "BitLocker is a full-disk encryption feature that protects data by encrypting the entire drive. If a device with BitLocker enabled is lost or stolen, the data on the drive remains unreadable without the correct recovery key or password.",
    howItWorks: [
      "Encrypts the entire volume, not just individual files.",
      "Commonly works with a Trusted Platform Module (TPM) chip to securely store the encryption key.",
      "Generates a recovery key that must be saved separately (e.g. Microsoft account, USB, print).",
      "Automatically unlocks on a trusted device at normal startup, but requires the recovery key if the disk is moved to another device.",
    ],
    whereToFind:
      "Control Panel → System and Security → BitLocker Drive Encryption",
    whyItMatters: [
      "Protects sensitive data if a laptop is lost or stolen.",
      "Prevents someone from removing the drive and reading its data on another machine.",
      "Required by many organizational compliance and data-protection policies.",
    ],
  },
  {
    id: "windows-update",
    icon: "🔄",
    name: "Windows Update",
    tagline: "Security Patching",
    overview:
      "Windows Update automatically delivers operating system updates, including critical security patches that fix known vulnerabilities before attackers can exploit them.",
    howItWorks: [
      "Regularly checks Microsoft's servers for new updates.",
      "Security patches (like 'Patch Tuesday' updates) fix vulnerabilities discovered in Windows.",
      "Feature updates and quality updates are delivered on a rolling schedule.",
      "Devices can be configured to install updates automatically or on a scheduled restart.",
    ],
    whereToFind: "Settings → Update & Security → Windows Update",
    whyItMatters: [
      "Most real-world attacks exploit vulnerabilities that already have a patch available.",
      "Keeping a system updated closes known security holes before they're exploited.",
      "Delayed or disabled updates leave a system exposed to publicly known exploits.",
    ],
  },
  {
    id: "user-accounts",
    icon: "👤",
    name: "User Accounts & Permissions",
    tagline: "Least-Privilege Access",
    overview:
      "Windows supports multiple account types — Administrator and Standard — allowing the principle of least privilege: everyday tasks are performed with an account that has only the permissions it actually needs.",
    howItWorks: [
      "Administrator accounts can install software, change system settings, and manage other accounts.",
      "Standard accounts can run most applications but need admin approval for system-level changes.",
      "Multiple separate user accounts keep each person's files and settings isolated.",
      "Guest/limited accounts can be used for temporary or restricted access.",
    ],
    whereToFind: "Settings → Accounts → Family & other users",
    whyItMatters: [
      "Running daily tasks as a Standard user limits the damage malware can do if it runs.",
      "Separate accounts prevent one user from accessing another user's private files.",
      "Reduces the chance of accidental system-wide changes by everyday users.",
    ],
  },
  {
    id: "smartscreen",
    icon: "🌐",
    name: "App & Browser Control (SmartScreen)",
    tagline: "Malicious Site & App Filtering",
    overview:
      "Windows SmartScreen helps protect against phishing sites, malicious downloads, and unrecognized apps by checking URLs and files against a Microsoft-maintained reputation database before allowing them to run or load.",
    howItWorks: [
      "Checks websites visited in supported browsers against a list of known phishing/malware sites.",
      "Flags or blocks the download and execution of unrecognized or low-reputation apps.",
      "Warns before running an app from the internet that lacks an established reputation.",
      "Can be configured to Block, Warn, or be turned Off, depending on the desired protection level.",
    ],
    whereToFind: "Windows Security → App & browser control",
    whyItMatters: [
      "Blocks many phishing and drive-by-download attacks before they can execute.",
      "Adds a reputation-based layer of protection beyond signature-based antivirus scanning.",
      "Helps stop users from unknowingly running malicious, freshly-created executables.",
    ],
  },
];

/* =========================================================
   ASSIGNMENT QUESTION BANK
========================================================= */

const QUIZ = [
  {
    q: "What is the main purpose of Windows Defender Antivirus?",
    options: [
      "To manage user accounts",
      "To detect and remove malicious software such as viruses, worms, and ransomware",
      "To encrypt the hard drive",
      "To manage network firewall rules only",
    ],
    correct: 1,
  },
  {
    q: "Which Windows security feature primarily controls incoming and outgoing network traffic?",
    options: [
      "BitLocker",
      "User Account Control",
      "Windows Defender Firewall",
      "SmartScreen",
    ],
    correct: 2,
  },
  {
    q: "What triggers a User Account Control (UAC) prompt?",
    options: [
      "Opening any file",
      "Any action that requires administrator-level privileges",
      "Connecting to Wi-Fi",
      "Opening a browser tab",
    ],
    correct: 1,
  },
  {
    q: "What does BitLocker primarily protect against?",
    options: [
      "Slow internet speeds",
      "Unauthorized access to data if a drive is lost, stolen, or removed from the device",
      "Outdated software",
      "Weak Wi-Fi passwords",
    ],
    correct: 1,
  },
  {
    q: "Why is keeping Windows Update enabled considered a critical security practice?",
    options: [
      "It makes the computer boot faster",
      "It regularly delivers security patches that close known vulnerabilities",
      "It only updates the wallpaper and themes",
      "It disables the firewall automatically",
    ],
    correct: 1,
  },
  {
    q: "What is the principle of least privilege, as applied to Windows user accounts?",
    options: [
      "Every account should always be an Administrator",
      "Users should be given only the level of access they actually need for their tasks",
      "Only one account should exist per PC",
      "Standard accounts should never be used",
    ],
    correct: 1,
  },
  {
    q: "What does Windows SmartScreen primarily help protect against?",
    options: [
      "Slow hardware performance",
      "Phishing websites and unrecognized/malicious downloaded applications",
      "Power outages",
      "Hard drive failure",
    ],
    correct: 1,
  },
  {
    q: "Which component commonly works with BitLocker to securely store its encryption key?",
    options: [
      "Task Manager",
      "Trusted Platform Module (TPM)",
      "Windows Update",
      "Event Viewer",
    ],
    correct: 1,
  },
  {
    q: "If a Standard user tries to install new system-wide software, what typically happens?",
    options: [
      "It installs silently with no prompt",
      "A UAC prompt appears requesting administrator credentials or approval",
      "The action is always blocked with no option to proceed",
      "Windows Update installs it automatically",
    ],
    correct: 1,
  },
  {
    q: "What is 'Controlled folder access' in Windows Defender designed to prevent?",
    options: [
      "Unauthorized changes to files in protected folders, commonly used against ransomware",
      "Slow file copying speeds",
      "Users creating new folders",
      "Network connection drops",
    ],
    correct: 0,
  },
  {
    q: "Which of the following best differentiates a Public network firewall profile from a Private one?",
    options: [
      "Public profiles apply stricter rules since the network is untrusted, unlike a trusted private/home network",
      "There is no difference between the two",
      "Public profiles disable the firewall completely",
      "Private profiles are always less secure",
    ],
    correct: 0,
  },
  {
    q: "Why is 'cloud-delivered protection' in Windows Defender useful against brand-new malware?",
    options: [
      "It slows down malware execution only",
      "It can check suspicious files against Microsoft's up-to-date threat intelligence rather than only locally stored signatures",
      "It disables the internet connection when malware is found",
      "It has no real benefit over offline scanning",
    ],
    correct: 1,
  },
  {
    q: "What is a key risk of disabling Windows Update for a long period?",
    options: [
      "The system remains exposed to publicly known, already-patched vulnerabilities",
      "The computer becomes immediately faster",
      "All user files are deleted",
      "The firewall gets permanently disabled",
    ],
    correct: 0,
  },
  {
    q: "Which statement about UAC's 'secure desktop' is correct?",
    options: [
      "It runs the prompt in an isolated context so other running programs cannot automatically interact with it",
      "It changes the desktop wallpaper temporarily",
      "It disables all other running applications permanently",
      "It has no security benefit, only a visual one",
    ],
    correct: 0,
  },
  {
    q: "A user loses their laptop with BitLocker enabled and no separately saved recovery key. What is the likely consequence?",
    options: [
      "The data can still be read easily by anyone who has the laptop",
      "The encrypted data becomes practically inaccessible, since the recovery key is required",
      "BitLocker will email the user their key automatically",
      "The laptop will refuse to power on",
    ],
    correct: 1,
  },
  {
    q: "Which of these is NOT a typical function of Windows Defender Firewall?",
    options: [
      "Blocking unsolicited inbound network connections",
      "Encrypting files stored on the hard drive",
      "Allowing outbound rules for specific applications",
      "Applying different rule profiles for different network types",
    ],
    correct: 1,
  },
  {
    q: "Why do organizations often enforce Standard (non-admin) accounts for regular employees?",
    options: [
      "To reduce the potential damage from malware or accidental system-wide changes",
      "Because Standard accounts are faster",
      "Because Administrator accounts are illegal to use",
      "It has no real security purpose",
    ],
    correct: 0,
  },
  {
    q: "Which Windows feature helps warn users before opening an unrecognized application downloaded from the internet?",
    options: [
      "BitLocker",
      "SmartScreen",
      "Disk Cleanup",
      "Task Manager",
    ],
    correct: 1,
  },
  {
    q: "What is the main security benefit of having separate Windows user accounts?",
    options: [
      "They make every application run faster",
      "They automatically encrypt every file",
      "They help isolate users' files, settings, and permissions",
      "They permanently disable administrator access",
    ],
    correct: 2,
  },
  {
    q: "Which Windows security feature is mainly responsible for encrypting data stored on a drive?",
    options: [
      "Windows Defender Firewall",
      "User Account Control",
      "BitLocker Drive Encryption",
      "SmartScreen",
    ],
    correct: 2,
  },
];

/* =========================================================
   FEATURE DETAIL TABS
========================================================= */

const TABS = [
  "overview",
  "howitworks",
  "wheretofind",
  "whyitmatters",
];

const TAB_LABELS = {
  overview: "Overview",
  howitworks: "How It Works",
  wheretofind: "Where To Find It",
  whyitmatters: "Why It Matters",
};


/* =========================================================
   FEATURE DETAIL PAGE
========================================================= */

function FeatureDetailPage({
  feature,
  onBack,
  onMarkExplored,
  alreadyExplored,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const [viewedTabs, setViewedTabs] = useState(
    new Set(["overview"])
  );

  const openTab = (tab) => {
    setActiveTab(tab);

    setViewedTabs(
      (s) => new Set(s).add(tab)
    );
  };

  const allTabsViewed = TABS.every(
    (t) => viewedTabs.has(t)
  );

  return (
    <div className="card sec-detail-page">

      {/* HEADER */}
      <div className="sec-detail-header">

        <button
          type="button"
          className="btn-back"
          onClick={onBack}
        >
          ← Back
        </button>

        <h2 className="sec-detail-title">
          {feature.icon} {feature.name}
        </h2>

        <span className="sec-detail-tag">
          {feature.tagline}
        </span>

      </div>


      {/* DETAIL TABS */}
      <div className="sec-detail-tabs">

        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`sec-detail-tab ${
              activeTab === t ? "active" : ""
            } ${
              viewedTabs.has(t) ? "viewed" : ""
            }`}
            onClick={() => openTab(t)}
          >
            {TAB_LABELS[t]}
            {viewedTabs.has(t) && " ✓"}
          </button>
        ))}

      </div>


      {/* DETAIL CONTENT */}
      <div className="sec-detail-body">

        {/* =================================================
            OVERVIEW
            40% SYMBOL + 60% CONTENT
        ================================================= */}

        {activeTab === "overview" && (
          <div className="sec-overview-layout">

            {/* LEFT 40% */}
            <div className="sec-detail-icon-row">
              {feature.icon}
            </div>

            {/* RIGHT 60% */}
            <div className="sec-overview-content">

              <p className="sec-detail-text">
                {feature.overview}
              </p>

            </div>

          </div>
        )}


        {/* HOW IT WORKS */}
        {activeTab === "howitworks" && (
          <ul className="sec-detail-list">

            {feature.howItWorks.map(
              (line, i) => (
                <li key={i}>
                  {line}
                </li>
              )
            )}

          </ul>
        )}


        {/* WHERE TO FIND */}
        {activeTab === "wheretofind" && (
          <div className="sec-path-box">

            <span className="sec-path-icon">
              📍
            </span>

            <span>
              {feature.whereToFind}
            </span>

          </div>
        )}


        {/* WHY IT MATTERS */}
        {activeTab === "whyitmatters" && (
          <ul className="sec-detail-list">

            {feature.whyItMatters.map(
              (line, i) => (
                <li key={i}>
                  {line}
                </li>
              )
            )}

          </ul>
        )}

      </div>


      {/* FOOTER */}
      <div className="sec-detail-footer">

        <span className="input-hint">
          {allTabsViewed
            ? "All feature information reviewed."
            : "Read all feature sections to continue."}
        </span>

        <button
          type="button"
          className="btn-verify"
          disabled={!allTabsViewed}
          onClick={onMarkExplored}
        >
          {alreadyExplored
            ? "✓ Explored — Back to Features"
            : allTabsViewed
            ? "Mark as Explored →"
            : "Read all sections"}
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   FEATURE GRID SCREEN
========================================================= */

function FeatureGridScreen({
  explored,
  onOpenFeature,
}) {
  return (
    <section className="card">

      <div className="sec-grid-head">

        <h3 className="panel-heading">
          Windows Security Features
        </h3>

        <span className="input-hint">
          {explored.size}/{FEATURES.length} explored
        </span>

      </div>


      <div className="sec-grid">

        {FEATURES.map((f) => (
          <div
            key={f.id}
            className={`sec-card ${
              explored.has(f.id)
                ? "done"
                : ""
            }`}
            onClick={() => onOpenFeature(f)}
          >

            <div className="sec-card-icon">
              {f.icon}
            </div>

            <span className="sec-card-label">
              {f.name}
            </span>

            <span className="sec-card-tagline">
              {f.tagline}
            </span>

            <span
              className={
                explored.has(f.id)
                  ? "status-verified"
                  : "status-pending"
              }
            >
              {explored.has(f.id)
                ? "☑ Explored"
                : "☐ Tap to Explore"}
            </span>

          </div>
        ))}

      </div>

    </section>
  );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function WindowsSecurityExperiment() {

  const navigate = useNavigate();

  const [theoryOpen, setTheoryOpen] =
    useState(false);

  const [procOpen, setProcOpen] =
    useState(false);

  const [helpOpen, setHelpOpen] =
    useState(false);

  const [lockMessage, setLockMessage] =
    useState("");

  const [screen, setScreen] =
    useState("simulation");

  const [explored, setExplored] =
    useState(new Set());

  const [observations, setObservations] =
    useState([]);

  const [openFeature, setOpenFeature] =
    useState(null);

  const [submitted, setSubmitted] =
    useState(false);

  /* ASSIGNMENT */
  const [quizAnswers, setQuizAnswers] =
    useState(
      Array(QUIZ.length).fill(null)
    );

  const [quizSubmitted, setQuizSubmitted] =
    useState(false);

  const [quizScore, setQuizScore] =
    useState(0);

  const simulationComplete =
    explored.size === FEATURES.length;


  /* =========================================================
     MARK FEATURE AS EXPLORED
  ========================================================= */

  const handleMarkExplored = () => {

    if (!openFeature) return;

    if (!explored.has(openFeature.id)) {

      setExplored(
        (prev) =>
          new Set(prev).add(
            openFeature.id
          )
      );

      setObservations(
        (prev) => [
          ...prev,
          {
            sr: prev.length + 1,
            feature: openFeature.name,
            location: openFeature.whereToFind,
            summary: openFeature.tagline,
            status: "Explored",
          },
        ]
      );
    }

    setOpenFeature(null);
  };


  /* =========================================================
     TAB SWITCH
  ========================================================= */

  const goToScreen = (target) => {
    setOpenFeature(null);
    setScreen(target);

  };


  /* =========================================================
     QUIZ SUBMIT
  ========================================================= */

  const handleQuizSubmit = () => {

    const score =
      quizAnswers.reduce(
        (s, ans, i) =>
          s +
          (ans === QUIZ[i].correct
            ? 1
            : 0),
        0
      );

    setQuizScore(score);
    setQuizSubmitted(true);

  };


  /* =========================================================
     FINAL SUBMIT
  ========================================================= */

  const allQuizAnswered =
    quizAnswers.every(
      (answer) => answer !== null
    );

  const assignmentComplete = allQuizAnswered;

  const canSubmit =
    simulationComplete &&
    assignmentComplete;


  const handleSubmit = () => {
    if (!canSubmit || submitted) return;

    const finalScore = quizAnswers.reduce(
      (score, answer, index) =>
        score + (answer === QUIZ[index].correct ? 1 : 0),
      0
    );

    const resultPayload = buildIfsResult({
      subjectCode: "IFS",
      experimentNo: 1,
      experimentName:
        "Knowing the Security Provided with Windows Operating System",
      experimentRoute: "/ifs-experiment-1",
      quizScore: finalScore,
      quizTotal: QUIZ.length,
      quizQuestions: QUIZ,
      quizAnswers,
    });

    setQuizScore(finalScore);
    setQuizSubmitted(true);
    setSubmitted(true);

    try {
      localStorage.setItem(
        "windowsSecurityExpStatus",
        JSON.stringify({
          completed: true,
          featuresExplored: explored.size,
          observations,
          quizScore: finalScore,
          quizTotal: QUIZ.length,
          date: new Date().toISOString(),
        })
      );

      // Common result payload, also available after refreshing Result.jsx
      localStorage.setItem(
        "assignmentResult",
        JSON.stringify(resultPayload)
      );
    } catch (error) {
      console.error("Unable to save experiment result:", error);
    }

    navigate("/result", {
      state: resultPayload,
    });
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="ifs1-root">

      {/* HEADER */}
      <header className="exp-header">

        <button
          type="button"
          className="btn-back"
          onClick={() =>
            navigate("/ifs-experiments")
          }
        >
          ← Back
        </button>

        <h1 className="exp-title">
          Experiment 1: Knowing the Security Provided with
          Windows Operating System
        </h1>

        <button
          type="button"
          className="btn-help"
          onClick={() =>
            setHelpOpen(true)
          }
        >
          ? Help
        </button>

      </header>


      {/* AIM */}
      <section className="card">

        <h2 className="section-heading orange">
          Aim
        </h2>

        <p>
          To study and explore the built-in
          security features provided by the
          Windows Operating System, and
          understand how each feature protects
          the system, the network, and user data.
        </p>

      </section>


      {/* THEORY */}
      <section className="card">

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
              Modern versions of Windows come
              with a layered set of built-in
              security features, collectively aimed
              at protecting the system from malware,
              network attacks, unauthorized access,
              and data theft — without requiring any
              third-party software.
            </p>

            <p>
              These layers include real-time malware
              protection (Windows Defender Antivirus),
              network traffic filtering (Windows
              Defender Firewall), privilege control
              (User Account Control), data-at-rest
              protection (BitLocker), timely
              vulnerability patching (Windows Update),
              account-level access control (User
              Accounts & Permissions), and web/app
              reputation filtering (SmartScreen).
            </p>

            <p>
              Understanding what each feature does,
              where it's configured, and why it
              matters is essential for evaluating
              how well a Windows system is protected
              and for correctly hardening it in
              real-world use.
            </p>

          </div>
        )}

      </section>


      {/* PROCEDURE */}
      <section className="card">

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
                Open each Windows security
                feature card from the grid.
              </li>

              <li>
                Read the Overview, How It Works,
                Where To Find It, and Why It
                Matters tabs.
              </li>

              <li>
                Click "Mark as Explored" to log
                the feature in the Observation Table.
              </li>

            </ol>

            <ol
              className="proc-col"
              start="4"
            >

              <li>
                Repeat for all {FEATURES.length}
                security features.
              </li>

              <li>
                Complete all Assignment questions
                and click "Submit Experiment" to
                finish.
              </li>

            </ol>

          </div>
        )}

      </section>


      {/* STEP TABS */}
      <div className="caesar-step-tabs">

        <button
          type="button"
          className={`caesar-step-tab ${
            screen === "simulation"
              ? "active"
              : ""
          }`}
          onClick={() =>
            goToScreen("simulation")
          }
        >
          1. Simulation
          {simulationComplete && " ✓"}
        </button>

        <button
          type="button"
          className={`caesar-step-tab ${
            screen === "assignment"
              ? "active"
              : ""
          }`}
          onClick={() =>
            goToScreen("assignment")
          }
        >
          2. Assignment
          {quizSubmitted && " ✓"}
        </button>

      </div>


      {/* ===================================================
          SIMULATION
      =================================================== */}

      {screen === "simulation" && (
        <>

          {openFeature ? (

            <FeatureDetailPage
              feature={openFeature}
              onBack={() =>
                setOpenFeature(null)
              }
              onMarkExplored={
                handleMarkExplored
              }
              alreadyExplored={explored.has(
                openFeature.id
              )}
            />

          ) : (

            <FeatureGridScreen
              explored={explored}
              onOpenFeature={
                setOpenFeature
              }
            />

          )}


          {/* OBSERVATION TABLE */}
          <section className="card table-section">

            <h3 className="panel-heading orange">
              Observation Table
            </h3>

            <div className="table-scroll">

              <table className="obs-table">

                <thead>

                  <tr>
                    <th>Sr. No.</th>
                    <th>Security Feature</th>
                    <th>Where To Find It</th>
                    <th>Summary</th>
                    <th>Status</th>
                  </tr>

                </thead>

                <tbody>

                  {observations.length === 0 ? (

                    <tr>
                      <td colSpan="5">
                        No feature explored yet.
                      </td>
                    </tr>

                  ) : (

                    observations.map(
                      (row, index) => (

                        <tr
                          key={index}
                          className="row-correct"
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {row.feature}
                          </td>

                          <td>
                            {row.location}
                          </td>

                          <td>
                            {row.summary}
                          </td>

                          <td>
                            ✔ {row.status}
                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>


            <div className="submit-status sim-status">

              <p>

                Features Explored:
                <b>
                  {" "}
                  {explored.size}/
                  {FEATURES.length}
                </b>

                <br />

                {!simulationComplete
                  ? `Explore ${
                      FEATURES.length -
                      explored.size
                    } more feature(s) to complete the simulation.`
                  : "✔ All security features explored."}

              </p>

            </div>

          </section>

        </>
      )}


      {/* ===================================================
          ASSIGNMENT
      =================================================== */}

      {screen === "assignment" && (

        <section className="card quiz-card">

          <h3 className="panel-heading orange">
            Assignment ({QUIZ.length} Questions)
          </h3>

          <p className="input-hint">
            Answer all questions based on the
            Windows security features you just
            explored.
          </p>


          {QUIZ.map(
            (item, qIdx) => (

              <div
                key={qIdx}
                className="quiz-item"
              >

                <p className="quiz-question">

                  {qIdx + 1}. {item.q}

                </p>


                <div className="quiz-options">

                  {item.options.map(
                    (opt, oIdx) => {

                      let cls =
                        "quiz-option";

                      if (quizSubmitted) {

                        if (
                          oIdx ===
                          item.correct
                        ) {
                          cls +=
                            " correct";
                        } else if (
                          oIdx ===
                          quizAnswers[qIdx]
                        ) {
                          cls += " wrong";
                        }

                      } else if (
                        quizAnswers[qIdx] ===
                        oIdx
                      ) {

                        cls +=
                          " selected";

                      }


                      return (
                        <div
                          key={oIdx}
                          className={cls}
                          onClick={() => {

                            if (
                              quizSubmitted
                            )
                              return;

                            setQuizAnswers(
                              (prev) =>
                                prev.map(
                                  (v, i) =>
                                    i === qIdx
                                      ? oIdx
                                      : v
                                )
                            );

                          }}
                        >

                          <span className="option-letter">
                            {String.fromCharCode(
                              65 + oIdx
                            )}
                          </span>

                          <span>
                            {opt}
                          </span>

                        </div>
                      );

                    }
                  )}

                </div>

              </div>

            )
          )}


          <div className="assignment-hint">

            <p>

              Answer all {QUIZ.length}
              questions, then click
              <b> Submit Experiment </b>
              below to calculate and display
              your score on the Result page.

            </p>

          </div>

        </section>

      )}


      {/* ===================================================
          SUBMIT
      =================================================== */}

      <section className="submit-section">

        <div className="submit-action-row">
          <button
            type="button"
            className={`btn-submit ${
              canSubmit && !submitted
                ? "enabled"
                : "disabled"
            }`}
            disabled={
              !canSubmit || submitted
            }
            onClick={handleSubmit}
          >
            {submitted
              ? "Submitted"
              : "Submit Experiment"}
          </button>

          <button
            type="button"
            className={`submit-lock ${canSubmit && !submitted ? "unlocked" : "locked"}`}
            onClick={() => {
              if (submitted) {
                setLockMessage("This experiment has already been submitted.");
              } else if (!canSubmit) {
                setLockMessage(
                  "Submit is locked. Complete both Simulation and Assignment to enable it."
                );
              } else {
                setLockMessage(
                  "Submit is enabled. Simulation and Assignment are complete."
                );
              }
            }}
            aria-label={canSubmit && !submitted ? "Submit enabled" : "Submit locked"}
            title={canSubmit && !submitted ? "Submit enabled" : "Submit locked"}
          >
            {canSubmit && !submitted ? "🔓" : "🔒"}
          </button>
        </div>


        <div className="submit-status">

          {submitted ? (

            <p className="submit-success">
              Experiment Submitted Successfully
            </p>

          ) : (

            <p>

              Simulation:
              <b>
                {" "}
                {explored.size}/
                {FEATURES.length}
              </b>

              {"  |  "}

              Assignment:
              <b>
                {" "}
                {allQuizAnswered
                  ? "✔ Ready to Submit"
                  : `${
                      quizAnswers.filter(
                        (a) => a !== null
                      ).length
                    }/${QUIZ.length} Answered`}
              </b>

            </p>

          )}

        </div>

      </section>


      {lockMessage && (
        <div
          className="popup-overlay"
          onClick={() => setLockMessage("")}
        >
          <div
            className="popup-box lock-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lock-popup-icon">
              {canSubmit && !submitted ? "🔓" : "🔒"}
            </div>
            <h3 className="section-heading orange">
              {canSubmit && !submitted ? "Submit Enabled" : "Locked"}
            </h3>
            <p>{lockMessage}</p>
            <button
              type="button"
              className="btn-verify"
              onClick={() => setLockMessage("")}
            >
              OK
            </button>
          </div>
        </div>
      )}


      {/* ===================================================
          HELP
      =================================================== */}

      {helpOpen && (

        <div
          className="popup-overlay"
          onClick={() =>
            setHelpOpen(false)
          }
        >

          <div
            className="popup-box help-popup hc-help-popup"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h3 className="section-heading orange">
              Windows OS Security — Quick Reference
            </h3>

            <p>
              Windows provides several layered,
              built-in security features that work
              together to protect a system from
              malware, network attacks, unauthorized
              access, and data loss.
            </p>

            <h4 className="hc-help-subhead">
              Core Features Covered:
            </h4>

            <ul className="hc-help-list">

              <li>
                <b>Windows Defender Antivirus</b>
                {" — "}real-time & cloud-based
                malware protection.
              </li>

              <li>
                <b>Windows Defender Firewall</b>
                {" — "}filters inbound/outbound
                network traffic.
              </li>

              <li>
                <b>User Account Control (UAC)</b>
                {" — "}prompts for approval before
                privileged changes.
              </li>

              <li>
                <b>BitLocker Drive Encryption</b>
                {" — "}encrypts the entire drive
                to protect data at rest.
              </li>

              <li>
                <b>Windows Update</b>
                {" — "}delivers security patches
                for known vulnerabilities.
              </li>

              <li>
                <b>User Accounts & Permissions</b>
                {" — "}enforces least-privilege
                access.
              </li>

              <li>
                <b>
                  SmartScreen (App & Browser Control)
                </b>
                {" — "}blocks known phishing sites
                & risky downloads.
              </li>

            </ul>

            <p>
              Explore each feature card in the
              Simulation tab, review all four
              information sections, and it will be
              logged automatically in the
              Observation Table.
            </p>

            <button
              type="button"
              className="btn-verify full-width"
              onClick={() =>
                setHelpOpen(false)
              }
            >
              Got it
            </button>

          </div>

        </div>

      )}

    </div>
  );
}