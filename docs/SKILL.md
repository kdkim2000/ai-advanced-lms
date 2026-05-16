# SKILL.md — Claude Code 스킬 가이드

이 프로젝트에서 사용 가능한 Claude Code 스킬 목록과 트리거 조건.  
스킬은 `/skill-name` 슬래시 커맨드 또는 Skill 도구로 호출한다.

---

## 스킬 목록

### 개발 워크플로우

| 스킬 | 트리거 표현 | 설명 |
|------|------------|------|
| `pr-description` | "PR 설명 써줘", "PR 본문 작성", "git diff 보고 PR 써줘" | GitHub PR 본문 자동 작성. git diff나 변경 내용 설명 후 호출 |
| `review` | "PR 리뷰해줘", "코드 리뷰" | Pull Request 코드 리뷰 |
| `security-review` | "보안 리뷰", "security review" | 현재 브랜치 변경사항 보안 취약점 검토 |
| `simplify` | "코드 정리해줘", "리팩토링" | 변경된 코드의 품질/재사용성 검토 및 개선 |

### 설정 관리

| 스킬 | 트리거 표현 | 설명 |
|------|------------|------|
| `update-config` | "앞으로 X 할 때마다 Y 해줘", "권한 추가", "훅 설정" | `settings.json` 자동화 훅/권한 설정. 반복 동작은 메모리가 아닌 훅으로 처리 |
| `keybindings-help` | "단축키 변경", "키바인딩 설정" | `~/.claude/keybindings.json` 커스터마이즈 |
| `fewer-permission-prompts` | "권한 프롬프트 줄여줘" | 반복되는 Bash/MCP 권한 허용 목록 자동 추가 |

### 프로젝트 초기화

| 스킬 | 트리거 표현 | 설명 |
|------|------------|------|
| `init` | "/init" | `CLAUDE.md` 초기화 (이미 생성됨, 업데이트 시 사용) |

### 자동화

| 스킬 | 트리거 표현 | 설명 |
|------|------------|------|
| `loop` | "/loop 5m /foo", "5분마다 X 실행" | 반복 작업 실행. 일회성 작업에는 사용 금지 |
| `schedule` | "3시에 실행", "매일 오전 9시에" | 예약 원격 에이전트 설정 |

### Claude API 개발

| 스킬 | 트리거 표현 | 설명 |
|------|------------|------|
| `claude-api` | `import anthropic` 코드 작업 시 자동 | Anthropic SDK 앱 개발/디버깅, 프롬프트 캐싱, 모델 마이그레이션 |

### 기타

| 스킬 | 트리거 표현 | 설명 |
|------|------------|------|
| `emoji-summarizer` | "이모지로 요약", "이모지 버전" | 텍스트를 이모지로 요약 |

---

## 이 프로젝트에서 자주 쓰는 스킬 시나리오

### 리뉴얼 작업 후 PR 작성

```
git add src/components/quiz/quiz-container.tsx
# 변경 내용 설명 후:
/pr-description
```

→ 변경된 파일의 diff를 분석하여 체계적인 PR 본문(Summary, Test plan) 자동 작성.

### 새 기능 추가 후 보안 검토

```
/security-review
```

→ 현재 브랜치의 변경사항(XSS, CSRF, 인젝션 등) 보안 취약점 검토.

### 반복 작업 자동화

예: "매번 `pnpm lint` 실행을 자동으로 해줘"
```
/update-config
```

→ `settings.json`에 post-edit 훅으로 lint 자동 실행 등록.

### 코드 리팩토링 후 품질 검토

```
/simplify
```

→ 변경된 코드의 중복 제거, 가독성, 재사용 가능성 검토 후 개선.

---

## 스킬 호출 방법

대화창에서 슬래시 커맨드로 호출하거나, 트리거 표현을 자연어로 입력하면 자동 실행된다.

```
/pr-description          # PR 설명 자동 작성
/review                  # 코드 리뷰
/security-review         # 보안 리뷰
/simplify                # 코드 품질 개선
/update-config           # settings.json 훅/권한 설정
/init                    # CLAUDE.md 재생성
```

---

## 새 스킬 추가 방법

`~/.claude/skills/` 또는 `.claude/skills/` 폴더에 스킬 파일 추가 후 `update-config` 스킬로 등록.  
빈 템플릿: `my-skills:blank-template` 스킬을 복사하여 사용.
