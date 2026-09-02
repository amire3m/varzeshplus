"use client";

import { useState } from "react";
import type { League, Standing, Team } from "@/lib/football";
import { teamsOfLeague } from "@/lib/football";
import { TeamBadge } from "./TeamBadge";

function rowZone(rank: number): "ucl" | "euro" | "relegation" | null {
  if (rank <= 4) return "ucl";
  if (rank <= 6) return "euro";
  if (rank >= 18) return "relegation";
  return null;
}

export function StandingsTable({ league, custom }: { league: League; custom?: { standings: Standing[]; teams: Team[] } }) {
  const [season, setSeason] = useState(league.season);
  const rows = custom?.standings ?? [];
  const allTeams = custom?.teams ?? teamsOfLeague(league.id);

  if (!rows.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="headline text-lg">جدول {league.name}</h2>
        <div className="flex items-center gap-1.5 text-xs">
          {[league.season, "2025/26", "2024/25"].map((s) => (
            <button key={s} onClick={() => setSeason(s)} className="px-3 py-1.5 rounded-full border transition-colors" style={season === s ? { background: "linear-gradient(135deg,#17b6cc,#7807c9)", color: "#fff", borderColor: "transparent" } : { borderColor: "rgba(255,255,255,0.12)", color: "var(--color-muted)" }}>{s}</button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto rounded-[14px] border" style={{ scrollbarWidth: "thin", background: "#0d1424", borderColor: "rgba(120,160,200,0.15)" }}>
        <table className="w-full min-w-[720px] text-sm border-separate border-spacing-0">
          <thead>
            <tr style={{ color: "#8FA1B5" }}>
              {["رتبه", "تیم", "P", "W", "D", "L", "GF", "GA", "GD", "PTS"].map((h, i) => (
                <th key={i} className={`px-2.5 py-2.5 text-xs font-bold whitespace-nowrap ${i === 1 ? "text-right" : "text-center"} ${i >= 2 ? "tabular" : ""}`} style={{ background: "#132238", borderBottom: "1px solid rgba(120,160,200,0.12)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const t = allTeams.find((x) => x.id === r.teamId)!;
              const zone = rowZone(idx + 1);
              return (
                <tr key={r.teamId} className="transition-colors hover:bg-white/[0.045]">
                  <td className="px-2.5 py-2.5 text-center tabular">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-6 rounded-full shrink-0 ${zone ? "" : "bg-transparent"}`} style={zone ? { background: zone === "ucl" ? "#19C9E8" : zone === "euro" ? "#7B2FF7" : "#E8385D" } : undefined} />
                      <span className="font-black tabular">{idx + 1}</span>
                    </span>
                  </td>
                  <td className="px-2.5 py-2.5">
                    <a href={`/football/teams/${t.slug}`} className="flex items-center gap-2 min-w-0 hover:underline decoration-[#19C9E8] underline-offset-2">
                      <img src={t.logo} alt={t.name} className="w-7 h-7 object-contain shrink-0" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      <span dir="rtl" className="font-bold truncate" style={{ color: "#F5F7FA" }}>{t.name}</span>
                    </a>
                  </td>
                  {[r.played, r.win, r.draw, r.loss, r.gf, r.ga, r.gf - r.ga, r.pts].map((v, j) => (
                    <td key={j} className={`px-2.5 py-2.5 text-center tabular ${j === 7 ? "font-black" : ""}`} style={j === 7 ? { color: "#19C9E8" } : undefined}>{v}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs" style={{ color: "#8FA1B5" }}>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#19C9E8" }} /> سهمیه لیگ قهرمانان</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#7B2FF7" }} /> سهمیه اروپایی</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#E8385D" }} /> منطقه سقوط</span>
      </div>
    </div>
  );
}