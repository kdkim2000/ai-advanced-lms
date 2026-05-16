# AGENT.md — AI 에이전트 작업 가이드

Claude Code가 이 프로젝트에서 일관되게 작업하기 위한 규칙과 패턴 정의.  
CLAUDE.md의 명령어/아키텍처 정보를 보완하며, **무엇을 어떻게** 만들지를 안내한다.

---

## 컴포넌트 작성 규칙

### 서버 컴포넌트 vs 클라이언트 컴포넌트

```typescript
// 서버 컴포넌트 (기본값) — "use client" 없음
// ✅ 사용 가능: async/await, 파일 읽기, DB 쿼리
// ❌ 불가: useState, useEffect, 이벤트 핸들러, 브라우저 API

// 클라이언트 컴포넌트 — 파일 첫 줄에 "use client"
// 필요 조건: useState, useEffect, useCallback, Zustand 훅, 이벤트 핸들러
"use client";
```

### Zustand 읽기 시 하이드레이션 가드 필수

```typescript
"use client";

import { useIsHydrated } from "@/hooks/use-hydrated";
import { useProgressStore } from "@/stores/progress-store";

export function MyComponent() {
  const isHydrated = useIsHydrated();           // SSR 하이드레이션 완료 감지
  const { progress, toggleBookmark } = useProgressStore();

  if (!isHydrated) return <Skeleton />;         // 서버/클라이언트 불일치 방지
  return <div>{/* 진도 데이터 사용 */}</div>;
}
```

**`useIsHydrated()`를 생략하면 Next.js 하이드레이션 오류 발생.** localStorage 기반 Zustand 스토어이므로 서버 렌더 시 빈 초기값과 클라이언트 실제값이 다르다.

### Props 인터페이스

```typescript
// ✅ 올바른 패턴
interface ChapterCardProps {
  chapter: Chapter;                  // 필수 props 먼저
  moduleId: string;
  onComplete: (id: string) => void;
  isCompleted?: boolean;             // 선택 props는 ? 사용
  className?: string;                // className은 항상 선택
}

export function ChapterCard({ chapter, moduleId, onComplete, isCompleted = false, className }: ChapterCardProps) {
  // ...
}

// ❌ 잘못된 패턴
export function ChapterCard(props: any) { ... }
export const ChapterCard = ({ chapter }: { chapter: any }) => { ... }
```

### 이벤트 핸들러

```typescript
// ✅ useCallback으로 메모이제이션
const handleSelectAnswer = useCallback((index: number) => {
  setAnswers((prev) => {
    const next = [...prev];
    next[currentIndex] = index;
    return next;
  });
}, [currentIndex]);

// ❌ 렌더마다 새 함수 생성
const handleSelectAnswer = (index: number) => { ... };
```

### className 병합

```typescript
// ✅ 항상 cn() 유틸 사용 (src/lib/utils.ts)
import { cn } from "@/lib/utils";

className={cn(
  "base-class other-class",
  isActive && "active-class",
  variant === "outline" && "border border-input",
  className    // 외부 주입 className은 마지막
)}

// ❌ 문자열 직접 접합
className={`base-class ${isActive ? "active-class" : ""}`}
```

### 배럴 export

```typescript
// ✅ 각 도메인 폴더의 index.ts에서 re-export
// src/components/quiz/index.ts
export { QuizContainer } from "./quiz-container";
export { QuestionCard } from "./question-card";
export { QuizResult } from "./quiz-result";

// 사용 측:
import { QuizContainer, QuestionCard } from "@/components/quiz";

// ❌ 개별 파일 직접 import (경로 변경 시 전부 수정 필요)
import { QuizContainer } from "@/components/quiz/quiz-container";
```

---

## 새 콘텐츠 추가 절차

### 새 챕터 추가

1. `src/content/modules.json`의 해당 모듈 `chapters` 배열에 항목 추가:
   ```json
   {
     "id": "llm-new-topic",
     "moduleId": "llm",
     "title": "새 주제",
     "slug": "new-topic",
     "order": 8,
     "description": "새 주제 학습 목표"
   }
   ```

2. `src/content/chapters/llm/new-topic.mdx` 생성:
   ```mdx
   ---
   title: 새 주제
   description: 새 주제 학습 목표
   ---

   # 새 주제
   ```

3. 빌드 시 `generateStaticParams()`가 자동으로 새 경로를 포함.

### 새 퀴즈 문제 추가

`src/content/quizzes/{moduleId}.json`에 새 시험 형식으로 추가:
```json
{
  "id": 325,
  "question": "문제 내용",
  "points": 1,
  "options": { "1": "A", "2": "B", "3": "C", "4": "D" },
  "answer": 2,
  "category": "LLM/RAG",
  "explanation": "정답 해설"
}
```

### 새 모듈 추가

1. `modules.json` 최상위 배열에 모듈 객체 추가 (`order` 순서 확인)
2. `src/content/chapters/{moduleId}/` 폴더 생성 + MDX 파일 추가
3. `src/content/quizzes/{moduleId}.json` 생성

---

## 상태(Store) 확장 절차

새 상태 필드 추가 시 **반드시** 두 곳을 함께 수정:

1. `src/types/index.ts` — `UserProgress` 인터페이스에 타입 추가
2. `src/stores/progress-store.ts` — 초기값 + 액션 함수 추가

```typescript
// types/index.ts에 타입 추가
interface UserProgress {
  // ... 기존 필드
  newFeature: NewFeatureData[];    // ← 추가
}

// progress-store.ts에 액션 추가
addNewFeatureItem: (item: NewFeatureData) => set((state) => ({
  progress: {
    ...state.progress,
    newFeature: [...state.progress.newFeature, item],
  },
})),
```

---

## 새 라우트 추가 절차

App Router 패턴을 따라 `loading.tsx`와 `error.tsx`를 함께 생성:

```
src/app/new-route/
├── page.tsx          # 메인 페이지
├── loading.tsx       # 로딩 스켈레톤
└── error.tsx         # 에러 바운더리 (선택, 중요 페이지만)
```

동적 라우트 추가 시 `generateStaticParams()` 구현 필수 (정적 생성 위해):
```typescript
export async function generateStaticParams() {
  const modules = await getModules();
  return modules.map((m) => ({ moduleId: m.id }));
}
```

---

## 디자인 토큰 사용 규칙

OPUS-X 디자인 시스템(`docs/DESIGN.md` 참조)을 따른다.

### 색상은 반드시 CSS 변수만 사용

```tsx
// ✅ CSS 변수 기반
className="text-[color:var(--success)]"
className="bg-[--bg-success-tint]"
className="text-[color:var(--warning)]"

// ✅ Tailwind 시맨틱 클래스 (CSS 변수 참조)
className="text-primary bg-card border-border"

// ❌ 하드코딩 색상 절대 금지
className="text-green-600 dark:text-green-400"
className="bg-green-50 dark:bg-green-900/20"
```

### 모듈 카테고리 아이콘 색상

CSS 변수를 인라인 스타일로 적용 (Tailwind arbitrary value로는 동적 변수명 불가):
```tsx
const moduleColorVars: Record<string, { bg: string; text: string }> = {
  "python":              { bg: "var(--module-python-bg)",  text: "var(--module-python-text)" },
  "data-analysis":       { bg: "var(--module-data-bg)",    text: "var(--module-data-text)" },
  "llm":                 { bg: "var(--module-llm-bg)",     text: "var(--module-llm-text)" },
  "prompt-engineering":  { bg: "var(--module-prompt-bg)",  text: "var(--module-prompt-text)" },
  "rag":                 { bg: "var(--module-rag-bg)",     text: "var(--module-rag-text)" },
  "fine-tuning":         { bg: "var(--module-fine-bg)",    text: "var(--module-fine-text)" },
};

// 사용:
<div style={{
  backgroundColor: moduleColorVars[module.id]?.bg ?? "var(--bg-subtle)",
  color: moduleColorVars[module.id]?.text ?? "var(--foreground)",
}}>
  {module.icon}
</div>
```

### 뱃지 사용 기준

| 상황 | variant |
|------|---------|
| 완료/합격 | `success` |
| 진행 중 | `default` (보라 틴트) |
| 경고/주의 | `warning` |
| 정보 | `info` |
| 삭제/오류 | `destructive` |
| 중립 태그 | `secondary` |

---

## 금지 패턴

| 금지 | 이유 | 대안 |
|------|------|------|
| `any` 타입 사용 | strict TypeScript 위반 | 정확한 타입 또는 `unknown` |
| 직접 `localStorage` 접근 | Zustand persist가 관리 | `useProgressStore()` 훅 |
| `dev:turbo` 사용 | Windows 심링크 문제 | `pnpm dev` (webpack) |
| `"use client"` 없는 훅 사용 | RSC 규칙 위반 | 파일 최상단에 추가 |
| shadcn/ui 컴포넌트 직접 수정 | 업그레이드 시 덮어써짐 | 래퍼 컴포넌트로 확장 |
| `import type` 누락 | 번들 크기 증가 | `import type { Foo }` |
| 하드코딩 색상 (`text-green-XXX`, `text-orange-XXX`) | CSS 변수와 다크모드 일관성 파괴 | `text-[color:var(--success)]`, `text-[color:var(--warning)]` |

---

## 스타일링 규칙

### 테마 컬러

CSS 변수(`--primary`, `--background`, `--muted` 등) 사용.  
하드코딩된 색상값(`#007aff`, `white`) 직접 사용 금지 — 다크 모드 깨짐.

```typescript
// ✅
className="bg-background text-foreground border-border"

// ❌
className="bg-white text-black"
style={{ color: "#007aff" }}
```

### 반응형

모바일 퍼스트. Tailwind 반응형 접두사 순서: 기본(모바일) → `sm:` → `md:` → `lg:`

```typescript
className="text-sm md:text-base lg:text-lg"
```

### 폰트

- 한국어 텍스트: `font-sans` — Noto Sans KR (로컬 TTF, `/fonts/`) + Sora (Google Fonts)
- 코드: `font-mono` — Roboto Mono

---

## 코드 품질 체크

작업 완료 후 실행:
```bash
pnpm type-check    # TypeScript 오류 확인
pnpm lint          # ESLint 규칙 확인
```

빌드 전 확인:
```bash
pnpm build         # 프로덕션 빌드 성공 여부
```
