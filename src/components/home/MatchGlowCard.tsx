import type { Match, Team } from "@/lib/football/types";
import Link from "next/link";

/** رنگ اصلی تیم — اولویت: primaryColor دیتابیس → fallback هماهنگ با دیزاین سیستم */
export function getTeamColor(team: Team | undefined): string {
  return team?.color || "#19C9E8";
}

/**
 * کارت مسابقه Live Scores با Ambient Team Color Glow
 * ارتفاع compact (~96px) — Badge دقیقه در گوشه — Score بزرگ‌ترین عنصر
 */
export function MatchGlowCard({ match, home, away }: { match: Match; home: Team; away: Team }) {
  const hc = getTeamColor(home);
  const ac = getTeamColor(away);
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  const badge = isLive
    ? { text: `${match.minute ?? ""}'`, bg: "rgba(232,56,93,0.18)", color: "#ff8fab", live: true }
    : isFinished
      ? { text: "پایان", bg: "rgba(143,161,181,0.12)", color: "#8FA1B5", live: false }
      : { text: `${match.kickoff.split(" ").pop() ?? ""}`, bg: "rgba(25,201,232,0.12)", color: "#19C9E8", live: false };

  return (
    <Link
      href={`/football/matches/${match.id}`}
      className="group relative block shrink-0 w-[300px] rounded-[14px] overflow-hidden border transition-all duration-200 hover:-translate-y-[2px]"
      style={{
        background: "#0D1929",
        borderColor: "rgba(255,255,255,0.1)",
      }}
      dir="rtl"
    >
      {/* border tint رنگ تیم‌ها روی hover */}
      <span aria-hidden className="absolute inset-0 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ boxShadow: `inset 0 0 0 1px ${hc}44` }} />

      {/* Ambient Glow — سمت هر تیم */}
      <span aria-hidden className="absolute top-1/2 -translate-y-1/2 -right-7 w-32 h-32 rounded-full blur-3xl opacity-25 group-hover:opacity-40 transition-opacity duration-200 pointer-events-none" style={{ background: hc }} />
      <span aria-hidden className="absolute top-1/2 -translate-y-1/2 -left-7 w-32 h-32 rounded-full blur-3xl opacity-25 group-hover:opacity-40 transition-opacity duration-200 pointer-events-none" style={{ background: ac }} />

      <div className="relative z-10 px-4 pt-2.5 pb-3">
        {/* سربرگ: مسابقه + Badge دقیقه (گوشه) */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-bold truncate" style={{ color: "#8FA1B5" }}>{match.competition}</span>
          <span
            className="flex items-center gap-1 text-[10px] font-black px-2 py-[3px] rounded-full tabular"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.live && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#E8385D", animation: "live-pulse 1.6s infinite" }} />}
            {badge.text}
          </span>
        </div>

        {/* ردیف تیم‌ها — میزبان راست (RTL) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img src={home.logo} alt={home.name} className="w-8 h-8 object-contain shrink-0" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.35"; }} />
            <span className="text-[12px] font-bold line-clamp-2 leading-tight" style={{ color: "#F5F7FA" }}>{home.name}</span>
          </div>

          {/* Score — بزرگ‌ترین عنصر */}
          <div className="shrink-0 px-3 text-center">
            {match.status === "upcoming" ? (
              <span className="tabular text-[15px] font-black block" style={{ color: "#19C9E8" }}>{match.kickoff.split(" ").pop()}</span>
            ) : (
              <span className="tabular text-[24px] font-black leading-none block tracking-wide" style={{ color: "#F5F7FA" }}>
                {match.homeScore} <span style={{ color: "#8FA1B5" }}>-</span> {match.awayScore}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
            <span className="text-[12px] font-bold line-clamp-2 leading-tight text-left" style={{ color: "#F5F7FA" }}>{away.name}</span>
            <img src={away.logo} alt={away.name} className="w-8 h-8 object-contain shrink-0" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.35"; }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
