"use client";

import type { Match, MatchStats } from "@/lib/football";
import { matchStats, getTeamById, MATCH_STAT_LABEL, MATCH_STAT_SUFFIX } from "@/lib/football";

/** تب آمار — بار دوتایی رنگ تیم + اعداد بزرگ (طراحی مدرن) */
export function MatchStatsView({ match }: { match: Match }) {
  const stats: MatchStats = matchStats(match);
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);

  return (
    <div className="space-y-3">
      {/* هدر دو تیم */}
      <div className="rounded-2xl border border-white/10 p-4 flex items-center justify-between" style={{ background: "#2a2a2a" }}>
        <div className="flex items-center gap-2.5 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.logo} alt={home.name} className="w-9 h-9 object-contain" />
          <span className="text-sm font-bold text-white truncate">{home.name}</span>
        </div>
        <span className="headline text-lg" style={{ color: "var(--color-muted)" }}>آمار</span>
        <div className="flex items-center gap-2.5 min-w-0 justify-end">
          <span className="text-sm font-bold text-white truncate text-right">{away.name}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={away.logo} alt={away.name} className="w-9 h-9 object-contain" />
        </div>
      </div>

      {/* ردیف‌های آمار */}
      {stats.rows.map((r) => {
        const label = MATCH_STAT_LABEL[r.key] ?? r.key;
        const suffix = MATCH_STAT_SUFFIX[r.key] ?? "";
        const isPercentage = r.key === "possession" || r.key === "pass_accuracy";
        const total = r.home + r.away || 1;
        const homePct = isPercentage ? r.home : (r.home / total) * 100;
        const awayPct = isPercentage ? r.away : (r.away / total) * 100;
        const homeWins = r.home > r.away;
        const awayWins = r.away > r.home;
        return (
          <div key={r.key} className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="tabular font-black text-lg min-w-[48px]" style={{ color: homeWins ? "#005cfc" : "#8FA1B5" }}>{r.home}{suffix}</span>
              <span className="text-[11px] font-bold text-center" style={{ color: "var(--color-muted)" }}>{label}</span>
              <span className="tabular font-black text-lg min-w-[48px] text-left" style={{ color: awayWins ? "#bee503" : "#8FA1B5" }}>{r.away}{suffix}</span>
            </div>
            {/* بار دوتایی از مرکز به دو طرف */}
            <div className="flex items-center gap-1 h-2">
              <div className="flex-1 flex justify-end">
                <div className="h-2 rounded-full transition-all" style={{ width: `${homePct}%`, background: "linear-gradient(90deg, transparent, #005cfc)", opacity: homeWins ? 1 : 0.55 }} />
              </div>
              <div className="w-0.5 h-2 rounded-full bg-white/25 shrink-0" />
              <div className="flex-1 flex justify-start">
                <div className="h-2 rounded-full transition-all" style={{ width: `${awayPct}%`, background: "linear-gradient(90deg, #bee503, transparent)", opacity: awayWins ? 1 : 0.55 }} />
              </div>
            </div>
          </div>
        );
      })}

      {stats.isMock && <div className="text-center text-[10px]" style={{ color: "#f9c759" }}>داده‌های نمایشی (Mock)</div>}
    </div>
  );
}
