/* ===== Intui — shared UI: icons, logo, nav, primitives ===== */
import React from "react";

// statik fayllar (public/) — base yo'lga moslab
export const asset = (path) => import.meta.env.BASE_URL + path;

// ---------- Icon set (stroke style, mistik) ----------
export function Ic({ name, size = 22, color = "currentColor", style }) {
  const s = { width: size, height: size, display: "block", ...style };
  const sw = 1.8;
  const P = (d, extra) => <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...extra} />;
  const icons = {
    home:
    <g>{P("M4 11.5 12 5l8 6.5")}{P("M6 10.5V19h12v-8.5")}</g>,

    dumbbell:
    <g>{P("M7 9v6M17 9v6M4 10.5v3M20 10.5v3M7 12h10")}</g>,

    chart:
    <g>{P("M6 19V13M12 19V8M18 19V11")}</g>,

    trophy:
    <g>{P("M8 5h8v5a4 4 0 0 1-8 0V5Z")}{P("M8 6H5.5a2.5 2.5 0 0 0 2.6 3.4M16 6h2.5a2.5 2.5 0 0 1-2.6 3.4")}{P("M12 14v3M9 19.5h6")}</g>,

    user:
    <g><circle cx="12" cy="8.5" r="3.2" fill="none" stroke={color} strokeWidth={sw} />{P("M5.5 19.5a6.5 6.5 0 0 1 13 0")}</g>,

    calendar:
    <g><rect x="4.5" y="6" width="15" height="14" rx="3" fill="none" stroke={color} strokeWidth={sw} />{P("M4.5 10.5h15M8.5 4v3.5M15.5 4v3.5")}{P("M9.5 14.5l1.8 1.8 3.4-3.4")}</g>,

    target:
    <g><circle cx="12" cy="12" r="7.5" fill="none" stroke={color} strokeWidth={sw} /><circle cx="12" cy="12" r="3.4" fill="none" stroke={color} strokeWidth={sw} /><circle cx="12" cy="12" r="0.7" fill={color} /></g>,

    fire:
    <g>{P("M12 4.5c.6 2.6-2.8 4.3-2.8 7.2A2.8 2.8 0 0 0 12 14.5c2.4 0 3.4-2.4 2.2-4.4 2.3 1 3.6 3 3.6 5.2a5.8 5.8 0 0 1-11.6 0c0-4.6 4.6-6.3 5.8-10.8Z")}</g>,

    badge:
    <g>{P("M12 3.5l2 1.4 2.4-.2 1 2.2 2.2 1-.2 2.4 1.4 2-1.4 2 .2 2.4-2.2 1-1 2.2-2.4-.2-2 1.4-2-1.4-2.4.2-1-2.2-2.2-1 .2-2.4-1.4-2 1.4-2-.2-2.4 2.2-1 1-2.2 2.4.2 2-1.4Z")}{P("M12 8.8l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3 1-2Z")}</g>,

    diamond:
    <g>{P("M7 5h10l3.5 4.5L12 20 1.5 9.5 5 5h2Z", { d: "M7 5h10l3.5 4.5L12 20 1.5 9.5 5 5Z" })}{P("M1.5 9.5h21M12 20 8 9.5 10.5 5M12 20l4-10.5L13.5 5")}</g>,

    sparkle:
    <g>{P("M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8L12 4Z")}<circle cx="18.5" cy="5" r="1" fill={color} /></g>,

    yinyang:
    <g><circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth={sw} />{P("M12 4a4 4 0 0 1 0 8 4 4 0 0 0 0 8")}<circle cx="12" cy="8" r="1.1" fill={color} /><circle cx="12" cy="16" r="1.1" fill="none" stroke={color} strokeWidth="1.4" /></g>,

    wheel:
    <g><circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth={sw} /><circle cx="12" cy="12" r="2.6" fill="none" stroke={color} strokeWidth={sw} />{P("M12 4v5.4M19.3 8.4l-4.9 2.4M19.3 15.6l-4.9-2.4M12 20v-5.4M4.7 15.6l4.9-2.4M4.7 8.4l4.9 2.4")}</g>,

    hex:
    <g>{P("M12 3.5 19.4 8v8L12 20.5 4.6 16V8L12 3.5Z")}{P("M12 8.2l3.4 2v3.6l-3.4 2-3.4-2v-3.6l3.4-2Z")}</g>,

    bolt:
    <g>{P("M13 3.5 5.5 13.5H11L9.5 20.5 17.5 10H12l1-6.5Z")}</g>,

    lotus:
    <g>{P("M12 5c1.6 2 2.4 4.2 2.4 6.4 0 2.3-1 4.1-2.4 5.1-1.4-1-2.4-2.8-2.4-5.1C9.6 9.2 10.4 7 12 5Z")}{P("M6 8.5c2.4 1 4 3 4.6 5.4-2.7.4-5.2-.7-6.6-2.9.5-1 1.2-1.9 2-2.5Z")}{P("M18 8.5c-2.4 1-4 3-4.6 5.4 2.7.4 5.2-.7 6.6-2.9-.5-1-1.2-1.9-2-2.5Z")}{P("M4.5 14.5c2 2.6 4.6 4 7.5 4s5.5-1.4 7.5-4")}</g>,

    star4:
    <g>{P("M12 3.5c.6 4 2.5 7.9 8.5 8.5-6 .6-7.9 4.5-8.5 8.5-.6-4-2.5-7.9-8.5-8.5 6-.6 7.9-4.5 8.5-8.5Z")}</g>,

    moon:
    <g>{P("M19 14.5A7.5 7.5 0 0 1 9.5 5 7.5 7.5 0 1 0 19 14.5Z")}</g>,

    sun:
    <g><circle cx="12" cy="12" r="4" fill="none" stroke={color} strokeWidth={sw} />{P("M12 3.5V5M12 19v1.5M3.5 12H5M19 12h1.5M6 6l1 1M17 17l1 1M18 6l-1 1M7 17l-1 1")}</g>,

    spiral:
    <g>{P("M12 12.2a1.4 1.4 0 0 0 2.8-.2c0-1.7-1.5-3-3.2-3-2.2 0-4 1.8-4 4.1 0 2.8 2.3 5 5.2 5 3.4 0 6.2-2.8 6.2-6.2C19 8 15.9 5 12 5")}</g>,

    wave:
    <g>{P("M4 12c1.6-2.6 3.2-2.6 4.8 0s3.2 2.6 4.8 0 3.2-2.6 4.8 0")}{P("M4 16.5c1.6-2.6 3.2-2.6 4.8 0s3.2 2.6 4.8 0 3.2-2.6 4.8 0", { opacity: 0.5 })}</g>,

    book:
    <g>{P("M5 6.5A2.5 2.5 0 0 1 7.5 4H19v14H7.5A2.5 2.5 0 0 0 5 20.5V6.5Z")}{P("M5 18a2.5 2.5 0 0 1 2.5-2.5H19M9 8.5h6")}</g>,

    brain:
    <g>{P("M11.5 5A3 3 0 0 0 6 6.5 3.3 3.3 0 0 0 4.5 12 3.3 3.3 0 0 0 6 17.4 3 3 0 0 0 11.5 19V5Z")}{P("M12.5 5A3 3 0 0 1 18 6.5 3.3 3.3 0 0 1 19.5 12 3.3 3.3 0 0 1 18 17.4 3 3 0 0 1 12.5 19V5Z")}{P("M8 9.5h3.5M12.5 14.5H16")}</g>,

    clock:
    <g><circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth={sw} />{P("M12 7.5V12l3 2")}</g>,

    chevR: <g>{P("M9.5 6 15.5 12l-6 6")}</g>,
    chevL: <g>{P("M14.5 6 8.5 12l6 6")}</g>,
    check: <g>{P("M5 12.5l4.5 4.5L19 7.5")}</g>,
    close: <g>{P("M6 6l12 12M18 6 6 18")}</g>,
    question:
    <g><circle cx="12" cy="12" r="8.5" fill="none" stroke={color} strokeWidth={sw} />{P("M9.5 9.5A2.5 2.5 0 1 1 12 12.5v1.2")}<circle cx="12" cy="16.8" r="0.9" fill={color} /></g>,

    pencil:
    <g>{P("M14.5 5.5 18.5 9.5 8.5 19.5H4.5v-4l10-10Z")}{P("M12.8 7.2l4 4")}</g>

  };
  return (
    <svg viewBox="0 0 24 24" style={s} aria-hidden="true">{icons[name] || icons.star4}</svg>);

}

// ---------- Logo (boyqush-niqob) ----------
export function Logo({ size = 64, glow = true }) {
  return (
    <img
      src={asset("assets/icons/owl.webp")}
      alt=""
      draggable={false}
      style={{ width: size, height: size, display: "block", borderRadius: "50%", objectFit: "cover", filter: glow ? "drop-shadow(0 0 18px rgba(140,120,255,0.55))" : "none", pointerEvents: "none", userSelect: "none" }} />);

}

// ---------- Progress ring ----------
export function Ring({ size = 100, stroke = 8, value = 0, max = 100, color, track = "rgba(255,255,255,0.08)", children, glow = true }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, Math.max(0, max ? value / max : 0));
  const col = color || "hsl(var(--accent-h), 85%, 72%)";
  return (
    <div className="ringbox" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - frac)}
        style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)", filter: glow ? `drop-shadow(0 0 6px ${col})` : "none" }} />
      </svg>
      <div className="ring-label">{children}</div>
    </div>);

}

// ---------- Glass icon images (uploads dan kesilgan tugmalar) ----------
export function ImgIcon({ name, size = 24, round = false, style }) {
  return (
    <img
      className="img-ic"
      src={asset("assets/icons/" + name + ".webp")}
      alt=""
      draggable={false}
      style={Object.assign({ width: size, height: size, borderRadius: round ? "50%" : "24%" }, style)} />);

}

// ---------- Bottom navigation ----------
const NAV_IMG = { home: "home", practice: "target", stats: "chart", leaderboard: "trophy", profile: "user" };
export const NAV_ITEMS = [
{ id: "home", label: "Bosh sahifa", icon: "home" },
{ id: "practice", label: "Mashq", icon: "dumbbell" },
{ id: "stats", label: "Statistika", icon: "chart" },
{ id: "leaderboard", label: "Reyting", icon: "trophy" },
{ id: "profile", label: "Profil", icon: "user" }];

export function BottomNav({ active, onNav }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((it) =>
      <button key={it.id} className={"nav-item" + (active === it.id ? " active" : "")} onClick={() => onNav(it.id)}>
          <ImgIcon name={NAV_IMG[it.id]} size={30} round={NAV_IMG[it.id] === "trophy"} />
          <span>{it.label}</span>
        </button>
      )}
    </nav>);

}

// ---------- Small bits ----------
export function NeonBurst() {
  return (
    <span className="neon-burst" aria-hidden="true">
      <span className="nb-sheen"></span>
    </span>);

}

export function GlowButton({ children, onClick, chevron = true, icon = "sparkle", disabled, style, burst = false }) {
  const [bursting, setBursting] = React.useState(false);
  const handleClick = () => {
    if (disabled) return;
    if (!burst) {if (onClick) onClick();return;}
    if (bursting) return;
    setBursting(true);
    setTimeout(() => {if (onClick) onClick();}, 180);
    setTimeout(() => setBursting(false), 450);
  };
  return (
    <button className={"btn-glow" + (bursting ? " bursting" : "")} onClick={handleClick} disabled={disabled} style={style}>
      {icon ? <Ic name={icon} size={22} color="#fff" /> : null}
      <span>{children}</span>
      {chevron ? <span className="chev"><Ic name="chevR" size={20} color="#fff" /></span> : null}
      {bursting ? <NeonBurst /> : null}
    </button>);

}

export function DiffPill({ diff, diffClass }) {
  return (
    <span className={"pill pill-" + diffClass}>
      {diff}
      <span className="dot"></span>
    </span>);

}

export function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Orqaga" style={{
      width: 46, height: 46, borderRadius: 15, display: "grid", placeItems: "center",
      background: "var(--card)", border: "1px solid var(--stroke-soft)", flex: "none"
    }}>
      <Ic name="chevL" size={22} color="var(--muted)" />
    </button>);

}

export function SectionHead({ title, action, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "26px 2px 12px" }}>
      <h2 style={{ fontSize: 22 }}>{title}</h2>
      {action ?
      <button onClick={onAction} style={{ color: "var(--accent)", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
          {action} <Ic name="chevR" size={16} />
        </button> :
      null}
    </div>);

}

// Mode icon — yuklangan rasm-piktogrammalar
const MODE_IMG = { bw: "yinyang", color: "color", shape: "cube", fast: "bolt", first: "star4" };
export function ModeIcon({ mode, size = 26 }) {
  const img = MODE_IMG[mode.id];
  if (img) return <ImgIcon name={img} size={size} />;
  return <Ic name={mode.icon} size={size} color="var(--accent)" />;
}

// Shape glyph for shape cards
export function ShapeGlyph({ shape, size = 40, color = "#cdc2ff" }) {
  const sw = 2.4;
  const shapes = {
    circle: <circle cx="24" cy="24" r="14" fill="none" stroke={color} strokeWidth={sw} />,
    triangle: <path d="M24 9 39 37H9L24 9Z" fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" />,
    square: <rect x="11" y="11" width="26" height="26" rx="3" fill="none" stroke={color} strokeWidth={sw} />,
    star: <path d="M24 8l4.5 9.6 10.5 1.3-7.8 7.2 2 10.4L24 31.4l-9.2 5.1 2-10.4L9 18.9l10.5-1.3L24 8Z" fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" />,
    spiral: <path d="M24 24.5a2.8 2.8 0 0 0 5.6-.4c0-3.4-3-6-6.4-6-4.4 0-8 3.6-8 8.2 0 5.6 4.6 10 10.4 10 6.8 0 12.4-5.6 12.4-12.4C38 16 31.8 10 24 10" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />,
    moon: <path d="M38 29A15 15 0 0 1 19 10a15 15 0 1 0 19 19Z" fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" />,
    diamond: <path d="M24 8 38 24 24 40 10 24 24 8Z" fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
  };
  return <svg viewBox="0 0 48 48" style={{ width: size, height: size }} aria-hidden="true">{shapes[shape] || shapes.circle}</svg>;
}

// Kayfiyat ikonkasi — "Xotirjam" uchun yuklangan lotus belgisi (mask orqali rang moslanadi)
export function MoodIcon({ mood, size = 18, color }) {
  if (!mood) return null;
  if (mood.icon === "lotus") {
    const c = color || mood.color;
    const m = `url('${asset("assets/icons/mood-lotus.webp")}')`;
    const s = size * 0.82; // lotus belgisi biroz kichikroq turadi
    return <span aria-hidden="true" style={{ width: s, height: s, display: "inline-block", flex: "none", background: c, WebkitMaskImage: m, maskImage: m, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center", fontSize: "12px" }}></span>;
  }
  return <Ic name={mood.icon} size={size} color={color || mood.color} />;
}
