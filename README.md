# Intui — Ichki sezgingizni uyg'oting

Ichki sezgini mashq qilish o'yini: tizim yashirin kartani tanlaydi, siz uni sezishga harakat qilasiz. Natijalar vaqt, kayfiyat va rejim bo'yicha tahlil qilinadi.

Claude Design (claude.ai/design) prototipi asosida React + Vite'da qurilgan mobil-format veb-ilova.

## Ekranlar

- **Onboarding** — Welcome ("Qanday ishlaydi?" sheet bilan) → Nickname (mehmon rejimi ham bor)
- **Bosh sahifa** — kunlik challenge (100 urinish), Aniqlik/Streak kartalari, AI tavsiya, rejimlar
- **Rejim tanlash** — 5 rejim: Oq-qora, Rangli, Shaklli, Tezkor, Birinchi sezgi; kartalar sonini sozlash
- **O'yin** — kayfiyat tanlash (yoki o'zingiz yozish) → 3 soniyalik fokus → bitta yopiq karta + tanlov tugmalari → darhol ochilish → avtomatik keyingi urinish. Tezkor rejimda taymer, Birinchi sezgida tanlovni tasdiqlash/o'zgartirish. Istalgan payt "Yakunlash va statistikani ko'rish"
- **Statistika** — Bugun/Hafta/Oy, aniqlik vs tasodif, vaqt/kayfiyat/rejim bo'yicha, birinchi tanlov tahlili, AI tahlil
- **Eng yaxshi natijalar** — shaxsiy rekordlar: qaysi kun, qaysi vaqt, qanday holatda
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
- Realtime aloqa **Supabase Realtime** kanali orqali — shuning uchun bu funksiya Supabase sozlanganda ishlaydi (quyiga qarang). Supabase yo'q bo'lsa, ekranda tushuntirish chiqadi.
- Ixtiyoriy: `VITE_TG_LINK` env o'zgaruvchisiga bot Mini App havolasini bersangiz (masalan `https://t.me/YourBot/app`), taklif havolasi Telegram deep-link (`?startapp=<kod>`) bo'lib, do'st bosishi bilan xonaga avtomatik qo'shiladi. Berilmasa, veb-URL (`?room=<kod>`) ishlatiladi.

## Bulut sinxronlashni yoqish (Supabase)

Backend ixtiyoriy — kalitlar berilmasa ilova faqat lokal rejimda ishlaydi.

1. [supabase.com](https://supabase.com) da bepul hisob va yangi project oching.
2. Dashboard'da **SQL Editor** bo'limiga `supabase/schema.sql` faylini joylashtirib **Run** bosing.
3. **Authentication → Sign In / Up → Email** bo'limida **Confirm email** ni o'chiring (aks holda har bir foydalanuvchi emailini tasdiqlashi kerak bo'ladi — xohlasangiz yoqiq qoldiring, ilova buni ham qo'llaydi).
4. **Project Settings → API** dan **Project URL** va **anon/public key** ni oling.
5. GitHub repoda **Settings → Secrets and variables → Actions** ga ikkita secret qo'shing:
   - `VITE_SUPABASE_URL` — Project URL
   - `VITE_SUPABASE_ANON_KEY` — anon key
6. **Actions → Deploy to GitHub Pages → Run workflow** bilan deployni qayta ishga tushiring.

Shundan so'ng Profil sahifasida "Bulutda saqlash" bo'limi paydo bo'ladi. Lokal ishlatish uchun loyiha ildizida `.env.local` faylga shu ikki o'zgaruvchini yozish kifoya.
