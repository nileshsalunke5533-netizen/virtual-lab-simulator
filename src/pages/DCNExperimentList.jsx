

import { useNavigate } from "react-router-dom";
import useSubjectExperiments from "../hooks/useSubjectExperiments";
import "./DCNExperimentList.css";

function DCNExperimentList() {
  const navigate = useNavigate();
  const { enabledByNumber, error } = useSubjectExperiments("DCN");

  const experiments = [
    {
      no: 1,
      title:
        "Observe components of network in your Computer Network Lab. Draw layout of lab.",
      path: "/dcn-experiment-1",
    },
    {
      no: 2,
      title:
        "Creating User Account & Applying Account Policies on Standalone Computer.",
      path: "/dcn-experiment-2",
    },
    {
      no: 3,
      title:
        "Use step by step procedure for File Sharing & Printer Sharing.",
      path: "/dcn-experiment-3",
    },
    {
      no: 4,
      title:
        "Identify network control devices and study their specifications.",
      path: "/dcn-experiment-4",
    },
    {
      no: 5,
      title:
        "Connect RJ45 connector to the cable using crimping and prepare a Straight Cable & Cross Over Cable and Test by Line Tester.",
      path: "/dcn-experiment-5",
    },
    {
      no: 6,
      title:
        "To Connect computers in Star Topology using wired media and any network control device.",
      path: "/dcn-experiment-6",
    },
    {
      no: 7,
      title:
        "Create a network using Peer-to-Peer Network Model.",
      path: "/dcn-experiment-7",
    },
    {
      no: 8,
      title:
        "Implementation of Network Commands (ipconfig, tracert, ping, telnet, etc.).",
      path: "/dcn-experiment-8",
    },
    {
      no: 9,
      title:
        "Installation of TCP/IP Protocol.",
      path: "/dcn-experiment-9",
    },
    {
      no: 10,
      title:
        "Implementing TCP/IP Network Configuration.",
      path: "/dcn-experiment-10",
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
          Data Communication & Networking (DCN)
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
                  <strong>Experiment No:</strong> {experiment.no}
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

export default DCNExperimentList;
