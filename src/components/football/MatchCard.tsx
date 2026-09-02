import type { Match, Team } from "@/lib/football";
import Link from "next/link";

/** کارت مسابقه با Ambient Team Color Glow — هماهنگ با کارت‌های صفحه نخست */
export function MatchCard({ match, getTeam }: { match: Match; getTeam: (id: number) => Team }) {
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);
  const isLive = match.status === "live";
  const href = `/football/matches/${match.id}`;
  const hc = home.color || "#19C9E8";
  const ac = away.color || "#19C9E8";

  const badge = isLive
    ? { text: `${match.minute ?? ""}'`, bg: "rgba(232,56,93,0.18)", color: "#ff8fab", live: true }
    : match.status === "finished"
      ? { text: "پایان", bg: "rgba(143,161,181,0.12)", color: "#8FA1B5", live: false }
      : { text: "شروع نشده", bg: "rgba(25,201,232,0.12)", color: "#19C9E8", live: false };

  return (
    <Link
      href={href}
      className={`group relative block rounded-[14px] overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 ${isLive ? "" : ""}`}
      style={{ background: "#2a2a2a", borderColor: "rgba(255,255,255,0.1)" }}
      dir="rtl"
    >
      {/* Ambient Glow — سمت هر تیم */}
      <span aria-hidden className="absolute top-1/2 -translate-y-1/2 -right-5 w-24 h-24 rounded-full blur-2xl opacity-35 group-hover:opacity-55 transition-opacity duration-200 pointer-events-none" style={{ background: hc }} />
      <span aria-hidden className="absolute top-1/2 -translate-y-1/2 -left-5 w-24 h-24 rounded-full blur-2xl opacity-35 group-hover:opacity-55 transition-opacity duration-200 pointer-events-none" style={{ background: ac }} />
      {/* نوار ظریف رنگ تیم‌ها */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] opacity-40 pointer-events-none" style={{ background: `linear-gradient(90deg, ${hc}, transparent 32%, transparent 68%, ${ac})` }} />

      <div className="relative z-10 px-4 pt-2.5 pb-3">
        {/* سربرگ: مسابقه + badge */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-bold truncate" style={{ color: "#8FA1B5" }}>{match.competition} • هفته {match.matchweek}</span>
          <span className="flex items-center gap-1 text-[10px] font-black px-2 py-[3px] rounded-full tabular" style={{ background: badge.bg, color: badge.color }}>
            {badge.live && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#E8385D", animation: "live-pulse 1.6s infinite" }} />}
            {isLive ? `${match.minute ?? ""}'` : isLive ? "" : badge.text}
          </span>
        </div>
        {/* ردیف تیم‌ها — میزبان راست */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img src={home.logo} alt={home.name} className="w-8 h-8 object-contain shrink-0" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.35"; }} />
            <span className="text-[12px] font-bold line-clamp-1" style={{ color: "#F5F7FA" }}>{home.name}</span>
          </div>
          <div className="shrink-0 px-3 text-center">
            {match.status === "upcoming" ? (
              <span className="tabular text-[15px] font-black" style={{ color: "#19C9E8" }}>{match.kickoff.split(" ").pop()}</span>
            ) : (
              <span className="tabular text-[22px] font-black leading-none" style={{ color: "#F5F7FA" }}>
                {match.homeScore} <span style={{ color: "#8FA1B5" }}>-</span> {match.awayScore}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
            <span className="text-[12px] font-bold line-clamp-1 text-left" style={{ color: "#F5F7FA" }}>{away.name}</span>
            <img src={away.logo} alt={away.name} className="w-8 h-8 object-contain shrink-0" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.35"; }} />
          </div>
        </div>
      </div>
    </Link>
  );
}