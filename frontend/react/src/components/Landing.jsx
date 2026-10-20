import { useEffect, useState } from "react";
import Wordmark from "./LogoMark";
import "../landing.css";

/* Ushbu fayl faqat react'ga tayanadi (ikonlar inline SVG), shuning uchun alohida ham yig'iladi. */

const Icon = ({ children, size = 20, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);
const IHeart = (p) => (
  <Icon {...p}>
    <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.8 3.6 5 6.6 5c2 0 3.9 1.1 5.4 3 1.5-1.9 3.4-3 5.4-3 3 0 4.9 2.8 3.8 6.1-1.7 4.8-9.2 9.4-9.2 9.4z" />
  </Icon>
);
const IChat = (p) => (
  <Icon {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z" />
  </Icon>
);
const ISend = (p) => (
  <Icon {...p}>
    <path d="M22 3 11 14" />
    <path d="M22 3l-7 18-4-7-7-4 18-7z" />
  </Icon>
);
const IPlay = (p) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="m10 9 5 3-5 3z" />
  </Icon>
);
const IShield = (p) => (
  <Icon {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.4 3.1 8.1 7.5 9.5 4.4-1.4 7.5-5.1 7.5-9.5V6z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Icon>
);
const IBlock = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m5.6 5.6 12.8 12.8" />
  </Icon>
);
const IClock = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);
const IPhone = (p) => (
  <Icon {...p}>
    <rect x="6" y="2.5" width="12" height="19" rx="3" />
    <path d="M11 18.5h2" />
  </Icon>
);

const pad = (n) => String(n).padStart(2, "0");

/* ---------- Hero: jonli kunlik vaqt soati ---------- */
const LIMIT_SECONDS = 60 * 60;

function SessionClock() {
  const [left, setLeft] = useState(42 * 60 + 17);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;
    const timer = setInterval(
      () => setLeft((value) => (value <= 1 ? LIMIT_SECONDS : value - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - left / LIMIT_SECONDS);
  const urgent = left <= 300;
  return (
    <div className="ln-clock ln-in ln-in-2" role="group" aria-label="Kunlik vaqt namunasi">
      <div className="ln-clock-bar">
        <span className="ln-dots" aria-hidden="true">
          <i /> <i /> <i />
        </span>
        <span className="ln-clock-title">bugungi_vaqt</span>
      </div>
      <div className="ln-clock-body">
        <div className="ln-ring">
          <svg viewBox="0 0 120 120" width="132" height="132" aria-hidden="true">
            <circle cx="60" cy="60" r={radius} className="ln-ring-track" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              className={`ln-ring-fill ${urgent ? "is-urgent" : ""}`}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="ln-ring-text">
            <b>
              {pad(Math.floor(left / 60))}:{pad(left % 60)}
            </b>
            <span>qoldi</span>
          </div>
        </div>
        <ul className="ln-log">
          <li>
            <span>08:00</span> Ilova ochildi
          </li>
          <li>
            <span>limit</span> 60 daqiqa
          </li>
          <li>
            <span>22:00</span> Yopiladi
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ---------- Hero: telefon ichidagi lenta ---------- */
const STORIES = ["Siz", "Dilya", "Jasur", "Madina", "Ravshan"];

function Phone() {
  return (
    <div className="ln-phone ln-in ln-in-1" aria-hidden="true">
      <div className="ln-phone-top">
        <Wordmark size={22} />
        <span className="ln-chip-time">
          <IClock size={13} /> 38 daq
        </span>
      </div>
      <div className="ln-stories">
        {STORIES.map((name, i) => (
          <div key={name} className="ln-story">
            <span className={`ln-story-ring ${i === 0 ? "is-me" : ""}`}>
              <span className="ln-story-face">{name[0]}</span>
            </span>
            <small>{name}</small>
          </div>
        ))}
      </div>
      <div className="ln-post">
        <div className="ln-post-head">
          <span className="ln-post-av">D</span>
          <div>
            <b>dilya.art</b>
            <small>2 soat oldin</small>
          </div>
        </div>
        <svg className="ln-post-img" viewBox="0 0 280 170" role="presentation">
          <rect width="280" height="170" fill="#1a2447" />
          <circle cx="206" cy="56" r="26" fill="#d02aa8" />
          <path d="M0 128 80 70l62 46 52-34 86 56v32H0z" fill="#2de2ff" opacity=".9" />
          <path d="M0 150l74-40 66 34 64-26 76 34v18H0z" fill="#0b1020" />
        </svg>
        <div className="ln-post-actions">
          <span className="ln-act is-on">
            <IHeart size={15} /> 128
          </span>
          <span className="ln-act">
            <IChat size={15} /> 14
          </span>
          <span className="ln-act">
            <ISend size={15} />
          </span>
        </div>
        <p className="ln-post-cap">Kechki tog‘lar. Bugun telefon bilan chizdim.</p>
      </div>
    </div>
  );
}

/* ---------- Ota-ona paneli namunasi (interaktiv) ---------- */
function ParentMock() {
  const [paused, setPaused] = useState(false);
  const [limit, setLimit] = useState(60);
  return (
    <div className="ln-pmock" role="group" aria-label="Ota-onalar paneli namunasi">
      <div className="ln-pmock-head">
        <span className="ln-pmock-av">A</span>
        <div>
          <b>Farzandingiz</b>
          <small className={paused ? "is-off" : "is-on"}>
            {paused ? "Pauzada: kira olmaydi" : "Hozir ruxsat etilgan"}
          </small>
        </div>
      </div>
      <div className="ln-pmock-row">
        <label htmlFor="ln-limit">Kunlik limit</label>
        <div className="ln-stepper">
          <button
            type="button"
            onClick={() => setLimit((v) => Math.max(15, v - 15))}
            aria-label="Limitni 15 daqiqaga kamaytirish"
          >
            −
          </button>
          <output id="ln-limit">{limit} daq</output>
          <button
            type="button"
            onClick={() => setLimit((v) => Math.min(240, v + 15))}
            aria-label="Limitni 15 daqiqaga oshirish"
          >
            +
          </button>
        </div>
      </div>
      <div className="ln-pmock-row">
        <span>Ochilish va yopilish</span>
        <span className="ln-pmock-val">08:00 – 22:00</span>
      </div>
      <button
        type="button"
        className={`ln-pause ${paused ? "is-paused" : ""}`}
        aria-pressed={paused}
        onClick={() => setPaused((v) => !v)}
      >
        {paused ? "Pauzani olib tashlash" : "Hozir pauza qilish"}
      </button>
    </div>
  );
}

export default function Landing({ onStart, onParent }) {
  return (
    <div className="ln">
      <a className="ln-skip" href="#ln-main">
        Asosiy qismga o‘tish
      </a>

      <header className="ln-nav">
        <Wordmark size={34} />
        <nav className="ln-nav-links" aria-label="Bo‘limlar">
          <a href="#nima">Nima bor</a>
          <a href="#kun">Kun tartibi</a>
          <a href="#ota-ona">Ota-onalar</a>
        </nav>
        <div className="ln-nav-cta">
          <button type="button" className="ln-btn ln-btn-quiet" onClick={() => onStart("login")}>
            Kirish
          </button>
          <button type="button" className="ln-btn ln-btn-main ln-hide-sm" onClick={() => onStart("register")}>
            Ro‘yxatdan o‘tish
          </button>
        </div>
      </header>

      <main id="ln-main">
        <section className="ln-hero">
          <div className="ln-hero-copy">
            <p className="ln-age">
              <IShield size={16} /> 16 yosh va undan katta o‘smirlar uchun
            </p>
            <h1 className="ln-h1">
              Do‘stlar bilan ulaning.
              <span>Vaqtni o‘zingiz boshqaring.</span>
            </h1>
            <p className="ln-lead">
              CyberKid — lenta, reels, story va chat bir joyda. Kunlik vaqt
              chegarasi, tungi yopilish va ota-onalar paneli ekran vaqtini
              nazoratda ushlaydi.
            </p>
            <div className="ln-cta">
              <button type="button" className="ln-btn ln-btn-main ln-btn-lg" onClick={() => onStart("register")}>
                Ro‘yxatdan o‘tish
              </button>
              <button type="button" className="ln-btn ln-btn-line ln-btn-lg" onClick={() => onStart("login")}>
                Kirish
              </button>
            </div>
            <p className="ln-parent-link">
              Ota-onamisiz?{" "}
              <button type="button" onClick={onParent}>
                Ota-onalar paneliga o‘ting
              </button>
            </p>
          </div>

          <div className="ln-hero-visual">
            <Phone />
            <SessionClock />
          </div>
        </section>

        <section className="ln-section" id="nima" aria-labelledby="ln-nima-h">
          <h2 className="ln-h2" id="ln-nima-h">
            Tanish tarmoq. Aniq qoidalar.
          </h2>
          <div className="ln-features">
            <article className="ln-feat ln-feat-big">
              <div className="ln-feat-icons">
                <IHeart size={22} />
                <IPlay size={22} />
              </div>
              <h3>Lenta, reels va story</h3>
              <p>
                Rasm va video joylang, do‘stlaringiznikini ko‘ring, izoh qoldiring.
                Story 24 soat ko‘rinadi.
              </p>
              <div className="ln-bars" aria-hidden="true">
                <i style={{ height: "46%" }} />
                <i style={{ height: "78%" }} />
                <i style={{ height: "58%" }} />
                <i style={{ height: "92%" }} />
                <i style={{ height: "66%" }} />
                <i style={{ height: "84%" }} />
                <i style={{ height: "50%" }} />
              </div>
            </article>

            <article className="ln-feat ln-feat-tint">
              <IChat size={22} />
              <h3>Xabar va qo‘ng‘iroq</h3>
              <p>Yozing, ovozli xabar yuboring yoki to‘g‘ridan-to‘g‘ri qo‘ng‘iroq qiling.</p>
            </article>

            <article className="ln-feat">
              <IShield size={22} />
              <h3>Toza muhit</h3>
              <p>
                Haqorat, noo‘rin so‘zlar va tashqi havolalar avtomatik filtrlanadi.
              </p>
            </article>

            <article className="ln-feat ln-feat-wide">
              <IBlock size={22} />
              <div>
                <h3>Bloklash va shikoyat</h3>
                <p>
                  Yoqmagan odamni bir bosishda bloklang. Qoidabuzar post yoki xabarga
                  shikoyat yuboring, administrator ko‘rib chiqadi.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="ln-section ln-day" id="kun" aria-labelledby="ln-kun-h">
          <div className="ln-day-copy">
            <h2 className="ln-h2" id="ln-kun-h">
              Kun cheksiz emas. Shunisi yaxshi.
            </h2>
            <p className="ln-body">
              Ilova kechasi yopiladi. Kun ichida esa kunlik vaqt chegarasi bor:
              u tugasa, tanaffus boshlanadi. Tashqi dunyo uchun ham vaqt qoladi.
            </p>
          </div>
          <div className="ln-day-viz">
            <div
              className="ln-track"
              role="img"
              aria-label="Sutka: 00:00 dan 08:00 gacha yopiq, 08:00 dan 22:00 gacha ochiq, 22:00 dan 24:00 gacha yopiq"
            >
              <span className="ln-seg ln-seg-closed" style={{ width: "33.33%" }} />
              <span className="ln-seg ln-seg-open" style={{ width: "58.34%" }}>
                ochiq
              </span>
              <span className="ln-seg ln-seg-closed" style={{ width: "8.33%" }} />
            </div>
            <div className="ln-ticks" aria-hidden="true">
              <span style={{ left: "0%" }}>00:00</span>
              <span style={{ left: "33.33%" }}>08:00</span>
              <span style={{ left: "91.67%" }}>22:00</span>
            </div>
            <dl className="ln-defs">
              <div>
                <dt>Ochilish va yopilish</dt>
                <dd>Odatda 08:00 – 22:00. Sozlanadi.</dd>
              </div>
              <div>
                <dt>Kunlik vaqt chegarasi</dt>
                <dd>Platforma yoki ota-ona belgilaydi.</dd>
              </div>
              <div>
                <dt>Tanaffus</dt>
                <dd>Chegara tugagach boshlanadi, ilova qolgan vaqtni ko‘rsatib turadi.</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="ln-parents" id="ota-ona" aria-labelledby="ln-ota-h">
          <div className="ln-parents-in">
            <div className="ln-parents-copy">
              <h2 className="ln-h2 ln-h2-dark" id="ln-ota-h">
                Ota-onalar uchun alohida panel
              </h2>
              <p className="ln-body ln-body-dark">
                Farzandning akkaunti panelga bog‘lanadi. Kunlik limit, tanaffus,
                ochilish va yopilish vaqtini ota-ona belgilaydi, kerak bo‘lsa
                bir tugma bilan pauza qiladi.
              </p>
              <ul className="ln-checks">
                <li>
                  <IClock size={18} /> Kunlik limit va tanaffus
                </li>
                <li>
                  <IPhone size={18} /> Ochilish va yopilish vaqti
                </li>
                <li>
                  <IBlock size={18} /> Bir tugma bilan pauza
                </li>
              </ul>
              <button type="button" className="ln-btn ln-btn-dark ln-btn-lg" onClick={onParent}>
                Ota-onalar paneliga o‘tish
              </button>
            </div>
            <ParentMock />
          </div>
        </section>

        <section className="ln-final" aria-labelledby="ln-final-h">
          <h2 className="ln-h2" id="ln-final-h">
            Boshlashga bir daqiqa yetadi.
          </h2>
          <p className="ln-body">Akkaunt oching, do‘stlaringizni toping.</p>
          <div className="ln-cta ln-cta-center">
            <button type="button" className="ln-btn ln-btn-main ln-btn-lg" onClick={() => onStart("register")}>
              Ro‘yxatdan o‘tish
            </button>
            <button type="button" className="ln-btn ln-btn-line ln-btn-lg" onClick={() => onStart("login")}>
              Kirish
            </button>
          </div>
        </section>
      </main>

      <footer className="ln-foot">
        <Wordmark size={26} />
        <p>16+ yoshdagi o‘smirlar uchun ijtimoiy tarmoq.</p>
      </footer>
    </div>
  );
}
