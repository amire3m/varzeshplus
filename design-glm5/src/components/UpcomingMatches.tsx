"use client";

import { Clock, ChevronLeft } from "lucide-react";

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "upcoming" | "live" | "finished";
  league: string;
  kickoff: string;
  minute: number | null;
}

function formatTime(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours <= 0) return "شروع شده";
    if (diffHours < 24) return `${diffHours} ساعت دیگر`;
    if (diffDays === 1) return "فردا";
    if (diffDays <= 7) return `${diffDays} روز دیگر`;
    return date.toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function UpcomingMatches({ matches }: { matches: Match[] }) {
  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches.filter((m) => m.status === "upcoming");

  return (
    <aside className="space-y-4">
      <div className="card-panel p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-floodlight tracking-tight">مسابقات پیش‌رو</h2>
          <a href="#all-matches" className="text-xs text-club-green hover:underline flex items-center gap-1">
            همه
            <ChevronLeft className="w-3 h-3" />
          </a>
        </div>

        {/* Live matches */}
        {liveMatches.length > 0 && (
          <div className="space-y-3 mb-4">
            {liveMatches.map((match) => (
              <div
                key={match.id}
                className="bg-live-signal/10 border border-live-signal/20 rounded-lg p-3"
              >
                <div className="flex items-center gap-1 mb-2">
                  <span className="w-2 h-2 rounded-full bg-live-signal animate-live-pulse" />
                  <span className="text-[10px] font-bold text-live-signal uppercase">زنده</span>
                  <span className="text-[10px] text-floodlight/40 mr-auto tabular-nums">{match.minute}&apos;</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-floodlight">{match.homeTeam}</span>
                  <div className="flex items-center gap-1.5 bg-ink-pitch/60 rounded px-2 py-0.5">
                    <span className="text-base font-black tabular-nums text-club-green">{match.homeScore}</span>
                    <span className="text-floodlight/20 text-xs">-</span>
                    <span className="text-base font-black tabular-nums text-club-green">{match.awayScore}</span>
                  </div>
                  <span className="text-sm font-bold text-floodlight">{match.awayTeam}</span>
                </div>
                <div className="text-[10px] text-floodlight/40 mt-1 text-center">{match.league}</div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming matches */}
        <div className="space-y-2">
          {upcomingMatches.map((match) => (
            <div
              key={match.id}
              className="group rounded-lg p-3 border border-panel-border hover:border-club-green/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-floodlight group-hover:text-club-green transition-colors">{match.homeTeam}</span>
                <span className="text-floodlight/30 text-xs">VS</span>
                <span className="text-sm font-bold text-floodlight group-hover:text-club-green transition-colors">{match.awayTeam}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-floodlight/40">
                <span>{match.league}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(match.kickoff)} · {formatTime(match.kickoff)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Predict CTA */}
        <button className="w-full mt-4 bg-club-green hover:bg-club-green-dark text-ink-pitch font-bold text-sm py-2.5 rounded-lg transition-colors">
          پیش‌بینی نتیجه
        </button>
      </div>
    </aside>
  );
}
