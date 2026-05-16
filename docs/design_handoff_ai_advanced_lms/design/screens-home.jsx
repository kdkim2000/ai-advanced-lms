/* global React, MODULES, Icon, Btn, Badge, Progress, moduleProgress, overallProgress, findChapter */

/* ─── Home screen ──────────────────────────────────────────── */
function HomeScreen({ state, navigate }) {
  const overall = overallProgress(state.completed);
  const completedChapters = overall.done;
  const totalChapters = overall.total;
  const lastCh = state.lastViewed ? findChapter(state.lastViewed) : null;

  return (
    <div className="page">
      {/* Hero */}
      <section style={{ marginBottom: 40 }}>
        <h1 style={{
          font: "700 48px/56px var(--font-display)",
          letterSpacing: "-.025em",
          margin: 0, color: "var(--gray-900)",
        }}>AI Advanced</h1>
        <p style={{
          font: "400 17px/26px var(--font-sans)",
          color: "var(--gray-500)",
          letterSpacing: "-.005em",
          margin: "8px 0 24px",
        }}>자격 취득을 위한 학습 플랫폼</p>

        <div className="row" style={{ marginBottom: 28, gap: 24, flexWrap: "wrap" }}>
          <span className="row" style={{ gap: 6, color: "var(--gray-600)" }}>
            <Icon name="layers" size={16}/> <span style={{ font: "500 13px/20px var(--font-sans)" }}>{MODULES.length}개 모듈</span>
          </span>
          <span className="row" style={{ gap: 6, color: "var(--gray-600)" }}>
            <Icon name="file-text" size={16}/> <span style={{ font: "500 13px/20px var(--font-sans)" }}>{totalChapters}개 챕터</span>
          </span>
          <span className="row" style={{ gap: 6, color: "var(--green-700)" }}>
            <Icon name="check-circle" size={16}/> <span style={{ font: "500 13px/20px var(--font-sans)" }}>{completedChapters}개 완료</span>
          </span>
        </div>

        <Btn variant="primary" size="lg" trailingIcon="arrow-right"
             onClick={() => lastCh && navigate({ name: "module", moduleId: lastCh.module.id, chapterId: lastCh.chapter.id })}>
          이어서 학습하기
        </Btn>
      </section>

      {/* Overall progress */}
      <section className="card lg" style={{ padding: 24, marginBottom: 40 }}>
        <div className="row between" style={{ marginBottom: 14 }}>
          <span style={{ font: "500 14px/20px var(--font-sans)", color: "var(--gray-600)" }}>전체 진행률</span>
          <span style={{ font: "700 36px/40px var(--font-sans)", letterSpacing: "-.02em" }}>{overall.pct}%</span>
        </div>
        <Progress value={overall.done} total={overall.total} variant="grad" size="thick"/>
        <div style={{ font: "400 13px/20px var(--font-sans)", color: "var(--gray-500)", marginTop: 10 }}>
          {overall.done} / {overall.total} 챕터 완료
        </div>
      </section>

      {/* Modules */}
      <section>
        <h2 style={{ font: "700 20px/28px var(--font-sans)", margin: "0 0 16px", color: "var(--gray-900)" }}>학습 모듈</h2>
        <div className="modules-grid">
          {MODULES.map(mod => {
            const p = moduleProgress(mod, state.completed);
            const isDone = p.pct === 100;
            const isActive = p.pct > 0 && p.pct < 100;
            return (
              <article key={mod.id}
                       className={`card hov mod-tile ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
                       onClick={() => navigate({ name: "module", moduleId: mod.id, chapterId: mod.chapters[0].id })}>
                <div className="row between" style={{ alignItems: "flex-start" }}>
                  <span className={`icon ${mod.hue}`}>{mod.glyph}</span>
                  <span className="pct">{p.pct}%</span>
                </div>
                <h3 className="title">{mod.name}</h3>
                <p className="desc">{mod.desc}</p>
                <div className="meta">
                  <span>{p.done} / {p.total} 챕터</span>
                  {isDone && <Badge tone="success" dot>완료</Badge>}
                  {isActive && <Badge tone="primary" dot>학습 중</Badge>}
                </div>
                <Progress value={p.done} total={p.total} variant={isDone ? "success" : "grad"} size="thin"/>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ─── Dashboard screen ─────────────────────────────────────── */
function DashboardScreen({ state, navigate }) {
  const overall = overallProgress(state.completed);
  const completedModules = MODULES.filter(m => moduleProgress(m, state.completed).pct === 100).length;
  const totalModules = MODULES.length;

  return (
    <div className="page">
      <header style={{ marginBottom: 32 }}>
        <h1 className="page-title">대시보드</h1>
        <p className="page-sub">학습 현황을 확인하세요.</p>
      </header>

      {/* KPIs */}
      <section className="card" style={{ padding: 0, marginBottom: 32, display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="kpi" style={{ borderRight: "1px solid var(--border-subtle)" }}>
          <div className="kpi-label">전체 진행률</div>
          <div className="kpi-value">{overall.pct}<span className="denom">%</span></div>
          <div style={{ marginTop: 10 }}><Progress value={overall.done} total={overall.total} variant="grad" size="thin"/></div>
        </div>
        <div className="kpi" style={{ borderRight: "1px solid var(--border-subtle)" }}>
          <div className="kpi-label">완료한 챕터</div>
          <div className="kpi-value">{overall.done}<span className="denom">/ {overall.total}</span></div>
          <div style={{ marginTop: 16, font: "400 12px/16px var(--font-sans)", color: "var(--green-700)" }}>
            <Icon name="trending-up" size={12} style={{ marginRight: 4, verticalAlign: "-2px" }}/>
            지난주 +3
          </div>
        </div>
        <div className="kpi" style={{ borderRight: "1px solid var(--border-subtle)" }}>
          <div className="kpi-label">완료한 모듈</div>
          <div className="kpi-value">{completedModules}<span className="denom">/ {totalModules}</span></div>
          <div style={{ marginTop: 16, font: "400 12px/16px var(--font-sans)", color: "var(--gray-500)" }}>
            Python 기본 완료
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">북마크</div>
          <div className="kpi-value">{state.bookmarks.length}</div>
          <div style={{ marginTop: 16, font: "400 12px/16px var(--font-sans)", color: "var(--gray-500)" }}>
            나중에 다시 볼 챕터
          </div>
        </div>
      </section>

      {/* Module progress list */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ font: "700 18px/26px var(--font-sans)", margin: "0 0 16px", color: "var(--gray-900)" }}>모듈별 진행 현황</h2>
        <div className="card" style={{ padding: "8px 4px" }}>
          {MODULES.map((mod, i) => {
            const p = moduleProgress(mod, state.completed);
            const isDone = p.pct === 100;
            return (
              <button key={mod.id}
                onClick={() => navigate({ name: "module", moduleId: mod.id, chapterId: mod.chapters[0].id })}
                style={{
                  width: "100%", border: 0, background: "transparent", textAlign: "left",
                  padding: "16px 20px", cursor: "pointer",
                  borderTop: i === 0 ? 0 : "1px solid var(--border-subtle)",
                  display: "grid", gridTemplateColumns: "240px 1fr 80px 60px", alignItems: "center", gap: 16,
                  transition: "background var(--duration-fast) var(--ease-standard)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{mod.glyph}</span>
                  <span style={{ font: "500 14px/20px var(--font-sans)", color: "var(--gray-900)" }}>{mod.name}</span>
                  {isDone && <Badge tone="success">완료</Badge>}
                </div>
                <Progress value={p.done} total={p.total} variant={isDone ? "success" : "grad"} size="thin"/>
                <span style={{ font: "500 13px/20px var(--font-mono)", color: "var(--gray-500)", textAlign: "right" }}>{p.done} / {p.total}</span>
                <span style={{ font: "700 14px/20px var(--font-mono)", color: isDone ? "var(--green-700)" : p.pct > 0 ? "var(--purple-700)" : "var(--gray-400)", textAlign: "right" }}>{p.pct}%</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 style={{ font: "700 18px/26px var(--font-sans)", margin: "0 0 16px", color: "var(--gray-900)" }}>최근 학습 활동</h2>
        <div className="card" style={{ padding: "8px 20px" }}>
          {state.recent.map(r => (
            <div key={r.id} className="activity-item">
              <span className="avatar" style={{ background: "var(--bg-primary-tint)" }}>{r.glyph}</span>
              <div className="text">
                <div><b>{r.chapter}</b></div>
                <div style={{ color: "var(--gray-500)" }}>{r.module}</div>
              </div>
              <span className="when">{r.when}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { HomeScreen, DashboardScreen });
