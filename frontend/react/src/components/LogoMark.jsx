import { useId } from "react";

// CyberKid belgisi: olti burchak ichida "C" va yonib turuvchi kursor (buyruq qatori).
export function LogoMark({ size = 40, className = "" }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="CyberKid logotipi"
      className={className}
    >
      <defs>
        <linearGradient id={`ck-${id}`} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2de2ff" />
          <stop offset="1" stopColor="#e020b4" />
        </linearGradient>
      </defs>
      <polygon
        points="32,3.5 57,18 57,46 32,60.5 7,46 7,18"
        fill="#0b1020"
        stroke={`url(#ck-${id})`}
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path
        d="M43 23.5 A13.5 13.5 0 1 0 43 40.5"
        fill="none"
        stroke="#2de2ff"
        strokeWidth="5.6"
        strokeLinecap="round"
      />
      <rect x="37.5" y="29.5" width="9" height="5.5" rx="1.2" fill="#e020b4" className="ck-cursor" />
    </svg>
  );
}

// Belgi + yozuv. Yozuv matn sifatida (ekran o'quvchilar va nusxalash uchun).
export default function Wordmark({ size = 36, className = "", textClass = "" }) {
  return (
    <span className={`ck-wordmark ${className}`}>
      <LogoMark size={size} />
      <span className={`ck-wordmark-text ${textClass}`} style={{ fontSize: size * 0.62 }}>
        Cyber<span className="ck-kid">Kid</span>
      </span>
    </span>
  );
}
