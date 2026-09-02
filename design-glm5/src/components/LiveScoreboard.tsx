"use client";

import { Circle } from "lucide-react";

interface ScoreboardEntry {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  league: string;
  isLive: boolean;
}

export default function LiveScoreboard({ entries }: { entries: ScoreboardEntry[] }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="w-full bg-panel-dark/80 backdrop-blur border-b border-panel-border overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {/* Live badge */}
          <div className="flex items-center gap-2 shrink-0">
            <Circle className="w-3 h-3 text-live-signal fill-live-signal animate-live-pulse" />
            <span className="text-xs font-bold text-live-signal uppercase tracking-wider">زنده</span>
          </div>

          {/* Scoreboard entries */}
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 shrink-0 bg-ink-pitch/60 rounded-lg px-4 py-2 border border-panel-border"
            >
              <span className="text-[10px] text-floodlight/50 font-medium">{entry.league}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-floodlight">{entry.homeTeam}</span>
                <div className="flex items-center gap-1 bg-ink-pitch rounded px-2 py-0.5">
                  <span className="text-lg font-black tabular-nums text-club-green">{entry.homeScore}</span>
                  <span className="text-floodlight/30 text-xs">-</span>
                  <span className="text-lg font-black tabular-nums text-club-green">{entry.awayScore}</span>
                </div>
                <span className="text-sm font-bold text-floodlight">{entry.awayTeam}</span>
              </div>
              <span className="text-xs text-floodlight/40 tabular-nums">{entry.minute}&apos;</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
