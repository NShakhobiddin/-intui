/* ===== Intui — Game flow: mood check, focus, pick, reveal, summary ===== */
import React from "react";
import * as D from "../data.js";
import { Ic, Logo, Ring, GlowButton, ImgIcon, BackBtn, ModeIcon, ShapeGlyph, MoodIcon } from "../ui.jsx";
import { inTelegram, showBackButton, hideBackButton, haptic } from "../telegram.js";

function buildOptions(mode, n) {
  if (mode.id === "bw") {
    // single hidden card; the two choices are Oq and Qora
    return D.COLOR_CARDS.slice(0, 2).map((c, i) => ({ ...c, key: i }));
  }
  const pool = mode.id === "shape" ? D.SHAPE_CARDS : D.COLOR_CARDS;
  return pool.slice(0, n).map((c, i) => ({ ...c, key: i }));
}

export function GameScreen({ mode, nOptions, state, speed = 1, onExit, onComplete }) {
  const TOTAL = 100;

  const [phase, setPhase] = React.useState("mood"); // mood | focus | pick | second | reveal | summary
  const [mood, setMood] = React.useState(null);
  const [customMood, setCustomMood] = React.useState("");
  const [attempt, setAttempt] = React.useState(0);
  const [options, setOptions] = React.useState([]);
  const [secret, setSecret] = React.useState(0);
  const [pick, setPick] = React.useState(null);
  const [firstPick, setFirstPick] = React.useState(null);
  const [results, setResults] = React.useState([]);
  const [count, setCount] = React.useState(3);
  const [focusTotal, setFocusTotal] = React.useState(3);
  const [pickTimer, setPickTimer] = React.useState(null);
  const [elapsed, setElapsed] = React.useState(0);
  const startRef = React.useRef(Date.now());

  // session clock
  React.useEffect(() => {
    if (phase === "summary") return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  function startAttempt(idx) {
    const opts = buildOptions(mode, nOptions);
    // bw: secret is the hidden card's color (Oq yoki Qora)
    const sec = Math.floor(Math.random() * opts.length);
    setOptions(opts);
    setSecret(sec);
    setPick(null);
    setFirstPick(null);
    setAttempt(idx);
    // faqat birinchi urinishda diqqat jamlash; keyingilari darhol boshlanadi
    const ft = idx === 0 ? 3 : 0;
    setFocusTotal(ft);
    setCount(ft);
    if (ft === 0) {
      setPhase("pick");
      if (mode.timer) setPickTimer(mode.timer);
    } else {
      setPhase("focus");
    }
  }

  // focus countdown
  React.useEffect(() => {
    if (phase !== "focus") return;
    if (count <= 0) {
      setPhase("pick");
      if (mode.timer) setPickTimer(mode.timer);
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000 / speed);
    return () => clearTimeout(t);
  }, [phase, count, speed]);

  // fast-mode pick timer
  React.useEffect(() => {
    if (phase !== "pick" || pickTimer === null) return;
    if (pickTimer <= 0) { commitPick(null, false); return; }
    const t = setTimeout(() => setPickTimer((v) => v - 1), 1000 / speed);
    return () => clearTimeout(t);
  }, [phase, pickTimer, speed]);

  function handlePick(i) {
    if (phase !== "pick" && phase !== "second") return;
    if (mode.secondGuess && phase === "pick") {
      setFirstPick(i);
      setPick(i);
      setPhase("second");
      return;
    }
    commitPick(i, mode.secondGuess ? i !== firstPick : false);
  }

  function commitPick(i, changed) {
    setPickTimer(null);
    setPick(i);
    const correct = i !== null && i === secret;
    haptic(correct ? "success" : "error");
    setResults((r) => [...r, { correct, changed, missed: i === null }]);
    setPhase("reveal");
  }

  function next() {
    if (attempt + 1 >= TOTAL) {
      setPhase("summary");
    } else {
      startAttempt(attempt + 1);
    }
  }

  // auto-advance after reveal
  React.useEffect(() => {
    if (phase !== "reveal") return;
    const delay = 400 / speed;
    const t = setTimeout(next, delay);
    return () => clearTimeout(t);
  }, [phase]);

  // back: save what's done instead of losing it
  function handleExit() {
    if (results.length && phase !== "summary") setPhase("summary");
    else onExit();
  }

  // Telegramning o'z "orqaga" tugmasi ham xuddi shunday ishlaydi
  const exitRef = React.useRef(handleExit);
  exitRef.current = handleExit;
  React.useEffect(() => {
    if (!inTelegram) return;
    showBackButton(() => exitRef.current());
    return hideBackButton;
  }, []);

  const correctN = results.filter((r) => r.correct).length;
  const acc = results.length ? Math.round((correctN / results.length) * 100) : 0;
  const sessStreak = (() => {
    let s = 0;
    for (let i = results.length - 1; i >= 0 && results[i].correct; i--) s++;
    return s;
  })();
  const lastResult = results[results.length - 1];
  const fmtT = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

  // ---------- phases ----------
  if (phase === "mood") {
    return (
      <GameShell mode={mode} attempt={null} total={TOTAL} onExit={handleExit}>
        <div style={{ flex: 1 }}></div>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Logo size={72} /></div>
          <h2 className="t-title" style={{ marginTop: 18 }}>Hozir o'zingizni qanday his qilyapsiz?</h2>
          <p className="t-sub" style={{ marginTop: 8 }}>Bu tahlil aniqligi uchun kerak — natijaga ta'sir qilmaydi.</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, justifyContent: "center", marginTop: 26 }}>
          {D.MOODS.map((m) => (
            <button key={m.id} className={"tag" + (mood === m.id ? " on" : "")} onClick={() => setMood(m.id)}>
              <MoodIcon mood={m} size={18} color={mood === m.id ? "#fff" : m.color} />
              {m.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <input
            className="field"
            placeholder="Yoki o'zingiz yozing…"
            value={customMood}
            maxLength={24}
            onChange={(e) => {
              setCustomMood(e.target.value);
              const v = e.target.value.trim();
              setMood(v ? "c:" + v : null);
            }}
            style={{ textAlign: "center", minHeight: 50, fontSize: 15.5, borderColor: mood && mood.startsWith && mood.startsWith("c:") ? "var(--accent)" : undefined }}
          />
        </div>
        <div style={{ flex: 1.4 }}></div>
        <GlowButton burst={true} disabled={!mood} onClick={() => startAttempt(0)}>Boshlash</GlowButton>
      </GameShell>
    );
  }

  const showCards = phase === "pick" || phase === "second" || phase === "reveal";

  return (
    <GameShell mode={mode} attempt={attempt + 1} total={TOTAL} onExit={handleExit} onFinish={phase !== "summary" && results.length ? handleExit : null}>
      {phase === "focus" ? (
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <p style={{ fontSize: 16.5, color: "var(--muted)" }}>
            <b style={{ color: "var(--accent)" }}>{focusTotal} soniya</b> ichki sezgingizga quloq soling
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
            <Ring size={118} stroke={8} value={focusTotal - count} max={focusTotal}>
              <div className="pop" key={count} style={{ fontSize: 40, fontWeight: 800 }}>{count}</div>
            </Ring>
          </div>
          <p className="t-micro" style={{ marginTop: 18 }}>Tizim kartani allaqachon tanladi…</p>
        </div>
      ) : null}

      {phase === "pick" && mode.timer ? (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
          <span className="pill pill-hard" style={{ fontSize: 15 }}>
            <Ic name="clock" size={16} /> {pickTimer}s
          </span>
        </div>
      ) : null}

      {showCards ? (
        <React.Fragment>
          <SingleCard mode={mode} options={options} secret={secret} pick={pick} phase={phase} onPick={handlePick} />
          {phase === "second" ? (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 17 }}>Birinchi sezgingiz: <span style={{ color: "var(--accent)" }}>{options[firstPick] ? options[firstPick].label : ""}</span></p>
              <p className="t-sub" style={{ marginTop: 4, fontSize: 14 }}>Boshqa kartani tanlab o'zgartirishingiz yoki tasdiqlashingiz mumkin.</p>
              <div style={{ marginTop: 14 }}>
                <GlowButton icon="check" chevron={false} onClick={() => commitPick(pick, pick !== firstPick)}>Tasdiqlash</GlowButton>
              </div>
            </div>
          ) : null}
        </React.Fragment>
      ) : null}

      {phase === "reveal" ? (
        <div className="reveal-banner" style={{
          marginTop: 16,
          background: lastResult && lastResult.correct ? "rgba(74,222,128,0.08)" : "rgba(251,113,133,0.07)",
          border: "1px solid " + (lastResult && lastResult.correct ? "rgba(74,222,128,0.28)" : "rgba(251,113,133,0.22)"),
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center",
            background: lastResult && lastResult.correct
              ? "radial-gradient(circle at 35% 30%, hsl(var(--accent-h),85%,80%), hsl(var(--accent-h),65%,55%))"
              : "rgba(255,255,255,0.06)",
            boxShadow: lastResult && lastResult.correct ? "0 0 22px hsla(var(--accent-h),85%,70%,0.5)" : "none",
          }}>
            <Ic name={lastResult && lastResult.correct ? "sparkle" : "moon"} size={23} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: lastResult && lastResult.correct ? "var(--good)" : "var(--bad)" }}>
              {lastResult && lastResult.correct ? "To'g'ri!" : lastResult && lastResult.missed ? "Vaqt tugadi" : "Noto'g'ri"}
            </div>
            <div className="t-sub" style={{ fontSize: 13.5, marginTop: 1 }}>
              {options[secret] ? (lastResult && lastResult.correct ? options[secret].label + " kartani sezdingiz" : "Tanlangan karta: " + options[secret].label) : ""}
            </div>
          </div>
          <div style={{ textAlign: "right", flex: "none" }}>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{acc}%</div>
            <div className="t-micro" style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
              <Ic name="fire" size={12} color="#f59e0b" />{sessStreak} · {fmtT(elapsed)}
            </div>
          </div>
        </div>
      ) : null}

      {phase === "summary" ? (
        <SummaryView mode={mode} nOptions={nOptions} results={results} mood={mood} elapsed={elapsed} state={state} onComplete={onComplete} />
      ) : null}
    </GameShell>
  );
}

function MiniStat({ icon, label, value, sub, divider }) {
  return (
    <div style={{ textAlign: "left", paddingLeft: divider ? 12 : 0, borderLeft: divider ? "1px solid var(--stroke-soft)" : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Ic name={icon} size={16} color="var(--accent)" />
        <span className="t-micro" style={{ fontWeight: 700 }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, margin: "5px 0 2px" }}>{value}</div>
      <div className="t-micro" style={{ fontSize: 10.5 }}>{sub}</div>
    </div>
  );
}

function GameShell({ mode, attempt, total, onExit, onFinish, children }) {
  return (
    <div className="screen" data-screen-label={"O'yin — " + mode.name}>
      <div className="screen-pad-nonav" style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <BackBtn onClick={onExit} />
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <ModeIcon mode={mode} size={26} />
            <span style={{ fontSize: 19, fontWeight: 700 }}>{mode.name} rejim</span>
          </div>
          <div className="pill" style={{ minWidth: 64, justifyContent: "center", fontSize: 13 }}>
            {attempt ? <span><b style={{ color: "var(--accent)" }}>{attempt}</b> / {total}</span> : <span style={{ color: "var(--faint)" }}>—</span>}
          </div>
        </div>
        {attempt ? (
          <div className="hbar" style={{ height: 4, marginTop: 14 }}><i style={{ width: (attempt / total) * 100 + "%" }}></i></div>
        ) : null}
        <div style={{ marginTop: attempt ? 8 : 18, display: "flex", flexDirection: "column", flex: 1 }}>{children}</div>
        {attempt && onFinish ? (
          <button className="btn-ghost" style={{ marginTop: 14 }} onClick={onFinish}>
            <Ic name="chart" size={19} color="var(--accent)" />
            Yakunlash va statistikani ko'rish
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- Oq-qora: ochilganda butun karta oppoq yoki qopqora ---------- */
function RevealFace({ mode, card }) {
  if (!card) return null;
  if (mode.id === "shape") {
    return (
      <div className="gcard-inner face-back" style={{ borderRadius: "inherit", flexDirection: "column", gap: 10, background: "radial-gradient(120% 100% at 50% 0%, hsla(var(--accent-h),85%,72%,0.16), transparent 70%)" }}>
        <ShapeGlyph shape={card.shape} size={56} />
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}>{card.label}</span>
      </div>
    );
  }
  const base = card.id === "qora" ? "#000000" : card.id === "oq" ? "#ffffff" : card.color;
  return (
    <div className="gcard-inner face-back" style={{ borderRadius: "inherit", flexDirection: "column", gap: 6, background: base }}>
      <span style={{ fontWeight: 800, fontSize: 26, color: card.text, letterSpacing: 0.5 }}>{card.label}</span>
    </div>
  );
}

/* ---------- Yagona yopiq karta + tagida tanlov tugmalari (barcha rejimlar) ---------- */
function SingleCard({ mode, options, secret, pick, phase, onPick }) {
  const reveal = phase === "reveal";
  const correct = reveal && pick === secret;
  const isShape = mode.id === "shape";
  const n = options.length;
  const cardCls = ["gcard"];
  if (!reveal && pick !== null) cardCls.push("sel");
  if (reveal) cardCls.push(correct ? "win" : "lose");
  const cols = n <= 3 ? n : n === 4 ? 2 : 3;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 6 }}>
      <div className="flip-wrap" style={{ width: 150 }}>
        <div className={cardCls.join(" ")} style={{ width: "100%", display: "block" }}>
          <div className={"flipper" + (reveal ? " flipped" : "")}>
            <CardBack />
            <RevealFace mode={mode} card={options[secret]} />
          </div>
        </div>
      </div>
      {!reveal ? (
        <p style={{ textAlign: "center", color: "var(--accent)", fontWeight: 700, fontSize: 17, marginTop: 16 }}>
          {isShape ? "Kartada qaysi shakl?" : "Karta qaysi rangda?"}
        </p>
      ) : (
        <p style={{ textAlign: "center", color: "var(--muted)", fontWeight: 700, fontSize: 17, marginTop: 16 }}>
          Karta: <span style={{ color: correct ? "var(--good)" : "var(--bad)" }}>{options[secret] ? options[secret].label : ""}</span>
        </p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10, marginTop: 12, width: "100%", maxWidth: n === 2 ? 340 : 410 }}>
        {options.map((o, i) => {
          const sel = pick === i;
          const isWin = reveal && i === secret;
          const isLose = reveal && sel && i !== secret;
          const baseStyle = {
            minHeight: 54, borderRadius: 15, fontWeight: 800, fontSize: n > 4 ? 14.5 : 16,
            fontFamily: "inherit", cursor: reveal ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "8px 6px",
            border: "1.5px solid " + (isWin ? "var(--good)" : isLose ? "var(--bad)" : sel && !reveal ? "var(--accent)" : "rgba(167,155,255,0.28)"),
            boxShadow: isWin
              ? "0 0 0 2px rgba(74,222,128,0.5), 0 0 26px rgba(74,222,128,0.3)"
              : isLose
              ? "0 0 0 2px rgba(251,113,133,0.45), 0 0 22px rgba(251,113,133,0.28)"
              : sel && !reveal
              ? "0 0 0 2px hsla(var(--accent-h),88%,74%,0.45), 0 0 22px hsla(var(--accent-h),88%,70%,0.3)"
              : "0 6px 18px rgba(0,0,0,0.35)",
            opacity: reveal && !isWin && !isLose ? 0.45 : 1,
            transition: "border-color 0.2s, box-shadow 0.2s, opacity 0.2s",
          };
          if (isShape) {
            return (
              <button key={o.id} onClick={() => onPick(i)} disabled={reveal}
                style={{ ...baseStyle, flexDirection: "column", gap: 5, minHeight: 64, background: "rgba(255,255,255,0.045)" }}>
                <ShapeGlyph shape={o.shape} size={24} />
                <span style={{ fontSize: n > 4 ? 11.5 : 12.5, fontWeight: 700, color: "var(--muted)" }}>{o.label}</span>
              </button>
            );
          }
          const hi = o.id === "qora" ? "#2a2738" : o.id === "oq" ? "#ffffff" : lighten(o.color);
          return (
            <button key={o.id} onClick={() => onPick(i)} disabled={reveal}
              style={{ ...baseStyle, background: `radial-gradient(circle at 35% 28%, ${hi}, ${o.color})`, color: o.text }}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Card back ---------- */

function CardBack() {
  return (
    <div className="gcard-inner" style={{ flexDirection: "column", gap: 8 }}>
      {/* face-down mystic back */}
      <span className="card-back-orn"></span>
      <Ic name="star4" size={34} color="hsla(var(--accent-h),85%,75%,0.75)" />
      <div style={{ display: "flex", gap: 5, opacity: 0.5 }}>
        <span style={{ width: 4, height: 4, borderRadius: 99, background: "var(--accent)" }}></span>
        <span style={{ width: 4, height: 4, borderRadius: 99, background: "var(--accent)" }}></span>
        <span style={{ width: 4, height: 4, borderRadius: 99, background: "var(--accent)" }}></span>
      </div>
    </div>
  );
}

function lighten(hex) {
  // simple lighten for the disc highlight
  const c = parseInt(hex.slice(1), 16);
  const f = (v) => Math.min(255, Math.round(v + (255 - v) * 0.35));
  return `rgb(${f(c >> 16)}, ${f((c >> 8) & 255)}, ${f(c & 255)})`;
}

/* ---------- Summary + journal ---------- */
function SummaryView({ mode, nOptions, results, mood, elapsed, state, onComplete }) {
  const correct = results.filter((r) => r.correct).length;
  const acc = Math.round((correct / results.length) * 100);
  const chance = Math.round(100 / nOptions);
  const xp = correct * 6 + (results.length - correct) * 1 + (acc > chance ? 25 : 0);
  const [tags, setTags] = React.useState([]);
  const [note, setNote] = React.useState("");
  const [journalOpen, setJournalOpen] = React.useState(false);

  const finish = (withJournal) => {
    onComplete({
      session: { mode: mode.id, n: nOptions, total: results.length, correct, mood, date: D.todayStr(), hour: new Date().getHours(), daily: true, sec: elapsed },
      attempts: results.map((r) => ({ mode: mode.id, n: nOptions, correct: r.correct, changed: !!r.changed, hour: new Date().getHours(), date: D.todayStr(), mood })),
      xp,
      journal: withJournal && (tags.length || note.trim()) ? { date: D.todayStr(), mood, tags, note: note.trim() } : null,
    });
  };

  return (
    <div className="pop" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <h2 className="t-title">Sessiya yakunlandi</h2>
        <p className="t-sub" style={{ marginTop: 4 }}>{mode.name} rejim · {results.length} urinish</p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <Ring size={150} stroke={11} value={acc} max={100}>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{acc}%</div>
            <div className="t-micro">aniqlik</div>
          </div>
        </Ring>
      </div>
      <div className="panel" style={{ marginTop: 18, padding: "16px 18px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <MiniStat icon="target" label="Tasodif" value={chance + "%"} sub={acc > chance ? "+" + (acc - chance) + "% yuqori" : acc < chance ? (acc - chance) + "% past" : "teng"} />
        <MiniStat icon="clock" label="Vaqt" value={Math.max(1, Math.round(elapsed / 60)) + " daq"} sub="davomiylik" divider />
        <MiniStat icon="check" label="To'g'ri" value={correct + "/" + results.length} sub="urinishlar" divider />
      </div>

      {!journalOpen ? (
        <button className="btn-ghost" style={{ marginTop: 14 }} onClick={() => setJournalOpen(true)}>
          <ImgIcon name="journal" size={28} round={true} />
          Sezgi jurnaliga yozish
        </button>
      ) : (
        <div className="panel" style={{ marginTop: 14, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <ImgIcon name="journal" size={26} round={true} /> Sezgi jurnali
          </div>
          <p className="t-micro" style={{ marginTop: 6 }}>Mashq paytidagi holatingizni belgilang:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {D.JOURNAL_TAGS.map((t) => (
              <button key={t} className={"tag" + (tags.includes(t) ? " on" : "")} style={{ fontSize: 13, padding: "8px 13px" }}
                onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>{t}</button>
            ))}
          </div>
          <textarea className="field" rows={2} placeholder="Qisqa izoh (ixtiyoriy)…" value={note} onChange={(e) => setNote(e.target.value)} style={{ marginTop: 12, fontSize: 15 }}></textarea>
        </div>
      )}

      <div style={{ flex: 1 }}></div>
      <div style={{ marginTop: 18 }}>
        <GlowButton onClick={() => finish(true)}>Yakunlash</GlowButton>
      </div>
    </div>
  );
}
