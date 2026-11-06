import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { buildIfsResult } from "../../../utils/ifsResult.js";
import "./IFSExperiment9.css";

/* =========================================================
   STEGHIDE STEGANOGRAPHY EXPERIMENT
========================================================= */

const REQUIRED_SUCCESS = 5;

/* =========================================================
   ASSIGNMENT QUESTION BANK
========================================================= */

const QUIZ = [
  {
    q: "What is steganography?",
    options: [
      "A technique for compressing files",
      "A technique for hiding information inside another medium",
      "A technique for deleting files",
      "A technique for encrypting only passwords",
    ],
    correct: 1,
  },
  {
    q: "What is the main purpose of Steghide?",
    options: [
      "To hide data inside supported media files",
      "To create operating systems",
      "To format hard disks",
      "To scan computer viruses",
    ],
    correct: 0,
  },
  {
    q: "Which file can commonly be used as a cover medium with Steghide?",
    options: [
      "JPEG image",
      "EXE program only",
      "HTML page only",
      "Database only",
    ],
    correct: 0,
  },
  {
    q: "What is a cover file?",
    options: [
      "The file containing the hidden message",
      "The original media file used to hide secret data",
      "The password file",
      "The extracted text file",
    ],
    correct: 1,
  },
  {
    q: "What is a stego file?",
    options: [
      "A file containing embedded secret information",
      "A deleted file",
      "A system configuration file",
      "A temporary cache file",
    ],
    correct: 0,
  },
  {
    q: "What is required to protect the embedded data in Steghide?",
    options: [
      "A passphrase",
      "A printer",
      "A network cable",
      "A browser extension",
    ],
    correct: 0,
  },
  {
    q: "Which operation hides secret information inside a cover file?",
    options: [
      "Extract",
      "Embed",
      "Delete",
      "Format",
    ],
    correct: 1,
  },
  {
    q: "Which operation retrieves hidden information from a stego file?",
    options: [
      "Embed",
      "Extract",
      "Compress",
      "Rename",
    ],
    correct: 1,
  },
  {
    q: "What is the role of the secret message?",
    options: [
      "It is the information that is intended to be hidden",
      "It is the cover image",
      "It is the output filename",
      "It is the file extension",
    ],
    correct: 0,
  },
  {
    q: "What does the receiver need to extract protected embedded data?",
    options: [
      "The stego file and correct passphrase",
      "Only the original filename",
      "Only the file extension",
      "A new cover image",
    ],
    correct: 0,
  },
  {
    q: "Which process represents hiding data?",
    options: [
      "Secret message → Cover file → Stego file",
      "Stego file → Secret message → Cover file",
      "Password → Cover file → Delete",
      "Receiver → Sender → Password",
    ],
    correct: 0,
  },
  {
    q: "Which process represents receiving hidden data?",
    options: [
      "Stego file → Passphrase → Extracted message",
      "Message → Delete → Stego file",
      "Cover file → Format → Password",
      "Password → Compress → Cover file",
    ],
    correct: 0,
  },
  {
    q: "Why is a cover file used in steganography?",
    options: [
      "To provide a medium in which information can be concealed",
      "To remove the password",
      "To increase internet speed",
      "To install Steghide",
    ],
    correct: 0,
  },
  {
    q: "What happens if an incorrect passphrase is supplied during extraction?",
    options: [
      "The hidden message should not be successfully recovered",
      "The computer automatically restarts",
      "The image becomes a video",
      "The message becomes public",
    ],
    correct: 0,
  },
  {
    q: "Which statement best describes a stego image?",
    options: [
      "An image carrying hidden information",
      "An image with no data",
      "A deleted image",
      "An image containing only a password",
    ],
    correct: 0,
  },
  {
    q: "What is the difference between encryption and steganography?",
    options: [
      "Encryption hides the meaning of data, while steganography hides the existence/location of data",
      "They are always exactly the same",
      "Steganography only deletes data",
      "Encryption only works with images",
    ],
    correct: 0,
  },
  {
    q: "In a sender-receiver steganography system, who embeds the message?",
    options: [
      "Sender",
      "Receiver",
      "Operating system",
      "Printer",
    ],
    correct: 0,
  },
  {
    q: "Who extracts the hidden message?",
    options: [
      "Sender",
      "Receiver",
      "Cover file",
      "Image editor",
    ],
    correct: 1,
  },
  {
    q: "What should the receiver verify after extraction?",
    options: [
      "Whether the extracted message matches the intended secret message",
      "Whether the image has become larger",
      "Whether the computer is restarted",
      "Whether the browser is closed",
    ],
    correct: 0,
  },
  {
    q: "Which sequence correctly represents the complete practical?",
    options: [
      "Select cover → enter message → set passphrase → embed → send → receive → extract → verify",
      "Extract → delete → format → send",
      "Send → format → embed → delete",
      "Password → delete image → receive",
    ],
    correct: 0,
  },
];

/* =========================================================
   DEFAULT PREVIEW
========================================================= */

function DefaultPreview() {
  return (
    <div className="stg-preview-scroll">

      <div className="default-preview">

        <div className="default-example">

          <div className="example-row">
            <span className="example-label">
              Cover File
            </span>

            <span className="example-value">
              secret_photo.jpg
            </span>
          </div>

          <div className="example-row">
            <span className="example-label">
              Secret Message
            </span>

            <span className="example-value">
              Meet at 3 PM
            </span>
          </div>

          <div className="example-row">
            <span className="example-label">
              Output
            </span>

            <span className="example-value">
              secret_photo_stego.jpg
            </span>
          </div>

        </div>

        <div className="stg-static-steps">

          <div className="stg-static-block">

            <h4 className="stg-static-title">
              1. Select Cover File
            </h4>

            <p className="stg-static-theory">
              Select a supported image file that will
              act as the cover medium for hiding the
              secret information.
            </p>

            <div className="stg-file-preview">

              <span className="file-icon">
                🖼
              </span>

              <div>
                <b>
                  secret_photo.jpg
                </b>

                <small>
                  Cover Image
                </small>
              </div>

            </div>

          </div>

          <div className="stg-static-block">

            <h4 className="stg-static-title">
              2. Prepare Secret Message
            </h4>

            <p className="stg-static-theory">
              The sender enters the message that must
              be hidden inside the selected cover file.
            </p>

            <div className="secret-message-preview">
              Meet at 3 PM
            </div>

          </div>

          <div className="stg-static-block">

            <h4 className="stg-static-title">
              3. Embed Secret Data
            </h4>

            <div className="stg-flow">

              <span>
                Cover Image
              </span>

              <b>
                ＋
              </b>

              <span>
                Secret Message
              </span>

              <b>
                ＋
              </b>

              <span>
                Passphrase
              </span>

              <b>
                →
              </b>

              <strong>
                Stego Image
              </strong>

            </div>

          </div>

          <div className="stg-static-block">

            <h4 className="stg-static-title">
              4. Send Stego File
            </h4>

            <p className="stg-static-theory">
              The sender sends the generated stego file
              to the receiver. The visible appearance of
              the image remains the normal cover image
              for the purpose of this simulation.
            </p>

          </div>

          <div className="stg-static-block">

            <h4 className="stg-static-title">
              5. Receive and Extract
            </h4>

            <div className="stg-flow vertical-flow">

              <strong>
                Received Stego Image
              </strong>

              <b>
                ↓
              </b>

              <span>
                Correct Passphrase
              </span>

              <b>
                ↓
              </b>

              <strong>
                Secret Message
              </strong>

            </div>

          </div>

          <div className="default-word-preview">

            <span>
              Result:
            </span>

            <b>
              Secret message successfully transferred
            </b>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function SteganographyExperiment() {

  const navigate = useNavigate();

  /* =========================================================
     COLLAPSIBLE SECTIONS
  ========================================================= */

  const [theoryOpen, setTheoryOpen] =
    useState(false);

  const [procOpen, setProcOpen] =
    useState(false);

  const [helpOpen, setHelpOpen] =
    useState(false);

  /* =========================================================
     SCREEN
  ========================================================= */

  const [screen, setScreen] =
    useState("simulation");

  /* =========================================================
     INPUTS
  ========================================================= */

  const [coverFile, setCoverFile] =
    useState(null);

  const [secretMessage, setSecretMessage] =
    useState("");

  const [passphrase, setPassphrase] =
    useState("");

  /* =========================================================
     SIMULATION STATE
  ========================================================= */

  const [mode, setMode] =
    useState(null);

  const [phase, setPhase] =
    useState("cover");

  const [stegoFile, setStegoFile] =
    useState("");

  const [receivedFile, setReceivedFile] =
    useState("");

  const [extractPassphrase, setExtractPassphrase] =
    useState("");

  const [extractedMessage, setExtractedMessage] =
    useState("");

  const [embedStatus, setEmbedStatus] =
    useState([]);

  const [extractStatus, setExtractStatus] =
    useState("");

  /* =========================================================
     TRACKING
  ========================================================= */

  const [successfulAttempts, setSuccessfulAttempts] =
    useState(0);

  const [observations, setObservations] =
    useState([]);

  const [submitted, setSubmitted] =
    useState(false);

  /* =========================================================
     ASSIGNMENT
  ========================================================= */

  const [quizAnswers, setQuizAnswers] =
    useState(
      Array(QUIZ.length).fill(null)
    );

  const [quizScore, setQuizScore] =
    useState(0);

  /* =========================================================
     SIMULATION COMPLETE
  ========================================================= */

  const simulationComplete =
    successfulAttempts >= REQUIRED_SUCCESS;

  /* =========================================================
     QUIZ COMPLETE
  ========================================================= */

  const assignmentComplete =
    quizAnswers.every(
      (answer) => answer !== null
    );

  /* =========================================================
     INPUT VALIDATION
  ========================================================= */

  const validateInputs = () => {

    if (!coverFile) {
      return false;
    }

    if (!secretMessage.trim()) {
      return false;
    }

    if (secretMessage.trim().length < 3) {
      return false;
    }

    if (!passphrase.trim()) {
      return false;
    }

    if (passphrase.trim().length < 3) {
      return false;
    }

    return true;
  };

  /* =========================================================
     START SIMULATION
  ========================================================= */

  const handleStart = () => {

    if (!validateInputs()) {
      return;
    }

    setMode("running");

    setPhase("cover");

    setStegoFile("");

    setReceivedFile("");

    setExtractPassphrase("");

    setExtractedMessage("");

    setEmbedStatus([]);

    setExtractStatus("");

  };

  /* =========================================================
     STEP 1 — COVER
  ========================================================= */

  const handleCoverContinue = () => {

    if (!coverFile) {
      return;
    }

    setPhase("message");

  };

  /* =========================================================
     STEP 2 — MESSAGE
  ========================================================= */

  const handleMessageContinue = () => {

    if (!secretMessage.trim()) {
      return;
    }

    if (secretMessage.trim().length < 3) {
      return;
    }

    setPhase("passphrase");

  };

  /* =========================================================
     STEP 3 — PASSPHRASE
  ========================================================= */

  const handlePassphraseContinue = () => {

    if (!passphrase.trim()) {
      return;
    }

    if (passphrase.trim().length < 3) {
      return;
    }

    setEmbedStatus([
      "Cover file verified",
      "Secret message prepared",
      "Passphrase configured",
    ]);

    setPhase("embed");

  };

  /* =========================================================
     STEP 4 — EMBED
  ========================================================= */

  const handleEmbed = () => {

    if (!coverFile) {
      return;
    }

    if (!secretMessage.trim()) {
      return;
    }

    if (!passphrase.trim()) {
      return;
    }

    const originalName =
      coverFile.name || "cover_image.jpg";

    const extension =
      originalName.includes(".")
        ? originalName.substring(
            originalName.lastIndexOf(".")
          )
        : ".jpg";

    const baseName =
      originalName.includes(".")
        ? originalName.substring(
            0,
            originalName.lastIndexOf(".")
          )
        : originalName;

    const outputName =
      `${baseName}_stego${extension}`;

    setStegoFile(outputName);

    setEmbedStatus([
      "Cover file verified",
      "Secret message prepared",
      "Passphrase configured",
      "Secret data embedded",
      "Stego file generated",
    ]);

    setPhase("send");

  };

  /* =========================================================
     STEP 5 — SEND
  ========================================================= */

  const handleSend = () => {

    if (!stegoFile) {
      return;
    }

    setPhase("receive");

  };

  /* =========================================================
     STEP 6 — RECEIVE
  ========================================================= */

  const handleReceive = () => {

    if (!stegoFile) {
      return;
    }

    setReceivedFile(stegoFile);

    setPhase("extract");

  };

  /* =========================================================
     STEP 7 — EXTRACT
  ========================================================= */

  const handleExtract = () => {

    if (!extractPassphrase.trim()) {

      setExtractStatus("missing");

      return;
    }

    if (
      extractPassphrase.trim() !==
      passphrase.trim()
    ) {

      setExtractStatus("wrong");

      setExtractedMessage("");

      return;
    }

    setExtractStatus("correct");

    setExtractedMessage(
      secretMessage.trim()
    );

    setPhase("verify");

  };

  /* =========================================================
     STEP 8 — VERIFY
  ========================================================= */

  const handleVerify = () => {

    if (
      !extractedMessage ||
      extractedMessage.trim() !==
        secretMessage.trim()
    ) {
      return;
    }

    const nextAttempt =
      Math.min(
        successfulAttempts + 1,
        REQUIRED_SUCCESS
      );

    setSuccessfulAttempts(
      nextAttempt
    );

    setObservations((prev) => [
      ...prev,
      {
        sr: prev.length + 1,
        cover:
          coverFile?.name ||
          "cover_image.jpg",
        message:
          secretMessage.trim(),
        stego: stegoFile,
        status: "Correct",
      },
    ]);

    setPhase("done");

  };

  /* =========================================================
     NEW MESSAGE
  ========================================================= */

  const handleNewMessage = () => {

    setMode(null);

    setPhase("cover");

    setCoverFile(null);

    setSecretMessage("");

    setPassphrase("");

    setStegoFile("");

    setReceivedFile("");

    setExtractPassphrase("");

    setExtractedMessage("");

    setEmbedStatus([]);

    setExtractStatus("");

  };

  /* =========================================================
     RESET EVERYTHING
  ========================================================= */

  const handleReset = () => {

    setMode(null);

    setPhase("cover");

    setCoverFile(null);

    setSecretMessage("");

    setPassphrase("");

    setStegoFile("");

    setReceivedFile("");

    setExtractPassphrase("");

    setExtractedMessage("");

    setEmbedStatus([]);

    setExtractStatus("");

    setSuccessfulAttempts(0);

    setObservations([]);

    setSubmitted(false);

    setQuizAnswers(
      Array(QUIZ.length).fill(null)
    );

    setQuizScore(0);

    setScreen("simulation");

  };

  /* =========================================================
     TAB SWITCH
  ========================================================= */

  const goToScreen = (target) => {
    setScreen(target);

  };

  /* =========================================================
     FILE SELECT
  ========================================================= */

  const handleFileChange = (e) => {

    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setCoverFile(file);

  };

  /* =========================================================
     QUIZ ANSWER
  ========================================================= */

  const handleQuizAnswer = (
    questionIndex,
    optionIndex
  ) => {

    if (submitted) {
      return;
    }

    setQuizAnswers((prev) =>
      prev.map((value, index) =>
        index === questionIndex
          ? optionIndex
          : value
      )
    );

  };

  /* =========================================================
     FINAL SUBMIT
  ========================================================= */

  const canSubmit =
    simulationComplete &&
    assignmentComplete;

  const handleSubmit = () => {

    if (!canSubmit || submitted) {
      return;
    }

    const finalScore =
      quizAnswers.reduce(
        (total, answer, index) =>
          total +
          (
            answer ===
            QUIZ[index].correct
              ? 1
              : 0
          ),
        0
      );

    setQuizScore(finalScore);

    setSubmitted(true);

    const resultData = buildIfsResult({
      completed: true,
      experimentNo: 9,
      experimentName:
        "Send and Receive Secret Message using Steganography Techniques using Steghide",
      experimentRoute: "/ifs-experiment-9",
      successfulAttempts,
      observations,
      quizQuestions: QUIZ,
      quizAnswers,
      date: new Date().toISOString(),
    });

    try {

      localStorage.setItem(
        "steganographyExp7Status",
        JSON.stringify({
          completed: true,
          successfulAttempts,
          observations,
          quizScore: finalScore,
          quizTotal: QUIZ.length,
          quizAnswers,
          date:
            new Date().toISOString(),
        })
      );
      localStorage.setItem("assignmentResult", JSON.stringify(resultData));

    } catch (error) {

      console.log(error);

    }

    navigate("/result", { state: resultData });

  };

  /* =========================================================
     RENDER SIMULATION CANVAS
  ========================================================= */

  const renderSimulationCanvas = () => {

    if (!mode) {
      return <DefaultPreview />;
    }

    /* =====================================================
       STEP 1 — COVER
    ===================================================== */

    if (phase === "cover") {

      return (
        <div className="stg-step-block">

          <div className="stg-step-title">
            Step 1 — Verify Selected Cover Image
          </div>

          <p className="stg-step-theory">
            The cover file has been selected from the
            Inputs panel. Verify the selected file before
            continuing to the next stage.
          </p>

          <div className="stg-large-file-card">

            <div className="stg-file-icon">
              🖼
            </div>

            <div className="stg-file-info">

              <strong>
                {coverFile?.name ||
                  "No image selected"}
              </strong>

              <span>

                {coverFile
                  ? `${(
                      coverFile.size / 1024
                    ).toFixed(1)} KB`
                  : "No file selected"}

              </span>

            </div>

            <div className="stg-file-status">

              {coverFile
                ? "✓ Ready"
                : "Waiting"}

            </div>

          </div>

          <div className="stg-validation-note">

            <span>✓</span>

            <div>

              <strong>
                Cover file selected from Inputs panel
              </strong>

              <small>
                No additional file upload is required
                inside the simulation canvas.
              </small>

            </div>

          </div>

          <div className="canvas-actions">

            <button
              type="button"
              className="canvas-btn decrypt-btn"
              onClick={handleCoverContinue}
              disabled={!coverFile}
            >
              Continue → Step 2
            </button>

          </div>

        </div>
      );
    }

    /* =====================================================
       STEP 2 — MESSAGE
    ===================================================== */

    if (phase === "message") {

      return (
        <div className="stg-step-block">

          <div className="stg-step-title">
            Step 2 — Verify Secret Message
          </div>

          <p className="stg-step-theory">
            The secret message entered in the Inputs
            panel will be embedded inside the selected
            cover image.
          </p>

          <div className="stg-message-review">

            <div className="review-label">
              Secret Message
            </div>

            <div className="review-message">
              {secretMessage}
            </div>

            <div className="review-meta">
              {secretMessage.length}/200 characters
            </div>

          </div>

          <div className="canvas-actions">

            <button
              type="button"
              className="canvas-btn check-btn"
              onClick={handleMessageContinue}
              disabled={
                !secretMessage.trim() ||
                secretMessage.trim().length < 3
              }
            >
              ✓ Confirm Message
            </button>

          </div>

        </div>
      );
    }

    /* =====================================================
       STEP 3 — PASSPHRASE
    ===================================================== */

    if (phase === "passphrase") {

      return (
        <div className="stg-step-block">

          <div className="stg-step-title">
            Step 3 — Verify Protection Passphrase
          </div>

          <p className="stg-step-theory">
            A passphrase protects the embedded message.
            The receiver will need the same passphrase
            during extraction.
          </p>

          <div className="stg-password-review">

            <div className="review-security-icon">
              🔐
            </div>

            <div>

              <strong>
                Passphrase configured
              </strong>

              <small>
                Protection is ready for embedding.
              </small>

            </div>

          </div>

          <div className="stg-security-note">
            🔐 Receiver must provide the same
            passphrase during extraction.
          </div>

          <div className="canvas-actions">

            <button
              type="button"
              className="canvas-btn check-btn"
              onClick={handlePassphraseContinue}
              disabled={
                !passphrase.trim() ||
                passphrase.trim().length < 3
              }
            >
              Continue → Embed Data
            </button>

          </div>

        </div>
      );
    }

    /* =====================================================
       STEP 4 — EMBED
    ===================================================== */

    if (phase === "embed") {

      return (
        <div className="stg-step-block">

          <div className="stg-step-title">
            Step 4 — Embed Secret Message
          </div>

          <p className="stg-step-theory">
            The cover image, secret message and
            passphrase are combined to create the
            stego image.
          </p>

          <div className="stg-embed-flow">

            <div className="stg-flow-card">

              <span>
                🖼
              </span>

              <b>
                Cover Image
              </b>

              <small>
                {coverFile?.name}
              </small>

            </div>

            <span className="stg-flow-symbol">
              ＋
            </span>

            <div className="stg-flow-card">

              <span>
                🔐
              </span>

              <b>
                Secret Data
              </b>

              <small>
                {secretMessage.length} characters
              </small>

            </div>

            <span className="stg-flow-symbol">
              ＋
            </span>

            <div className="stg-flow-card">

              <span>
                🔑
              </span>

              <b>
                Passphrase
              </b>

              <small>
                Protected
              </small>

            </div>

          </div>

          <div className="stg-process-box">

            {embedStatus.map(
              (item, index) => (

                <div
                  className="stg-process-row"
                  key={index}
                >

                  <span>
                    ✓
                  </span>

                  {item}

                </div>

              )
            )}

          </div>

          <div className="canvas-actions">

            <button
              type="button"
              className="canvas-btn check-btn"
              onClick={handleEmbed}
            >
              🔒 Embed Secret Message
            </button>

          </div>

        </div>
      );
    }

    /* =====================================================
       STEP 5 — SEND
    ===================================================== */

    if (phase === "send") {

      return (
        <div className="stg-step-block">

          <div className="stg-step-title">
            Step 5 — Send Stego Image
          </div>

          <p className="stg-step-theory">
            The generated stego image is ready to be
            transferred from the sender to the receiver.
          </p>

          <div className="stg-transfer-card">

            <div className="transfer-side">

              <span className="transfer-icon">
                👤
              </span>

              <strong>
                Sender
              </strong>

              <small>
                Original message owner
              </small>

            </div>

            <div className="transfer-arrow">
              ─────→
            </div>

            <div className="transfer-file">

              <span>
                🖼
              </span>

              <strong>
                {stegoFile}
              </strong>

              <small>
                Stego Image
              </small>

            </div>

            <div className="transfer-arrow">
              ─────→
            </div>

            <div className="transfer-side">

              <span className="transfer-icon">
                👤
              </span>

              <strong>
                Receiver
              </strong>

              <small>
                Message recipient
              </small>

            </div>

          </div>

          <div className="canvas-actions">

            <button
              type="button"
              className="canvas-btn decrypt-btn"
              onClick={handleSend}
            >
              📤 Send Stego Image
            </button>

          </div>

        </div>
      );
    }

    /* =====================================================
       STEP 6 — RECEIVE
    ===================================================== */

    if (phase === "receive") {

      return (
        <div className="stg-step-block">

          <div className="stg-step-title">
            Step 6 — Receive Stego Image
          </div>

          <p className="stg-step-theory">
            The receiver receives the generated stego
            image and prepares it for extraction.
          </p>

          <div className="stg-received-card">

            <div className="stg-received-icon">
              📨
            </div>

            <div>

              <strong>
                {stegoFile}
              </strong>

              <span>
                Stego image received successfully
              </span>

            </div>

            <b className="received-badge">
              RECEIVED
            </b>

          </div>

          <div className="canvas-actions">

            <button
              type="button"
              className="canvas-btn check-btn"
              onClick={handleReceive}
            >
              ✓ Continue to Extraction
            </button>

          </div>

        </div>
      );
    }

    /* =====================================================
       STEP 7 — EXTRACT
    ===================================================== */

    if (phase === "extract") {

      return (
        <div className="stg-step-block">

          <div className="stg-step-title">
            Step 7 — Extract Secret Message
          </div>

          <p className="stg-step-theory">
            Enter the passphrase associated with the
            received stego image. The correct passphrase
            is required to recover the hidden message.
          </p>

          <div className="stg-extract-file">

            <span>
              🖼
            </span>

            <div>

              <strong>
                {receivedFile}
              </strong>

              <small>
                Received Stego Image
              </small>

            </div>

          </div>

          <div className="stg-password-box">

            <label>
              Receiver Passphrase
            </label>

            <input
              type="password"
              className={`text-input ${
                extractStatus === "wrong"
                  ? "input-error"
                  : ""
              }`}
              value={extractPassphrase}
              placeholder="Enter passphrase"
              onChange={(e) => {

                setExtractPassphrase(
                  e.target.value
                );

                setExtractStatus("");

              }}
            />

          </div>

          {extractStatus === "wrong" && (

            <div className="stg-error-message">
              ✕ Incorrect passphrase. Extraction failed.
            </div>

          )}

          {extractStatus === "missing" && (

            <div className="stg-error-message">
              ✕ Please enter the passphrase.
            </div>

          )}

          <div className="canvas-actions">

            <button
              type="button"
              className="canvas-btn check-btn"
              onClick={handleExtract}
            >
              🔓 Extract Message
            </button>

          </div>

        </div>
      );
    }

    /* =====================================================
       STEP 8 — VERIFY
    ===================================================== */

    if (phase === "verify") {

      return (
        <div className="stg-step-block">

          <div className="stg-step-title">
            Step 8 — Verify Extracted Message
          </div>

          <p className="stg-step-theory">
            Verify that the extracted message matches
            the original secret message entered by
            the sender.
          </p>

          <div className="stg-verification-grid">

            <div className="verification-card">

              <h4>
                Sender's Secret Message
              </h4>

              <p>
                {secretMessage}
              </p>

            </div>

            <div className="verification-arrow">
              =
            </div>

            <div className="verification-card extracted">

              <h4>
                Receiver's Extracted Message
              </h4>

              <p>
                {extractedMessage}
              </p>

            </div>

          </div>

          <div className="canvas-actions">

            <button
              type="button"
              className="canvas-btn check-btn"
              onClick={handleVerify}
            >
              ✓ Verify Message
            </button>

          </div>

        </div>
      );
    }

    /* =====================================================
       DONE
    ===================================================== */

    if (phase === "done") {

      return (
        <div className="stg-step-block">

          <div className="stg-complete-icon">
            ✓
          </div>

          <div className="stg-step-title">
            Steganography Operation Complete
          </div>

          <div className="stg-success-box">

            <h3>
              Secret Message Successfully Sent
              and Received
            </h3>

            <div className="stg-result-row">

              <span>
                Cover File
              </span>

              <b>
                {coverFile?.name}
              </b>

            </div>

            <div className="stg-result-row">

              <span>
                Stego File
              </span>

              <b>
                {stegoFile}
              </b>

            </div>

            <div className="stg-result-row">

              <span>
                Extracted Message
              </span>

              <b>
                {extractedMessage}
              </b>

            </div>

          </div>

          <div className="canvas-actions">

            <button
              type="button"
              className="canvas-btn new-word-btn"
              onClick={handleNewMessage}
            >
              ＋ New Message
            </button>

          </div>

        </div>
      );
    }

    return null;
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="Caesar-root hc-root stg-root">

      {/* =====================================================
          HEADER
      ===================================================== */}

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
          Experiment 9 : Send and Receive Secret Message
          using Steganography Techniques using Steghide
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

      {/* =====================================================
          AIM
      ===================================================== */}

      <section className="card">

        <h2 className="section-heading orange">
          Aim
        </h2>

        <p>
          To send and receive a secret message using
          steganography techniques with Steghide by
          embedding secret information inside a cover
          image and extracting it using a passphrase.
        </p>

      </section>

      {/* =====================================================
          THEORY
      ===================================================== */}

      <section className="card">

        <div
          className="collapsible-header"
          onClick={() =>
            setTheoryOpen(
              (value) => !value
            )
          }
        >

          <h2 className="section-heading orange">
            Theory
          </h2>

          <span className="chevron">
            {theoryOpen
              ? "▲"
              : "▼"}
          </span>

        </div>

        {theoryOpen && (

          <div className="collapsible-body">

            <p>
              Steganography is a technique of hiding
              secret information inside another medium
              such as an image, audio file or other
              supported digital media.
            </p>

            <p>
              Steghide is a steganography utility that
              can be used to embed secret data into
              supported cover files. A passphrase can
              be used to protect the embedded data.
            </p>

            <p>
              In this practical, the sender selects a
              cover image, enters a secret message and
              passphrase, generates a stego image and
              sends it to the receiver. The receiver
              provides the correct passphrase and
              extracts the hidden message.
            </p>

          </div>

        )}

      </section>

      {/* =====================================================
          PROCEDURE
      ===================================================== */}

      <section className="card">

        <div
          className="collapsible-header"
          onClick={() =>
            setProcOpen(
              (value) => !value
            )
          }
        >

          <h2 className="section-heading orange">
            Procedure
          </h2>

          <span className="chevron">
            {procOpen
              ? "▲"
              : "▼"}
          </span>

        </div>

        {procOpen && (

          <div className="collapsible-body proc-grid">

            <ol className="proc-col">

              <li>
                Select a suitable cover image.
              </li>

              <li>
                Enter the secret message.
              </li>

              <li>
                Set a passphrase for the hidden data.
              </li>

              <li>
                Embed the message into the cover image.
              </li>

            </ol>

            <ol
              className="proc-col"
              start="5"
            >

              <li>
                Generate the stego image.
              </li>

              <li>
                Send the stego image to the receiver.
              </li>

              <li>
                Enter the passphrase and extract
                the hidden message.
              </li>

              <li>
                Verify the extracted message.
              </li>

            </ol>

          </div>

        )}

      </section>

      {/* =====================================================
          TABS
      ===================================================== */}

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
          1. Simulation{" "}
          {simulationComplete &&
            "✓"}
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
          2. Assignment{" "}
          {assignmentComplete &&
            "✓"}
        </button>

      </div>

      {/* =====================================================
          SIMULATION
      ===================================================== */}

      {screen === "simulation" && (

        <>

          <div className="sim-row">

            {/* =================================================
                INPUT PANEL
            ================================================= */}

            <aside className="card inputs-panel">

              <h3 className="panel-heading">
                Inputs
              </h3>

              {/* COVER FILE */}

              <label className="field-label">
                Cover Image
              </label>

              <label className="file-upload">

                <input
                  type="file"
                  accept=".jpg,.jpeg,.bmp,.wav"
                  disabled={
                    mode !== null
                  }
                  onChange={
                    handleFileChange
                  }
                />

                <span>
                  {coverFile
                    ? "✓ File Selected"
                    : "Choose Cover File"}
                </span>

              </label>

              {coverFile && (

                <div className="selected-file">

                  <span>
                    🖼
                  </span>

                  <div>

                    <strong>
                      {coverFile.name}
                    </strong>

                    <small>
                      {(
                        coverFile.size /
                        1024
                      ).toFixed(1)}
                      {" "}KB
                    </small>

                  </div>

                </div>

              )}

              {/* SECRET MESSAGE */}

              <label className="field-label">
                Secret Message
              </label>

              <textarea
                className="text-input message-small"
                value={secretMessage}
                disabled={
                  mode !== null
                }
                maxLength={200}
                placeholder="Enter secret message"
                onChange={(e) =>
                  setSecretMessage(
                    e.target.value
                  )
                }
              />

              <div className="input-counter">
                {secretMessage.length}/200
              </div>

              {/* PASSPHRASE */}

              <label className="field-label">
                Passphrase
              </label>

              <input
                type="password"
                className="text-input"
                value={passphrase}
                disabled={
                  mode !== null
                }
                placeholder="Enter passphrase"
                onChange={(e) =>
                  setPassphrase(
                    e.target.value
                  )
                }
              />

              <div className="input-hint">
                Minimum 3 characters required.
              </div>

              {/* BUTTONS */}

              <div className="action-buttons">

                {!mode && (

                  <button
                    type="button"
                    className="btn-verify full-width"
                    onClick={
                      handleStart
                    }
                    disabled={
                      !validateInputs()
                    }
                  >
                    🔐 Start Simulation
                  </button>

                )}

                <button
                  type="button"
                  className="btn-reset full-width"
                  onClick={
                    handleReset
                  }
                >
                  ↺ Reset
                </button>

              </div>

            </aside>

            {/* =================================================
                CANVAS
            ================================================= */}

            <div className="card canvas-panel">

              <h3 className="panel-heading">
                Simulation Canvas
              </h3>

              <div className="canvas-area hc-canvas-area">

                {renderSimulationCanvas()}

              </div>

            </div>

            {/* =================================================
                ANALYSIS
            ================================================= */}

            <aside className="card analysis-panel">

              <h3 className="panel-heading orange">
                Live Analysis
              </h3>

              <div className="analysis-block">

                <h4 className="analysis-sub">
                  Current Progress
                </h4>

                <table className="analysis-table">

                  <tbody>

                    <tr>

                      <td>
                        Cover File
                      </td>

                      <td>
                        :
                      </td>

                      <td>
                        {coverFile
                          ? coverFile.name
                          : "—"}
                      </td>

                    </tr>

                    <tr>

                      <td>
                        Message
                      </td>

                      <td>
                        :
                      </td>

                      <td>
                        {secretMessage
                          ? `${secretMessage.length} chars`
                          : "—"}
                      </td>

                    </tr>

                    <tr>

                      <td>
                        Stego File
                      </td>

                      <td>
                        :
                      </td>

                      <td>
                        {stegoFile ||
                          "—"}
                      </td>

                    </tr>

                    <tr>

                      <td>
                        Current Step
                      </td>

                      <td>
                        :
                      </td>

                      <td>

                        {!mode
                          ? "—"
                          : phase ===
                            "cover"
                          ? "Cover Image"
                          : phase ===
                            "message"
                          ? "Secret Message"
                          : phase ===
                            "passphrase"
                          ? "Passphrase"
                          : phase ===
                            "embed"
                          ? "Embedding"
                          : phase ===
                            "send"
                          ? "Sending"
                          : phase ===
                            "receive"
                          ? "Receiving"
                          : phase ===
                            "extract"
                          ? "Extraction"
                          : phase ===
                            "verify"
                          ? "Verification"
                          : "Completed"}

                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

              {/* SIMULATION COUNTER */}

              <div className="analysis-block">

                <h4 className="analysis-sub">
                  Simulation Attempts
                </h4>

                <div className="attempt-progress">

                  <strong>
                    {successfulAttempts}/
                    {REQUIRED_SUCCESS}
                  </strong>

                  <span>
                    successful operations
                  </span>

                </div>

              </div>

              {/* RECEIVER STATUS */}

              {receivedFile && (

                <div className="analysis-block correct-analysis">

                  <h4 className="analysis-sub">
                    Receiver Status
                  </h4>

                  <p className="conclusion-text">
                    ✓ Stego file received
                  </p>

                  <p className="analysis-small">
                    {receivedFile}
                  </p>

                </div>

              )}

              {/* EXTRACTED DATA */}

              {extractedMessage && (

                <div className="analysis-block correct-analysis">

                  <h4 className="analysis-sub">
                    Extracted Data
                  </h4>

                  <p className="conclusion-text">
                    {extractedMessage}
                  </p>

                </div>

              )}

            </aside>

          </div>

          {/* =================================================
              OBSERVATION TABLE
          ================================================= */}

          <section className="card table-section">

            <h3 className="panel-heading orange">
              Observation Table
            </h3>

            <div className="table-scroll">

              <table className="obs-table">

                <thead>

                  <tr>

                    <th>
                      Sr. No.
                    </th>

                    <th>
                      Cover File
                    </th>

                    <th>
                      Secret Message
                    </th>

                    <th>
                      Stego File
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {observations.length === 0 ? (

                    <tr>

                      <td colSpan="5">
                        No successful operation
                        completed yet.
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
                            {row.cover}
                          </td>

                          <td>
                            {row.message}
                          </td>

                          <td>
                            {row.stego}
                          </td>

                          <td>
                            ✔ Correct
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

                Successful Operations Completed:

                <b>
                  {" "}
                  {successfulAttempts}/
                  {REQUIRED_SUCCESS}
                </b>

                <br />

                {successfulAttempts <
                REQUIRED_SUCCESS

                  ? `Complete ${
                      REQUIRED_SUCCESS -
                      successfulAttempts
                    } more successful operation(s) to unlock the Assignment tab.`

                  : "✔ Simulation completed. Assignment tab unlocked."}

              </p>

            </div>

          </section>

        </>

      )}

      {/* =====================================================
          ASSIGNMENT
      ===================================================== */}

      {screen === "assignment" && (

        <section className="card quiz-card">

          <h3 className="panel-heading orange">
            Assignment ({QUIZ.length} Questions)
          </h3>

          <p className="input-hint">
            Answer all questions based on the
            Steghide steganography simulation.
          </p>

          <div className="assignment-info-box">

            <div>
              <strong>
                Answered
              </strong>

              <span>
                {
                  quizAnswers.filter(
                    (answer) =>
                      answer !== null
                  ).length
                }
                /{QUIZ.length}
              </span>
            </div>

            <p>
              Select one option for every question.
              Your score will be calculated automatically
              when you click <b>Submit Experiment</b>.
            </p>

          </div>

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

                      const selected =
                        quizAnswers[qIdx] ===
                        oIdx;

                      return (

                        <div
                          key={oIdx}
                          className={`quiz-option ${
                            selected
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleQuizAnswer(
                              qIdx,
                              oIdx
                            )
                          }
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

          <div className="assignment-bottom-note">

            {assignmentComplete ? (

              <p className="assignment-ready">
                ✓ All {QUIZ.length} questions answered.
                You can now submit the experiment using
                the <b>Submit Experiment</b> button below.
              </p>

            ) : (

              <p>
                Please answer all{" "}
                {QUIZ.length} questions before
                submitting the experiment.
              </p>

            )}

          </div>

        </section>

      )}

      {/* =====================================================
          FINAL SUBMIT
      ===================================================== */}

      <section className="submit-section">

        <button
          type="button"
          className={`btn-submit ${
            canSubmit && !submitted
              ? "enabled"
              : "disabled"
          }`}
          disabled={
            !canSubmit ||
            submitted
          }
          onClick={
            handleSubmit
          }
        >

          {submitted
            ? "Submitted"
            : "Submit Experiment"}

        </button>

        <div className="submit-status">

          {submitted ? (

            <p className="submit-success">
              Experiment Submitted Successfully
            </p>

          ) : (

            <p>

              Simulation:{" "}

              <b>

                {simulationComplete
                  ? "✔ Complete"
                  : `${successfulAttempts}/${REQUIRED_SUCCESS}`}

              </b>

              {"  |  "}

              Assignment:{" "}

              <b>

                {assignmentComplete
                  ? "✔ Completed"
                  : `${
                      quizAnswers.filter(
                        (answer) =>
                          answer !== null
                      ).length
                    }/${QUIZ.length}`}

              </b>

            </p>

          )}

        </div>

      </section>

      {/* =====================================================
          HELP POPUP
      ===================================================== */}

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
              Steganography using Steghide
            </h3>

            <p>
              Steganography is the technique of
              hiding secret information inside another
              medium such as an image or audio file.
            </p>

            <p>
              Steghide can be used to embed secret
              information into supported cover files
              and later extract the hidden information.
            </p>

            <h4 className="hc-help-subhead">
              Practical Process:
            </h4>

            <ol className="hc-help-list">

              <li>
                Select the cover image from the
                Inputs panel.
              </li>

              <li>
                Enter the secret message.
              </li>

              <li>
                Set a passphrase.
              </li>

              <li>
                Embed the message into the cover file.
              </li>

              <li>
                Generate the stego image.
              </li>

              <li>
                Send the stego image to the receiver.
              </li>

              <li>
                Receiver enters the correct passphrase.
              </li>

              <li>
                Extract and verify the secret message.
              </li>

            </ol>

            <h4 className="hc-help-subhead">
              Important Terms:
            </h4>

            <p>
              <b>Cover File:</b> Original media used
              for hiding information.
            </p>

            <p>
              <b>Secret Message:</b> Information that
              the sender wants to hide.
            </p>

            <p>
              <b>Stego File:</b> Cover file carrying
              the embedded information.
            </p>

            <p>
              <b>Passphrase:</b> Protection value
              required during extraction.
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