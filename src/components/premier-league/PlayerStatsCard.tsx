import type { PLPlayerStat } from "@/lib/premier-league";
import { teamById } from "@/lib/premier-league";
import { TeamBadge } from "./TeamBadge";

export function PlayerStatsCard({ stat, label }: { stat: PLPlayerStat; label: string }) {
  const t = teamById(stat.teamId);
  return (
    <div className="glass-panel p-3.5 flex items-center gap-3">
      <span className="text-[11px] font-black tabular w-6 shrink-0 text-center" style={{ color: stat.rank <= 3 ? "#facc15" : "var(--color-muted)" }}>{stat.rank}</span>
      <span className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0" style={{ background: `${t.color}22`, color: t.color }}>{stat.player.slice(0, 2)}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold truncate">{stat.player}</p>
        <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--color-muted)" }}>
          <TeamBadge src={t.badge} name={t.short} size={14} /> {t.name}
        </span>
      </div>
      <div className="text-center shrink-0">
        <p className="headline text-lg tabular">{stat.value}</p>
        <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>{label}</p>
      </div>
    </div>
  );
}