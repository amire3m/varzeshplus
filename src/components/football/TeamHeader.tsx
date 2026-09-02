import type { League, Team } from "@/lib/football";
import Link from "next/link";
import { TeamBadge } from "./TeamBadge";
import { TeamForm } from "./TeamForm";

export function TeamHeader({ team, league, rank }: { team: Team; league: League; rank: number }) {
  return (
    <section className="panel p-4 md:p-5 flex flex-wrap items-center gap-4">
      <TeamBadge team={team} size={64} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="headline text-xl md:text-2xl">{team.name}</h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold tabular" style={{ background: "linear-gradient(135deg,#19C9E8,#7B2FF7)", color: "#fff" }}>{league.season}</span>
        </div>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>{team.name} • {team.city} • {league.name}</p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Link href={`/football/leagues/${league.slug}`} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-white/10 hover:border-[#19C9E8] transition-colors" style={{ background: "var(--color-panel-dark)" }}>
            <img src={league.logo} alt={league.englishName} className="w-4 h-4 object-contain" /> {league.name}
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full border border-white/10" style={{ background: "var(--color-panel-dark)" }}>
            رتبه <span className="tabular font-black">{rank}</span> در جدول
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <TeamForm form={team} />
        <div className="text-xs" style={{ color: "var(--color-muted)" }}>
          <span className="tabular">{team.stadium}</span> • تأسیس {team.founded}
        </div>
      </div>
    </section>
  );
}