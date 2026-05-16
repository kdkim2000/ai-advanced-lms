/* global React, MODULES, Icon, Btn, Badge, Progress, moduleProgress, findChapter */

function ModuleScreen({ state, update, navigate, moduleId, chapterId }) {
  const mod = MODULES.find(m => m.id === moduleId) || MODULES[0];
  const chapter = mod.chapters.find(c => c.id === chapterId) || mod.chapters[0];
  const chIdx = mod.chapters.findIndex(c => c.id === chapter.id);
  const p = moduleProgress(mod, state.completed);
  const isCompleted = !!state.completed[chapter.id];
  const isBookmarked = state.bookmarks.includes(chapter.id);

  // Persist "lastViewed"
  React.useEffect(() => {
    update(s => ({ ...s, lastViewed: chapter.id }));
  }, [chapter.id]);

  function toggleComplete() {
    update(s => ({ ...s, completed: { ...s.completed, [chapter.id]: !s.completed[chapter.id] }}));
  }
  function toggleBookmark() {
    update(s => ({
      ...s,
      bookmarks: isBookmarked
        ? s.bookmarks.filter(b => b !== chapter.id)
        : [...s.bookmarks, chapter.id],
    }));
  }
  function go(idx) {
    if (idx < 0 || idx >= mod.chapters.length) return;
    navigate({ name: "module", moduleId: mod.id, chapterId: mod.chapters[idx].id });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "calc(100vh - 60px)" }}>
      {/* Chapter sidebar (inside-main) */}
      <aside style={{
        borderRight: "1px solid var(--border-subtle)",
        background: "var(--bg-base)",
        padding: "24px 16px",
        position: "sticky", top: 60, height: "calc(100vh - 60px)", overflowY: "auto",
      }} className="chapter-sidebar">
        <div className="row" style={{ gap: 10, marginBottom: 18 }}>
          <span style={{
            width: 36, height: 36, borderRadius: "var(--radius-lg)",
            display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }} className={mod.hue}>{mod.glyph}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ font: "700 14px/18px var(--font-sans)", color: "var(--gray-900)" }}>{mod.name}</div>
            <div style={{ font: "400 11px/14px var(--font-sans)", color: "var(--gray-500)" }}>{p.done} / {p.total} 챕터 · {p.pct}%</div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <Progress value={p.done} total={p.total} variant="grad" size="thin"/>
        </div>

        <div style={{ font: "600 11px/16px var(--font-sans)", color: "var(--gray-400)", padding: "0 10px 8px" }}>챕터</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {mod.chapters.map((c, i) => {
            const done = !!state.completed[c.id];
            const on = c.id === chapter.id;
            return (
              <button key={c.id} className={`mod-chapter-item ${on ? "on" : ""}`}
                onClick={() => navigate({ name: "module", moduleId: mod.id, chapterId: c.id })}>
                {done && <Icon name="check" size={14} className="check"/>}
                {!done && (
                  <span style={{
                    position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                    width: 14, height: 14, borderRadius: "50%",
                    border: "1.5px solid var(--border-neutral)",
                  }}/>
                )}
                <span style={{ paddingLeft: 0 }}>{c.title}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Content */}
      <div className="page" style={{ padding: "32px 48px 96px", maxWidth: 920 }}>
        {/* Chapter eyebrow */}
        <div className="row" style={{ gap: 10, font: "500 13px/20px var(--font-sans)", color: "var(--gray-500)", marginBottom: 12 }}>
          <span>{mod.name}</span>
          <span>·</span>
          <span>챕터 {chIdx + 1} / {mod.chapters.length}</span>
          <span style={{ flex: 1 }}/>
          <button className="tb-icon-btn" onClick={toggleBookmark} aria-label="북마크" style={{ color: isBookmarked ? "var(--purple-600)" : "var(--gray-500)" }}>
            <Icon name={isBookmarked ? "bookmark-check" : "bookmark"} size={18}/>
          </button>
        </div>

        {/* Chapter card header */}
        <div className="card" style={{ padding: "20px 24px", marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{
            width: 48, height: 48, borderRadius: "var(--radius-lg)",
            display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          }} className={mod.hue}>{mod.glyph}</span>
          <div style={{ flex: 1 }}>
            <div style={{ font: "500 12px/16px var(--font-sans)", color: "var(--gray-500)" }}>{mod.name} · 챕터 {chIdx + 1} / {mod.chapters.length}</div>
            <h2 style={{ font: "700 22px/30px var(--font-sans)", letterSpacing: "-.01em", color: "var(--gray-900)", margin: "2px 0 0" }}>{chapter.title}</h2>
          </div>
          {isCompleted && <Badge tone="success" dot>완료</Badge>}
        </div>

        {/* Article body */}
        <article className="article">
          <ChapterContent chapter={chapter} module={mod}/>
        </article>

        {/* Bottom nav */}
        <div className="row between" style={{ marginTop: 48, gap: 16, flexWrap: "wrap" }}>
          <Btn variant="outline" size="lg" leadingIcon="arrow-left"
               onClick={() => go(chIdx - 1)} disabled={chIdx === 0}>이전 챕터</Btn>
          <Btn variant={isCompleted ? "outline" : "primary"} size="lg"
               leadingIcon={isCompleted ? "rotate-ccw" : "check"}
               onClick={toggleComplete}>
            {isCompleted ? "완료 취소" : "완료로 표시"}
          </Btn>
          <Btn variant="primary" size="lg" trailingIcon="arrow-right"
               onClick={() => go(chIdx + 1)} disabled={chIdx === mod.chapters.length - 1}>다음 챕터</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─── Chapter body content (sample for Pandas chapter, generic for others) ── */
function ChapterContent({ chapter, module: mod }) {
  // Most chapters use a generic structure; the Pandas chapter mirrors the screenshot.
  if (chapter.id === "data-2") return <PandasContent/>;
  return <GenericContent chapter={chapter} module={mod}/>;
}

function PandasContent() {
  return (
    <>
      <h1>Pandas 데이터 처리하기</h1>

      <h2>1. Pandas 개요</h2>
      <h3>Pandas란?</h3>
      <p><b>Pandas</b>는 <b>데이터 분석을 위한 파이썬 핵심 라이브러리</b> 입니다.</p>

      <table>
        <thead>
          <tr><th>비교</th><th>NumPy</th><th>Pandas</th></tr>
        </thead>
        <tbody>
          <tr><td>주요 용도</td><td>수치 연산</td><td>데이터 처리/분석</td></tr>
          <tr><td>데이터 형태</td><td>배열, 행렬</td><td>테이블 형태</td></tr>
          <tr><td>강점</td><td>고속 연산</td><td>데이터 조작, 병합</td></tr>
        </tbody>
      </table>

      <div className="callout">
        <Icon name="info" size={20} className="ico"/>
        <div className="body">
          <div className="title">Pandas의 강점</div>
          <div className="desc">테이블 형태의 정형 데이터 처리에 특화되어 있으며, 데이터 합산, 병합, 필터링 등의 작업을 쉽게 수행할 수 있습니다.</div>
        </div>
      </div>

      <h2>2. 데이터 구조</h2>
      <h3>Series와 DataFrame</h3>
      <p>Pandas의 핵심 데이터 구조는 두 가지입니다:</p>
      <ul>
        <li><b>Series</b>: 1차원 배열 형태의 데이터 구조로, 인덱스와 값으로 구성됩니다.</li>
        <li><b>DataFrame</b>: 2차원 테이블 형태의 데이터 구조로, 여러 Series가 결합된 형태입니다.</li>
      </ul>

      <pre><code>{`import pandas as pd

# Series 생성
s = pd.Series([1, 2, 3, 4, 5])

# DataFrame 생성
df = pd.DataFrame({
    "name":  ["Alice", "Bob", "Charlie"],
    "age":   [25, 30, 35],
    "score": [85, 92, 78],
})`}</code></pre>

      <h3>주요 메서드</h3>
      <p>DataFrame에서 자주 사용되는 메서드입니다.</p>
      <table>
        <thead>
          <tr><th>메서드</th><th>설명</th><th>예시</th></tr>
        </thead>
        <tbody>
          <tr><td><code>head()</code></td><td>상위 N개 행을 반환</td><td><code>df.head(5)</code></td></tr>
          <tr><td><code>info()</code></td><td>DataFrame 요약 정보</td><td><code>df.info()</code></td></tr>
          <tr><td><code>describe()</code></td><td>기술 통계량</td><td><code>df.describe()</code></td></tr>
          <tr><td><code>groupby()</code></td><td>그룹별 집계</td><td><code>df.groupby("class")</code></td></tr>
        </tbody>
      </table>

      <div className="callout warn">
        <Icon name="triangle-alert" size={20} className="ico"/>
        <div className="body">
          <div className="title">주의사항</div>
          <div className="desc">대용량 데이터를 처리할 때는 메모리 사용량에 주의해야 합니다. <code>dtype</code>을 명시적으로 지정하면 메모리를 절약할 수 있습니다.</div>
        </div>
      </div>

      <h2>3. 데이터 입출력</h2>
      <p>Pandas는 다양한 파일 형식을 지원합니다 — CSV, Excel, JSON, Parquet 등을 손쉽게 읽고 쓸 수 있습니다.</p>
      <pre><code>{`# 파일 읽기
df = pd.read_csv("data.csv")
df = pd.read_excel("data.xlsx")

# 파일 쓰기
df.to_csv("out.csv", index=False)
df.to_parquet("out.parquet")`}</code></pre>

      <div className="callout success">
        <Icon name="lightbulb" size={20} className="ico"/>
        <div className="body">
          <div className="title">실습 팁</div>
          <div className="desc">실제 데이터셋(예: Kaggle, 공공데이터포털)으로 연습하면 학습 효과가 훨씬 좋습니다. 다음 챕터에서 텍스트 전처리 기법을 다룹니다.</div>
        </div>
      </div>
    </>
  );
}

function GenericContent({ chapter, module: mod }) {
  return (
    <>
      <h1>{chapter.title}</h1>
      <p>이 챕터는 <b>{mod.name}</b> 모듈의 일부로, {chapter.title}에 대한 핵심 개념과 실습 예시를 다룹니다.</p>

      <h2>1. 개요</h2>
      <p>본 챕터에서는 {chapter.title}의 기본 원리부터 실제 활용 사례까지 단계적으로 학습합니다. 학습이 완료되면 관련 퀴즈로 이해도를 점검할 수 있습니다.</p>

      <div className="callout">
        <Icon name="info" size={20} className="ico"/>
        <div className="body">
          <div className="title">학습 목표</div>
          <div className="desc">{chapter.title}의 핵심 개념을 이해하고, 실무에 적용할 수 있는 기본기를 갖추는 것을 목표로 합니다.</div>
        </div>
      </div>

      <h2>2. 핵심 개념</h2>
      <ul>
        <li>주요 용어 정의 및 분류</li>
        <li>관련 라이브러리 및 도구</li>
        <li>대표 사용 사례</li>
        <li>흔히 발생하는 함정과 우회 방법</li>
      </ul>

      <h2>3. 실습 예제</h2>
      <p>아래 예제는 본 챕터의 핵심 개념을 적용한 코드 스니펫입니다.</p>
      <pre><code>{`# ${chapter.title} 예제
# 실제 학습 환경에서는 더 풍부한 예제가 제공됩니다.
def example():
    print("${chapter.title}")

example()`}</code></pre>

      <h2>4. 정리</h2>
      <p>이번 챕터에서 다룬 내용을 토대로 모듈 종합 퀴즈에 도전해보세요. 모르는 문제가 있다면 <b>오답노트</b>에 자동으로 기록되어 복습할 수 있습니다.</p>

      <div className="callout success">
        <Icon name="lightbulb" size={20} className="ico"/>
        <div className="body">
          <div className="title">다음 단계</div>
          <div className="desc">학습이 완료되었다면 하단의 <b>완료로 표시</b> 버튼을 눌러 진행률을 갱신하세요.</div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { ModuleScreen });
