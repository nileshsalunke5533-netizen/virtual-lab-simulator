import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import usePersistAttempt from "../hooks/usePersistAttempt";
import "./DTMResult.css";

export default function DTMResult() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    experimentNo = "",
    experimentName = "DTM Experiment",
    experimentRoute = "/dashboard",
  } = location.state || {};
  const completionPayload = useMemo(
    () => location.state || {},
    [location.state]
  );
  const persistenceError = usePersistAttempt("DTM", experimentNo, completionPayload);

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleRetry = () => {
    navigate(experimentRoute);
  };

  return (
    <div className="result-page">
      <div className="result-card">
        <div className="success-icon">✔</div>

        <h1>Experiment Completed</h1>

        <p>
          You have successfully completed
        </p>
        {persistenceError && (
          <p role="alert">
            Your result is shown, but the attempt could not be saved: {persistenceError}
          </p>
        )}

        {experimentNo !== "" && (
          <h2>Experiment {experimentNo}</h2>
        )}

        <h3>{experimentName}</h3>

        <div className="result-msg">
          <h5>
            Your experiment has been submitted successfully.
          </h5>
        </div>

        <div className="result-buttons">
          <button
            className="dashboard-btn"
            onClick={handleDashboard}
          >
            Back to Dashboard
          </button>

          <button
            className="retry-btn"
            onClick={handleRetry}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
