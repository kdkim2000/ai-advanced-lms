import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Highlighter | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "python",
        "javascript",
        "typescript",
        "jsx",
        "tsx",
        "json",
        "bash",
        "shell",
        "yaml",
        "markdown",
        "sql",
        "html",
        "css",
        "plaintext",
      ],
    });
  }
  return highlighter;
}

export async function highlightCode(
  code: string,
  language: string,
  theme: "dark" | "light" = "dark"
): Promise<string> {
  const hl = await getHighlighter();

  // Map common aliases to supported languages
  const langMap: Record<string, string> = {
    py: "python",
    js: "javascript",
    ts: "typescript",
    sh: "bash",
    yml: "yaml",
    md: "markdown",
    text: "plaintext",
  };

  const lang = langMap[language.toLowerCase()] || language.toLowerCase();
  const themeName = theme === "dark" ? "github-dark" : "github-light";

  try {
    return hl.codeToHtml(code, {
      lang,
      theme: themeName,
    });
  } catch {
    // Fallback to plaintext if language not supported
    return hl.codeToHtml(code, {
      lang: "plaintext",
      theme: themeName,
    });
  }
}
