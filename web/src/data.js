/* ===== Intui — data layer ===== */

// ---------- Rejimlar ----------
export const MODES = [
  {
    id: "bw", name: "Oq-qora", icon: "yinyang", diff: "Oson", diffClass: "easy",
    desc: "Yopiq karta qaysi rangda — Oq yoki Qora? Sezib toping.",
    kind: "find", options: [2], defaultOptions: 2,
  },
  {
    id: "color", name: "Rangli", icon: "wheel", diff: "O'rta", diffClass: "mid",
    desc: "Ranglar orqali sezgingizni sinang.",
    kind: "guess", options: [3, 4, 5, 6], defaultOptions: 4,
  },
  {
    id: "shape", name: "Shaklli", icon: "hex", diff: "O'rta", diffClass: "mid",
    desc: "Shakllar va naqshlar orqali sezib oling.",
    kind: "guess", options: [3, 4, 5, 6, 7], defaultOptions: 4,
  },
  {
    id: "fast", name: "Tezkor", icon: "bolt", diff: "Qiyin", diffClass: "hard",
    desc: "Vaqtga qarshi tez sezish mashqi.",
    kind: "guess", options: [2, 3, 4, 5], defaultOptions: 3,
    timer: 3, timers: [1, 2, 3],
  },
  {
    id: "first", name: "Birinchi sezgi", icon: "star4", diff: "Qiyin", diffClass: "hard",
    desc: "Birinchi taassurotingizga ishoning — yoki o'zgartiring.",
    kind: "guess", options: [2, 3, 4, 5], defaultOptions: 4, secondGuess: true,
  },
];

export const COLOR_CARDS = [
  { id: "oq", label: "Oq", color: "#f4f2ff", text: "#1a1830" },
  { id: "qora", label: "Qora", color: "#15131f", text: "#f4f2ff" },
  { id: "qizil", label: "Qizil", color: "#e0445c", text: "#fff" },
  { id: "kok", label: "Ko'k", color: "#3d6ee8", text: "#fff" },
  { id: "yashil", label: "Yashil", color: "#2fae6c", text: "#fff" },
  { id: "sariq", label: "Sariq", color: "#e8b53d", text: "#241c05" },
];

export const SHAPE_CARDS = [
  { id: "doira", label: "Doira", shape: "circle" },
  { id: "uchburchak", label: "Uchburchak", shape: "triangle" },
  { id: "kvadrat", label: "Kvadrat", shape: "square" },
  { id: "yulduz", label: "Yulduz", shape: "star" },
  { id: "spiral", label: "Spiral", shape: "spiral" },
  { id: "oy", label: "Oy", shape: "moon" },
  { id: "romb", label: "Romb", shape: "diamond" },
];

// ---------- Badge ----------
export const BADGES = [
  { id: "first-sense", name: "Birinchi Sezgi", desc: "Ilk sessiyani yakunlash", icon: "star4" },
  { id: "streak7", name: "7 Kunlik Streak", desc: "7 kun uzluksiz mashq qilish", icon: "fire" },
  { id: "fast-picker", name: "Tezkor Tanlovchi", desc: "Tezkor rejimda 50 urinish", icon: "bolt" },
  { id: "bw-master", name: "Oq-Qora Ustasi", desc: "Oq-qora rejimda 100 urinish va 60%+ aniqlik", icon: "yinyang" },
  { id: "inner-voice", name: "Ichki Ovoz", desc: "Birinchi tanlovni o'zgartirmasdan 70%+ natija", icon: "wave" },
  { id: "deep-observer", name: "Chuqur Kuzatuvchi", desc: "Journalga 20 yozuv kiritish", icon: "book" },
];

// ---------- Kayfiyat ----------
export const MOODS = [
  { id: "xotirjam", label: "Xotirjam", icon: "lotus", color: "#a78bfa" },
  { id: "quvnoq", label: "Quvnoq", icon: "sun", color: "#fbbf24" },
  { id: "ikkilanib", label: "Ikkilanib", icon: "spiral", color: "#e8a23d" },
  { id: "shoshilib", label: "Shoshilib", icon: "bolt", color: "#fb7185" },
  { id: "charchagan", label: "Charchagan", icon: "moon", color: "#64748b" },
];

export const JOURNAL_TAGS = ["Diqqatim jamlangan edi", "Ichki ovozni his qildim", "Shunchaki taxmin qildim", "Tanam tinch edi", "Fikrlarim chalg'idi", "Tezroq tugatgim keldi"];

// ---------- Storage ----------
export const STORAGE_KEY = "intui_state_v2";
const LEGACY_KEY = "intui_state_v1"; // demo ma'lumotli eski format
const DEFAULT_STATE = {
  nickname: null,
  onboarded: false,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  attempts: [],   // {mode, n, correct, changed, hour, date, mood}
  sessions: [],   // {mode, n, total, correct, mood, date, hour, daily, sec}
  journal: [],    // {date, mood, tags, note}
  badges: [],     // ids
  dailyDone: null, // date string of last completed daily
  dailyProgress: 0,
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return Object.assign({}, DEFAULT_STATE, JSON.parse(raw));
    const migrated = migrateLegacyV1();
    if (migrated) return migrated;
  } catch (e) { /* ignore */ }
  return Object.assign({}, DEFAULT_STATE);
}

/* ---------- v1 -> v2 migratsiyasi ----------
   v1 da birinchi ochilishda demo ma'lumotlar yozilardi. Demo generatori
   deterministik (seed 42) bo'lgani uchun uni qayta hosil qilib, saqlangan
   ma'lumotlardan demo sessiya/jurnal yozuvlarini aniq ajratamiz; faqat
   haqiqiy o'ynalgan sessiyalar ko'chiriladi. */
function migrateLegacyV1() {
  let old;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    old = JSON.parse(raw);
  } catch (e) { return null; }

  const demo = legacyGenDemo();
  const skey = (x) => [x.mode, x.n, x.total, x.correct, x.mood, x.hour, x.daily, x.sec].join("|");
  const scounts = {};
  demo.sessions.forEach((x) => { const k = skey(x); scounts[k] = (scounts[k] || 0) + 1; });
  const sessions = (old.sessions || []).filter((x) => {
    if (x.demo) return false;
    const k = skey(x);
    if (scounts[k]) { scounts[k]--; return false; }
    return true;
  }).map((x) => { const { demo: _d, ...rest } = x; return rest; });

  // demo urinishlarni yakka-yakka ishonchli ajratib bo'lmaydi —
  // urinishlar haqiqiy sessiyalardan qayta tiklanadi
  const attempts = [];
  sessions.forEach((s) => {
    for (let i = 0; i < (s.total || 0); i++) {
      attempts.push({ mode: s.mode, n: s.n, correct: i < s.correct, changed: false, hour: s.hour, date: s.date, mood: s.mood });
    }
  });

  const jkey = (j) => [j.mood, (j.tags || []).join(","), j.note || ""].join("|");
  const jcounts = {};
  demo.journal.forEach((j) => { const k = jkey(j); jcounts[k] = (jcounts[k] || 0) + 1; });
  const journal = (old.journal || []).filter((j) => {
    const k = jkey(j);
    if (jcounts[k]) { jcounts[k]--; return false; }
    return true;
  });

  const s = Object.assign({}, DEFAULT_STATE, {
    nickname: old.nickname || null,
    onboarded: !!old.onboarded,
    attempts, sessions, journal,
  });
  recomputeStreak(s);
  checkBadges(s);
  saveState(s);
  try { localStorage.removeItem(LEGACY_KEY); } catch (e) { /* ignore */ }
  return s;
}

/* ---------- Bulut bilan birlashtirish ----------
   Sessiya/jurnal yozuvlari birlashtiriladi (bir xil yozuvdan bittasi
   qoladi), ikkala tomonda ham yangilik bo'lsa urinishlar sessiyalardan
   qayta tiklanadi; streak va yutuqlar qayta hisoblanadi. */
export function mergeStates(local, cloud) {
  if (!cloud) return local;
  const has = (s) => ((s.sessions || []).length || (s.attempts || []).length) > 0;
  if (!has(cloud)) {
    // bulutda o'yin ma'lumoti bo'lmasa ham nickname/onboarding ko'chsin
    return Object.assign({}, local, {
      nickname: local.nickname || cloud.nickname || null,
      onboarded: local.onboarded || !!cloud.onboarded,
    });
  }
  if (!has(local)) {
    return Object.assign({}, DEFAULT_STATE, cloud, {
      nickname: cloud.nickname || local.nickname || null,
      onboarded: true,
    });
  }
  // jsonb kalitlar tartibini o'zgartiradi — kanonik kalit bilan solishtiramiz
  const ckey = (x) => JSON.stringify(Object.keys(x).sort().map((k) => [k, x[k]]));
  const dedupe = (a, b) => {
    const seen = new Set(a.map(ckey));
    return a.concat(b.filter((x) => {
      const k = ckey(x);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }));
  };
  const sessions = dedupe(local.sessions || [], cloud.sessions || []);
  const journal = dedupe(local.journal || [], cloud.journal || []);
  let attempts;
  if (sessions.length === (local.sessions || []).length) {
    attempts = local.attempts || [];
  } else if (sessions.length === (cloud.sessions || []).length) {
    attempts = cloud.attempts || [];
  } else {
    attempts = [];
    sessions.forEach((s) => {
      for (let i = 0; i < (s.total || 0); i++) {
        attempts.push({ mode: s.mode, n: s.n, correct: i < s.correct, changed: false, hour: s.hour, date: s.date, mood: s.mood });
      }
    });
  }
  const s = Object.assign({}, DEFAULT_STATE, {
    nickname: local.nickname || cloud.nickname || null,
    onboarded: true,
    attempts, sessions, journal,
    xp: Math.max(local.xp || 0, cloud.xp || 0),
  });
  recomputeStreak(s);
  checkBadges(s);
  return s;
}

function recomputeStreak(s) {
  const dates = Array.from(new Set(s.sessions.map((x) => x.date))).sort();
  let cur = 0, best = 0, prev = null;
  dates.forEach((d) => {
    cur = prev && new Date(d) - new Date(prev) === 864e5 ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  });
  const today = todayStr();
  const yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  s.lastActiveDate = dates.length ? dates[dates.length - 1] : null;
  s.streak = s.lastActiveDate === today || s.lastActiveDate === yest ? cur : 0;
  s.bestStreak = best;
}
export function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
}
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// streak update on session completion
export function bumpStreak(s) {
  const today = todayStr();
  if (s.lastActiveDate === today) return s.streak;
  const yest = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const streak = s.lastActiveDate === yest ? s.streak + 1 : 1;
  s.streak = streak;
  s.bestStreak = Math.max(s.bestStreak, streak);
  s.lastActiveDate = today;
  return streak;
}

// ---------- Badge tekshiruvi ----------
export function checkBadges(s) {
  const earned = new Set(s.badges);
  const add = [];
  const grant = (id) => { if (!earned.has(id)) { earned.add(id); add.push(id); } };

  if (s.sessions.length >= 1) grant("first-sense");
  if (s.bestStreak >= 7) grant("streak7");
  if (s.attempts.filter((a) => a.mode === "fast").length >= 50) grant("fast-picker");
  const bw = s.attempts.filter((a) => a.mode === "bw");
  if (bw.length >= 100 && pct(bw) >= 60) grant("bw-master");
  const unchanged = s.attempts.filter((a) => !a.changed);
  if (unchanged.length >= 20 && pct(unchanged) >= 70) grant("inner-voice");
  if (s.journal.length >= 20) grant("deep-observer");

  s.badges = Array.from(earned);
  return add;
}

export function pct(arr) {
  if (!arr.length) return 0;
  return Math.round((arr.filter((a) => a.correct).length / arr.length) * 100);
}

// bir kunda necha daqiqa shug'ullangani
export function minutesOn(sessions, date) {
  const sec = (sessions || []).filter((s) => s.date === date).reduce((t, s) => t + (s.sec || 0), 0);
  return Math.round(sec / 60);
}

// v1 dagi demo generatorining aynan nusxasi — faqat migratsiyada demo
// yozuvlarni tanib olish uchun ishlatiladi (rng chaqiruvlar tartibi muhim)
function legacyGenDemo() {
  const rng = mulberry32(42);
  const attempts = [];
  const sessions = [];
  const journal = [];
  const modes = ["bw", "color", "shape", "fast", "first"];
  const moods = ["xotirjam", "quvnoq", "ikkilanib", "shoshilib", "charchagan"];
  // bias: evening hours + calm mood score better
  for (let d = 13; d >= 0; d--) {
    const date = new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
    const nSessions = 1 + Math.floor(rng() * 2);
    for (let si = 0; si < nSessions; si++) {
      const mode = modes[Math.floor(rng() * modes.length)];
      const hour = [9, 13, 16, 19, 21, 22][Math.floor(rng() * 6)];
      const mood = moods[Math.floor(rng() * moods.length)];
      const n = mode === "bw" ? 2 : 4;
      const base = 1 / n;
      let bonus = 0;
      if (hour >= 19) bonus += 0.13;
      if (mood === "xotirjam") bonus += 0.12;
      if (mood === "shoshilib" || mood === "charchagan") bonus -= 0.06;
      let correct = 0;
      const total = 10;
      for (let i = 0; i < total; i++) {
        const ok = rng() < base + bonus;
        if (ok) correct++;
        attempts.push({ mode, n, correct: ok, changed: rng() < 0.18 && !ok, hour, date, mood });
      }
      sessions.push({ mode, n, total, correct, mood, date, hour, daily: si === 0, sec: 120 + Math.floor(rng() * 480) });
      if (rng() < 0.5) journal.push({ date, mood, tags: [JOURNAL_TAGS[Math.floor(rng() * JOURNAL_TAGS.length)]], note: "" });
    }
  }
  return { attempts, sessions, journal };
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Statistika hisoblari ----------
export const HOUR_BUCKETS = [
  { label: "00–03", from: 0, to: 3 }, { label: "03–06", from: 3, to: 6 },
  { label: "06–09", from: 6, to: 9 }, { label: "09–12", from: 9, to: 12 },
  { label: "12–15", from: 12, to: 15 }, { label: "15–18", from: 15, to: 18 },
  { label: "18–21", from: 18, to: 21 }, { label: "21–24", from: 21, to: 24 },
];

export function computeStats(attempts, period) {
  const today = todayStr();
  const cutoff = period === "today" ? 0 : period === "week" ? 7 : 30;
  const filtered = attempts.filter((a) => {
    if (period === "today") return a.date === today;
    const days = Math.floor((Date.now() - new Date(a.date).getTime()) / 864e5);
    return days < cutoff;
  });
  const accuracy = pct(filtered);
  // chance: weighted by options count
  const chance = filtered.length
    ? Math.round(filtered.reduce((s, a) => s + 100 / a.n, 0) / filtered.length)
    : 50;
  // by hour
  const byHour = HOUR_BUCKETS.map((b) => {
    const arr = filtered.filter((a) => a.hour >= b.from && a.hour < b.to);
    return { label: b.label, acc: arr.length ? pct(arr) : null, count: arr.length };
  });
  // by mood (shu jumladan foydalanuvchi o'zi yozgan holatlar)
  const customIds = Array.from(new Set(filtered.map((a) => a.mood).filter((m) => m && m.startsWith && m.startsWith("c:"))));
  const allMoods = MOODS.concat(customIds.map((id) => ({ id, label: id.slice(2), icon: "pencil", color: "#9d96c7" })));
  const byMood = allMoods.map((m) => {
    const arr = filtered.filter((a) => a.mood === m.id);
    return { mood: m, acc: arr.length ? pct(arr) : null, count: arr.length };
  }).filter((x) => x.acc !== null).sort((a, b) => b.acc - a.acc);
  // by mode
  const byMode = MODES.map((m) => {
    const arr = filtered.filter((a) => a.mode === m.id);
    return { mode: m, acc: arr.length ? pct(arr) : null, count: arr.length };
  }).filter((x) => x.acc !== null).sort((a, b) => b.acc - a.acc);
  // first choice analysis
  const changed = filtered.filter((a) => a.changed);
  const unchanged = filtered.filter((a) => !a.changed);
  return {
    total: filtered.length, accuracy, chance,
    diff: accuracy - chance,
    byHour, byMood, byMode,
    firstChoice: { changedAcc: changed.length ? pct(changed) : null, unchangedAcc: unchanged.length ? pct(unchanged) : null, changedN: changed.length, unchangedN: unchanged.length },
  };
}

// ---------- AI tavsiya (rule-based) ----------
export function aiTips(stats, state) {
  const tips = [];
  const best = stats.byHour.filter((h) => h.acc !== null && h.count >= 5).sort((a, b) => b.acc - a.acc)[0];
  if (best && best.acc > stats.accuracy + 5) {
    tips.push({ icon: "moon", title: `${best.label} oralig'ida natijangiz yuqoriroq.`, body: "Bugungi challenge'ni shu vaqtda sinab ko'ring." });
  }
  const bestMood = stats.byMood[0];
  if (bestMood && bestMood.count >= 5 && bestMood.acc > stats.accuracy + 5) {
    tips.push({ icon: "lotus", title: `${bestMood.mood.label} holatda aniqligingiz ${bestMood.acc}%.`, body: "Mashqdan oldin bir necha chuqur nafas oling." });
  }
  const fc = stats.firstChoice;
  if (fc.unchangedAcc !== null && fc.changedAcc !== null && fc.unchangedAcc > fc.changedAcc + 5) {
    tips.push({ icon: "star4", title: "Birinchi impulsingiz ko'proq to'g'ri chiqmoqda.", body: "Tanlovni tez-tez o'zgartirmaslikni kuzatib ko'ring." });
  }
  const worstMood = stats.byMood[stats.byMood.length - 1];
  if (worstMood && (worstMood.mood.id === "charchagan" || worstMood.mood.id === "shoshilib") && worstMood.acc < stats.chance) {
    tips.push({ icon: "wave", title: `${worstMood.mood.label} paytda natija pasaymoqda.`, body: "Mashqdan oldin qisqa tanaffus foydali bo'lishi mumkin." });
  }
  if (!tips.length) {
    tips.push({ icon: "star4", title: "Ko'proq mashq qiling — tahlil aniqlashadi.", body: "Kamida 3-4 sessiyadan so'ng shaxsiy tavsiyalar paydo bo'ladi." });
  }
  return tips;
}
