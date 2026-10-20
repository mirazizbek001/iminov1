import { useEffect, useRef, useState } from "react";

// Butun sayt uchun fixed kosmos video fon. Video yuklanmasa yoki "harakatni kamaytirish"
// yoqilgan bo'lsa, faqat poster rasm ko'rinadi.
export default function SpaceBackground() {
  const ref = useRef(null);
  const [still, setStill] = useState(() => {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const v = ref.current;
    if (!v || still) return;
    const sync = () => (document.hidden ? v.pause() : v.play().catch(() => setStill(true)));
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [still]);

  return (
    <div className="ck-space" aria-hidden="true">
      {!still && (
        <video
          ref={ref}
          className="ck-space-video"
          src="/space-bg.mp4"
          poster="/space-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
        />
      )}
      {still && <div className="ck-space-video ck-space-still" />}
      <div className="ck-space-shade" />
    </div>
  );
}
