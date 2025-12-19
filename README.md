# AI Advanced Learning Platform

AI Advanced 자격 취득을 위한 체계적인 학습 플랫폼입니다.

## 주요 기능

- **6개 학습 모듈**: Python, 데이터 분석, LLM, 프롬프트 엔지니어링, RAG, Fine-tuning
- **31개 챕터**: 단계별 체계적인 학습 콘텐츠
- **브라우저 내 Python 실행**: Pyodide를 활용한 인터랙티브 코드 실행
- **퀴즈 시스템**: 모듈별 자가진단 테스트
- **진도 관리**: 학습 진행률 추적 및 저장
- **검색 기능**: 콘텐츠 빠른 검색 (Ctrl+K)
- **북마크 & 메모**: 중요 내용 저장
- **다크 모드**: 라이트/다크 테마 지원
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand (with LocalStorage persist)
- **Content**: MDX (next-mdx-remote)
- **Code Execution**: Pyodide (WebAssembly Python)
- **Code Highlighting**: Shiki

## 시작하기

### 요구사항

- Node.js 18.17 이상
- pnpm 8 이상

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd ai-advanced-lms

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 빌드 미리보기
pnpm start
```

## 프로젝트 구조

```
ai-advanced-lms/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── learn/             # 학습 페이지
│   │   ├── quiz/              # 퀴즈 페이지
│   │   ├── dashboard/         # 대시보드
│   │   └── settings/          # 설정
│   ├── components/
│   │   ├── ui/                # shadcn/ui 컴포넌트
│   │   ├── layout/            # 레이아웃 컴포넌트
│   │   ├── mdx/               # MDX 렌더링 컴포넌트
│   │   ├── quiz/              # 퀴즈 컴포넌트
│   │   ├── code/              # 코드 에디터 컴포넌트
│   │   ├── search/            # 검색 컴포넌트
│   │   └── common/            # 공통 컴포넌트
│   ├── content/
│   │   ├── modules.json       # 모듈/챕터 메타데이터
│   │   ├── chapters/          # MDX 콘텐츠
│   │   └── quizzes/           # 퀴즈 데이터
│   ├── hooks/                 # React 커스텀 훅
│   ├── lib/                   # 유틸리티 함수
│   ├── stores/                # Zustand 스토어
│   └── types/                 # TypeScript 타입 정의
├── scripts/                   # 스크립트 (노트북 변환 등)
└── public/                    # 정적 파일
```

## 학습 모듈

| 모듈 | 설명 | 챕터 수 |
|------|------|---------|
| 🐍 Python | Python 프로그래밍 기초 | 5 |
| 📊 데이터 분석 | NumPy, Pandas, 텍스트 처리 | 5 |
| 🤖 LLM | OpenAI API, LangChain 기초 | 2 |
| ⚡ 프롬프트 엔지니어링 | 프롬프트 설계, LCEL, Agent | 5 |
| 🔍 RAG | 검색 증강 생성 | 6 |
| 🎯 Fine-tuning | 모델 파인튜닝 | 4 |

## 주요 기능 사용법

### 검색

- `Ctrl + K` (Windows) / `⌘ + K` (Mac)으로 검색 다이얼로그 열기
- 모듈, 챕터, 퀴즈 검색 가능

### 학습 진도

- 각 챕터 하단의 체크박스로 완료 표시
- 진도는 브라우저 LocalStorage에 자동 저장
- 대시보드에서 전체 진행률 확인

### Python 코드 실행

- MDX 콘텐츠 내 PythonEditor 컴포넌트 사용
- 브라우저에서 직접 Python 코드 실행 가능
- Pyodide 로드 후 사용 (첫 로드 시 약간의 시간 소요)

### 퀴즈

- 각 모듈별 10문항 객관식 퀴즈
- 제출 후 정답/오답 확인 및 해설 제공
- 퀴즈 점수 히스토리 저장

## 배포

### Vercel 배포

1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. Git 저장소 연결
4. 자동 감지된 설정 확인 후 "Deploy" 클릭

```bash
# Vercel CLI로 배포
pnpm dlx vercel
```

### 환경 변수

`.env.example` 파일을 참조하여 필요한 환경 변수를 설정하세요.

## 개발

### 콘텐츠 추가

1. `src/content/chapters/[module]/` 디렉토리에 MDX 파일 생성
2. `src/content/modules.json`에 챕터 메타데이터 추가

### 퀴즈 추가

`src/content/quizzes/` 디렉토리의 JSON 파일 형식을 참조하여 퀴즈 추가

### 스타일링

Tailwind CSS 및 shadcn/ui 컴포넌트 사용. `tailwind.config.ts`에서 커스터마이징 가능.

## 라이선스

MIT License

## 기여

이슈 및 풀 리퀘스트를 환영합니다.
