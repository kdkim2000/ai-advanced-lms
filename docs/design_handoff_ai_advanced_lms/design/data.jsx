/* global React */
/* ──────────────────────────────────────────────────────────
   AI Advanced LMS — shared data + atomic components
   ────────────────────────────────────────────────────────── */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ─── Module catalog ───────────────────────────────────────── */
const MODULES = [
  {
    id: "python", name: "Python 기본", quizName: "Python 기초",
    desc: "Python 프로그래밍 기초: 변수, 자료형, 함수, 클래스 등 핵심 개념 학습",
    quizDesc: "Python 프로그래밍 기초 지식",
    glyph: "🐍", hue: "hue-python",
    chapters: [
      { id: "py-1", title: "변수와 자료형" },
      { id: "py-2", title: "조건문과 반복문" },
      { id: "py-3", title: "함수와 모듈" },
      { id: "py-4", title: "클래스와 객체" },
      { id: "py-5", title: "예외 처리와 파일 I/O" },
    ],
    chapterCount: 5, quizCount: 67,
  },
  {
    id: "data", name: "데이터 분석", quizName: "데이터 분석",
    desc: "NumPy, Pandas를 활용한 데이터 처리 및 텍스트 분석",
    quizDesc: "Pandas, NumPy 등 데이터 분석 라이브러리",
    glyph: "📊", hue: "hue-data",
    chapters: [
      { id: "data-1", title: "Numpy와 행렬" },
      { id: "data-2", title: "Pandas 데이터 처리하기" },
      { id: "data-3", title: "텍스트 전처리 핵심 기법" },
      { id: "data-4", title: "텍스트 데이터 변환과 통계 분석" },
    ],
    chapterCount: 4, quizCount: 30,
  },
  {
    id: "llm", name: "대규모 언어모델", quizName: "LLM 기초",
    desc: "LLM의 기초부터 API 활용, LangChain까지 핵심 개념 학습",
    quizDesc: "Large Language Model의 기본 개념",
    glyph: "🤖", hue: "hue-llm",
    chapters: [
      { id: "llm-1", title: "LLM이란 무엇인가" },
      { id: "llm-2", title: "Transformer 아키텍처" },
      { id: "llm-3", title: "OpenAI API 활용" },
      { id: "llm-4", title: "LangChain 시작하기" },
      { id: "llm-5", title: "메모리와 에이전트" },
      { id: "llm-6", title: "프롬프트 체인 구성" },
      { id: "llm-7", title: "LLM 평가와 모니터링" },
    ],
    chapterCount: 7, quizCount: 324,
  },
  {
    id: "prompt", name: "프롬프트 엔지니어링", quizName: "프롬프트 엔지니어링",
    desc: "LangChain을 활용한 고급 프롬프트 기법과 AI 에이전트 개발",
    quizDesc: "효과적인 프롬프트 작성 기법",
    glyph: "⚡", hue: "hue-prompt",
    chapters: [
      { id: "pr-1", title: "프롬프트 기본 원리" },
      { id: "pr-2", title: "Few-shot 학습" },
      { id: "pr-3", title: "Chain-of-Thought" },
      { id: "pr-4", title: "역할 기반 프롬프트" },
      { id: "pr-5", title: "고급 프롬프트 패턴" },
      { id: "pr-6", title: "AI 에이전트 설계" },
    ],
    chapterCount: 6, quizCount: 310,
  },
  {
    id: "rag", name: "검색 증강 생성", quizName: "RAG",
    desc: "Retrieval-Augmented Generation: 검색 기반 AI 시스템 구축",
    quizDesc: "Retrieval-Augmented Generation",
    glyph: "🔍", hue: "hue-rag",
    chapters: [
      { id: "rag-1", title: "RAG 개념과 아키텍처" },
      { id: "rag-2", title: "임베딩 모델 이해" },
      { id: "rag-3", title: "벡터 데이터베이스" },
      { id: "rag-4", title: "문서 청킹 전략" },
      { id: "rag-5", title: "리트리버 최적화" },
      { id: "rag-6", title: "RAG 평가 방법" },
      { id: "rag-7", title: "프로덕션 RAG 시스템" },
    ],
    chapterCount: 7, quizCount: 75,
  },
  {
    id: "fine", name: "파인튜닝", quizName: "Fine-tuning",
    desc: "LLM 파인튜닝: LoRA, Instruction Tuning, SFT, RL, Reasoning LLM",
    quizDesc: "모델 파인튜닝 기법",
    glyph: "🎯", hue: "hue-fine",
    chapters: [
      { id: "fn-1", title: "파인튜닝 개요" },
      { id: "fn-2", title: "Instruction Tuning" },
      { id: "fn-3", title: "LoRA & QLoRA" },
      { id: "fn-4", title: "SFT 전략" },
      { id: "fn-5", title: "RLHF 기초" },
      { id: "fn-6", title: "DPO와 RL 기법" },
      { id: "fn-7", title: "Reasoning LLM" },
    ],
    chapterCount: 7, quizCount: 245,
  },
];

/* ─── Storage ──────────────────────────────────────────────── */
const STORAGE_KEY = "ai-advanced-lms.v1";

const DEFAULT_STATE = {
  // chapterId → true if completed
  completed: {
    "py-1": true, "py-2": true, "py-3": true, "py-4": true, "py-5": true,
    "data-1": true,
    "rag-1": true, "rag-2": true, "rag-3": true, "rag-4": true, "rag-5": true,
  },
  // chapterId most recently viewed (for "이어서 학습")
  lastViewed: "data-2",
  // bookmarks: chapterId[]
  bookmarks: [],
  // quiz state
  quizPoints: 320,
  quizStreak: 4,
  quizDayCount: 12,
  // last quiz session (mock)
  lastQuiz: {
    active: true,
    answered: 0,
    total: 20,
    currentIndex: 18, // matches screenshot "문제 19/20"
    answers: {}, // qIdx → choiceIdx
  },
  // wrong answers
  wrongNotes: [],
  // recent activity (mock)
  recent: [
    { id: "r1", glyph: "📊", module: "데이터 분석", chapter: "Pandas 데이터 처리하기", when: "방금 전" },
    { id: "r2", glyph: "🐍", module: "Python 기본", chapter: "예외 처리와 파일 I/O", when: "어제" },
    { id: "r3", glyph: "🔍", module: "검색 증강 생성", chapter: "리트리버 최적화", when: "2일 전" },
    { id: "r4", glyph: "🐍", module: "Python 기본", chapter: "클래스와 객체", when: "3일 전" },
  ],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch { return { ...DEFAULT_STATE }; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function useAppState() {
  const [state, setState] = useState(loadState);
  useEffect(() => { saveState(state); }, [state]);
  const update = useCallback((patch) => {
    setState(s => typeof patch === "function" ? patch(s) : { ...s, ...patch });
  }, []);
  return [state, update];
}

/* ─── Derived helpers ──────────────────────────────────────── */
function moduleProgress(mod, completed) {
  const done = mod.chapters.filter(c => completed[c.id]).length;
  return { done, total: mod.chapters.length, pct: Math.round(done / mod.chapters.length * 100) };
}
function overallProgress(completed) {
  let done = 0, total = 0;
  for (const m of MODULES) {
    total += m.chapters.length;
    done  += m.chapters.filter(c => completed[c.id]).length;
  }
  return { done, total, pct: Math.round(done / total * 100) };
}
function findChapter(chapterId) {
  for (const m of MODULES) {
    const idx = m.chapters.findIndex(c => c.id === chapterId);
    if (idx >= 0) return { module: m, chapter: m.chapters[idx], idx };
  }
  return null;
}

/* ─── Icon (Lucide via dangerouslySetInnerHTML) ───────────────
   We must NOT call lucide.createIcons() — it replaces our <i>
   element with an <svg>, which corrupts React's tree on re-render.
   Instead, build the SVG content from lucide.icons[Pascal] data
   ([tag, attrs, children]) and inject as innerHTML.
   ────────────────────────────────────────────────────────────── */
const _iconCache = new Map();
function buildIconHTML(name) {
  if (_iconCache.has(name)) return _iconCache.get(name);
  if (!window.lucide || !window.lucide.icons) return "";
  const pascal = name.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join("");
  const node = window.lucide.icons[pascal] || window.lucide.icons[name];
  if (!node) { _iconCache.set(name, ""); return ""; }
  // node is [tag, attrs, children]; children = [[tag, attrs], ...]
  const children = node[2] || [];
  const html = children.map(([tag, attrs]) => {
    const a = Object.entries(attrs || {}).map(([k, v]) => `${k}="${v}"`).join(" ");
    return `<${tag} ${a}/>`;
  }).join("");
  _iconCache.set(name, html);
  return html;
}
function Icon({ name, size = 18, color, className, style }) {
  const html = buildIconHTML(name);
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", flexShrink: 0, color, ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ─── Atoms ────────────────────────────────────────────────── */
function Btn({ variant = "primary", size = "md", children, leadingIcon, trailingIcon, onClick, type = "button", disabled, style }) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`btn ${variant} ${size}`} style={style}>
      {leadingIcon && <Icon name={leadingIcon} size={16}/>}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={16}/>}
    </button>
  );
}

function Badge({ tone = "neutral", children, dot }) {
  return (
    <span className={`badge ${tone}`}>
      {dot && <span className="dot"/>}
      {children}
    </span>
  );
}

function Progress({ value = 0, total = 100, variant = "grad", size = "md" }) {
  const pct = Math.max(0, Math.min(100, total ? (value / total) * 100 : 0));
  return (
    <div className={`progress ${variant} ${size === "thin" ? "thin" : size === "thick" ? "thick" : ""}`}>
      <div className="bar" style={{ width: `${pct}%` }}/>
    </div>
  );
}

Object.assign(window, {
  MODULES, STORAGE_KEY, useAppState, moduleProgress, overallProgress, findChapter, loadState,
  Icon, Btn, Badge, Progress,
});
