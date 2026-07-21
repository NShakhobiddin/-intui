/* ===== Intui — Do'st bilan onlayn o'ynash =====
   Bir tomon kartani yashirin tanlaydi (Hissiyotingizni yuboring),
   ikkinchi tomon sezib topadi (Do'stingizni his eting). Har raundda
   rollar almashadi. Realtime — Supabase kanali orqali. */
import React from "react";
import * as D from "../data.js";
import { Ic, Logo, BackBtn, ShapeGlyph, GlowButton } from "../ui.jsx";
import { CardBack, faceColor } from "./Game.jsx";
import { duoAvailable, joinDuo, makeRoomCode, normalizeCode, inviteUrl, encodeToken } from "../duo.js";
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
      <div className="gcard-inner face-back" style={{ borderRadius: "inherit", flexDirection: "column", gap: 10, background: "#ffffff" }}>
        <ShapeGlyph shape={card.shape} size={66} color="#241f3d" />
        <span style={{ fontSize: 15, fontWeight: 700, color: "#3f3a63" }}>{card.label}</span>
      </div>
    );
  }
  return (
    <div className="gcard-inner face-back" style={{ borderRadius: "inherit", background: faceColor(card) }}>
      <span style={{ fontWeight: 800, fontSize: 30, color: card.text, letterSpacing: 0.5 }}>{card.label}</span>
    </div>
  );
}

/* Yopiq yoki ochilgan karta */
function DuoCard({ mode, card, open, tone }) {
  const cls = ["gcard"];
  if (tone === "win") cls.push("win");
  if (tone === "lose") cls.push("lose");
  return (
    <div className="flip-wrap" style={{ width: 168 }}>
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
  const [asyncCompose, setAsyncCompose] = React.useState(false);
  const [chanStatus, setChanStatus] = React.useState(""); // SUBSCRIBED | TIMED_OUT | CHANNEL_ERROR | CLOSED
  const [slow, setSlow] = React.useState(false); // ulanish/kutish cho'zilib ketdi

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
        // Guest ulandi-yu boshlanish xabari yetmagan bo'lsa — host qayta yuboradi
        if (p.t === "sync-req") {
          if (S.current.isHost && startedRef.current && conn.current) {
            conn.current.send({ t: "round", round: S.current.round < 0 ? 0 : S.current.round, mode: S.current.mode });
          }
          return;
        }
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
      onStatus: (st) => setChanStatus(st),
    });
  }, [myName]);

  const connError = ["TIMED_OUT", "CLOSED", "CHANNEL_ERROR"].includes(chanStatus);

  // Ulanish/kutish 12s dan oshsa — foydali xabar chiqarish (cheksiz aylanmasin)
  React.useEffect(() => {
    const waiting = (view === "connecting" || view === "invite") && !bothHere;
    if (!waiting) { setSlow(false); return; }
    const t = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(t);
  }, [view, bothHere]);

  const retry = () => {
    if (conn.current) { conn.current.leave(); conn.current = null; }
    startedRef.current = false;
    setRoster([]); setSlow(false); setChanStatus("");
    startConn(code, isHost, mode);
  };

  // Guest ikkalasi ulanib, lekin raund hali kelmagan bo'lsa — hostdan so'raydi
  React.useEffect(() => {
    if (isHost || !bothHere || round >= 0 || !conn.current) return;
    const t = setInterval(() => {
      if (conn.current && S.current.round < 0) conn.current.send({ t: "sync-req" });
    }, 1500);
    return () => clearInterval(t);
  }, [isHost, bothHere, round]);

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

  // ---------- Supabase yo'q yoki async tanlangan: Telegram orqali navbatli ----------
  if (asyncCompose || (!duoAvailable && !initialCode)) {
    return <AsyncDuo myName={myName} startMode={mode}
      onExit={asyncCompose ? () => setAsyncCompose(false) : onExit} />;
  }
  // Supabase yo'q, lekin jonli xona kodi bilan kelingan — jonli ulanib bo'lmaydi
  if (!duoAvailable && initialCode) {
    return (
      <Shell onExit={onExit} title="Do'st bilan o'ynash">
        <div style={{ flex: 1 }}></div>
        <div className="panel" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Ic name="wave" size={40} color="var(--accent)" /></div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Jonli xonaga ulanib bo'lmadi</div>
          <p className="t-sub" style={{ fontSize: 14, marginTop: 8 }}>Jonli rejim uchun Supabase sozlanishi kerak (README). Navbatli rejimda esa do'stingiz sizga karta havolasini yuborishi kerak.</p>
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
          <GlowButton icon="user" onClick={createRoom}>Jonli chaqirish</GlowButton>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="field" placeholder="Do'st kodi" value={codeInput} maxLength={5}
              onChange={(e) => setCodeInput(normalizeCode(e.target.value))}
              onKeyDown={(e) => { if (e.key === "Enter") joinByCode(); }}
              style={{ textAlign: "center", letterSpacing: "0.25em", fontWeight: 800, textTransform: "uppercase" }} />
            <button className="btn-ghost" style={{ width: 120, flex: "none" }} disabled={normalizeCode(codeInput).length < 4} onClick={joinByCode}>Qo'shilish</button>
          </div>
          <button onClick={() => setAsyncCompose(true)} style={{ color: "var(--accent)", fontSize: 14, fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            Yoki Telegram orqali navbat bilan <Ic name="chevR" size={15} />
          </button>
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
        {connError ? (
          <div className="panel" style={{ marginTop: 14, padding: 16, textAlign: "center", borderColor: "rgba(251,113,133,0.3)" }}>
            <p className="t-sub" style={{ fontSize: 13.5, color: "var(--bad)" }}>Serverga ulanib bo'lmadi (Realtime). Internetni tekshiring yoki qayta urining.</p>
            <button className="btn-ghost" style={{ marginTop: 12, minHeight: 46 }} onClick={retry}>Qayta urinish</button>
          </div>
        ) : slow ? (
          <div className="panel" style={{ marginTop: 14, padding: 16, textAlign: "center" }}>
            <p className="t-sub" style={{ fontSize: 13.5 }}>Do'stingiz hali qo'shilmadi. Havola/kod yuborilganini va u ham "Jonli" rejimda ekanini tekshiring.</p>
            <button onClick={() => setAsyncCompose(true)} style={{ color: "var(--accent)", fontSize: 14, fontWeight: 700, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100%" }}>
              Yoki Telegram orqali navbat bilan yuborish <Ic name="chevR" size={15} />
            </button>
          </div>
        ) : null}
        <div style={{ flex: 1 }}></div>
      </Shell>
    );
  }

  // ---------- Ulanmoqda (guest) ----------
  if (view === "connecting" && !bothHere) {
    const problem = connError || slow;
    return (
      <Shell onExit={exit} title="Ulanmoqda">
        <div style={{ flex: 1 }}></div>
        <Waiting text={"Xonaga ulanmoqda…  " + code} />
        {problem ? (
          <div className="panel" style={{ marginTop: 16, padding: 18, textAlign: "center", borderColor: connError ? "rgba(251,113,133,0.3)" : undefined }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{connError ? "Ulanib bo'lmadi" : "Ulanish cho'zilyapti"}</div>
            <p className="t-sub" style={{ fontSize: 13.5, marginTop: 6 }}>
              {connError
                ? "Serverga (Realtime) ulanib bo'lmadi. Internetni tekshiring."
                : "Kod to'g'riligini va do'stingiz \"Jonli chaqirish\" bilan xona ochganini tekshiring. Xona egasi ilovada turishi kerak."}
            </p>
            <button className="btn-ghost" style={{ marginTop: 12, minHeight: 48 }} onClick={retry}>Qayta urinish</button>
            <button onClick={() => setAsyncCompose(true)} style={{ color: "var(--accent)", fontSize: 14, fontWeight: 700, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100%" }}>
              Yoki Telegram orqali navbat bilan <Ic name="chevR" size={15} />
            </button>
          </div>
        ) : null}
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

/* ===== Telegram orqali navbatli (async, backendsiz) rejim =====
   token yo'q → compose (kartani yashirib havola yuborish)
   token.ty==="c" → guess (do'st yashirganini sezish)
   token.ty==="r" → result (do'st sezganining natijasi) */
export function AsyncDuo({ myName, token, startMode, onExit }) {
  const initView = token ? (token.ty === "r" ? "result" : "guess") : "compose";
  const [view, setView] = React.useState(initView);
  const [mode, setMode] = React.useState((token && token.m) || startMode || "bw");
  const [secret, setSecret] = React.useState(null);
  const [guess, setGuess] = React.useState(null);
  const [shareMsg, setShareMsg] = React.useState("");
  const options = React.useMemo(() => duoOptions(mode), [mode]);
  const chooserName = token && token.n ? token.n : "Do'stingiz";

  const doShare = async (param, text) => {
    const r = await shareInvite(inviteUrl(param), text);
    setShareMsg(r === "copied" ? "Havola nusxalandi — do'stга yuboring" : r === "shared" ? "" : "Havolani qo'lda yuboring");
  };

  // ---------- Kartani yashirib yuborish ----------
  const composePick = (i) => {
    setSecret(i);
    haptic("warning");
    const tok = encodeToken({ v: 1, ty: "c", m: mode, s: i, n: (myName || "Do'st").slice(0, 20) });
    setView("sent");
    doShare(tok, "Intui — men karta yashirdim, sezib top! 🔮");
  };

  // ---------- Do'st yashirganini sezish ----------
  const guessPick = (i) => {
    setGuess(i);
    const correct = i === token.s;
    haptic(correct ? "success" : "warning");
    setView("reveal");
  };

  if (view === "compose") {
    return (
      <Shell onExit={onExit} title="Kartani yashirish">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: "var(--accent)" }}>Hissiyotingizni yuboring</div>
          <p className="t-sub" style={{ fontSize: 14, marginTop: 6 }}>Yashirin karta tanlang — havola do'stingizga boradi, u sezib topadi.</p>
        </div>
        <div className="t-label" style={{ marginTop: 18, marginBottom: 8 }}>Rejim</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
          {DUO_MODES.map((m) => {
            const on = mode === m.id;
            return (
              <button key={m.id} className="panel row-press" onClick={() => setMode(m.id)} style={{
                padding: "14px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                border: on ? "1.5px solid var(--accent)" : "1px solid var(--stroke-soft)",
                background: on ? "var(--card-2)" : "var(--card)",
              }}>
                <ModeGlyph id={m.id} />
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{m.name}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20 }}>
          <DuoCard mode={mode} card={null} open={false} />
          <DuoChoices mode={mode} options={options} onPick={composePick} disabled={false} />
        </div>
      </Shell>
    );
  }

  if (view === "sent") {
    const card = options[secret];
    const tok = encodeToken({ v: 1, ty: "c", m: mode, s: secret, n: (myName || "Do'st").slice(0, 20) });
    return (
      <Shell onExit={onExit} title="Yuborildi">
        <div style={{ flex: 1 }}></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <DuoCard mode={mode} card={card} open />
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <div style={{ fontSize: 19, fontWeight: 800 }}>Karta yashirildi</div>
            <p className="t-sub" style={{ fontSize: 14, marginTop: 6, maxWidth: 300 }}>Havolani do'stingizga yuboring — u sezib topganda javob qaytaradi.</p>
          </div>
        </div>
        <div style={{ flex: 1 }}></div>
        <GlowButton icon="sparkle" chevron={false} onClick={() => doShare(tok, "Intui — men karta yashirdim, sezib top! 🔮")}>Havolani ulashish</GlowButton>
        {shareMsg ? <p className="t-micro" style={{ textAlign: "center", marginTop: 10 }}>{shareMsg}</p> : null}
        <button className="btn-ghost" style={{ marginTop: 10 }} onClick={onExit}>Tayyor</button>
      </Shell>
    );
  }

  if (view === "guess") {
    return (
      <Shell onExit={onExit} title="Sezgi dueli">
        <div style={{ textAlign: "center" }}>
          <div className="pill" style={{ margin: "0 auto" }}><Ic name="user" size={14} color="var(--accent)" />{chooserName} karta yashirdi</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "var(--accent)", marginTop: 14 }}>Do'stingizni his eting</div>
          <p className="t-sub" style={{ fontSize: 14, marginTop: 6 }}>{chooserName} qaysi kartani tanladi? Ichki sezgingizga quloq soling.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20 }}>
          <DuoCard mode={mode} card={null} open={false} />
          <DuoChoices mode={mode} options={options} onPick={guessPick} disabled={false} />
        </div>
      </Shell>
    );
  }

  if (view === "reveal") {
    const correct = guess === token.s;
    const sc = options[token.s];
    const gc = options[guess];
    const rtok = encodeToken({ v: 1, ty: "r", m: mode, s: token.s, g: guess, c: correct, n: (myName || "Do'st").slice(0, 20) });
    return (
      <Shell onExit={onExit} title="Natija">
        <div style={{ flex: 1 }}></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <DuoCard mode={mode} card={sc} open tone={correct ? "win" : "lose"} />
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: correct ? "var(--good)" : "var(--bad)" }}>{correct ? "To'g'ri sezdingiz! 🎯" : "Bu safar sezmadingiz"}</div>
            <p className="t-sub" style={{ fontSize: 14, marginTop: 6 }}>
              {chooserName} yashirgan: <b style={{ color: "var(--text)" }}>{sc ? sc.label : ""}</b>{" · "}Siz sezgan: <b style={{ color: correct ? "var(--good)" : "var(--bad)" }}>{gc ? gc.label : ""}</b>
            </p>
          </div>
        </div>
        <div style={{ flex: 1 }}></div>
        <GlowButton icon="sparkle" chevron={false} onClick={() => doShare(rtok, correct ? "Sezdim! 🎯 Endi sen top:" : "Bu safar sezmadim. Endi sen top:")}>Natijani do'stга yuborish</GlowButton>
        {shareMsg ? <p className="t-micro" style={{ textAlign: "center", marginTop: 10 }}>{shareMsg}</p> : null}
        <button className="btn-ghost" style={{ marginTop: 10 }} onClick={() => { setSecret(null); setGuess(null); setShareMsg(""); setView("compose"); }}>
          <Ic name="yinyang" size={18} color="var(--accent)" /> Endi men yashiraman
        </button>
      </Shell>
    );
  }

  // view === "result" — do'st sezganining natijasi
  const correct = !!token.c;
  const sc = options[token.s];
  const gc = options[token.g];
  return (
    <Shell onExit={onExit} title="Do'st javobi">
      <div style={{ flex: 1 }}></div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <DuoCard mode={mode} card={sc} open tone={correct ? "win" : "lose"} />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: correct ? "var(--good)" : "var(--bad)" }}>{chooserName} {correct ? "sezdi! 🎯" : "sezmadi"}</div>
          <p className="t-sub" style={{ fontSize: 14, marginTop: 6 }}>
            Siz yashirgan: <b style={{ color: "var(--text)" }}>{sc ? sc.label : ""}</b>{" · "}{chooserName} sezgan: <b style={{ color: correct ? "var(--good)" : "var(--bad)" }}>{gc ? gc.label : ""}</b>
          </p>
        </div>
      </div>
      <div style={{ flex: 1 }}></div>
      <GlowButton icon="yinyang" onClick={() => { setSecret(null); setGuess(null); setShareMsg(""); setView("compose"); }}>Yana o'ynash</GlowButton>
    </Shell>
  );
}
