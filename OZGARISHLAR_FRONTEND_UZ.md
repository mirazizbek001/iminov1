# Frontend yangilanishi (16+ prezentatsiya)

- `src/components/Landing.jsx` + `src/landing.css`: yangi bosh sahifa. Kirmagan mehmon avval shuni ko'radi
  (jonli kunlik vaqt soati, telefon ichida lenta, kun tartibi, ota-onalar paneli namunasi).
- `App.jsx`: landing -> "Kirish" / "Ro'yxatdan o'tish" -> Auth.
- `Shared.jsx` (Auth): "Men 16 yoshga to'lganman" tasdig'i, yangi tagline, "Bosh sahifaga qaytish".
- `index.html`, `manifest.webmanifest`: sarlavha va tavsif 16+ ga moslandi.

Tekshirish: `cd frontend/react && npm ci && npm run build` (bu muhitda npm registriga ruxsat yo'q edi,
shuning uchun to'liq build bajarilmadi; landing alohida yig'ilib brauzerda sinaldi, o'zgargan fayllar sintaksisi tekshirildi).
Eslatma: backend `plat/safety.py` ichidagi "7+" filtr izohi va matnlari o'zgartirilmagan.
