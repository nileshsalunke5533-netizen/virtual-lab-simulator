import { useEffect, useRef, useState } from "react";
import { useAttempt } from "../context/attempt.js";

export default function usePersistAttempt(subjectCode, experimentNo, result) {
  const { activeAttempt, completeActiveAttempt } = useAttempt();
  const [error, setError] = useState("");
  const requestedAttempt = useRef(null);

  useEffect(() => {
    if (
      !activeAttempt ||
      !subjectCode ||
      !experimentNo ||
      activeAttempt.subjectCode !== String(subjectCode).toUpperCase() ||
      Number(activeAttempt.experimentNo) !== Number(experimentNo) ||
      requestedAttempt.current === activeAttempt.id
    ) {
      return;
    }

    requestedAttempt.current = activeAttempt.id;
    completeActiveAttempt(subjectCode, experimentNo, result).catch((requestError) => {
      requestedAttempt.current = null;
      setError(requestError.message);
    });
  }, [activeAttempt, subjectCode, experimentNo, result, completeActiveAttempt]);

  return error;
}
