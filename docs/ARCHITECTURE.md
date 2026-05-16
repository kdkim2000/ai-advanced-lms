# ARCHITECTURE.md

기술 아키텍처 참조 문서. 코드베이스의 구조와 데이터 흐름을 설명한다.

---

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.1.0 |
| UI 런타임 | React | 19.2.3 |
| 언어 | TypeScript | 5 |
| 스타일 | Tailwind CSS | 4 |
| UI 컴포넌트 | shadcn/ui (New York style) | — |
| 상태 관리 | Zustand | 5.0.9 |
| 콘텐츠 렌더링 | next-mdx-remote | 5.0.0 |
| 코드 하이라이팅 | Shiki | 3.20.0 |
| 파이썬 실행 | Pyodide | 0.24.1 (CDN) |
| 테마 | next-themes | 0.4.6 |
| 아이콘 | Lucide React | 0.562.0 |
| 패키지 매니저 | pnpm | 9 |

---

## 라우팅 맵 (App Router)

```
src/app/
├── page.tsx                              # / — 홈: 모듈 카드 + 전체 진도
├── layout.tsx                            # Root: ThemeProvider + SidebarProvider + AppSidebar
├── error.tsx                             # 전역 에러 바운더리
├── not-found.tsx                         # 404
│
├── dashboard/
│   ├── page.tsx                          # /dashboard — 학습 통계 대시보드
│   └── loading.tsx
│
├── learn/
│   ├── page.tsx                          # /learn — 전체 모듈 목록
│   └── [moduleId]/
│       ├── page.tsx                      # /learn/[moduleId] — 모듈 개요 + 챕터 목록
│       └── [chapterSlug]/
│           ├── page.tsx                  # /learn/[moduleId]/[slug] — MDX 챕터 리더
│           ├── error.tsx
│           └── loading.tsx
│
├── quiz/
│   ├── page.tsx                          # /quiz — 퀴즈 허브 (모듈 선택 + 실전/오답)
│   ├── [moduleId]/
│   │   ├── page.tsx                      # /quiz/[moduleId] — 모듈별 퀴즈
│   │   └── loading.tsx
│   ├── practice/
│   │   ├── page.tsx                      # /quiz/practice — 랜덤 20문제 실전
│   │   └── history/
│   │       └── page.tsx                  # /quiz/practice/history — 시도 이력
│   └── wrong-answers/
│       └── page.tsx                      # /quiz/wrong-answers — 오답 노트
│
└── settings/
    └── page.tsx                          # /settings — 테마 설정
```

---

## 컴포넌트 계층

```
src/components/
├── ui/                    # shadcn/ui 기본 컴포넌트 (21개, 직접 수정 금지)
│   └── alert, badge, button, card, checkbox, collapsible, dialog,
│       dropdown-menu, input, progress, scroll-area, separator,
│       sheet, sidebar, skeleton, textarea, tooltip, ...
│
├── layout/
│   ├── app-sidebar.tsx    # 접이식 모듈/챕터 네비게이션 사이드바
│   └── header.tsx         # 스티키 헤더 (브레드크럼 + 테마 토글)
│
├── mdx/
│   ├── mdx-content.tsx    # MDXRemote 서버 컴포넌트 래퍼
│   ├── mdx-components.tsx # h1-h6, a, table, Callout 커스텀 오버라이드
│   ├── code-block.tsx     # Shiki 하이라이팅 Pre 컴포넌트
│   ├── callout.tsx        # Info/Warning/Error 콜아웃 박스
│   └── table-of-contents.tsx
│
├── quiz/
│   ├── quiz-container.tsx # 퀴즈 전체 로직 (클라이언트, 세션/상태 관리)
│   ├── question-card.tsx  # 단일 문제 + 보기 선택 UI
│   └── quiz-result.tsx    # 결과 화면 + 모듈별 통계
│
├── common/
│   ├── bookmark-button.tsx
│   └── note-editor.tsx
│
├── code/
│   └── python-editor.tsx  # Pyodide 기반 인터랙티브 Python 실행
│
├── search/
│   ├── search-button.tsx  # Ctrl+K 트리거
│   └── search-dialog.tsx  # 콘텐츠 검색 모달
│
└── providers/
    └── theme-provider.tsx # next-themes 래퍼
```

각 도메인 폴더에는 `index.ts` 배럴 export 파일이 있다.

---

## 데이터 흐름

### 챕터 학습 흐름 (서버→클라이언트)

```
[요청] /learn/llm/transformer
    ↓
page.tsx (서버 컴포넌트)
    → generateStaticParams() — 빌드 타임에 전체 경로 정적 생성
    → getChapterContent(moduleId, slug)  [src/lib/mdx.ts]
        → gray-matter로 frontmatter + content 파싱
        → extractTableOfContents() — 헤딩 추출
    ↓
MDXContent (서버 컴포넌트)  [src/components/mdx/mdx-content.tsx]
    → MDXRemote (next-mdx-remote)
        → remark-gfm, rehype-slug, rehype-autolink-headings
        → 커스텀 컴포넌트 주입 (code-block, callout 등)
        → Shiki 하이라이팅 [src/lib/highlighter.ts]
    ↓
ChapterClient (클라이언트 컴포넌트)
    → useProgressStore — 북마크, 완료 상태, 노트
    → useIsHydrated() 가드
```

### 퀴즈 데이터 흐름

```
src/content/quizzes/{moduleId}.json
    ↓ (서버 컴포넌트에서 import)
quiz/[moduleId]/page.tsx
    → 포맷 정규화 (새 시험 형식 vs 레거시 배열 형식 자동 감지)
    ↓
QuizContainer (클라이언트)
    → answers 상태 (useState)
    → saveQuizSession / getQuizSession — 세션 저장/복원
    → addWrongAnswers — 오답 등록
    → addQuizResult — 퀴즈 결과 저장
```

### 상태 지속성

```
useProgressStore (Zustand)
    → persist 미들웨어
    → localStorage key: "ai-advanced-lms-progress"
    → 클라이언트 전용 — SSR 불일치 방지를 위해 useIsHydrated() 가드 필수
```

---

## Zustand Store 구조 (`src/stores/progress-store.ts`)

```typescript
UserProgress {
  moduleProgress: {
    [moduleId]: {
      completedChapters: string[]   // 챕터 ID 배열
      quizScores: QuizResult[]
      startedAt?: string
      completedAt?: string
    }
  }
  bookmarks: string[]               // 챕터 ID 배열
  notes: { [chapterId]: string }
  wrongAnswers: WrongAnswer[]
  practiceAttempts: PracticeAttempt[]
  quizSessions: { [moduleId]: QuizSession }  // 중단된 퀴즈 복원용
  lastAccessed?: string
  updatedAt: string
}
```

**스토어 액션 그룹:**
- 챕터: `markChapterComplete`, `markChapterIncomplete`, `setNote`, `setLastAccessed`, `resetProgress`
- 퀴즈: `addQuizResult`
- 북마크: `toggleBookmark`, `isBookmarked`
- 오답: `addWrongAnswers`, `removeWrongAnswer`, `markWrongAnswerSolved`, `getUnsolvedWrongAnswers`
- 실전: `addPracticeAttempt`, `removePracticeAttempt`, `getPracticeStats`
- 세션: `saveQuizSession`, `getQuizSession`, `clearQuizSession`, `hasQuizSession`
- 진도: `getModuleProgress`, `getOverallProgress`, `isChapterComplete`

---

## TypeScript 타입 맵 (`src/types/index.ts`)

```typescript
Module          // id, title, titleKo, description, icon, order, chapters[]
Chapter         // id, moduleId, title, slug, order, description?

// Question 타입은 두 가지 형식을 모두 지원:
//   새 시험 형식: options가 객체 {"1":..,"2":..}, answer가 1-indexed 숫자
//   레거시 형식:  options가 배열,                 correctAnswer가 0-indexed 숫자
Question        // id, question, options, answer|correctAnswer, explanation, category?

QuizResult      // quizId, score, totalQuestions, completedAt, answers[]
WrongAnswer     // 오답 저장 형식 — addedAt + solvedAt? 포함
PracticeAttempt // 실전 시도 — moduleStats 포함
QuizSession     // 중단 퀴즈 상태 — currentQuestionIndex, answers[], startedAt
UserProgress    // 전체 사용자 진도 (위 Zustand 구조와 일치)
CodeBlock       // code, language, editable, expectedOutput?
```

---

## 콘텐츠 구조 (`src/content/`)

```
content/
├── modules.json              # 6개 모듈 메타데이터 (챕터 목록 포함)
├── chapters/
│   └── {moduleId}/
│       └── {slug}.mdx        # frontmatter: title, description
└── quizzes/
    └── {moduleId}.json       # 새 시험 형식: exam_info + questions[]
```

**퀴즈 JSON — 새 시험 형식 (현재 표준):**
```json
{
  "moduleId": "llm",
  "exam_info": { "title": "...", "level": "LV.1", "total_questions": 324 },
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": { "1": "...", "2": "...", "3": "...", "4": "..." },
      "answer": 2,
      "category": "LLM/Transformer",
      "explanation": "..."
    }
  ]
}
```

**레거시 형식도 자동 감지 지원** (options 배열 + correctAnswer 0-indexed).

---

## MDX 파이프라인

```
src/lib/mdx.ts
├── getChapterContent(moduleId, slug) → { frontmatter, content }
├── getChapterSlugs(moduleId) → string[]
├── extractTableOfContents(content) → TableOfContentsItem[]
└── mdxOptions — remark-gfm + rehype-slug + rehype-autolink-headings

src/lib/highlighter.ts
└── getHighlighter() — Shiki 싱글턴, 14개 언어 지원 (github-dark/light 테마)

src/lib/pyodide.ts
└── initPyodide(), executePython(code) → { success, output, error, executionTime }
```

---

## 빌드 및 배포

**빌드**: Webpack 강제 사용 (Windows 심링크 문제로 Turbopack 비활성화)

**Vercel 배포:**
- 리전: `icn1` (서울)
- 트리거: `main` 브랜치 push → 프로덕션, PR → 프리뷰
- 보안 헤더: X-Frame-Options, X-XSS-Protection, X-Content-Type-Options, Referrer-Policy

**CI/CD** (`.github/workflows/deploy.yml`):
1. Node.js 20 + pnpm 9 설치
2. Vercel CLI로 빌드 + 배포
3. PR에 프리뷰 URL 자동 코멘트

**필요한 시크릿**: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`
