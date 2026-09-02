"use client";

import type { Match, MatchTimeline, Team, TimelineEvent } from "@/lib/football";
import { matchTimeline, teamById } from "@/lib/football";
import { TeamBadge } from "../TeamBadge";
import { PlayerCutout } from "./PlayerCutout";
import { PlayerEventBadge } from "./PlayerEventBadge";

const LABEL: Record<TimelineEvent["type"], string> = {
  kickoff: "رویداد",
  goal: "گل",
  penalty_goal: "گل پنالتی",
  own_goal: "گل به خودی",
  assist: "پاس گل",
  yellow_card: "کارت زرد",
  second_yellow: "کارت زرد دوم",
  red_card: "کارت قرمز",
  substitution: "تعویض",
  penalty_miss: "پنالتی از دست رفته",
  var_review: "بررسی VAR",
  var_goal_confirmed: "VAR — گل تأیید شد",
  var_goal_disallowed: "VAR — گل مردود شد",
  injury: "مصدومیت",
};

function EventIcon({ type }: { type: TimelineEvent["type"] }) {
  const s = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" } as const;
  switch (type) {
    case "goal": case "penalty_goal": case "own_goal": return <svg {...s}><circle cx="12" cy="12" r="6" /></svg>;
    case "assist": return <svg {...s}><path d="M4 14l6-4v2h7v3H10v2z" /></svg>;
    case "yellow_card": case "second_yellow": case "red_card": return <span style={{ width: 11, height: 14, borderRadius: 2, background: type === "red_card" ? "#ef4444" : "#eab308", display: "inline-block" }} />;
    case "substitution": return <svg {...s}><path d="M11 6l-4 6h2.5v5h3v-5H15z" /><path d="M13 16l4-6h-2.5V5h-3v5H9z" fill="#22c55e" /></svg>;
    case "penalty_miss": return <svg {...s} fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "injury": return <svg {...s}><path d="M12 3l4 7h-3v11l-4-7h3z" /></svg>;
    case "var_review": case "var_goal_confirmed": case "var_goal_disallowed": return <svg {...s}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9.5l5 2.5-5 2.5v-5z" /></svg>;
    default: return <svg {...s}><circle cx="12" cy="12" r="5" /></svg>;
  }
}

function eventColor(type: TimelineEvent["type"]): string {
  switch (type) {
    case "goal": case "penalty_goal": return "#22c55e";
    case "own_goal": return "#f43f5e";
    case "red_card": return "#ef4444";
    case "yellow_card": case "second_yellow": return "#eab308";
    case "substitution": return "#3b82f6";
    case "injury": return "#f97316";
    case "penalty_miss": return "#ef4444";
    case "var_review": case "var_goal_confirmed": case "var_goal_disallowed": return "#a78bfa";
    default: return "#9aa7b5";
  }
}

export function MatchTimelineView({ match }: { match: Match }) {
  const tl: MatchTimeline = matchTimeline(match);
  const home = teamById(match.homeTeamId);
  const away = teamById(match.awayTeamId);

  // هت‌تریک/دبل از روی گل‌های واقعی همین مسابقه
  const goalCount: Record<string, number> = {};

  tl.events.forEach((e) => { if (e.type === "goal" && e.player) goalCount[e.player] = (goalCount[e.player] ?? 0) + 1; });
  const hattrickPlayers = new Set(Object.entries(goalCount).filter(([, c]) => c >= 3).map(([p]) => p));

  const isPenaltyDecision = tl.hasPenaltyShootout;
  const isET = tl.hasExtraTime;
  const statusLabel = isPenaltyDecision ? "پایان در ضربات پنالتی" : isET ? "پایان وقت اضافه" : match.status === "live" ? "در جریان" : "پایان یافته";

  return (
    <div className="space-y-5">
      {/* ===== Header ===== */}
      <section className="panel p-4 md:p-5">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 min-w-0"><TeamBadge team={home} size={44} /><span className="font-bold text-sm">{home.name}</span></div>
          <div className="flex flex-col items-center px-2">
            <span className="headline text-2xl md:text-3xl tabular">{match.homeScore} - {match.awayScore}</span>
            {isPenaltyDecision && (
              <span className="text-xs mt-1 px-2.5 py-0.5 rounded-full" style={{ background: "rgba(23,182,204,0.12)", color: "#17b6cc" }}>
                پنالتی: <span className="tabular font-black">{tl.penaltyScoreHome} - {tl.penaltyScoreAway}</span>
              </span>
            )}
            <span className="text-[11px] mt-1" style={{ color: "var(--color-muted)" }}>{statusLabel}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0"><span className="font-bold text-sm">{away.name}</span><TeamBadge team={away} size={44} /></div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs" style={{ color: "var(--color-muted)" }}>
          <span>رقابت: {match.competition}</span>
          <span>هفته {match.matchweek}</span>
          <span>تاریخ: {match.kickoff}</span>
          {match.stadium && <span>ورزشگاه: {match.stadium}</span>}
        </div>
        {tl.isMock && <div className="mt-2 text-center text-[10px]" style={{ color: "#f9c759" }}>داده‌های نمایشی (Mock)</div>}
      </section>

      {/* ===== Timeline ===== */}
      <div className="relative">
        {/* خط عمودی */}
        <div className="absolute top-0 bottom-0 right-1/2 w-px translate-x-1/2" style={{ background: "rgba(255,255,255,0.12)" }} />
        <div className="space-y-1">
          {tl.events.map((e) => {
            const isHome = e.teamId === match.homeTeamId;
            const team = isHome ? home : away;
            const isPhase = e.type === "kickoff";
            const isGoal = e.type === "goal" || e.type === "penalty_goal" || e.type === "own_goal";
            const color = eventColor(e.type);
            if (isPhase) {
              return (
                <div key={e.id} className="relative py-1.5 flex justify-center">
                  <div className="px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--color-muted)" }}>
                    {e.detail}
                  </div>
                </div>
              );
            }
            return (
              <div key={e.id} className={`relative py-1 flex ${isHome ? "justify-start md:pr-[calc(50%+16px)]" : "justify-end md:pl-[calc(50%+16px)]"}`}>
                <div className="flex items-start gap-2 max-w-[90%] md:max-w-[46%]" style={{ flexDirection: isHome ? "row" : "row-reverse" }}>
                  <PlayerCutout src={null} name={e.player ?? ""} size={30} />
                  <div className={`glass-panel px-3 py-2 rounded-xl text-sm min-w-0 ${isGoal ? "" : ""}`} style={{ borderInlineStart: `3px solid ${color}` }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="tabular font-black text-[11px]" style={{ color }}>{e.minute}</span>
                      <span className="font-bold text-[12px] flex items-center gap-1" style={{ color }}>
                        <EventIcon type={e.type} /> {LABEL[e.type]}
                      </span>
                    </div>
                    {e.player && <p className="font-bold text-[13px] mt-0.5">{e.player}</p>}
                    {e.type === "substitution" && e.detail && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}><span style={{ color: "#f97316" }}>{e.player}</span> ← <span style={{ color: "#22c55e" }}>{e.detail}</span></p>
                    )}
                    {e.type !== "substitution" && e.detail && <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{e.detail}</p>}
                    {e.assist && <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>پاس گل: <span className="font-bold">{e.assist}</span></p>}
                    {isGoal && e.homeScore != null && e.awayScore != null && (
                      <p className="text-[11px] mt-0.5 tabular" style={{ color: "var(--color-club-green)" }}>نتیجه: {e.homeScore} - {e.awayScore}</p>
                    )}
                    {isGoal && e.player && hattrickPlayers.has(e.player) && (goalCount[e.player] ?? 0) >= 3 && (
                      <span className="inline-block mt-1 text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: "rgba(249,199,89,0.15)", color: "#f9c759" }}>هت‌تریک</span>
                    )}
                    <span className="flex items-center gap-1 mt-1 text-[10px]" style={{ color: "var(--color-muted)" }}><TeamBadge team={team} size={14} />{team.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== ضربات پنالتی ===== */}
      {tl.hasPenaltyShootout && (
        <section className="glass-panel p-4">
          <h3 className="headline text-base mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-[18px]" style={{ color: "#17b6cc" }}>sports_soccer</span> ضربات پنالتی</h3>
          {[1, 2, 3, 4, 5, 6].map((round) => {
            const shots = tl.penalties.filter((p) => p.round === round);
            if (!shots.length) return null;
            return (
              <div key={round} className="mb-3">
                <p className="text-[11px] font-black mb-1.5" style={{ color: "var(--color-muted)" }}>دور {round}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {shots.map((p, i) => {
                    const t = teamById(p.teamId);
                    return (
                      <div key={i} className="flex items-center gap-2 text-sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 6 }}>
                        <TeamBadge team={t} size={20} />
                        <span className="font-bold truncate">{p.player}</span>
                        <span className="mr-auto">
                          {p.converted ? <span className="text-[11px] font-black px-2 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>گل</span> : <span className="text-[11px] font-black px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>از دست رفت</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="mt-3 pt-2 border-t border-white/5 text-sm flex items-center justify-center gap-2">
            <span className="font-bold">{home.name}</span><span className="tabular font-black text-lg" style={{ color: "var(--color-club-green)" }}>{tl.penaltyScoreHome} - {tl.penaltyScoreAway}</span><span className="font-bold">{away.name}</span>
          </div>
        </section>
      )}
    </div>
  );
}
