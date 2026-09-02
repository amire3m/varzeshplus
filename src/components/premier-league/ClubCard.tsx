import type { PLTeam } from "@/lib/premier-league";
import { TeamBadge } from "./TeamBadge";

export function ClubCard({ team }: { team: PLTeam }) {
  return (
    <button className="glass-panel p-4 flex flex-col items-center gap-2.5 hover:translate-y-[-2px] transition-transform cursor-pointer group">
      <TeamBadge src={team.badge} name={team.short} size={56} />
      <span className="text-sm font-bold truncate w-full text-center group-hover:underline decoration-[#005cfc] underline-offset-2">{team.name}</span>
      <span className="text-[10px] tabular uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>{team.short}</span>
    </button>
  );
}