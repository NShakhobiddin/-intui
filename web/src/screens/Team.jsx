/* ===== Intui — Jamoaviy intuitsiya (Collective Intuition) =====
   Bir havola orqali 30 kishigacha "dumaloq stol"ga qo'shiladi.
   Galma-gal har bir ishtirokchi 10 soniya his qiladi (meva tanlaydi),
   qolganlar uni his etib meva tanlaydi. So'ng hamma tanlovi ochiladi. */
import React from "react";
import { Ic, Logo, BackBtn, GlowButton } from "../ui.jsx";
import { teamAvailable, joinTeam, makeTeamCode, normalizeTeamCode, teamInviteUrl, TEAM_MAX } from "../team.js";
import { shareInvite, haptic } from "../telegram.js";

export const FRUITS = [
  { id: "olma", label: "Olma", emoji: "🍎", color: "#ff4d4d" },
  { id: "banan", label: "Banan", emoji: "🍌", color: "#ffcf33" },
  { id: "uzum", label: "Uzum", emoji: "🍇", color: "#b06cf0" },
  { id: "apelsin", label: "Apelsin", emoji: "🍊", color: "#ff9f1c" },
  { id: "qulupnay", label: "Qulupnay", emoji: "🍓", color: "#ff5d8f" },
  { id: "tarvuz", label: "Tarvuz", emoji: "🍉", color: "#3fbf5f" },
];

// Standart: 10s his qilish, 6s natija. (Test uchun window orqali qisqartirsa bo'ladi.)
const SENSE_SECONDS = (typeof window !== "undefined" && window.__TEAM_SENSE__) || 10;
const REVEAL_SECONDS = (typeof window !== "undefined" && window.__TEAM_REVEAL__) || 6;

function seatSize(n) { return n <= 8 ? 50 : n <= 14 ? 42 : n <= 22 ? 34 : 28; }
function initials(name) { return (name || "?").trim().slice(0, 2).toUpperCase(); }
function hueOf(s) { let h = 0; for (let i = 0; i < (s || "").length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }

export function TeamScreen({ myName, myId, initialCode, onExit }) {
  const [view, setView] = React.useState(initialCode ? "room" : "lobby"); // lobby | room | play | done
  const [isHost, setIsHost] = React.useState(false);
  const [code, setCode] = React.useState(initialCode ? normalizeTeamCode(initialCode) : "");
  const [codeInput, setCodeInput] = React.useState("");
  const [roster, setRoster] = React.useState([]);
  const [order, setOrder] = React.useState([]); // [{id,name}]
  const [round, setRound] = React.useState(-1);
  const [phase, setPhase] = React.useState("sense"); // sense | reveal
  const [picks, setPicks] = React.useState({}); // {id: fruitIndex}
  const [myPick, setMyPick] = React.useState(null);
  const [timeLeft, setTimeLeft] = React.useState(SENSE_SECONDS);
  const [scores, setScores] = React.useState({}); // {round: {activeId, activeName, target, aligned, choosers}}
  const [shareMsg, setShareMsg] = React.useState("");
  const [chanStatus, setChanStatus] = React.useState("");

  const conn = React.useRef(null);
  const startedRef = React.useRef(false);
  const joinedAtRef = React.useRef(Date.now());
  const hostTimer = React.useRef(null);
  const scoredRounds = React.useRef(new Set());
  const scoresRef = React.useRef({});
  scoresRef.current = scores;
  const S = React.useRef({});
  S.current = { round, phase, order, isHost, view, picks };

  const active = round >= 0 && order[round] ? order[round] : null;
  const iAmActive = !!active && active.id === myId;
  const activeName = active ? (iAmActive ? "Siz" : active.name) : "";

  function applyRound(r) {
    setRound(r); setPhase("sense"); setPicks({}); setMyPick(null);
  }

  const handleEvent = React.useCallback((p) => {
    if (!p) return;
    if (p.t === "start") {
      startedRef.current = true;
      setOrder(p.order || []);
      setView("play");
      applyRound(p.round || 0);
      return;
    }
    if (p.t === "round") {
      if (p.round > S.current.round || S.current.phase === "reveal") applyRound(p.round);
      return;
    }
    if (p.t === "reveal") {
      if (p.picks) setPicks(p.picks);
      setPhase("reveal");
      return;
    }
    if (p.t === "pick") {
      if (p.round !== S.current.round) return;
      setPicks((pk) => (pk[p.id] !== undefined ? pk : { ...pk, [p.id]: p.fruit }));
      return;
    }
    if (p.t === "done") {
      if (p.scores) { setScores(p.scores); scoresRef.current = p.scores; }
      setView("done");
      return;
    }
    if (p.t === "sync-req") {
      if (S.current.isHost && startedRef.current && conn.current) {
        if (S.current.view === "done") { conn.current.send({ t: "done", scores: scoresRef.current }); return; }
        conn.current.send({ t: "start", order: S.current.order, round: S.current.round });
        if (S.current.phase === "reveal") conn.current.send({ t: "reveal", round: S.current.round, picks: S.current.picks });
      }
      return;
    }
  }, [myId]);

  const startConn = React.useCallback((roomCode, host) => {
    if (conn.current) return;
    setIsHost(host);
    conn.current = joinTeam(roomCode, {
      id: myId, name: myName, isHost: host, joinedAt: joinedAtRef.current,
      onRoster: setRoster,
      onEvent: handleEvent,
      onStatus: setChanStatus,
    });
  }, [myId, myName, handleEvent]);

  // Guest: initialCode bilan avtomatik ulanadi; unmount'da chiqadi
  React.useEffect(() => {
    if (initialCode) startConn(normalizeTeamCode(initialCode), false);
    return () => { if (conn.current) { conn.current.leave(); conn.current = null; } clearTimeout(hostTimer.current); };
  }, []);

  // Lokal sanoq (ko'rgazma uchun) — har raund/faza boshida qaytadan
  React.useEffect(() => {
    if (view !== "play") return;
    const total = phase === "sense" ? SENSE_SECONDS : REVEAL_SECONDS;
    setTimeLeft(total);
    const t0 = Date.now();
    const iv = setInterval(() => {
      const left = Math.max(0, total - Math.floor((Date.now() - t0) / 1000));
      setTimeLeft(left);
      if (left <= 0) clearInterval(iv);
    }, 250);
    return () => clearInterval(iv);
  }, [round, phase, view]);

  // Xost — navbatlar boshqaruvchisi (10s his → reveal → 6s → keyingi)
  React.useEffect(() => {
    if (!isHost || view !== "play") return;
    clearTimeout(hostTimer.current);
    if (phase === "sense") {
      hostTimer.current = setTimeout(() => {
        setPhase("reveal");
        if (conn.current) conn.current.send({ t: "reveal", round: S.current.round, picks: S.current.picks });
      }, SENSE_SECONDS * 1000);
    } else if (phase === "reveal") {
      hostTimer.current = setTimeout(() => {
        const nr = S.current.round + 1;
        if (nr < S.current.order.length) { applyRound(nr); if (conn.current) conn.current.send({ t: "round", round: nr }); }
        else { setView("done"); if (conn.current) conn.current.send({ t: "done", scores: scoresRef.current }); }
      }, REVEAL_SECONDS * 1000);
    }
    return () => clearTimeout(hostTimer.current);
  }, [isHost, view, round, phase]);

  // Rezonansni hisoblash (reveal'da, har raund bir marta)
  React.useEffect(() => {
    if (view !== "play" || phase !== "reveal") return;
    if (scoredRounds.current.has(round)) return;
    const act = order[round];
    if (!act) return;
    scoredRounds.current.add(round);
    const target = picks[act.id];
    let aligned = 0, choosers = 0;
    Object.keys(picks).forEach((pid) => {
      if (pid === act.id) return;
      choosers++;
      if (target !== undefined && picks[pid] === target) aligned++;
    });
    setScores((sc) => ({ ...sc, [round]: { activeId: act.id, activeName: act.name, target, aligned, choosers } }));
    haptic(aligned > 0 ? "success" : "warning");
  }, [phase, round, view]);

  // Guest: o'yin allaqachon boshlangan bo'lishi mumkin — hostdan holat so'raydi
  React.useEffect(() => {
    if (isHost || view === "play" || view === "done") return;
    if (!conn.current) return;
    const iv = setInterval(() => {
      if (conn.current && S.current.view !== "play" && S.current.view !== "done") conn.current.send({ t: "sync-req" });
    }, 1500);
    return () => clearInterval(iv);
  }, [isHost, view, roster.length]);

  // ---------- Amallar ----------
  const createRoom = () => {
    const c = makeTeamCode();
    setCode(c);
    setView("room");
    startConn(c, true);
  };
  const joinByCode = () => {
    const c = normalizeTeamCode(codeInput);
    if (c.length < 4) return;
    setCode(c);
    setView("room");
    startConn(c, false);
  };
  const share = async () => {
    const r = await shareInvite(teamInviteUrl(code), "Intui — Jamoaviy intuitsiya! Dumaloq stolga qo'shil. Kod: " + code);
    setShareMsg(r === "copied" ? "Havola nusxalandi" : r === "shared" ? "" : "Havolani qo'lda yuboring");
  };
  const startGame = () => {
    const ord = roster.map((m) => ({ id: m.id, name: m.name }));
    if (ord.length < 2) return;
    setOrder(ord);
    startedRef.current = true;
    scoredRounds.current = new Set();
    setScores({});
    if (conn.current) conn.current.send({ t: "start", order: ord, round: 0 });
    setView("play");
    applyRound(0);
  };
  const pick = (fi) => {
    if (phase !== "sense" || myPick !== null || view !== "play") return;
    setMyPick(fi);
    setPicks((pk) => ({ ...pk, [myId]: fi }));
    if (conn.current) conn.current.send({ t: "pick", round, id: myId, name: myName, fruit: fi });
    haptic("warning");
  };
  const restart = () => {
    scoredRounds.current = new Set();
    setScores({}); setOrder([]); setRound(-1); setView("room");
    startedRef.current = false;
  };
  const exit = () => { if (conn.current) { conn.current.leave(); conn.current = null; } clearTimeout(hostTimer.current); onExit(); };

  // ---------- Supabase yo'q ----------
  if (!teamAvailable) {
    return (
      <Shell onExit={onExit} title="Jamoaviy intuitsiya">
        <div style={{ flex: 1 }}></div>
        <div className="panel" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Ic name="wave" size={40} color="var(--accent)" /></div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Bu rejim uchun Supabase kerak</div>
          <p className="t-sub" style={{ fontSize: 14, marginTop: 8 }}>Jamoaviy intuitsiya jonli ravishda serverdan foydalanadi. README'dagi Supabase sozlamasini bajaring.</p>
        </div>
        <div style={{ flex: 1 }}></div>
      </Shell>
    );
  }

  const connError = ["TIMED_OUT", "CLOSED", "CHANNEL_ERROR"].includes(chanStatus);

  // ---------- Lobby ----------
  if (view === "lobby") {
    return (
      <Shell onExit={onExit} title="Jamoaviy intuitsiya">
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Logo size={54} /></div>
          <h1 className="t-title" style={{ marginTop: 10 }}>Dumaloq stol</h1>
          <p className="t-sub" style={{ marginTop: 4, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>30 kishigacha bir havola orqali qo'shiladi. Galma-gal har kim his qiladi — jamoaviy rezonansni sinang.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginTop: 22, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
          {FRUITS.map((f) => <div key={f.id} style={{ fontSize: 26, textAlign: "center" }} title={f.label}>{f.emoji}</div>)}
        </div>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <GlowButton icon="user" onClick={createRoom}>Yangi stol ochish</GlowButton>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="field" placeholder="Stol kodi" value={codeInput} maxLength={5}
              onChange={(e) => setCodeInput(normalizeTeamCode(e.target.value))}
              onKeyDown={(e) => { if (e.key === "Enter") joinByCode(); }}
              style={{ textAlign: "center", letterSpacing: "0.25em", fontWeight: 800, textTransform: "uppercase" }} />
            <button className="btn-ghost" style={{ width: 120, flex: "none" }} disabled={normalizeTeamCode(codeInput).length < 4} onClick={joinByCode}>Qo'shilish</button>
          </div>
        </div>
      </Shell>
    );
  }

  // ---------- Xona (kutish) ----------
  if (view === "room") {
    const full = roster.length >= TEAM_MAX;
    return (
      <Shell onExit={exit} title="Dumaloq stol">
        {isHost ? (
          <div className="panel" style={{ padding: "18px 18px", textAlign: "center" }}>
            <div className="t-label">Stol kodi</div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "0.3em", color: "var(--accent)", marginTop: 6 }}>{code}</div>
            <div style={{ marginTop: 14 }}>
              <GlowButton icon="sparkle" chevron={false} onClick={share}>Havolani ulashish</GlowButton>
              {shareMsg ? <p className="t-micro" style={{ textAlign: "center", marginTop: 10 }}>{shareMsg}</p> : null}
            </div>
          </div>
        ) : (
          <div className="panel" style={{ padding: "16px 18px", textAlign: "center" }}>
            <p className="t-sub" style={{ fontSize: 14 }}>Stolga qo'shildingiz. Boshlovchi o'yinni boshlashini kuting…</p>
          </div>
        )}

        <div className="t-label" style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Ishtirokchilar</span>
          <span style={{ color: full ? "var(--bad)" : "var(--faint)" }}>{roster.length}/{TEAM_MAX}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {roster.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--faint)" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid rgba(167,155,255,0.25)", borderTopColor: "var(--accent)", animation: "intui-spin 0.9s linear infinite" }}></span>
              Ulanmoqda…
            </div>
          ) : roster.map((m) => (
            <div key={m.id} className="pill" style={{ fontSize: 13, background: m.id === myId ? "var(--card-2)" : "var(--card)" }}>
              <Seat name={m.name} id={m.id} size={22} />
              {m.id === myId ? "Siz" : m.name}{m.host ? " ·◆" : ""}
            </div>
          ))}
        </div>

        {connError ? (
          <div className="panel" style={{ marginTop: 14, padding: 14, textAlign: "center", borderColor: "rgba(251,113,133,0.3)" }}>
            <p className="t-sub" style={{ fontSize: 13.5, color: "var(--bad)" }}>Serverga ulanib bo'lmadi. Internetni tekshiring.</p>
          </div>
        ) : null}

        <div style={{ flex: 1 }}></div>
        {isHost ? (
          <div>
            <GlowButton icon="sparkle" disabled={roster.length < 2} onClick={startGame}>
              {roster.length < 2 ? "Kamida 2 kishi kerak" : "Boshlash (" + roster.length + " kishi)"}
            </GlowButton>
            <p className="t-micro" style={{ textAlign: "center", marginTop: 10 }}>Har kim navbatma-navbat 10 soniya his qiladi</p>
          </div>
        ) : (
          <Waiting text="Boshlovchi o'yinni boshlashini kuting…" />
        )}
      </Shell>
    );
  }

  // ---------- Yakun ----------
  if (view === "done") {
    const rows = Object.keys(scores).map((k) => scores[k]).filter(Boolean);
    let totalAligned = 0, totalChoosers = 0;
    rows.forEach((r) => { totalAligned += r.aligned; totalChoosers += r.choosers; });
    const resonance = totalChoosers ? Math.round((totalAligned / totalChoosers) * 100) : 0;
    return (
      <Shell onExit={exit} title="Jamoaviy natija">
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Logo size={50} /></div>
          <h1 className="t-title" style={{ marginTop: 8 }}>Jamoaviy rezonans</h1>
        </div>
        <div className="panel" style={{ marginTop: 16, padding: "22px 18px", textAlign: "center", border: "1px solid hsla(var(--accent-h),88%,74%,0.35)", background: "var(--card-2)" }}>
          <div style={{ fontSize: 46, fontWeight: 800, color: "var(--accent)" }}>{resonance}%</div>
          <p className="t-sub" style={{ fontSize: 14, marginTop: 4 }}>{totalAligned}/{totalChoosers} sezgi mos keldi · {rows.length} navbat</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          {rows.map((r, i) => {
            const fr = r.target !== undefined ? FRUITS[r.target] : null;
            return (
              <div key={i} className="panel" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 22, textAlign: "center", fontWeight: 800, color: "var(--faint)", flex: "none" }}>{i + 1}</span>
                <div style={{ fontSize: 24, flex: "none", width: 30, textAlign: "center" }}>{fr ? fr.emoji : "—"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.activeName}</div>
                  <div className="t-micro">{fr ? fr.label : "his qilmadi"}</div>
                </div>
                <div style={{ textAlign: "right", flex: "none" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: r.aligned > 0 ? "var(--good)" : "var(--faint)" }}>{r.aligned}/{r.choosers}</div>
                  <div className="t-micro">bir xil</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, minHeight: 12 }}></div>
        {isHost ? <GlowButton icon="sparkle" onClick={restart}>Yana o'ynash</GlowButton> : null}
        <button className="btn-ghost" style={{ marginTop: 10 }} onClick={exit}>Chiqish</button>
      </Shell>
    );
  }

  // ---------- O'yin (dumaloq stol) ----------
  const size = seatSize(roster.length);
  const activeFruit = active && picks[active.id] !== undefined ? FRUITS[picks[active.id]] : null;
  const roundScore = scores[round];
  const iPicked = myPick !== null;
  return (
    <Shell onExit={exit} title={"Navbat " + (round + 1) + "/" + order.length}>
      <div className="team-table">
        <div className="team-ring">
          {roster.map((m, i) => {
            const isAct = active && m.id === active.id;
            const picked = picks[m.id] !== undefined;
            const seatFruit = phase === "reveal" && picked ? FRUITS[picks[m.id]] : null;
            const ang = (-90 + (i * 360) / Math.max(1, roster.length)) * (Math.PI / 180);
            const x = 50 + 41 * Math.cos(ang), y = 50 + 41 * Math.sin(ang);
            return (
              <div key={m.id} className={"team-seat" + (isAct ? " active" : "")} style={{ left: x + "%", top: y + "%", width: size }}>
                <div className="team-seat-av" style={{ width: size, height: size }}>
                  <Seat name={m.name} id={m.id} size={size} me={m.id === myId} />
                  {phase === "sense" && picked && !isAct ? <span className="team-seat-dot" /> : null}
                  {seatFruit ? <span className="team-seat-fruit" style={{ fontSize: size * 0.5 }}>{seatFruit.emoji}</span> : null}
                  {isAct ? <span className="team-seat-glow" /> : null}
                </div>
                <span className="team-seat-name">{m.id === myId ? "Siz" : m.name}</span>
              </div>
            );
          })}
          {/* Markaz */}
          <div className="team-center">
            {phase === "sense" ? (
              <React.Fragment>
                <div className="team-count">{timeLeft}</div>
                <div className="team-center-sub">
                  <b style={{ color: "var(--accent)" }}>{activeName}</b><br />his qilmoqda
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div style={{ fontSize: 44, lineHeight: 1 }}>{activeFruit ? activeFruit.emoji : "🌀"}</div>
                <div className="team-center-sub" style={{ marginTop: 6 }}>
                  {roundScore ? <b style={{ color: roundScore.aligned > 0 ? "var(--good)" : "var(--muted)" }}>{roundScore.aligned}/{roundScore.choosers}</b> : "—"}<br />bir xil his qildi
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>

      {/* Pastki panel — his qilish/tanlash */}
      <div style={{ marginTop: 6 }}>
        {phase === "reveal" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              {iAmActive ? "Siz his qildingiz" : (active ? active.name + " his qildi" : "")}{activeFruit ? ": " + activeFruit.emoji + " " + activeFruit.label : ""}
            </div>
            <p className="t-sub" style={{ fontSize: 13.5, marginTop: 4 }}>
              {round + 1 < order.length ? "Keyingi navbat tayyorlanmoqda…" : "So'nggi navbat — natija chiqmoqda…"}
            </p>
          </div>
        ) : iPicked ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Tanladingiz: {FRUITS[myPick].emoji} {FRUITS[myPick].label}</div>
            <p className="t-sub" style={{ fontSize: 13.5, marginTop: 4 }}>Boshqalar his qilmoqda…</p>
          </div>
        ) : (
          <React.Fragment>
            <p className="t-sub" style={{ fontSize: 14, textAlign: "center", marginBottom: 10 }}>
              {iAmActive ? "Navbat sizda — ichki mevangizni his qiling" : (active ? active.name + "ni his eting — qaysi mevani tanlaydi?" : "His eting")}
            </p>
            <div className="fruit-grid">
              {FRUITS.map((f, i) => (
                <button key={f.id} className="fruit-btn" onClick={() => pick(i)} aria-label={f.label} style={{ "--fru": f.color }}>
                  <span className="fruit-emoji">{f.emoji}</span>
                  <span className="fruit-label">{f.label}</span>
                </button>
              ))}
            </div>
          </React.Fragment>
        )}
      </div>
    </Shell>
  );
}

function Seat({ name, id, size = 40, me }) {
  const hue = me ? "var(--accent-h)" : hueOf(id || name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flex: "none",
      display: "grid", placeItems: "center", fontWeight: 800, color: "#fff",
      fontSize: Math.max(10, size * 0.36),
      background: `linear-gradient(135deg, hsl(${hue},70%,58%), hsl(${hue},65%,42%))`,
      boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
    }}>{initials(name)}</div>
  );
}

function Waiting({ text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginTop: 20 }}>
      <div style={{ width: 38, height: 38, borderRadius: "50%", border: "3px solid rgba(167,155,255,0.22)", borderTopColor: "var(--accent)", animation: "intui-spin 0.9s linear infinite" }}></div>
      <p className="t-sub" style={{ fontSize: 14.5 }}>{text}</p>
    </div>
  );
}

function Shell({ onExit, title, children }) {
  return (
    <div className="screen" data-screen-label={"Team — " + title}>
      <div className="screen-pad-nonav" style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BackBtn onClick={onExit} />
          <span style={{ fontSize: 18, fontWeight: 700 }}>{title}</span>
        </div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
