import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildIfsResult } from "../../../utils/ifsResult.js";
import "./IFSExperiment8.css";
import {
  generateKeyPair,
  createSignature,
  verifySignature,
  exportPublicKey,
  calculateDigest,
  DIGEST_BITS,
} from "./cryptoUtils";

const MAX_MESSAGE_LENGTH = 100;
const DEFAULT_MESSAGE = "Transfer ₹1000 to Alice";
const PEOPLE = ["Alice", "Bob"];

const HASH_ALGORITHMS = [{ value: "SHA-256", label: "SHA-256" }];

const STEP_DEFS = [
  { step: 1, label: "Hash Message" },
  { step: 2, label: "Create Signature" },
  { step: 3, label: "Transfer" },
  { step: 4, label: "Verify" },
  { step: 5, label: "Result" },
];

/* ------------------------------------------------------------------ */
/* Inline icon components                                              */
/* These replace the old escape-sequence text (which rendered as       */
/* literal backslash-u strings instead of real symbols) with real,     */
/* dependency-free SVG icons that always render correctly.             */
/* ------------------------------------------------------------------ */
const IconArrowDown = ({ size = 18, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="4" x2="12" y2="18" /><polyline points="6 12 12 18 18 12" />
  </svg>
);
const IconArrowRight = ({ size = 14, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="18" y2="12" /><polyline points="12 6 18 12 12 18" />
  </svg>
);
const IconArrowLeft = ({ size = 14, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="20" y1="12" x2="6" y2="12" /><polyline points="12 18 6 12 12 6" />
  </svg>
);
const IconPencil = ({ size = 14, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const IconClipboard = ({ size = 14, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /><line x1="9" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="15" y2="14" />
  </svg>
);
const IconCheck = ({ size = 14, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconChevronUp = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const IconChevronDown = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconClose = ({ size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);
const IconLock = ({ size = 14, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
const IconCircle = ({ size = 10, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <circle cx="12" cy="12" r="9" />
  </svg>
);
const IconShieldCheck = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5l-8-3Z" />
    <polyline points="8.5 12 11 14.5 15.5 9.5" />
  </svg>
);
const IconShieldX = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5l-8-3Z" />
    <line x1="9.3" y1="9.3" x2="14.7" y2="14.7" /><line x1="14.7" y1="9.3" x2="9.3" y2="14.7" />
  </svg>
);
const IconAlert = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Contextual, per-step "How it works" copy                            */
/* Instead of one static card, this now reflects the live selections   */
/* (sender / receiver / algorithm / verification outcome) at every     */
/* step, so it stays informative rather than generic boilerplate.      */
/* ------------------------------------------------------------------ */
function getHowItWorks(step, ctx) {
  const { sender, receiver, hashAlgorithm, verificationKeyOwner, verification } = ctx;
  switch (step) {
    case 1:
      return [
        `The message is run through ${hashAlgorithm}.`,
        `This produces a fixed ${DIGEST_BITS[hashAlgorithm]}-bit digest unique to this exact text.`,
        "Changing even one character produces a completely different digest.",
      ];
    case 2:
      return [
        `${sender}'s private key signs the digest.`,
        "Only the holder of that private key can produce this exact signature.",
        "The signature travels with the message; the private key never leaves the sender.",
      ];
    case 3:
      return [
        `${sender} sends the message and signature to ${receiver}.`,
        `Try "Modify Received Message" to simulate tampering in transit.`,
        "Whatever arrives here is what gets checked in the next step.",
      ];
    case 4:
      return [
        `${receiver} re-hashes the received message with ${hashAlgorithm}.`,
        `${verificationKeyOwner}'s public key is used to check it against the signature.`,
        "Both the digest and the key pair must match for the signature to be valid.",
      ];
    case 5:
      return verification?.isValid
        ? [
            "The received digest matched the signed digest.",
            `${verificationKeyOwner}'s public key correctly paired with ${sender}'s private key.`,
            "The message is confirmed authentic and unaltered.",
          ]
        : [
            verification && !verification.hashMatch
              ? "The received message's digest did not match — the content was changed."
              : "The message content matched the original.",
            verification && !verification.keyMatch
              ? "The public key used does not correspond to the signer's private key."
              : "The correct key pair was used.",
            "Because a check failed, the signature is rejected.",
          ];
    default:
      return [
        "Fill in the message and choose your options.",
        "Click Start Signing to begin the simulation.",
      ];
  }
}

const QUESTIONS = [
  ["What is a digital signature used for?", ["Compressing a message", "Establishing authenticity and integrity", "Hiding a message", "Increasing message size"], 1],
  ["Which key creates a digital signature?", ["Public key", "Private key", "Hash key", "Session key"], 1],
  ["Which key verifies a digital signature?", ["Private key", "Session key", "Public key", "Secret key"], 2],
  ["What is a message digest?", ["Original message", "Encrypted message", "Fixed-length hash output", "Digital certificate"], 2],
  ["Which algorithm produces a 256-bit digest here?", ["MD5", "SHA-1", "SHA-256", "DES"], 2],
  ["What normally happens if a signed message is changed?", ["Signature remains valid", "Signature updates automatically", "Verification fails", "New private key is generated"], 2],
  ["Which step comes first conceptually?", ["Create signature", "Verify signature", "Hash message", "Transfer message"], 2],
  ["What does verification require?", ["Only visible signature", "Message, signature and public key", "Only private key", "Only original message"], 1],
  ["A successful verification means the signature is:", ["Invalid", "Suspicious", "Valid", "Encrypted"], 2],
  ["Which item is not required by the verifier?", ["Public key", "Message", "Signature", "Private key"], 3],
  ["Why hash a message before signing?", ["Hide it", "Create a fixed-size digest", "Make public key secret", "Encrypt it"], 1],
  ["What should be done with a private key?", ["Share it", "Keep it secret", "Publish it", "Put it in a public repository"], 1],
  ["Can a public key be shared?", ["No", "Yes, for verification", "Only with signer", "Only after signing"], 1],
  ["Private and public keys are:", ["Identical", "A mathematically related key pair", "Unrelated", "Copies"], 1],
  ["Signing differs from encryption because:", ["They are identical", "Signing supports authenticity/integrity; encryption primarily supports confidentiality", "Signing hides messages", "Encryption uses no keys"], 1],
  ["What happens if the supplied signature is modified?", ["Verification normally fails", "Public key changes", "Message is repaired", "Private key becomes public"], 0],
  ["Failed verification can indicate:", ["Message, signature or public key mismatch", "Message is authentic", "Private key must be shared", "Hash must be removed"], 0],
  ["What is processed to create the signing result?", ["Public key", "Message using SHA-256 hashing/signing process", "Verification result", "Receiver private key"], 1],
  ["A practical use of digital signatures is:", ["Verifying documents or software", "Increasing brightness", "Compressing files", "Replacing passwords"], 0],
  ["Why are browser-generated demonstration keys not for real security?", ["Too short to display", "No production key-management/identity infrastructure", "Cannot sign", "Not asymmetric"], 1],
].map(([q, options, correct], i) => {
  const explanations = [
    "A digital signature helps establish authenticity and integrity.",
    "The signer uses the private key to create the signature.",
    "The corresponding public key is used for verification.",
    "A cryptographic hash produces a fixed-length digest.",
    "SHA-256 produces a 256-bit digest.",
    "Changing the message changes its digest, so the original signature normally fails.",
    "The message is first processed by a cryptographic hash in the conceptual flow.",
    "Verification uses the received message, signature and corresponding public key.",
    "Successful verification means the supplied signature matches the message and key.",
    "The private key remains with the signer and is not required for verification.",
    "Hashing creates a fixed-size digest that can be signed.",
    "The private key must remain secret.",
    "The public key is intended to be distributed for verification.",
    "Asymmetric cryptography uses mathematically related keys.",
    "A signature supports authenticity/integrity; encryption provides confidentiality.",
    "Changing the signature makes verification fail.",
    "Failure may result from altered message, signature or public key.",
    "The signing operation is based on the message and cryptographic signing process.",
    "Digital signatures are used for documents, software and other digital data.",
    "Learning environments do not provide production key-management and identity controls.",
  ];
  return { q, options, correct, explanation: explanations[i] };
});

function truncateHex(str, head = 8, tail = 4) {
  if (!str) return "";
  const clean = str.replace(/\s+/g, "");
  if (clean.length <= head + tail + 3) return clean.toUpperCase();
  return `${clean.slice(0, head)}...${clean.slice(-tail)}`.toUpperCase();
}

function otherPerson(name) {
  return name === "Alice" ? "Bob" : "Alice";
}

export default function IFSExperiment8() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("simulation");
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procedureOpen, setProcedureOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  /* Key management: one real RSA-PSS key pair per person */
  const [keys, setKeys] = useState({});
  const [keysStatus, setKeysStatus] = useState("Generating...");
  const [keyError, setKeyError] = useState("");

  /* Inputs */
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [hashAlgorithm, setHashAlgorithm] = useState("SHA-256");
  const [sender, setSender] = useState("Alice");
  const [verificationKeyOwner, setVerificationKeyOwner] = useState("Alice");

  /* Simulation progress */
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = not started, 1..5
  const [processing, setProcessing] = useState(false);
  const [simError, setSimError] = useState("");

  /* Computed simulation data */
  const [originalDigest, setOriginalDigest] = useState("");
  const [signature, setSignature] = useState("");
  const [receivedMessage, setReceivedMessage] = useState("");
  const [editingReceived, setEditingReceived] = useState(false);
  const [receivedDigest, setReceivedDigest] = useState("");
  const [verification, setVerification] = useState(null);

  /* Persistent history log of every signature run this session.
     NOT cleared by Reset — only by the explicit "Clear Log" action. */
  const [signatureLog, setSignatureLog] = useState([]);

  /* Guard-rail popup (submit-before-ready, etc.) */
  const [modal, setModal] = useState(null);

  /* Assignment */
  const [answers, setAnswers] = useState(() => Array(QUESTIONS.length).fill(null));
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [viewAnswers, setViewAnswers] = useState(false);
  const answersSectionRef = useRef(null);

  const answeredCount = useMemo(() => answers.filter(a => a !== null).length, [answers]);
  const score = useMemo(() => answers.reduce((n, a, i) => n + (a === QUESTIONS[i].correct ? 1 : 0), 0), [answers]);

  const receiver = otherPerson(sender);
  const keysReady = Boolean(keys.Alice && keys.Bob);
  const stepsCompleted = Math.min(currentStep, 5);
  const simulationCompleted = stepsCompleted >= 5;

  useEffect(() => { initializeKeys(); }, []);

  async function initializeKeys() {
    try {
      setKeyError("");
      setKeysStatus("Generating...");
      const entries = {};
      for (const person of PEOPLE) {
        const pair = await generateKeyPair();
        const publicPem = await exportPublicKey(pair.publicKey);
        entries[person] = {
          privateKey: pair.privateKey,
          publicKey: pair.publicKey,
          publicPem,
        };
      }
      setKeys(entries);
      setKeysStatus("Ready");
    } catch (error) {
      setKeys({});
      setKeysStatus("Unavailable");
      setKeyError(error?.message || "RSA key generation is unavailable in this browser.");
    }
  }

  /* -------------------------------------------------------------------- */
  /* Simulation actions                                                    */
  /* -------------------------------------------------------------------- */

  async function handleStartSigning() {
    if (!message.trim() || !keysReady || processing) return;
    setProcessing(true);
    setSimError("");
    try {
      const digest = await calculateDigest(message, hashAlgorithm);
      const sig = await createSignature(keys[sender].privateKey, message);
      setOriginalDigest(digest);
      setSignature(sig);
      setReceivedMessage(message);
      setReceivedDigest("");
      setVerification(null);
      setEditingReceived(false);
      setStarted(true);
      setCurrentStep(1);
    } catch (error) {
      setSimError(error?.message || "Unable to start the signing simulation.");
    }
    setProcessing(false);
  }

  function goToStep(step) {
    setCurrentStep(step);
  }

  async function handleVerify() {
    if (processing) return;
    setProcessing(true);
    setSimError("");
    try {
      const recDigest = await calculateDigest(receivedMessage, hashAlgorithm);
      const hashMatch = recDigest === originalDigest;
      const keyMatch = verificationKeyOwner === sender;
      let cryptoValid = false;
      try {
        cryptoValid = await verifySignature(
          keys[verificationKeyOwner].publicPem,
          signature,
          receivedMessage
        );
      } catch {
        cryptoValid = false;
      }
      const isValid = hashMatch && keyMatch && cryptoValid;
      setReceivedDigest(recDigest);
      setVerification({ hashMatch, keyMatch, cryptoValid, isValid });
      setCurrentStep(5);

      /* Log this run permanently into the history table (issue 5) */
      setSignatureLog(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sr: prev.length + 1,
          message,
          receivedMessage,
          sender,
          receiver,
          hashAlgorithm,
          verificationKeyOwner,
          hashMatch,
          keyMatch,
          cryptoValid,
          isValid,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      setSimError(error?.message || "Verification failed.");
    }
    setProcessing(false);
  }

  function resetPractical() {
    setMessage(DEFAULT_MESSAGE);
    setHashAlgorithm("SHA-256");
    setSender("Alice");
    setVerificationKeyOwner("Alice");
    setStarted(false);
    setCurrentStep(0);
    setOriginalDigest("");
    setSignature("");
    setReceivedMessage("");
    setReceivedDigest("");
    setVerification(null);
    setEditingReceived(false);
    setSimError("");
    /* signatureLog is intentionally NOT cleared here — it persists
       across resets so every run stays in the observation history. */
  }

  /* -------------------------------------------------------------------- */
  /* Assignment actions                                                    */
  /* -------------------------------------------------------------------- */

  function selectAnswer(q, option) {
    if (assignmentSubmitted) return;
    setAnswers(prev => prev.map((v, i) => i === q ? option : v));
    setAssignmentError("");
  }

  function tryAgainAssignment() {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setAssignmentSubmitted(false);
    setViewAnswers(false);
    setAssignmentError("");
    setActiveTab("assignment");
  }

  function toggleViewAnswers() {
    setViewAnswers(v => {
      const next = !v;
      if (next) {
        setTimeout(() => answersSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
      }
      return next;
    });
  }

  /* -------------------------------------------------------------------- */
  /* Final submit — now always clickable; guides the student with a     */
  /* popup instead of a silently-disabled button (issue 6).               */
  /* -------------------------------------------------------------------- */
  function handleFinalSubmit() {
    if (!simulationCompleted) {
      setModal({
        title: "Simulation Not Complete",
        message: "Please finish all 5 simulation steps (Hash → Signature → Transfer → Verify → Result) before submitting the experiment.",
      });
      return;
    }
    const firstUnanswered = answers.findIndex(answer => answer === null);
    if (firstUnanswered !== -1) {
      setModal({
        title: "Assignment Not Complete",
        message: `Please answer Q${firstUnanswered + 1} before submitting the experiment.`,
      });
      setActiveTab("assignment");
      return;
    }

    setAssignmentSubmitted(true);
    setViewAnswers(false);
    setAssignmentError("");

    const resultData = buildIfsResult({
      completed: true,
      experimentNo: 8,
      experimentName: "Create Digital Signature",
      experimentRoute: "/ifs-experiment-8",
      simulationCompleted,
      sender,
      receiver,
      hashAlgorithm,
      verificationKeyOwner,
      verificationResult: verification,
      signatureLog,
      quizScore: score,
      quizTotal: QUESTIONS.length,
      correctCount: score,
      incorrectCount: QUESTIONS.length - score,
      quizAnswers: answers,
      quizQuestions: QUESTIONS,
      date: new Date().toISOString()
    });

    localStorage.setItem("digitalSignatureExp8Status", JSON.stringify(resultData));
    localStorage.setItem("assignmentResult", JSON.stringify(resultData));
    navigate("/result", { state: resultData });
  }

  /* -------------------------------------------------------------------- */
  /* Observation table (current run)                                       */
  /* -------------------------------------------------------------------- */

  const obsRows = useMemo(() => {
    const digestBits = DIGEST_BITS[hashAlgorithm] || 256;
    const done = (s) => currentStep >= s;
    const status = (s) => (done(s) ? "Completed" : "Pending");

    return [
      {
        sr: 1, step: "Hash Message",
        data: message,
        keyUsed: "—",
        value: done(1) ? truncateHex(originalDigest) : "—",
        result: done(1) ? "Digest Generated" : "Pending",
        remarks: done(1) ? `Hash successfully generated (${digestBits}-bit).` : "—",
        status: status(1),
      },
      {
        sr: 2, step: "Create Signature",
        data: message,
        keyUsed: `${sender} (Private Key)`,
        value: done(2) ? truncateHex(signature) : "—",
        result: done(2) ? "Signature Created" : "Pending",
        remarks: done(2) ? "Digital signature created." : "—",
        status: status(2),
      },
      {
        sr: 3, step: "Transfer",
        data: message,
        keyUsed: "—",
        value: done(3) ? "Message + Signature" : "—",
        result: done(3) ? "Data Transferred" : "Pending",
        remarks: done(3) ? `Sent from ${sender} to ${receiver}.` : "—",
        status: status(3),
      },
      {
        sr: 4, step: "Verify",
        data: done(3) ? receivedMessage : message,
        keyUsed: `${verificationKeyOwner} (Public Key)`,
        value: done(4) && verification ? (verification.hashMatch ? "Match" : "Mismatch") : "—",
        result: done(4) ? "Verification Done" : "Pending",
        remarks: done(4) ? "Digests compared." : "—",
        status: status(4),
      },
      {
        sr: 5, step: "Result",
        data: done(3) ? receivedMessage : message,
        keyUsed: `${verificationKeyOwner} (Public Key)`,
        value: done(5) && verification ? (verification.isValid ? "Valid" : "Invalid") : "—",
        result: done(5) ? (verification?.isValid ? "Valid" : "Invalid") : "Pending",
        remarks: done(5) ? "Final result observed." : "—",
        status: status(5),
      },
    ];
  }, [currentStep, message, sender, receiver, signature, originalDigest, receivedMessage, verificationKeyOwner, verification, hashAlgorithm]);

  const currentOperationLabel = STEP_DEFS.find(s => s.step === currentStep)?.label || "Not Started";
  const currentOperationMessage = currentStep >= 3 ? receivedMessage : message;
  const currentOperationStatus =
    currentStep === 0 ? "Not Started" :
    currentStep === 5 ? (verification?.isValid ? "Valid" : "Invalid") :
    "In Progress";

  const howItWorks = getHowItWorks(currentStep, { sender, receiver, hashAlgorithm, verificationKeyOwner, verification });

  const validRuns = signatureLog.filter(l => l.isValid).length;
  const invalidRuns = signatureLog.length - validRuns;

  return (
    <div className="ifs8-root">
      <header className="exp-header">
        <button className="header-btn" onClick={() => navigate("/ifs-experiments")}><IconArrowLeft size={14} /> Back</button>
        <h1 className="exp-title">Experiment 8 : Create Digital Signature</h1>
        <button className="header-btn" onClick={() => setInfoOpen(v => !v)}>? Help</button>
      </header>

      <section className="card aim-card">
        <div>
          <h2 className="section-heading orange">Aim</h2>
          <p>To create and verify a digital signature for a message.</p>
        </div>
      </section>

      <section className="card">
        <button className="collapsible-header" onClick={() => setTheoryOpen(v => !v)}>
          <span className="section-heading orange">Theory</span>
          <span className="chevron">{theoryOpen ? <IconChevronUp /> : <IconChevronDown />}</span>
        </button>
        {theoryOpen && <div className="collapsible-body">
          <p>A digital signature is used to verify:</p>
          <ul className="theory-list">
            <li><strong>Authenticity</strong> — the message was signed using the corresponding private key.</li>
            <li><strong>Integrity</strong> — the message has not been changed after signing.</li>
          </ul>
          <div className="theory-flow-pair">
            <div className="theory-flow">
              <span className="theory-flow-title">Basic Process</span>
              <div className="theory-flow-step">Message</div>
              <div className="theory-flow-step">Hash Function</div>
              <div className="theory-flow-step">Message Digest</div>
              <div className="theory-flow-step">Private Key</div>
              <div className="theory-flow-step result">Digital Signature</div>
            </div>
            <div className="theory-flow">
              <span className="theory-flow-title">Verification</span>
              <div className="theory-flow-step flow-inline">
                <span>Received Message</span><IconArrowRight size={11} /><span>Hashing</span><IconArrowRight size={11} /><span>New Digest</span>
              </div>
              <div className="theory-flow-step flow-inline">
                <span>Signature</span><IconArrowRight size={11} /><span>Public Key</span><IconArrowRight size={11} /><span>Signed Digest</span>
              </div>
              <div className="theory-flow-step result flow-inline">
                <span>Compare</span><IconArrowRight size={11} /><span>Valid / Invalid</span>
              </div>
            </div>
          </div>
        </div>}
      </section>

      <section className="card">
        <button className="collapsible-header" onClick={() => setProcedureOpen(v => !v)}>
          <span className="section-heading orange">Procedure</span>
          <span className="chevron">{procedureOpen ? <IconChevronUp /> : <IconChevronDown />}</span>
        </button>
        {procedureOpen && <div className="collapsible-body proc-grid">
          <ol className="proc-col">
            <li>Enter the message to be digitally signed.</li>
            <li>Select the hash algorithm.</li>
            <li>Select the sender and corresponding private key.</li>
            <li>Generate the message digest.</li>
            <li>Create the digital signature.</li>
          </ol>
          <ol className="proc-col" start="6">
            <li>Transfer the message and signature to the receiver.</li>
            <li>Verify the signature using the corresponding public key.</li>
            <li>Observe the hash comparison and verification result.</li>
            <li>Modify the message and repeat verification to observe the effect.</li>
            <li>Complete all 20 assignment questions.</li>
          </ol>
        </div>}
      </section>

      {infoOpen && <section className="card info-card">
        <div><strong>Educational Demonstration</strong><p>Generated browser keys are for learning only and should not be used for real security.</p></div>
        <button className="close-info" onClick={() => setInfoOpen(false)}><IconClose size={14} /></button>
      </section>}

      <div className="experiment-tabs">
        <button className={`experiment-tab tab-simulation ${activeTab === "simulation" ? "active" : ""}`} onClick={() => setActiveTab("simulation")}>
          <span className="tab-icon"><IconPencil size={14} /></span> Simulation
        </button>
        <button className={`experiment-tab tab-assignment ${activeTab === "assignment" ? "active" : ""}`} onClick={() => setActiveTab("assignment")}>
          <span className="tab-icon"><IconClipboard size={14} /></span> Assignment <span className="tab-progress">{answeredCount}/20</span>
        </button>
      </div>

      {activeTab === "simulation" && <>
        <div className="sim-row">
          {/* ------------------------------------------------------------ */}
          {/* INPUTS PANEL                                                  */}
          {/* ------------------------------------------------------------ */}
          <aside className="card inputs-panel">
            <h2 className="panel-heading">Inputs</h2>

            <label className="field-label">Message</label>
            <textarea
              className="message-input"
              value={message}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder="Enter message to sign"
              disabled={started}
              onChange={e => setMessage(e.target.value)}
            />
            <div className="char-count">{message.length}/{MAX_MESSAGE_LENGTH}</div>

            <label className="field-label">Hash Algorithm</label>
            <select className="input-select" value={hashAlgorithm} disabled={started} onChange={e => setHashAlgorithm(e.target.value)}>
              {HASH_ALGORITHMS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>

            <label className="field-label">Sender (Private Key)</label>
            <select className="input-select" value={sender} disabled={started} onChange={e => setSender(e.target.value)}>
              {PEOPLE.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <label className="field-label">Verification Key (Public Key)</label>
            <select className="input-select" value={verificationKeyOwner} onChange={e => setVerificationKeyOwner(e.target.value)}>
              {PEOPLE.map(p => <option key={p} value={p}>{p}'s Public Key</option>)}
            </select>

            {!keysReady && !keyError && <div className="key-status-note">Generating RSA key pairs… ({keysStatus})</div>}
            {keyError && <div className="error-box">{keyError}</div>}
            {simError && <div className="error-box">{simError}</div>}

            <button
              className="start-signing-btn full-width"
              disabled={!keysReady || !message.trim() || started || processing}
              onClick={handleStartSigning}
            >
              {processing && !started ? "Starting…" : "Start Signing"}
            </button>
            <button className="reset-btn full-width" onClick={resetPractical}>Reset</button>
          </aside>

          {/* ------------------------------------------------------------ */}
          {/* SIMULATION CANVAS                                             */}
          {/* ------------------------------------------------------------ */}
          <main className="card canvas-panel">
            <h2 className="panel-heading">Simulation Canvas</h2>

            <div className="stepper">
              {STEP_DEFS.map((s, idx) => (
                <div className="stepper-item" key={s.step}>
                  <div className={`stepper-dot ${currentStep === s.step ? "active" : ""} ${currentStep > s.step ? "done" : ""}`}>
                    {currentStep > s.step ? <IconCheck size={13} /> : s.step}
                  </div>
                  <span className={`stepper-label ${currentStep === s.step ? "active" : ""}`}>{s.label}</span>
                  {idx < STEP_DEFS.length - 1 && <div className={`stepper-line ${currentStep > s.step ? "done" : ""}`} />}
                </div>
              ))}
            </div>

            {currentStep === 0 && (
              <div className="step-panel step-empty">
                <p>Fill in the inputs on the left and click <strong>Start Signing</strong> to begin.</p>
              </div>
            )}

            {currentStep === 1 && (
              <div className="step-panel">
                <div className="step-title">STEP 1: HASH MESSAGE</div>
                <div className="flow-row vertical">
                  <div className="flow-box tone-blue">
                    <span className="flow-box-label">Message</span>
                    <div className="flow-box-value">{message}</div>
                  </div>
                  <span className="flow-arrow"><IconArrowDown /></span>
                  <div className="flow-box tone-pink">
                    <span className="flow-box-label">Hash Algorithm</span>
                    <div className="flow-box-value">{hashAlgorithm}</div>
                  </div>
                  <span className="flow-arrow"><IconArrowDown /></span>
                  <div className="flow-box tone-green">
                    <span className="flow-box-label">Message Digest</span>
                    <div className="flow-box-value mono">{originalDigest}</div>
                  </div>
                </div>
                <div className="digest-length">Digest Length: {DIGEST_BITS[hashAlgorithm]} bits</div>
                <div className="info-note">Hashing converts the message into a fixed-length digest. Even a small change in the message will produce a completely different digest.</div>
                <div className="step-actions"><button className="next-btn" onClick={() => goToStep(2)}>Next <IconArrowRight size={13} /></button></div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="step-panel">
                <div className="step-title">STEP 2: CREATE DIGITAL SIGNATURE</div>
                <div className="flow-row vertical">
                  <div className="flow-box tone-green">
                    <span className="flow-box-label">Message Digest</span>
                    <div className="flow-box-value mono">{truncateHex(originalDigest)}</div>
                  </div>
                  <span className="flow-arrow"><IconArrowDown /></span>
                  <div className="flow-box tone-orange">
                    <span className="flow-box-label">Private Key</span>
                    <div className="flow-box-value">{sender}'s Private Key</div>
                  </div>
                  <span className="flow-arrow"><IconArrowDown /></span>
                  <div className="flow-box tone-purple">
                    <span className="flow-box-label">Digital Signature</span>
                    <div className="flow-box-value mono">{truncateHex(signature)}</div>
                  </div>
                </div>
                <div className="info-note">The digest is combined with the sender's private key to produce a digital signature. This proves the message came from {sender} and was not altered.</div>
                <div className="step-actions"><button className="next-btn" onClick={() => goToStep(3)}>Next <IconArrowRight size={13} /></button></div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="step-panel">
                <div className="step-title">STEP 3: TRANSFER</div>
                <div className="transfer-grid">
                  <div className="transfer-col">
                    <div className="transfer-name sender">{sender}</div>
                    <div className="transfer-role">SENDER</div>
                  </div>
                  <div className="transfer-channel">
                    <div className="transfer-item">Message <IconArrowRight size={12} className="transfer-arrow" /></div>
                    <div className="transfer-item">Signature <IconArrowRight size={12} className="transfer-arrow" /></div>
                    <div className="transfer-channel-label">TRANSMISSION CHANNEL</div>
                  </div>
                  <div className="transfer-col">
                    <div className="transfer-name receiver">{receiver}</div>
                    <div className="transfer-role">RECEIVER</div>
                  </div>
                </div>

                <button className="outline-btn" onClick={() => setEditingReceived(v => !v)}>
                  {editingReceived ? "Done Editing" : "Modify Received Message"}
                </button>

                {editingReceived ? (
                  <textarea
                    className="message-input"
                    value={receivedMessage}
                    maxLength={MAX_MESSAGE_LENGTH}
                    onChange={e => setReceivedMessage(e.target.value)}
                  />
                ) : (
                  <div className="received-preview">
                    <span className="field-label">Received Message</span>
                    <div className="flow-box-value">{receivedMessage}</div>
                  </div>
                )}
                {receivedMessage !== message && (
                  <div className="info-note warn">The received message differs from the original signed message.</div>
                )}
                <div className="step-actions"><button className="next-btn" onClick={() => goToStep(4)}>Next <IconArrowRight size={13} /></button></div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="step-panel">
                <div className="step-title">STEP 4: VERIFY SIGNATURE</div>
                <div className="flow-row vertical">
                  <div className="flow-box tone-blue">
                    <span className="flow-box-label">Received Message</span>
                    <div className="flow-box-value">{receivedMessage}</div>
                  </div>
                  <span className="flow-arrow"><IconArrowDown /></span>
                  <div className="flow-box tone-pink">
                    <span className="flow-box-label">Hash Algorithm</span>
                    <div className="flow-box-value">{hashAlgorithm}</div>
                  </div>
                  <span className="flow-arrow"><IconArrowDown /></span>
                  <div className="flow-box tone-green">
                    <span className="flow-box-label">Received Message Digest</span>
                    <div className="flow-box-value mono">{receivedDigest || "— will be calculated on Verify —"}</div>
                  </div>
                </div>
                <div className="flow-row vertical">
                  <div className="flow-box tone-purple">
                    <span className="flow-box-label">Digital Signature</span>
                    <div className="flow-box-value mono">{truncateHex(signature)}</div>
                  </div>
                  <span className="flow-arrow"><IconArrowDown /></span>
                  <div className="flow-box tone-orange">
                    <span className="flow-box-label">Verification Key</span>
                    <div className="flow-box-value">{verificationKeyOwner}'s Public Key</div>
                  </div>
                  <span className="flow-arrow"><IconArrowDown /></span>
                  <div className="flow-box tone-green">
                    <span className="flow-box-label">Signed Digest</span>
                    <div className="flow-box-value mono">{truncateHex(originalDigest)}</div>
                  </div>
                </div>
                <div className="step-actions"><button className="next-btn" disabled={processing} onClick={handleVerify}>{processing ? "Verifying…" : "Verify"}</button></div>
              </div>
            )}

            {currentStep === 5 && verification && (
              <div className={`step-panel result-panel ${verification.isValid ? "valid" : "invalid"}`}>
                <div className="result-icon">{verification.isValid ? <IconShieldCheck /> : <IconShieldX />}</div>
                <div className="result-heading">{verification.isValid ? "SIGNATURE VERIFIED" : "SIGNATURE VERIFICATION FAILED"}</div>

                <div className="result-summary-grid">
                  <div className="result-summary-item"><span>Signed By</span><strong>{sender}</strong></div>
                  <div className="result-summary-item"><span>Received By</span><strong>{receiver}</strong></div>
                  <div className="result-summary-item"><span>Hash Algorithm</span><strong>{hashAlgorithm}</strong></div>
                  <div className="result-summary-item"><span>Verification Key</span><strong>{verificationKeyOwner}'s Public Key</strong></div>
                </div>

                <div className="result-rows">
                  <div className="result-row"><span>Original Message</span><code className="wrap">{message}</code></div>
                  <div className="result-row"><span>Received Message</span><code className="wrap">{receivedMessage}</code></div>
                  <div className="result-row"><span>Signed Digest</span><code>{truncateHex(originalDigest)}</code></div>
                  <div className="result-row"><span>Received Digest</span><code>{truncateHex(receivedDigest)}</code></div>
                  <div className="result-row"><span>Hash Comparison</span><strong className={verification.hashMatch ? "ok" : "bad"}>{verification.hashMatch ? "MATCH" : "MISMATCH"}</strong></div>
                  <div className="result-row"><span>Key Pair</span><strong className={verification.keyMatch ? "ok" : "bad"}>{verification.keyMatch ? "MATCH" : "MISMATCH"}</strong></div>
                </div>

                <div className="result-banner">
                  DIGITAL SIGNATURE IS {verification.isValid ? "VALID" : "INVALID"}
                </div>

                {verification.isValid ? (
                  <div className="result-reason ok-reason">
                    <strong>What this proves:</strong>
                    <ul>
                      <li>The message was not altered after {sender} signed it.</li>
                      <li>The signature could only have been produced with {sender}'s private key.</li>
                      <li>{receiver} can trust that the message genuinely came from {sender}.</li>
                    </ul>
                  </div>
                ) : (
                  <div className="result-reason bad-reason">
                    <strong>What went wrong:</strong>
                    <ul>
                      {!verification.hashMatch && <li>The received message differs from the message that was originally signed — its digest no longer matches.</li>}
                      {!verification.keyMatch && <li>The verification key selected ({verificationKeyOwner}'s) does not correspond to the private key that created the signature ({sender}'s).</li>}
                      {verification.hashMatch && verification.keyMatch && !verification.cryptoValid && <li>The cryptographic check itself failed — the signature bytes do not match this message and key.</li>}
                    </ul>
                    <p className="fix-hint">Tip: go back to Step 3 to restore the original message, or select {sender}'s public key in Step 4, then verify again.</p>
                  </div>
                )}

                <div className="step-actions"><button className="outline-btn" onClick={resetPractical}>Run New Simulation</button></div>
              </div>
            )}
          </main>

          {/* ------------------------------------------------------------ */}
          {/* LIVE ANALYSIS PANEL                                           */}
          {/* ------------------------------------------------------------ */}
          <aside className="card analysis-panel">
            <h2 className="panel-heading orange">Live Analysis</h2>

            <div className="analysis-card">
              <div className="analysis-card-title">CURRENT OPERATION</div>
              <div className="analysis-row"><span>Operation</span><strong>{currentOperationLabel}</strong></div>
              <div className="analysis-row"><span>Message</span><strong className="truncate-text">{currentOperationMessage || "—"}</strong></div>
              <div className="analysis-row"><span>Hash Algorithm</span><strong>{hashAlgorithm}</strong></div>
              <div className="analysis-row"><span>Sender</span><strong>{sender}{currentStep >= 2 ? " (Private Key)" : ""}</strong></div>
              <div className="analysis-row"><span>Status</span><strong className={
                currentOperationStatus === "Valid" ? "ok" : currentOperationStatus === "Invalid" ? "bad" : ""
              }>{currentOperationStatus}</strong></div>
            </div>

            <div className="analysis-card">
              <div className="analysis-card-title">HOW IT WORKS</div>
              <ol className="how-it-works-list">
                {howItWorks.map((line, i) => <li key={i}>{line}</li>)}
              </ol>
            </div>
          </aside>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* OBSERVATION TABLE (current run)                               */}
        {/* ------------------------------------------------------------ */}
        <section className="card obs-table-card">
          <h2 className="panel-heading">Observation Table</h2>
          <div className="obs-table-scroll">
            <table className="obs-table">
              <thead>
                <tr>
                  <th>Sr. No.</th><th>Step</th><th>Message / Data</th><th>Hash Algorithm</th>
                  <th>Key Used</th><th>Digest / Signature</th><th>Result</th><th>Remarks</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {obsRows.map(row => (
                  <tr key={row.sr}>
                    <td>{row.sr}</td>
                    <td className="obs-step-cell">{row.step}</td>
                    <td className="truncate-cell">{row.data}</td>
                    <td>{hashAlgorithm}</td>
                    <td>{row.keyUsed}</td>
                    <td className="mono">{row.value}</td>
                    <td>{row.result}</td>
                    <td className="truncate-cell">{row.remarks}</td>
                    <td>
                      <span className={`obs-status ${row.status === "Completed" ? "completed" : "pending"}`}>
                        {row.status === "Completed" ? <><IconCheck size={10} /> Completed</> : <><IconCircle size={8} /> Pending</>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* SIGNATURE EXECUTION LOG (persists across resets)              */}
        {/* ------------------------------------------------------------ */}
        <section className="card log-card">
          <div className="log-header">
            <h2 className="panel-heading">Signature Execution Log</h2>
            {signatureLog.length > 0 && (
              <button className="outline-btn small" onClick={() => setSignatureLog([])}>Clear Log</button>
            )}
          </div>
          {signatureLog.length === 0 ? (
            <p className="log-empty">No signatures verified yet. Complete a run (through Step 5) to log it here — this table keeps every run from this session, even after Reset.</p>
          ) : (
            <>
              <div className="log-summary-row">
                <div className="log-summary-chip total">Total Runs: {signatureLog.length}</div>
                <div className="log-summary-chip valid"><IconCheck size={11} /> Valid: {validRuns}</div>
                <div className="log-summary-chip invalid"><IconClose size={11} /> Invalid: {invalidRuns}</div>
              </div>
              <div className="obs-table-scroll">
                <table className="obs-table">
                  <thead>
                    <tr>
                      <th>Run #</th><th>Message</th><th>Sender</th><th>Receiver</th><th>Hash Algo</th>
                      <th>Verify Key</th><th>Hash</th><th>Key</th><th>Result</th><th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signatureLog.map(l => (
                      <tr key={l.id}>
                        <td>{l.sr}</td>
                        <td className="truncate-cell">{l.message}</td>
                        <td>{l.sender}</td>
                        <td>{l.receiver}</td>
                        <td>{l.hashAlgorithm}</td>
                        <td>{l.verificationKeyOwner}</td>
                        <td><strong className={l.hashMatch ? "ok" : "bad"}>{l.hashMatch ? "Match" : "Mismatch"}</strong></td>
                        <td><strong className={l.keyMatch ? "ok" : "bad"}>{l.keyMatch ? "Match" : "Mismatch"}</strong></td>
                        <td>
                          <span className={`obs-status ${l.isValid ? "completed" : "pending"}`}>
                            {l.isValid ? <><IconCheck size={10} /> Valid</> : <><IconClose size={10} /> Invalid</>}
                          </span>
                        </td>
                        <td>{l.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {!simulationCompleted && (
          <div className="submit-note">Complete all 5 steps to enable submission.</div>
        )}
        <section className="submit-section">
          <button className={`final-submit-btn ${simulationCompleted ? "ready" : "attention"}`} onClick={handleFinalSubmit}>
            {simulationCompleted ? <><IconCheck size={14} /> Submit Experiment</> : <><IconLock size={14} /> Submit Experiment</>}
          </button>
          <div className="steps-progress-text">{stepsCompleted} / 5 steps completed</div>
        </section>
      </>}

      {activeTab === "assignment" && <section className="card quiz-card">
        <div className="quiz-header">
          <div><h2 className="panel-heading">Assignment — 20 Questions</h2><p>Select one answer for each question. Correct answers appear after submission.</p></div>
          <div className="quiz-count">{answeredCount}/20 Answered</div>
        </div>
        {assignmentError && <div className="assignment-error">{assignmentError}</div>}

        {assignmentSubmitted && (
          <div className="assignment-complete-panel">
            <div className="complete-icon"><IconShieldCheck size={40} /></div>
            <h3>Experiment Submitted Successfully</h3>
            <div className="complete-score">{score}/20</div>
            <p>You answered {score} out of 20 questions correctly.</p>
            <div className="complete-actions">
              <button className="outline-btn" onClick={tryAgainAssignment}>Try Again</button>
              <button className="outline-btn" onClick={() => navigate("/")}>Back to Dashboard</button>
              <button className="primary-btn" onClick={toggleViewAnswers}>{viewAnswers ? "Hide Answers" : "View Answers"}</button>
            </div>
          </div>
        )}

        {(!assignmentSubmitted || viewAnswers) && (
          <div className="quiz-list" ref={answersSectionRef}>{QUESTIONS.map((q, qi) => {
            const selected = answers[qi];
            return <article className={`quiz-question ${assignmentSubmitted ? selected === q.correct ? "question-correct" : "question-wrong" : ""}`} key={q.q}>
              <div className="question-heading"><span>Q{qi + 1}</span><p>{q.q}</p>{assignmentSubmitted && <strong>{selected === q.correct ? "Correct" : "Incorrect"}</strong>}</div>
              <div className="quiz-options">{q.options.map((option, oi) => {
                const isSelected = selected === oi;
                const isCorrect = assignmentSubmitted && oi === q.correct;
                const isWrong = assignmentSubmitted && isSelected && oi !== q.correct;
                return <label key={option} className={`quiz-option ${isSelected ? "quiz-selected" : ""} ${isCorrect ? "quiz-correct" : ""} ${isWrong ? "quiz-wrong" : ""}`}>
                  <input type="radio" name={`q-${qi}`} checked={isSelected} disabled={assignmentSubmitted} onChange={() => selectAnswer(qi, oi)} />
                  <span className="option-letter">{String.fromCharCode(65 + oi)}</span><span>{option}</span>
                </label>;
              })}</div>
              {assignmentSubmitted && <div className="answer-review"><p><strong>Your Answer:</strong> {selected === null ? "Not answered" : `${String.fromCharCode(65 + selected)}. ${q.options[selected]}`}</p><p><strong>Correct Answer:</strong> {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}</p><p><strong>Explanation:</strong> {q.explanation}</p></div>}
            </article>;
          })}</div>
        )}

        {!assignmentSubmitted && <div className="assignment-submit-row"><button className="submit-assignment-btn" onClick={handleFinalSubmit}>Submit Experiment</button></div>}
      </section>}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><IconAlert /></div>
            <h3>{modal.title}</h3>
            <p>{modal.message}</p>
            <button className="modal-close-btn" onClick={() => setModal(null)}>Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}