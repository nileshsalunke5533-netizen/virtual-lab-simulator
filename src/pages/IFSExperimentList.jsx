import { useNavigate } from "react-router-dom";
import useSubjectExperiments from "../hooks/useSubjectExperiments";
import "./IFSExperimentList.css";

function IFSExperimentList() {
  const navigate = useNavigate();
  const { enabledByNumber, error } = useSubjectExperiments("IFS");

  const experiments = [
    {
      no: 1,
      title:
        "Knowing the security provided with Windows Operating System.",
      path: "/ifs-experiment-1",
    },
    {
      no: 2,
      title:
        "Recovery of the password of Windows machines using password recovery utility.",
      path: "/ifs-experiment-2",
    },
    {
      no: 3,
      title:
        "Tracing of email origin using eMailTracePro utility.",
      path: "/ifs-experiment-3",
    },
    {
      no: 4,
      title:
        "Use of keylogger and anti-keylogger to secure your system.",
      path: "/ifs-experiment-4",
    },
    {
      no: 5,
      title:
        "Encrypt and decrypt the message using Simple Transposition-Permutation (Cryptool).",
      path: "/ifs-experiment-5",
    },
    {
      no: 6,
      title:
        "Encrypt and decrypt the message using Caesar Cipher with Variable.",
      path: "/ifs-experiment-6",
    },
    {
      no: 7,
      title:
        "Encrypt and decrypt the message using 3 × 3 Hill Cipher (Cryptool).",
      path: "/ifs-experiment-7",
    },
    {
      no: 8,
      title:
        "Create Digital Signature document using Cryptool.",
      path: "/ifs-experiment-8",
    },
    {
      no: 9,
      title:
        "Send and receive secret message using Steganography techniques using Steghide.",
      path: "/ifs-experiment-9",
    },
    {
      no: 10,
      title:
        "Recover the data from formatted Pen Drive and Hard Disk using Power Data Recovery utility or any other utility.",
      path: "/ifs-experiment-10",
    },
  ];

  return (
    <div className="experiment-list-page">

      {/* Header */}
      <div className="page-header">

        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Back
        </button>

        <h2 className="page-title">
          Information Security
        </h2>

        <div className="header-space"></div>

      </div>

      <h3 className="page-subtitle">
        Experiment List
      </h3>
      {error && <p role="alert">{error}</p>}

      <div className="experiment-list">

        {experiments.map((experiment) => (

            <div
              key={experiment.no}
              className="experiment-card"
            >

              {/* Card Header */}
              <div className="card-header">

                <p className="experiment-number">
                  <strong>Experiment No:</strong>{" "}
                  {experiment.no}
                </p>

                

              </div>

              {/* Experiment Title */}
              <p className="experiment-title">
                <strong>Title:</strong>{" "}
                {experiment.title}
              </p>

              {/* Start Button */}
              <button
                className="start-btn"
                onClick={() =>
                  navigate(experiment.path)
                }
                disabled={!enabledByNumber || enabledByNumber.get(experiment.no) !== true}
              >
                {enabledByNumber?.get(experiment.no) === false
                  ? "Experiment Disabled"
                  : enabledByNumber
                    ? "Start Experiment"
                    : "Checking Availability..."}
              </button>

            </div>

        ))}

      </div>

    </div>
  );
}

export default IFSExperimentList;