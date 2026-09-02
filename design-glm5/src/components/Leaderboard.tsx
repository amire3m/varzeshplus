"use client";

import { Trophy, Medal, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  id: number;
  rank: number;
  username: string;
  phone: string;
  points: number;
  avatar: string | null;
}

function getMedalColor(rank: number): string {
  switch (rank) {
    case 1: return "text-gold-medal";
    case 2: return "text-silver-medal";
    case 3: return "text-bronze-medal";
    default: return "text-floodlight/40";
  }
}

function getMedalBg(rank: number): string {
  switch (rank) {
    case 1: return "bg-gold-medal/10 border-gold-medal/20";
    case 2: return "bg-silver-medal/10 border-silver-medal/20";
    case 3: return "bg-bronze-medal/10 border-bronze-medal/20";
    default: return "bg-ink-pitch/40 border-panel-border";
  }
}

function getRankDisplay(rank: number) {
  if (rank <= 3) {
    return <Medal className={`w-5 h-5 ${getMedalColor(rank)}`} />;
  }
  return <span className="text-sm font-black tabular-nums text-floodlight/40">{rank}</span>;
}

function formatPoints(num: number): string {
  return num.toLocaleString("fa-IR");
}

export default function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="card-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold-medal" />
          <h2 className="text-base font-black text-floodlight tracking-tight">برترین‌ها</h2>
        </div>
        <a href="#full-leaderboard" className="text-xs text-club-green hover:underline">مشاهده کامل</a>
      </div>

      {/* Top 3 podium style */}
      {entries.length >= 3 && (
        <div className="flex items-end justify-center gap-2 mb-4 pb-4 border-b border-panel-border">
          {/* 2nd place */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-silver-medal/20 border border-silver-medal/30 flex items-center justify-center text-xs font-bold text-silver-medal mb-1">
              {entries[1].username.charAt(0)}
            </div>
            <span className="text-[10px] font-bold text-silver-medal">۲</span>
            <div className="w-12 h-14 bg-silver-medal/10 rounded-t-md mt-1 flex items-center justify-center">
              <span className="text-[9px] font-bold tabular-nums text-floodlight/60">{formatPoints(entries[1].points)}</span>
            </div>
          </div>
          {/* 1st place */}
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-gold-medal/20 border border-gold-medal/30 flex items-center justify-center text-xs font-bold text-gold-medal mb-1">
              {entries[0].username.charAt(0)}
            </div>
            <span className="text-[10px] font-bold text-gold-medal">۱</span>
            <div className="w-12 h-20 bg-gold-medal/10 rounded-t-md mt-1 flex items-center justify-center">
              <span className="text-[9px] font-bold tabular-nums text-floodlight/80">{formatPoints(entries[0].points)}</span>
            </div>
          </div>
          {/* 3rd place */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-bronze-medal/20 border border-bronze-medal/30 flex items-center justify-center text-xs font-bold text-bronze-medal mb-1">
              {entries[2].username.charAt(0)}
            </div>
            <span className="text-[10px] font-bold text-bronze-medal">۳</span>
            <div className="w-12 h-10 bg-bronze-medal/10 rounded-t-md mt-1 flex items-center justify-center">
              <span className="text-[9px] font-bold tabular-nums text-floodlight/60">{formatPoints(entries[2].points)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 border ${getMedalBg(entry.rank)} transition-all hover:scale-[1.01]`}
          >
            {/* Rank */}
            <div className="w-6 flex justify-center shrink-0">
              {getRankDisplay(entry.rank)}
            </div>

            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-glow-electric/20 flex items-center justify-center text-[10px] font-bold text-glow-electric shrink-0">
              {entry.username.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-floodlight truncate">{entry.username}</div>
              <div className="text-[10px] text-floodlight/30 truncate">{entry.phone}</div>
            </div>

            {/* Points */}
            <div className="flex items-center gap-1 shrink-0">
              <TrendingUp className="w-3 h-3 text-club-green" />
              <span className="text-xs font-black tabular-nums text-club-green">{formatPoints(entry.points)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
