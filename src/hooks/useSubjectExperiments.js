import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function useSubjectExperiments(subjectCode) {
  const [enabledByNumber, setEnabledByNumber] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest(`/subjects/${subjectCode}/experiments`)
      .then(({ experiments }) => {
        if (active) {
          setEnabledByNumber(
            new Map(experiments.map((experiment) => [
              Number(experiment.experiment_no),
              Boolean(experiment.enabled),
            ]))
          );
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, [subjectCode]);

  return { enabledByNumber, error };
}
