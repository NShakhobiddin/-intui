/* ===== Intui — Eng yaxshi natijalar + Profil ===== */
import React from "react";
import * as D from "../data.js";
import { Ic, Logo, Ring, ImgIcon, SectionHead, ModeIcon, MoodIcon } from "../ui.jsx";

const UZB_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
function fmtDay(dstr) {
  if (!dstr) return "";
  if (dstr === D.todayStr()) return "Bugun";
  const yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  if (dstr === yest) return "Kecha";
  const d = new Date(dstr + "T00:00:00");
  return d.getDate() + "-" + UZB_MONTHS[d.getMonth()];
}
function fmtHour(h) {
  if (h === undefined || h === null) return "";
  return String(h).padStart(2, "0") + ":00";
}
function moodInfo(id) {
  if (!id) return null;
  if (id.startsWith && id.startsWith("c:")) return { label: id.slice(2), icon: "pencil", color: "#9d96c7" };
  return D.MOODS.find((m) => m.id === id) || null;
}

export function LeaderboardScreen({ state, stats }) {
  const ranked = (state.sessions || [])
    .map((s) => ({ ...s, acc: s.total ? Math.round((s.correct / s.total) * 100) : 0 }))
    .sort((a, b) => b.acc - a.acc || b.total - a.total || (a.date < b.date ? 1 : -1))
    .slice(0, 10);
  const best = ranked[0];
  const rest = ranked.slice(1);
  const bestMode = best ? (D.MODES.find((x) => x.id === best.mode) || D.MODES[0]) : null;
  const bestMood = best ? moodInfo(best.mood) : null;

  return (
    <div className="screen" data-screen-label="Eng yaxshi natijalar">
      <div className="screen-pad">
        <div style={{ textAlign: "center", marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Logo size={50} /></div>
          <h1 className="t-title" style={{ marginTop: 8 }}>Eng yaxshi natijalar</h1>
          <p className="t-sub" style={{ marginTop: 3 }}>Shaxsiy rekordlaringiz — qachon va qanday holatda</p>
        </div>

        {!best ? (
          <div className="panel" style={{ marginTop: 26, padding: "34px 22px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><ImgIcon name="trophy" size={64} round={true} /></div>
            <div style={{ fontWeight: 700, fontSize: 17, marginTop: 12 }}>Hozircha natijalar yo'q</div>
            <p className="t-sub" style={{ marginTop: 6, fontSize: 14 }}>Birinchi sessiyani yakunlang — eng yaxshi natijangiz shu yerda ko'rinadi.</p>
          </div>
        ) : (
          <React.Fragment>
            {/* Eng yaxshi natija */}
            <div className="panel" style={{ marginTop: 22, padding: "20px 18px", border: "1px solid hsla(var(--accent-h),88%,74%,0.35)", background: "var(--card-2)", boxShadow: "0 0 30px hsla(var(--accent-h),88%,70%,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <Ring size={104} stroke={9} value={best.acc} max={100}>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>{best.acc}%</div>
                    <div className="t-micro">aniqlik</div>
                  </div>
                </Ring>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t-micro" style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 800, letterSpacing: "0.08em", color: "var(--accent)" }}>
                    <ImgIcon name="trophy" size={22} round={true} /> ENG YAXSHI NATIJA
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                    <ModeIcon mode={bestMode} size={22} />
                    <span style={{ fontSize: 19, fontWeight: 800 }}>{bestMode.name}</span>
                  </div>
                  <div className="t-sub" style={{ fontSize: 13.5, marginTop: 4 }}>{best.correct}/{best.total} to'g'ri · {best.n} karta</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                <span className="pill" style={{ fontSize: 12.5 }}><Ic name="calendar" size={14} color="var(--accent)" />{fmtDay(best.date)}</span>
                <span className="pill" style={{ fontSize: 12.5 }}><Ic name="clock" size={14} color="var(--accent)" />{fmtHour(best.hour)} atrofida</span>
                {bestMood ? <span className="pill" style={{ fontSize: 12.5 }}><MoodIcon mood={bestMood} size={14} />{bestMood.label}</span> : null}
              </div>
            </div>

            {/* Qolgan rekordlar */}
            {rest.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 16 }}>
                {rest.map((r, i) => {
                  const m = D.MODES.find((x) => x.id === r.mode) || D.MODES[0];
                  const mood = moodInfo(r.mood);
                  return (
                    <div key={r.date + "-" + i} className="panel" style={{ padding: "12px 15px", display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 24, textAlign: "center", fontWeight: 800, color: "var(--faint)", fontSize: 15, flex: "none" }}>{i + 2}</span>
                      <span style={{ flex: "none", display: "grid", placeItems: "center" }}><ModeIcon mode={m} size={22} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{m.name} · {r.correct}/{r.total}</div>
                        <div className="t-micro" style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 3 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Ic name="calendar" size={12} color="var(--faint)" />{fmtDay(r.date)}</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Ic name="clock" size={12} color="var(--faint)" />{fmtHour(r.hour)}</span>
                          {mood ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MoodIcon mood={mood} size={12} />{mood.label}</span> : null}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flex: "none" }}>
                        <div style={{ fontWeight: 800, fontSize: 17, color: r.acc >= 60 ? "var(--good)" : "var(--text)" }}>{r.acc}%</div>
                        <div className="t-micro">aniqlik</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

export function Avatar({ nick, size = 48, me, crown }) {
  const hue = me ? "var(--accent-h)" : String((hashStr(nick) % 360));
  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      {crown ? (
        <svg viewBox="0 0 24 24" style={{ position: "absolute", top: -size * 0.32, left: "50%", transform: "translateX(-50%)", width: size * 0.42 }}>
          <path d="M5 17 3.5 8l5 3.5L12 5l3.5 6.5 5-3.5L19 17H5Z" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" strokeLinejoin="round" />
        </svg>
      ) : null}
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%", display: "grid", placeItems: "center",
        fontWeight: 800, fontSize: size * 0.38, color: "#fff",
        background: `radial-gradient(circle at 35% 28%, hsl(${hue}, 70%, 68%), hsl(${hue}, 60%, 42%))`,
        border: me ? "2px solid var(--accent)" : "2px solid rgba(167,155,255,0.25)",
        boxShadow: me ? "0 0 16px hsla(var(--accent-h),88%,70%,0.45)" : "none",
      }}>
        {nick.slice(0, 1).toUpperCase()}
      </div>
    </div>
  );
}
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/* ===== Profil ===== */
export function ProfileScreen({ state, stats, onRename, onReset }) {
  const todayMin = D.minutesOn(state.sessions, D.todayStr());
  const [editing, setEditing] = React.useState(false);
  const [nick, setNick] = React.useState(state.nickname || "");
  const earned = new Set(state.badges);
  const journal = [...state.journal].reverse().slice(0, 6);

  return (
    <div className="screen" data-screen-label="Profil">
      <div className="screen-pad">
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: 10 }}>
          <Avatar nick={state.nickname || "S"} size={86} me={true} />
          {!editing ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <h1 style={{ fontSize: 26 }}>{state.nickname || "Mehmon"}</h1>
              <button onClick={() => { setNick(state.nickname || ""); setEditing(true); }} aria-label="Tahrirlash" style={{ opacity: 0.6, padding: 6 }}>
                <Ic name="pencil" size={17} color="var(--muted)" />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 14, width: "100%", maxWidth: 300 }}>
              <input className="field" value={nick} maxLength={20} autoFocus onChange={(e) => setNick(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && nick.trim().length >= 2) { onRename(nick.trim()); setEditing(false); } }}
                style={{ minHeight: 48, fontSize: 16 }} />
              <button className="btn-ghost" style={{ width: 56, minHeight: 48, flex: "none" }}
                onClick={() => { if (nick.trim().length >= 2) { onRename(nick.trim()); } setEditing(false); }}>
                <Ic name="check" size={20} color="var(--accent)" />
              </button>
            </div>
          )}
          <div className="pill" style={{ marginTop: 10, color: "var(--accent)" }}>
            <Ic name="fire" size={15} color="#f59e0b" /> {state.streak} kunlik streak
          </div>
        </div>

        {/* Ko'rsatkichlar */}
        <div className="panel" style={{ marginTop: 20, padding: "18px 18px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <ProfileMini icon="fire" tint="#f59e0b" value={state.streak + " kun"} label="streak" />
            <ProfileMini icon="clock" tint="var(--accent)" value={todayMin + " daqiqa"} label="bugungi mashq" divider />
            <ProfileMini icon="target" tint="var(--accent)" value={stats.accuracy + "%"} label="aniqlik" />
            <ProfileMini icon="chart" tint="var(--cyan)" value={String(stats.total)} label="urinish" divider />
          </div>
        </div>

        {/* Badges */}
        <SectionHead title="Yutuqlar" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {D.BADGES.map((b) => {
            const on = earned.has(b.id);
            return (
              <div key={b.id} className="panel" style={{ padding: "16px 14px", display: "flex", gap: 12, alignItems: "flex-start", opacity: on ? 1 : 0.55 }}>
                <div className="mode-tile" style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: on ? "radial-gradient(120% 100% at 50% 0%, hsla(var(--accent-h),85%,70%,0.4), hsla(var(--accent-h),85%,70%,0.12))" : undefined,
                  boxShadow: on ? "0 0 16px hsla(var(--accent-h),88%,70%,0.3)" : "none",
                }}>
                  {["bolt","lotus","yinyang","color","cube","star4","home","user","shield","target","chart","owl","trophy","calendar","fire","brain","diamond","journal"].includes(b.icon)
                    ? <ImgIcon name={b.icon} size={30} round={["trophy","calendar","fire","diamond","journal","owl"].includes(b.icon)} style={{ filter: on ? "none" : "grayscale(0.7) opacity(0.7)" }} />
                    : <Ic name={b.icon} size={21} color={on ? "var(--accent)" : "var(--faint)"} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{b.name}</div>
                  <div className="t-micro" style={{ marginTop: 3, lineHeight: 1.45 }}>{b.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Journal */}
        <SectionHead title="Sezgi jurnali" />
        {journal.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {journal.map((j, i) => {
              const mood = D.MOODS.find((m) => m.id === j.mood) || (j.mood && j.mood.startsWith && j.mood.startsWith("c:") ? { label: j.mood.slice(2), icon: "pencil", color: "#9d96c7" } : null);
              return (
                <div key={i} className="panel" style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {mood ? <MoodIcon mood={mood} size={17} /> : null}
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{mood ? mood.label : ""}</span>
                    <span className="t-micro" style={{ marginLeft: "auto" }}>{j.date}</span>
                  </div>
                  {j.tags && j.tags.length ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
                      {j.tags.map((t) => <span key={t} className="pill" style={{ fontSize: 12, padding: "5px 11px", color: "var(--muted)" }}>{t}</span>)}
                    </div>
                  ) : null}
                  {j.note ? <p className="t-sub" style={{ fontSize: 13.5, marginTop: 8 }}>{j.note}</p> : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="panel" style={{ padding: 18, textAlign: "center" }}>
            <p className="t-sub" style={{ fontSize: 14 }}>Jurnal hali bo'sh. Sessiya yakunida yozuv qoldirishingiz mumkin.</p>
          </div>
        )}

        {/* Danger zone */}
        <div style={{ marginTop: 26 }}>
          <button className="btn-ghost" style={{ color: "var(--bad)", borderColor: "rgba(251,113,133,0.25)" }} onClick={onReset}>
            <Ic name="close" size={18} color="var(--bad)" />
            Progressni tozalash
          </button>
          <p className="t-micro" style={{ textAlign: "center", marginTop: 12 }}>Intui v1.0 · Ma'lumotlar faqat qurilmangizda saqlanadi</p>
        </div>
      </div>
    </div>
  );
}

function ProfileMini({ icon, tint, value, label, divider }) {
  return (
    <div style={{ textAlign: "center", borderLeft: divider ? "1px solid var(--stroke-soft)" : "none" }}>
      <div style={{ display: "flex", justifyContent: "center" }}><Ic name={icon} size={18} color={tint} /></div>
      <div style={{ fontWeight: 800, fontSize: 17, marginTop: 5 }}>{value}</div>
      <div className="t-micro">{label}</div>
    </div>
  );
}
