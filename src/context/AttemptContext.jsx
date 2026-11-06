import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiRequest } from "../services/api";
import { AttemptContext } from "./attempt.js";

export function AttemptProvider({ children }) {
  const [activeAttempt, setActiveAttempt] = useState(null);
  const pendingCompletion = useRef(new Map());

  const completeActiveAttempt = useCallback(async (subjectCode, experimentNo, result) => {
    const attempt = activeAttempt;
    if (
      !attempt ||
      attempt.subjectCode !== String(subjectCode).toUpperCase() ||
      Number(attempt.experimentNo) !== Number(experimentNo)
    ) {
      return false;
    }

    if (!pendingCompletion.current.has(attempt.id)) {
      const request = apiRequest(`/attempts/${attempt.id}/complete`, {
        method: "POST",
        body: JSON.stringify(result),
      });
      pendingCompletion.current.set(attempt.id, request);
    }

    try {
      await pendingCompletion.current.get(attempt.id);
      pendingCompletion.current.delete(attempt.id);
      setActiveAttempt((current) => current?.id === attempt.id ? null : current);
      return true;
    } catch (error) {
      pendingCompletion.current.delete(attempt.id);
      throw error;
    }
  }, [activeAttempt]);

  const value = useMemo(
    () => ({ activeAttempt, setActiveAttempt, completeActiveAttempt }),
    [activeAttempt, completeActiveAttempt]
  );

  return <AttemptContext.Provider value={value}>{children}</AttemptContext.Provider>;
}
