import { useNavigate } from "react-router-dom";
import useSubjectExperiments from "../hooks/useSubjectExperiments";
import "./DTMExperimentList.css";

function DTMExperimentList() {
  const navigate = useNavigate();
  const { enabledByNumber, error } = useSubjectExperiments("DTM");

  const experiments = [
    {
      no: 1,
      title: "Assemble and test basic logic gates.",
      path: "/dtm-experiment-1",
    },
    {
      no: 2,
      title: "Assemble and test universal and special logic gates.",
      path: "/dtm-experiment-2",
    },
    {
      no: 3,
      title: "Verify Demorgan's 1st theorem.",
      path: "/dtm-experiment-3",
    },
    {
      no: 4,
      title: "Verify Demorgan's 2nd theorem.",
      path: "/dtm-experiment-4",
    },
    {
      no: 5,
      title: "Verify 4:1 MUX truth table.",
      path: "/dtm-experiment-5",
    },
    {
      no: 6,
      title: "Verify 1:4 DEMUX truth table.",
      path: "/dtm-experiment-6",
    },
    {
      no: 7,
      title: "Verify truth table of Clocked RS Flipflop.",
      path: "/dtm-experiment-7",
    },
    {
      no: 8,
      title: "Verify truth table of JK Flipflop.",
      path: "/dtm-experiment-8",
    },
    {
      no: 9,
      title: "Verify truth table of Master Slave JK Flipflop.",
      path: "/dtm-experiment-9",
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
          Digital Techniques  (DTM)
        </h2>

        <div className="header-space"></div>

      </div>

      <h3 className="page-subtitle">
        Experiment List
      </h3>
      {error && <p role="alert">{error}</p>}

      <div className="experiment-list">

        {experiments.map((experiment) => {

          return (
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
                <strong>Title:</strong> {experiment.title}
              </p>

              {/* Button */}
              <button
                className="start-btn"
                onClick={() => navigate(experiment.path)}
                disabled={!enabledByNumber || enabledByNumber.get(experiment.no) !== true}
              >
                {enabledByNumber?.get(experiment.no) === false
                  ? "Experiment Disabled"
                  : enabledByNumber
                    ? "Start Experiment"
                    : "Checking Availability..."}
              </button>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default DTMExperimentList;