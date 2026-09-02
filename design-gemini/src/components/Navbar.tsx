"use client";

import React, { useState } from "react";
import {
  Trophy,
  Coins,
  Zap,
  Gift,
  Tv,
  User,
  Menu,
  X,
  Sparkles,
  Flame,
  Award,
  ChevronDown,
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
  dailyBonusClaimed: boolean;
}

interface NavbarProps {
  user: UserProfile | null;
  onOpenRewards: () => void;
  onOpenWheel: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenRewards,
  onOpenWheel,
  activeTab,
  setActiveTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0B121C]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Announcement & Live Signal Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-[#141C29] to-slate-900 border-b border-slate-800/60 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E23B3B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E23B3B]"></span>
            </span>
            <span className="font-bold text-[#E23B3B] tracking-wide">پخش زنده HD</span>
            <span className="text-slate-400 border-r border-slate-700 pr-2 mr-2 hidden sm:inline">
              شبکه ورزش سیما • پخش هم‌زمان شهرآورد بزرگ پایتخت
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <button
              onClick={onOpenWheel}
              className="flex items-center gap-1 hover:text-[#2ECC71] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="font-medium">گردونه شانس روزانه</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={onOpenRewards}
              className="flex items-center gap-1 hover:text-[#2ECC71] transition-colors cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">فروشگاه جوایز</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-2 group cursor-pointer text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2ECC71] to-emerald-700 flex items-center justify-center shadow-lg shadow-[#2ECC71]/20 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black tracking-tight text-white">ورزش</span>
                <span className="text-xl font-black text-[#2ECC71]">پلاس</span>
                <span className="text-xs bg-[#2ECC71]/10 text-[#2ECC71] border border-[#2ECC71]/30 px-1.5 py-0.5 rounded font-mono font-bold">⁺</span>
              </div>
              <p className="text-[10px] text-slate-400">باشگاه رسمی شب مسابقه</p>
            </div>
          </button>

          {/* Nav Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#141C29] p-1 rounded-xl border border-slate-800/80 mr-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#2ECC71] text-slate-950 shadow-md shadow-[#2ECC71]/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              باشگاه اصلی
            </button>
            <button
              onClick={() => setActiveTab("matches")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "matches"
                  ? "bg-[#2ECC71] text-slate-950 shadow-md shadow-[#2ECC71]/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              مسابقات و پیش‌بینی
            </button>
            <button
              onClick={() => setActiveTab("games")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "games"
                  ? "bg-[#2ECC71] text-slate-950 shadow-md shadow-[#2ECC71]/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              کوییز و ماراتن
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "leaderboard"
                  ? "bg-[#2ECC71] text-slate-950 shadow-md shadow-[#2ECC71]/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              جدول برترین‌ها
            </button>
          </nav>
        </div>

        {/* User Profile Stats & Action CTAs */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 bg-[#141C29] border border-slate-800 rounded-xl px-3 py-1.5">
              {/* Coins Pill */}
              <div
                onClick={onOpenRewards}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                title="موجودی سکه‌های شما - جهت دریافت جوایز کلیک کنید"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="font-scoreboard text-sm text-amber-300">
                  {user.coins.toLocaleString("fa-IR")}
                </span>
              </div>

              {/* XP Pill */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="font-scoreboard text-xs text-indigo-300">
                  {user.xp.toLocaleString("fa-IR")} XP
                </span>
              </div>

              {/* Level Badge */}
              <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg text-xs font-bold text-slate-300">
                <Award className="w-3.5 h-3.5 text-[#2ECC71]" />
                <span>سطح {user.level}</span>
              </div>
            </div>
          )}

          {/* Primary Action Button (Green CTA = Action per design guideline) */}
          <button
            onClick={() => setActiveTab("matches")}
            className="bg-[#2ECC71] hover:bg-[#27ae60] text-slate-950 font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-lg shadow-[#2ECC71]/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Flame className="w-4 h-4 fill-slate-950" />
            <span>شرکت در پیش‌بینی</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#141C29] border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#141C29] border-b border-slate-800 px-4 py-3 space-y-2 animate-fadeIn">
          {user && (
            <div className="flex items-center justify-between p-3 bg-[#0B121C] rounded-xl border border-slate-800 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{user.avatar || "⚽"}</span>
                <div>
                  <div className="font-bold text-xs text-white">{user.username}</div>
                  <div className="text-[10px] text-slate-400">{user.phoneMasked}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-400 font-scoreboard text-xs">
                  <Coins className="w-3.5 h-3.5" />
                  {user.coins}
                </div>
                <div className="flex items-center gap-1 text-indigo-400 font-scoreboard text-xs">
                  <Zap className="w-3.5 h-3.5" />
                  {user.xp} XP
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setMobileMenuOpen(false);
              }}
              className="w-full text-right p-2.5 rounded-lg bg-slate-800/60 text-xs font-bold text-slate-200"
            >
              🏠 باشگاه اصلی
            </button>
            <button
              onClick={() => {
                setActiveTab("matches");
                setMobileMenuOpen(false);
              }}
              className="w-full text-right p-2.5 rounded-lg bg-slate-800/60 text-xs font-bold text-slate-200"
            >
              ⚽ مسابقات زنده
            </button>
            <button
              onClick={() => {
                setActiveTab("games");
                setMobileMenuOpen(false);
              }}
              className="w-full text-right p-2.5 rounded-lg bg-slate-800/60 text-xs font-bold text-slate-200"
            >
              🎮 کوییز و چالش
            </button>
            <button
              onClick={() => {
                setActiveTab("leaderboard");
                setMobileMenuOpen(false);
              }}
              className="w-full text-right p-2.5 rounded-lg bg-slate-800/60 text-xs font-bold text-slate-200"
            >
              🏆 جدول برترین‌ها
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
            <button
              onClick={() => {
                onOpenWheel();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-bold flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              گردونه شانس
            </button>
            <button
              onClick={() => {
                onOpenRewards();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1"
            >
              <Gift className="w-3.5 h-3.5" />
              فروشگاه جوایز
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
