"use client";

import type { PLMatch } from "@/lib/premier-league";
import { teamById } from "@/lib/premier-league";
import { TeamBadge } from "./TeamBadge";

export function MatchCard({ match }: { match: PLMatch }) {
  const home = teamById(match.homeId);
  const away = teamById(match.awayId);
  const isLive = match.status === "live";

  return (
    <div className={`glass-panel p-3.5 flex flex-col gap-2.5 ${isLive ? "ring-1 ring-[#E23B3B]/40" : ""}`}>
      <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--color-muted)" }}>
        <span className="tabular">{match.competition} • هفته {match.matchweek}</span>
        {isLive ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: "rgba(226,59,59,0.15)", color: "#ffb4ab" }}>
            <span className="live-dot" style={{ width: 6, height: 6 }} /> {match.minute}&apos;
          </span>
        ) : (
          <span className="tabular">{match.kickoff}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TeamBadge src={home.badge} name={home.short} size={34} />
          <span className="font-bold text-sm truncate">{home.name}</span>
        </div>
        <div className="tabular font-black text-lg shrink-0 px-1">
          {match.status === "upcoming" ? (
            <span className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>VS</span>
          ) : (
            <span className={isLive ? "text-white" : ""}>{match.homeScore} - {match.awayScore}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <span className="font-bold text-sm truncate">{away.name}</span>
          <TeamBadge src={away.badge} name={away.short} size={34} />
        </div>
      </div>
    </div>
  );
}
