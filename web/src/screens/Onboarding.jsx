/* ===== Intui — onboarding: Welcome, HowItWorks, Nickname ===== */
import React from "react";
import { Ic, Logo, GlowButton, ImgIcon } from "../ui.jsx";

export function WelcomeScreen({ onStart }) {
  const [showHow, setShowHow] = React.useState(false);
  return (
    <div className="screen" data-screen-label="Welcome">
      <div className="screen-pad-nonav" style={{ display: "flex", flexDirection: "column", minHeight: "100%", textAlign: "center", alignItems: "center" }}>
        <div style={{ flex: 1 }}></div>
        <div className="pulse"><Logo size={110} /></div>
        <h1 className="t-hero" style={{ marginTop: 18 }}>Intui</h1>
        <p style={{ color: "var(--accent)", fontSize: 19, fontWeight: 600, marginTop: 6 }}>Ichki sezgingizni uyg'oting</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0", width: 180 }}>
          <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(167,155,255,0.4))" }}></span>
          <Ic name="star4" size={16} color="var(--accent)" />
          <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(167,155,255,0.4), transparent)" }}></span>
        </div>
        <p className="t-sub" style={{ maxWidth: 280, fontSize: 17 }}>Kartalar orqali ichki sezgingizni mashq qiling.</p>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <GlowButton onClick={onStart}>Boshlash</GlowButton>
          <button className="btn-ghost" onClick={() => setShowHow(true)}>
            <Ic name="question" size={21} color="var(--accent)" />
            Qanday ishlaydi?
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 16px", width: "100%" }}>
          <span style={{ flex: 1, height: 1, background: "var(--stroke-soft)" }}></span>
          <span style={{ fontSize: 12, letterSpacing: "0.28em", color: "var(--faint)", fontWeight: 700 }}>SIZ UCHUN</span>
          <span style={{ flex: 1, height: 1, background: "var(--stroke-soft)" }}></span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, width: "100%" }}>
          <WelcomeFeature icon="calendar" title="Kunlik challenge" sub="Har kuni yangi karta va maqsad." />
          <WelcomeFeature icon="chart" title="Chuqur statistika" sub="Progressingizni kuzatib boring." />
          <WelcomeFeature icon="brain" title="AI tavsiyalar" sub="Sizga mos yo'l va tavsiyalar." />
        </div>
      </div>
      {showHow ? <HowSheet onClose={() => setShowHow(false)} /> : null}
    </div>
  );
}

const ONB_IMG = ["calendar", "chart", "brain", "target", "fire", "trophy", "journal", "diamond"];
const ONB_ROUND = ["calendar", "fire", "trophy", "journal", "diamond"];
function WelcomeFeature({ icon, title, sub }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {ONB_IMG.includes(icon)
        ? <ImgIcon name={icon} size={62} round={ONB_ROUND.includes(icon)} />
        : <div className="mode-tile" style={{ width: 62, height: 62 }}><Ic name={icon} size={28} color="var(--accent)" /></div>}
      <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
      <div className="t-micro" style={{ lineHeight: 1.45 }}>{sub}</div>
    </div>
  );
}

function HowSheet({ onClose }) {
  const steps = [
    { icon: "sparkle", t: "Tizim yashirincha tanlaydi", s: "Har urinishda tizim siz tanlashingizdan oldin bitta kartani random belgilaydi." },
    { icon: "target", t: "Siz sezasiz", s: "Ichki sezgingizga quloq solib, qaysi karta tanlanganini toping." },
    { icon: "chart", t: "Natija tahlilga aylanadi", s: "Aniqligingiz vaqt, kayfiyat va rejim bo'yicha statistikada ko'rinadi." },
    { icon: "fire", t: "Har kuni qaytib keling", s: "Daily challenge va streak sizni rivojlantirib boradi." },
  ];
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end",
      background: "rgba(4,3,12,0.7)", backdropFilter: "blur(4px)", animation: "screen-in 0.25s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "linear-gradient(180deg, #161330, #0c0a1e)", borderRadius: "28px 28px 0 0",
        border: "1px solid var(--stroke)", borderBottom: "none", padding: "14px 22px calc(34px + var(--inset-bottom))",
      }}>
        <div style={{ width: 44, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.15)", margin: "0 auto 18px" }}></div>
        <h2 style={{ fontSize: 24, marginBottom: 18 }}>Qanday ishlaydi?</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {steps.map((st, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              {ONB_IMG.includes(st.icon)
                ? <ImgIcon name={st.icon} size={46} round={ONB_ROUND.includes(st.icon)} style={{ flex: "none" }} />
                : <div className="mode-tile" style={{ width: 46, height: 46, borderRadius: 14 }}><Ic name={st.icon} size={22} color="var(--accent)" /></div>}
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{st.t}</div>
                <div className="t-sub" style={{ fontSize: 14, marginTop: 2 }}>{st.s}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 22 }}>
          <GlowButton onClick={onClose} icon={null} chevron={false}>Tushunarli</GlowButton>
        </div>
      </div>
    </div>
  );
}

export function NicknameScreen({ onDone }) {
  const [nick, setNick] = React.useState("");
  const valid = nick.trim().length >= 2;
  return (
    <div className="screen" data-screen-label="Nickname">
      <div className="screen-pad-nonav" style={{ display: "flex", flexDirection: "column", minHeight: "100%", alignItems: "center", textAlign: "center" }}>
        <div style={{ flex: 1 }}></div>
        <Logo size={84} />
        <h1 className="t-title" style={{ marginTop: 20 }}>Sizni qanday chaqiraylik?</h1>
        <p className="t-sub" style={{ marginTop: 8, maxWidth: 290 }}>Telefon raqam yoki email shart emas — nickname yetarli.</p>
        <div style={{ width: "100%", marginTop: 28 }}>
          <input
            className="field"
            placeholder="Nickname kiriting"
            value={nick}
            maxLength={20}
            onChange={(e) => setNick(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && valid) onDone(nick.trim()); }}
            style={{ textAlign: "center" }}
          />
          <div className="t-micro" style={{ marginTop: 10 }}>Kamida 2 ta belgi</div>
        </div>
        <div style={{ flex: 1.4 }}></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <GlowButton onClick={() => onDone(nick.trim())} disabled={!valid}>Davom etish</GlowButton>
          <button className="btn-ghost" onClick={() => onDone(null)}>Mehmon sifatida davom etish</button>
        </div>
      </div>
    </div>
  );
}
