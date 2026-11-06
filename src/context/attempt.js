import { createContext, useContext } from "react";

export const AttemptContext = createContext(null);

export function useAttempt() {
  const context = useContext(AttemptContext);
  if (!context) throw new Error("useAttempt must be used within AttemptProvider.");
  return context;
}
