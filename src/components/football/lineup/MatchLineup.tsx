"use client";

import { useState } from "react";
import type { Match, Team } from "@/lib/football";
import { lineupFor } from "@/lib/football";
import { TeamBadge } from "../TeamBadge";
import { FootballPitch } from "./FootballPitch";
import { FormationRenderer } from "./FormationRenderer";
import { BenchPlayers } from "./BenchPlayers";
import { SubstitutionsList } from "./SubstitutionsList";
import { PlayerRatingBadge, ratingColor } from "./PlayerRatingBadge";

export function MatchLineup({ match, homeTeam, awayTeam }: { match: Match; homeTeam: Team; awayTeam: Team }) {
  const [selected, setSelected] = useState<"home" | "away">("home");
  const isHome = selected === "home";
  const team = isHome ? homeTeam : awayTeam;
  const lineup = lineupFor(match, team.id);

  return (
    <div className="space-y-5">
      {/* انتخاب تیم */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setSelected("home")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isHome ? "text-white" : "text-white/55 border-white/10 hover:bg-white/5"}`}
          style={isHome ? { background: "linear-gradient(135deg, #005cfc, #bee503)", borderColor: "transparent" } : undefined}>
          <TeamBadge team={homeTeam} size={22} /> {homeTeam.name}
        </button>
        <span className="tabular font-black text-lg" style={{ color: "var(--color-muted)" }}>VS</span>
        <button onClick={() => setSelected("away")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${!isHome ? "text-white" : "text-white/55 border-white/10 hover:bg-white/5"}`}
          style={!isHome ? { background: "linear-gradient(135deg, #005cfc, #bee503)", borderColor: "transparent" } : undefined}>
          <TeamBadge team={awayTeam} size={22} /> {awayTeam.name}
        </button>
      </div>

      {/* نشان mock */}
      {lineup.isMock && (
        <div className="text-center text-[10px] px-3 py-1 rounded-full mx-auto w-fit" style={{ background: "rgba(249,199,89,0.12)", color: "#f9c759" }}>
          داده‌های نمایشی (Mock)
        </div>
      )}

      {/* هدر تیم */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <TeamBadge team={team} size={40} />
          <div>
            <h3 className="headline text-base">{team.name}</h3>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>آرایش: <span className="tabular font-bold">{lineup.formation}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>میانگین امتیاز</span>
          <PlayerRatingBadge rating={lineup.averageRating} />
        </div>
      </div>

      {/* زمین */}
      <FootballPitch>
        <FormationRenderer lineup={lineup} home={isHome} />
      </FootballPitch>

      {/* تعویض‌ها */}
      <SubstitutionsList subs={lineup.substitutions} />

      {/* ذخیره‌ها */}
      <BenchPlayers players={lineup.substitutes} />
    </div>
  );
}