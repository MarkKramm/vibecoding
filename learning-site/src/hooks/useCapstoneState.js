import { useCallback, useEffect, useState } from "react";
import { readCapstoneState, writeCapstoneState } from "../lib/examState.js";

export function useCapstoneState() {
  const [state, setState] = useState(readCapstoneState);
  useEffect(() => {
    const sync = () => setState(readCapstoneState());
    window.addEventListener("storage", sync);
    window.addEventListener("vibecoding:capstone-state", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("vibecoding:capstone-state", sync);
    };
  }, []);
  const save = useCallback((next) => {
    writeCapstoneState(next);
    setState(next);
    if (typeof window !== "undefined") window.dispatchEvent(new Event("vibecoding:capstone-state"));
    return next;
  }, []);
  return { state, save };
}
