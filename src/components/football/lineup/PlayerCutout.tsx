import { useState } from "react";

/** PNG بازیکن با fallback استاندارد پروژه (بدون ایموجی/آواتار جعلی) */
export function PlayerCutout({ src, name, size = 56 }: { src?: string | null; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;
  return (
    <span
      className="relative block shrink-0 overflow-hidden"
      style={{ width: size, height: size * 1.45, borderRadius: size * 0.22 }}
    >
      {showImg ? (
        <img src={src} alt={name} className="absolute inset-0 w-full h-full object-cover object-top" loading="lazy" onError={() => setFailed(true)} draggable={false} />
      ) : (
        <span className="absolute inset-0 flex items-end justify-center pb-1" style={{ background: "linear-gradient(180deg, rgba(46,46,46,0.4), rgba(17,17,17,0.9))", color: "rgba(255,255,255,0.5)" }}>
          <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="currentColor" aria-hidden>
            <circle cx="12" cy="8" r="4.2" />
            <path d="M12 13.5c-4.1 0-7 2.6-7 6v1.3h14v-1.3c0-3.4-2.9-6-7-6z" />
          </svg>
        </span>
      )}
    </span>
  );
}
