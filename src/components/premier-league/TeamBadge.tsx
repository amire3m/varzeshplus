"use client";

import { useState } from "react";

export function TeamBadge({ src, name, size = 40, className = "" }: { src: string; name: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={`shrink-0 rounded-full flex items-center justify-center font-black select-none border border-white/10 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.3, background: "var(--color-panel-raised)" }}
    >
      {failed ? (
        <span dir="ltr">{name.slice(0, 3).toUpperCase()}</span>
      ) : (
        <img src={src} alt={name} className="w-full h-full object-contain p-[2px]" loading="lazy" onError={() => setFailed(true)} />
      )}
    </span>
  );
}
