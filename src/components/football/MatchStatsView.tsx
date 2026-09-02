"use client";

import type { Match, MatchStats } from "@/lib/football";
import { matchStats, getTeamById, MATCH_STAT_LABEL, MATCH_STAT_SUFFIX } from "@/lib/football";
import { TeamBadge } from "./TeamBadge";

export function MatchStatsView({ match }: { match: Match }) {
  const stats: MatchStats = matchStats(match);
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  return (
    <div className="space-y-4">
      <div className="glass-panel overflow-x-auto">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr style={{ color: "var(--color-muted)" }}>
              <th className="px-4 py-3 text-center text-xs font-bold w-[30%]">{home.name}</th>
              <th className="px-4 py-3 text-center text-xs font-bold w-[40%]">آمار</th>
              <th className="px-4 py-3 text-center text-xs font-bold w-[30%]">{away.name}</th>
            </tr>
          </thead>
          <tbody>
            {stats.rows.map((r) => {
              const label = MATCH_STAT_LABEL[r.key] ?? r.key;
              const suffix = MATCH_STAT_SUFFIX[r.key] ?? "";
              const isPercentage = r.key === "possession" || r.key === "pass_accuracy";
              const homePct = isPercentage ? r.home : (r.home / (r.home + r.away || 1)) * 100;
              const awayPct = isPercentage ? r.away : (r.away / (r.home + r.away || 1)) * 100;
              return (
                <tr key={r.key} className="border-t border-white/5">
                  <td className="px-4 py-3 text-center tabular font-bold">{r.home}{suffix}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-[11px] font-bold mb-1" style={{ color: "var(--color-muted)" }}>{label}</div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${homePct}%`, background: "linear-gradient(90deg, #17b6cc, #7807c9)" }} />
                      <div className="h-1.5 rounded-full" style={{ width: `${awayPct}%`, background: "linear-gradient(90deg, #7807c9, #17b6cc)" }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center tabular font-bold">{r.away}{suffix}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {stats.isMock && <div className="text-center text-[10px]" style={{ color: "#f9c759" }}>داده‌های نمایشی (Mock)</div>}
    </div>
  );
}