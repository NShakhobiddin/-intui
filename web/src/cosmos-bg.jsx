/* ===== Intui — Kosmik animatsion fon (cosmos.png + jonli qatlamlar) =====
   Yengil versiya: umumiy rAF soat (~30fps), 30s muammosiz loop. */
import React from "react";
import { asset } from "./ui.jsx";

const CLOOP = 30;
const CTAU = Math.PI * 2;
const CCX = 470;
const CCY = 655;

const CEase = {
  easeOutQuad: (p) => 1 - (1 - p) * (1 - p),
  easeInQuad: (p) => p * p,
};

function cosmosRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// umumiy soat — bitta rAF, hamma obunachilar.
// Batareya/qizishni kamaytirish uchun: ~16fps va sahifa ko'rinmay
// qolганда (boshqa chatga o'tilса) animatsiya butunlay to'xtaydi.
const FRAME_MS = 62; // ~16fps — sekin ambient fon uchun yetarli
const CosmosClock = (() => {
  const subs = new Set();
  let raf = null, t0 = 0, last = 0;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < FRAME_MS) return;
    last = now;
    const t = ((now - t0) / 1000) % CLOOP;
    subs.forEach((fn) => fn(t));
  }
  function start() {
    if (raf || !subs.size) return;
    if (typeof document !== "undefined" && document.hidden) return;
    t0 = performance.now(); last = 0;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });
  }
  return {
    sub(fn) {
      subs.add(fn);
      start();
      return () => {
        subs.delete(fn);
        if (!subs.size) stop();
      };
    },
  };
})();

const cosmosReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useCosmosTime() {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (cosmosReduced) return;
    return CosmosClock.sub(setT);
  }, []);
  return t;
}

function CSprite({ start, end, children }) {
  const t = useCosmosTime();
  if (t < start || t > end) return null;
  return children({ progress: (t - start) / (end - start) });
}

// ── Asos rasm: nafas oluvchi Ken Burns ──
function CosmosBase() {
  const t = useCosmosTime();
  const scale = 1.07 + 0.045 * Math.sin(CTAU * (t / CLOOP));
  const driftY = 10 * Math.sin(CTAU * (t / CLOOP) + Math.PI / 3);
  return (
    <img src={asset("assets/cosmos.webp")} alt="" style={{
      position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
      transform: `scale(${scale}) translateY(${driftY}px)`, transformOrigin: "50% 42%", willChange: "transform",
    }} />
  );
}

// ── Miltillovchi yulduzlar ──
const CSTARS = (() => {
  const rand = cosmosRand(42);
  const out = [];
  for (let i = 0; i < 34; i++) {
    out.push({
      x: rand() * 941, y: rand() * 1150,
      size: 1 + rand() * 2.6,
      k: 3 + Math.floor(rand() * 8),
      phase: rand() * CTAU,
      base: 0.15 + rand() * 0.35,
    });
  }
  return out;
})();

function CosmosTwinkles() {
  const t = useCosmosTime();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {CSTARS.map((s, i) => {
        const tw = 0.5 + 0.5 * Math.sin(CTAU * s.k * (t / CLOOP) + s.phase);
        const o = s.base + 0.65 * tw * tw;
        return (
          <div key={i} style={{
            position: "absolute", left: s.x, top: s.y, width: s.size, height: s.size,
            borderRadius: "50%", background: "#fff", opacity: o,
            boxShadow: `0 0 ${s.size * 3}px ${s.size}px rgba(210,200,255,${o * 0.35})`,
          }} />
        );
      })}
    </div>
  );
}

// ── Markaziy yulduz: pulslanuvchi nur + xoch chaqnash ──
function CosmosCoreGlow() {
  const t = useCosmosTime();
  const pulse = 0.5 + 0.5 * Math.sin(CTAU * 3 * (t / CLOOP));
  const slow = 0.5 + 0.5 * Math.sin(CTAU * (t / CLOOP) - Math.PI / 2);
  const r = 120 + 50 * pulse + 30 * slow;
  const o = 0.45 + 0.4 * pulse;
  const flare = 0.25 + 0.45 * pulse;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", left: CCX, top: CCY, width: r * 2, height: r * 2,
        marginLeft: -r, marginTop: -r, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,245,225,0.85) 0%, rgba(216,180,255,0.30) 35%, rgba(150,110,255,0.10) 60%, transparent 75%)",
        opacity: o, filter: "blur(2px)", mixBlendMode: "screen",
      }} />
      <div style={{
        position: "absolute", left: CCX - 230, top: CCY - 1, width: 460, height: 2,
        background: "linear-gradient(90deg, transparent, rgba(255,240,220,0.9), transparent)",
        opacity: flare, mixBlendMode: "screen",
      }} />
      <div style={{
        position: "absolute", left: CCX - 1, top: CCY - 170, width: 2, height: 340,
        background: "linear-gradient(180deg, transparent, rgba(255,240,220,0.85), transparent)",
        opacity: flare * 0.9, mixBlendMode: "screen",
      }} />
    </div>
  );
}

// ── Aylanuvchi muqaddas geometriya ──
function CosmosGeometry() {
  const t = useCosmosTime();
  const rotA = (t / CLOOP) * 360;
  const rotB = -(t / CLOOP) * 360;
  const breathe = 0.5 + 0.5 * Math.sin(CTAU * 2 * (t / CLOOP));
  const o = 0.10 + 0.14 * breathe;
  const stroke = "rgba(225,215,255,0.9)";
  return (
    <svg width="941" height="1672" viewBox="0 0 941 1672" style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen" }}>
      <g opacity={o}>
        <g transform={`rotate(${rotA} ${CCX} ${CCY})`} stroke={stroke} fill="none" strokeWidth="1">
          <circle cx={CCX} cy={CCY} r="150" strokeDasharray="2 10"></circle>
          <circle cx={CCX} cy={CCY} r="300" strokeDasharray="1 14"></circle>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle key={a} cx={CCX + 95 * Math.cos((a * Math.PI) / 180)} cy={CCY + 95 * Math.sin((a * Math.PI) / 180)} r="95" opacity="0.5"></circle>
          ))}
        </g>
        <g transform={`rotate(${rotB} ${CCX} ${CCY})`} stroke={stroke} fill="none" strokeWidth="0.8">
          <circle cx={CCX} cy={CCY} r="225" strokeDasharray="40 24"></circle>
          <circle cx={CCX} cy={CCY} r="385" strokeDasharray="3 22" opacity="0.7"></circle>
          {[45, 135, 225, 315].map((a) => (
            <circle key={a} cx={CCX + 225 * Math.cos((a * Math.PI) / 180)} cy={CCY + 225 * Math.sin((a * Math.PI) / 180)} r="4" fill={stroke} stroke="none"></circle>
          ))}
        </g>
      </g>
    </svg>
  );
}

// ── Kengayuvchi radar halqalari ──
function CosmosPulseRings() {
  const t = useCosmosTime();
  const PERIOD = 6;
  const rings = [0, 0.5].map((offset) => {
    const p = (t / PERIOD + offset) % 1;
    return { r: 60 + p * 520, o: 0.35 * (1 - p) * (1 - p) };
  });
  return (
    <svg width="941" height="1672" viewBox="0 0 941 1672" style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen" }}>
      {rings.map((ring, i) => (
        <circle key={i} cx={CCX} cy={CCY} r={ring.r} fill="none" stroke="rgba(200,185,255,0.9)" strokeWidth="1.2" opacity={ring.o}></circle>
      ))}
    </svg>
  );
}

// ── Uchar yulduzlar ──
function CosmosShootingStar({ start, x0, y0, angleDeg, length = 900 }) {
  const DUR = 1.1;
  return (
    <CSprite start={start} end={start + DUR}>
      {({ progress }) => {
        const e = CEase.easeOutQuad(progress);
        const a = (angleDeg * Math.PI) / 180;
        const dx = Math.cos(a) * length * e;
        const dy = Math.sin(a) * length * e;
        const fade = progress < 0.15 ? progress / 0.15 : 1 - CEase.easeInQuad((progress - 0.15) / 0.85);
        return (
          <div style={{
            position: "absolute", left: x0 + dx, top: y0 + dy, width: 150, height: 2,
            transform: `rotate(${angleDeg + 180}deg)`, transformOrigin: "0 50%",
            background: "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(190,170,255,0.4), transparent)",
            borderRadius: 2, opacity: fade, boxShadow: "0 0 8px 1px rgba(255,255,255,0.5)",
            mixBlendMode: "screen", pointerEvents: "none",
          }} />
        );
      }}
    </CSprite>
  );
}

// ── Ufq nuri ──
function CosmosHorizon() {
  const t = useCosmosTime();
  const b = 0.5 + 0.5 * Math.sin(CTAU * 2 * (t / CLOOP) + Math.PI);
  return (
    <div style={{
      position: "absolute", left: 0, top: 1010, width: "100%", height: 360,
      background: "radial-gradient(ellipse 60% 55% at 50% 60%, rgba(236,170,255,0.40) 0%, rgba(160,90,230,0.16) 45%, transparent 72%)",
      opacity: 0.35 + 0.5 * b, mixBlendMode: "screen", pointerEvents: "none", filter: "blur(6px)",
    }} />
  );
}

// ── Vodiy uzra suzuvchi tuman ──
function CosmosFog() {
  const t = useCosmosTime();
  const x1 = 90 * Math.sin(CTAU * (t / CLOOP));
  const x2 = -120 * Math.sin(CTAU * (t / CLOOP) + Math.PI / 2.5);
  const common = { position: "absolute", borderRadius: "50%", filter: "blur(45px)", mixBlendMode: "screen", pointerEvents: "none" };
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ ...common, left: 80, top: 1330, width: 700, height: 220, background: "radial-gradient(ellipse, rgba(150,110,210,0.22), transparent 70%)", transform: `translateX(${x1}px)` }}></div>
      <div style={{ ...common, left: 280, top: 1450, width: 800, height: 260, background: "radial-gradient(ellipse, rgba(120,90,190,0.20), transparent 70%)", transform: `translateX(${x2}px)` }}></div>
    </div>
  );
}

// ── Ko'tarilayotgan chang zarralari ──
const CMOTES = (() => {
  const rand = cosmosRand(7);
  const out = [];
  for (let i = 0; i < 8; i++) {
    out.push({
      x: 60 + rand() * 820, yStart: 1250 + rand() * 380,
      rise: 220 + rand() * 320, size: 1.5 + rand() * 2.5,
      offset: rand(), sway: 14 + rand() * 26, k: 2 + Math.floor(rand() * 3),
    });
  }
  return out;
})();

function CosmosMotes() {
  const t = useCosmosTime();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {CMOTES.map((m, i) => {
        const p = (t / CLOOP + m.offset) % 1;
        const y = m.yStart - m.rise * p;
        const x = m.x + m.sway * Math.sin(CTAU * m.k * p);
        const o = 0.7 * Math.sin(Math.PI * p);
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width: m.size, height: m.size,
            borderRadius: "50%", background: "rgba(230,210,255,0.9)", opacity: o,
            boxShadow: "0 0 6px 1px rgba(200,170,255,0.4)", mixBlendMode: "screen",
          }} />
        );
      })}
    </div>
  );
}

// ── Sahna ──
function CosmosScene() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#0b0820" }}>
      <CosmosBase />
      <CosmosHorizon />
      <CosmosGeometry />
      <CosmosPulseRings />
      <CosmosCoreGlow />
      <CosmosTwinkles />
      <CosmosMotes />
      <CosmosFog />
      <CosmosShootingStar start={4.5} x0={780} y0={120} angleDeg={155} length={750} />
      <CosmosShootingStar start={13} x0={200} y0={90} angleDeg={28} length={650} />
      <CosmosShootingStar start={22.5} x0={680} y0={300} angleDeg={160} length={600} />
    </div>
  );
}

// ── Statik fon: faqat kosmik rasm (animatsiyasiz) + qoraytirish ──
// Mashq/o'yin paytida ishlatiladi — hech qanday rAF yoki qatlam yo'q,
// shuning uchun protsessor/GPU ga yuk bermaydi.
export function CosmosStatic() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0, background: "#0b0820" }}>
      <img src={asset("assets/cosmos.webp")} alt="" draggable={false} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", objectPosition: "50% 42%", transform: "scale(1.07)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(6,5,14,0.30) 0%, rgba(6,5,14,0.50) 40%, rgba(5,4,16,0.72) 78%, rgba(4,3,12,0.82) 100%)",
      }}></div>
    </div>
  );
}

// ── Fon o'rami: .app ichini to'liq qoplaydi (cover) + o'qish uchun qoraytirish ──
export function CosmosBG() {
  const ref = React.useRef(null);
  const [box, setBox] = React.useState({ w: 430, h: 860 });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = Math.max(box.w / 941, box.h / 1672);
  return (
    <div ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 941, height: 1672, transform: `translate(-50%, -50%) scale(${scale})` }}>
        <CosmosScene />
      </div>
      {/* matn o'qilishi uchun yumshoq qoraytirish */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(6,5,14,0.30) 0%, rgba(6,5,14,0.50) 40%, rgba(5,4,16,0.72) 78%, rgba(4,3,12,0.82) 100%)",
      }}></div>
    </div>
  );
}
