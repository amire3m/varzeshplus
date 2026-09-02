import type { Team } from "@/lib/football";
import Link from "next/link";
import { TeamBadge } from "./TeamBadge";

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link href={`/football/teams/${team.slug}`} className="rounded-[14px] border border-white/10 p-4 flex flex-col items-center gap-2.5 hover:translate-y-[-2px] transition-transform group">
      <TeamBadge team={team} size={56} />
      <span className="text-sm font-bold truncate w-full text-center group-hover:underline decoration-[#00b4d8] underline-offset-2">{team.name}</span>
      <span className="text-[10px] tabular uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>{team.shortName}</span>
    </Link>
  );
}