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

Barcha ma'lumotlar faqat foydalanuvchining o'z natijalari — ilova bo'sh holatda boshlanadi va har bir sessiya qurilmaning `localStorage` xotirasida avtomatik saqlanadi (server yo'q; boshqa qurilmada sinxronlash uchun backend kerak bo'ladi).

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ ga production build
npm run preview  # buildni lokal ko'rish
```
