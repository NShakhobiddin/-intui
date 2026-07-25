# Intui — Ichki sezgingizni uyg'oting

Ichki sezgini mashq qilish o'yini: tizim yashirin kartani tanlaydi, siz uni sezishga harakat qilasiz. Natijalar vaqt, kayfiyat va rejim bo'yicha tahlil qilinadi.

Claude Design (claude.ai/design) prototipi asosida React + Vite'da qurilgan mobil-format veb-ilova.

## Ekranlar

- **Onboarding** — Welcome ("Qanday ishlaydi?" sheet bilan) → Nickname (mehmon rejimi ham bor)
- **Bosh sahifa** — kunlik challenge (100 urinish), Aniqlik/Streak kartalari, AI tavsiya, rejimlar
- **Rejim tanlash** — 5 rejim: Oq-qora, Rangli, Shaklli, Tezkor, Birinchi sezgi; kartalar sonini sozlash
- **O'yin** — kayfiyat tanlash (yoki o'zingiz yozish) → 3 soniyalik fokus → bitta yopiq karta + tanlov tugmalari → darhol ochilish → avtomatik keyingi urinish. Tezkor rejimda taymer, Birinchi sezgida tanlovni tasdiqlash/o'zgartirish. Istalgan payt "Yakunlash va statistikani ko'rish"
- **Statistika** — Bugun/Hafta/Oy, aniqlik vs tasodif, vaqt/kayfiyat/rejim bo'yicha, birinchi tanlov tahlili, AI tahlil
- **Reyting** — uch bo'lim: **Rekordlar** (shaxsiy eng yaxshi natijalar — qaysi kun, qaysi vaqt, qanday holatda), **Onlayn** (hozir ilovada turgan foydalanuvchilar), **Faollar** (eng ko'p soat mashq qilganlar reytingi). Onlayn/Faollar bo'limlari faqat Supabase sozlangan bo'lsa ko'rinadi.
- **Profil** — streak, kunlik mashq daqiqalari, yutuqlar (badge), sezgi jurnali, progressni tozalash

Barcha ma'lumotlar faqat foydalanuvchining o'z natijalari — ilova bo'sh holatda boshlanadi va har bir sessiya qurilmaning `localStorage` xotirasida avtomatik saqlanadi. Supabase sozlangan bo'lsa (quyiga qarang), Profilda email+parol bilan hisob ochib natijalarni bulutda saqlash va boshqa qurilmada davom ettirish mumkin.

## Tuzilma

- `web/` — ilova manbasi (index.html, src, public)
- Repo ildizidagi `index.html`, `assets/`, `sw.js` va boshqalar — **CI avtomatik commit qiladigan build natijasi** (qo'lda tahrirlamang). Bu GitHub Pages "Deploy from a branch" rejimida ham tayyor ilova ochilishi uchun kerak; Pages "GitHub Actions" rejimida esa artifact orqali deploy bo'ladi — ikkala rejimda ham sayt ishlaydi.

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ ga production build
npm run preview  # buildni lokal ko'rish
```

## Telegram Mini App

Ilova Telegram bot orqali ochilishga moslangan:

- Foydalanuvchi ismi Telegramdan avtomatik olinadi (nickname so'ralmaydi)
- Natijalar **Telegram CloudStorage**'da saqlanadi — foydalanuvchi botni istalgan qurilmada ochsa, progress o'zi tiklanadi (hech qanday ro'yxatdan o'tish kerak emas)
- O'yin paytida Telegramning o'z "Orqaga" tugmasi ishlaydi, to'g'ri/noto'g'ri javobda haptic vibratsiya beriladi
- Ekran Telegram viewport'iga moslanadi, pastga surib yopish o'chirilgan

Botga ulash (BotFather orqali):

1. Telegramda [@BotFather](https://t.me/BotFather) ga `/newbot` yozib bot yarating.
2. `/newapp` buyrug'i bilan botga Mini App qo'shing — Web App URL sifatida `https://nshakhobiddin.github.io/-intui/` ni kiriting (rasm/gif so'ralganda ixtiyoriy yuklang). Bot `t.me/<bot>/<app>` havola oladi.
3. Qo'shimcha: `/mybots → bot → Bot Settings → Menu Button → Edit Menu Button URL` ga ham shu URLni qo'ysangiz, chatdagi pastki tugma ilovani ochadi.

Oddiy brauzerda ochilganda ilova avvalgidek ishlayveradi (localStorage + ixtiyoriy Supabase).

## Do'st bilan o'ynash (onlayn sezgi dueli)

Bosh sahifadagi "Do'st bilan o'ynash" — ikki kishilik onlayn rejim:

- Bir tomon kartani yashirin tanlaydi ("Hissiyotingizni yuboring"), ikkinchi tomon sezib topadi ("Do'stingizni his eting"). Har raundda rollar almashadi.
- Rejimlar: Oq-qora, Rangli, Shaklli. Ikkala o'yinchida qaysi karta yashirilgani/tanlangani reveal paytida ko'rinadi (guesser oldindan ko'rmaydi).
- Do'stni **taklif havolasi** yoki 5 belgili **kod** orqali chaqirish mumkin; ikkala o'yinchining ismi ko'rinadi.
- **Suhbat (chat)** — jonli duel paytida yuqoridagi 💬 tugmasi orqali do'st bilan yozishib turish mumkin. Xabarlar real vaqtda (Supabase Realtime kanali) yetkaziladi; chat yopiq bo'lsa yangi xabarlar soni tugmada belgi bo'lib chiqadi.

Ikki rejim bor va ilova avtomatik moslashadi:

1. **Jonli (Supabase bilan)** — ikki o'yinchi bir vaqtda, real vaqtda o'ynaydi (Supabase Realtime kanali). Supabase sozlangan bo'lsa ishlaydi.
2. **Telegram orqali navbatli (backendsiz)** — hech qanday server kerak emas: siz kartani yashirasiz → ilova "chaqiruv" havolasini yasaydi → uni Telegramda do'stingizga yuborasiz → do'st ochib sezib topadi → natija havolasini qaytaradi. Yashirin karta havola ichida yengil shifrlanadi (jiddiy himoya emas — do'stona o'yin uchun). Supabase yo'q bo'lsa yoki lobbydagi "Yoki Telegram orqali navbat bilan" tanlansa shu rejim ishlaydi.

- Ixtiyoriy: `VITE_TG_LINK` env o'zgaruvchisiga bot Mini App havolasini bersangiz (masalan `https://t.me/YourBot/app`), taklif/chaqiruv havolasi Telegram deep-link (`?startapp=…`) bo'lib, do'st bosishi bilan to'g'ridan-to'g'ri ilovada ochiladi. Berilmasa, veb-URL (`?g=…`) ishlatiladi.

## Yo'riqnoma (alohida bo'lim)

Bosh sahifadagi "Yo'riqnoma" — sezgini qanday mashq qilish bo'yicha interaktiv qo'llanma. Uch bo'limdan iborat:

- **Asos** — nega sezgi kerak: ma'lumot to'lqini → shubha → xato qilish qo'rquvi → harakatsizlik zanjiri; "sarob yoki voha" masali; diqqat qonuni. Shu yerda kimga hozir tavsiya etilmasligi (ruhiy salomatlik bo'yicha davolanayotganlar va h.k.) va halol o'lchov haqida izoh bor: bitta sessiya hech narsani isbotlamaydi, tasodifdan barqaror yuqori aniqlik — haqiqiy signal.
- **7 qoida** — tezkor o'rganish metodikasi sezgi mashqiga moslashtirilgan (yig'iladigan kartalar). Har bir qoida ilovaning tegishli imkoniyatiga bog'langan: takror → streak, hissiyot → kayfiyat belgilash, tahlil → statistika.
- **Amaliyot** — ishlaydigan **nafas (markazlashuv) mashqi** (4 s oling · 4 ushlang · 6 chiqaring, 4 sikl, animatsiyali doira), 5 qadamli mashq halqasi va saqlanadigan kunlik reja (checklist `localStorage`da).

Manba: Mirzakarim Norbekov, «Опыт дурака 6. Как работает интуиция» (AST, 2021). Bo'limdagi matn — shu metodika asosida yozilgan **original qo'llanma**, kitobdan ko'chirma emas.

## Jamoaviy intuitsiya (dumaloq stol, 30 kishigacha)

Bosh sahifadagi "Jamoaviy intuitsiya" — bir havola orqali **30 kishigacha** bir "dumaloq stol"ga yig'iladigan guruh rejimi (Supabase kerak):

- Qo'shilganlar hammada dumaloq stol ko'rinishida ko'rinib turadi (Realtime *presence*).
- Galma-gal har bir ishtirokchiga **10 soniya** "his qilish" navbati beriladi — o'sha payt qolganlar ham meva tanlaydi.
- Tanlov — **6 ta meva**: 🍎 Olma, 🍌 Banan, 🍇 Uzum, 🍊 Apelsin, 🍓 Qulupnay, 🍉 Tarvuz.
- Navbat tugagach hammaga o'sha raundda kim qaysi mevani tanlagani ochiladi va **jamoaviy rezonans** (necha kishi navbatdagi odam bilan bir xil his qilgani) ko'rinadi. Shu tartibda barcha ishtirokchi bir marta his qilib chiqadi.
- Oxirida umumiy rezonans foizi va har navbat bo'yicha natija chiqadi.

Boshlovchi (stol egasi) navbatlarni boshqaradi; ishtirokchilar **taklif havolasi** yoki 5 belgili **kod** bilan qo'shiladi. Havola `VITE_TG_LINK` bo'lsa Telegram deep-link (`?startapp=TM…`), aks holda veb-URL (`?tm=…`) bo'ladi. Bu rejim alohida jadval talab qilmaydi — faqat Realtime kanaldan foydalanadi.

## Hamjamiyat: onlaynlar, faollar reytingi va chat

Supabase sozlangan bo'lsa uchta jamoaviy imkoniyat yoqiladi:

- **Onlaynlar** — ilova ochilishi bilan foydalanuvchi `intui-online` Realtime *presence* kanaliga qo'shiladi. Reyting → Onlayn bo'limida hozir turganlar ro'yxati va soni real vaqtda ko'rinadi.
- **Eng faol foydalanuvchilar** — har bir foydalanuvchining jami mashq soatlari `profiles` jadvaliga yoziladi (`upsert`), Reyting → Faollar bo'limi esa ularni soat bo'yicha tartiblab ko'rsatadi.
- **Duel chati** — do'st bilan jonli o'ynashda xabarlar o'yin kanalining broadcast'i orqali almashiladi (alohida jadval kerak emas).

Foydalanuvchi identifikatori Telegram `user.id` (bo'lsa) yoki lokal `intui_uid` UUID orqali barqaror bo'ladi. `profiles` jadvaliga anonim yozishga ruxsat berilgan (mehmon rejimi uchun) — bu qat'iy xavfsiz emas, lekin do'stona ilova uchun yetarli; hech qachon `sb_secret_…` kalitini mijozda ishlatmang, faqat `anon`/`sb_publishable_…` kalitini bering.

## Bulut sinxronlashni yoqish (Supabase)

Backend ixtiyoriy — kalitlar berilmasa ilova faqat lokal rejimda ishlaydi.

1. [supabase.com](https://supabase.com) da bepul hisob va yangi project oching.
2. Dashboard'da **SQL Editor** bo'limiga `supabase/schema.sql` faylini joylashtirib **Run** bosing. Fayl `states` (bulut sinxronlash) va `profiles` (faollar reytingi) jadvallarini yaratadi — hamjamiyat imkoniyatlari uchun bu faylni (yangilangan bo'lsa qayta) ishga tushiring.
3. **Authentication → Sign In / Up → Email** bo'limida **Confirm email** ni o'chiring (aks holda har bir foydalanuvchi emailini tasdiqlashi kerak bo'ladi — xohlasangiz yoqiq qoldiring, ilova buni ham qo'llaydi).
4. **Project Settings → API** dan **Project URL** va **anon/public key** ni oling.
5. GitHub repoda **Settings → Secrets and variables → Actions** ga ikkita secret qo'shing:
   - `VITE_SUPABASE_URL` — Project URL
   - `VITE_SUPABASE_ANON_KEY` — anon key
6. **Actions → Deploy to GitHub Pages → Run workflow** bilan deployni qayta ishga tushiring.

Shundan so'ng Profil sahifasida "Bulutda saqlash" bo'limi paydo bo'ladi. Lokal ishlatish uchun loyiha ildizida `.env.local` faylga shu ikki o'zgaruvchini yozish kifoya.
