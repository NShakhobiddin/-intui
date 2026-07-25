/* ===== Intui — Yo'riqnoma =====
   Mirzakarim Norbekovning "Опыт дурака 6. Как работает интуиция"
   kitobidagi metodika asosida tayyorlangan interaktiv qo'llanma.
   Matn — original (kitobdan ko'chirma emas), g'oyalar manbaga tegishli. */
import React from "react";
import { Ic, Logo, BackBtn, GlowButton } from "../ui.jsx";

const GKEY = "intui_guide_v1";
function loadGuide() {
  try { return JSON.parse(localStorage.getItem(GKEY)) || {}; } catch (e) { return {}; }
}
function saveGuide(v) {
  try { localStorage.setItem(GKEY, JSON.stringify(v)); } catch (e) { /* ignore */ }
}

/* ---------- Mazmun ---------- */

// Intuitsiya qanday paytlarda o'zini ko'rsatadi
const WAYS = [
  { icon: "fire", t: "Kuchli hissiyot", d: "Sevgi yoki o'lim xavfi kabi cho'qqi holatlarda o'zi yonadi — lekin buni boshqarib bo'lmaydi." },
  { icon: "bolt", t: "Haddan tashqari zo'riqish", d: "Asab tizimi \"uzilganda\" — dejavyu shu. Foydali, ammo ishonchsiz yo'l." },
  { icon: "dumbbell", t: "Zerikarli muntazam mashq", d: "Yagona boshqariladigan yo'l. Sekin, lekin sizni egasiga aylantiradi.", hi: true },
];

// Mashqlar — kitobdagi nomlangan mashqlar, ilova rejimlariga bog'langan
const EXERCISES = [
  {
    id: "truth", n: 1, t: "Haqiqat / Yolg'on", icon: "yinyang",
    s: "Eng birinchi va eng muhim mashq",
    steps: [
      "Avval ikki kartani — oq va qorani — ochiq holda kuzating. Oqqa qaraganingizda tanangizda qanday tuyg'u paydo bo'ladi? Qoraga-chi? Farqni bir necha marta kuzating.",
      "Endi yopiq kartani torting. O'zingizga quloq soling va rangni ayting.",
      "Kartani oching, tekshiring. To'g'risini bir tomonga, xatosini boshqa tomonga ajrating.",
      "Foizni yozib boring. Bu — sizning kundalik o'lchovingiz.",
    ],
    note: "Keyinchalik oq-qoraga istalgan qarama-qarshilikni bog'lash mumkin: haqiqat—yolg'on, mumkin—mumkin emas, ha—yo'q, foydali—zararli.",
    mode: "bw", cta: "Oq-qora mashqini boshlash",
  },
  {
    id: "foresee", n: 2, t: "Oldindan ko'rish", icon: "spiral",
    s: "Bir necha soniya oldinga qarash",
    steps: [
      "Kartaga tegmasdan turib, uni qanday olayotganingizni, ag'darayotganingizni va rangini ko'rayotganingizni tasavvur qiling.",
      "Xuddi bir necha soniya oldinga mo'ralagandek.",
      "Endi haqiqatda torting va tekshiring.",
    ],
    note: "Bu mashq \"kelajak xotirasi\"ni ochadi — dastlab bir necha soniya, keyin uzunroq.",
    mode: "bw", cta: "Oq-qora bilan sinash",
  },
  {
    id: "know", n: 3, t: "\"Bilish\" holati", icon: "brain",
    s: "Juda oddiy va ayni paytda juda qiyin",
    steps: [
      "Atrofga qarang: shkaf, kitob, gul, oyna. Siz ularni o'ylab topmaysiz — shunchaki bilasiz.",
      "O'sha paytdagi holatingizni eslang: hech qanday shubha, hissiyot, ichki bahs yo'q. Xotirjam va befarq bilish.",
      "Endi xuddi shu holatni kartaga nisbatan yarating: siz uning rangini allaqachon bilasiz.",
      "Savol — javob. Savol — javob. Orada bo'shliq qoldirmang.",
    ],
    note: "Bu holat barcha mashqlarning kalitiga aylanadi.",
    mode: "bw", cta: "Sinab ko'rish",
  },
  {
    id: "trans", n: 4, t: "Translyatsiya", icon: "duo",
    s: "Ikki kishilik mashq",
    steps: [
      "Bir kishi kartani ko'radi va uning rangini sherigiga fikran uzatadi.",
      "Ikkinchisi qabul qiladi va aytadi.",
      "Uzatuvchi ichida ijodkor holatini saqlaydi, tashqi ko'rinishi esa mutlaqo xotirjam bo'ladi.",
      "Sherikka natijani darrov aytmang — uning hissiyoti ulanib qolmasin.",
    ],
    note: "Ilovada bu \"Do'st bilan o'ynash\" rejimi — aynan shu mashqning raqamli ko'rinishi.",
    duo: true, cta: "Do'st bilan o'ynash",
  },
];

// Bosqichma-bosqich murakkablashtirish
const LADDER = [
  { t: "Oq-qora", d: "Barcha asos shu yerda. 80–90% aniqlikkacha shu bosqichda qoling.", app: "Oq-qora rejimi", gate: true },
  { t: "Ranglar", d: "Endi tuslar bor — nozikroq farqlash boshlanadi.", app: "Rangli rejimi" },
  { t: "Shakl va raqamlar", d: "Ko'p variantli tanlov: mantiq oldinga chiqmoqchi bo'ladi.", app: "Shaklli rejimi" },
  { t: "Hissiyotlar", d: "Kartada — kayfiyat. Endi holatni holat bilan o'qiysiz.", app: "Jamoaviy rejim (mevalar)" },
  { t: "Manzaralar", d: "Tog', dala, ko'l — to'liq tasvirni sezish. Eng yuqori bosqich.", app: "Kitobdagi keyingi bosqich" },
];

// Hayotdagi mashqlar
const LIFE = [
  { icon: "user", t: "Uydan chiqishdan oldin", d: "Birinchi kim uchraydi — erkakmi, ayolmi, bolami? Chiqing va tekshiring." },
  { icon: "clock", t: "Transport kutayotganda", d: "Keyingi mashinada haydovchi kim? Nechta odam bor? Bo'sh vaqt mashqqa aylanadi." },
  { icon: "target", t: "Yo'lda", d: "\"Shuncha soniyadan keyin qizil mashina o'tadi\" — his qiling va sanang." },
  { icon: "question", t: "Muhim suhbatda", d: "Odam chiroyli gapirayotganda ichki ovoz nima deyapti? Keyin natijani solishtiring." },
];

// Intuitsiya dushmanlari
const ENEMIES = [
  { n: 1, t: "Aql va mantiq", d: "Sezgi jim, aql esa baland ovozda gapiradi. Sezgi ishlamasa, aql bo'sh joyni o'z xayoli bilan to'ldiradi va uni \"javob\" deb taqdim etadi.", fix: "Aqlni dushman deb bilmang — shunchaki unga navbatni birinchi bermang." },
  { n: 2, t: "Pauza", d: "Eng nozik dushman. Oltinchi tuyg'u uchun vaqt kerak emas — javob darhol keladi. Mantiqqa esa doim vaqt kerak. Har bir pauza — mantiqqa ochilgan eshik.", fix: "Javobni cho'zmang. Ikkilanish boshlansa — bu allaqachon sezgi emas." },
  { n: 3, t: "Kuchli istak", d: "Istak — natijaga hissiy bog'lanish. \"Topsam edi\" degan kuchli xohish sezgining ingichka ovozini bosib ketadi.", fix: "Non sotib olgandek qarang: oddiy ish, bayram emas." },
  { n: 4, t: "Hissiyot", d: "Quvonch ham, tushkunlik ham bir xil to'sqinlik qiladi. Ketma-ket uch marta topsangiz \"men zo'rman\", uch marta yanglishsangiz \"men qobiliyatsizman\" — ikkalasi ham sezgini o'chiradi.", fix: "Tahlil paytida bosh sovuq bo'lsin. Ichkarida — bilishga chanqoqlik, tashqarida — xotirjamlik." },
  { n: 5, t: "Xato qilish qo'rquvi", d: "Eng qattiq dushman, chunki u qolgan to'rttasini o'z ichiga oladi. Hatto zararsiz karta mashqida ham \"noto'g'ri aytsamchi\" degan qo'rquv paydo bo'ladi.", fix: "O'zingizga xato qilishga ruxsat bering. Faqat to'g'ri javob istagan odam erkin emas.", hard: true },
];

// Mashq qiluvchilarning xatolari
const MISTAKES = [
  { t: "Tizimni tushunmay turib \"yaxshilash\"", d: "Bir necha oydan keyin \"men tushundim\" deb boshqa usullarni aralashtirish boshlanadi. Turli xil mazali taomlarni bitta qozonga solib aralashtirsangiz nima chiqadi?", fix: "Yaxshi shogirdning uch sifati: diqqat, sabr va izchillik. Bir so'z bilan — intizom." },
  { t: "Majburlab ishlash", d: "O'zingizni doim majburlasangiz, tashlab yuborish ehtimoli 99,9%. Bu sezgiga ham, sportga ham, biznesga ham tegishli.", fix: "Mashq zavq bersin. Zerikdingizmi — rejimni o'zgartiring, lekin tashlamang." },
  { t: "O'ziga ishonmaslik", d: "\"Balki\", \"ehtimol\", \"menimcha shunday\" — bu so'zlar ishni boshlashdan oldin uni tugatadi.", fix: "Yangi ishni boshlaganda ichingizda bir gramm ham shubha qolmasin." },
];

const TODO = [
  "Bugun 1 ta qisqa sessiya bajardim",
  "Mashqdan oldin holatimni tinchlantirdim",
  "To'g'ri javob paytidagi holatimni eslab qoldim",
];

/* ---------- Nafas (markazlashuv) mashqi ---------- */
const BREATH = [
  { key: "in", label: "Nafas oling", sec: 4, scale: 1 },
  { key: "hold", label: "Ushlab turing", sec: 4, scale: 1 },
  { key: "out", label: "Sekin chiqaring", sec: 6, scale: 0.55 },
];
const CYCLES = 4;

function Breath() {
  const [on, setOn] = React.useState(false);
  const [i, setI] = React.useState(0);
  const [left, setLeft] = React.useState(BREATH[0].sec);
  const timer = React.useRef(null);
  const tick = React.useRef(null);

  const total = BREATH.length * CYCLES;
  const ph = BREATH[i % BREATH.length];
  const cycle = Math.floor(i / BREATH.length) + 1;

  const stop = React.useCallback(() => {
    clearTimeout(timer.current); clearInterval(tick.current);
    setOn(false); setI(0); setLeft(BREATH[0].sec);
  }, []);

  React.useEffect(() => () => { clearTimeout(timer.current); clearInterval(tick.current); }, []);

  React.useEffect(() => {
    if (!on) return;
    const p = BREATH[i % BREATH.length];
    setLeft(p.sec);
    const t0 = Date.now();
    tick.current = setInterval(() => setLeft(Math.max(0, p.sec - Math.floor((Date.now() - t0) / 1000))), 200);
    timer.current = setTimeout(() => {
      clearInterval(tick.current);
      if (i + 1 >= total) { stop(); return; }
      setI(i + 1);
    }, p.sec * 1000);
    return () => { clearTimeout(timer.current); clearInterval(tick.current); };
  }, [on, i, total, stop]);

  return (
    <div className="panel breath-box">
      <div className="breath-stage">
        <span className={"breath-orb" + (on ? " run" : "")}
          style={on ? { transform: `scale(${ph.scale})`, transitionDuration: ph.sec + "s" } : undefined} />
        <div className="breath-mid">
          {on ? (
            <React.Fragment>
              <div className="breath-sec">{left}</div>
              <div className="breath-lbl">{ph.label}</div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Ic name="lotus" size={30} color="var(--accent)" />
              <div className="breath-lbl" style={{ marginTop: 6 }}>Markazlashuv</div>
            </React.Fragment>
          )}
        </div>
      </div>
      {on ? (
        <React.Fragment>
          <div className="breath-dots">
            {Array.from({ length: CYCLES }, (_, k) => <span key={k} className={k < cycle ? "on" : ""} />)}
          </div>
          <button className="btn-ghost" style={{ minHeight: 44, marginTop: 12 }} onClick={stop}>To'xtatish</button>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p className="t-sub" style={{ fontSize: 13.5, textAlign: "center", marginTop: 12 }}>
            4 soniya oling · 4 ushlang · 6 chiqaring. {CYCLES} marta — mashqdan oldin.
          </p>
          <button className="btn-ghost" style={{ minHeight: 46, marginTop: 12 }}
            onClick={() => { setI(0); setOn(true); }}>Boshlash</button>
        </React.Fragment>
      )}
    </div>
  );
}

/* ---------- Hissiyot mayatnigi ---------- */
const SWINGS = [
  { side: "up", label: "Quvonch", emoji: "😄", d: "Yelkangizni to'g'rilang, tabassum qiling. Eng yaxshi xabarni eshitgandek quvoning." },
  { side: "down", label: "Tushkunlik", emoji: "😔", d: "Yelkangizni tushiring. Hammasi bekor bo'lgandek his qiling." },
  { side: "up", label: "Zavq", emoji: "🤩", d: "Yana ko'taring: osmon moviy, quyosh charaqlab turibdi, siz tiriksiz!" },
  { side: "down", label: "G'azab", emoji: "😠", d: "Endi jahl: adolatsizlik, achchiq. Uni to'liq his qiling." },
  { side: "calm", label: "Shtil", emoji: "🌊", d: "Endi to'xtang. Ichkarida to'liq sokinlik. Mana shu — sezgi holati." },
];

function Pendulum() {
  const [on, setOn] = React.useState(false);
  const [i, setI] = React.useState(0);
  const [left, setLeft] = React.useState(12);
  const timer = React.useRef(null);
  const tick = React.useRef(null);
  const SEC = 12;

  const stop = React.useCallback(() => {
    clearTimeout(timer.current); clearInterval(tick.current);
    setOn(false); setI(0); setLeft(SEC);
  }, []);
  React.useEffect(() => () => { clearTimeout(timer.current); clearInterval(tick.current); }, []);

  React.useEffect(() => {
    if (!on) return;
    setLeft(SEC);
    const t0 = Date.now();
    tick.current = setInterval(() => setLeft(Math.max(0, SEC - Math.floor((Date.now() - t0) / 1000))), 250);
    timer.current = setTimeout(() => {
      clearInterval(tick.current);
      if (i + 1 >= SWINGS.length) { setOn(false); setI(0); setLeft(SEC); return; }
      setI(i + 1);
    }, SEC * 1000);
    return () => { clearTimeout(timer.current); clearInterval(tick.current); };
  }, [on, i, stop]);

  const s = SWINGS[i];
  return (
    <div className="panel pend-box">
      {on ? (
        <React.Fragment>
          <div className={"pend-track " + s.side}>
            <span className="pend-ball">{s.emoji}</span>
          </div>
          <div className="pend-lbl">{s.label}</div>
          <p className="t-sub" style={{ fontSize: 13.5, textAlign: "center", marginTop: 6, minHeight: 40 }}>{s.d}</p>
          <div className="pend-steps">
            {SWINGS.map((_, k) => <span key={k} className={k <= i ? "on" : ""} />)}
          </div>
          <div className="pend-sec">{left}</div>
          <button className="btn-ghost" style={{ minHeight: 44, marginTop: 10 }} onClick={stop}>To'xtatish</button>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, fontSize: 26 }}>
            <span>😄</span><span>😔</span><span>🤩</span><span>😠</span><span>🌊</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, textAlign: "center", marginTop: 10 }}>Hissiyot mayatnigi</div>
          <p className="t-sub" style={{ fontSize: 13.5, textAlign: "center", marginTop: 6 }}>
            Hissiyotni ataylab u yoqdan-bu yoqqa tebrating, so'ng to'satdan to'xtating.
            Qolgan sokinlik — sezgi ishlaydigan holat.
          </p>
          <button className="btn-ghost" style={{ minHeight: 46, marginTop: 12 }} onClick={() => { setI(0); setOn(true); }}>
            Boshlash · 1 daqiqa
          </button>
        </React.Fragment>
      )}
    </div>
  );
}

/* ---------- Yig'iladigan karta ---------- */
function Fold({ n, t, s, children, open, onToggle, tone }) {
  return (
    <div className={"g-rule" + (open ? " open" : "") + (tone === "hard" ? " hard" : "")}>
      <button className="g-rule-head" onClick={onToggle} aria-expanded={open}>
        <span className="g-num">{n}</span>
        <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <span className="g-rule-t">{t}</span>
          {s ? <span className="g-rule-s">{s}</span> : null}
        </span>
        <span className="g-chev"><Ic name="chevR" size={18} color="var(--faint)" /></span>
      </button>
      {open ? <div className="g-rule-body">{children}</div> : null}
    </div>
  );
}

/* ---------- Ekran ---------- */
export function GuideScreen({ onExit, onStartMode, onDuo }) {
  const [tab, setTab] = React.useState("asos");
  const [openEx, setOpenEx] = React.useState(1);
  const [openEn, setOpenEn] = React.useState(0);
  const [openMs, setOpenMs] = React.useState(0);
  const [g, setG] = React.useState(loadGuide);

  const done = g.done || [];
  const toggleTodo = (i) => {
    const next = done.includes(i) ? done.filter((x) => x !== i) : [...done, i];
    const ng = { ...g, done: next };
    setG(ng); saveGuide(ng);
  };
  const progress = Math.round((done.length / TODO.length) * 100);

  return (
    <div className="screen" data-screen-label="Yo'riqnoma">
      <div className="screen-pad-nonav">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BackBtn onClick={onExit} />
          <span style={{ fontSize: 18, fontWeight: 700 }}>Yo'riqnoma</span>
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Logo size={52} /></div>
          <h1 className="t-title" style={{ marginTop: 10 }}>Sezgini qanday mashq qilish kerak</h1>
          <div className="g-quote">
            «Kartalar — maqsad emas, sezgiga ochilgan eshik»
            <span>Mirzakarim Norbekov metodikasi asosida</span>
          </div>
        </div>

        <div className="seg" style={{ marginTop: 18 }}>
          {[["asos", "Asos"], ["mashq", "Mashqlar"], ["tosiq", "To'siqlar"], ["holat", "Holat"]].map(([id, l]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)} style={{ fontSize: 12.5 }}>{l}</button>
          ))}
        </div>

        {/* ============ ASOS ============ */}
        {tab === "asos" ? (
          <div style={{ marginTop: 18 }}>
            <div className="g-key">
              <div className="g-key-h"><Ic name="star4" size={17} color="var(--accent)" /> Eng muhim qoida</div>
              <p>
                Vazifa — iloji boricha ko'proq kartani topish <b>emas</b>. Vazifa —
                to'g'ri javob kelgan paytdagi <b>ichki holatingizni</b> ushlab, eslab qolish.
                Va xato qilgan paytdagi holatdan uni <b>ajrata bilish</b>.
              </p>
              <p style={{ marginTop: 8 }}>
                Kartalar shunchaki asbob. Siz ular orqali o'zingiz bilan tanishasiz.
                Topgan holatingizni keyin hayotga — muhim qarorlarga ko'chirasiz.
              </p>
            </div>

            <div className="g-sec">Sezgi qachon ishlaydi?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {WAYS.map((w) => (
                <div key={w.t} className={"g-chain-row" + (w.hi ? " hi" : "")}>
                  <div className="g-chain-ic"><Ic name={w.icon} size={19} color={w.hi ? "var(--accent)" : "var(--muted)"} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="g-chain-t">{w.t}</div>
                    <div className="t-micro" style={{ marginTop: 2, lineHeight: 1.45 }}>{w.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="g-sec">Natijaga bog'lanmang</div>
            <p className="g-p">
              To'g'ri chiqdi — quvonmang. Xato chiqdi — xafa bo'lmang.
              Quvonch ham, tushkunlik ham bir xil darajada sezgini o'chiradi.
              Sizning ishingiz — kuzatish va eslab qolish.
            </p>

            <div className="g-sec">Sarob yoki voha?</div>
            <div className="g-parable">
              <p>Shogird so'radi: «Cho'ldagi vohani sarobdan qanday ajrataman?»</p>
              <p>Ustoz javob berdi: «Unga tomon yur. Sarob baribir tarqaladi. Voha esa yaqinlashganing sari yo'qolmaydi.»</p>
              <p className="g-parable-end">Nazariya bilan emas — qadam bilan bilinadi.</p>
            </div>

            <div className="g-note">
              <div className="g-note-h"><Ic name="question" size={17} color="var(--warn)" /> Kimga hozir tavsiya etilmaydi</div>
              <ul>
                <li>Ruhiy salomatlik bo'yicha shifokor nazoratida bo'lsangiz yoki shunga oid dori qabul qilayotgan bo'lsangiz — avval shifokoringiz bilan maslahatlashing.</li>
                <li>Ichkaridan yoki tepadan kelayotgan "ovozlar" bo'lmasligi kerak. Mashq ovozlarni emas, <b>tuyg'u va holatni</b> kuzatishga qaratilgan.</li>
                <li>Charchagan yoki asabiy holatda majburlab mashq qilmang — foyda bermaydi.</li>
              </ul>
            </div>

            <div className="g-honest">
              <Ic name="target" size={16} color="var(--cyan)" />
              <span>Halol o'lchov: bitta sessiya hech narsani isbotlamaydi. Aniqligingiz uzoq muddatda tasodif darajasidan barqaror yuqori bo'lsa — bu haqiqiy signal. Ilova buni siz uchun hisoblab boradi.</span>
            </div>
          </div>
        ) : null}

        {/* ============ MASHQLAR ============ */}
        {tab === "mashq" ? (
          <div style={{ marginTop: 18 }}>
            <p className="g-p" style={{ marginTop: 0 }}>
              Kitobdagi asosiy mashqlar. Har birini ochib, qadamlarni o'qing —
              so'ng shu yerdan ilovadagi mos rejimni ishga tushiring.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
              {EXERCISES.map((e) => (
                <Fold key={e.id} n={e.n} t={e.t} s={e.s}
                  open={openEx === e.n} onToggle={() => setOpenEx(openEx === e.n ? 0 : e.n)}>
                  <ol className="g-steps">
                    {e.steps.map((st, i) => <li key={i}>{st}</li>)}
                  </ol>
                  {e.note ? <div className="g-app"><Ic name="sparkle" size={14} color="var(--accent)" />{e.note}</div> : null}
                  <button className="g-launch" onClick={() => (e.duo ? onDuo() : onStartMode(e.mode))}>
                    <Ic name={e.icon} size={17} color="var(--accent)" />{e.cta}<Ic name="chevR" size={16} color="var(--faint)" />
                  </button>
                </Fold>
              ))}
            </div>

            <div className="g-sec">Bosqichma-bosqich</div>
            <div className="g-ladder">
              {LADDER.map((l, i) => (
                <div key={l.t} className={"g-lad" + (l.gate ? " gate" : "")}>
                  <div className="g-lad-n">{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="g-lad-t">{l.t}</div>
                    <div className="t-micro" style={{ marginTop: 2, lineHeight: 1.45 }}>{l.d}</div>
                    <div className="g-lad-app">{l.app}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="g-honest" style={{ marginTop: 12 }}>
              <Ic name="badge" size={16} color="var(--cyan)" />
              <span>Shoshilmang: oq-qorada barqaror <b>80–90%</b> ga chiqmaguningizcha keyingi bosqichga o'tmang. Ranglarda allaqachon tuslar bor.</span>
            </div>

            <div className="g-sec">Hayotdagi mashqlar</div>
            <p className="g-p" style={{ marginTop: 0 }}>
              Kartalarning o'zi yetarli emas — uchrashuvda hech kim qo'lidan karta chiqarmaydi.
              Kartalar «ha/yo'q» ni ajratishni o'rgatadi, keyin buni hayotga ko'chirasiz.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 12 }}>
              {LIFE.map((l) => (
                <div key={l.t} className="g-chain-row">
                  <div className="g-chain-ic"><Ic name={l.icon} size={18} color="var(--accent)" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="g-chain-t">{l.t}</div>
                    <div className="t-micro" style={{ marginTop: 2, lineHeight: 1.45 }}>{l.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="t-micro" style={{ marginTop: 12, lineHeight: 1.6 }}>
              Bu yerda eng qimmatli mahorat — <b>sezgini xayoldan ajratish</b>. Erkak kutgandingiz,
              qarshingizdan it chiqdi? Ajoyib — aynan shu paytda farqni o'rganasiz.
            </p>
          </div>
        ) : null}

        {/* ============ TO'SIQLAR ============ */}
        {tab === "tosiq" ? (
          <div style={{ marginTop: 18 }}>
            <div className="g-sec" style={{ marginTop: 0 }}>Sezgining 5 dushmani</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {ENEMIES.map((e) => (
                <Fold key={e.n} n={e.n} t={e.t} tone={e.hard ? "hard" : null}
                  open={openEn === e.n} onToggle={() => setOpenEn(openEn === e.n ? 0 : e.n)}>
                  <p>{e.d}</p>
                  <div className="g-app"><Ic name="check" size={14} color="var(--accent)" />{e.fix}</div>
                </Fold>
              ))}
            </div>

            <div className="g-sec">Mashq qiluvchilarning 3 xatosi</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {MISTAKES.map((m, i) => (
                <Fold key={m.t} n={i + 1} t={m.t}
                  open={openMs === i + 1} onToggle={() => setOpenMs(openMs === i + 1 ? 0 : i + 1)}>
                  <p>{m.d}</p>
                  <div className="g-app"><Ic name="check" size={14} color="var(--accent)" />{m.fix}</div>
                </Fold>
              ))}
            </div>
          </div>
        ) : null}

        {/* ============ HOLAT ============ */}
        {tab === "holat" ? (
          <div style={{ marginTop: 18 }}>
            <div className="g-key">
              <div className="g-key-h"><Ic name="lotus" size={17} color="var(--accent)" /> Sokinlik — bu nazorat</div>
              <p>Sezgi holatida bo'lgan odam xotirjam bo'ladi. Shovqin ichkarida bo'lsa, ingichka ovoz eshitilmaydi.</p>
            </div>

            <div className="g-sec">1 · Nafas bilan markazlashuv</div>
            <Breath />

            <div className="g-sec">2 · Hissiyot mayatnigi</div>
            <Pendulum />

            <div className="g-sec">Uch yordamchi</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                { icon: "clock", t: "Vaqt", d: "O'zingizning eng aniq soatingizni toping — statistika buni ko'rsatib beradi." },
                { icon: "home", t: "Joy", d: "Bir xil, tinch joyda mashq qiling. Muhit holatni chaqiradi." },
                { icon: "brain", t: "Holat", d: "Uyqu bilan uyg'oqlik orasidagi chegara holat — sezgi eng ochiq payt." },
              ].map((x) => (
                <div key={x.t} className="g-chain-row">
                  <div className="g-chain-ic"><Ic name={x.icon} size={18} color="var(--accent)" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="g-chain-t">{x.t}</div>
                    <div className="t-micro" style={{ marginTop: 2, lineHeight: 1.45 }}>{x.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="g-sec">Bugungi kichik reja</div>
            <div className="panel" style={{ padding: "14px 16px" }}>
              <div className="hbar" style={{ marginBottom: 12 }}><i style={{ width: progress + "%" }}></i></div>
              {TODO.map((t, i) => {
                const on = done.includes(i);
                return (
                  <button key={i} className="g-check" onClick={() => toggleTodo(i)} aria-pressed={on}>
                    <span className={"g-box" + (on ? " on" : "")}>{on ? <Ic name="check" size={14} color="#1a1330" /> : null}</span>
                    <span style={{ flex: 1, textAlign: "left", opacity: on ? 0.55 : 1, textDecoration: on ? "line-through" : "none" }}>{t}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 16 }}>
              <GlowButton icon="sparkle" onClick={() => onStartMode("bw")}>Mashqni boshlash</GlowButton>
            </div>
          </div>
        ) : null}

        <p className="t-micro" style={{ textAlign: "center", marginTop: 22, opacity: 0.7, lineHeight: 1.6 }}>
          Manba: Mirzakarim Norbekov, «Опыт дурака 6. Как работает интуиция» (AST, 2021).
          Matn — shu metodika asosida yozilgan original qo'llanma.
        </p>
      </div>
    </div>
  );
}
