"use client";

import React, { useState } from "react";
import {
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  Coins,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

interface LeaderboardItem {
  id: number;
  rank: number;
  username: string;
  phoneMasked: string;
  points: number;
  coins: number;
  avatar: string;
  badgeTitle: string;
  badgeColor: string;
  trend?: string;
  period?: string;
}

interface LeaderboardPanelProps {
  items: LeaderboardItem[];
  currentUserRank: number;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  items,
  currentUserRank,
}) => {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "live">("weekly");

  // Get medal icon or style based on rank
  const getMedalBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shadow-amber-500/20">
          🥇
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shadow-slate-400/20">
          🥈
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 flex items-center justify-center font-black text-white text-xs shadow-md shadow-amber-700/20">
          🥉
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-scoreboard font-bold text-slate-400 text-xs">
        {rank}
      </div>
    );
  };

  return (
    <div className="bg-[#141C29] border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4">
      {/* Title & Live Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#E8B84B]" />
          <h2 className="font-extrabold text-base text-white">برترین‌های ورزش پلاس</h2>
        </div>

        <div className="flex items-center gap-1 bg-[#2ECC71]/10 border border-[#2ECC71]/30 px-2 py-0.5 rounded-full text-[10px] text-[#2ECC71] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-ping"></span>
          <span>زنده</span>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex items-center gap-1 bg-[#0B121C] p-1 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setPeriod("weekly")}
          className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            period === "weekly"
              ? "bg-[#2ECC71] text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          هفتگی
        </button>
        <button
          onClick={() => setPeriod("monthly")}
          className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            period === "monthly"
              ? "bg-[#2ECC71] text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          ماهانه
        </button>
        <button
          onClick={() => setPeriod("live")}
          className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            period === "live"
              ? "bg-[#2ECC71] text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          شب مسابقه
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
        {items.map((item) => {
          const isCurrentUser = item.rank === currentUserRank || item.username.includes("شما");

          return (
            <div
              key={item.id}
              className={`p-2.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-2 ${
                isCurrentUser
                  ? "bg-slate-800/90 border-[#2ECC71] shadow-md shadow-[#2ECC71]/10 ring-1 ring-[#2ECC71]/30"
                  : item.rank === 1
                  ? "bg-[#0B121C]/90 border-amber-500/40"
                  : "bg-[#0B121C]/70 border-slate-800/80"
              }`}
            >
              {/* Left: Medal Rank + Avatar + Name + Masked Phone */}
              <div className="flex items-center gap-2.5 min-w-0">
                {getMedalBadge(item.rank)}

                <span className="text-xl flex-shrink-0">{item.avatar}</span>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-white truncate">
                      {item.username}
                    </span>
                    {isCurrentUser && (
                      <span className="bg-[#2ECC71]/20 text-[#2ECC71] font-bold text-[9px] px-1.5 py-0.2 rounded">
                        شما
                      </span>
                    )}
                  </div>
                  {/* Masked Phone per design prompt requirement! */}
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.phoneMasked}
                  </div>
                </div>
              </div>

              {/* Right: Points + Badge Tag */}
              <div className="flex flex-col items-end flex-shrink-0">
                <div className="flex items-center gap-1 text-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-scoreboard font-black text-amber-300">
                    {item.points.toLocaleString("fa-IR")}
                  </span>
                  <span className="text-[10px] text-slate-400">امتیاز</span>
                </div>

                <div className="flex items-center gap-1 text-[10px] mt-0.5">
                  <span
                    className="px-1.5 py-0.2 rounded font-medium"
                    style={{
                      backgroundColor: `${item.badgeColor}15`,
                      color: item.badgeColor,
                      border: `1px solid ${item.badgeColor}30`,
                    }}
                  >
                    {item.badgeTitle}
                  </span>

                  {item.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-[#2ECC71]" />
                  ) : item.trend === "down" ? (
                    <TrendingDown className="w-3 h-3 text-[#E23B3B]" />
                  ) : (
                    <Minus className="w-3 h-3 text-slate-500" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
