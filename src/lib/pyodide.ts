// Pyodide types
declare global {
  interface Window {
    loadPyodide?: (config?: PyodideConfig) => Promise<PyodideInterface>;
  }
}

interface PyodideConfig {
  indexURL?: string;
  stdout?: (text: string) => void;
  stderr?: (text: string) => void;
}

interface PyodideInterface {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packages: string | string[]) => Promise<void>;
  globals: Map<string, unknown>;
  FS: {
    writeFile: (path: string, data: string) => void;
    readFile: (path: string, options?: { encoding: string }) => string;
  };
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

let pyodideInstance: PyodideInterface | null = null;
let pyodideLoading: Promise<PyodideInterface> | null = null;

/**
 * Load Pyodide script from CDN
 */
export async function loadPyodideScript(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.loadPyodide) return;

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Pyodide script"));
    document.head.appendChild(script);
  });
}

/**
 * Initialize Pyodide instance
 */
export async function initPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) return pyodideInstance;

  if (pyodideLoading) return pyodideLoading;

  pyodideLoading = (async () => {
    await loadPyodideScript();

    if (!window.loadPyodide) {
      throw new Error("Pyodide script failed to load");
    }

    const pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
    });

    // Pre-load common packages
    await pyodide.loadPackage(["numpy"]);

    pyodideInstance = pyodide;
    return pyodide;
  })();

  return pyodideLoading;
}

/**
 * Execute Python code and capture output
 */
export async function executePython(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  const outputs: string[] = [];
  const errors: string[] = [];

  try {
    const pyodide = await initPyodide();

    // Redirect stdout and stderr
    pyodide.runPython(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.outputs = []

    def write(self, text):
        if text.strip():
            self.outputs.append(text)

    def flush(self):
        pass

    def getvalue(self):
        return ''.join(self.outputs)

_stdout_capture = OutputCapture()
_stderr_capture = OutputCapture()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);

    // Execute user code
    const result = await pyodide.runPythonAsync(code);

    // Get captured output
    const stdout = pyodide.runPython("_stdout_capture.getvalue()") as string;
    const stderr = pyodide.runPython("_stderr_capture.getvalue()") as string;

    // Reset stdout/stderr
    pyodide.runPython(`
import sys
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);

    if (stdout) outputs.push(stdout);
    if (stderr) errors.push(stderr);

    // Add result if it's not None
    if (result !== undefined && result !== null) {
      const resultStr = String(result);
      if (resultStr !== "None" && resultStr !== "undefined") {
        outputs.push(resultStr);
      }
    }

    const executionTime = performance.now() - startTime;

    return {
      success: true,
      output: outputs.join("\n").trim(),
      error: errors.length > 0 ? errors.join("\n") : undefined,
      executionTime,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      output: outputs.join("\n").trim(),
      error: errorMessage,
      executionTime,
    };
  }
}

/**
 * Check if Pyodide is loaded
 */
export function isPyodideLoaded(): boolean {
  return pyodideInstance !== null;
}

/**
 * Get Pyodide loading status
 */
export function isPyodideLoading(): boolean {
  return pyodideLoading !== null && pyodideInstance === null;
}
