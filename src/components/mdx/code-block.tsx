"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightedCode?: string;
}

export function CodeBlock({
  children,
  language = "text",
  filename,
  showLineNumbers = true,
  highlightedCode,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languageLabel = getLanguageLabel(language);

  return (
    <div className="group relative my-4 rounded-lg border bg-zinc-950 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-zinc-400" />
          {filename ? (
            <span className="text-sm text-zinc-400">{filename}</span>
          ) : (
            <span className="text-sm text-zinc-400">{languageLabel}</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              복사
            </>
          )}
        </Button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto">
        {highlightedCode ? (
          <div
            className="p-4 text-sm"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        ) : (
          <pre className={`p-4 text-sm ${showLineNumbers ? "line-numbers" : ""}`}>
            <code className={`language-${language}`}>{children}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

function getLanguageLabel(language: string): string {
  const labels: Record<string, string> = {
    python: "Python",
    py: "Python",
    javascript: "JavaScript",
    js: "JavaScript",
    typescript: "TypeScript",
    ts: "TypeScript",
    jsx: "JSX",
    tsx: "TSX",
    bash: "Bash",
    sh: "Shell",
    shell: "Shell",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    markdown: "Markdown",
    md: "Markdown",
    sql: "SQL",
    html: "HTML",
    css: "CSS",
    text: "Plain Text",
  };

  return labels[language.toLowerCase()] || language.toUpperCase();
}

// Pre component for MDX
interface PreProps {
  children: React.ReactNode;
  className?: string;
  "data-language"?: string;
  "data-theme"?: string;
}

interface CodeChildProps {
  children?: string;
  className?: string;
}

export function Pre({ children, ...props }: PreProps) {
  // Extract code content and language from children
  const childElement = children as React.ReactElement<CodeChildProps>;
  const childProps = childElement?.props;
  const code = childProps?.children || "";
  const language = childProps?.className?.replace("language-", "") || "text";

  return (
    <CodeBlock language={language} {...props}>
      {typeof code === "string" ? code.trim() : String(code)}
    </CodeBlock>
  );
}
