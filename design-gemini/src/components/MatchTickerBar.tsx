"use client";

import React from "react";
import { Activity, Play, ChevronLeft, Volume2, Shield } from "lucide-react";

interface Match {
  id: number;
  title: string;
  league: string;
  homeTeam: string;
  homeFlag: string;
  awayTeam: string;
  awayFlag: string;
  homeScore: number;
  awayScore: number;
  status: string;
  minute?: string | null;
  matchTime: string;
}

interface MatchTickerBarProps {
  matches: Match[];
  selectedMatchId: number;
  onSelectMatch: (id: number) => void;
}

export const MatchTickerBar: React.FC<MatchTickerBarProps> = ({
  matches,
  selectedMatchId,
  onSelectMatch,
}) => {
  return (
    <div className="bg-[#141C29] border border-slate-800 rounded-2xl p-2.5 shadow-xl">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#E23B3B]/10 border border-[#E23B3B]/30 text-[#E23B3B] px-2.5 py-1 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#E23B3B] animate-ping"></span>
            <span>نوار اسکوربورد زنده</span>
          </div>
          <span className="text-slate-400 text-xs hidden md:inline">
            هم‌اکنون مسابقه انتخاب‌شده را پیش‌بینی کنید
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Activity className="w-3.5 h-3.5 text-[#2ECC71]" />
          <span>به‌روزرسانی خودکار دقیقه به دقیقه</span>
        </div>
      </div>

      {/* Horizontal Scrollable Match Chips */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {matches.map((match) => {
          const isSelected = match.id === selectedMatchId;
          const isLive = match.status === "live";

          return (
            <button
              key={match.id}
              onClick={() => onSelectMatch(match.id)}
              className={`flex-shrink-0 flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all cursor-pointer text-right border ${
                isSelected
                  ? "bg-slate-800/90 border-[#5B7FFF] shadow-md shadow-[#5B7FFF]/10"
                  : "bg-[#0B121C]/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
              }`}
            >
              {/* Live indicator or time */}
              {isLive ? (
                <span className="bg-[#E23B3B] text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded animate-live-pulse font-mono">
                  {match.minute || "LIVE"}
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800 text-slate-400 font-medium px-1.5 py-0.5 rounded">
                  {match.status === "finished" ? "پایان" : "پیش‌رو"}
                </span>
              )}

              {/* Home vs Away Teams */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <span>{match.homeFlag}</span>
                  <span>{match.homeTeam}</span>
                </span>

                <span className="font-scoreboard text-sm bg-slate-900 border border-slate-700/60 px-2 py-0.5 rounded font-black text-[#2ECC71]">
                  {match.homeScore} - {match.awayScore}
                </span>

                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <span>{match.awayTeam}</span>
                  <span>{match.awayFlag}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
