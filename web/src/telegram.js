/* ===== Intui — Telegram Mini App integratsiyasi ===== */
const tg = typeof window !== "undefined" && window.Telegram ? window.Telegram.WebApp : null;

// telegram-web-app.js skripti oddiy brauzerda ham yuklanadi —
// haqiqiy Telegram ichidaligini platform orqali aniqlaymiz
export const inTelegram = Boolean(tg && tg.platform && tg.platform !== "unknown");
export const tgUser = inTelegram && tg.initDataUnsafe ? tg.initDataUnsafe.user || null : null;

export function tgName() {
  if (!tgUser) return null;
  const name = (tgUser.first_name || tgUser.username || "").trim();
  return name ? name.slice(0, 20) : null;
}

const ver = (v) => {
  try { return inTelegram && tg.isVersionAtLeast(v); } catch (e) { return false; }
};

// Fullscreen rejimida Telegramning o'z tugmalari (yopish, menyu) va status
// bar kontent ustiga tushadi — ular egallagan joyni CSS o'zgaruvchiga yozamiz.
function applyInsets() {
  try {
    const sa = tg.safeAreaInset || {};
    const ca = tg.contentSafeAreaInset || {};
    const root = document.documentElement.style;
    root.setProperty("--safe-top", ((sa.top || 0) + (ca.top || 0)) + "px");
    root.setProperty("--safe-bottom", (sa.bottom || 0) + "px");
  } catch (e) { /* ignore */ }
}

export function initTelegram() {
  if (!inTelegram) return;
  try {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor("#0c0a1c");
    if (tg.setBackgroundColor) tg.setBackgroundColor("#06050e");
    // scroll paytida ilova pastga tortilib yopilib ketmasin
    if (ver("7.7") && tg.disableVerticalSwipes) tg.disableVerticalSwipes();
    // Telegramda to'liq ekran (fullscreen) rejimida ochilsin — Bot API 8.0.
    // Mobil qurilmalarda ishlaydi; desktopda "fullscreenFailed" bo'ladi,
    // u holda expand() bergan to'liq balandlik saqlanadi.
    if (ver("8.0") && tg.requestFullscreen && !tg.isFullscreen) {
      tg.requestFullscreen();
    }
    // fullscreen'da ekran aylanib ketmasin (portret o'yin)
    if (ver("8.0") && tg.lockOrientation) tg.lockOrientation();
    applyInsets();
    if (tg.onEvent) {
      tg.onEvent("safeAreaChanged", applyInsets);
      tg.onEvent("contentSafeAreaChanged", applyInsets);
      tg.onEvent("fullscreenChanged", applyInsets);
      tg.onEvent("viewportChanged", applyInsets);
    }
  } catch (e) { /* ignore */ }
}

export function haptic(type) {
  if (!ver("6.1") || !tg.HapticFeedback) return;
  try { tg.HapticFeedback.notificationOccurred(type); } catch (e) { /* ignore */ }
}

// Deep-link start parametri: t.me/bot/app?startapp=<code> orqali qo'shilish
export function tgStartParam() {
  try { return (inTelegram && tg.initDataUnsafe && tg.initDataUnsafe.start_param) || ""; }
  catch (e) { return ""; }
}

// Taklif havolasini ulashish. Telegramda tabiiy "ulashish" oynasi ochiladi;
// aks holda navigator.share yoki clipboard. Natija: "shared" | "copied" | "".
export async function shareInvite(url, text) {
  try {
    if (inTelegram && tg.openTelegramLink) {
      tg.openTelegramLink("https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(text || ""));
      return "shared";
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ text: (text ? text + " " : "") + url });
      return "shared";
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      return "copied";
    }
  } catch (e) { /* ignore */ }
  return "";
}

let backCb = null;
export function showBackButton(cb) {
  if (!inTelegram || !tg.BackButton) return;
  backCb = cb;
  try { tg.BackButton.onClick(cb); tg.BackButton.show(); } catch (e) { /* ignore */ }
}
export function hideBackButton() {
  if (!inTelegram || !tg.BackButton) return;
  try {
    if (backCb) tg.BackButton.offClick(backCb);
    backCb = null;
    tg.BackButton.hide();
  } catch (e) { /* ignore */ }
}

/* ---------- CloudStorage: holat 4KB bo'laklarga bo'lib saqlanadi ----------
   Telegram har bir kalitga eng ko'pi 4096 belgi sig'diradi (1024 ta kalit),
   shuning uchun JSON bo'laklab yoziladi: intui2_meta + intui2_0..n. */
export const tgCloudAvailable = Boolean(inTelegram && tg.CloudStorage && ver("6.9"));

const CHUNK = 3500;
const META = "intui2_meta";
const part = (i) => "intui2_" + i;

const cs = () => tg.CloudStorage;
const csGet = (k) => new Promise((res, rej) => cs().getItem(k, (e, v) => (e ? rej(e) : res(v))));
const csGetMany = (ks) => new Promise((res, rej) => cs().getItems(ks, (e, v) => (e ? rej(e) : res(v))));
const csSet = (k, v) => new Promise((res, rej) => cs().setItem(k, v, (e, ok) => (e ? rej(e) : res(ok))));
const csKeys = () => new Promise((res, rej) => cs().getKeys((e, v) => (e ? rej(e) : res(v))));
const csRemove = (ks) => new Promise((res, rej) => (ks.length ? cs().removeItems(ks, (e, ok) => (e ? rej(e) : res(ok))) : res(true)));

export async function loadTgCloud() {
  const metaRaw = await csGet(META);
  if (!metaRaw) return null;
  const n = (JSON.parse(metaRaw) || {}).chunks || 0;
  if (!n) return null;
  const keys = Array.from({ length: n }, (_, i) => part(i));
  const map = await csGetMany(keys);
  let s = "";
  for (let i = 0; i < n; i++) {
    const piece = map[part(i)];
    if (!piece) return null; // chala yozuv — e'tiborga olinmaydi
    s += piece;
  }
  return JSON.parse(s);
}

export async function saveTgCloud(state) {
  const s = JSON.stringify(state);
  const n = Math.ceil(s.length / CHUNK) || 1;
  for (let i = 0; i < n; i++) {
    await csSet(part(i), s.slice(i * CHUNK, (i + 1) * CHUNK));
  }
  await csSet(META, JSON.stringify({ chunks: n }));
  // holat qisqargan bo'lsa ortiqcha bo'laklarni tozalaymiz
  const keys = await csKeys();
  const stale = keys.filter((k) => /^intui2_\d+$/.test(k) && parseInt(k.slice(7), 10) >= n);
  await csRemove(stale);
}
