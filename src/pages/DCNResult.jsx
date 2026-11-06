import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import usePersistAttempt from "../hooks/usePersistAttempt";
import "./DCNResult.css";

export default function DCNResult() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    experimentNo = "",
    experimentName = "DCN Experiment",
    experimentRoute = "/dcn-experiments",
  } = location.state || {};
  const completionPayload = useMemo(
    () => location.state || {},
    [location.state]
  );
  const persistenceError = usePersistAttempt("DCN", experimentNo, completionPayload);

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleRetry = () => {
    navigate(experimentRoute);
  };

  return (
    <div className="dcn-result-page">
      <div className="dcn-result-card">

        <div className="dcn-result-top-space"></div>

        <div className="dcn-result-header"></div>

        <div className="dcn-success-icon">
          ✔
        </div>

        <div className="dcn-result-content">

          <h1>Experiment Completed</h1>

          <p className="dcn-result-subtitle">
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

          <div className="dcn-result-msg">
            <p>
              Your experiment has been submitted successfully.
            </p>
          </div>

          <div className="dcn-result-buttons">

            <button
              type="button"
              className="dcn-dashboard-btn"
              onClick={handleDashboard}
            >
              Back to Dashboard
            </button>

            <button
              type="button"
              className="dcn-retry-btn"
              onClick={handleRetry}
            >
              Try Again
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}