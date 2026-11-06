import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAttempt } from "../context/attempt.js";

function ProtectedExperiment({ subject, experimentId, children }) {
  const { setActiveAttempt } = useAttempt();
  const [status, setStatus] = useState({ state: "checking", message: "" });

  useEffect(() => {
    let active = true;

    async function startExperiment() {
      setStatus({ state: "checking", message: "" });
      try {
        const code = String(subject).toUpperCase();
        const availability = await apiRequest(
          `/experiments/${code}/${experimentId}`
        );
        if (!availability.experiment.enabled) {
          setStatus({ state: "disabled", message: "" });
          return;
        }

        const { attempt } = await apiRequest("/attempts/start", {
          method: "POST",
          body: JSON.stringify({
            subjectCode: code,
            experimentNo: Number(experimentId),
          }),
        });
        if (active) {
          setActiveAttempt({
            id: attempt.id,
            subjectCode: code,
            experimentNo: Number(experimentId),
          });
          setStatus({ state: "ready", message: "" });
        }
      } catch (error) {
        if (active) setStatus({ state: "error", message: error.message });
      }
    }

    startExperiment();
    return () => {
      active = false;
    };
  }, [subject, experimentId, setActiveAttempt]);

  if (status.state === "checking") {
    return <p role="status">Checking experiment availability…</p>;
  }
  if (status.state === "disabled") {
    return (
      <div className="experiment-access-message">
        <h2>Experiment Disabled</h2>
        <p>This experiment is currently disabled by the administrator.</p>
      </div>
    );
  }
  if (status.state === "error") {
    return (
      <div className="experiment-access-message" role="alert">
        <h2>Unable to start experiment</h2>
        <p>{status.message}</p>
      </div>
    );
  }
  return children;
}

export default ProtectedExperiment;
