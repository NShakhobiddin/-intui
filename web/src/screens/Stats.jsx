/* ===== Intui — Statistika ===== */
import React from "react";
import * as D from "../data.js";
import { Ic, Logo, Ring, ImgIcon, ModeIcon, MoodIcon } from "../ui.jsx";

export function StatsScreen({ state, demoMerged }) {
  const [period, setPeriod] = React.useState("week");
  const stats = React.useMemo(() => D.computeStats(demoMerged, period), [demoMerged, period]);
  const tips = React.useMemo(() => D.aiTips(stats, state), [stats, state]);
  const yest = React.useMemo(() => {
    // compare vs previous period quickly: accuracy delta vs chance as proxy
    return stats.diff;
  }, [stats]);

  return (
    <div className="screen" data-screen-label="Statistika">
      <div className="screen-pad">
        <div style={{ textAlign: "center", marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Logo size={50} /></div>
          <h1 className="t-title" style={{ marginTop: 8 }}>Statistika</h1>
          <p className="t-sub" style={{ marginTop: 3 }}>Sezgiy natijalaringiz tahlili</p>
        </div>

        <div className="seg" style={{ marginTop: 20 }}>
          {[["today", "Bugun"], ["week", "Hafta"], ["month", "Oy"]].map(([id, label]) => (
            <button key={id} className={period === id ? "on" : ""} onClick={() => setPeriod(id)}>{label}</button>
          ))}
        </div>

        {/* Accuracy vs chance */}
        <div className="panel" style={{ marginTop: 14, padding: "22px 18px", display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span className="t-label">Umumiy aniqlik</span>
            <Ring size={128} stroke={10} value={stats.accuracy} max={100}>
              <div>
                <div style={{ fontSize: 34, fontWeight: 800 }}>{stats.accuracy}<span style={{ fontSize: 18 }}>%</span></div>
              </div>
            </Ring>
            <div className="t-micro" style={{ color: yest >= 0 ? "var(--good)" : "var(--bad)", fontWeight: 700 }}>
              {yest >= 0 ? "↑ +" + yest : "↓ " + yest}% tasodifga nisbatan
            </div>
          </div>
          <div style={{ background: "var(--stroke-soft)", height: "80%" }}></div>
          <div style={{ textAlign: "center" }}>
            <div className="t-label">Tasodifiy ehtimol</div>
            <div style={{ fontSize: 42, fontWeight: 800, margin: "10px 0 6px", color: "var(--muted)" }}>{stats.chance}<span style={{ fontSize: 20 }}>%</span></div>
            <div className="t-micro" style={{ lineHeight: 1.5 }}>
              {stats.total} urinish asosida{stats.diff > 0 ? <span><br />o'rtacha natijadan <b style={{ color: "var(--good)" }}>{stats.diff}% yuqori</b></span> : null}
            </div>
          </div>
        </div>

        {/* By hour chart */}
        <div className="panel" style={{ marginTop: 12, padding: "18px 16px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Ic name="chart" size={19} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: 16 }}>Vaqt bo'yicha</span>
            </div>
            <span className="t-micro">Aniqlik %</span>
          </div>
          <HourChart data={stats.byHour} />
        </div>

        {/* By mood */}
        <div className="panel" style={{ marginTop: 12, padding: "18px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Ic name="brain" size={19} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: 16 }}>Holat bo'yicha</span>
            </div>
            <span className="t-micro">Aniqlik %</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {stats.byMood.length ? stats.byMood.map((m) => (
              <div key={m.mood.id} style={{ display: "grid", gridTemplateColumns: "120px 1fr 48px", alignItems: "center", gap: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 600 }}>
                  <MoodIcon mood={m.mood} size={18} /> {m.mood.label}
                </span>
                <div className="hbar">
                  <i style={{ width: m.acc + "%", background: m.acc < stats.chance ? "linear-gradient(90deg, #fb7185, #f43f5e)" : undefined, boxShadow: m.acc < stats.chance ? "0 0 10px rgba(251,113,133,0.5)" : undefined }}></i>
                </div>
                <span style={{ textAlign: "right", fontWeight: 800, fontSize: 16, color: m.acc < stats.chance ? "var(--bad)" : "var(--accent)" }}>{m.acc}%</span>
              </div>
            )) : <p className="t-sub" style={{ fontSize: 14 }}>Hozircha ma'lumot yo'q — mashqdan oldin kayfiyatingizni belgilang.</p>}
          </div>
        </div>

        {/* By mode */}
        <div className="panel" style={{ marginTop: 12, padding: "18px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
            <Ic name="hex" size={19} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Rejimlar bo'yicha</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {stats.byMode.map((m) => (
              <div key={m.mode.id} style={{ display: "grid", gridTemplateColumns: "150px 1fr 48px", alignItems: "center", gap: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 600 }}>
                  <ModeIcon mode={m.mode} size={18} /> {m.mode.name.length > 14 ? m.mode.name.slice(0, 13) + "…" : m.mode.name}
                </span>
                <div className="hbar"><i style={{ width: m.acc + "%" }}></i></div>
                <span style={{ textAlign: "right", fontWeight: 800, fontSize: 16, color: "var(--accent)" }}>{m.acc}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* First choice */}
        {stats.firstChoice.unchangedAcc !== null && stats.firstChoice.changedAcc !== null ? (
          <div className="panel" style={{ marginTop: 12, padding: "18px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <Ic name="star4" size={19} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: 16 }}>Birinchi tanlov tahlili</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ textAlign: "center", padding: "14px 8px", borderRadius: 16, background: "rgba(255,255,255,0.035)", border: "1px solid var(--stroke-soft)" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)" }}>{stats.firstChoice.unchangedAcc}%</div>
                <div className="t-micro" style={{ marginTop: 4 }}>tanlov o'zgartirilmaganda</div>
              </div>
              <div style={{ textAlign: "center", padding: "14px 8px", borderRadius: 16, background: "rgba(255,255,255,0.035)", border: "1px solid var(--stroke-soft)" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--muted)" }}>{stats.firstChoice.changedAcc}%</div>
                <div className="t-micro" style={{ marginTop: 4 }}>tanlov o'zgartirilganda</div>
              </div>
            </div>
          </div>
        ) : null}

        {/* AI tahlil */}
        <div className="panel" style={{ marginTop: 12, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            <Ic name="sparkle" size={18} /> AI tahlil
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {tips.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                {["lotus", "star4", "fire", "calendar", "target", "chart", "brain", "bolt"].includes(t.icon)
                  ? <ImgIcon name={t.icon} size={44} round={["fire", "calendar"].includes(t.icon)} style={{ flex: "none" }} />
                  : <div className="mode-tile" style={{ width: 44, height: 44, borderRadius: 14 }}><Ic name={t.icon} size={21} color="var(--accent)" /></div>}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15.5, lineHeight: 1.4 }}>{t.title}</div>
                  <div className="t-sub" style={{ fontSize: 13.5, marginTop: 2 }}>{t.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="t-micro" style={{ textAlign: "center", margin: "18px 20px 0", lineHeight: 1.6 }}>
          Eslatma: natijalar ilmiy xulosa emas — bu o'z-o'zini kuzatish va diqqat mashqi vositasi.
        </p>
      </div>
    </div>
  );
}

/* SVG area chart: aniqlik by hour bucket */
export function HourChart({ data }) {
  const W = 360, H = 150, padL = 30, padB = 24, padT = 10;
  const innerW = W - padL - 8, innerH = H - padT - padB;
  const pts = data.map((d, i) => ({
    x: padL + (i / (data.length - 1)) * innerW,
    y: d.acc === null ? null : padT + innerH * (1 - d.acc / 100),
    acc: d.acc, label: d.label,
  }));
  const drawn = pts.filter((p) => p.y !== null);
  const path = drawn.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ");
  const area = drawn.length ? path + ` L ${drawn[drawn.length - 1].x.toFixed(1)} ${padT + innerH} L ${drawn[0].x.toFixed(1)} ${padT + innerH} Z` : "";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <defs>
        <linearGradient id="hc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(var(--accent-h), 85%, 70%)" stopOpacity="0.35" />
          <stop offset="1" stopColor="hsl(var(--accent-h), 85%, 70%)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((v) => {
        const y = padT + innerH * (1 - v / 100);
        return (
          <g key={v}>
            <line x1={padL} x2={W - 8} y1={y} y2={y} stroke="rgba(167,155,255,0.1)" strokeWidth="1" strokeDasharray={v === 0 ? "" : "3 4"} />
            <text x={padL - 7} y={y + 3.5} textAnchor="end" fontSize="9.5" fill="var(--faint)" fontFamily="inherit">{v}</text>
          </g>
        );
      })}
      {drawn.length ? <path d={area} fill="url(#hc-fill)" /> : null}
      {drawn.length ? <path d={path} fill="none" stroke="hsl(var(--accent-h), 85%, 72%)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 5px hsla(var(--accent-h),85%,70%,0.6))" }} /> : null}
      {drawn.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.4" fill="hsl(var(--accent-h), 85%, 78%)" stroke="#0c0a1e" strokeWidth="1.5" />
      ))}
      {pts.map((p, i) => (
        i % 2 === 0 || data.length <= 5 ? <text key={"l" + i} x={p.x} y={H - 6} textAnchor="middle" fontSize="9.5" fill="var(--faint)" fontFamily="inherit">{p.label}</text> : null
      ))}
      {drawn.length === 0 ? <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="inherit">Bu davr uchun ma'lumot yo'q</text> : null}
    </svg>
  );
}
