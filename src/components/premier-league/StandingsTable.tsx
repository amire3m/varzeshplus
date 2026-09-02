"use client";

import { useState } from "react";
import type { PLStanding } from "@/lib/premier-league";
import { STANDINGS, teamById } from "@/lib/premier-league";
import { TeamBadge } from "./TeamBadge";

function rowZone(rank: number): "ucl" | "euro" | "relegation" | null {
  if (rank <= 4) return "ucl";
  if (rank <= 6) return "euro";
  if (rank >= 18) return "relegation";
  return null;
}

export function StandingsTable() {
  const [season, setSeason] = useState("2026/27");
  const rows: PLStanding[] = STANDINGS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="headline text-lg">جدول لیگ برتر</h2>
        <div className="flex items-center gap-1.5 text-xs">
          {["2026/27", "2025/26", "2024/25"].map((s) => (
            <button key={s} onClick={() => setSeason(s)} className="px-3 py-1.5 rounded-full border transition-colors" style={season === s ? { background: "linear-gradient(135deg,#17b6cc,#7807c9)", color: "#fff", borderColor: "transparent" } : { borderColor: "rgba(255,255,255,0.12)", color: "var(--color-muted)" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl" style={{ scrollbarWidth: "thin" }}>
        <table className="w-full min-w-[720px] text-sm border-separate border-spacing-0">
          <thead>
            <tr style={{ color: "var(--color-muted)" }}>
              {["رتبه", "تیم", "P", "W", "D", "L", "GF", "GA", "GD", "PTS"].map((h, i) => (
                <th key={i} className={`px-2.5 py-2.5 text-xs font-bold whitespace-nowrap ${i === 1 ? "text-left" : "text-center"} ${i >= 2 ? "tabular" : ""}`} style={{ background: "var(--color-panel-raised)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const t = teamById(r.teamId);
              const zone = rowZone(idx + 1);
              return (
                <tr key={r.teamId} className="transition-colors hover:bg-white/[0.045]" style={{ background: "transparent" }}>
                  <td className="px-2.5 py-2.5 text-center tabular">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-6 rounded-full shrink-0 ${zone ? "" : "bg-transparent"}`} style={zone ? { background: zone === "ucl" ? "#17b6cc" : zone === "euro" ? "#7807c9" : "#E23B3B" } : undefined} />
                      <span className="font-black tabular">{idx + 1}</span>
                    </span>
                  </td>
                  <td className="px-2.5 py-2.5">
                    <span className="flex items-center gap-2 min-w-0">
                      <img src={t.badge} alt={t.name} className="w-7 h-7 object-contain shrink-0" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      <span dir="rtl" className="font-bold truncate">{t.name}</span>
                    </span>
                  </td>
                  {[r.played, r.win, r.draw, r.loss, r.gf, r.ga, r.gf - r.ga, r.pts].map((v, j) => (
                    <td key={j} className={`px-2.5 py-2.5 text-center tabular ${j === 7 ? "font-black text-white" : ""}`} style={j === 7 ? { color: "var(--color-club-green)" } : undefined}>{v}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs" style={{ color: "var(--color-muted)" }}>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#17b6cc" }} /> سهمیه لیگ قهرمانان</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#7807c9" }} /> سهمیه اروپایی</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#E23B3B" }} /> منطقه سقوط</span>
      </div>
    </div>
  );
}
