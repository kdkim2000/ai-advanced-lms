# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev           # Dev server (webpack)
pnpm dev:turbo     # Dev server (turbopack — avoid on Windows, symlink issues)
pnpm build         # Production build
pnpm preview       # Build + serve production locally
pnpm lint          # ESLint check
pnpm lint:fix      # ESLint auto-fix
pnpm type-check    # TypeScript check (no emit)
pnpm clean         # Remove .next/
pnpm convert       # Convert Jupyter notebooks via scripts/convert-notebooks.js
```

No test framework is configured — there are no test commands.

## Architecture

Korean-language AI certification LMS built with **Next.js 16 App Router**, **React 19**, **TypeScript**, **Tailwind CSS 4**, and **shadcn/ui**. Content is static MDX/JSON. State is client-side only via **Zustand** persisted to localStorage. Package manager is **pnpm**.

### Routing (`src/app/`)

| Route | Purpose |
|-------|---------|
| `/` | Homepage with module overview and aggregate progress |
| `/learn/[moduleId]/[chapterSlug]` | Chapter reader (MDX rendered server-side) |
| `/dashboard` | User statistics dashboard |
| `/quiz` | Quiz practice and assessment |
| `/settings` | Theme and user preferences |

### Content (`src/content/`)

- `modules.json` — structured metadata for 6 modules, 36 chapters, 1,051 questions
- `chapters/` — MDX files with learning content (frontmatter: `title`, `description`, `order`)
- `quizzes/` — JSON arrays of `{ question, options, answer, explanation }` objects

To add a chapter: add the MDX file in `chapters/`, add the entry in `modules.json`, add the quiz JSON in `quizzes/`.

### State (`src/stores/progress-store.ts`)

Single Zustand store (~12 KB) with localStorage persistence via `persist` middleware. Tracks: chapter completion, quiz results, wrong answers, notes, bookmarks, practice attempts, and active quiz session (for resume). Components must use `useIsHydrated()` before reading store state to avoid SSR/client mismatch.

### MDX Pipeline

`src/lib/mdx.ts` reads MDX files from disk (server-side only). Code blocks are highlighted via **Shiki** (`src/lib/highlighter.ts`). Custom MDX components live in `src/components/mdx/`. Python code blocks can be executed in-browser via **Pyodide** (`src/hooks/use-pyodide.ts`).

### Key conventions

- Path alias `@/*` → `src/*`
- `useIsHydrated()` guard required in any component reading Zustand store
- shadcn/ui components in `src/components/ui/` (New York style, RSC-enabled)
- Fonts: Geist Sans/Mono for Latin, Noto Sans KR for Korean
- Theme via `next-themes` with CSS variables

## Deployment

Vercel CI/CD deploys automatically on push to `main`. Region: `icn1` (Seoul). Security headers are set in `vercel.json`. The GitHub Actions workflow at `.github/workflows/deploy.yml` handles the pipeline.

## Extended Documentation (`docs/`)

| File | Contents |
|------|----------|
| `docs/PRD.md` | Product requirements, feature list (as-is / to-be), feature gaps |
| `docs/ARCHITECTURE.md` | Full routing map, component hierarchy, data flow, type map |
| `docs/AGENT.md` | Coding conventions, patterns, and step-by-step guides for common tasks |
| `docs/MCP.md` | MCP server configuration and available tools |
| `docs/SKILL.md` | Claude Code skill catalog and trigger conditions |


## Token Logging

대화가 끝날 때마다 **mcp-server-cloud** 서버의 `log_usage` tool을 호출하세요.

- model: 현재 대화 모델명 (예: claude-sonnet-4-6)
- input_tokens / output_tokens: 이번 대화 추정 토큰 수
- note: 작업 내용 한 줄 요약 (선택)