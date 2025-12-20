/**
 * Claude Code Conversation Extractor
 *
 * Claude Code 대화 내역을 Markdown으로 추출합니다.
 *
 * 사용법:
 *   node scripts/extract-claude-conversations.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const CLAUDE_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude');
const PROJECT_DIRS = [
  path.join(CLAUDE_DIR, 'projects', 'E--python-AI-Advanced-code-code'),
  path.join(CLAUDE_DIR, 'projects', 'E--python-AI-Advanced-code-----')
];
const OUTPUT_FILE = path.join(__dirname, '..', 'claude-conversations.md');

// Sensitive data patterns to redact
const SENSITIVE_PATTERNS = [
  { pattern: /VERCEL_TOKEN\s*[:=]\s*['"]?[^'"\s\n]+['"]?/gi, replacement: 'VERCEL_TOKEN=<REDACTED>' },
  { pattern: /VERCEL_ORG_ID\s*[:=]\s*['"]?[^'"\s\n]+['"]?/gi, replacement: 'VERCEL_ORG_ID=<REDACTED>' },
  { pattern: /VERCEL_PROJECT_ID\s*[:=]\s*['"]?[^'"\s\n]+['"]?/gi, replacement: 'VERCEL_PROJECT_ID=<REDACTED>' },
  { pattern: /secrets\.[A-Z_]+/gi, replacement: 'secrets.<REDACTED>' },
  { pattern: /token\s*[:=]\s*['"]?[A-Za-z0-9_-]{20,}['"]?/gi, replacement: 'token=<REDACTED>' },
];

/**
 * Sanitize sensitive data from content
 */
function sanitizeSensitiveData(content) {
  if (!content || typeof content !== 'string') return content;

  let sanitized = content;
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}

/**
 * JSONL 파일을 읽어서 대화 내용을 파싱
 */
async function parseJsonlFile(filePath) {
  const messages = [];
  const metadata = {
    sessionId: null,
    branch: null,
    cwd: null,
    startTime: null,
    endTime: null,
    version: null,
    summaries: []
  };

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const data = JSON.parse(line);

      // Summary 추출
      if (data.type === 'summary') {
        metadata.summaries.push(data.summary);
      }

      // 메타데이터 추출
      if (data.sessionId && !metadata.sessionId) {
        metadata.sessionId = data.sessionId;
      }
      if (data.gitBranch) {
        metadata.branch = data.gitBranch;
      }
      if (data.cwd) {
        metadata.cwd = data.cwd;
      }
      if (data.version) {
        metadata.version = data.version;
      }
      if (data.timestamp) {
        const ts = new Date(data.timestamp);
        if (!metadata.startTime || ts < metadata.startTime) {
          metadata.startTime = ts;
        }
        if (!metadata.endTime || ts > metadata.endTime) {
          metadata.endTime = ts;
        }
      }

      // 사용자 메시지 추출
      if (data.type === 'user' && data.message) {
        const content = data.message.content || '';
        if (content.trim()) {
          messages.push({
            role: 'user',
            content: content,
            timestamp: data.timestamp,
            uuid: data.uuid
          });
        }
      }

      // 어시스턴트 메시지 추출
      if (data.type === 'assistant' && data.message) {
        let content = '';
        if (Array.isArray(data.message.content)) {
          content = data.message.content
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('\n');
        } else if (typeof data.message.content === 'string') {
          content = data.message.content;
        }

        if (content.trim()) {
          messages.push({
            role: 'assistant',
            content: content,
            timestamp: data.timestamp,
            uuid: data.uuid,
            model: data.message.model
          });
        }
      }
    } catch (e) {
      // JSON 파싱 에러 무시
    }
  }

  return { messages, metadata };
}

/**
 * 메시지 그룹화 (연속된 메시지를 세션으로)
 */
function groupMessagesBySessions(messages) {
  const sessions = [];
  let currentSession = [];
  let lastTimestamp = null;

  for (const msg of messages) {
    const msgTime = new Date(msg.timestamp);

    // 30분 이상 간격이면 새 세션
    if (lastTimestamp && (msgTime - lastTimestamp) > 30 * 60 * 1000) {
      if (currentSession.length > 0) {
        sessions.push([...currentSession]);
        currentSession = [];
      }
    }

    currentSession.push(msg);
    lastTimestamp = msgTime;
  }

  if (currentSession.length > 0) {
    sessions.push(currentSession);
  }

  return sessions;
}

/**
 * 세션 제목 생성
 */
function generateSessionTitle(messages) {
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (!firstUserMsg) return 'Untitled Session';

  let title = firstUserMsg.content.substring(0, 80);
  title = title.replace(/[\r\n]+/g, ' ').trim();
  title = title.replace(/@[a-zA-Z0-9_-]+/g, '').trim(); // @ mentions 제거

  if (firstUserMsg.content.length > 80) {
    title += '...';
  }

  return title || 'Untitled Session';
}

/**
 * 세션을 Markdown으로 변환
 */
function sessionToMarkdown(messages, sessionIndex) {
  const title = generateSessionTitle(messages);
  const startTime = messages[0]?.timestamp ? new Date(messages[0].timestamp) : null;
  const endTime = messages[messages.length - 1]?.timestamp ? new Date(messages[messages.length - 1].timestamp) : null;

  let md = `\n## 세션 ${sessionIndex}: ${title}\n\n`;

  if (startTime) {
    md += `**시작**: ${startTime.toLocaleString('ko-KR')}\n`;
  }
  if (endTime) {
    md += `**종료**: ${endTime.toLocaleString('ko-KR')}\n`;
  }
  md += `**메시지 수**: ${messages.length}\n\n`;
  md += `---\n\n`;

  for (const msg of messages) {
    const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('ko-KR') : '';
    const content = sanitizeSensitiveData(msg.content);

    if (msg.role === 'user') {
      md += `### 👤 사용자 ${time ? `(${time})` : ''}\n\n`;
      md += `${content}\n\n`;
    } else {
      // 어시스턴트 응답은 길 수 있으므로 요약
      const truncated = content.length > 2000
        ? content.substring(0, 2000) + '\n\n... (응답 생략) ...'
        : content;
      md += `### 🤖 Claude ${time ? `(${time})` : ''}\n\n`;
      md += `${truncated}\n\n`;
    }
  }

  return md;
}

/**
 * 메인 실행
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Claude Code Conversation Extractor');
  console.log('='.repeat(60));

  let allMessages = [];
  let allMetadata = {
    summaries: [],
    sessions: []
  };

  // 모든 프로젝트 디렉토리에서 파일 수집
  for (const projectDir of PROJECT_DIRS) {
    if (!fs.existsSync(projectDir)) {
      console.log(`⏭️  Skipping (not found): ${projectDir}`);
      continue;
    }

    const files = fs.readdirSync(projectDir)
      .filter(f => f.endsWith('.jsonl') && !f.startsWith('agent-'));

    console.log(`\n📁 Found ${files.length} session files in ${path.basename(projectDir)}`);

    for (const file of files) {
      const filePath = path.join(projectDir, file);
      const stats = fs.statSync(filePath);

      if (stats.size === 0) continue;

      console.log(`  Processing: ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

      try {
        const { messages, metadata } = await parseJsonlFile(filePath);

        if (messages.length > 0) {
          allMessages.push(...messages);
          allMetadata.summaries.push(...metadata.summaries);
          allMetadata.sessions.push({
            sessionId: metadata.sessionId,
            file: file,
            messageCount: messages.length,
            startTime: metadata.startTime,
            endTime: metadata.endTime
          });

          console.log(`    ✅ ${messages.length} messages extracted`);
        }
      } catch (error) {
        console.error(`    ❌ Error: ${error.message}`);
      }
    }
  }

  if (allMessages.length === 0) {
    console.log('\n❌ No messages found');
    return;
  }

  // 시간순 정렬
  allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // 세션으로 그룹화
  const sessions = groupMessagesBySessions(allMessages);

  console.log(`\n📊 Total: ${allMessages.length} messages in ${sessions.length} sessions`);

  // Markdown 생성
  let markdown = `# Claude Code 대화 기록 - AI Advanced LMS\n\n`;
  markdown += `> 이 문서는 Claude Code를 통한 AI Advanced LMS 프로젝트 개발 과정의 전체 대화 기록입니다.\n\n`;
  markdown += `**추출일시**: ${new Date().toLocaleString('ko-KR')}\n`;
  markdown += `**총 메시지**: ${allMessages.length}개\n`;
  markdown += `**총 세션**: ${sessions.length}개\n\n`;

  // 요약 섹션
  if (allMetadata.summaries.length > 0) {
    markdown += `## 세션 요약\n\n`;
    const uniqueSummaries = [...new Set(allMetadata.summaries)];
    for (const summary of uniqueSummaries) {
      markdown += `- ${summary}\n`;
    }
    markdown += `\n`;
  }

  markdown += `---\n\n`;
  markdown += `## 목차\n\n`;

  sessions.forEach((session, index) => {
    const title = generateSessionTitle(session);
    const startTime = session[0]?.timestamp ? new Date(session[0].timestamp).toLocaleDateString('ko-KR') : '';
    markdown += `${index + 1}. [${title}](#세션-${index + 1}-${title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').substring(0, 30)}) (${startTime})\n`;
  });

  markdown += `\n---\n`;

  // 각 세션 내용
  sessions.forEach((session, index) => {
    markdown += sessionToMarkdown(session, index + 1);
    markdown += `\n---\n`;
  });

  markdown += `\n*이 문서는 Claude Code 대화 로그에서 자동 추출되었습니다.*\n`;

  // 파일 저장
  fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');
  console.log(`\n✅ Saved to: ${OUTPUT_FILE}`);
  console.log(`   File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB`);
}

main().catch(console.error);
