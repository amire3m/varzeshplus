"use client";

import { useState } from "react";
import { usePlayerPhoto } from "@/lib/player-photo";

/** آواتار بازیکن: عکس واقعی TheSportsDB → fallback حروف اول با رنگ تیم */
export function PlayerAvatar({ name, size = 40, color = "#4AE183", round = false }: { name: string; size?: number; color?: string; round?: boolean }) {
  const photoUrl = usePlayerPhoto(name);
  const [failed, setFailed] = useState(false);
  const initials = name.slice(0, 2);
  const showImg = photoUrl && !failed;
  return (
    <span
      className="shrink-0 overflow-hidden flex items-center justify-center font-black select-none"
      style={{
        width: size, height: size,
        borderRadius: round ? "9999px" : size * 0.22,
        background: showImg ? "rgba(255,255,255,0.05)" : `linear-gradient(160deg, ${color}33, rgba(16,22,16,0.9))`,
        border: `1px solid ${color}44`,
        color,
        fontSize: size * 0.34,
      }}
      title={name}
    >
      {showImg ? (
        <img src={photoUrl!} alt={name} className="w-full h-full object-cover object-top" loading="lazy" draggable={false} onError={() => setFailed(true)} />
      ) : (
        initials
      )}
    </span>
  );
}
