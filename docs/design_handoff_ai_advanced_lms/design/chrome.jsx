/* global React, MODULES, Icon, moduleProgress, overallProgress */

function Sidebar({ route, navigate, state, menuOpen, onCloseMenu }) {
  const overall = overallProgress(state.completed);

  return (
    <aside className="sidebar">
      <a className="sb-brand" href="#/" onClick={(e) => {e.preventDefault();navigate({ name: "home" });onCloseMenu && onCloseMenu();}}>
        <span className="sb-brand-mark"><Icon name="graduation-cap" size={20} /></span>
        <span className="sb-brand-text">
          <span className="name">AI Advanced</span>
          <span className="sub">Learning Platform</span>
        </span>
      </a>

      <nav className="sb-nav">
        <button className={`sb-item ${route.name === "home" ? "on" : ""}`}
        onClick={() => {navigate({ name: "home" });onCloseMenu && onCloseMenu();}}>
          <Icon name="house" size={18} /> 홈
        </button>
        <button className={`sb-item ${route.name === "dashboard" ? "on" : ""}`}
        onClick={() => {navigate({ name: "dashboard" });onCloseMenu && onCloseMenu();}}>
          <Icon name="book-open" size={18} /> 대시보드
        </button>
        <button className={`sb-item ${route.name.startsWith("quiz") ? "on" : ""}`}
        onClick={() => {navigate({ name: "quiz-hub" });onCloseMenu && onCloseMenu();}}>
          <Icon name="circle-help" size={18} /> 퀴즈
        </button>

        <div className="sb-section">학습 모듈</div>
        {MODULES.map((mod) => {
          const { pct } = moduleProgress(mod, state.completed);
          const active = route.name === "module" && route.moduleId === mod.id;
          const isDone = pct === 100;
          return (
            <button key={mod.id}
            className={`sb-item ${active ? "on" : ""} ${isDone ? "done" : pct > 0 ? "partial" : ""}`}
            onClick={() => {navigate({ name: "module", moduleId: mod.id, chapterId: mod.chapters[0].id });onCloseMenu && onCloseMenu();}}>
              <span className="glyph">{mod.glyph}</span>
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {mod.name}
              </span>
              {isDone ?
              <Icon name="check" size={14} style={{ color: "var(--green-600)" }} /> :
              pct > 0 ? <span className="count">{pct}%</span> : <Icon name="chevron-right" size={14} />
              }
            </button>);

        })}
      </nav>

      <div className="sb-foot">
        <div className="sb-progress-label">
          <span>전체 진행률</span>
          <b>{overall.pct}%</b>
        </div>
        <div className="sb-progress-track">
          <div className="sb-progress-bar" style={{ width: `${overall.pct}%` }} />
        </div>
        <button className="sb-item" onClick={() => {navigate({ name: "settings" });onCloseMenu && onCloseMenu();}}>
          <Icon name="settings" size={18} /> 설정
        </button>
      </div>
    </aside>);

}

function Topbar({ crumbs = [], navigate, dark, setDark, onToggleMenu }) {
  return (
    <header className="topbar">
      <button className="tb-sidebtn menu-toggle" onClick={onToggleMenu} aria-label="메뉴 열기">
        <Icon name="panel-left" size={18} />
      </button>
      <nav className="tb-crumbs" aria-label="breadcrumb">
        {crumbs.map((c, i) =>
        <React.Fragment key={i}>
            {i > 0 && <Icon name="chevron-right" size={14} className="sep" />}
            {i < crumbs.length - 1 && c.onClick ?
          <button onClick={c.onClick}>{c.label}</button> :
          <span className="curr">{c.label}</span>}
          </React.Fragment>
        )}
      </nav>
      <div className="tb-search">
        <Icon name="search" size={16} />
        <input placeholder="검색..." aria-label="검색" />
        <span className="kbd">⌘K</span>
      </div>
      <button className="tb-icon-btn" onClick={() => setDark(!dark)} aria-label="테마 전환">
        <Icon name={dark ? "sun" : "moon"} size={18} />
      </button>
    </header>);

}

Object.assign(window, { Sidebar, Topbar });