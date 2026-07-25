/* ===== Intui — Yo'riqnoma =====
   Mirzakarim Norbekovning "Opыt duraka 6. Kak rabotaet intuitsiya"
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

// Muammo zanjiri — kitobning kirish tahlili
const CHAIN = [
  { icon: "wave", t: "Ma'lumot to'lqini", d: "Har kuni oqim ortadi va u qarama-qarshi." },
  { icon: "spiral", t: "Shubha", d: "O'z fikringizga, qaroringizga, o'zingizga ishonmay qolasiz." },
  { icon: "bolt", t: "Xato qilish qo'rquvi", d: "«Balki boshqacha qilganim to'g'riroq bo'larmidi?»" },
  { icon: "moon", t: "Harakatsizlik", d: "«Ertaga», «keyin», «dushanbadan» — eng shirin va'da." },
];

// Yetti qoida — tezkor o'rganish metodikasi, mashqqa moslashtirilgan
const RULES = [
  {
    n: 1, t: "Bo'sh mashq bo'lmasin",
    s: "Har bir urinishdan ma'no qidiring",
    d: "Oltin izlovchi qumni yuvib, metallni ajratadi. Ma'lumot ham shunday: uni o'zingiz elab, o'zingiz ajratganingizda qiymati bir necha barobar oshadi. Tayyor holda berilgan bilim — birovning bilimi; o'zingiz qazib olganingiz — sizniki.",
    app: "Statistika bo'limida natijalaringizni o'zingiz tahlil qiling",
  },
  {
    n: 2, t: "Qiziqarli bo'lsin",
    s: "Foydali narsa zerikarli bo'lsa, u ishlamaydi",
    d: "Miya quruq takrordan himoyalanadi — u shunchaki o'chib qoladi. Shuning uchun foydali narsa qiziqarli, qiziqarli narsa foydali bo'lishi kerak. Mashqni o'yinga aylantiring, o'zgartirib turing.",
    app: "Rejimlarni almashtiring: Oq-qora, Rangli, Shaklli, Tezkor",
  },
  {
    n: 3, t: "Sodda til",
    s: "O'zingizga sodda so'z bilan tushuntiring",
    d: "Murakkab atamalar hurkitadi va foydali ish koeffitsiyentini nolga tushiradi. Sezgingizni «energiya oqimi» deb emas, «ko'krak qafasim tinch edi» deb yozing. Sodda so'z — aniq kuzatuv.",
    app: "Jurnalga oddiy, o'z so'zingiz bilan yozing",
  },
  {
    n: 4, t: "Takror — bilim onasi",
    s: "Kamida uch marta qayting",
    d: "Birinchi marta — «bu ishlamaydi» deb o'ylaysiz. Ikkinchi marta — «balki mendadir muammo» deysiz. Uchinchi marta — to'siq deb bilganingiz aslida o'z xayolingiz bo'lganini ko'rasiz. Bir sessiya hech narsani hal qilmaydi, muntazamlik hal qiladi.",
    app: "Kunlik streak — har kuni kichik bo'lsa ham qayting",
  },
  {
    n: 5, t: "Tugallanmagan qoldiring",
    s: "Miyaga chala berilgan ovqat o'zi chaynaladi",
    d: "Tayyor, yopilgan javob ongdan sirg'alib o'tadi — «buni allaqachon bilaman». Ochiq qolgan savol esa ichkarida ishlashda davom etadi. Shuning uchun bir necha yo'nalishni parallel oling, hammasini birdaniga yakunlamang.",
    app: "Sessiyani cho'zmang — orada dam bering, savol ochiq qolsin",
  },
  {
    n: 6, t: "Hissiyot bilan o'rang",
    s: "Hissiz ma'lumot esda qolmaydi",
    d: "O'tgan yilgi oddiy darsni eslay olmaysiz, ammo kuchli hayajon bergan kunni bir umr eslaysiz. Xotira ma'lumotni his bilan birga saqlaydi. Shuning uchun har mashqni qanday holatda bajarganingizni belgilang — keyin qaysi holat sizga aniqlik berishini ko'rasiz.",
    app: "Mashq oldidan kayfiyatni tanlang — bu bekorga emas",
  },
  {
    n: 7, t: "Mehr va quvonch bilan",
    s: "Eng muhim qoida",
    d: "Chiroyli, lekin bo'sh idishmi yoki oddiy, lekin javohirga to'la ko'zami — qaysi birini tanlaysiz? Shakl emas, mazmun hal qiladi. Mashqni «tekshiruv» deb emas, o'zingiz bilan uchrashuv deb bajaring. Tashvish bilan qilingan mashq faqat tashvishni o'lchaydi.",
    app: "Shoshilmang. Yomon kayfiyatda majburlab mashq qilmang",
  },
];

// Amaliyot halqasi
const STEPS = [
  { n: 1, icon: "lotus", t: "Tinchlaning", d: "Shoshilgan holatda intuitsiya emas, tashvish gapiradi. Avval tanani bo'sh qo'ying — quyidagi nafas mashqi shuning uchun." },
  { n: 2, icon: "target", t: "Savolni aniq qo'ying", d: "Noaniq savolga noaniq javob keladi. «Karta qaysi rangda?» — aniq savol. «Hayotim qanday bo'ladi?» — javobi tekshirib bo'lmaydigan savol." },
  { n: 3, icon: "star4", t: "Birinchi turtkini ushlang", d: "Aql bahslasha boshlagunga qadar kelgan birinchi javob — eng qimmatlisi. «Yo'q, mantiqan bu bo'lishi kerak» deb uni almashtirmang." },
  { n: 4, icon: "check", t: "Darhol tekshiring", d: "Tekshiruvsiz mashq — xayolparastlik. Har urinishdan keyin natijani ko'ring: shu bilan sezgi va taxminni ajratishni o'rganasiz." },
  { n: 5, icon: "pencil", t: "Yozib boring", d: "Qaysi holatda, qaysi soatda aniqroq chiqdi? Jurnal — sizning shaxsiy xaritangiz. Xotira aldaydi, yozuv aldamaydi." },
];

const TODO = [
  "Bugun 1 ta qisqa sessiya bajardim",
  "Mashqdan oldin nafasni tinchlantirdim",
  "Natijani jurnalga yozdim",
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
  const [i, setI] = React.useState(0);      // umumiy faza indeksi
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
    tick.current = setInterval(() => {
      setLeft(Math.max(0, p.sec - Math.floor((Date.now() - t0) / 1000)));
    }, 200);
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

/* ---------- Yig'iladigan karta ---------- */
function RuleCard({ r, open, onToggle }) {
  return (
    <div className={"g-rule" + (open ? " open" : "")}>
      <button className="g-rule-head" onClick={onToggle} aria-expanded={open}>
        <span className="g-num">{r.n}</span>
        <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <span className="g-rule-t">{r.t}</span>
          <span className="g-rule-s">{r.s}</span>
        </span>
        <span className="g-chev"><Ic name="chevR" size={18} color="var(--faint)" /></span>
      </button>
      {open ? (
        <div className="g-rule-body">
          <p>{r.d}</p>
          <div className="g-app"><Ic name="sparkle" size={14} color="var(--accent)" />{r.app}</div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Ekran ---------- */
export function GuideScreen({ onExit, onStartPractice }) {
  const [tab, setTab] = React.useState("asos");
  const [openRule, setOpenRule] = React.useState(1);
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

        {/* Sarlavha */}
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Logo size={52} /></div>
          <h1 className="t-title" style={{ marginTop: 10 }}>Sezgini qanday mashq qilish kerak</h1>
          <div className="g-quote">
            «Nima mashq qilinsa — o'sha rivojlanadi»
            <span>Mirzakarim Norbekov metodikasi asosida</span>
          </div>
        </div>

        <div className="seg" style={{ marginTop: 18 }}>
          {[["asos", "Asos"], ["qoida", "7 qoida"], ["amaliyot", "Amaliyot"]].map(([id, l]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)} style={{ fontSize: 13.5 }}>{l}</button>
          ))}
        </div>

        {/* ============ ASOS ============ */}
        {tab === "asos" ? (
          <div style={{ marginTop: 18 }}>
            <div className="g-sec">Nega sezgi kerak?</div>
            <p className="g-p">
              Bugun ma'lumot har qachongidan ko'p, lekin u qarama-qarshi. Shu sababli
              ichimizda zanjir ishga tushadi:
            </p>
            <div className="g-chain">
              {CHAIN.map((c, i) => (
                <div key={c.t} className="g-chain-row">
                  <div className="g-chain-ic"><Ic name={c.icon} size={19} color="var(--accent)" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="g-chain-t">{c.t}</div>
                    <div className="t-micro" style={{ marginTop: 2 }}>{c.d}</div>
                  </div>
                  {i < CHAIN.length - 1 ? <span className="g-chain-arrow">↓</span> : null}
                </div>
              ))}
            </div>
            <p className="g-p">
              Oqibat — o'z hayotini yashamay, oqim bo'ylab suzish. Intuitsiya esa
              shovqin ichidan kerakli signalni ajratadigan filtr: u ishlab tursa,
              siz tomoshabin emas, o'z hayotingizning muallifiga aylanasiz.
            </p>

            <div className="g-sec">Sarob yoki voha?</div>
            <div className="g-parable">
              <p>Shogird so'radi: «Cho'ldagi vohani sarobdan qanday ajrataman?»</p>
              <p>Ustoz javob berdi: «Unga tomon yur. Sarob baribir tarqaladi. Voha esa yaqinlashganing sari yo'qolmaydi.»</p>
              <p className="g-parable-end">Nazariya bilan emas — qadam bilan bilinadi.</p>
            </div>

            <div className="g-sec">Diqqat qonuni</div>
            <p className="g-p">
              Har birimizda ham kuch, ham zaiflik bor. Diqqatni qayerga yo'naltirsak,
              o'sha tomon o'sadi. Shuning uchun mashqda «yana xato qildim» emas,
              «bu safar nimani sezdim» degan savolni qo'ying.
            </p>

            <div className="g-note">
              <div className="g-note-h"><Ic name="question" size={17} color="var(--warn)" /> Kimga hozir tavsiya etilmaydi</div>
              <ul>
                <li>Ruhiy salomatlik bo'yicha shifokor nazoratida bo'lsangiz yoki shunga oid dori qabul qilayotgan bo'lsangiz — avval shifokoringiz bilan maslahatlashing.</li>
                <li>Har bir so'zdan xafa bo'ladigan kayfiyatda bo'lsangiz — mashq foyda bermaydi, avval dam oling.</li>
                <li>Faqat «bo'lmaydi» degan xulosani isbotlash uchun bo'lsa — sinab ko'rmasdan xulosa chiqarilmaydi.</li>
              </ul>
            </div>

            <div className="g-honest">
              <Ic name="target" size={16} color="var(--cyan)" />
              <span>Halol o'lchov: bitta sessiya hech narsani isbotlamaydi. Aniqligingiz uzoq muddatda tasodif darajasidan barqaror yuqori bo'lsa — bu haqiqiy signal. Ilova buni siz uchun hisoblab boradi.</span>
            </div>
          </div>
        ) : null}

        {/* ============ 7 QOIDA ============ */}
        {tab === "qoida" ? (
          <div style={{ marginTop: 18 }}>
            <p className="g-p" style={{ marginTop: 0 }}>
              Kitobdagi «tezkor o'rganish» metodikasi — sezgi mashqiga moslashtirilgan.
              Har bir qoidani ochib ko'ring.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
              {RULES.map((r) => (
                <RuleCard key={r.n} r={r} open={openRule === r.n}
                  onToggle={() => setOpenRule(openRule === r.n ? 0 : r.n)} />
              ))}
            </div>
          </div>
        ) : null}

        {/* ============ AMALIYOT ============ */}
        {tab === "amaliyot" ? (
          <div style={{ marginTop: 18 }}>
            <div className="g-sec" style={{ marginTop: 0 }}>Avval — markazlashuv</div>
            <Breath />

            <div className="g-sec">Mashq halqasi</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {STEPS.map((s) => (
                <div key={s.n} className="g-step">
                  <div className="g-step-ic"><Ic name={s.icon} size={20} color="var(--accent)" /><span>{s.n}</span></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="g-step-t">{s.t}</div>
                    <p className="t-sub" style={{ fontSize: 13.5, marginTop: 3, lineHeight: 1.5 }}>{s.d}</p>
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
              <GlowButton icon="sparkle" onClick={onStartPractice}>Mashqni boshlash</GlowButton>
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
