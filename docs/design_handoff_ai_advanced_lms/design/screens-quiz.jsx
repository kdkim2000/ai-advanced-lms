/* global React, MODULES, Icon, Btn, Badge, Progress */

const { useState, useEffect, useMemo, useRef } = React;

/* ─── Sample question bank (mock) ─────────────────────────── */
const QUESTION_BANK = {
  python: [
    {
      q: "List Comprehension의 주된 목적은 무엇입니까?",
      choices: [
        "코드 실행 속도를 느리게 함",
        "코드를 간결하게 만듦",
        "메모리 사용량을 늘림",
        "오류를 발생시킴",
        "코드를 복잡하게 만듦",
      ],
      correct: 1,
      explain: "List Comprehension은 반복문과 조건문을 한 줄로 표현해 코드를 간결하게 만들기 위한 문법입니다.",
    },
    {
      q: "Python에서 변수에 정수 값을 할당할 때 사용하는 키워드는?",
      choices: ["int", "var", "let", "(키워드 불필요)", "define"],
      correct: 3,
      explain: "Python은 동적 타이핑 언어로, 변수 선언 시 별도의 키워드가 필요하지 않습니다.",
    },
    {
      q: "다음 중 Python의 불변(immutable) 자료형이 아닌 것은?",
      choices: ["tuple", "str", "int", "list", "frozenset"],
      correct: 3,
      explain: "list는 가변(mutable) 자료형으로 요소를 추가, 삭제, 변경할 수 있습니다.",
    },
  ],
  data: [
    {
      q: "Pandas의 DataFrame은 어떤 형태의 데이터 구조입니까?",
      choices: ["1차원 배열", "2차원 테이블", "3차원 텐서", "그래프", "트리"],
      correct: 1,
      explain: "DataFrame은 행과 열로 구성된 2차원 테이블 형태의 데이터 구조입니다.",
    },
    {
      q: "NumPy의 주된 강점은?",
      choices: ["문자열 처리", "고속 수치 연산", "웹 개발", "데이터베이스 연결", "그래프 시각화"],
      correct: 1,
      explain: "NumPy는 C로 구현되어 있어 대규모 수치 연산을 매우 빠르게 수행합니다.",
    },
  ],
  llm: [
    {
      q: "Transformer 아키텍처의 핵심 메커니즘은?",
      choices: ["Convolution", "Self-Attention", "Recurrence", "Pooling", "Batch Normalization"],
      correct: 1,
      explain: "Self-Attention 메커니즘이 Transformer 아키텍처의 핵심으로, 입력 시퀀스의 모든 위치 간 관계를 학습합니다.",
    },
  ],
  prompt: [
    {
      q: "Few-shot 프롬프트에서 'shot'은 무엇을 의미합니까?",
      choices: ["모델 호출 횟수", "예시(example)", "토큰 길이", "응답 시간", "오류 횟수"],
      correct: 1,
      explain: "Few-shot은 프롬프트에 몇 개의 예시(shot)를 제공해 원하는 출력 형태를 유도하는 기법입니다.",
    },
  ],
  rag: [
    {
      q: "RAG에서 'R'은 무엇을 의미합니까?",
      choices: ["Random", "Retrieval", "Recurrent", "Reasoning", "Reinforcement"],
      correct: 1,
      explain: "RAG는 Retrieval-Augmented Generation의 약자로, 외부 지식을 검색해 생성에 활용하는 방식입니다.",
    },
  ],
  fine: [
    {
      q: "LoRA(Low-Rank Adaptation)의 주된 목적은?",
      choices: [
        "모델 크기를 키움",
        "전체 파라미터를 학습",
        "적은 파라미터로 효율적인 파인튜닝",
        "추론 속도를 늦춤",
        "데이터셋 크기를 증가",
      ],
      correct: 2,
      explain: "LoRA는 저랭크 행렬 분해를 통해 일부 파라미터만 학습하여 효율적으로 파인튜닝하는 기법입니다.",
    },
  ],
};

function buildPracticeSet() {
  // 20 questions, deterministic mix matching the screenshot label counts
  const order = [
    "fine", "fine", "fine", "fine", "fine",
    "prompt", "prompt", "prompt", "prompt", "prompt", "prompt", "prompt", "prompt", "prompt",
    "llm", "llm", "llm", "llm",
    "rag",
    "python",
  ];
  const out = [];
  const counts = {};
  for (const m of order) {
    counts[m] = (counts[m] || 0) + 1;
    const bank = QUESTION_BANK[m] || QUESTION_BANK.python;
    const q = bank[(counts[m] - 1) % bank.length];
    out.push({ ...q, module: m });
  }
  return out;
}

/* ─── Quiz hub ─────────────────────────────────────────────── */
function QuizHubScreen({ state, navigate }) {
  return (
    <div className="page">
      <header style={{ marginBottom: 32 }}>
        <h1 className="page-title">퀴즈</h1>
        <p className="page-sub">각 모듈별 학습 내용을 퀴즈로 확인해보세요.</p>
      </header>

      {/* Gamified top strip */}
      <section className="row" style={{ gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <span className="streak-pill"><Icon name="flame" size={14}/> {state.quizStreak}일 연속</span>
        <span className="points-pill"><Icon name="zap" size={14}/> {state.quizPoints} 포인트</span>
        <span className="badge neutral"><Icon name="trophy" size={12}/> 이번 주 {state.quizDayCount}문제 풀이</span>
      </section>

      {/* Hero cards: 실전 문제풀이 + 오답노트 */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }} className="hero-quiz">
        <article className="card lg quiz-tile" style={{
          background: "linear-gradient(135deg, var(--purple-50), var(--bg-base) 70%)",
        }}>
          <span className="ico" style={{ background: "linear-gradient(135deg, var(--purple-500), var(--purple-700))", color: "#fff" }}>
            <Icon name="dices" size={28} color="#fff"/>
          </span>
          <h3 className="title">실전 문제풀이 <Icon name="shuffle" size={18} color="var(--purple-600)"/></h3>
          <p className="desc">모든 챕터에서 랜덤으로 20문제를 출제합니다.</p>
          <div className="row">
            <span className="meta">20문제 · 약 15분</span>
            <span style={{ flex: 1 }}/>
            <Btn variant="primary" size="md" trailingIcon="arrow-right"
                 onClick={() => navigate({ name: "quiz-intro" })}>실전 도전</Btn>
          </div>
        </article>

        <article className="card lg quiz-tile">
          <span className="ico" style={{ background: "var(--bg-warning-tint)", color: "var(--yellow-700)" }}>
            <Icon name="notebook-pen" size={28}/>
          </span>
          <h3 className="title">오답노트 <Icon name="book-open" size={18} color="var(--gray-500)"/></h3>
          <p className="desc">틀린 문제를 다시 풀어보며 실력을 향상시키세요.</p>
          <div className="row">
            <span className="meta">{state.wrongNotes.length === 0 ? "아직 틀린 문제 없음" : `${state.wrongNotes.length}문제`}</span>
            <span style={{ flex: 1 }}/>
            <Btn variant="outline" size="md" trailingIcon="arrow-right"
                 onClick={() => navigate({ name: "quiz-wrong" })}>오답노트</Btn>
          </div>
        </article>
      </section>

      {/* Per-module quizzes */}
      <section>
        <h2 style={{ font: "600 14px/20px var(--font-sans)", color: "var(--gray-500)", margin: "0 0 16px" }}>모듈별 퀴즈</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="modules-grid">
          {MODULES.map(mod => (
            <article key={mod.id} className="card module-quiz-card"
                     onClick={() => navigate({ name: "quiz-intro", moduleId: mod.id })}>
              <div className="head">
                <span className={`ico ${mod.hue}`}>{mod.glyph}</span>
                <div style={{ flex: 1 }}>
                  <h3 className="name">{mod.quizName}</h3>
                  <p className="sub">{mod.quizDesc}</p>
                </div>
              </div>
              <div className="row between" style={{ marginTop: 4 }}>
                <span className="qcount">
                  <Icon name="circle-help" size={14} color="var(--gray-500)"/>
                  {mod.quizCount}문제
                </span>
                <Icon name="arrow-right" size={16} color="var(--gray-400)"/>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Quiz intro / resume modal ────────────────────────────── */
function QuizIntroScreen({ state, update, navigate, moduleId }) {
  const lq = state.lastQuiz;
  const inProgress = !moduleId && lq && lq.active && lq.answered > 0;

  if (inProgress) {
    return (
      <div className="page">
        <div style={{ maxWidth: 480, margin: "120px auto 0", textAlign: "center" }}>
          <div className="empty" style={{ padding: 0 }}>
            <span className="ill" style={{ background: "var(--bg-primary-tint)" }}>
              <Icon name="play-circle" size={56} color="var(--purple-600)"/>
            </span>
            <h3>진행 중인 퀴즈가 있습니다</h3>
            <p>이전에 풀던 실전 문제풀이를 이어서 풀거나 새로운 문제로 시작할 수 있습니다.</p>
          </div>

          <div className="card lg" style={{ padding: 24, marginTop: 8, marginBottom: 24, textAlign: "center" }}>
            <div style={{ font: "700 36px/40px var(--font-sans)", color: "var(--purple-600)", letterSpacing: "-.02em" }}>
              {lq.answered} / {lq.total}
            </div>
            <div style={{ font: "500 13px/20px var(--font-sans)", color: "var(--gray-500)", marginTop: 4 }}>문제 답변 완료</div>
            <div style={{ marginTop: 16 }}><Progress value={lq.answered} total={lq.total} variant="grad" size="thin"/></div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn variant="primary" size="lg" leadingIcon="play-circle"
                 onClick={() => navigate({ name: "quiz-run" })}>이어서 풀기</Btn>
            <Btn variant="outline" size="lg" leadingIcon="rotate-ccw"
                 onClick={() => {
                   update(s => ({ ...s, lastQuiz: { ...s.lastQuiz, active: true, answered: 0, currentIndex: 0, answers: {} }}));
                   navigate({ name: "quiz-run" });
                 }}>새 문제로 시작</Btn>
          </div>
        </div>
      </div>
    );
  }

  // No in-progress quiz — go straight in
  React.useEffect(() => {
    update(s => ({ ...s, lastQuiz: { active: true, answered: 0, total: 20, currentIndex: 0, answers: {} }}));
    navigate({ name: "quiz-run" });
  }, []);
  return null;
}

/* ─── Quiz run (question screen) ───────────────────────────── */
function QuizRunScreen({ state, update, navigate }) {
  const questions = useMemo(buildPracticeSet, []);
  const lq = state.lastQuiz;
  const [idx, setIdx] = useState(lq.currentIndex || 0);
  const [selected, setSelected] = useState(lq.answers[idx] ?? null);
  const [revealed, setRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pointsFly, setPointsFly] = useState(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    setSelected(lq.answers[idx] ?? null);
    setRevealed(lq.answers[idx] !== undefined);
  }, [idx]);

  const q = questions[idx];
  const modMeta = MODULES.find(m => m.id === q.module);
  const isCorrect = selected === q.correct;
  const answeredCount = Object.keys(lq.answers).length;

  function pick(choiceIdx) {
    if (revealed) return;
    setSelected(choiceIdx);
  }
  function submit() {
    if (selected == null || revealed) return;
    setRevealed(true);
    const correct = selected === q.correct;
    const earned = correct ? (10 + Math.min(state.quizStreak, 5) * 2) : 0;

    if (correct) {
      setShowConfetti(true);
      setPointsFly(earned);
      setTimeout(() => setShowConfetti(false), 1400);
      setTimeout(() => setPointsFly(null), 1200);
    }

    update(s => ({
      ...s,
      quizPoints: s.quizPoints + earned,
      quizStreak: correct ? s.quizStreak + 1 : 0,
      lastQuiz: {
        ...s.lastQuiz,
        answered: Math.min(s.lastQuiz.total, answeredCount + (lq.answers[idx] === undefined ? 1 : 0)),
        answers: { ...s.lastQuiz.answers, [idx]: selected },
      },
      wrongNotes: correct
        ? s.wrongNotes
        : [...s.wrongNotes.filter(w => w.qIdx !== idx),
           { qIdx: idx, question: q.q, chose: selected, correct: q.correct, choices: q.choices, explain: q.explain, module: q.module }],
    }));
  }
  function next() {
    if (idx < questions.length - 1) {
      update(s => ({ ...s, lastQuiz: { ...s.lastQuiz, currentIndex: idx + 1 }}));
      setIdx(idx + 1);
    } else {
      // Finished
      navigate({ name: "quiz-result" });
    }
  }
  function prev() {
    if (idx > 0) {
      update(s => ({ ...s, lastQuiz: { ...s.lastQuiz, currentIndex: idx - 1 }}));
      setIdx(idx - 1);
    }
  }
  function jump(i) {
    update(s => ({ ...s, lastQuiz: { ...s.lastQuiz, currentIndex: i }}));
    setIdx(i);
  }

  // group counts for label header
  const groupCounts = useMemo(() => {
    const c = {};
    questions.forEach(qq => c[qq.module] = (c[qq.module] || 0) + 1);
    return c;
  }, [questions]);

  return (
    <div className="page" style={{ maxWidth: 920 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 className="row" style={{ font: "700 28px/36px var(--font-sans)", color: "var(--gray-900)", letterSpacing: "-.02em", gap: 10, margin: 0 }}>
          <Icon name="shuffle" size={24} color="var(--purple-600)"/>
          실전 문제풀이
        </h1>
        <p className="page-sub">모든 모듈에서 랜덤으로 선택된 20문제입니다.</p>
      </header>

      {/* Module pills with counts */}
      <div className="row" style={{ gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {MODULES.filter(m => groupCounts[m.id]).map(m => (
          <span key={m.id} className="badge neutral" style={{ padding: "4px 10px" }}>
            <span style={{ fontSize: 14 }}>{m.glyph}</span> {m.quizName}: {groupCounts[m.id]}문제
          </span>
        ))}
      </div>

      {/* Progress + stats */}
      <div className="row between" style={{ marginBottom: 8 }}>
        <span style={{ font: "500 13px/20px var(--font-sans)", color: "var(--gray-500)" }}>진행률: <b style={{ color: "var(--gray-900)" }}>{idx + 1} / {questions.length}</b></span>
        <div className="row" style={{ gap: 8 }}>
          {state.quizStreak >= 2 && <span className="streak-pill"><Icon name="flame" size={14}/> {state.quizStreak} 연속</span>}
          <span className="points-pill"><Icon name="zap" size={14}/> {state.quizPoints}</span>
          <span style={{ font: "500 13px/20px var(--font-sans)", color: "var(--gray-500)" }}>답변: {answeredCount} / {questions.length}</span>
        </div>
      </div>
      <div className="qprogress-bar"><div className="qprogress-fill" style={{ width: `${((idx + 1) / questions.length) * 100}%` }}/></div>

      {/* Question pills */}
      <div className="qpills">
        {questions.map((_, i) => {
          const ans = lq.answers[i];
          const isCorr = ans !== undefined && ans === questions[i].correct;
          const isWrong = ans !== undefined && ans !== questions[i].correct;
          return (
            <button key={i} className={`qpill ${i === idx ? "curr" : ""} ${isCorr ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                    onClick={() => jump(i)}>{i + 1}</button>
          );
        })}
      </div>

      {/* Question card */}
      <article className="card lg" style={{ padding: 32 }} ref={cardsRef}>
        <div className="row" style={{ gap: 8, marginBottom: 16 }}>
          {modMeta && (
            <span className="badge neutral" style={{ padding: "4px 10px" }}>
              <span style={{ fontSize: 14 }}>{modMeta.glyph}</span> {modMeta.quizName}
            </span>
          )}
          <span style={{ flex: 1 }}/>
          <span className="badge primary">문제 {idx + 1} / {questions.length}</span>
        </div>

        <h2 style={{ font: "600 22px/32px var(--font-sans)", color: "var(--gray-900)", letterSpacing: "-.01em", margin: "0 0 24px" }}>
          {q.q}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
          {q.choices.map((c, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSel = selected === i;
            const showCorrect = revealed && i === q.correct;
            const showWrong = revealed && isSel && i !== q.correct;
            return (
              <button key={i} className={`qchoice ${isSel && !revealed ? "sel" : ""} ${showCorrect ? "correct anim" : ""} ${showWrong ? "wrong" : ""}`}
                      onClick={() => pick(i)}>
                <span className="letter">{letter}</span>
                <span style={{ flex: 1 }}>{c}</span>
                {showCorrect && <Icon name="check" size={20} color="var(--green-600)"/>}
                {showWrong && <Icon name="x" size={20} color="var(--red-600)"/>}
              </button>
            );
          })}
          {pointsFly !== null && (
            <span className="points-fly" style={{ top: 0, right: 20 }}>+{pointsFly}</span>
          )}
        </div>

        {revealed && (
          <div className={`callout ${isCorrect ? "success" : "warn"}`} style={{ marginTop: 24, marginBottom: 0 }}>
            <Icon name={isCorrect ? "check-circle" : "info"} size={20} className="ico"/>
            <div className="body">
              <div className="title">{isCorrect ? "정답입니다!" : "다시 확인해보세요"}</div>
              <div className="desc">{q.explain}</div>
            </div>
          </div>
        )}
      </article>

      {/* Footer nav */}
      <div className="row between" style={{ marginTop: 24, gap: 12 }}>
        <Btn variant="outline" size="lg" leadingIcon="chevron-left" onClick={prev} disabled={idx === 0}>이전</Btn>
        {!revealed ? (
          <Btn variant="primary" size="lg" trailingIcon="check" onClick={submit} disabled={selected == null}>제출</Btn>
        ) : (
          <Btn variant="primary" size="lg" trailingIcon="chevron-right" onClick={next}>
            {idx === questions.length - 1 ? "결과 보기" : "다음"}
          </Btn>
        )}
      </div>

      {showConfetti && <Confetti/>}
    </div>
  );
}

function Confetti() {
  const colors = ["#7F56D9", "#6941C6", "#FAC515", "#12B76A", "#2E90FA", "#F04438"];
  const pieces = Array.from({ length: 30 }).map((_, i) => ({
    left: Math.random() * 100,
    dx: (Math.random() - 0.5) * 200,
    delay: Math.random() * 200,
    color: colors[i % colors.length],
  }));
  return (
    <div className="confetti">
      {pieces.map((p, i) => (
        <i key={i} style={{
          left: `${p.left}%`,
          background: p.color,
          animationDelay: `${p.delay}ms`,
          ['--dx']: `${p.dx}px`,
        }}/>
      ))}
    </div>
  );
}

/* ─── Quiz results / wrong notebook ────────────────────────── */
function QuizResultScreen({ state, update, navigate }) {
  const lq = state.lastQuiz;
  const questions = useMemo(buildPracticeSet, []);
  const correctCount = Object.entries(lq.answers).filter(([i, c]) => c === questions[+i]?.correct).length;
  const total = questions.length;
  const pct = Math.round((correctCount / total) * 100);

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <header style={{ textAlign: "center", marginBottom: 32 }}>
        <span className="ill" style={{
          width: 96, height: 96, borderRadius: "50%",
          background: pct >= 70 ? "var(--bg-success-tint)" : "var(--bg-warning-tint)",
          color: pct >= 70 ? "var(--green-600)" : "var(--yellow-700)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <Icon name={pct >= 70 ? "trophy" : "flag"} size={44}/>
        </span>
        <h1 className="page-title">{pct >= 70 ? "잘 하셨어요!" : "조금만 더!"}</h1>
        <p className="page-sub">{total}문제 중 {correctCount}문제 정답</p>
      </header>

      <div className="card lg" style={{ padding: 24, marginBottom: 24 }}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <span style={{ font: "500 14px/20px var(--font-sans)", color: "var(--gray-600)" }}>정답률</span>
          <span style={{ font: "700 36px/40px var(--font-sans)", color: "var(--purple-600)", letterSpacing: "-.02em" }}>{pct}%</span>
        </div>
        <Progress value={correctCount} total={total} variant="grad" size="thick"/>
        <div className="row" style={{ gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          <span className="points-pill"><Icon name="zap" size={14}/> +{correctCount * 10} 포인트</span>
          <span className="streak-pill"><Icon name="flame" size={14}/> {state.quizStreak} 연속</span>
          <span className="badge success"><Icon name="check" size={12}/> {correctCount} 정답</span>
          <span className="badge error"><Icon name="x" size={12}/> {total - correctCount} 오답</span>
        </div>
      </div>

      <div className="row" style={{ gap: 10, marginBottom: 32 }}>
        <Btn variant="primary" size="lg" leadingIcon="rotate-ccw"
             onClick={() => {
               update(s => ({ ...s, lastQuiz: { active: true, answered: 0, total: 20, currentIndex: 0, answers: {} }}));
               navigate({ name: "quiz-run" });
             }}>다시 풀기</Btn>
        <Btn variant="outline" size="lg" leadingIcon="notebook-pen"
             onClick={() => navigate({ name: "quiz-wrong" })}>오답노트 보기</Btn>
        <Btn variant="ghost" size="lg" leadingIcon="house"
             onClick={() => navigate({ name: "quiz-hub" })}>퀴즈 홈으로</Btn>
      </div>

      <h2 style={{ font: "700 18px/26px var(--font-sans)", color: "var(--gray-900)", marginBottom: 16 }}>문제 다시보기</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {questions.map((q, i) => {
          const ans = lq.answers[i];
          const correct = ans === q.correct;
          const modMeta = MODULES.find(m => m.id === q.module);
          return (
            <div key={i} className="card" style={{ padding: 16 }}>
              <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                <span style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: correct ? "var(--bg-success-tint)" : "var(--bg-error-tint)",
                  color: correct ? "var(--green-700)" : "var(--red-700)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  font: "700 12px/16px var(--font-mono)", flex: "0 0 28px",
                }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 6, marginBottom: 4 }}>
                    {modMeta && <span style={{ font: "500 11px/16px var(--font-sans)", color: "var(--gray-500)" }}>{modMeta.glyph} {modMeta.quizName}</span>}
                  </div>
                  <div style={{ font: "500 14px/20px var(--font-sans)", color: "var(--gray-900)" }}>{q.q}</div>
                  <div style={{ font: "400 12px/18px var(--font-sans)", color: correct ? "var(--green-700)" : "var(--red-700)", marginTop: 4 }}>
                    {ans !== undefined ? (
                      <>내 답: {String.fromCharCode(65 + ans)} {!correct && <> · 정답: {String.fromCharCode(65 + q.correct)}</>}</>
                    ) : "미답변"}
                  </div>
                </div>
                <Icon name={correct ? "check-circle" : "x-circle"} size={20} color={correct ? "var(--green-600)" : "var(--red-600)"}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuizWrongScreen({ state, navigate }) {
  if (state.wrongNotes.length === 0) {
    return (
      <div className="page">
        <header style={{ marginBottom: 32 }}>
          <h1 className="page-title">오답노트</h1>
          <p className="page-sub">틀린 문제를 다시 풀어보며 실력을 향상시키세요.</p>
        </header>
        <div className="empty">
          <span className="ill"><Icon name="party-popper" size={56}/></span>
          <h3>아직 틀린 문제가 없어요</h3>
          <p>실전 문제풀이를 시도하면 틀린 문제가 자동으로 이곳에 기록됩니다.</p>
          <Btn variant="primary" size="lg" leadingIcon="dices" style={{ marginTop: 16 }}
               onClick={() => navigate({ name: "quiz-intro" })}>실전 문제풀이 시작</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header style={{ marginBottom: 32 }}>
        <h1 className="page-title">오답노트</h1>
        <p className="page-sub">총 {state.wrongNotes.length}개 문제 · 다시 풀어보며 실력을 향상시키세요.</p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {state.wrongNotes.map((w, i) => {
          const modMeta = MODULES.find(m => m.id === w.module);
          return (
            <article key={i} className="card" style={{ padding: 20 }}>
              <div className="row" style={{ gap: 8, marginBottom: 10 }}>
                {modMeta && <span className="badge neutral"><span style={{ fontSize: 14 }}>{modMeta.glyph}</span> {modMeta.quizName}</span>}
                <span style={{ flex: 1 }}/>
                <span className="badge error"><Icon name="x" size={12}/> 오답</span>
              </div>
              <h3 style={{ font: "600 16px/24px var(--font-sans)", color: "var(--gray-900)", margin: "0 0 12px" }}>{w.question}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {w.choices.map((c, ci) => {
                  const isCorr = ci === w.correct;
                  const isChose = ci === w.chose;
                  return (
                    <div key={ci} style={{
                      padding: "10px 14px", borderRadius: "var(--radius-lg)",
                      border: `1px solid ${isCorr ? "var(--green-500)" : isChose ? "var(--red-500)" : "var(--border-subtle)"}`,
                      background: isCorr ? "var(--bg-success-tint)" : isChose ? "var(--bg-error-tint)" : "transparent",
                      font: "400 13px/20px var(--font-sans)", color: "var(--gray-900)",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: isCorr ? "var(--green-500)" : isChose ? "var(--red-500)" : "var(--bg-muted)",
                        color: (isCorr || isChose) ? "#fff" : "var(--gray-600)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        font: "700 11px/14px var(--font-sans)", flex: "0 0 22px",
                      }}>{String.fromCharCode(65 + ci)}</span>
                      <span style={{ flex: 1 }}>{c}</span>
                      {isCorr && <Icon name="check" size={16} color="var(--green-600)"/>}
                      {isChose && !isCorr && <Icon name="x" size={16} color="var(--red-600)"/>}
                    </div>
                  );
                })}
              </div>
              {w.explain && (
                <div className="callout" style={{ marginTop: 14, marginBottom: 0 }}>
                  <Icon name="info" size={20} className="ico"/>
                  <div className="body">
                    <div className="title">해설</div>
                    <div className="desc">{w.explain}</div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { QuizHubScreen, QuizIntroScreen, QuizRunScreen, QuizResultScreen, QuizWrongScreen });
