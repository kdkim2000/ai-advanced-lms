"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Loader2,
  Terminal,
  AlertCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import { usePyodide } from "@/hooks/use-pyodide";
import type { ExecutionResult } from "@/lib/pyodide";

interface PythonEditorProps {
  initialCode: string;
  title?: string;
  description?: string;
  expectedOutput?: string;
  readOnly?: boolean;
}

export function PythonEditor({
  initialCode,
  title,
  description,
  expectedOutput,
  readOnly = false,
}: PythonEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const { status, loadPyodide, runCode } = usePyodide();

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const execResult = await runCode(code);
      setResult(execResult);
    } finally {
      setIsRunning(false);
    }
  }, [code, runCode]);

  const handleReset = useCallback(() => {
    setCode(initialCode);
    setResult(null);
  }, [initialCode]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleLoadPyodide = useCallback(() => {
    loadPyodide();
  }, [loadPyodide]);

  const isOutputCorrect =
    expectedOutput && result?.success && result.output.trim() === expectedOutput.trim();

  return (
    <Card className="my-6">
      {title && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {status === "idle" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadPyodide}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Python 로드
                </Button>
              )}
              {status === "loading" && (
                <Badge variant="secondary" className="text-xs">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  로딩 중...
                </Badge>
              )}
              {status === "ready" && (
                <Badge variant="default" className="text-xs bg-[color:var(--success)]">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  준비됨
                </Badge>
              )}
              {status === "error" && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  오류
                </Badge>
              )}
            </div>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {/* Code Editor */}
        <div className="relative rounded-lg border bg-zinc-950 dark:bg-zinc-900 overflow-hidden">
          {/* Editor Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Python</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                title="초기화"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Code Textarea */}
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              readOnly={readOnly}
              className="w-full min-h-[150px] p-4 bg-transparent text-zinc-100 font-mono text-sm resize-y focus:outline-none"
              style={{ tabSize: 4 }}
              spellCheck={false}
              placeholder="Python 코드를 입력하세요..."
            />
          </div>

          {/* Run Button */}
          <div className="border-t border-zinc-800 px-4 py-2">
            <Button
              onClick={handleRun}
              disabled={isRunning || !code.trim()}
              size="sm"
              className="w-full sm:w-auto"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  실행 중...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  실행하기
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output */}
        {result && (
          <div
            className={`rounded-lg border p-4 ${
              result.success
                ? isOutputCorrect
                  ? "border-[color:var(--success)] bg-[--bg-success-tint]"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
                : "border-destructive bg-[--bg-error-tint]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                {result.success ? (
                  isOutputCorrect ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />
                      <span className="text-[color:var(--success)]">
                        정답입니다!
                      </span>
                    </>
                  ) : (
                    <>
                      <Terminal className="h-4 w-4" />
                      실행 결과
                    </>
                  )
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">오류</span>
                  </>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {result.executionTime.toFixed(0)}ms
              </span>
            </div>

            {result.output && (
              <pre className="text-sm font-mono whitespace-pre-wrap bg-white dark:bg-zinc-950 rounded p-3 border">
                {result.output}
              </pre>
            )}

            {result.error && (
              <pre className="text-sm font-mono whitespace-pre-wrap text-destructive bg-white dark:bg-zinc-950 rounded p-3 border border-destructive/30 mt-2">
                {result.error}
              </pre>
            )}
          </div>
        )}

        {/* Expected Output Hint */}
        {expectedOutput && !result && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">예상 출력:</span>{" "}
            <code className="bg-muted px-1 py-0.5 rounded">{expectedOutput}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
