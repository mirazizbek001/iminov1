# Bon-Bon — shu yangilanishda nimalar o'zgardi

## DEPLOYDAN OLDIN MAJBURIY
Railway → web service → Variables bo'limida **`SECRET_KEY`** bo'lishi shart.
Endi u yo'q bo'lsa server ishga tushmaydi (oldin ochiq standart kalit ishlatilardi va
sessiya cookie'larini soxtalashtirish mumkin edi).
Yaratish: `python -c "import secrets; print(secrets.token_urlsafe(50))"`

## 1-bosqich: xavfsizlik
- Login, ro'yxatdan o'tish, parolni almashtirish, ota-ona kirishi va farzandni bog'lashga
  urinishlar cheklandi: bitta username uchun 10/daqiqa, bitta IP uchun 100/daqiqa
  (`backend/plat/throttles.py`). Limitdan oshsa, tushunarli xabar chiqadi.
- Parol qoidasi: kamida 6 ta belgi; `123456`, `qwerty` kabi oson parollar, faqat raqamli
  parollar, bir xil belgilardan iborat va username/emailga o'xshash parollar rad etiladi
  (`backend/plat/passwords.py`). Eski foydalanuvchilarning mavjud parollari o'zgarmaydi.
- `/plat/users/` endi faqat tizimga kirgan bola akkauntlari uchun (oldin hamma uchun ochiq edi).
- `start.sh` ga `createcachetable` qo'shildi (urinishlarni hisoblash uchun umumiy kesh jadvali).
- Testlar yangilandi va yangi xavfsizlik testlari qo'shildi (`SecurityHardeningTests`).

## 2-bosqich: tezlik
- Admin, Ota-ona, Xabarlar va Profil sahifalari lazy yuklanadi (boshlang'ich JS kichrayadi).
- Bosh sahifa feed'i 8 tadan bo'laklab chiziladi, pastga tushganda keyingisi qo'shiladi.
- `useMemo` bilan feed har renderda qayta tuzilmaydi.
- Post, avatar, bildirishnoma va xabar rasmlariga `loading="lazy"` va `decoding="async"`.

## Tekshirish
1. `cd backend && python manage.py test plat` (testlar shu muhitda ishga tushirilmagan, Django o'rnatilmagan edi).
2. `cd frontend/react && npm ci && npm run build` (build ham shu muhitda bajarilmagan, faqat JSX sintaksisi tekshirilgan).
3. Deploydan keyin: login'da parolni 11 marta xato kiriting, 429 xabari chiqishi kerak;
   yangi akkauntni `123456` parol bilan ochib ko'ring, rad etilishi kerak.

## Animatsiyalar (yengil, faqat transform/opacity; `prefers-reduced-motion` hurmat qilinadi)
- Yoqtirish (yurakcha) bosilganda qisqa "pop" (PostActions, `.bb-heart-pop`).
- Bosh sahifada postlar 50 ms oraliq bilan pastdan yumshoq chiqadi (`.bb-feed-in`).
- Sahifa yuklanayotganda "Yuklanmoqda…" o'rniga skeleton (`.bb-skel`).
- Kunlik limit tugashiga 5 daqiqa qolganda pastda "Vaqt tugayapti: M:SS" belgisi (sekin puls).
- Ortiqcha harakat olib tashlandi: pufakchalar faqat kirish sahifasida; feed postlari hoverda
  sakramaydi; hech narsa qilmayotgan (keyframes e'lon qilinmagan) `bb-glow-breathe` qoidalari o'chirildi.
- Tugma bosilganda siqilish (`button:active`) avvaldan bor edi, o'zgartirilmadi.

## Rangli bolalar uslubi (ichki sahifalar)
- Maskot (`components/Mascot.jsx`): mobil sarlavhada va bo'sh feed holatida.
- Mobil sarlavha sariq, pastki menyu suzuvchi oq "tabletka" (faol sahifa pushti).
- Orqa fon: yumshoq pushti/sariq/firuza/binafsha dog'lar (`.app-shell::before`), Reels'da o'chiq.
- Feed kartalari yumaloq va har biri navbatma-navbat pushti / firuza / sariq / binafsha ramkali.
- Story halqasi pushti-sariq, story qatori sariq ramkali.
- Post tugmalari matnli tabletkalar: Yoqdi, Izoh, ulashish, saqlash (`.bb-chip`).
- Qolgan vaqt belgisi doim ko'rinadi (firuza); oxirgi 5 daqiqada to'q sariq, sekundlab sanaydi va pulsatsiya qiladi.
- Sarlavha va tugmalarda `Baloo 2` shrifti.
- Eslatma: matn rangi butun saytda oq bo'lgani uchun asosiy fon sariq emas, to'q ko'k qoldi;
  sariq faqat sarlavha va aksentlarda.

## Kuchaytirish va 4 ta xavfli joyni tekshirish
Chrome'da (320, 360, 390 px) CSS fayllari bilan sinov sahifasi orqali tekshirildi (Tailwind o'rniga qo'lda
yozilgan utility'lar bilan, shuning uchun taxminiy; haqiqiy `npm run build` natijasini o'zingiz ko'ring).
- Qolgan vaqt belgisi: bosh sahifada (telefon) sarlavhada ixcham "24 daq"; boshqa sahifalarda faqat
  oxirgi 5 daqiqada pastda (menyudan 12 px yuqorida); Reels'da ham faqat shoshilinch paytda; kompyuterda
  o'ng yuqori burchakda. Pastki menyu va xabar yozish maydoni bilan ustma-ust tushmaydi.
- Kartalar: rasm/reels rangli ramka ichiga to'liq sig'adi, burchaklari yumaloq kesiladi.
- `!important`: sarlavha, menyu, story halqasi, kartalar va yon menyuning ranglari kutilgandek
  chiqishi o'lchab tasdiqlandi (kuchliroq selektorlar bilan).
- "Yoqdi / Izoh" tabletkalari 320 px da ham bitta qatorda; 400 px dan pastda ixchamlashadi.
- Yangi: salomlashuv banneri ("Salom, ...!" + Post/Story tugmalari, tor ekranda 2 qator),
  kompyuter yon menyusida maskot va faol bo'lim pushti.

## Yagona dizayn: "uzum-binafsha + konfet" (3-bosqich)
- Asos ko'k fon o'rniga chuqur uzum-binafsha (#2b1b4d). Sariq/pushti/firuza/binafsha aksentlar endi
  to'q fonda aniq ajralib turadi. Barcha eski ko'k ranglar (~350 ta joy) bitta palitraga almashtirildi:
  `tailwind.config.js` (neutral), `App.css` (`--bb-*`), `index.html`, `manifest.webmanifest`.
  Ranglarni o'zgartirish uchun shu joylarga qarang.
- Kirish sahifasi: maskot (bir marta sakrab chiqadi) va "stiker" soyali BonBon yozuvi.
- Kirish imkoniyati: klaviatura fokusi oldin butunlay o'chirilgan edi (`outline: none !important`) va
  barcha tugmalardagi soyalar ham o'chib qolgan edi. Endi sichqoncha bosganda ramka chiqmaydi, Tab bilan
  yurganda sariq halqa ko'rinadi.
- Kontrast: oq matnli pushti tugmalar (#ff4f87 → #db2f6b), shoshilinch vaqt belgisi (oq o'rniga to'q matn).
- Yon menyuda BonBon yozuvi sariq; feed kartalariga yengil "qalin" soya.
- Tekshirilmagan: `npm run build` bu muhitda ishlamadi (tarmoq yo'q). Faqat CSS Chrome'da statik
  sahifada ko'rildi (390 px). Deploydan oldin `npm ci && npm run build` ni ishga tushiring.

## CyberKid (nom, logotip va kiber dizayn)
- Nom: Bon-Bon / BonBon → **CyberKid** (ekranda, manifest, sarlavha, hujjatlar). Ichki kalitlar
  (`instakids-*`, localStorage va kesh nomlari) o'zgartirilmadi, chunki ular foydalanuvchi ma'lumotlariga bog'langan.
- Logotip: olti burchak ichida "C" va yonib turuvchi kursor (`components/LogoMark.jsx`). Favicon, PWA ikonkalari
  (`public/`) va to'liq logo (`logo-full.svg`) yangilandi. Eski maskot (yumaloq yuz) olib tashlandi.
- Bosh sahifadagi "Salom, …! Post / Story" banneri olib tashlandi. Post/story yaratish yo'qolmasligi uchun
  yon menyuda "Yaratish" tugmasi va mobil sarlavhada "+" tugmasi qo'shildi.
- Dizayn: to'q navy asos, neon firuza/magenta/laym aksentlar, sarlavhalarda Chakra Petch shrifti.
  Kirish sahifasi va ota-ona paneli ham shu uslubga o'tkazildi. Barcha stillar `src/cyberkid.css` va `App.css`.
- Tekshirilmagan: `npm run build` bu muhitda ishlamadi. Deploydan oldin `npm ci && npm run build`.

## Kosmos video fon + yon menyu animatsiyalari
- Butun saytga fixed video fon: `components/SpaceBackground.jsx`, fayllar `public/space-bg.mp4` (15 MB → 3.8 MB, 1280p, ping-pong loop) va `space-poster.jpg`. `prefers-reduced-motion` bo'lsa faqat rasm; tab yashirin bo'lsa video to'xtaydi. Reels qora fonda qoladi.
- Kartalar, yon menyu, sarlavha va pastki menyu "shisha" (blur) uslubiga o'tdi, o'qilish uchun qorong'i qoplama qo'shildi (`.ck-space-shade`).
- Yon menyu ikonkalari hoverda har xil animatsiya qiladi (sakrash, urish, yurak urishi, qidiruv tebranishi, xat uchishi, silkinish, aylanish); faqat transform, 4px dan oshmaydi, menyudan chiqib ketmaydi.
- Tekshirilmagan: `npm run build` (tarmoq yo'q). JSX sintaksisi va CSS brauzerda alohida tekshirildi.
