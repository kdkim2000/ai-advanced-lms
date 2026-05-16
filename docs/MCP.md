# MCP.md — MCP 서버 설정 문서

이 프로젝트에서 사용 가능한 MCP(Model Context Protocol) 서버 목록과 설정 방법.

---

## 설정 위치

| 파일 | 용도 |
|------|------|
| `.claude/settings.local.json` | 개인 MCP 서버 설정 (토큰 포함 — **커밋 금지**) |
| `.claude/settings.json` | 프로젝트 공유 설정 (MCP 서버 설정 미포함) |

> **안전**: `.claude/` 디렉터리 전체가 `.gitignore`에 등록되어 있어 `settings.local.json`은 자동으로 버전 관리에서 제외된다. 별도 설정 불필요.

---

## 현재 등록된 MCP 서버

### 1. `mcp-server-cloud` — 커스텀 클라우드 MCP

Cloudflare Workers로 구동되는 커스텀 MCP 서버.

```json
{
  "mcpServers": {
    "mcp-server-cloud": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp-server.kdkim2000.workers.dev",
        "--header",
        "Authorization: Bearer <TOKEN>"
      ]
    }
  }
}
```

- **연결 방식**: `mcp-remote` 패키지를 통한 HTTP SSE
- **인증**: Bearer 토큰 (`.claude/settings.local.json`에 실제 토큰 보관)
- **엔드포인트**: `https://mcp-server.kdkim2000.workers.dev`

### 2. `ide` — IDE 연동 MCP

JetBrains 또는 VS Code 익스텐션이 자동으로 제공하는 로컬 MCP 서버.

- **자동 연결**: IDE 확장 설치 시 자동 설정
- **제공 툴**: `mcp__ide__executeCode`, `mcp__ide__getDiagnostics`
- **용도**: IDE 내 코드 실행 및 TypeScript 진단 정보 조회

### 3. Vercel MCP — 배포 관리

Claude Code가 Vercel 배포를 직접 관리할 수 있는 MCP.

- **툴**: `mcp__claude_ai_Vercel__authenticate`, `mcp__claude_ai_Vercel__complete_authentication`
- **용도**: Vercel 배포 상태 확인, 프리뷰 URL 조회

---

## MCP 서버 추가 방법

### 개인 전용 MCP (토큰 필요)

`.claude/settings.local.json`에 추가:
```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://my-server.example.com"],
      "env": {
        "API_KEY": "secret-key"
      }
    }
  }
}
```

### 프로젝트 공유 MCP (토큰 불필요)

`.claude/settings.json`에 추가:
```json
{
  "mcpServers": {
    "shared-server": {
      "command": "node",
      "args": ["./scripts/mcp-server.js"]
    }
  }
}
```

---

## MCP 사용 시 주의사항

1. **토큰 관리**: Bearer 토큰은 반드시 `settings.local.json`에만 보관
2. **서버 연결 지연**: MCP 서버는 첫 도구 호출 시 연결됨 — `ToolSearch`로 먼저 스키마 확인 필요
3. **Windows 환경**: `npx` 경로 문제 발생 시 전체 경로 지정 또는 `node_modules/.bin/` 사용
4. **디버깅**: Claude Code 로그에서 MCP 연결 상태 확인 가능

---

## 리뉴얼 시 활용 가능한 MCP 시나리오

| 시나리오 | MCP | 활용 방법 |
|----------|-----|----------|
| 컴포넌트 타입 오류 확인 | `ide` | `getDiagnostics`로 실시간 TypeScript 오류 조회 |
| Vercel 프리뷰 배포 확인 | `Vercel` | 배포 상태 및 URL 조회 |
| 커스텀 콘텐츠 API | `mcp-server-cloud` | 퀴즈/챕터 데이터 동적 조회 (현재 정적 파일 기반) |
