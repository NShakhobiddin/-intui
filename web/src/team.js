/* ===== Intui — Jamoaviy intuitsiya (Collective Intuition) =====
   Bir havola orqali 30 kishigacha bir "dumaloq stol"ga qo'shiladi.
   Hamma bir-birini ko'radi. Galma-gal har bir ishtirokchi 10 soniya
   "his qiladi" (meva tanlaydi), qolganlar uni his etib meva tanlaydi.
   So'ng hamma tanlovi ochiladi — jamoaviy rezonans ko'rinadi.

   Presence — to'liq ro'yxat (kim stolda). Broadcast — o'yin voqealari.
   Xost (xona egasi) navbatlarni boshqaradi. */
import { cloudEnabled, supabase } from "./cloud.js";

export const teamAvailable = cloudEnabled;
export const TEAM_MAX = 30;

const ALPHABET = "ACEFHJKLMNPRTUVWXY3479"; // chalkashmaydigan belgilar
export function makeTeamCode(rnd) {
  const r = rnd || Math.random;
  let s = "";
  for (let i = 0; i < 5; i++) s += ALPHABET[Math.floor(r() * ALPHABET.length)];
  return s;
}
export function normalizeTeamCode(v) {
  return (v || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
}
const TEAM_RE = /^[ACEFHJKLMNPRTUVWXY3479]{5}$/;

// Taklif havolasi. VITE_TG_LINK bo'lsa Telegram deep-link, aks holda veb-URL.
// Jamoa kodi "TM" prefiksi bilan uzatiladi — duel havolasidan farqlanadi.
const TG_LINK = import.meta.env.VITE_TG_LINK;
export function teamInviteUrl(code) {
  if (TG_LINK) return `${TG_LINK}?startapp=TM${code}`;
  const base = (typeof location !== "undefined") ? location.origin + location.pathname : "";
  return `${base}?tm=${code}`;
}
// Deep-link/URL paramdan jamoa kodini ajratadi (yoki null)
export function parseTeamParam(raw) {
  const p = (raw || "").trim().toUpperCase();
  if (!p) return null;
  let code = "";
  if (p.startsWith("TM")) code = normalizeTeamCode(p.slice(2));
  else if (TEAM_RE.test(p)) code = p;
  return code && code.length >= 4 ? code : null;
}

/* Xonaga qo'shilish.
   opts: { id, name, isHost, joinedAt, onRoster(list), onEvent(payload), onStatus(str) }
   Qaytaradi: { send(payload), leave() } */
export function joinTeam(code, opts) {
  if (!teamAvailable) throw new Error("no-supabase");
  const channel = supabase.channel("intui-team-" + code, {
    config: { presence: { key: opts.id }, broadcast: { self: false } },
  });

  channel.on("presence", { event: "sync" }, () => {
    const st = channel.presenceState();
    const list = [];
    Object.keys(st).forEach((k) => {
      const m = st[k][0];
      if (m) list.push({ id: k, name: m.name || "Anonim", host: !!m.host, joinedAt: m.joinedAt || 0 });
    });
    list.sort((a, b) => (a.joinedAt - b.joinedAt) || (a.id < b.id ? -1 : 1));
    if (opts.onRoster) opts.onRoster(list);
  });
  channel.on("broadcast", { event: "ev" }, ({ payload }) => { if (opts.onEvent) opts.onEvent(payload); });

  channel.subscribe(async (status) => {
    if (opts.onStatus) opts.onStatus(status);
    if (status === "SUBSCRIBED") {
      try { await channel.track({ name: opts.name || "Anonim", host: !!opts.isHost, joinedAt: opts.joinedAt || Date.now() }); }
      catch (e) { /* ignore */ }
    }
  });

  return {
    send(payload) { channel.send({ type: "broadcast", event: "ev", payload }); },
    leave() { try { supabase.removeChannel(channel); } catch (e) { /* ignore */ } },
  };
}
