"use client";

import { useState } from "react";
import type { Team } from "@/lib/football";

export function TeamBadge({ team, size = 40, className = "" }: { team: Team; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`shrink-0 rounded-full flex items-center justify-center font-black select-none border border-white/10 overflow-hidden ${className}`} style={{ width: size, height: size, fontSize: size * 0.28, background: "var(--color-panel-raised)" }}>
      {failed || !team.logo ? (
        <span style={{ color: team.color }}>{team.shortName.slice(0, 3).toUpperCase()}</span>
      ) : (
        <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-[2px]" loading="lazy" onError={() => setFailed(true)} />
      )}
    </span>
  );
}