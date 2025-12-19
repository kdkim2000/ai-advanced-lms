"use client";

import { useState, useCallback, useEffect } from "react";
import {
  initPyodide,
  executePython,
  isPyodideLoaded,
  type ExecutionResult,
} from "@/lib/pyodide";

export type PyodideStatus = "idle" | "loading" | "ready" | "error";

interface UsePyodideReturn {
  status: PyodideStatus;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  runCode: (code: string) => Promise<ExecutionResult>;
  loadPyodide: () => Promise<void>;
}

export function usePyodide(): UsePyodideReturn {
  const [status, setStatus] = useState<PyodideStatus>(
    isPyodideLoaded() ? "ready" : "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const loadPyodide = useCallback(async () => {
    if (status === "loading" || status === "ready") return;

    setStatus("loading");
    setError(null);

    try {
      await initPyodide();
      setStatus("ready");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load Pyodide";
      setError(errorMessage);
      setStatus("error");
    }
  }, [status]);

  const runCode = useCallback(async (code: string): Promise<ExecutionResult> => {
    if (status !== "ready") {
      await loadPyodide();
    }

    return executePython(code);
  }, [status, loadPyodide]);

  // Check if already loaded on mount
  useEffect(() => {
    if (isPyodideLoaded()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing with external state
      setStatus("ready");
    }
  }, []);

  return {
    status,
    isReady: status === "ready",
    isLoading: status === "loading",
    error,
    runCode,
    loadPyodide,
  };
}
