# Claude Code 작업 기록

> AI Advanced LMS 프로젝트 개발 과정에서 Claude Code를 활용한 작업 내역을 정리한 문서입니다.

## 프로젝트 개요

- **프로젝트명**: AI Advanced LMS (Learning Management System)
- **기술 스택**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Zustand
- **저장소**: https://github.com/kdkim2000/ai-advanced-lms

---

## 세션 1: MDX Bold 마크다운 수정

### 문제 상황
MDX 파일에서 `**텍스트**한글` 패턴이 Bold 렌더링을 깨뜨리는 문제 발생.

```markdown
# 문제 예시
**벡터의 크기(거리)**를 계산합니다  ❌ Bold 깨짐

# 해결
**벡터의 크기(거리)** 를 계산합니다  ✅ 정상 렌더링
```

### 해결 방법
닫는 `**` 뒤에 한글이 바로 붙는 경우 공백 추가.

### 작업 결과
- **수정 파일**: 36개 MDX 파일
- **수정 건수**: 760건
- **커밋**: `fix: Add space after bold closing ** before Korean`

---

## 세션 2: 모바일 최적화

### 분석 단계
3개의 Explore 에이전트를 병렬로 실행하여 코드베이스 분석:

1. **레이아웃 컴포넌트 분석** - 사이드바, 헤더 등
2. **콘텐츠 페이지 분석** - 대시보드, 학습, 퀴즈 페이지
3. **UI 컴포넌트 분석** - 버튼, 체크박스, MDX 컴포넌트

### 발견된 문제점

#### 🔴 Critical (터치 접근성 - 최소 44px 권장)
| 컴포넌트 | 변경 전 | 변경 후 |
|---------|--------|--------|
| Checkbox | 16px (size-4) | 20px (size-5) |
| 퀴즈 번호 버튼 | 28px (w-7 h-7) | 모바일 36px (w-9 h-9 sm:w-7 sm:h-7) |
| 퀴즈 옵션 뱃지 | 24px (w-6 h-6) | 모바일 32px (w-8 h-8 sm:w-7 sm:h-7) |
| Button sm | 32px (h-8) | 36px (h-9) |

#### 🟠 High Priority (레이아웃)
- 챕터 네비게이션 버튼 모바일 배치
- Breadcrumb 긴 경로 overflow
- 코드 블록 폰트 크기
- MDX 제목 반응형 미적용

### 구현 계획

```
Phase 1: 터치 타겟 크기 수정 (Critical)
├── 1.1 Checkbox 컴포넌트
├── 1.2 퀴즈 번호 버튼
├── 1.3 퀴즈 옵션 뱃지
└── 1.4 Button sm 사이즈

Phase 2: 레이아웃 반응형 개선
├── 2.1 챕터 네비게이션
├── 2.2 Breadcrumb 최적화
├── 2.3 코드 블록 모바일 최적화
└── 2.4 MDX 제목 반응형

Phase 3: 세부 조정
├── 3.1 대시보드 통계 그리드
├── 3.2 학습 페이지 모듈 카드
├── 3.3 퀴즈 컨테이너 버튼
└── 3.4 챕터 콘텐츠 패딩
```

### 주요 코드 변경

#### 1. Checkbox 크기 확대
```tsx
// src/components/ui/checkbox.tsx
- className="... size-4 ..."
+ className="... size-5 ..."

- <CheckIcon className="size-3.5" />
+ <CheckIcon className="size-4" />
```

#### 2. Button 사이즈 조정
```tsx
// src/components/ui/button.tsx
size: {
  default: "h-10 px-5 py-2 has-[>svg]:px-4",
- sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
+ sm: "h-9 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
  lg: "h-12 rounded-xl px-8 has-[>svg]:px-6 text-base",
  icon: "size-10 rounded-xl",
- "icon-sm": "size-8 rounded-lg",
+ "icon-sm": "size-9 rounded-lg",
}
```

#### 3. 챕터 네비게이션 반응형
```tsx
// src/components/learn/chapter-client.tsx
- <div className="flex items-center justify-between">
+ <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

- <Button variant="outline" asChild>
+ <Button variant="outline" className="w-full sm:w-auto" asChild>
```

#### 4. Breadcrumb 모바일 최적화
```tsx
// src/components/layout/header.tsx
// 중간 항목 모바일에서 숨김
const shouldHideOnMobile = isMiddle && breadcrumbs.length > 2;

<BreadcrumbItem className={shouldHideOnMobile ? "hidden sm:flex" : ""}>
  <BreadcrumbLink className="truncate max-w-24 sm:max-w-none">
    {item.label}
  </BreadcrumbLink>
</BreadcrumbItem>
```

#### 5. MDX 제목 반응형
```tsx
// src/components/mdx/mdx-components.tsx
- "mt-8 mb-4 scroll-m-20 text-3xl font-bold tracking-tight"
+ "mt-8 mb-4 scroll-m-20 text-2xl sm:text-3xl font-bold tracking-tight"

- "mt-8 mb-4 scroll-m-20 border-b pb-2 text-2xl font-semibold"
+ "mt-8 mb-4 scroll-m-20 border-b pb-2 text-xl sm:text-2xl font-semibold"
```

#### 6. 코드 블록 반응형
```tsx
// src/components/mdx/code-block.tsx
- <div className="p-4 text-sm" ...>
+ <div className="p-3 sm:p-4 text-xs sm:text-sm" ...>

// 복사 버튼 텍스트 모바일에서 숨김
<Copy className="h-4 w-4 sm:mr-1" />
<span className="hidden sm:inline">복사</span>
```

### 수정된 파일 목록 (12개)
1. `src/components/ui/checkbox.tsx`
2. `src/components/ui/button.tsx`
3. `src/app/quiz/practice/page.tsx`
4. `src/components/quiz/question-card.tsx`
5. `src/components/quiz/quiz-container.tsx`
6. `src/components/learn/chapter-client.tsx`
7. `src/components/layout/header.tsx`
8. `src/components/mdx/code-block.tsx`
9. `src/components/mdx/mdx-components.tsx`
10. `src/app/dashboard/page.tsx`
11. `src/app/learn/page.tsx`
12. `src/app/learn/[moduleId]/[chapterSlug]/page.tsx`

### 커밋
```
e78c08e feat: Mobile optimization for better touch accessibility
```

---

## 세션 3: ESLint 문제 해결

### 문제 상황
`react-hooks/set-state-in-effect` 규칙 위반 - 5개 파일에서 동일한 패턴 발견.

```tsx
// ESLint 에러 발생 패턴
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  setIsHydrated(true);  // ❌ Avoid calling setState directly within an effect
}, []);
```

### 해결 방법
`useSyncExternalStore`를 사용한 커스텀 훅 생성 (React 18+ 권장 방식).

```tsx
// src/hooks/use-hydrated.ts
"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client: always return true after hydration
    () => false  // Server: always return false
  );
}
```

### 적용 예시
```tsx
// Before
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);
  // ...
}

// After
import { useIsHydrated } from "@/hooks/use-hydrated";

export default function DashboardPage() {
  const isHydrated = useIsHydrated();
  // ...
}
```

### 수정된 파일 (6개)
1. `src/hooks/use-hydrated.ts` (신규 생성)
2. `src/app/page.tsx`
3. `src/app/dashboard/page.tsx`
4. `src/app/learn/page.tsx`
5. `src/app/learn/[moduleId]/page.tsx`
6. `src/app/quiz/page.tsx`

### 커밋
```
1d515ab fix: Resolve ESLint set-state-in-effect warnings
```

---

## 사용된 Claude Code 기능

### 1. Task (에이전트)
```
- subagent_type: Explore - 코드베이스 탐색 및 분석
- subagent_type: Plan - 구현 계획 수립
```

### 2. 파일 작업
```
- Read: 파일 내용 읽기
- Edit: 기존 파일 수정
- Write: 새 파일 생성
- Glob: 파일 패턴 검색
- Grep: 코드 내용 검색
```

### 3. 빌드 및 검증
```bash
pnpm build    # Next.js 빌드
pnpm lint     # ESLint 검사
```

### 4. Git 작업
```bash
git status    # 상태 확인
git diff      # 변경 내용 확인
git add -A    # 스테이징
git commit    # 커밋
git push      # 푸시
```

---

## 커밋 히스토리

```
1d515ab fix: Resolve ESLint set-state-in-effect warnings
e78c08e feat: Mobile optimization for better touch accessibility
dd7cb10 fix: Add space after bold closing ** before Korean
7a1d76f fix: Correct MDX bold markdown syntax
c298b83 fix: Resolve React hydration mismatch error #418
```

---

## 참고 사항

### 모바일 테스트 기준
- iPhone SE (375px) - 최소 너비
- iPhone 13/14 (390px) - 일반 모바일
- iPad Mini (768px) - 태블릿 경계

### 터치 타겟 접근성
- WCAG 권장 최소 크기: 44x44px
- 실제 적용: 32-36px (모바일), 28px (데스크톱)

### Tailwind 반응형 브레이크포인트
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

---

*이 문서는 Claude Code (claude-opus-4-5-20251101)를 사용하여 작성되었습니다.*
