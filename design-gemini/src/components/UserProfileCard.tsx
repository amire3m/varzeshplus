"use client";

import React, { useState } from "react";
import {
  Coins,
  Zap,
  Award,
  Gift,
  CheckCircle,
  Sparkles,
  TrendingUp,
  User,
  ShieldAlert,
} from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  phoneMasked: string;
  avatar?: string;
  coins: number;
  xp: number;
  rank: number;
  level: number;
  predictionsCount: number;
  correctPredictions: number;
  dailyBonusClaimed: boolean;
}

interface UserProfileCardProps {
  user: UserProfile | null;
  onClaimDailyBonus: () => void;
  onOpenRewards: () => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  onClaimDailyBonus,
  onOpenRewards,
}) => {
  if (!user) return null;

  const winRate = user.predictionsCount > 0
    ? Math.round((user.correctPredictions / user.predictionsCount) * 100)
    : 0;

  return (
    <div className="bg-[#141C29] border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4">
      {/* Top Header info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2ECC71] to-emerald-700 p-0.5 shadow-lg shadow-[#2ECC71]/20">
            <div className="w-full h-full bg-[#0B121C] rounded-[14px] flex items-center justify-center text-2xl">
              {user.avatar || "⚽"}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-white">{user.username}</h3>
              <span className="bg-[#2ECC71]/10 text-[#2ECC71] text-[10px] px-1.5 py-0.2 rounded font-bold border border-[#2ECC71]/30">
                طلایی
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">{user.phoneMasked}</p>
          </div>
        </div>

        {/* User Rank Tag */}
        <div className="text-left">
          <span className="text-[10px] text-slate-400 block">رتبه شما</span>
          <span className="font-scoreboard font-black text-amber-400 text-base">
            #{user.rank}
          </span>
        </div>
      </div>

      {/* Wallet Balance Grid */}
      <div className="grid grid-cols-2 gap-2 bg-[#0B121C] p-2.5 rounded-2xl border border-slate-800">
        <div
          onClick={onOpenRewards}
          className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
            <span className="text-[10px] font-medium text-slate-400">سکه باشگاه</span>
            <Coins className="w-4 h-4" />
          </div>
          <div className="font-scoreboard font-extrabold text-lg text-amber-300">
            {user.coins.toLocaleString("fa-IR")}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center justify-between text-indigo-400 text-xs mb-1">
            <span className="text-[10px] font-medium text-slate-400">امتیاز XP</span>
            <Zap className="w-4 h-4" />
          </div>
          <div className="font-scoreboard font-extrabold text-lg text-indigo-300">
            {user.xp.toLocaleString("fa-IR")}
          </div>
        </div>
      </div>

      {/* Stats row: Predictions & Win Rate */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-300">
        <span className="flex items-center gap-1">
          <span className="text-slate-400">پیش‌بینی‌ها:</span>
          <span className="font-scoreboard font-bold">{user.predictionsCount}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-slate-400">دقت حدس:</span>
          <span className="font-scoreboard font-bold text-[#2ECC71]">{winRate}%</span>
        </span>
      </div>

      {/* Daily Bonus CTA */}
      <button
        onClick={onClaimDailyBonus}
        disabled={user.dailyBonusClaimed}
        className={`w-full py-2.5 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
          user.dailyBonusClaimed
            ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
            : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-98"
        }`}
      >
        {user.dailyBonusClaimed ? (
          <>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>پاداش امروز دریافت شد (فردا سر بزنید)</span>
          </>
        ) : (
          <>
            <Gift className="w-4 h-4" />
            <span>دریافت پاداش روزانه (+۳۰۰ سکه)</span>
          </>
        )}
      </button>
    </div>
  );
};
