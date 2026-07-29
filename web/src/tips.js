/* ===== Intui — mashq davomidagi maslahatlar =====
   Mirzakarim Norbekovning "Опыт дурака 6. Как работает интуиция"
   kitobidagi metodika asosida. Matn — original, ko'chirma emas.

   Maslahatlar tasodifiy emas: o'yin borishiga qarab tanlanadi
   (ketma-ket xato, ketma-ket to'g'ri, sekin javob, ulgurmaslik...). */

// Har necha urinishdan keyin umumiy eslatma chiqadi
const PERIOD = 12;
// Ikki maslahat orasidagi eng kam masofa (urinishlarda)
const COOLDOWN = 7;
// Sekin javob chegarasi (ms) — bundan uzoq o'ylash allaqachon mantiq
const SLOW_MS = 4200;
const FAST_MS = 1600;

/* Umumiy eslatmalar — navbat bilan aylanadi */
export const GENERAL = [
  { id: "g-state", text: "Kartalar — maqsad emas. Vazifa: to'g'ri javob paytidagi holatni xato paytidagidan ajratish." },
  { id: "g-attach", text: "Natijaga bog'lanmang. To'g'ri chiqdi — quvonmang, xato chiqdi — xafa bo'lmang." },
  { id: "g-body", text: "Tanangizga quloq soling: oq kartada qanday tuyg'u bor, qorada qanday? Farqni kuzating." },
  { id: "g-gap", text: "Savol — javob, savol — javob. Orada bo'shliq qoldirmang: bo'shliqni aql to'ldiradi." },
  { id: "g-loud", text: "Ba'zi variantlar ko'zga urilib turadi, ba'zisi jimgina. Qaysi biri sizni aldayotganini kuzating." },
  { id: "g-calm", text: "Sokinlik — bu nazorat. Sezgi holatidagi odam xotirjam bo'ladi." },
  { id: "g-tired", text: "Charchadingizmi? Majburlab davom etmang — majburiy mashq foyda bermaydi." },
  { id: "g-know", text: "Shkafga qaraganda \"balki shkafdir\" demaysiz — bilasiz. Kartaga ham shunday qarang." },
];

/* Vaziyatga qarab chiqadigan maslahatlar */
const RULES = [
  {
    id: "r-wrong", kind: "warn",
    when: (c) => c.wrongStreak >= 4,
    text: "Ketma-ket xato — bu ham natija. Xafa bo'lmang: tushkunlik ham, quvonch ham sezgini bir xil o'chiradi.",
  },
  {
    id: "r-right", kind: "good",
    when: (c) => c.rightStreak >= 4,
    text: "Ketma-ket to'g'ri! Quvonishga shoshilmang — shu ondagi ichki holatingizni eslab qoling. Asosiy ish shu.",
  },
  {
    id: "r-slow", kind: "warn",
    when: (c) => c.recentAvg !== null && c.recentAvg > SLOW_MS,
    text: "Pauza — mantiqqa ochilgan eshik. Sezgi javobni darhol beradi; cho'zilgan o'ylash allaqachon aql.",
  },
  {
    id: "r-missed", kind: "note",
    when: (c) => c.recentMissed >= 2,
    text: "Ulgurmayapsizmi? Bu yomon emas — vaqt aqlga yetmayapti. Kelgan birinchi tuyg'uni bosing.",
  },
  {
    id: "r-changed", kind: "warn",
    when: (c) => c.recentChanged >= 3,
    text: "Birinchi turtkini tez-tez o'zgartiryapsiz. Bir necha urinish birinchi javobga ishonib ko'ring — keyin solishtirasiz.",
  },
  {
    id: "r-fastgood", kind: "good",
    when: (c) => c.recentAvg !== null && c.recentAvg < FAST_MS && c.rightStreak >= 2,
    text: "Tez va aniq — mana shu holat. Uni eslab qoling: keyin hayotdagi qarorlarga shu holatni ko'chirasiz.",
  },
  {
    id: "r-low", kind: "warn",
    when: (c) => c.n >= 25 && c.acc <= c.chance - 18,
    text: "Aql bo'sh joyni o'z xayoli bilan to'ldiryapti. Bir nafas oling va davom eting — tasodifdan pastlik ham signal.",
  },
  {
    id: "r-high", kind: "good",
    when: (c) => c.n >= 25 && c.acc >= c.chance + 15,
    text: "Tasodifdan barqaror yuqoridasiz. Ayni damdagi holatni eslab qoling — bu sizning ish holatingiz.",
  },
];

/* Kontekstni hisoblash */
export function buildCtx(results, times, chance) {
  const n = results.length;
  let rightStreak = 0, wrongStreak = 0;
  for (let i = n - 1; i >= 0 && results[i].correct; i--) rightStreak++;
  for (let i = n - 1; i >= 0 && !results[i].correct; i--) wrongStreak++;
  const last5 = results.slice(-5);
  const recentMissed = last5.filter((r) => r.missed).length;
  const recentChanged = last5.filter((r) => r.changed).length;
  const t5 = times.slice(-5).filter((x) => typeof x === "number" && x > 0);
  const recentAvg = t5.length >= 3 ? t5.reduce((a, b) => a + b, 0) / t5.length : null;
  const correct = results.filter((r) => r.correct).length;
  const acc = n ? Math.round((correct / n) * 100) : 0;
  return { n, rightStreak, wrongStreak, recentMissed, recentChanged, recentAvg, acc, chance };
}

/* Navbatdagi maslahatni tanlaydi (yoki null).
   state: { lastAt, shownIds } — chaqiruvchi tomonda saqlanadi. */
export function nextTip(ctx, state) {
  const { n } = ctx;
  if (n < 5) return null;                       // boshida bezovta qilmaymiz
  if (n - (state.lastAt || 0) < COOLDOWN) return null;

  // 1) Vaziyatga mos qoida (takrorlanmagani afzal)
  const fits = RULES.filter((r) => r.when(ctx));
  const fresh = fits.filter((r) => !state.shownIds.includes(r.id));
  const rule = fresh[0] || fits[0];
  if (rule) return { id: rule.id, text: rule.text, kind: rule.kind };

  // 2) Aks holda — davriy umumiy eslatma
  if (n % PERIOD !== 0) return null;
  const unseen = GENERAL.filter((g) => !state.shownIds.includes(g.id));
  const pool = unseen.length ? unseen : GENERAL;
  const g = pool[Math.floor(n / PERIOD) % pool.length];
  return { id: g.id, text: g.text, kind: "note" };
}
