# AI Advanced LMS

AI Advanced 자격 취득을 위한 체계적인 학습 관리 시스템(LMS)입니다.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 주요 기능

### 학습 시스템
- **6개 학습 모듈**: Python, 데이터 분석, LLM, 프롬프트 엔지니어링, RAG, Fine-tuning
- **36개 챕터**: MDX 기반의 체계적인 학습 콘텐츠
- **진도 관리**: 챕터별 완료 체크 및 학습 진행률 추적
- **메모 기능**: 챕터별 개인 메모 저장

### 퀴즈 시스템
- **1,051개 문제**: 모듈별 객관식 퀴즈
- **오답노트**: 틀린 문제 자동 저장 및 복습
- **실전 문제풀이**: 전체 문제에서 랜덤 20문제 출제
- **풀이 기록**: 퀴즈 시도 히스토리 및 점수 추적
- **세션 저장**: 퀴즈 중단 시 진행 상태 자동 저장

### UI/UX
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- **다크 모드**: 라이트/다크/시스템 테마 지원
- **빠른 검색**: `Ctrl+K`로 콘텐츠 검색
- **사이드바 네비게이션**: 모듈/챕터 빠른 이동

## 학습 모듈

| 모듈 | 설명 | 챕터 | 문제 |
|------|------|:----:|:----:|
| 🐍 **Python 기초** | 변수, 함수, 클래스, 파일 처리 | 5 | 67 |
| 📊 **데이터 분석** | NumPy, Pandas, 텍스트 분석 | 4 | 30 |
| 🤖 **LLM** | Transformer, API, LangChain | 7 | 324 |
| ⚡ **프롬프트 엔지니어링** | 프롬프트 기법, LCEL, Agent | 6 | 310 |
| 🔍 **RAG** | 검색 증강 생성, 멀티모달 | 7 | 75 |
| 🎯 **Fine-tuning** | SFT, LoRA, PEFT | 7 | 245 |

## 기술 스택

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (with LocalStorage persist)
- **Content**: [MDX](https://mdxjs.com/) (next-mdx-remote)
- **Code Highlighting**: [Shiki](https://shiki.style/)

## 시작하기

### 요구사항

- Node.js 18.17 이상
- pnpm 8 이상

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/ai-advanced-lms.git
cd ai-advanced-lms

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 http://localhost:3000 접속

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 실행
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
│   │   ├── layout/            # 레이아웃 (Header, Sidebar)
│   │   ├── mdx/               # MDX 렌더링 컴포넌트
│   │   ├── quiz/              # 퀴즈 컴포넌트
│   │   └── search/            # 검색 컴포넌트
│   ├── content/
│   │   ├── modules.json       # 모듈/챕터 메타데이터
│   │   ├── chapters/          # MDX 학습 콘텐츠
│   │   └── quizzes/           # 퀴즈 JSON 데이터
│   ├── stores/                # Zustand 상태 관리
│   └── types/                 # TypeScript 타입 정의
├── scripts/                   # 유틸리티 스크립트
└── public/                    # 정적 파일
```

## 배포

### Vercel 배포 (권장)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-advanced-lms)

1. [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
2. "Add New Project" → GitHub 저장소 선택
3. Framework Preset: Next.js 자동 감지
4. "Deploy" 클릭

### Vercel CLI

```bash
# Vercel CLI 설치 및 배포
pnpm dlx vercel
```

## 스크린샷

| 대시보드 | 학습 페이지 | 퀴즈 |
|:--------:|:-----------:|:----:|
| 전체 진행률 확인 | MDX 콘텐츠 학습 | 객관식 문제 풀이 |

## 라이선스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.

## 기여

이슈 및 풀 리퀘스트를 환영합니다.

---

Made with [Claude Code](https://claude.ai/code)
