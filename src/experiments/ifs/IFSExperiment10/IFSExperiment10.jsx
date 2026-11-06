import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { buildIfsResult } from "../../../utils/ifsResult.js";
import "./IFSExperiment10.css";

/* =========================================================
   DATA RECOVERY EXPERIMENT
   ADVANCED STUDENT-DRIVEN SAFE SIMULATION

   Updated workflow: 9 practical stages.
   Removed redundant "Analysis" and artificial "Priority" stages.
   ========================================================= */

const STORAGE_KEY = "dataRecoveryExperimentState";

const DRIVES = [
  {
    id: "E:",
    name: "USB Pen Drive",
    icon: "🔌",
    capacity: "16 GB",
    fileSystem: "FAT32",
    status: "Formatted",
    scenario: "Recently formatted removable storage",
    recommendedMode: "Deep",
    targetFiles: [
      "College_Notes.docx",
      "Practical_Record.pdf",
      "Circuit_Diagram.jpg",
    ],
    files: [
      ["College_Notes.docx", "DOCX", "420 KB", "Excellent", "Low"],
      ["Practical_Record.pdf", "PDF", "1.8 MB", "Excellent", "Low"],
      ["Circuit_Diagram.jpg", "JPG", "860 KB", "Good", "Medium"],
      ["Project_Report.docx", "DOCX", "2.4 MB", "Excellent", "Low"],
      ["Experiment_Images.png", "PNG", "1.1 MB", "Good", "Medium"],
      ["Important_Notes.txt", "TXT", "18 KB", "Excellent", "Low"],
      ["Old_Backup.zip", "ZIP", "4.8 MB", "Partial", "High"],
      ["Temp_File.tmp", "TMP", "220 KB", "Corrupted", "High"],
    ],
  },
  {
    id: "D:",
    name: "Hard Disk Data Partition",
    icon: "💽",
    capacity: "100 GB",
    fileSystem: "NTFS",
    status: "Formatted",
    scenario: "Formatted data partition",
    recommendedMode: "Deep",
    targetFiles: [
      "DBMS_Assignment.pdf",
      "Java_Practical.docx",
      "Network_Topology.png",
    ],
    files: [
      ["DBMS_Assignment.pdf", "PDF", "2.1 MB", "Excellent", "Low"],
      ["Java_Practical.docx", "DOCX", "680 KB", "Excellent", "Low"],
      ["Network_Topology.png", "PNG", "1.4 MB", "Good", "Medium"],
      ["Final_Project.zip", "ZIP", "8.6 MB", "Good", "Medium"],
      ["Viva_Questions.pdf", "PDF", "950 KB", "Excellent", "Low"],
      ["Lab_Manual.docx", "DOCX", "3.2 MB", "Excellent", "Low"],
      ["Old_Project.rar", "ZIP", "6.2 MB", "Partial", "High"],
      ["System_Temp.tmp", "TMP", "300 KB", "Corrupted", "High"],
    ],
  },
]

const QUIZ = [
  {
    q: "What is data recovery?",
    options: [
      "Deleting data",
      "Retrieving inaccessible or lost data",
      "Formatting a drive",
      "Creating a partition",
    ],
    correct: 1,
  },
  {
    q: "Which device can be a source for data recovery?",
    options: ["Pen Drive", "Hard Disk", "Both A and B", "Neither"],
    correct: 2,
  },
  {
    q: "What is the purpose of a recovery utility?",
    options: [
      "To find potentially recoverable data",
      "To increase RAM",
      "To install Windows",
      "To change screen resolution",
    ],
    correct: 0,
  },
  {
    q: "What should be selected before starting a scan?",
    options: ["A printer", "The source drive", "A keyboard", "A browser"],
    correct: 1,
  },
  {
    q: "What does scanning do in a recovery utility?",
    options: [
      "Searches for recoverable file information",
      "Formats the disk",
      "Deletes all files",
      "Changes the CPU",
    ],
    correct: 0,
  },
  {
    q: "What is a formatted drive in this simulation?",
    options: [
      "A drive whose file-system organization has been reset",
      "A new monitor",
      "A network cable",
      "A compressed folder",
    ],
    correct: 0,
  },
  {
    q: "Which file system is shown for the Pen Drive?",
    options: ["NTFS", "FAT32", "EXT4", "APFS"],
    correct: 1,
  },
  {
    q: "Which file system is shown for the Hard Disk partition?",
    options: ["FAT32", "NTFS", "EXT3", "HFS"],
    correct: 1,
  },
  {
    q: "What should be done after scan completion?",
    options: [
      "Review recoverable files",
      "Format the source again",
      "Turn off the monitor",
      "Delete the results",
    ],
    correct: 0,
  },
  {
    q: "What can be used to identify a recoverable file?",
    options: [
      "File name and type",
      "Keyboard color",
      "CPU brand",
      "Monitor size",
    ],
    correct: 0,
  },
  {
    q: "Why is a separate recovery destination recommended?",
    options: [
      "To avoid writing recovered data over the source",
      "To make the screen brighter",
      "To increase Internet speed",
      "To change the file extension",
    ],
    correct: 0,
  },
  {
    q: "What is the final operation in this practical?",
    options: [
      "Recover selected files",
      "Change wallpaper",
      "Install a printer",
      "Open Calculator",
    ],
    correct: 0,
  },
  {
    q: "Which file type is represented by .pdf?",
    options: [
      "Portable Document Format",
      "Picture Data File",
      "Program Drive Format",
      "Private Data Folder",
    ],
    correct: 0,
  },
  {
    q: "Which file type is represented by .jpg?",
    options: [
      "Image file",
      "Audio file",
      "Database file",
      "System file",
    ],
    correct: 0,
  },
  {
    q: "Can recovery software always recover every formatted file?",
    options: [
      "Yes, always",
      "No, recovery depends on several conditions",
      "Only images",
      "Only text files",
    ],
    correct: 1,
  },
  {
    q: "What should be avoided on a real affected drive?",
    options: [
      "Unnecessary new writes",
      "Reading instructions",
      "Using a recovery tool",
      "Checking drive information",
    ],
    correct: 0,
  },
  {
    q: "What does 'Excellent' mean in this simulation?",
    options: [
      "Better simulated recovery condition",
      "The file is encrypted",
      "The file is deleted permanently",
      "The file is a virus",
    ],
    correct: 0,
  },
  {
    q: "What happens when Recover Selected Files is pressed?",
    options: [
      "The simulation marks selected files as recovered",
      "The computer shuts down",
      "The source drive is formatted",
      "All files are deleted",
    ],
    correct: 0,
  },
  {
    q: "Where are observations stored in this implementation?",
    options: [
      "Only on paper",
      "Browser localStorage",
      "CPU cache",
      "Printer memory",
    ],
    correct: 1,
  },
  {
    q: "What does a completed 11/11 simulation indicate?",
    options: [
      "All eleven practical operations were completed",
      "Eleven files were deleted",
      "Eleven drives were formatted",
      "Eleven questions remain",
    ],
    correct: 0,
  },
]

const STAGE_NAMES = [
  "Drive",
  "Configure",
  "Quick Scan",
  "Deep Scan",
  "Review",
  "Select Files",
  "Destination",
  "Recovery",
  "Verify",
];

function getSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function iconFor(type) {
  if (type === "PDF") return "📕";
  if (type === "DOCX") return "📘";
  if (type === "JPG" || type === "PNG") return "🖼️";
  if (type === "ZIP") return "🗜️";
  return "📄";
}

function addObservation(setObservations, step, operation, observation) {
  setObservations((prev) => [
    ...prev.filter((item) => item.step !== step),
    { step, operation, observation, status: "Completed" },
  ]);
}

function RecoveryCanvas({
  drive,
  stage,
  setStage,
  scanMode,
  setScanMode,
  fileTypes,
  setFileTypes,
  quickProgress,
  deepProgress,
  scanning,
  scanType,
  startScan,
  scanComplete,
  deepScanComplete,
  selectedFiles,
  setSelectedFiles,
  recoveryLocation,
  setRecoveryLocation,
  destinationValid,
  validateDestination,
  recovered,
  verification,
  setVerification,
  verifyRecovery,
  observations,
  setObservations,
  message,
}) {
  const files = drive.files.map((f, i) => ({
    id: `${drive.id}-${i}`,
    name: f[0],
    type: f[1],
    size: f[2],
    quality: f[3],
    risk: f[4],
  }));

  const targetFiles = drive.targetFiles;

  const toggleFileType = (type) => {
    setFileTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  };

  const toggleFile = (id) => {
    if (!deepScanComplete || recovered) return;
    setSelectedFiles((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const allRequiredSelected = targetFiles.every((name) =>
    selectedFiles.some(
      (id) => files.find((file) => file.id === id)?.name === name
    )
  );

  const filteredFiles = files.filter((file) =>
    fileTypes.length ? fileTypes.includes(file.type) : true
  );

  const markStage = (step, operation, observation, nextStage) => {
    addObservation(setObservations, step, operation, observation);
    setStage(nextStage);
  };

  return (
    <div className="recovery-canvas advanced-canvas">
      <div className="recovery-canvas-header">
        <div>
          <h3>Power Data Recovery — Advanced Simulation</h3>
          <span className="simulation-subtitle">
            Student-driven recovery workflow • Safe simulation
          </span>
        </div>
        <span className="recovery-badge">SAFE SIMULATION</span>
      </div>

      <div className="advanced-stage-bar">
        {STAGE_NAMES.map((name, index) => (
          <button
            key={name}
            type="button"
            className={`stage-chip ${
              stage === index + 1 ? "active" : ""
            } ${stage > index + 1 ? "completed" : ""}`}
            onClick={() => {
              if (stage > index + 1) setStage(index + 1);
            }}
          >
            <b>{index + 1}</b>
            <span>{name}</span>
          </button>
        ))}
      </div>

      {stage === 1 && (
        <div className="advanced-step-card">
          <div className="advanced-step-title">
            <span>1</span>
            <div>
              <h4>Select the formatted source device</h4>
              <p>
                Select the device that matches the recovery scenario. Do not
                select a device that is not part of the scenario.
              </p>
            </div>
          </div>

          <div className="scenario-box">
            <strong>Scenario:</strong> Recover academic files from a recently
            formatted storage device without modifying the real device.
          </div>

          <div className="drive-analysis-grid">
            {DRIVES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`scenario-drive ${
                  drive.id === item.id ? "selected" : ""
                }`}
                onClick={() => {
                  if (item.id !== drive.id) {
                    alert(
                      "Incorrect source device. Compare the drive information with the scenario."
                    );
                    return;
                  }

                  addObservation(
                    setObservations,
                    1,
                    "Select storage device",
                    `${item.id} — ${item.name} selected`
                  );
                  setStage(2);
                }}
              >
                <span className="scenario-drive-icon">{item.icon}</span>
                <strong>{item.id} — {item.name}</strong>
                <small>{item.capacity}</small>
                <small>{item.fileSystem}</small>
                <small>{item.status}</small>
              </button>
            ))}
          </div>

          <div className="manual-note">
            Verify capacity, file system and formatted status before continuing.
          </div>
        </div>
      )}

      {stage === 2 && (
        <div className="advanced-step-card">
          <div className="advanced-step-title">
            <span>2</span>
            <div>
              <h4>Configure the recovery scan</h4>
              <p>
                Choose the scan strategy and file categories before scanning.
              </p>
            </div>
          </div>

          <div className="config-grid">
            <div className="config-box">
              <h5>Scan Mode</h5>
              <label className={scanMode === "Quick" ? "config-selected" : ""}>
                <input
                  type="radio"
                  checked={scanMode === "Quick"}
                  onChange={() => setScanMode("Quick")}
                />
                <span>
                  <b>Quick Scan</b>
                  <small>Fast search of available file-system records</small>
                </span>
              </label>

              <label className={scanMode === "Deep" ? "config-selected" : ""}>
                <input
                  type="radio"
                  checked={scanMode === "Deep"}
                  onChange={() => setScanMode("Deep")}
                />
                <span>
                  <b>Deep Scan</b>
                  <small>Extended search suitable for formatted storage</small>
                </span>
              </label>
            </div>

            <div className="config-box">
              <h5>File Categories</h5>
              {["DOCX", "PDF", "JPG", "PNG", "ZIP"].map((type) => (
                <label
                  key={type}
                  className={fileTypes.includes(type) ? "config-selected" : ""}
                >
                  <input
                    type="checkbox"
                    checked={fileTypes.includes(type)}
                    onChange={() => toggleFileType(type)}
                  />
                  <span>
                    <b>{type}</b>
                    <small>Include {type} files in the scan</small>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="configuration-summary">
            <b>Selected Configuration</b>
            <span>
              {scanMode} Scan • {fileTypes.length ? fileTypes.join(", ") : "No categories"}
            </span>
          </div>

          <div className="step-navigation">
            <button className="nav-btn" onClick={() => setStage(1)}>
              ← Previous
            </button>
            <button
              className="nav-btn next-btn"
              onClick={() => {
                if (scanMode !== "Deep") {
                  alert("For this formatted-drive scenario, select Deep Scan.");
                  return;
                }
                if (!fileTypes.length) {
                  alert("Select at least one file category.");
                  return;
                }
                markStage(
                  2,
                  "Configure recovery scan",
                  `${scanMode} Scan configured for ${fileTypes.join(", ")}`,
                  3
                );
              }}
            >
              Confirm Configuration →
            </button>
          </div>
        </div>
      )}

      {stage === 3 && (
        <div className="advanced-step-card">
          <div className="advanced-step-title">
            <span>3</span>
            <div>
              <h4>Perform Quick Scan</h4>
              <p>
                Run the initial scan. A formatted-drive recovery may require a deeper scan.
              </p>
            </div>
          </div>

          <div className="scan-console">
            <div className="console-header">
              <span>Power Data Recovery Console</span>
              <b>{scanning && scanType === "quick" ? "SCANNING" : "READY"}</b>
            </div>
            <div className="console-line">
              {scanComplete
                ? "Quick Scan completed. Limited records detected."
                : scanning && scanType === "quick"
                ? "Searching file-system records..."
                : "Ready to begin Quick Scan."}
            </div>
          </div>

          <button
            className="recovery-btn primary large-action"
            onClick={() => startScan("quick")}
            disabled={scanning || scanComplete}
          >
            {scanComplete ? "✓ Quick Scan Completed" : "🔍 Start Quick Scan"}
          </button>

          {(scanning && scanType === "quick") || scanComplete ? (
            <div className="recovery-scan">
              <div className="recovery-progress-label">
                <span>Quick Scan Progress</span>
                <b>{quickProgress}%</b>
              </div>
              <div className="recovery-progress">
                <div style={{ width: `${quickProgress}%` }} />
              </div>
            </div>
          ) : null}

          {scanComplete && (
            <div className="warning-box">
              <b>Scan Result:</b> Limited records were detected. Continue with
              Deep Scan for the formatted-drive recovery scenario.
            </div>
          )}

          <div className="step-navigation">
            <button className="nav-btn" onClick={() => setStage(2)}>
              ← Previous
            </button>
            <button
              className="nav-btn next-btn"
              disabled={!scanComplete}
              onClick={() => setStage(4)}
            >
              Continue to Deep Scan →
            </button>
          </div>
        </div>
      )}

      {stage === 4 && (
        <div className="advanced-step-card">
          <div className="advanced-step-title">
            <span>4</span>
            <div>
              <h4>Perform Deep Scan</h4>
              <p>
                Complete the extended search before reviewing recoverable records.
              </p>
            </div>
          </div>

          <div className="deep-scan-warning">
            ⚠ Quick Scan alone is insufficient for this formatted-drive scenario.
          </div>

          <div className="scan-metrics">
            <div><span>Source</span><strong>{drive.id}</strong></div>
            <div><span>Mode</span><strong>Deep Scan</strong></div>
            <div><span>File System</span><strong>{drive.fileSystem}</strong></div>
            <div><span>Quick Scan</span><strong>Completed</strong></div>
          </div>

          <button
            className="recovery-btn primary large-action"
            onClick={() => startScan("deep")}
            disabled={scanning || deepScanComplete}
          >
            {deepScanComplete ? "✓ Deep Scan Completed" : "🔬 Start Deep Scan"}
          </button>

          {(scanning && scanType === "deep") || deepScanComplete ? (
            <div className="recovery-scan">
              <div className="recovery-progress-label">
                <span>{deepScanComplete ? "Deep Scan completed" : "Searching simulated storage sectors..."}</span>
                <b>{deepProgress}%</b>
              </div>
              <div className="recovery-progress deep">
                <div style={{ width: `${deepProgress}%` }} />
              </div>
            </div>
          ) : null}

          {deepScanComplete && (
            <div className="success-box">
              ✓ Deep Scan completed. Potentially recoverable records are ready for review.
            </div>
          )}

          <div className="step-navigation">
            <button className="nav-btn" onClick={() => setStage(3)}>
              ← Previous
            </button>
            <button
              className="nav-btn next-btn"
              disabled={!deepScanComplete}
              onClick={() => {
                addObservation(
                  setObservations,
                  4,
                  "Perform Deep Scan",
                  "Deep scan completed and recoverable records identified"
                );
                setStage(5);
              }}
            >
              Review Scan Results →
            </button>
          </div>
        </div>
      )}

      {stage === 5 && (
        <div className="advanced-step-card">
          <div className="advanced-step-title">
            <span>5</span>
            <div>
              <h4>Review scan results</h4>
              <p>Inspect file name, type, size, quality and risk before selecting files.</p>
            </div>
          </div>

          <div className="file-review-table">
            <div className="file-review-head">
              <span>File</span>
              <span>Type</span>
              <span>Size</span>
              <span>Quality</span>
              <span>Risk</span>
            </div>
            {filteredFiles.map((file) => (
              <div className="file-review-row" key={file.id}>
                <span>{iconFor(file.type)} {file.name}</span>
                <span>{file.type}</span>
                <span>{file.size}</span>
                <span className={`quality-pill ${file.quality.toLowerCase()}`}>
                  {file.quality}
                </span>
                <span>{file.risk}</span>
              </div>
            ))}
          </div>

          <div className="target-files-box">
            <b>Recovery Task</b>
            <p>Identify and recover these required academic files:</p>
            <div className="target-chip-list">
              {targetFiles.map((name) => <span key={name}>{name}</span>)}
            </div>
          </div>

          <div className="step-navigation">
            <button className="nav-btn" onClick={() => setStage(4)}>
              ← Previous
            </button>
            <button
              className="nav-btn next-btn"
              onClick={() => {
                addObservation(
                  setObservations,
                  5,
                  "Review scan results",
                  `${filteredFiles.length} simulated file records reviewed`
                );
                setStage(6);
              }}
            >
              Begin File Selection →
            </button>
          </div>
        </div>
      )}

      {stage === 6 && (
        <div className="advanced-step-card">
          <div className="advanced-step-title">
            <span>6</span>
            <div>
              <h4>Select recoverable files</h4>
              <p>Select the required files from the Deep Scan results.</p>
            </div>
          </div>

          <div className="selection-toolbar">
            <button
              className="recovery-btn secondary"
              onClick={() => setSelectedFiles(
                filteredFiles
                  .filter((file) => file.quality !== "Corrupted")
                  .map((file) => file.id)
              )}
            >
              Select Recoverable
            </button>
            <button
              className="recovery-btn secondary"
              onClick={() => setSelectedFiles([])}
            >
              Clear Selection
            </button>
            <span>{selectedFiles.length} file(s) selected</span>
          </div>

          <div className="recovery-file-grid advanced-files">
            {filteredFiles.map((file) => (
              <label
                key={file.id}
                className={`recovery-file ${selectedFiles.includes(file.id) ? "selected" : ""} ${
                  file.quality === "Corrupted" ? "file-disabled" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  disabled={file.quality === "Corrupted" || recovered}
                  onChange={() => toggleFile(file.id)}
                />
                <span>{iconFor(file.type)}</span>
                <span className="recovery-file-main">
                  <strong>{file.name}</strong>
                  <small>{file.type} • {file.size}</small>
                </span>
                <span className={`recovery-quality ${file.quality.toLowerCase()}`}>
                  {file.quality}
                </span>
              </label>
            ))}
          </div>

          <div className={`selection-result ${allRequiredSelected ? "correct" : "incorrect"}`}>
            {allRequiredSelected
              ? "✓ All required files have been selected correctly."
              : "Required files are not selected correctly yet."}
          </div>

          <div className="step-navigation">
            <button className="nav-btn" onClick={() => setStage(5)}>
              ← Previous
            </button>
            <button
              className="nav-btn next-btn"
              disabled={!allRequiredSelected}
              onClick={() => {
                addObservation(
                  setObservations,
                  6,
                  "Select recoverable files",
                  `${selectedFiles.length} file(s) selected for recovery`
                );
                setStage(7);
              }}
            >
              Confirm Files →
            </button>
          </div>
        </div>
      )}

      {stage === 7 && (
        <div className="advanced-step-card">
          <div className="advanced-step-title">
            <span>7</span>
            <div>
              <h4>Set recovery destination</h4>
              <p>Choose a destination different from the affected source drive.</p>
            </div>
          </div>

          <div className="destination-warning">
            <b>Source Drive:</b> {drive.id}<br />
            Do not save recovered data back to the source drive.
          </div>

          <input
            className="recovery-location advanced-location"
            value={recoveryLocation}
            onChange={(e) => {
              setRecoveryLocation(e.target.value);
              setDestinationValid(false);
            }}
            placeholder="Example: D:\Recovered_Data"
          />

          <button className="recovery-btn primary" onClick={validateDestination}>
            ✓ Validate Destination
          </button>

          {recoveryLocation && (
            <div className={`destination-status ${destinationValid ? "valid" : "invalid"}`}>
              {destinationValid
                ? "✓ Destination is valid and different from source."
                : "✗ Validate the entered destination before continuing."}
            </div>
          )}

          <div className="destination-examples">
            <span>Example destinations:</span>
            <button type="button" onClick={() => {setRecoveryLocation("D:\Recovered_Data"); setDestinationValid(false);}}>
              D:\Recovered_Data
            </button>
            <button type="button" onClick={() => {setRecoveryLocation("C:\Recovered_Files"); setDestinationValid(false);}}>
              C:\Recovered_Files
            </button>
          </div>

          <div className="step-navigation">
            <button className="nav-btn" onClick={() => setStage(6)}>
              ← Previous
            </button>
            <button
              className="nav-btn next-btn"
              disabled={!destinationValid}
              onClick={() => {
                addObservation(
                  setObservations,
                  7,
                  "Set recovery destination",
                  `${recoveryLocation} validated as a separate destination`
                );
                setStage(8);
              }}
            >
              Confirm Destination →
            </button>
          </div>
        </div>
      )}

      {stage === 8 && (
        <div className="advanced-step-card">
          <div className="advanced-step-title">
            <span>8</span>
            <div>
              <h4>Recover selected files</h4>
              <p>Review the recovery summary and start the simulated recovery.</p>
            </div>
          </div>

          <div className="recovery-summary-grid">
            <div><span>Source</span><strong>{drive.id}</strong></div>
            <div><span>Files</span><strong>{selectedFiles.length}</strong></div>
            <div><span>Scan</span><strong>Deep</strong></div>
            <div><span>Destination</span><strong>{recoveryLocation}</strong></div>
          </div>

          <div className="selected-summary-list">
            {selectedFiles.map((id) => {
              const file = files.find((item) => item.id === id);
              if (!file) return null;
              return (
                <div key={id}>
                  <span>{iconFor(file.type)} {file.name}</span>
                  <b>Selected</b>
                </div>
              );
            })}
          </div>

          <button
            className="recovery-btn green large-action"
            disabled={recovered}
            onClick={() => {
              if (!destinationValid || !allRequiredSelected) return;
              setRecovered(true);
              addObservation(
                setObservations,
                8,
                "Recover selected files",
                `${selectedFiles.length} required file(s) recovered to ${recoveryLocation}`
              );
              setStage(9);
            }}
          >
            {recovered ? "✓ Recovery Completed" : "♻ Recover Selected Files"}
          </button>

          <div className="step-navigation">
            <button className="nav-btn" onClick={() => setStage(7)}>
              ← Previous
            </button>
          </div>
        </div>
      )}

      {stage === 9 && (
        <div className="advanced-step-card final-verification-card">
          <div className="advanced-step-title">
            <span>9</span>
            <div>
              <h4>Final verification</h4>
              <p>Verify the simulated recovery result before submitting the practical.</p>
            </div>
          </div>

          {recovered ? (
            <>
              <div className="success-box large-success">
                ✓ Recovery operation completed successfully in simulation.
              </div>

              <div className="verification-grid">
                <label>
                  <input
                    type="checkbox"
                    checked={verification.fileCount}
                    onChange={(e) => setVerification((prev) => ({ ...prev, fileCount: e.target.checked }))}
                  />
                  File count matches
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={verification.destination}
                    onChange={(e) => setVerification((prev) => ({ ...prev, destination: e.target.checked }))}
                  />
                  Destination matches
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={verification.status}
                    onChange={(e) => setVerification((prev) => ({ ...prev, status: e.target.checked }))}
                  />
                  Recovery status verified
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={verification.files}
                    onChange={(e) => setVerification((prev) => ({ ...prev, files: e.target.checked }))}
                  />
                  Required files verified
                </label>
              </div>

              <button
                className="recovery-btn primary large-action"
                disabled={verification.completed}
                onClick={verifyRecovery}
              >
                {verification.completed ? "✓ Verification Completed" : "Verify Recovery Result"}
              </button>

              {verification.completed && (
                <div className="final-complete">
                  🎉 All 9 practical operations completed successfully.
                </div>
              )}
            </>
          ) : (
            <div className="final-warning">
              Complete the recovery operation before final verification.
            </div>
          )}

          {message && <div className="recovery-message">{message}</div>}

          <div className="step-navigation">
            <button className="nav-btn" onClick={() => setStage(8)}>
              ← Previous
            </button>
          </div>
        </div>
      )}

      <div className="manual-progress advanced-progress">
        <b>Stage {stage}/9</b>
        <span>{STAGE_NAMES[stage - 1]}</span>
      </div>
    </div>
  );
}

function AssignmentScreen({ answers, setAnswers }) {
  return (
    <section className="card quiz-card">
      <div className="quiz-header">
        <div>
          <h3 className="panel-heading">Assignment — 20 Questions</h3>
          <p className="input-hint">
            Answer all questions based on the data recovery practical.
          </p>
        </div>
        <div className="quiz-count">
          {answers.filter((a) => a !== null).length}/20 Answered
        </div>
      </div>

      <div className="quiz-list">
        {QUIZ.map((item, qIndex) => (
          <div key={qIndex} className="quiz-question">
            <p className="quiz-question-text">
              <b>Q{qIndex + 1}.</b> {item.q}
            </p>
            <div className="quiz-options">
              {item.options.map((option, optionIndex) => (
                <button
                  type="button"
                  key={optionIndex}
                  className={`quiz-option ${
                    answers[qIndex] === optionIndex ? "quiz-selected" : ""
                  }`}
                  onClick={() => setAnswers((prev) =>
                    prev.map((value, index) =>
                      index === qIndex ? optionIndex : value
                    )
                  )}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function IFSExperiment_DataRecovery() {
  const navigate = useNavigate();
  const saved = useMemo(() => getSaved(), []);

  const [activeTab, setActiveTab] = useState(saved?.activeTab || "simulation");
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procOpen, setProcOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [simulationStarted, setSimulationStarted] = useState(saved?.simulationStarted || false);
  const [selectedDriveId, setSelectedDriveId] = useState(saved?.selectedDriveId || "E:");
  const [stage, setStage] = useState(saved?.stage || 1);
  const [scanMode, setScanMode] = useState(saved?.scanMode || "Deep");
  const [fileTypes, setFileTypes] = useState(saved?.fileTypes || ["DOCX", "PDF", "JPG", "PNG"]);
  const [quickProgress, setQuickProgress] = useState(saved?.quickProgress || 0);
  const [deepProgress, setDeepProgress] = useState(saved?.deepProgress || 0);
  const [scanning, setScanning] = useState(false);
  const [scanType, setScanType] = useState("");
  const [scanComplete, setScanComplete] = useState(saved?.scanComplete || false);
  const [deepScanComplete, setDeepScanComplete] = useState(saved?.deepScanComplete || false);
  const [selectedFiles, setSelectedFiles] = useState(saved?.selectedFiles || []);
  const [recoveryLocation, setRecoveryLocation] = useState(saved?.recoveryLocation || "D:\Recovered_Data");
  const [destinationValid, setDestinationValid] = useState(saved?.destinationValid || false);
  const [recovered, setRecovered] = useState(saved?.recovered || false);
  const [verification, setVerification] = useState(saved?.verification || {
    fileCount: false,
    destination: false,
    status: false,
    files: false,
    completed: false,
  });
  const [observations, setObservations] = useState(saved?.observations || []);
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState(saved?.answers || Array(QUIZ.length).fill(null));
  const [submitted, setSubmitted] = useState(saved?.submitted || false);

  const drive = DRIVES.find((item) => item.id === selectedDriveId) || DRIVES[0];
  const simulationCompleted = verification.completed;
  const answered = answers.filter((answer) => answer !== null).length;

  const completedOperations = [
    observations.some((item) => item.step === 1),
    observations.some((item) => item.step === 2),
    scanComplete,
    deepScanComplete,
    observations.some((item) => item.step === 5),
    observations.some((item) => item.step === 6),
    destinationValid,
    recovered,
    verification.completed,
  ].filter(Boolean).length;

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeTab,
        simulationStarted,
        selectedDriveId,
        stage,
        scanMode,
        fileTypes,
        quickProgress,
        deepProgress,
        scanComplete,
        deepScanComplete,
        selectedFiles,
        recoveryLocation,
        destinationValid,
        recovered,
        verification,
        observations,
        answers,
        submitted,
      })
    );
  }, [
    activeTab,
    simulationStarted,
    selectedDriveId,
    stage,
    scanMode,
    fileTypes,
    quickProgress,
    deepProgress,
    scanComplete,
    deepScanComplete,
    selectedFiles,
    recoveryLocation,
    destinationValid,
    recovered,
    verification,
    observations,
    answers,
    submitted,
  ]);

  useEffect(() => {
    if (!scanning) return;

    const timer = setInterval(() => {
      if (scanType === "quick") {
        setQuickProgress((progress) => {
          const next = Math.min(progress + 5, 100);
          if (next === 100) {
            setScanning(false);
            setScanComplete(true);
            addObservation(
              setObservations,
              3,
              "Perform Quick Scan",
              "Initial scan completed and limited records detected"
            );
            setMessage("Quick Scan completed. Deep Scan is required.");
          }
          return next;
        });
      }

      if (scanType === "deep") {
        setDeepProgress((progress) => {
          const next = Math.min(progress + 4, 100);
          if (next === 100) {
            setScanning(false);
            setDeepScanComplete(true);
            setMessage("Deep Scan completed successfully.");
          }
          return next;
        });
      }
    }, 160);

    return () => clearInterval(timer);
  }, [scanning, scanType]);

  const startScan = (type) => {
    if (!simulationStarted) {
      alert("Click Start Simulation first.");
      return;
    }

    if (type === "quick" && scanComplete) return;
    if (type === "deep" && !scanComplete) {
      alert("Complete Quick Scan first.");
      return;
    }

    setScanType(type);
    setScanning(true);

    if (type === "quick") {
      setQuickProgress(0);
      setMessage("Quick Scan started...");
    } else {
      setDeepProgress(0);
      setMessage("Deep Scan started...");
    }
  };

  const handleDrive = (id) => {
    const nextDrive = DRIVES.find((item) => item.id === id);
    if (!nextDrive) return;

    const keepSimulationOpen = simulationStarted;

    setSelectedDriveId(id);
    setSimulationStarted(keepSimulationOpen);
    setStage(1);
    setScanComplete(false);
    setDeepScanComplete(false);
    setQuickProgress(0);
    setDeepProgress(0);
    setScanning(false);
    setScanType("");
    setSelectedFiles([]);
    setDestinationValid(false);
    setRecovered(false);
    setRecoveryLocation(id === "E:" ? "D:\Recovered_Data" : "C:\Recovered_Files");
    setVerification({
      fileCount: false,
      destination: false,
      status: false,
      files: false,
      completed: false,
    });
    setObservations([]);
    setMessage(
      keepSimulationOpen
        ? `${id} — ${nextDrive.name} selected. Start the source verification stage.`
        : `${id} — ${nextDrive.name} selected. Click Start Simulation to begin.`
    );
    setActiveTab("simulation");
  };

  const validateDestination = () => {
    const path = recoveryLocation.trim();
    if (!path) {
      setDestinationValid(false);
      alert("Enter a recovery destination.");
      return;
    }

    const sourceDrive = drive.id.toUpperCase();
    const destinationDrive =
      path.length >= 2 && path[1] === ":" ? path.substring(0, 2).toUpperCase() : "";

    if (destinationDrive && destinationDrive === sourceDrive) {
      setDestinationValid(false);
      alert("Invalid destination. Use a drive different from the source.");
      return;
    }

    if (path.length < 5) {
      setDestinationValid(false);
      alert("Enter a valid destination path.");
      return;
    }

    setDestinationValid(true);
    setMessage("Recovery destination validated.");
  };

  const verifyRecovery = () => {
    const complete =
      verification.fileCount &&
      verification.destination &&
      verification.status &&
      verification.files;

    if (!complete) {
      alert("Complete all four verification checks before confirming.");
      return;
    }

    setVerification((prev) => ({ ...prev, completed: true }));
    addObservation(
      setObservations,
      9,
      "Verify recovery result",
      "File count, destination, recovery status and required files verified"
    );
    setMessage("Final recovery verification completed successfully.");
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveTab("simulation");
    setSimulationStarted(false);
    setSelectedDriveId("E:");
    setStage(1);
    setScanMode("Deep");
    setFileTypes(["DOCX", "PDF", "JPG", "PNG"]);
    setQuickProgress(0);
    setDeepProgress(0);
    setScanning(false);
    setScanType("");
    setScanComplete(false);
    setDeepScanComplete(false);
    setSelectedFiles([]);
    setRecoveryLocation("D:\Recovered_Data");
    setDestinationValid(false);
    setRecovered(false);
    setVerification({
      fileCount: false,
      destination: false,
      status: false,
      files: false,
      completed: false,
    });
    setObservations([]);
    setAnswers(Array(QUIZ.length).fill(null));
    setSubmitted(false);
    setMessage("");
  };

  const handleSubmit = () => {
    if (!simulationCompleted) {
      alert("Complete all 9 simulation operations and final verification first.");
      setActiveTab("simulation");
      return;
    }

    if (answered < QUIZ.length) {
      alert("Please answer all 20 assignment questions before submitting.");
      setActiveTab("assignment");
      return;
    }

    if (submitted) return;

    const score = answers.reduce(
      (total, answer, index) =>
        total + (answer === QUIZ[index].correct ? 1 : 0),
      0
    );

    const resultData = buildIfsResult({
      completed: true,
      experimentNo: 10,
      experimentName: "Data Recovery from Formatted Pen Drive and Hard Disk",
      experimentRoute: "/ifs-experiment-10",
      simulationScore: 9,
      simulationTotal: 9,
      observations,
      quizQuestions: QUIZ,
      quizAnswers: answers,
      date: new Date().toISOString(),
    });

    localStorage.setItem("dataRecoveryResult", JSON.stringify(resultData));
    localStorage.setItem("assignmentResult", JSON.stringify(resultData));
    setSubmitted(true);
    navigate("/result", { state: resultData });
  };

  return (
    <div className="transposition-root">
      <header className="exp-header">
        <button className="btn-back" onClick={() => navigate("/ifs-experiments")}>
          ← Back
        </button>
        <h1 className="exp-title">
          Experiment 10: Data Recovery from Formatted Pen Drive and Hard Disk
        </h1>
        <button className="btn-help" onClick={() => setHelpOpen(true)}>
          ? Help
        </button>
      </header>

      <section className="card">
        <h2 className="section-heading orange">Aim</h2>
        <p>
          To recover data from a formatted Pen Drive and Hard Disk using a data
          recovery utility through a controlled educational simulation.
        </p>
      </section>

      <section className="card">
        <div className="collapsible-header" onClick={() => setTheoryOpen((v) => !v)}>
          <h2 className="section-heading orange">Theory</h2>
          <span className="chevron">{theoryOpen ? "▲" : "▼"}</span>
        </div>
        {theoryOpen && (
          <div className="collapsible-body">
            <p><b>Data Recovery:</b> Retrieving information that is no longer readily accessible because of formatting, deletion, file-system problems or storage-related issues.</p>
            <p><b>Formatted Storage:</b> Formatting changes the file-system organization. Depending on the type of formatting and later use, some previous information may remain discoverable.</p>
            <p><b>Quick Scan:</b> A rapid search of available file-system records.</p>
            <p><b>Deep Scan:</b> A more extensive search for recoverable records and useful when ordinary records are insufficient.</p>
            <p><b>Recovery Destination:</b> Recovered data should preferably be stored somewhere different from the affected source.</p>
            <p><b>Important Principle:</b> In a real recovery situation, unnecessary new writes to the affected drive should be avoided.</p>
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
              <li>Select the formatted source device.</li>
              <li>Configure the recovery scan.</li>
              <li>Perform the Quick Scan.</li>
              <li>Perform the Deep Scan.</li>
              <li>Review the scan results.</li>
            </ol>
            <ol className="proc-col" start="6">
              <li>Select the required recoverable files.</li>
              <li>Set a separate recovery destination.</li>
              <li>Recover the selected files.</li>
              <li>Verify the recovery result.</li>
            </ol>
          </div>
        )}
      </section>

      <div className="experiment-tabs">
        <button
          type="button"
          className={`experiment-tab ${activeTab === "simulation" ? "active" : ""}`}
          onClick={() => setActiveTab("simulation")}
        >
          🧪 Advanced Simulation {simulationCompleted && <span className="tab-check">✓</span>}
        </button>
        <button
          type="button"
          className={`experiment-tab ${activeTab === "assignment" ? "active" : ""}`}
          onClick={() => setActiveTab("assignment")}
        >
          📝 Assignment
        </button>
      </div>

      {activeTab === "simulation" && (
        <>
          <div className="advanced-progress-card">
            <div>
              <h3>Practical Progress</h3>
              <p>Complete every genuine recovery operation and final verification.</p>
            </div>
            <div className={`advanced-progress-badge ${simulationCompleted ? "completed" : ""}`}>
              {completedOperations}/9 Operations
            </div>
          </div>

          <div className="sim-row advanced-sim-row">
            <aside className="card inputs-panel">
              <h3 className="panel-heading">Inputs / Controls</h3>
              <label className="field-label">Storage Device</label>

              <div className="recovery-drive-list">
                {DRIVES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`recovery-drive ${selectedDriveId === item.id ? "active" : ""}`}
                    onClick={() => handleDrive(item.id)}
                    disabled={recovered}
                  >
                    <span className="drive-icon">{item.icon}</span>
                    <span className="drive-info">
                      <span className="drive-name">{item.id} — {item.name}</span>
                      <span className="drive-meta">{item.capacity} • {item.fileSystem}</span>
                    </span>
                    <span className="drive-state">FORMATTED</span>
                  </button>
                ))}
              </div>

              <div className="recovery-info-box">
                <strong>Selected Source</strong><br />
                {drive.id} — {drive.name}<br />
                <strong>File System:</strong> {drive.fileSystem}<br />
                <strong>Capacity:</strong> {drive.capacity}
              </div>

              <div className="input-note">
                <span>ℹ</span>
                <p>No actual Pen Drive or Hard Disk is accessed or modified.</p>
              </div>

              <div className="action-buttons">
                <button
                  className="btn-start full-width"
                  onClick={() => {
                    setSimulationStarted(true);
                    setStage(1);
                    setActiveTab("simulation");
                    setMessage("Simulation started. Select the correct formatted source device.");
                  }}
                  disabled={simulationStarted && !simulationCompleted}
                >
                  {simulationStarted ? "✓ Simulation Started" : "▶ Start Simulation"}
                </button>
                <button className="btn-reset full-width" onClick={handleReset}>
                  Reset Practical
                </button>
              </div>
            </aside>

            <div className="card canvas-panel">
              {simulationStarted ? (
                <RecoveryCanvas
                  drive={drive}
                  stage={stage}
                  setStage={setStage}
                  scanMode={scanMode}
                  setScanMode={setScanMode}
                  fileTypes={fileTypes}
                  setFileTypes={setFileTypes}
                  quickProgress={quickProgress}
                  deepProgress={deepProgress}
                  scanning={scanning}
                  scanType={scanType}
                  startScan={startScan}
                  scanComplete={scanComplete}
                  deepScanComplete={deepScanComplete}
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  recoveryLocation={recoveryLocation}
                  setRecoveryLocation={setRecoveryLocation}
                  destinationValid={destinationValid}
                  validateDestination={validateDestination}
                  recovered={recovered}
                  verification={verification}
                  setVerification={setVerification}
                  verifyRecovery={verifyRecovery}
                  observations={observations}
                  setObservations={setObservations}
                  message={message}
                />
              ) : (
                <div className="simulation-launch-screen">
                  <div className="launch-icon">🧪</div>
                  <h3>Simulation Ready</h3>
                  <p>
                    Select the source device from the left panel and click
                    <b> Start Simulation</b> to begin the practical.
                  </p>
                  <button
                    className="recovery-btn primary large-action"
                    onClick={() => {
                      setSimulationStarted(true);
                      setStage(1);
                      setMessage("Simulation started. Select the correct formatted source device.");
                    }}
                  >
                    ▶ Start Simulation
                  </button>
                </div>
              )}
            </div>

            <aside className="card analysis-panel">
              <h3 className="panel-heading orange">Live Analysis</h3>
              <div className="analysis-block">
                <h4 className="analysis-sub">Current Operation</h4>
                <table className="analysis-table">
                  <tbody>
                    <tr><td>Stage</td><td>:</td><td>{simulationStarted ? `${stage}/9` : "Not Started"}</td></tr>
                    <tr><td>Drive</td><td>:</td><td>{drive.id}</td></tr>
                    <tr><td>Mode</td><td>:</td><td>{scanMode}</td></tr>
                    <tr><td>Quick Scan</td><td>:</td><td>{scanComplete ? "Complete" : "Pending"}</td></tr>
                    <tr><td>Deep Scan</td><td>:</td><td>{deepScanComplete ? "Complete" : "Pending"}</td></tr>
                    <tr><td>Files</td><td>:</td><td>{selectedFiles.length}</td></tr>
                    <tr><td>Destination</td><td>:</td><td>{destinationValid ? "Valid" : "Pending"}</td></tr>
                    <tr><td>Recovery</td><td>:</td><td>{recovered ? "Complete" : "Pending"}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="analysis-block">
                <h4 className="analysis-sub">Practical Checklist</h4>
                <ol className="recovery-check-list">
                  {STAGE_NAMES.map((item, index) => (
                    <li key={item} className={stage > index && simulationStarted ? "check-completed" : ""}>
                      {stage > index && simulationStarted ? "✓" : "○"} {item}
                    </li>
                  ))}
                </ol>
              </div>

              {simulationCompleted && (
                <div className="recovery-result-box">
                  <h4>Practical Complete</h4>
                  <p>All 9 operations have been completed and the final recovery result has been verified.</p>
                </div>
              )}
            </aside>
          </div>

          <section className="card table-section">
            <h3 className="panel-heading orange">Observation Table</h3>
            <div className="table-scroll">
              <table className="obs-table advanced-observation">
                <thead>
                  <tr><th>Sr. No.</th><th>Operation</th><th>Observation</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {observations.length === 0 ? (
                    <tr><td colSpan="4">No recovery operation performed yet.</td></tr>
                  ) : (
                    [...observations].sort((a, b) => a.step - b.step).map((row) => (
                      <tr key={row.step} className="row-correct">
                        <td>{row.step}</td>
                        <td>{row.operation}</td>
                        <td>{row.observation}</td>
                        <td>✔ {row.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {activeTab === "assignment" && (
        <AssignmentScreen answers={answers} setAnswers={setAnswers} />
      )}

      <section className="submit-section">
        <button
          className={`btn-submit ${!submitted && simulationCompleted && answered === QUIZ.length ? "enabled" : "disabled"}`}
          disabled={submitted || !simulationCompleted || answered !== QUIZ.length}
          onClick={handleSubmit}
        >
          {submitted ? "Submitted" : "Submit Experiment"}
        </button>
        <div className="submit-status">
          {submitted ? (
            <p className="submit-success">Experiment Submitted Successfully</p>
          ) : (
            <p>
              Simulation: <b>{completedOperations}/9</b>
              &nbsp; | &nbsp;
              Assignment: <b>{answered === QUIZ.length ? "Ready" : `${answered}/20`}</b>
            </p>
          )}
        </div>
      </section>

      {helpOpen && (
        <div className="popup-overlay" onClick={() => setHelpOpen(false)}>
          <div className="popup-box help-popup" onClick={(e) => e.stopPropagation()}>
            <h3 className="section-heading orange">Advanced Data Recovery Practical</h3>
            <p>
              <b>Workflow:</b> Select Drive → Configure → Quick Scan → Deep Scan → Review → Select Files → Destination → Recovery → Verification.
            </p>
            <p>
              The redundant analysis and artificial priority stages were removed. Every remaining stage represents a practical recovery operation.
            </p>
            <p>This is a safe simulation and does not access real storage devices.</p>
            <button className="btn-verify full-width" onClick={() => setHelpOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
