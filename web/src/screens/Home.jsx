/* ===== Intui — Home + Mode select ===== */
import React from "react";
import * as D from "../data.js";
import { Ic, Logo, Ring, GlowButton, ImgIcon, SectionHead, ModeIcon, DiffPill, asset } from "../ui.jsx";

// "Do'st bilan o'ynash" ikonкаси: agar assets/duo.png yuklangan bo'lsa —
// aynan o'sha rasm; bo'lmasa — vektor ikonка (yiqilmaydi).
function DuoEntryIcon() {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return <div className="mode-tile" style={{ width: 44, height: 44, borderRadius: 14, flex: "none" }}><Ic name="duo" size={24} color="var(--accent)" /></div>;
  }
  return (
    <img src={asset("assets/duo.png")} alt="" draggable={false} onError={() => setFailed(true)}
      style={{ width: 44, height: 44, borderRadius: 14, objectFit: "cover", display: "block", flex: "none" }} />
  );
}

export function HomeScreen({ state, stats, tips, onNav, onStartDaily, onPickMode, onDuo, onTeam }) {
  const todayMin = D.minutesOn(state.sessions, D.todayStr());
  const daily = Math.min(100, state.dailyProgress);
  const tip = tips[0];
  return (
    <div className="screen" data-screen-label="Bosh sahifa">
      <div className="screen-pad">
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: 8 }}>
          <div className="t-micro" style={{ fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10 }}>GLOBAL TRAININGS GROUP</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Logo size={54} />
            <h1 style={{ fontSize: 44, fontWeight: 600, letterSpacing: "0.01em" }}>Intui</h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 16, marginTop: 4 }}>Ichki sezgingizni uyg'oting</p>
        </div>

        <div style={{ marginTop: 22 }}>
          <GlowButton burst={true} onClick={onStartDaily}>Mashqni boshlash</GlowButton>
        </div>

        {/* Do'st bilan o'ynash */}
        <button className="panel row-press" onClick={onDuo} style={{ width: "100%", marginTop: 12, padding: "15px 18px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer", textAlign: "left", border: "1px solid hsla(var(--accent-h),88%,74%,0.3)" }}>
          <DuoEntryIcon />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Do'st bilan o'ynash</div>
            <div className="t-micro" style={{ marginTop: 2 }}>Onlayn sezgi dueli — biri yashiradi, biri sezadi</div>
          </div>
          <Ic name="chevR" size={20} color="var(--faint)" />
        </button>

        {/* Jamoaviy intuitsiya */}
        <button className="panel row-press" onClick={onTeam} style={{ width: "100%", marginTop: 10, padding: "15px 18px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer", textAlign: "left", border: "1px solid hsla(var(--accent-h),88%,74%,0.3)" }}>
          <div className="mode-tile" style={{ width: 44, height: 44, borderRadius: 14, flex: "none", fontSize: 22, display: "grid", placeItems: "center" }}>🍇</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Jamoaviy intuitsiya</div>
            <div className="t-micro" style={{ marginTop: 2 }}>30 kishigacha — dumaloq stol, galma-gal his qilish</div>
          </div>
          <Ic name="chevR" size={20} color="var(--faint)" />
        </button>

        {/* Daily challenge */}
        <div className="panel row-press" onClick={onStartDaily} style={{ marginTop: 18, padding: "20px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ImgIcon name="calendar" size={28} round={true} />
              <span style={{ fontWeight: 700, fontSize: 17 }}>Bugungi challenge</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, margin: "10px 0 10px" }}>100 <span style={{ fontSize: 19, fontWeight: 600, color: "var(--muted)" }}>ta urinish</span></div>
            <div className="hbar" style={{ maxWidth: 240 }}><i style={{ width: daily + "%" }}></i></div>
            <div className="t-micro" style={{ marginTop: 10, fontSize: 13 }}>
              {daily === 0 ? "Bugun hali boshlamadingiz" : daily >= 100 ? "Bugungi challenge bajarildi!" : "Yaxshi davom etyapsiz!"}
            </div>
          </div>
          <Ring size={104} stroke={9} value={daily} max={100}>
            <div style={{ fontSize: 19, fontWeight: 800 }}>{daily}<span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 14 }}>/100</span></div>
          </Ring>
        </div>

        {/* Stat tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          <StatTile img="target" label="Aniqlik"
          big={<span>{stats.accuracy}%{stats.diff !== 0 && stats.total > 0 ? <span style={{ fontSize: 14, fontWeight: 700, color: stats.diff > 0 ? "var(--good)" : "var(--bad)", marginLeft: 6 }}>{stats.diff > 0 ? "+" : ""}{stats.diff}%</span> : null}</span>}
          sub="tasodifga nisbatan" />
          <StatTile img="fire" imgRound={true} label="Streak"
          big={<span>{state.streak} <span style={{ fontSize: 16, fontWeight: 600, color: "var(--muted)" }}>kun</span></span>}
          sub={"bugun " + todayMin + " daqiqa · eng yaxshi: " + state.bestStreak} />
        </div>

        {/* Tavsiya */}
        {tip ?
        <div className="panel row-press" onClick={() => onNav("stats")} style={{ marginTop: 12, padding: 18, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
            <ImgIcon name="brain" size={64} style={{ flex: "none" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--accent)", fontWeight: 700, fontSize: 15 }}>
                <Ic name="sparkle" size={17} /> Tavsiya
              </div>
              <div style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.4, marginTop: 4 }}>{tip.title}</div>
            </div>
            <Ic name="chevR" size={20} color="var(--faint)" />
          </div> :
        null}

        {/* Rejimlar */}
        <SectionHead title="Rejimlar" action="Barchasini ko'rish" onAction={() => onNav("practice")} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 9 }}>
          {D.MODES.slice(0, 4).map((m) =>
          <button key={m.id} className="panel row-press" onClick={() => onPickMode(m)} style={{ padding: "16px 6px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <ModeIcon mode={m} size={50} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</span>
            </button>
          )}
        </div>
      </div>
    </div>);

}

export function StatTile({ icon, tint, img, imgRound, label, big, sub }) {
  return (
    <div className="panel" style={{ padding: "16px 16px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        {img ? <ImgIcon name={img} size={26} round={imgRound} /> : <Ic name={icon} size={20} color={tint} />}
        <span className="t-label">{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 4px" }}>{big}</div>
      <div className="t-micro">{sub}</div>
    </div>);

}

/* ===== Mode select (Mashq tab) ===== */
export function ModeSelectScreen({ onStart, initial }) {
  const [sel, setSel] = React.useState(initial || D.MODES[1].id);
  const [counts, setCounts] = React.useState(() => {
    const o = {};
    D.MODES.forEach((m) => {o[m.id] = m.defaultOptions;});
    return o;
  });
  const mode = D.MODES.find((m) => m.id === sel);
  return (
    <div className="screen" data-screen-label="Rejimni tanlang">
      <div className="screen-pad">
        <div style={{ textAlign: "center", marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Logo size={56} /></div>
          <h1 className="t-title" style={{ marginTop: 10 }}>Rejimni tanlang</h1>
          <p className="t-sub" style={{ marginTop: 4 }}>Sezgingizni turli usullarda sinab ko'ring</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 22 }}>
          {D.MODES.map((m) => {
            const on = m.id === sel;
            return (
              <div key={m.id} className={"panel row-press"} onClick={() => setSel(m.id)} style={{
                padding: "16px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                border: on ? "1.5px solid var(--accent)" : "1px solid var(--stroke-soft)",
                boxShadow: on ? "0 0 0 1px hsla(var(--accent-h),88%,74%,0.3), 0 0 26px hsla(var(--accent-h),88%,70%,0.22)" : "none",
                background: on ? "var(--card-2)" : "var(--card)"
              }}>
                <ModeIcon mode={m} size={56} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{m.name}</span>
                    <DiffPill diff={m.diff} diffClass={m.diffClass} />
                  </div>
                  <div className="t-sub" style={{ fontSize: 13.5, marginTop: 3 }}>{m.desc}</div>
                  {on && m.options.length > 1 ?
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                      <span className="t-micro" style={{ marginRight: 2 }}>Kartalar:</span>
                      {m.options.map((n) =>
                    <button key={n} className={"tag" + (counts[m.id] === n ? " on" : "")}
                    style={{ padding: "6px 13px", fontSize: 13 }}
                    onClick={() => setCounts({ ...counts, [m.id]: n })}>{n}</button>
                    )}
                    </div> :
                  null}
                </div>
                {on ?
                <div className="pop" style={{ width: 30, height: 30, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center", background: "linear-gradient(180deg, hsl(var(--accent-h),85%,76%), hsl(var(--accent-h),70%,58%))", boxShadow: "0 0 14px hsla(var(--accent-h),85%,70%,0.5)" }}>
                    <Ic name="check" size={16} color="#fff" />
                  </div> :
                null}
              </div>);

          })}
        </div>

        {/* Footer sifatida: orqasida qoraytirish bor, kontent ustiga "yalang'och" tushmaydi */}
        <div style={{
          position: "sticky", bottom: "calc(84px + var(--inset-bottom))", zIndex: 10, marginTop: 22,
          padding: "16px 0 8px",
          background: "linear-gradient(180deg, rgba(6,5,14,0) 0%, rgba(6,5,14,0.85) 35%, rgba(6,5,14,0.95) 100%)",
        }}>
          <GlowButton burst={true} onClick={() => onStart(mode, counts[mode.id])}>Davom etish</GlowButton>
        </div>
      </div>
    </div>);

}
