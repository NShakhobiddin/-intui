/* ===== Intui — Do'st bilan onlayn o'ynash (Supabase Realtime) =====
   Ikki o'yinchi bitta "xona" kanaliga qo'shiladi. Bir tomon kartani
   yashirin tanlaydi, ikkinchisi sezib topadi. Sir faqat reveal paytida
   uzatiladi (guesser oldindan ko'rmaydi). */
import { cloudEnabled, supabase } from "./cloud.js";

export const duoAvailable = cloudEnabled;

// Taklif havolasi. VITE_TG_LINK berilgan bo'lsa (masalan
// "https://t.me/YourBot/app") — Telegram deep-link; aks holda veb-URL.
const TG_LINK = import.meta.env.VITE_TG_LINK;
export function inviteUrl(param) {
  if (TG_LINK) return `${TG_LINK}?startapp=${param}`;
  const base = (typeof location !== "undefined") ? location.origin + location.pathname : "";
  return `${base}?g=${param}`;
}

const ALPHABET = "ACEFHJKLMNPRTUVWXY3479"; // chalkashmaydigan belgilar
export function makeRoomCode(rnd) {
  const r = rnd || Math.random;
  let s = "";
  for (let i = 0; i < 5; i++) s += ALPHABET[Math.floor(r() * ALPHABET.length)];
  return s;
}
export function normalizeCode(v) {
  return (v || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
}
const ROOM_RE = /^[ACEFHJKLMNPRTUVWXY3479]{5}$/;

/* ===== Telegram-orqali navbatli (async, backendsiz) rejim =====
   "Chaqiruv" (kim yashirgan) va "natija" (kim sezgan) deep-link ichida
   base64url + yengil XOR bilan yashiriladi — havolaga qarab osongina
   o'qib bo'lmasin (jiddiy himoya emas, faqat tasodifiy ko'rishdan). */
function b64urlFromBytes(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function bytesFromB64url(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
function xor(bytes) {
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ ((0x5c + (i % 7)) & 0xff);
  return out;
}
export function encodeToken(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  return "C" + b64urlFromBytes(xor(bytes));
}
export function decodeToken(str) {
  if (!str || str[0] !== "C" || str.length < 6) return null;
  try {
    const bytes = xor(bytesFromB64url(str.slice(1)));
    const obj = JSON.parse(new TextDecoder().decode(bytes));
    if (obj && obj.v === 1 && (obj.ty === "c" || obj.ty === "r")) return obj;
  } catch (e) { /* ignore */ }
  return null;
}

/* Deep-link/URL parametrini ajratadi:
   { room: "ABCDE" } | { token: {ty:"c"|"r", ...} } | null */
export function parseParam(raw) {
  const p = (raw || "").trim();
  if (!p) return null;
  if (ROOM_RE.test(p.toUpperCase()) && p.length === 5) return { room: p.toUpperCase() };
  const tok = decodeToken(p);
  if (tok) return { token: tok };
  const code = normalizeCode(p);
  if (code.length >= 4) return { room: code };
  return null;
}

/* Xonaga qo'shilish. Presence orqali ismlar/rollar ko'rinadi, broadcast
   orqali yurishlar almashadi.
   opts: { name, isHost, onRoster(list), onMove(payload), onStatus(str) }
   Qaytaradi: { send(payload), leave() } */
export function joinDuo(code, opts) {
  if (!duoAvailable) throw new Error("no-supabase");
  const key = (opts.isHost ? "h-" : "g-") + Math.random().toString(36).slice(2, 8);
  const channel = supabase.channel("intui-duo-" + code, {
    config: { presence: { key }, broadcast: { self: false } },
  });

  channel.on("presence", { event: "sync" }, () => {
    const st = channel.presenceState();
    const list = [];
    Object.keys(st).forEach((k) => { const m = st[k][0]; if (m) list.push(Object.assign({ key: k }, m)); });
    if (opts.onRoster) opts.onRoster(list);
  });
  channel.on("broadcast", { event: "move" }, ({ payload }) => {
    if (opts.onMove) opts.onMove(payload);
  });

  channel.subscribe(async (status) => {
    if (opts.onStatus) opts.onStatus(status);
    if (status === "SUBSCRIBED") {
      try { await channel.track({ name: opts.name || "Do'st", host: !!opts.isHost, mode: opts.mode || null }); }
      catch (e) { /* ignore */ }
    }
  });

  return {
    send(payload) {
      channel.send({ type: "broadcast", event: "move", payload });
    },
    updateMode(mode) {
      try { channel.track({ name: opts.name || "Do'st", host: !!opts.isHost, mode }); } catch (e) { /* ignore */ }
    },
    leave() {
      try { supabase.removeChannel(channel); } catch (e) { /* ignore */ }
    },
  };
}
