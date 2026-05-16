# DESIGN.md — OPUS-X 디자인 시스템 레퍼런스

AI Advanced LMS에 적용된 Samsung SDS OPUS-X 디자인 시스템 참조 문서.  
핸드오프 원본: `docs/design_handoff_ai_advanced_lms/`

---

## 브랜드 아이덴티티

| 속성 | 값 |
|------|-----|
| 브랜드 컬러 | Purple `#6941C6` (light) / `#9B8AFB` (dark) |
| 페이지 캔버스 | `#F8F9FC` (light) / `#0A0C12` (dark) |
| 카드 배경 | `#FFFFFF` solid (light) / `#0F1117` (dark) |
| 다크 모드 | `[data-theme="dark"]` 선택자 |
| 폰트 | Noto Sans KR (로컬 TTF, `/fonts/`) + Sora (Google Fonts) |
| 코드 폰트 | Roboto Mono |

---

## CSS 변수 레퍼런스

### shadcn/ui 필수 변수 (이름 변경 금지)

| 변수 | 라이트 | 다크 | 용도 |
|------|--------|------|------|
| `--background` | `#F8F9FC` | `#0A0C12` | 페이지 캔버스 |
| `--foreground` | `#101828` | `#F4F6FA` | 기본 텍스트 |
| `--card` | `#FFFFFF` | `#0F1117` | 카드 배경 |
| `--card-foreground` | `#101828` | `#F4F6FA` | 카드 텍스트 |
| `--primary` | `#6941C6` | `#9B8AFB` | 브랜드 컬러 |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | 브랜드 위 텍스트 |
| `--secondary` | `#F2F4F7` | `#1C202B` | 보조 배경 |
| `--muted` | `#F2F4F7` | `#1C202B` | 무음 배경 |
| `--muted-foreground` | `#667085` | `#8A93AB` | 보조 텍스트 |
| `--accent` | `#F4F3FF` | `#261C4A` | 액센트 배경 (보라 틴트) |
| `--accent-foreground` | `#53389E` | `#BDB4FE` | 액센트 텍스트 |
| `--destructive` | `#D92D20` | `#FF453A` | 위험/삭제 |
| `--border` | `#EAECF0` | `#1F2330` | 기본 경계선 |
| `--input` | `#D0D5DD` | `#2A2F3D` | 입력 경계선 |
| `--ring` | `#6941C6` | `#9B8AFB` | 포커스 링 |

### OPUS-X 확장 변수

| 변수 | 라이트 | 다크 | 용도 |
|------|--------|------|------|
| `--bg-base` | `#FFFFFF` | `#0F1117` | 컴포넌트 base 배경 |
| `--bg-subtle` | `#F9FAFB` | `#161922` | 미묘한 배경 |
| `--bg-muted` | `#F2F4F7` | `#1C202B` | 음소거 배경 |
| `--bg-primary-tint` | `#F4F3FF` | `#261C4A` | 보라 틴트 (활성 항목) |
| `--bg-primary-tint-hover` | `#EBE9FE` | `#2F2358` | 보라 틴트 hover |
| `--bg-neutral-tint` | `#F9FAFB` | `#161922` | 중립 틴트 (ghost hover) |
| `--bg-success-tint` | `#ECFDF3` | `#0F2B1C` | 성공 배경 |
| `--bg-warning-tint` | `#FEFBE8` | `#2A1F08` | 경고 배경 |
| `--bg-error-tint` | `#FEF3F2` | `#2B1414` | 오류 배경 |
| `--bg-info-tint` | `#EFF8FF` | `#0E1F36` | 정보 배경 |
| `--border-subtle` | `#EAECF0` | `#1F2330` | 카드/컴포넌트 경계 |
| `--border-neutral` | `#D0D5DD` | `#2A2F3D` | 기본 인터랙션 경계 |
| `--border-neutral-hover` | `#98A2B3` | `#3A4054` | hover 경계 |
| `--border-primary` | `#6941C6` | `#9B8AFB` | 활성/포커스 경계 |
| `--success` | `#039855` | `#30D158` | 성공/완료 색상 |
| `--warning` | `#854A0E` | `#F0A429` | 경고 색상 |
| `--info` | `#1570EF` | `#3B8EEA` | 정보 색상 |

### 그림자 시스템

```css
--shadow-xs: 0 1px 2px 0 rgba(16,24,40,.05)         /* 카드 기본 */
--shadow-sm: 0 1px 3px 0 rgba(16,24,40,.10), ...     /* hover 상승 */
--shadow-md: 0 4px 8px -2px rgba(16,24,40,.10), ...  /* 드롭다운 */
--shadow-lg: 0 12px 16px -4px rgba(16,24,40,.08),... /* 모달 */
```

---

## 타이포그래피

| 용도 | 폰트 | 크기 |
|------|------|------|
| 본문 (기본) | Noto Sans KR | 14px / 20px |
| 제목 h1 | Noto Sans KR Bold | 38px / 48px |
| 제목 h2 | Noto Sans KR Bold | 30px / 40px |
| 제목 h3 | Noto Sans KR Bold | 24px / 32px |
| 코드 | Roboto Mono | 13px / 20px |
| 헤딩 전용 (영문) | Sora | — |

**Korean 텍스트 규칙:**
- `word-break: keep-all` — h1~h5, `.page-title`에 적용 (어색한 줄바꿈 방지)
- `letter-spacing: -0.003em` — 한글 가독성 개선
- 영문 대문자 자간 확장 금지

---

## 컴포넌트 상태

### 버튼 사이즈

| Size | 높이 | 수평 패딩 | 용도 |
|------|------|----------|------|
| `sm` | 36px (`h-9`) | `px-3.5` | 테이블/인라인 액션 |
| `default` | 44px (`h-11`) | `px-5` | 일반 액션 버튼 |
| `lg` | 56px (`h-14`) | `px-7` | CTA / 주요 섹션 버튼 |
| `icon` | 44px (`size-11`) | — | 아이콘 전용 |
| `icon-sm` | 36px (`size-9`) | — | 소형 아이콘 |
| `icon-lg` | 56px (`size-14`) | — | 대형 아이콘 |

### 버튼 변형

| Variant | 배경 | 텍스트 | 용도 |
|---------|------|--------|------|
| `default` | `--primary` | `--primary-foreground` | 주요 액션 |
| `outline` | `--bg-base` | `--foreground` | 보조 액션 |
| `ghost` | transparent→`--bg-neutral-tint` | `--foreground` | 아이콘 버튼 |
| `tint` | `--bg-primary-tint` | `--accent-foreground` | 보라 강조 |
| `secondary` | `--secondary` | `--secondary-foreground` | 중립 |
| `destructive` | `--destructive` | white | 삭제/위험 |

### 뱃지 변형

| Variant | 배경 | 텍스트 |
|---------|------|--------|
| `default` | `--bg-primary-tint` | `--accent-foreground` |
| `secondary` | `--bg-neutral-tint` | `--muted-foreground` |
| `success` | `--bg-success-tint` | `--success` |
| `warning` | `--bg-warning-tint` | `--warning` |
| `info` | `--bg-info-tint` | `--info` |
| `destructive` | `--bg-error-tint` | `--destructive` |
| `outline` | transparent | `--foreground` |

---

## 모듈 카테고리 색상

| 모듈 | 라이트 배경 | 라이트 텍스트 | 다크 배경 | 다크 텍스트 |
|------|-----------|-------------|---------|-----------|
| Python (`python`) | `#DCFCE7` | `#15803D` | green rgba | `#4ADE80` |
| 데이터 분석 (`data-analysis`) | `#DBEAFE` | `#1D4ED8` | blue rgba | `#60A5FA` |
| LLM (`llm`) | `#FCE7F3` | `#BE185D` | pink rgba | `#F472B6` |
| 프롬프트 (`prompt-engineering`) | `#FEF3C7` | `#B45309` | yellow rgba | `#FCD34D` |
| RAG (`rag`) | `#CFFAFE` | `#0E7490` | cyan rgba | `#22D3EE` |
| Fine-tuning (`fine-tuning`) | `#FFE4E6` | `#BE123C` | rose rgba | `#FB7185` |

**사용법:**
```tsx
// 인라인 스타일로만 사용 (CSS 변수 자동 테마 전환)
<div style={{
  backgroundColor: "var(--module-python-bg)",
  color: "var(--module-python-text)"
}}>
  🐍
</div>
```

---

## 금지 패턴

다음은 이 프로젝트에서 **절대 사용 금지**:

```tsx
// ❌ 하드코딩 색상
className="text-green-600 dark:text-green-400"
className="bg-green-50 dark:bg-green-900/20"
className="text-orange-600"
style={{ color: "#007aff" }}
style={{ color: "#6941C6" }}  // 직접 hex도 금지

// ✅ CSS 변수 사용
className="text-[color:var(--success)]"
className="bg-[--bg-success-tint]"
className="text-[color:var(--warning)]"
// 또는 시맨틱 Tailwind 클래스
className="text-primary"
className="bg-card"
className="text-muted-foreground"
```

**예외**: Tailwind의 시스템 색상 유틸리티 (`text-white`, `text-black`)는 허용.

---

## 파일 위치

| 역할 | 경로 |
|------|------|
| CSS 토큰 | `src/app/globals.css` |
| 폰트 파일 | `public/fonts/NotoSansKR-*.ttf` |
| 핸드오프 원본 | `docs/design_handoff_ai_advanced_lms/` |
| 버튼 변형 | `src/components/ui/button.tsx` |
| 카드 스타일 | `src/components/ui/card.tsx` |
| 뱃지 변형 | `src/components/ui/badge.tsx` |
