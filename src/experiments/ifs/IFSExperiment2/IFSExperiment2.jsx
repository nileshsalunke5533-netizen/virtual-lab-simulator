import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { buildIfsResult } from "../../../utils/ifsResult.js";
import "./IFSExperiment2.css";

const RESULT_STORAGE_KEY = "passwordRecoveryExp2Status";

/* =========================================================
   NOTE ON OBSERVATION HISTORY

   Observations are kept in React state only — NOT localStorage.
   The Observation Table clears automatically on page refresh
   and on Reset, so one learner's progress never leaks into the
   next session on the same device.
========================================================= */

/* =========================================================
   WINDOWS ACCOUNT CASE FILES (WinPassRecover Pro case files)
   Each rawDump line follows the standard pwdump export format:
   username:RID:LM-hash:NTLM-hash:::
========================================================= */

const SAMPLES = [
  {
    id: "A1",
    label: "Case 1 — Local Administrator account",
    username: "Administrator",
    rid: "500",
    lmHash: "AAD3B435B51404EEAAD3B435B51404EE",
    ntlmHash: "8846F7EAEE8FB117AD06BDD830B7586C",
    accountType: "Local",
    recoverable: true,
    recoveredPassword: "password",
    passwordLength: "8",
    crackMethod: "Dictionary Attack",
    timeTaken: "< 1 second",
    strength: "Weak",
    verdict: "Weak – Recovered",
    rawDump: `svc_backup:1200:AAD3B435B51404EEAAD3B435B51404EE:9F86D081884C7D659A2FEAA0C55AD015:::
Administrator:500:AAD3B435B51404EEAAD3B435B51404EE:8846F7EAEE8FB117AD06BDD830B7586C:::
krbtgt:502:AAD3B435B51404EEAAD3B435B51404EE:F5BA073331E1C6D3E8BC3A1EDDE913E7:::`,
  },

  {
    id: "A2",
    label: "Case 2 — Domain user jsmith",
    username: "jsmith",
    rid: "1104",
    lmHash: "AAD3B435B51404EEAAD3B435B51404EE",
    ntlmHash: "32ED87BDB5FDC5E9CBA88547376818D4",
    accountType: "Domain",
    recoverable: false,
    recoveredPassword: "NOT FOUND",
    passwordLength: "NOT FOUND",
    crackMethod: "NOT FOUND",
    timeTaken: "NOT FOUND",
    strength: "Strong",
    verdict: "Strong – Not Recoverable",
    rawDump: `svc_backup:1200:AAD3B435B51404EEAAD3B435B51404EE:9F86D081884C7D659A2FEAA0C55AD015:::
jsmith:1104:AAD3B435B51404EEAAD3B435B51404EE:32ED87BDB5FDC5E9CBA88547376818D4:::
helpdesk:1108:AAD3B435B51404EEAAD3B435B51404EE:5835048CE94AD0564E29A924A03510EF:::`,
  },

  {
    id: "A3",
    label: "Case 3 — Guest account (default, no password set)",
    username: "Guest",
    rid: "501",
    lmHash: "AAD3B435B51404EEAAD3B435B51404EE",
    ntlmHash: "31D6CFE0D16AE931B73C59D7E0C089C0",
    accountType: "Local",
    recoverable: true,
    recoveredPassword: "(blank / no password set)",
    passwordLength: "0",
    crackMethod: "Empty-Hash Match",
    timeTaken: "< 1 second",
    strength: "Weak",
    verdict: "Weak – Recovered",
    rawDump: `krbtgt:502:AAD3B435B51404EEAAD3B435B51404EE:F5BA073331E1C6D3E8BC3A1EDDE913E7:::
Guest:501:AAD3B435B51404EEAAD3B435B51404EE:31D6CFE0D16AE931B73C59D7E0C089C0:::
svc_backup:1200:AAD3B435B51404EEAAD3B435B51404EE:9F86D081884C7D659A2FEAA0C55AD015:::`,
  },

  {
    id: "A4",
    label: "Case 4 — Finance manager rmehta",
    username: "rmehta",
    rid: "1121",
    lmHash: "AAD3B435B51404EEAAD3B435B51404EE",
    ntlmHash: "7A21990FCD3D759941E45C490F143D5F",
    accountType: "Domain",
    recoverable: false,
    recoveredPassword: "NOT FOUND",
    passwordLength: "NOT FOUND",
    crackMethod: "NOT FOUND",
    timeTaken: "NOT FOUND",
    strength: "Strong",
    verdict: "Strong – Not Recoverable",
    rawDump: `helpdesk:1108:AAD3B435B51404EEAAD3B435B51404EE:5835048CE94AD0564E29A924A03510EF:::
rmehta:1121:AAD3B435B51404EEAAD3B435B51404EE:7A21990FCD3D759941E45C490F143D5F:::
dbadmin:1145:AAD3B435B51404EEAAD3B435B51404EE:C9B1C3D2A6E4F708B1D0A9C5E3F2A1B7:::`,
  },

  {
    id: "A5",
    label: "Case 5 — IT support shared account itsupport",
    username: "itsupport",
    rid: "1130",
    lmHash: "AAD3B435B51404EEAAD3B435B51404EE",
    ntlmHash: "0D757AD3B2EB80C8E842E7C21FA8CB31",
    accountType: "Local",
    recoverable: true,
    recoveredPassword: "letmein",
    passwordLength: "7",
    crackMethod: "Dictionary Attack",
    timeTaken: "< 1 second",
    strength: "Weak",
    verdict: "Weak – Recovered",
    rawDump: `jsmith:1104:AAD3B435B51404EEAAD3B435B51404EE:32ED87BDB5FDC5E9CBA88547376818D4:::
itsupport:1130:AAD3B435B51404EEAAD3B435B51404EE:0D757AD3B2EB80C8E842E7C21FA8CB31:::
rmehta:1121:AAD3B435B51404EEAAD3B435B51404EE:7A21990FCD3D759941E45C490F143D5F:::`,
  },

  {
    id: "A6",
    label: "Case 6 — Database admin dbadmin",
    username: "dbadmin",
    rid: "1145",
    lmHash: "AAD3B435B51404EEAAD3B435B51404EE",
    ntlmHash: "C9B1C3D2A6E4F708B1D0A9C5E3F2A1B7",
    accountType: "Domain",
    recoverable: false,
    recoveredPassword: "NOT FOUND",
    passwordLength: "NOT FOUND",
    crackMethod: "NOT FOUND",
    timeTaken: "NOT FOUND",
    strength: "Strong",
    verdict: "Strong – Not Recoverable",
    rawDump: `Administrator:500:AAD3B435B51404EEAAD3B435B51404EE:8846F7EAEE8FB117AD06BDD830B7586C:::
dbadmin:1145:AAD3B435B51404EEAAD3B435B51404EE:C9B1C3D2A6E4F708B1D0A9C5E3F2A1B7:::
Guest:501:AAD3B435B51404EEAAD3B435B51404EE:31D6CFE0D16AE931B73C59D7E0C089C0:::`,
  },
];

/* =========================================================
   WinPassRecover Pro — PRECOMPUTED HASH LOOKUP DATABASE
========================================================= */

const HASH_DATABASE = [
  { hash: "8846F7EAEE8FB117AD06BDD830B7586C", password: "password", length: "8", method: "Dictionary Attack", time: "< 1 second" },
  { hash: "31D6CFE0D16AE931B73C59D7E0C089C0", password: "(blank / no password set)", length: "0", method: "Empty-Hash Match", time: "< 1 second" },
  { hash: "0D757AD3B2EB80C8E842E7C21FA8CB31", password: "letmein", length: "7", method: "Dictionary Attack", time: "< 1 second" },
  { hash: "5F4DCC3B5AA765D61D8327DEB882CF99", password: "password1", length: "9", method: "Dictionary Attack", time: "2 seconds" },
  { hash: "25D55AD283AA400AF464C76D713C07AD", password: "12345678", length: "8", method: "Dictionary Attack", time: "< 1 second" },
  { hash: "E10ADC3949BA59ABBE56E057F20F883E", password: "123456", length: "6", method: "Dictionary Attack", time: "< 1 second" },
  { hash: "9F86D081884C7D659A2FEAA0C55AD015", password: "welcome1", length: "8", method: "Dictionary Attack", time: "1 second" },
  { hash: "F5BA073331E1C6D3E8BC3A1EDDE913E7", password: "admin123", length: "8", method: "Dictionary Attack", time: "1 second" },
];

const VERDICT_OPTIONS = [
  "Weak – Recovered",
  "Strong – Not Recoverable",
  "Cannot determine",
];

/* Short field lists for the step inputs (label + what to type only) */

const DUMP_FIELDS = [
  { key: "username", label: "Username", placeholder: "e.g. Administrator" },
  { key: "rid", label: "RID", placeholder: "e.g. 500" },
  { key: "lmHash", label: "LM Hash", placeholder: "AAD3B435B51404EE..." },
  { key: "accountType", label: "Account Type", placeholder: "Local / Domain" },
];

const RESULT_FIELDS = [
  { key: "recoveredPassword", label: "Recovered Password", placeholder: "or NOT FOUND" },
  { key: "passwordLength", label: "Password Length", placeholder: "or NOT FOUND" },
  { key: "crackMethod", label: "Crack Method", placeholder: "or NOT FOUND" },
  { key: "timeTaken", label: "Time Taken", placeholder: "or NOT FOUND" },
];

/* =========================================================
   HELPERS
========================================================= */

function normalize(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function markField(entered, expected) {
  if (normalize(entered) === "") return "wrong";
  return normalize(entered) === normalize(expected) ? "correct" : "wrong";
}

function markFieldSet(fields, values, sample) {
  return fields.reduce((status, field) => {
    status[field.key] = markField(values[field.key], sample[field.key]);
    return status;
  }, {});
}

function allCorrect(statusObject) {
  return Object.values(statusObject).every((item) => item === "correct");
}

function hasWrong(statusObject) {
  return Object.values(statusObject).some((item) => item === "wrong");
}

function emptyValues(fields) {
  return fields.reduce((values, field) => {
    values[field.key] = "";
    return values;
  }, {});
}

function parseDumpLine(line) {
  const parts = line.split(":");
  return {
    username: parts[0] || "",
    rid: parts[1] || "",
    lmHash: parts[2] || "",
    ntlmHash: parts[3] || "",
  };
}

/* =========================================================
   QUIZ
========================================================= */

const QUIZ = [
  { q: "Where does Windows store local account password hashes?", options: ["In the Registry's SAM database", "In a plain-text file", "In the Recycle Bin", "In the page file only"], correct: 0 },
  { q: "What does NTLM hashing primarily protect against?", options: ["Storing the password in plain text", "Network latency", "Disk fragmentation", "Screen locking"], correct: 0 },
  { q: "A password recovery / cracking utility typically works by:", options: ["Decrypting the hash directly back to the password", "Comparing the hash against a dictionary or precomputed table of known hashes", "Reading the password from RAM in plain text always", "Asking the user to retype the password"], correct: 1 },
  { q: "What does RID stand for in a SAM dump entry?", options: ["Remote Identity", "Relative Identifier", "Registry Index", "Root Instance Descriptor"], correct: 1 },
  { q: "The LM hash value AAD3B435B51404EEAAD3B435B51404EE typically indicates:", options: ["A very strong password", "LM hashing is disabled / not stored for that account", "A corrupted SAM database", "The account is locked"], correct: 1 },
  { q: "A dictionary attack recovers a password by:", options: ["Trying every possible character combination", "Comparing the target hash against hashes of common/known words", "Resetting the password directly", "Reading it from a backup tape"], correct: 1 },
  { q: "If a hash is NOT found in a precomputed lookup database, this most likely means:", options: ["The account does not exist", "The password is complex enough that it isn't a common/known word", "The hash algorithm failed", "The account is disabled"], correct: 1 },
  { q: "The built-in RID 500 in a Windows SAM database belongs to:", options: ["Guest", "Administrator", "krbtgt", "A random user"], correct: 1 },
  { q: "RID 501 is reserved for which built-in account?", options: ["Administrator", "Guest", "SYSTEM", "Everyone"], correct: 1 },
  { q: "A rainbow table attack differs from a plain dictionary attack because it:", options: ["Uses precomputed hash chains to speed up lookups", "Only works on encrypted files", "Requires no hash at all", "Only works over a network"], correct: 0 },
  { q: "Which of these is the strongest defense against hash-based password recovery?", options: ["Using a long, complex, unique password", "Disabling the monitor", "Renaming the Administrator account only", "Using the same password everywhere"], correct: 0 },
  { q: "An empty NTLM hash (31D6CFE0D16AE931B73C59D7E0C089C0) corresponds to:", options: ["A very strong password", "No password set at all", "A locked account", "An expired password"], correct: 1 },
  { q: "Offline password recovery (booting from external media) is possible mainly because:", options: ["The SAM database can be accessed without the running OS enforcing login", "Windows deletes the SAM file on shutdown", "All hashes are stored unencrypted on the network", "It requires the original password already"], correct: 0 },
  { q: "Which account property makes a shared/default account like 'itsupport' a common target?", options: ["It usually has a unique, complex password", "It is often left with a weak, easily guessed default password", "It cannot be logged into remotely", "It has no RID assigned"], correct: 1 },
  { q: "A key limitation of dictionary/rainbow-table based recovery is that it:", options: ["Always recovers every password instantly", "Fails against sufficiently long, random, non-dictionary passwords", "Only works on Linux systems", "Cannot read any hash format"], correct: 1 },
  { q: "Salting a password hash primarily helps defend against:", options: ["Precomputed rainbow-table lookups", "Screen brightness issues", "Disk corruption", "Account lockout"], correct: 0 },
  { q: "In an incident-response context, recovering a Windows password is typically done to:", options: ["Permanently disable the machine", "Regain legitimate access or investigate an account under proper authorization", "Increase disk space", "Speed up the CPU"], correct: 1 },
  { q: "Which account type in the case files represents a domain-joined user rather than a local one?", options: ["Local", "Domain", "Guest-only", "Anonymous"], correct: 1 },
  { q: "A strong, policy-compliant password resists dictionary-based recovery mainly because it:", options: ["Is short and simple to remember", "Is unlikely to appear in common password lists", "Uses only lowercase letters", "Is reused across many accounts"], correct: 1 },
  { q: "The overall purpose of a password recovery utility in this lab is to:", options: ["Demonstrate how weak hashes can be matched to known passwords, reinforcing the need for strong password policies", "Permanently corrupt the SAM database", "Replace the need for any authentication", "Encrypt the hard disk"], correct: 0 },
];

/* =========================================================
   SIMPLE CANVAS PIECES
========================================================= */

function DumpBox({ sample }) {
  const lines = sample.rawDump.split("\n").filter((line) => line.trim() !== "");

  return (
    <pre className="dump-box">
      {lines.map((line, index) => {
        const fields = parseDumpLine(line);
        const isTarget = fields.username === sample.username;
        return (
          <div key={index} className={isTarget ? "dump-line dump-target" : "dump-line"}>
            {line}
          </div>
        );
      })}
    </pre>
  );
}

function HashTable({ highlightHash }) {
  return (
    <div className="hash-db-scroll">
      <table className="hash-db-table">
        <thead>
          <tr>
            <th>NTLM Hash</th>
            <th>Password</th>
            <th>Length</th>
            <th>Method</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {HASH_DATABASE.map((record) => (
            <tr key={record.hash} className={record.hash === highlightHash ? "hash-match" : ""}>
              <td>{record.hash}</td>
              <td>{record.password}</td>
              <td>{record.length}</td>
              <td>{record.method}</td>
              <td>{record.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SimpleFields({ fields, values, statuses, onChange, disabled }) {
  return (
    <div className="simple-grid">
      {fields.map((field) => {
        const status = statuses[field.key];
        return (
          <div className="simple-field" key={field.key}>
            <label>{field.label}</label>
            <input
              className={
                status === "correct" ? "simple-input ok" : status === "wrong" ? "simple-input bad" : "simple-input"
              }
              value={values[field.key] || ""}
              placeholder={field.placeholder}
              disabled={disabled}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   MANUAL CANVAS — simple step blocks, direct inputs
========================================================= */

function ManualCanvasSimulation({
  sample,
  phase,

  hashInput,
  hashStatus,
  hashLocked,

  dumpValues,
  dumpStatus,
  dumpLocked,

  resultValues,
  resultStatus,
  resultLocked,

  verdictChoice,
  verdictStatus,
  verdictLocked,

  onHashChange,
  onDumpChange,
  onResultChange,
  onVerdictChange,

  onCheckHash,
  onCheckDump,
  onCheckResult,
  onCheckVerdict,

  onContinue,
  onNewTrace,
}) {
  return (
    <div className="simple-canvas">

      {phase < 4 && <p className="step-indicator">Step {phase + 1} of 4</p>}

      {/* STEP 1 */}
      {phase === 0 && (
        <div className="step-block">
          <h4>Find the target account's NTLM hash</h4>
          <p className="step-hint">
            Highlighted line below = target account. NTLM hash is the 4th field (after the 2nd colon-pair).
          </p>

          <DumpBox sample={sample} />

          <input
            className={hashStatus === "correct" ? "simple-input wide ok" : hashStatus === "wrong" ? "simple-input wide bad" : "simple-input wide"}
            value={hashInput}
            placeholder="Enter NTLM hash"
            disabled={hashLocked}
            onChange={(e) => onHashChange(e.target.value)}
          />

          <div className="step-actions">
            {!hashLocked ? (
              <button className="btn-primary" onClick={onCheckHash}>Check</button>
            ) : (
              <button className="btn-primary" onClick={() => onContinue(1)}>Next →</button>
            )}
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {phase === 1 && (
        <div className="step-block">
          <h4>Record the account details</h4>
          <p className="step-hint">Read Username, RID and LM Hash from the highlighted line; Account Type from the case.</p>

          <DumpBox sample={sample} />

          <SimpleFields
            fields={DUMP_FIELDS}
            values={dumpValues}
            statuses={dumpStatus}
            onChange={onDumpChange}
            disabled={dumpLocked}
          />

          <div className="step-actions">
            {!dumpLocked ? (
              <button className="btn-primary" onClick={onCheckDump}>Check</button>
            ) : (
              <button className="btn-primary" onClick={() => onContinue(2)}>Next →</button>
            )}
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {phase === 2 && (
        <div className="step-block">
          <h4>Look up the hash</h4>
          <p className="step-hint">
            Traced hash: <b>{sample.ntlmHash}</b> — find it below. No match? Type NOT FOUND in all four boxes.
          </p>

          <HashTable highlightHash={sample.ntlmHash} />

          <SimpleFields
            fields={RESULT_FIELDS}
            values={resultValues}
            statuses={resultStatus}
            onChange={onResultChange}
            disabled={resultLocked}
          />

          <div className="step-actions">
            {!resultLocked ? (
              <button className="btn-primary" onClick={onCheckResult}>Check</button>
            ) : (
              <button className="btn-primary" onClick={() => onContinue(3)}>Next →</button>
            )}
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {phase === 3 && (
        <div className="step-block">
          <h4>Give the verdict</h4>
          <p className="step-hint">Match found → Weak – Recovered. No match → Strong – Not Recoverable.</p>

          <div className="mini-evidence">
            <div><span>Username</span><b>{sample.username}</b></div>
            <div><span>NTLM Hash</span><b>{sample.ntlmHash}</b></div>
            <div><span>Lookup Result</span><b>{sample.recoverable ? "Match found" : "No match"}</b></div>
          </div>

          <div className="verdict-row">
            {VERDICT_OPTIONS.map((option) => (
              <button
                type="button"
                key={option}
                disabled={verdictLocked}
                className={
                  verdictChoice === option && verdictStatus === "correct"
                    ? "verdict-btn ok"
                    : verdictChoice === option && verdictStatus === "wrong"
                    ? "verdict-btn bad"
                    : verdictChoice === option
                    ? "verdict-btn selected"
                    : "verdict-btn"
                }
                onClick={() => onVerdictChange(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="step-actions">
            {!verdictLocked ? (
              <button className="btn-primary" onClick={onCheckVerdict}>Check Verdict</button>
            ) : (
              <p className="done-text">✓ Recovery completed</p>
            )}
          </div>
        </div>
      )}

      {/* FINAL SCREEN */}
      {phase === 4 && (
        <div className="step-block final-block">
          <h4>✓ Case {sample.id} complete</h4>
          <div className="mini-evidence">
            <div><span>Username</span><b>{sample.username}</b></div>
            <div><span>Recovered Password</span><b>{sample.recoverable ? sample.recoveredPassword : "Not Recoverable"}</b></div>
            <div><span>Verdict</span><b>{sample.verdict}</b></div>
          </div>
          <div className="step-actions">
            <button className="btn-primary" onClick={onNewTrace}>+ New Case</button>
          </div>
        </div>
      )}

    </div>
  );
}

/* =========================================================
   ASSIGNMENT
========================================================= */

function AssignmentScreen({ answers, setAnswers }) {
  const selectAnswer = (qIndex, optionIndex) => {
    setAnswers((prev) => prev.map((value, index) => (index === qIndex ? optionIndex : value)));
  };

  return (
    <section className="card quiz-card">
      <div className="quiz-header">
        <div>
          <h3 className="panel-heading">Assignment — 20 Questions</h3>
          <p className="input-hint">Answer all questions based on the Windows password recovery simulation.</p>
        </div>
        <div className="quiz-count">{answers.filter((a) => a !== null).length}/20 Answered</div>
      </div>

      <div className="quiz-list">
        {QUIZ.map((item, qIndex) => (
          <div key={qIndex} className="quiz-question">
            <p className="quiz-question-text"><b>Q{qIndex + 1}.</b> {item.q}</p>
            <div className="quiz-options">
              {item.options.map((option, optionIndex) => {
                let optionClass = "quiz-option";
                if (answers[qIndex] === optionIndex) optionClass += " quiz-selected";
                return (
                  <button type="button" key={optionIndex} className={optionClass} onClick={() => selectAnswer(qIndex, optionIndex)}>
                    <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="assignment-note">
        <span>ℹ</span>
        <p>Select an answer for all 20 questions. Your assignment score will be calculated automatically when you submit.</p>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function WindowsPasswordRecoveryExperiment() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("simulation");

  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procOpen, setProcOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [sample, setSample] = useState(null);

  const [phase, setPhase] = useState(0);
  const [simulationStarted, setSimulationStarted] = useState(false);

  /* STEP 1 */
  const [hashInput, setHashInput] = useState("");
  const [hashStatus, setHashStatus] = useState(null);
  const [hashLocked, setHashLocked] = useState(false);

  /* STEP 2 */
  const [dumpValues, setDumpValues] = useState(emptyValues(DUMP_FIELDS));
  const [dumpStatus, setDumpStatus] = useState({});
  const [dumpLocked, setDumpLocked] = useState(false);

  /* STEP 3 */
  const [resultValues, setResultValues] = useState(emptyValues(RESULT_FIELDS));
  const [resultStatus, setResultStatus] = useState({});
  const [resultLocked, setResultLocked] = useState(false);

  /* STEP 4 */
  const [verdictChoice, setVerdictChoice] = useState("");
  const [verdictStatus, setVerdictStatus] = useState(null);
  const [verdictLocked, setVerdictLocked] = useState(false);

  /* OBSERVATIONS (in-memory only) */
  const [observations, setObservations] = useState([]);
  const [successfulAttempts, setSuccessfulAttempts] = useState(0);

  useEffect(() => {
    setSuccessfulAttempts(Math.min(observations.length, 5));
  }, [observations]);

  const [answers, setAnswers] = useState(Array(QUIZ.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const simulationCompleted = successfulAttempts >= 5;
  const allAssignmentAnswered = answers.every((a) => a !== null);
  const completedCaseIds = observations.map((row) => row.caseId);

  /* =====================================================
     START CASE
  ===================================================== */

  const handleStartTrace = () => {
    const selected = SAMPLES.find((item) => item.id === selectedCaseId);

    if (!selected) {
      alert("Please select a case file first.");
      return;
    }

    setSample(selected);

    setHashInput("");
    setHashStatus(null);
    setHashLocked(false);

    setDumpValues(emptyValues(DUMP_FIELDS));
    setDumpStatus({});
    setDumpLocked(false);

    setResultValues(emptyValues(RESULT_FIELDS));
    setResultStatus({});
    setResultLocked(false);

    setVerdictChoice("");
    setVerdictStatus(null);
    setVerdictLocked(false);

    setPhase(0);
    setSimulationStarted(true);
  };

  /* =====================================================
     STEP 1 CHECK
  ===================================================== */

  const handleCheckHash = () => {
    if (!hashInput.trim()) {
      alert("Enter the NTLM hash first.");
      return;
    }

    const status = markField(hashInput, sample.ntlmHash);
    setHashStatus(status);

    if (status === "correct") {
      setHashLocked(true);
    } else {
      alert("Wrong hash. Read the 4th field of the highlighted line.");
    }
  };

  /* =====================================================
     STEP 2 CHECK
  ===================================================== */

  const handleCheckDump = () => {
    const status = markFieldSet(DUMP_FIELDS, dumpValues, sample);
    setDumpStatus(status);

    if (allCorrect(status)) {
      setDumpLocked(true);
    } else {
      alert("Some fields are wrong. Red boxes need fixing.");
    }
  };

  /* =====================================================
     STEP 3 CHECK
  ===================================================== */

  const handleCheckResult = () => {
    const status = markFieldSet(RESULT_FIELDS, resultValues, sample);
    setResultStatus(status);

    if (allCorrect(status)) {
      setResultLocked(true);
    } else {
      alert("Some fields are wrong. Check the table, or type NOT FOUND if there's no match.");
    }
  };

  /* =====================================================
     STEP 4 CHECK + SAVE OBSERVATION
  ===================================================== */

  const handleCheckVerdict = () => {
    if (!verdictChoice) {
      alert("Select a verdict first.");
      return;
    }

    const status = normalize(verdictChoice) === normalize(sample.verdict) ? "correct" : "wrong";
    setVerdictStatus(status);

    if (status !== "correct") {
      alert("Wrong verdict. Check the Lookup Result above again.");
      return;
    }

    setVerdictLocked(true);

    setObservations((prev) => {
      if (prev.length >= 5) return prev;

      const newObservation = {
        attempt: prev.length + 1,
        caseId: sample.id,
        caseLabel: sample.label,
        username: sample.username,
        ntlmHash: sample.ntlmHash,
        recoveredPassword: sample.recoverable ? sample.recoveredPassword : "Not Recoverable",
        strength: sample.strength,
        verdict: sample.verdict,
        status: "Complete",
        timestamp: new Date().toISOString(),
      };

      return [...prev, newObservation];
    });

    setPhase(4);
  };

  /* =====================================================
     CONTINUE / NEW CASE / RESET
  ===================================================== */

  const handleContinue = (nextPhase) => {
    setPhase(nextPhase);
  };

  const handleNewTrace = () => {
    setSelectedCaseId("");
    setSample(null);

    setHashInput("");
    setHashStatus(null);
    setHashLocked(false);

    setDumpValues(emptyValues(DUMP_FIELDS));
    setDumpStatus({});
    setDumpLocked(false);

    setResultValues(emptyValues(RESULT_FIELDS));
    setResultStatus({});
    setResultLocked(false);

    setVerdictChoice("");
    setVerdictStatus(null);
    setVerdictLocked(false);

    setPhase(0);
    setSimulationStarted(false);
  };

  const handleReset = () => {
    handleNewTrace();
    setObservations([]);
    setActiveTab("simulation");
    setAnswers(Array(QUIZ.length).fill(null));
    setSubmitted(false);
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = () => {
    const unanswered = answers.some((answer) => answer === null);

    if (unanswered) {
      alert("Please answer all 20 questions in the Assignment tab before submitting.");
      setActiveTab("assignment");
      return;
    }

    if (submitted) return;

    if (!simulationCompleted) {
      alert(
        `You have completed ${observations.length} of 5 recoveries. Complete all 5 before submitting.`
      );
      setActiveTab("simulation");
      return;
    }

    const quizScore = answers.reduce(
      (total, answer, index) =>
        total + (answer === QUIZ[index].correct ? 1 : 0),
      0
    );

    const resultData = buildIfsResult({
      subjectCode: "IFS",
      experimentNo: 2,
      experimentName:
        "Recovery of the Password of Windows Machines using Password Recovery Utility",
      experimentRoute: "/ifs-experiment-2",

      quizScore,
      quizTotal: QUIZ.length,
      correctCount: quizScore,
      incorrectCount: QUIZ.length - quizScore,

      quizQuestions: QUIZ,
      quizAnswers: answers,

      successfulAttempts: Math.min(observations.length, 5),
      totalRequiredAttempts: 5,
      simulationCompleted: observations.length >= 5,
      observations,
      completed: true,
      date: new Date().toISOString(),
    });

    try {
      // Save the experiment-specific result
      localStorage.setItem(
        RESULT_STORAGE_KEY,
        JSON.stringify(resultData)
      );

      // Save the result for the common Result.jsx page
      localStorage.setItem(
        "assignmentResult",
        JSON.stringify(resultData)
      );
    } catch (error) {
      console.error("Error saving result:", error);
      alert("Your result could not be saved locally in this browser.");
      return;
    }

    setSubmitted(true);

    navigate("/result", {
      state: resultData,
    });
  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="pwrecover-root">

      <header className="exp-header">
        <button className="btn-back" onClick={() => navigate("/ifs-experiments")}>← Back</button>
        <h1 className="exp-title">
          Experiment 2: Recovery of the Password of Windows Machines using Password Recovery Utility
        </h1>
        <button className="btn-help" onClick={() => setHelpOpen(true)}>? Help</button>
      </header>

      <section className="card">
        <h2 className="section-heading orange">Aim</h2>
        <p>
          To recover the password of a Windows machine account using a password recovery utility by
          analysing the SAM database dump, identifying the target account's NTLM hash, looking it up in
          a hash database, and classifying the password as weak (recovered) or strong (not recoverable).
        </p>
      </section>

      <section className="card">
        <div className="collapsible-header" onClick={() => setTheoryOpen((v) => !v)}>
          <h2 className="section-heading orange">Theory</h2>
          <span className="chevron">{theoryOpen ? "▲" : "▼"}</span>
        </div>

        {theoryOpen && (
          <div className="collapsible-body">
            <p>
              Windows stores local account credentials in the SAM (Security Account Manager) database as
              hashed values, not in plain text. Each account entry records a username, a Relative
              Identifier (RID), an LM hash (usually disabled on modern systems) and an NTLM hash.
            </p>
            <p><b>Process:</b></p>
            <ol>
              <li>Obtain a SAM database dump (username:RID:LM-hash:NTLM-hash:::).</li>
              <li>Identify the target account and extract its NTLM hash.</li>
              <li>Record the account's RID, LM hash and account type.</li>
              <li>Submit the NTLM hash to a password recovery utility's hash database.</li>
              <li>Classify the account's password as weak (recovered) or strong (not recoverable).</li>
            </ol>
          </div>
        )}
      </section>

      <section className="card">
        <div className="collapsible-header" onClick={() => setProcOpen((v) => !v)}>
          <h2 className="section-heading orange">Procedure</h2>
          <span className="chevron">{procOpen ? "▲" : "▼"}</span>
        </div>

        {procOpen && (
          <div className="collapsible-body proc-grid">
            <ol className="proc-col">
              <li>Select an account case file from the dropdown.</li>
              <li>Click Start Recovery.</li>
              <li>Step 1 — copy the target account's NTLM hash.</li>
              <li>Step 2 — copy Username, RID, LM Hash, Account Type.</li>
              <li>Step 3 — copy the hash lookup result, or NOT FOUND.</li>
            </ol>
            <ol className="proc-col" start="6">
              <li>Step 4 — select the correct verdict.</li>
              <li>Click New Case and repeat with another case.</li>
              <li>Complete 5 successful recoveries.</li>
              <li>Answer all 20 assignment questions.</li>
              <li>Submit the experiment.</li>
            </ol>
          </div>
        )}
      </section>

      <div className="experiment-tabs">
        <button type="button" className={`experiment-tab ${activeTab === "simulation" ? "active" : ""}`} onClick={() => setActiveTab("simulation")}>
          🧪 Simulation {simulationCompleted && <span className="tab-check">✓</span>}
        </button>
        <button type="button" className={`experiment-tab ${activeTab === "assignment" ? "active" : ""}`} onClick={() => setActiveTab("assignment")}>
          📝 Assignment
        </button>
      </div>

      {activeTab === "simulation" && (
        <>
          <div className="sim-row">

            <aside className="card inputs-panel">
              <h3 className="panel-heading">Inputs</h3>

              <label className="field-label">Select Account Case File</label>
              <select
                className="column-select"
                value={selectedCaseId}
                disabled={simulationStarted}
                onChange={(e) => setSelectedCaseId(e.target.value)}
              >
                <option value="">— Select a case file —</option>
                {SAMPLES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {completedCaseIds.includes(item.id) ? `✓ ${item.label}` : item.label}
                  </option>
                ))}
              </select>

              <span className="hint-text">Six case files; trace any five.</span>

              <div className="action-buttons">
                {!simulationStarted && (
                  <button className="btn-verify full-width" onClick={handleStartTrace}>Start Recovery</button>
                )}
                <button className="btn-reset full-width" onClick={handleReset}>↺ Reset</button>
              </div>
            </aside>

            <div className="card canvas-panel">
              <h3 className="panel-heading">Simulation Canvas</h3>

              <div className="canvas-area">
                {!simulationStarted || !sample ? (
                  <div className="default-preview">
                    <p className="sim-intro">
                      <b>WinPassRecover Pro</b> — extract a Windows account's NTLM hash from a SAM dump,
                      look it up, and decide if the password was recovered.
                    </p>
                    <p className="sim-intro">Select a case file and click Start Recovery to begin.</p>
                  </div>
                ) : (
                  <ManualCanvasSimulation
                    sample={sample}
                    phase={phase}
                    hashInput={hashInput}
                    hashStatus={hashStatus}
                    hashLocked={hashLocked}
                    dumpValues={dumpValues}
                    dumpStatus={dumpStatus}
                    dumpLocked={dumpLocked}
                    resultValues={resultValues}
                    resultStatus={resultStatus}
                    resultLocked={resultLocked}
                    verdictChoice={verdictChoice}
                    verdictStatus={verdictStatus}
                    verdictLocked={verdictLocked}
                    onHashChange={(value) => setHashInput(value)}
                    onDumpChange={(key, value) => setDumpValues((prev) => ({ ...prev, [key]: value }))}
                    onResultChange={(key, value) => setResultValues((prev) => ({ ...prev, [key]: value }))}
                    onVerdictChange={(value) => setVerdictChoice(value)}
                    onCheckHash={handleCheckHash}
                    onCheckDump={handleCheckDump}
                    onCheckResult={handleCheckResult}
                    onCheckVerdict={handleCheckVerdict}
                    onContinue={handleContinue}
                    onNewTrace={handleNewTrace}
                  />
                )}
              </div>
            </div>

            <aside className="card analysis-panel">
              <h3 className="panel-heading orange">Live Status</h3>
              <div className="analysis-block">
                <table className="analysis-table">
                  <tbody>
                    <tr><td>Status</td><td>:</td><td>{!simulationStarted ? "Waiting" : phase === 4 ? "Completed" : `Step ${phase + 1} of 4`}</td></tr>
                    <tr><td>Case</td><td>:</td><td>{sample ? sample.id : "—"}</td></tr>
                    <tr><td>Username</td><td>:</td><td>{sample ? sample.username : "—"}</td></tr>
                    <tr><td>Recovered</td><td>:</td><td>{resultLocked && sample ? (sample.recoverable ? sample.recoveredPassword : "Not Recoverable") : "—"}</td></tr>
                  </tbody>
                </table>
              </div>
              {verdictLocked && sample && (
                <div className="analysis-block">
                  <h4 className="analysis-sub">Verdict</h4>
                  <p className="conclusion-text">{sample.verdict}</p>
                </div>
              )}
            </aside>

          </div>

          <section className="card table-section">
            <h3 className="panel-heading orange">Observation Table</h3>
            <div className="table-scroll">
              <table className="obs-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th><th>Case</th><th>Username</th><th>NTLM Hash</th>
                    <th>Recovered Password</th><th>Strength</th><th>Verdict</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {observations.length === 0 ? (
                    <tr><td colSpan="8">No account traced yet.</td></tr>
                  ) : (
                    observations.map((row, index) => (
                      <tr key={row.timestamp || index} className="row-correct">
                        <td>{index + 1}</td><td>{row.caseId}</td><td>{row.username}</td><td>{row.ntlmHash}</td>
                        <td>{row.recoveredPassword}</td><td>{row.strength}</td><td>{row.verdict}</td><td>✔ {row.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="submit-status sim-status">
              <p>
                Successful Recoveries: <b>{Math.min(successfulAttempts, 5)}/5</b>
                <br />
                {successfulAttempts < 5 ? `Complete ${5 - successfulAttempts} more to unlock the Assignment tab.` : "✔ Simulation completed."}
              </p>
            </div>
          </section>
        </>
      )}

      {activeTab === "assignment" && (
        <AssignmentScreen answers={answers} setAnswers={setAnswers} />
      )}

      <section className="submit-section">
        <button className={`btn-submit ${!submitted ? "enabled" : "disabled"}`} disabled={submitted} onClick={handleSubmit}>
          {submitted ? "Submitted" : "Submit Experiment"}
        </button>
        <div className="submit-status">
          {submitted ? (
            <p className="submit-success">Experiment Submitted Successfully</p>
          ) : (
            <p>
              Simulation: <b>{Math.min(successfulAttempts, 5)}/5</b>{"  |  "}
              Assignment: <b>{allAssignmentAnswered ? "Ready" : "Pending"}</b>
            </p>
          )}
        </div>
      </section>

      {helpOpen && (
        <div className="popup-overlay" onClick={() => setHelpOpen(false)}>
          <div className="popup-box help-popup" onClick={(e) => e.stopPropagation()}>
            <h3 className="section-heading orange">How to perform this experiment</h3>
            <p><b>1.</b> Select a case file and click Start Recovery.</p>
            <p><b>2.</b> Step 1 — copy the NTLM hash from the highlighted dump line.</p>
            <p><b>3.</b> Step 2 — copy Username, RID, LM Hash, Account Type.</p>
            <p><b>4.</b> Step 3 — look up the hash and copy the result, or type NOT FOUND.</p>
            <p><b>5.</b> Step 4 — pick the verdict based on the lookup result.</p>
            <button className="btn-verify full-width" onClick={() => setHelpOpen(false)}>Got it</button>
          </div>
        </div>
      )}

    </div>
  );
}
