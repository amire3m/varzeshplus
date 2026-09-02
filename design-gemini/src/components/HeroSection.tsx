"use client";

import React, { useState } from "react";
import {
  Flame,
  Tv,
  Trophy,
  MapPin,
  Clock,
  Sparkles,
  ChevronLeft,
  CheckCircle,
  BarChart2,
  Share2,
} from "lucide-react";

interface Match {
  id: number;
  title: string;
  league: string;
  leagueLogo: string;
  homeTeam: string;
  homeFlag: string;
  awayTeam: string;
  awayFlag: string;
  homeScore: number;
  awayScore: number;
  status: string;
  matchTime: string;
  minute?: string | null;
  stadium: string;
  prizePool: string;
  heroImage: string;
  predictionsCount: number;
}

interface HeroSectionProps {
  match: Match;
  onOpenPredictionModal: (match: Match) => void;
  onOpenMatchDetails: (match: Match) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  match,
  onOpenPredictionModal,
  onOpenMatchDetails,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLive = match.status === "live";

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-[#141C29] group">
      {/* Background Image with Dark Gradient Overlay */}
      <div className="relative h-[340px] sm:h-[380px] w-full overflow-hidden">
        <img
          src={match.heroImage}
          alt={match.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />

        {/* Cinematic Multi-stage Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B121C] via-[#0B121C]/75 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B121C]/90 via-transparent to-[#0B121C]/80"></div>

        {/* Top Badges Bar */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2 z-10">
          {/* Top-Right: Prize Pool Badge */}
          <div className="bg-[#0B121C]/90 backdrop-blur-md border border-amber-500/40 text-amber-300 font-extrabold text-xs px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/10">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>جایزه مسابقه: {match.prizePool}</span>
          </div>

          {/* Top-Left: Live TV Signal Badge */}
          <div className="flex items-center gap-2">
            {isLive ? (
              <div className="bg-[#E23B3B] text-white text-xs font-black px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-[#E23B3B]/30 animate-live-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>پخش زنده شبکه ورزش</span>
              </div>
            ) : (
              <div className="bg-slate-900/90 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-2xl border border-slate-700">
                {match.matchTime}
              </div>
            )}

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="اشتراک‌گذاری"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-[#2ECC71]" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Hero Bottom Scoreboard Content */}
        <div className="absolute bottom-4 inset-x-4 sm:inset-x-6 z-10 space-y-4">
          {/* League & Stadium Subtitle */}
          <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
            <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80 flex items-center gap-1">
              <span>{match.leagueLogo}</span>
              <span>{match.league}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{match.stadium}</span>
            </span>
          </div>

          {/* Teams & Score Display */}
          <div className="flex items-center justify-between gap-2 sm:gap-6 bg-[#141C29]/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-700/60 shadow-xl">
            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              <span className="text-3xl sm:text-4xl mb-1">{match.homeFlag}</span>
              <span className="font-extrabold text-sm sm:text-lg text-white">{match.homeTeam}</span>
            </div>

            {/* Scoreboard Digital Box */}
            <div className="flex flex-col items-center justify-center px-4 py-2 bg-[#0B121C] border border-slate-700/80 rounded-2xl min-w-[120px] sm:min-w-[150px]">
              {isLive && (
                <span className="text-[11px] text-[#E23B3B] font-mono font-black mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E23B3B] animate-ping"></span>
                  <span>دقیقه {match.minute || "۷۸'"}</span>
                </span>
              )}
              <div className="font-scoreboard text-2xl sm:text-4xl text-[#2ECC71] tracking-widest">
                {match.homeScore} - {match.awayScore}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {match.predictionsCount.toLocaleString("fa-IR")} نفر پیش‌بینی کرده‌اند
              </span>
            </div>

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center text-center">
              <span className="text-3xl sm:text-4xl mb-1">{match.awayFlag}</span>
              <span className="font-extrabold text-sm sm:text-lg text-white">{match.awayTeam}</span>
            </div>
          </div>

          {/* Action CTAs (Primary Club Green Button) */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => onOpenPredictionModal(match)}
              className="flex-1 bg-[#2ECC71] hover:bg-[#27ae60] text-slate-950 font-black text-sm sm:text-base py-3 px-4 rounded-2xl transition-all shadow-xl shadow-[#2ECC71]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Flame className="w-5 h-5 fill-slate-950" />
              <span>شرکت در پیش‌بینی اصلی مسابقه (دریافت ۵۰۰ سکه)</span>
            </button>

            <button
              onClick={() => onOpenMatchDetails(match)}
              className="bg-[#141C29] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="آمار تاکتیکی و گزارش زنده"
            >
              <BarChart2 className="w-4 h-4 text-[#5B7FFF]" />
              <span className="hidden sm:inline">آمار زنده</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
