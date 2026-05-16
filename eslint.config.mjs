import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design handoff files (not Next.js source)
    "docs/design_handoff_ai_advanced_lms/**",
    // Utility scripts (CommonJS)
    "scripts/**",
    // Claude worktrees
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
