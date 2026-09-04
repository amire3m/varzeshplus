"use client";

import { useState } from "react";

/** تصویر امن: با خطا به بلوک حروف اول با رنگ تیم/دسته تبدیل می‌شود */
export function SafeImage({
  src, alt, fallbackText, color = "#005cfc", className = "", eager = false,
}: {
  src?: string | null; alt: string; fallbackText: string; color?: string; className?: string; eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    const initials = fallbackText.trim().slice(0, 2);
    return (
      <span className={`shrink-0 flex items-center justify-center font-black select-none border border-white/10 overflow-hidden ${className}`} style={{ background: `${color}25`, color }} aria-label={alt} role="img">
        {initials || "؟"}
      </span>
    );
  }
  return (
    <img src={src} alt={alt} className={`shrink-0 object-cover ${className}`} loading={eager ? "eager" : "lazy"} draggable={false} onError={() => setFailed(true)} />
  );
}
