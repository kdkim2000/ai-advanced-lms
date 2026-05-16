# Handoff: AI Advanced LMS — OPUS-X Redesign

## Overview

AI Advanced는 자격 취득을 위한 학습 플랫폼입니다. 본 핸드오프는 기존 사이트(ai-advanced-lms.vercel.app)의 **6개 핵심 화면을 Samsung SDS OPUS-X 디자인 시스템 기반으로 전면 리뉴얼**한 결과물입니다. 레이아웃·정보 구조는 기존과 거의 동일하게 유지하면서 시각 언어만 OPUS-X로 통일했습니다.

- **로그인 없음** — 모든 상태는 `localStorage`에 저장
- **언어** — 한국어 (UI 라벨은 모두 한글, 모듈명에 영문 혼용 허용)
- **반응형** — 880px 이하에서 사이드바 → 햄버거 메뉴 전환
- **테마** — 라이트/다크 모드 토글

---

## About the Design Files

본 번들에 포함된 `design/` 폴더의 HTML/JSX/CSS 파일들은 **디자인 레퍼런스(프로토타입)**입니다. 의도된 룩 앤 필과 인터랙션을 보여주는 참고 자료이며, 그대로 복사해 배포하기 위한 프로덕션 코드가 아닙니다.

작업 방향은 **이 디자인 레퍼런스를 타깃 코드베이스의 기존 환경(React/Next.js/Vue/등)으로 재구현**하는 것입니다. 기존 코드베이스의 컴포넌트·라우터·상태 관리 방식을 그대로 사용하되, 시각 토큰(색·타입·간격)과 컴포넌트 동작은 본 디자인을 픽셀 단위로 따르세요. 기존 환경이 없다면 Next.js + React를 권장합니다.

## Fidelity

**High-fidelity (hifi)** — 색상, 타이포그래피, 간격, 인터랙션이 모두 확정된 픽셀 단위 목업입니다. 다음 항목은 그대로 옮겨야 합니다:

- 색상 — OPUS-X 토큰 (purple-600 = `#6941C6` 등)
- 타입 — Noto Sans KR (body), Sora (display, 영문 한정), Roboto Mono (숫자/코드)
- 간격 — 4-point grid
- 라운드 — 2/4/6/8/12/16/20/full px
- 그림자 — xs~3xl 5단계
- 모션 — fast 120ms / medium 200ms / slow 320ms

---

## Screens / Views

### 1. 홈 (`/`)

- **목적** — 학습 진행 상황 한눈 확인 + 학습 재개
- **레이아웃**
  - 좌측 240px 고정 사이드바 (LNB) + 상단 56px 토픽바 (GNB) + 메인 영역
  - 메인 max-width 1240px, padding 32px 32px 96px
- **구성**
  - 히어로
    - "AI Advanced" — Sora 700 48/56 letter-spacing -.025em, color gray-900
    - 부제 "자격 취득을 위한 학습 플랫폼" — Noto Sans KR 400 17/26
    - 메타 (모듈 수 · 챕터 수 · 완료 수) — 13px 500
    - CTA "이어서 학습하기" — 보라 primary 버튼, lg(48px), trailingIcon arrow-right
  - 전체 진행률 카드 — 우측 정렬 36px 700 퍼센트 + thick 그라데이션 progress
  - 학습 모듈 그리드 — 3컬럼 (1024px↓ 2컬럼, 640px↓ 1컬럼)
    - 카드: border 1px gray-200, radius 12px, shadow-xs, padding 22px
    - 모듈 아이콘 (44×44, radius 8px, 톤별 색조)
    - 제목 17/24 700, 설명 13/20 400 gray-500
    - 우상단 진행률 % (mono 13px 700)
    - 하단 메타 "n/n 챕터" + 상태 뱃지 (완료/학습 중)
    - thin 진행률 바 (height 4px)

### 2. 대시보드 (`/dashboard`)

- **목적** — 학습 KPI + 모듈별 진행 + 최근 활동
- **레이아웃** — 메인 page 컨테이너 동일
- **구성**
  - 페이지 헤더 — `대시보드` (32/40 700 -.02em) + 부제
  - KPI 카드 — 가로 4분할 단일 카드 (border-right 구분)
    - 전체 진행률 (%)
    - 완료한 챕터 (n / 36)
    - 완료한 모듈 (1 / 6)
    - 북마크 (개수)
    - 각 셀: label 13/18 500 gray-500 → 값 36/40 700 -.02em → 보조 정보
  - 모듈별 진행 현황 — 카드 안에 6행, 4열 그리드 (240/1fr/80/60)
    - 행: 이모지 + 모듈명 + thin progress + n/n + %
    - 행 hover: bg-subtle
  - 최근 학습 활동 — 카드 안에 활동 행 리스트
    - 아바타(36×36 보라 tint) + 본문(굵게 챕터명 + 모듈명) + 시간(mono 11px)

### 3. 학습 모듈 (`/module/:moduleId/:chapterId`)

- **목적** — 챕터별 학습 콘텐츠 + 진행률 관리
- **레이아웃** — 콘텐츠 내부 좌측 260px 챕터 사이드바 + 본문 (max-width 920px)
- **챕터 사이드바**
  - 상단: 모듈 아이콘 + 모듈명 + 진행률(n/n · %)
  - thin progress bar
  - 챕터 리스트 — 완료 시 좌측 체크 아이콘(green-600), 미완료 시 빈 원, 활성 시 보라 tint 배경
- **본문**
  - 챕터 이브로우 — `{모듈명} · 챕터 N / M` + 우측 북마크 토글
  - 챕터 카드 헤더 — 큰 아이콘 + 모듈명/챕터 N/M + 챕터 제목 + 완료 시 success 뱃지
  - article 본문
    - H1 32/42 700 -.02em — purple-300 언더라인 (8px offset, 2px thick)
    - H2 24/32 700 -.01em — purple-300 언더라인 (6px offset) + 하단 border-subtle
    - H3 18/26 700 -.01em — 4px offset 언더라인
    - 본문 p 15/26 400 gray-700
    - 표 — border 1px subtle, radius 8px, 헤더는 bg-subtle
    - 콜아웃 — info/warn/success 3종, 좌측 아이콘 + 제목 + 설명
    - 코드블록 — `<pre>` gray-900 배경, Roboto Mono 13/22
    - 인라인 `<code>` — bg-muted, purple-700, radius 4px
  - 하단 네비게이션 — 이전 챕터 · 완료로 표시 · 다음 챕터

### 4. 퀴즈 허브 (`/quiz`)

- **목적** — 퀴즈 진입 (실전, 오답노트, 모듈별)
- **구성**
  - 페이지 헤더
  - 게이미피케이션 상단 스트립
    - 스트릭 핀 — `flame` 아이콘 + N일 연속 — 주황 gradient pill
    - 포인트 핀 — `zap` + N 포인트 — 보라 gradient pill
    - 주간 풀이 — neutral badge
  - 히어로 2단 그리드
    - 실전 문제풀이 카드 — purple-50→base 그라데이션 배경, 큰 보라 그라데이션 아이콘, dices+shuffle
    - 오답노트 카드 — yellow tint 아이콘, 비어있으면 "아직 틀린 문제 없음"
  - 모듈별 퀴즈 그리드 — 3컬럼 카드 (Python 기초/데이터 분석/LLM 기초/프롬프트 엔지니어링/RAG/Fine-tuning)
    - 각 카드: 40×40 아이콘 + 이름 + 설명 + 문제 수 + 오른쪽 화살표

### 5. 퀴즈 진행 중 다이얼로그 (`/quiz-intro`)

- **목적** — 진행 중인 실전 퀴즈가 있을 때 재개 / 새로 시작 선택
- **구성**
  - 일러스트 (보라 tint 96px 원형 + play-circle 56px)
  - 제목 "진행 중인 퀴즈가 있습니다"
  - 부제
  - 진행 카드 — 큰 보라 36/40 700 "answered/total" + 부제 + thin progress
  - 두 버튼 (수직 스택) — primary "이어서 풀기", outline "새 문제로 시작"

### 6. 퀴즈 문제 풀이 (`/quiz-run`)

- **목적** — 한 문제씩 풀이 + 즉시 피드백 + 게이미피케이션
- **구성**
  - 헤더 "실전 문제풀이" (shuffle 아이콘) + 부제
  - 모듈별 문제 수 핀들 (badge neutral)
  - 진행률 상단 (좌측 "진행률 N/M", 우측 스트릭+포인트+답변 카운트)
  - thick 진행 바 (보라 그라데이션)
  - 문제 번호 핀 1~20 — 32×32 원형
    - 현재 문제: 보라 테두리 + ring + tint
    - 정답 처리: green fill 흰 글자
    - 오답 처리: red fill 흰 글자
    - 미답변: white + 회색 테두리
  - 문제 카드 (radius 16px, padding 32px)
    - 상단: 모듈 뱃지 (이모지 + 모듈명) + 우측 보라 "문제 N/M" 뱃지
    - 질문 — 22/32 600 -.01em gray-900
    - 선택지 A~E — 가로 스택 버튼
      - 기본: border 1.5px gray-300, radius 12px, padding 16px 20px
      - 호버: 보라-400 테두리 + bg-subtle
      - 선택: 보라-600 테두리 + bg-primary-tint + ring-primary
      - 정답 공개: success 배경 + green-500 테두리 + 우측 check 아이콘 + 360ms pulse 애니메이션
      - 오답 공개: error 배경 + red-500 테두리 + 우측 x 아이콘
    - 정답/오답 공개 후 해설 콜아웃 (success/warn)
  - 하단: 이전 · 제출(미공개) / 다음(공개)
  - 정답 시:
    - 컨페티 (30개 4색 점, 1400ms 낙하 애니메이션)
    - +N 포인트 토스트 (24px 보라 800, 1200ms 위로 페이드)
    - 스트릭 증가 + 포인트 +10 (스트릭 보너스 최대 +10)

### 7. 퀴즈 결과 (`/quiz-result`)

- **목적** — 풀이 완료 후 정답률 + 문제 다시보기
- **구성**
  - 중앙 정렬 헤더 — 96px 원형 일러스트(70%↑ green trophy, 70%↓ yellow flag) + 큰 제목 + 부제
  - 정답률 카드 — 36/40 700 보라 + thick progress + 포인트/스트릭/정답/오답 4종 뱃지
  - 액션 3종 (수평) — primary 다시 풀기 · outline 오답노트 보기 · ghost 퀴즈 홈으로
  - 문제 다시보기 리스트 — 각 카드: 번호(success/error 원형) + 모듈 뱃지 + 질문 + 내 답/정답 + 우측 check/x

### 8. 오답노트 (`/quiz-wrong`)

- **목적** — 틀린 문제 복습
- **빈 상태** — 보라 96px 원형 + party-popper + "아직 틀린 문제가 없어요" + CTA
- **목록** — 카드별: 모듈 뱃지 + 오답 뱃지 + 질문 + 선택지 (정답은 green border+success bg, 내가 고른 오답은 red border+error bg) + 해설 콜아웃

---

## Interactions & Behavior

### Navigation
- 해시 기반 라우팅 (`#/dashboard`, `#/module/{moduleId}/{chapterId}` 등)
- 좌측 사이드바 메뉴 + 토픽바 breadcrumb이 모두 동작
- 모듈 카드 클릭 → 첫 번째 챕터로 이동
- 화면 전환 시 `window.scrollTo({ top: 0 })`

### Quiz Flow
1. 퀴즈 허브에서 "실전 도전" → 진행 중이면 `/quiz-intro` 다이얼로그, 없으면 즉시 `/quiz-run`
2. 한 문제씩 선택 → 제출 → 정/오답 공개 + 애니메이션 → 다음
3. 모든 문제 풀이 완료 → `/quiz-result`
4. 오답은 자동으로 wrongNotes에 저장됨 → `/quiz-wrong`에서 복습

### Animations
- 정답 선택 시 — `correctPulse` 360ms cubic-bezier(.2,0,0,1), scale(1) → 1.015 → 1
- 컨페티 — 30개 점, 1400ms `fall` 키프레임, translateY(0→100vh) rotate(0→540deg), 색 6종
- 포인트 토스트 — `pointsFly` 1200ms, translateY(0→-60px) + opacity 0→1→0
- progress bar — `width` 320ms ease-standard 트랜지션
- 모든 hover/focus — 120ms ease-standard

### Responsive
- ≤880px: 사이드바 280px 고정 + transform translateX(-100%) → 햄버거 토글 시 0
- ≤480px: 토픽바 검색 input 숨김

### Dark Mode
- `<html data-theme="dark">` 토글로 활성화
- gray 스케일 반전 + 토큰 오버라이드 (자세한 사항은 `app.css` 첫 dark 블록 참고)
- 토픽바 우측 moon/sun 아이콘으로 토글

---

## State Management

### Storage Schema (`localStorage["ai-advanced-lms.v1"]`)

```typescript
type AppState = {
  completed: Record<string, boolean>;   // chapterId → 완료 여부
  lastViewed: string;                   // 마지막으로 본 chapterId (이어서 학습)
  bookmarks: string[];                  // 북마크한 chapterId 목록
  quizPoints: number;                   // 누적 포인트
  quizStreak: number;                   // 연속 정답 스트릭
  quizDayCount: number;                 // 주간 풀이 수
  lastQuiz: {
    active: boolean;
    answered: number;
    total: number;                      // 20
    currentIndex: number;
    answers: Record<number, number>;    // qIdx → 선택한 choiceIdx
  };
  wrongNotes: Array<{
    qIdx: number;
    question: string;
    chose: number;
    correct: number;
    choices: string[];
    explain: string;
    module: string;
  }>;
  recent: Array<{ id: string; glyph: string; module: string; chapter: string; when: string }>;
};
```

### State Updates
- 챕터 진입 시 → `lastViewed` 업데이트
- "완료로 표시" → `completed[chapterId]` 토글
- 북마크 아이콘 → `bookmarks` 배열 토글
- 퀴즈 답 제출 → `answers`, `quizPoints`, `quizStreak`, `wrongNotes` 갱신
- 설정 → 초기화 시 `localStorage.removeItem(STORAGE_KEY) + reload`

### Theme Preference
- Tweaks 패널 또는 토픽바 토글 → `localStorage`에 별도 저장(스킬의 EDITMODE 블록), 신규 구현 시 일반 `prefers-color-scheme` + localStorage 키로 대체 가능

---

## Design Tokens

전체 토큰은 `design/opus-x/colors_and_type.css`의 `:root` 블록에 정의되어 있습니다. 다크 모드 오버라이드는 `design/app.css`의 `[data-theme="dark"]` 블록을 참고하세요.

### 핵심 색상
| 토큰 | 값 | 용도 |
|---|---|---|
| `--purple-600` | `#6941C6` | Primary 베이스 (버튼, 강조) |
| `--purple-500` | `#7F56D9` | Primary 액센트 |
| `--purple-700` | `#53389E` | Primary hover |
| `--purple-50` | `#F4F3FF` | bg-primary-tint |
| `--gray-900` | `#101828` | 가장 짙은 텍스트 |
| `--gray-600` | `#475467` | 본문 텍스트 |
| `--gray-500` | `#667085` | 보조 텍스트 |
| `--gray-300` | `#D0D5DD` | 기본 보더 |
| `--gray-200` | `#EAECF0` | subtle 보더 |
| `--gray-100` | `#F2F4F7` | bg-muted |
| `--gray-50` | `#F9FAFB` | bg-subtle |
| `--bg-canvas` | `#F8F9FC` | 앱 최외곽 배경 |
| `--green-600` | `#039855` | success |
| `--red-600` | `#D92D20` | error |
| `--yellow-700` | `#854A0E` | warning |
| `--blue-600` | `#1570EF` | info |

### 모듈별 톤 (아이콘 배경)
| 모듈 | 라이트 bg | 라이트 fg | 다크 bg/fg |
|---|---|---|---|
| Python 기본 | `#DCFCE7` | `#15803D` | green tint |
| 데이터 분석 | `#DBEAFE` | `#1D4ED8` | blue tint |
| 대규모 언어모델 | `#FCE7F3` | `#BE185D` | pink tint |
| 프롬프트 엔지니어링 | `#FEF3C7` | `#B45309` | yellow tint |
| 검색 증강 생성 | `#CFFAFE` | `#0E7490` | cyan tint |
| 파인튜닝 | `#FFE4E6` | `#BE123C` | rose tint |

### Typography
- **Body** — Noto Sans KR (400/500/600/700), 폴백 Noto Sans / Malgun Gothic
- **Display** — Sora (700 기준), 한글은 Noto Sans KR로 자동 폴백
- **Mono** — Roboto Mono / Space Mono (숫자, 코드, 작은 라벨)
- 기본 letter-spacing -0.003em (한글 가독성 + 영문 균형)
- 헤딩 word-break: keep-all (한글 어색한 줄바꿈 방지)
- 한글 라벨에는 `text-transform: uppercase`와 넓은 letter-spacing **금지**

| 토큰 | size / line-height |
|---|---|
| h1 | 38 / 48 |
| h2 | 30 / 40 |
| h3 | 24 / 32 |
| h4 | 20 / 24 |
| h5 | 16 / 20 |
| body xl | 20 / 32 |
| body lg | 16 / 24 |
| body md | 14 / 20 (기본 UI) |
| body sm | 12 / 16 |
| body xs | 10 / 16 |

### Spacing — 4-point grid
`0 · 2 · 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 80 · 96`

### Radius
`2 · 4 · 6(md, 시각 균형용 예외) · 8 · 12 · 16 · 20 · 1000(full)`

### Shadows
- `--shadow-xs` 카드 기본
- `--shadow-sm` 카드 hover, primary 버튼 hover
- `--shadow-md` 더 강조된 hover
- `--shadow-xl/2xl` 모달, 토스트
- `--ring-primary` `0 0 0 4px rgba(127,86,217,.24)` 포커스 헤일로

### Motion
- `--duration-fast` 120ms — 호버/색 전환
- `--duration-medium` 200ms — UI 트랜지션
- `--duration-slow` 320ms — progress bar 등 큰 변화
- `--ease-standard` cubic-bezier(.2,0,0,1)
- `--ease-decelerate` cubic-bezier(0,0,0,1) — 컨페티/포인트 토스트
- **금지**: 바운스, 스프링, 큰 scale, opacity 호버

---

## Components

다음 컴포넌트들은 OPUS-X 컴포넌트 카탈로그에 대응합니다. 코드베이스에 동등한 컴포넌트가 있다면 그쪽을 사용하고, 없다면 `design/app.css`의 클래스를 참조해 만드세요.

- `Button` — `.btn` + `primary/outline/ghost/tint` 변형 × `sm/md/lg` 사이즈
- `Badge` — `.badge` + `primary/neutral/success/warning/error/info` 톤
- `Card` — `.card` (radius 12) / `.card.lg` (radius 16)
- `Progress` — `.progress` + `thin/md/thick` + `grad/success` 변형
- `Callout` — `.callout` + `warn/success` 변형
- `Sidebar item` — `.sb-item` + `.on/.done/.partial`
- `Chapter item` — `.mod-chapter-item`
- `Choice button` — `.qchoice` + `.sel/.correct/.wrong/.anim`
- `Question pill` — `.qpill` + `.curr/.answered/.correct/.wrong`
- `Streak/Points pill` — `.streak-pill` / `.points-pill`
- `Tweaks Panel` — 라이트/다크 토글 (개발 편의용; 프로덕션에선 일반 토글 버튼으로 대체)

---

## Assets

- **폰트** — `design/opus-x/fonts/NotoSansKR-*.ttf` (Thin~Black 9 weights, 로컬 호스팅)
- **Sora / Noto Sans / Roboto Mono / Space Mono** — Google Fonts CDN
- **아이콘** — Lucide (open-source) — OPUS-X 원본은 Untitled-UI 기반 사내 세트지만 라이선스 문제로 Lucide로 대체. 사용 중인 아이콘: `house, book-open, circle-help, settings, graduation-cap, panel-left, search, moon, sun, chevron-right, arrow-right, arrow-left, check, x, check-circle, x-circle, info, triangle-alert, lightbulb, bookmark, bookmark-check, trending-up, layers, file-text, dices, shuffle, notebook-pen, trophy, flag, flame, zap, play-circle, rotate-ccw, trash-2, party-popper`
- **이모지** — 모듈 아이콘으로 `🐍 📊 🤖 ⚡ 🔍 🎯` 사용. 실제 프로덕션에서는 SVG 일러스트로 교체 권장

---

## Files

`design/` 폴더 구조:

```
design/
├── index.html             — 엔트리 (라우팅 + 테마 + 마운트)
├── app.css                — 모든 LMS 전용 스타일 + 다크 모드
├── data.jsx               — 모듈/챕터 카탈로그, 상태 훅, Icon/Btn/Badge/Progress 아톰
├── chrome.jsx             — Sidebar + Topbar
├── screens-home.jsx       — 홈 + 대시보드
├── screens-module.jsx     — 학습 모듈 페이지 (+ Pandas 챕터 실제 내용)
├── screens-quiz.jsx       — 퀴즈 허브/진행/문제풀이/결과/오답노트
├── tweaks-panel.jsx       — 디자인 시 사용한 Tweaks 컴포넌트 (재구현 시 불필요)
└── opus-x/
    ├── colors_and_type.css — OPUS-X 토큰 정의 (색·타입·간격·라운드·그림자·모션)
    └── fonts/              — Noto Sans KR 9-weight .ttf
```

### 구현 권장 사항

1. **타입 시스템** — `colors_and_type.css`의 모든 `--*` 변수를 디자인 토큰으로 옮기세요. Tailwind 사용 시 `tailwind.config.js`의 theme에 매핑.
2. **상태** — 위 Storage Schema를 그대로 따르되, Zustand / Jotai 등 코드베이스 표준을 사용하세요.
3. **라우터** — 현재 해시 라우터는 정적 호스팅 편의용. Next.js App Router 등 정식 라우터로 교체.
4. **퀴즈 문제 데이터** — 현재 `QUESTION_BANK`는 샘플 1~3개씩만. 실제 67/30/324/310/75/245 문제 데이터를 백엔드 또는 정적 JSON으로 연결하세요.
5. **Pandas 챕터** — `ChapterContent`의 `PandasContent`만 실제 콘텐츠. 나머지는 `GenericContent` 플레이스홀더. CMS / MDX 연동 권장.
6. **검색 (⌘K)** — 현재 토픽바에 UI만 있음. cmdk 등 라이브러리로 실구현 필요.
7. **컨페티/포인트 애니메이션** — 가벼우니 그대로 옮길 수 있음. 더 풍부하게 하려면 canvas-confetti 라이브러리 추천.
8. **다크 모드** — `[data-theme="dark"]` 셀렉터 패턴은 시스템에 그대로 이식 가능. 시스템 설정 자동 감지(`prefers-color-scheme`)도 추가 권장.
