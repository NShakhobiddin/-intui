/* ===== Intui — Do'st bilan onlayn o'ynash =====
   Bir tomon kartani yashirin tanlaydi (Hissiyotingizni yuboring),
   ikkinchi tomon sezib topadi (Do'stingizni his eting). Har raundda
   rollar almashadi. Realtime — Supabase kanali orqali. */
import React from "react";
import * as D from "../data.js";
import { Ic, Logo, BackBtn, ShapeGlyph, GlowButton } from "../ui.jsx";
import { CardBack, faceColor } from "./Game.jsx";
import { duoAvailable, joinDuo, makeRoomCode, normalizeCode, inviteUrl } from "../duo.js";
import { shareInvite, haptic } from "../telegram.js";

const DUO_MODES = [
  { id: "bw", name: "Oq-qora", icon: "yinyang" },
  { id: "color", name: "Rangli", icon: "color" },
  { id: "shape", name: "Shaklli", icon: "cube" },
];

function duoOptions(mode) {
  if (mode === "bw") return D.COLOR_CARDS.slice(0, 2);
  if (mode === "shape") return D.SHAPE_CARDS.slice(0, 4);
  // rangli — yorqin ranglar (oq/qora'siz)
  return D.COLOR_CARDS.filter((c) => c.id !== "oq" && c.id !== "qora").slice(0, 4);
}

/* Ochilgan karta yuzi */
function DuoFace({ mode, card }) {
  if (!card) return null;
  if (mode === "shape") {
    return (
      <div className="gcard-inner face-back" style={{ borderRadius: "inherit", flexDirection: "column", gap: 10, background: "radial-gradient(120% 100% at 50% 0%, hsla(var(--accent-h),85%,72%,0.16), transparent 70%)" }}>
        <ShapeGlyph shape={card.shape} size={54} />
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}>{card.label}</span>
      </div>
    );
  }
  return (
    <div className="gcard-inner face-back" style={{ borderRadius: "inherit", background: faceColor(card) }}>
      <span style={{ fontWeight: 800, fontSize: 24, color: card.text, letterSpacing: 0.5 }}>{card.label}</span>
    </div>
  );
}

/* Yopiq yoki ochilgan karta */
function DuoCard({ mode, card, open, tone }) {
  const cls = ["gcard"];
  if (tone === "win") cls.push("win");
  if (tone === "lose") cls.push("lose");
  return (
    <div className="flip-wrap" style={{ width: 132 }}>
      <div className={cls.join(" ")} style={{ width: "100%", display: "block" }}>
        <div className={"flipper" + (open ? " flipped" : "")}>
          <CardBack />
          <DuoFace mode={mode} card={card} />
        </div>
      </div>
    </div>
  );
}

/* Tanlov tugmalari */
function DuoChoices({ mode, options, onPick, disabled }) {
  const n = options.length;
  const cols = n <= 3 ? n : 2;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10, marginTop: 14, width: "100%", maxWidth: n === 2 ? 320 : 380 }}>
      {options.map((o, i) => {
        const base = {
          minHeight: 56, borderRadius: 15, fontWeight: 800, fontSize: 16, fontFamily: "inherit",
          cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, padding: "8px 6px", opacity: disabled ? 0.5 : 1,
          border: "1.5px solid rgba(167,155,255,0.28)", boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          transition: "transform 0.12s ease, box-shadow 0.2s",
        };
        if (mode === "shape") {
          return (
            <button key={o.id} disabled={disabled} onClick={() => onPick(i)}
              style={{ ...base, flexDirection: "column", gap: 5, minHeight: 68, background: "rgba(255,255,255,0.05)" }}>
              <ShapeGlyph shape={o.shape} size={24} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }}>{o.label}</span>
            </button>
          );
        }
        return (
          <button key={o.id} disabled={disabled} onClick={() => onPick(i)}
            style={{ ...base, background: faceColor(o), color: o.text }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Waiting({ text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginTop: 30 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(167,155,255,0.22)", borderTopColor: "var(--accent)", animation: "intui-spin 0.9s linear infinite" }}></div>
      <p className="t-sub" style={{ fontSize: 15 }}>{text}</p>
    </div>
  );
}

export function DuoScreen({ myName, initialCode, onExit }) {
  const [view, setView] = React.useState(initialCode ? "connecting" : "lobby"); // lobby | invite | connecting | play | left
  const [mode, setMode] = React.useState("bw");
  const [code, setCode] = React.useState(initialCode ? normalizeCode(initialCode) : "");
  // Xona yaratgan = host; kod/deep-link orqali qo'shilgan = guest
  const [isHost, setIsHost] = React.useState(false);
  const [roster, setRoster] = React.useState([]);
  const [round, setRound] = React.useState(-1);
  const [secret, setSecret] = React.useState(null);
  const [chosen, setChosen] = React.useState(false);
  const [friendChose, setFriendChose] = React.useState(false);
  const [guess, setGuess] = React.useState(null);
  const [reveal, setReveal] = React.useState(null);
  const [score, setScore] = React.useState({ correct: 0, total: 0 });
  const [codeInput, setCodeInput] = React.useState("");
  const [shareMsg, setShareMsg] = React.useState("");

  const conn = React.useRef(null);
  const scoredRound = React.useRef(-1);
  const startedRef = React.useRef(false);
  const S = React.useRef({});
  S.current = { round, secret, isHost, mode, view };

  const friend = roster.find((m) => m.host !== isHost) || null;
  const bothHere = roster.length >= 2;
  const chooserIsHost = round % 2 === 0;
  const iAmChooser = round >= 0 && (chooserIsHost === isHost);
  const options = React.useMemo(() => duoOptions(mode), [mode]);

  function resetRound() {
    setSecret(null); setChosen(false); setFriendChose(false); setGuess(null); setReveal(null);
  }

  function applyRound(r, m) {
    if (r <= S.current.round) return;
    if (m) setMode(m);
    resetRound();
    setRound(r);
    setView("play");
  }

  const startConn = React.useCallback((roomCode, host, initialMode) => {
    if (conn.current) return;
    conn.current = joinDuo(roomCode, {
      name: myName, isHost: host, mode: initialMode,
      onRoster: (list) => {
        setRoster(list);
        // Guest: host presence'idan rejimni oladi
        if (!host) {
          const h = list.find((m) => m.host);
          if (h && h.mode) setMode(h.mode);
        }
        // Host: ikkalasi ulanganda 0-raundni boshlaydi
        if (host && list.length >= 2 && !startedRef.current) {
          startedRef.current = true;
          const m = S.current.mode;
          conn.current.send({ t: "round", round: 0, mode: m });
          applyRound(0, m);
        }
        // O'yin paytida do'st chiqib ketsa
        if (list.length < 2 && S.current.view === "play") setView("left");
      },
      onMove: (p) => {
        if (!p) return;
        if (p.t === "round") { applyRound(p.round, p.mode); return; }
        if (p.round !== S.current.round) return;
        if (p.t === "chosen") { setFriendChose(true); return; }
        if (p.t === "guess") {
          // Men tanlovchiman — natijani hisoblab yuboraman
          const sec = S.current.secret;
          const correct = p.guess === sec;
          conn.current.send({ t: "reveal", round: p.round, secret: sec, guess: p.guess, correct });
          applyReveal(p.round, sec, p.guess, correct);
          return;
        }
        if (p.t === "reveal") { applyReveal(p.round, p.secret, p.guess, p.correct); return; }
      },
      onStatus: () => {},
    });
  }, [myName]);

  function applyReveal(r, sec, g, correct) {
    setReveal({ secret: sec, guess: g, correct });
    if (scoredRound.current !== r) {
      scoredRound.current = r;
      setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
      haptic(correct ? "success" : "warning");
    }
  }

  // Guest: initialCode bilan avtomatik ulanadi
  React.useEffect(() => {
    if (initialCode) startConn(normalizeCode(initialCode), false);
    return () => { if (conn.current) conn.current.leave(); conn.current = null; };
  }, []);

  // ---------- Amallar ----------
  const createRoom = () => {
    const c = makeRoomCode();
    setCode(c);
    setIsHost(true);
    setView("invite");
    startConn(c, true, mode);
  };
  const joinByCode = () => {
    const c = normalizeCode(codeInput);
    if (c.length < 4) return;
    setCode(c);
    setView("connecting");
    startConn(c, false);
  };
  const share = async () => {
    const r = await shareInvite(inviteUrl(code), "Intui — sezgi duelida meni yeng! Kod: " + code);
    setShareMsg(r === "copied" ? "Havola nusxalandi" : r === "shared" ? "" : "Havolani qo'lda yuboring");
  };
  const pickChoose = (i) => {
    if (chosen) return;
    setSecret(i); setChosen(true);
    conn.current.send({ t: "chosen", round });
    haptic("warning");
  };
  const pickGuess = (i) => {
    if (guess !== null) return;
    setGuess(i);
    conn.current.send({ t: "guess", round, guess: i });
  };
  const nextRound = () => {
    const r = round + 1;
    conn.current.send({ t: "round", round: r, mode });
    applyRound(r, mode);
  };
  const exit = () => { if (conn.current) { conn.current.leave(); conn.current = null; } onExit(); };

  // ---------- Supabase yo'q bo'lsa ----------
  if (!duoAvailable) {
    return (
      <Shell onExit={onExit} title="Do'st bilan o'ynash">
        <div style={{ flex: 1 }}></div>
        <div className="panel" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Ic name="wave" size={40} color="var(--accent)" /></div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Onlayn rejim uchun ulanish kerak</div>
          <p className="t-sub" style={{ fontSize: 14, marginTop: 8 }}>Do'st bilan o'ynash Supabase server sozlangach ishlaydi (README'ga qarang). Ilovaning qolgan qismi shusiz ham ishlayveradi.</p>
        </div>
        <div style={{ flex: 1 }}></div>
      </Shell>
    );
  }

  // ---------- Lobby ----------
  if (view === "lobby") {
    return (
      <Shell onExit={onExit} title="Do'st bilan o'ynash">
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Logo size={54} /></div>
          <h1 className="t-title" style={{ marginTop: 10 }}>Sezgi dueli</h1>
          <p className="t-sub" style={{ marginTop: 4 }}>Biri kartani yashiradi, ikkinchisi sezib topadi</p>
        </div>

        <div className="t-label" style={{ marginTop: 24, marginBottom: 10 }}>Rejim</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
          {DUO_MODES.map((m) => {
            const on = mode === m.id;
            return (
              <button key={m.id} className="panel row-press" onClick={() => setMode(m.id)} style={{
                padding: "16px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 9,
                border: on ? "1.5px solid var(--accent)" : "1px solid var(--stroke-soft)",
                background: on ? "var(--card-2)" : "var(--card)",
                boxShadow: on ? "0 0 20px hsla(var(--accent-h),88%,70%,0.22)" : "none",
              }}>
                <ModeGlyph id={m.id} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</span>
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }}></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <GlowButton icon="user" onClick={createRoom}>Do'st chaqirish</GlowButton>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="field" placeholder="Do'st kodi" value={codeInput} maxLength={5}
              onChange={(e) => setCodeInput(normalizeCode(e.target.value))}
              onKeyDown={(e) => { if (e.key === "Enter") joinByCode(); }}
              style={{ textAlign: "center", letterSpacing: "0.25em", fontWeight: 800, textTransform: "uppercase" }} />
            <button className="btn-ghost" style={{ width: 120, flex: "none" }} disabled={normalizeCode(codeInput).length < 4} onClick={joinByCode}>Qo'shilish</button>
          </div>
        </div>
      </Shell>
    );
  }

  // ---------- Taklif (host kutmoqda) ----------
  if (view === "invite" && !bothHere) {
    return (
      <Shell onExit={exit} title="Do'stni taklif qiling">
        <div style={{ flex: 1 }}></div>
        <div style={{ textAlign: "center" }}>
          <div className="pulse" style={{ display: "flex", justifyContent: "center" }}><Logo size={72} /></div>
          <h2 className="t-title" style={{ marginTop: 18 }}>Do'stingizni kuting</h2>
          <p className="t-sub" style={{ marginTop: 8 }}>Havolani yuboring yoki kodni ayting. Do'stingiz qo'shilishi bilan o'yin boshlanadi.</p>
        </div>
        <div className="panel" style={{ marginTop: 22, padding: "20px 18px", textAlign: "center" }}>
          <div className="t-label">O'yin kodi</div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "0.3em", color: "var(--accent)", marginTop: 8 }}>{code}</div>
        </div>
        <div style={{ marginTop: 16 }}>
          <GlowButton icon="sparkle" chevron={false} onClick={share}>Havolani ulashish</GlowButton>
          {shareMsg ? <p className="t-micro" style={{ textAlign: "center", marginTop: 10 }}>{shareMsg}</p> : null}
        </div>
        <div style={{ flex: 1 }}></div>
        <Waiting text="Do'stingiz kutilmoqda…" />
        <div style={{ flex: 1 }}></div>
      </Shell>
    );
  }

  // ---------- Ulanmoqda (guest) ----------
  if (view === "connecting" && !bothHere) {
    return (
      <Shell onExit={exit} title="Ulanmoqda">
        <div style={{ flex: 1 }}></div>
        <Waiting text={"Xonaga ulanmoqda…  " + code} />
        <div style={{ flex: 1 }}></div>
      </Shell>
    );
  }

  // ---------- Do'st chiqib ketdi ----------
  if (view === "left") {
    return (
      <Shell onExit={exit} title="Sezgi dueli">
        <div style={{ flex: 1 }}></div>
        <div className="panel" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Do'stingiz chiqib ketdi</div>
          <p className="t-sub" style={{ fontSize: 14, marginTop: 8 }}>Natija: {score.correct}/{score.total} to'g'ri sezildi</p>
        </div>
        <div style={{ flex: 1 }}></div>
        <GlowButton icon={null} chevron={false} onClick={exit}>Chiqish</GlowButton>
      </Shell>
    );
  }

  // ---------- O'yin ----------
  const modeName = (DUO_MODES.find((m) => m.id === mode) || DUO_MODES[0]).name;
  const secretCard = reveal ? options[reveal.secret] : (secret !== null ? options[secret] : null);
  return (
    <Shell onExit={exit} title={modeName + " · duel"}>
      {/* O'yinchilar */}
      <div className="panel" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <PlayerBadge name={myName} me active={iAmChooser} role={iAmChooser ? "tanlaydi" : "sezadi"} />
        <div style={{ textAlign: "center", flex: "none", color: "var(--faint)" }}>
          <Ic name="bolt" size={18} color="var(--accent)" />
          <div className="t-micro" style={{ fontWeight: 800 }}>{score.correct}/{score.total}</div>
        </div>
        <PlayerBadge name={friend ? friend.name : "…"} active={!iAmChooser} role={!iAmChooser ? "tanlaydi" : "sezadi"} right />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, justifyContent: "center", gap: 4 }}>
        {reveal ? (
          <React.Fragment>
            <DuoCard mode={mode} card={secretCard} open tone={reveal.correct ? "win" : "lose"} />
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: reveal.correct ? "var(--good)" : "var(--bad)" }}>
                {reveal.correct ? "To'g'ri sezdi! 🎯" : "Bu safar sezmadi"}
              </div>
              <p className="t-sub" style={{ fontSize: 14, marginTop: 4 }}>
                Yashirilgan: <b style={{ color: "var(--text)" }}>{secretCard ? secretCard.label : ""}</b>
                {" · "}Sezgi: <b style={{ color: reveal.correct ? "var(--good)" : "var(--bad)" }}>{options[reveal.guess] ? options[reveal.guess].label : "—"}</b>
              </p>
            </div>
            <div style={{ width: "100%", marginTop: 18 }}>
              <GlowButton icon="sparkle" onClick={nextRound}>Keyingi raund</GlowButton>
            </div>
          </React.Fragment>
        ) : iAmChooser ? (
          chosen ? (
            <React.Fragment>
              <DuoCard mode={mode} card={secretCard} open />
              <Waiting text="Yuborildi — do'stingiz sezmoqda…" />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent)" }}>Hissiyotingizni yuboring</div>
                <p className="t-sub" style={{ fontSize: 14, marginTop: 6, maxWidth: 300 }}>Do'stingizga yashirin karta tanlang — u sezib topsin.</p>
              </div>
              <div style={{ marginTop: 18 }}><DuoCard mode={mode} card={null} open={false} /></div>
              <DuoChoices mode={mode} options={options} onPick={pickChoose} disabled={false} />
            </React.Fragment>
          )
        ) : (
          friendChose ? (
            guess !== null ? (
              <React.Fragment>
                <DuoCard mode={mode} card={null} open={false} />
                <Waiting text="Sezildi — natija kutilmoqda…" />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent)" }}>Do'stingizni his eting</div>
                  <p className="t-sub" style={{ fontSize: 14, marginTop: 6, maxWidth: 300 }}>{friend ? friend.name : "Do'stingiz"} qaysi kartani tanladi? Ichki sezgingizga quloq soling.</p>
                </div>
                <div style={{ marginTop: 18 }}><DuoCard mode={mode} card={null} open={false} /></div>
                <DuoChoices mode={mode} options={options} onPick={pickGuess} disabled={false} />
              </React.Fragment>
            )
          ) : (
            <React.Fragment>
              <DuoCard mode={mode} card={null} open={false} />
              <Waiting text={(friend ? friend.name : "Do'stingiz") + " tanlamoqda…"} />
            </React.Fragment>
          )
        )}
      </div>
    </Shell>
  );
}

function PlayerBadge({ name, me, active, role, right }) {
  return (
    <div style={{ flex: 1, minWidth: 0, textAlign: right ? "right" : "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: right ? "flex-end" : "flex-start" }}>
        {!right ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: active ? "var(--accent)" : "var(--faint)", boxShadow: active ? "0 0 8px var(--accent)" : "none", flex: "none" }}></span> : null}
        <span style={{ fontWeight: 800, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{me ? "Siz" : name}</span>
        {right ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: active ? "var(--accent)" : "var(--faint)", boxShadow: active ? "0 0 8px var(--accent)" : "none", flex: "none" }}></span> : null}
      </div>
      <div className="t-micro" style={{ color: active ? "var(--accent)" : "var(--faint)", fontWeight: 700, marginTop: 2 }}>{active ? "◆ " + role : role}</div>
    </div>
  );
}

function ModeGlyph({ id }) {
  if (id === "bw") return <div style={{ display: "flex", gap: 3 }}><span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff" }}></span><span style={{ width: 20, height: 20, borderRadius: "50%", background: "#000", border: "1px solid var(--stroke)" }}></span></div>;
  if (id === "shape") return <ShapeGlyph shape="star" size={30} />;
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>{["#ff3b52", "#2f7bff", "#18c26a", "#ffc21e"].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 4, background: c }}></span>)}</div>;
}

function Shell({ onExit, title, children }) {
  return (
    <div className="screen" data-screen-label={"Duo — " + title}>
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
