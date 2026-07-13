/* ===== Intui — Do'st bilan onlayn o'ynash (Supabase Realtime) =====
   Ikki o'yinchi bitta "xona" kanaliga qo'shiladi. Bir tomon kartani
   yashirin tanlaydi, ikkinchisi sezib topadi. Sir faqat reveal paytida
   uzatiladi (guesser oldindan ko'rmaydi). */
import { cloudEnabled, supabase } from "./cloud.js";

export const duoAvailable = cloudEnabled;

// Taklif havolasi. VITE_TG_LINK berilgan bo'lsa (masalan
// "https://t.me/YourBot/app") — Telegram deep-link; aks holda veb-URL.
const TG_LINK = import.meta.env.VITE_TG_LINK;
export function inviteUrl(code) {
  if (TG_LINK) return `${TG_LINK}?startapp=${code}`;
  const base = (typeof location !== "undefined") ? location.origin + location.pathname : "";
  return `${base}?room=${code}`;
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
