"use client";

import React, { useState } from "react";
import { X, BarChart2, Shield, MapPin, Activity, Tv, Flame, Clock } from "lucide-react";

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
  stadium: string;
  minute?: string | null;
}

interface MatchDetailsModalProps {
  isOpen: boolean;
  match: Match | null;
  onClose: () => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  isOpen,
  match,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"stats" | "timeline" | "lineup">("stats");

  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#141C29] border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#5B7FFF]" />
            <h3 className="font-extrabold text-base text-white">آمار زنده و گزارش مرکز بازی</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Teams Matchup Header */}
        <div className="bg-[#0B121C] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="text-center flex-1">
            <span className="text-3xl block mb-1">{match.homeFlag}</span>
            <span className="font-extrabold text-xs text-white">{match.homeTeam}</span>
          </div>

          <div className="text-center px-4">
            <span className="text-[10px] text-[#E23B3B] font-bold block mb-1">
              🔴 دقیقه {match.minute || "۷۸'"}
            </span>
            <div className="font-scoreboard text-3xl text-[#2ECC71] font-black">
              {match.homeScore} - {match.awayScore}
            </div>
          </div>

          <div className="text-center flex-1">
            <span className="text-3xl block mb-1">{match.awayFlag}</span>
            <span className="font-extrabold text-xs text-white">{match.awayTeam}</span>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#0B121C] p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "stats" ? "bg-slate-800 text-white" : "text-slate-400"
            }`}
          >
            آمار بازی
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "timeline" ? "bg-slate-800 text-white" : "text-slate-400"
            }`}
          >
            حوادث زنده
          </button>
        </div>

        {/* Tab 1: Stats Progress Bars */}
        {activeTab === "stats" && (
          <div className="space-y-3 text-xs">
            {/* Possession */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-300">
                <span>مالکیت توپ: ۵۴٪</span>
                <span>۴۶٪</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-[#2ECC71] h-full" style={{ width: "54%" }}></div>
                <div className="bg-[#5B7FFF] h-full" style={{ width: "46%" }}></div>
              </div>
            </div>

            {/* Shots on Target */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-300">
                <span>شوت داخل چارچوب: ۶</span>
                <span>۳</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-[#2ECC71] h-full" style={{ width: "66%" }}></div>
                <div className="bg-[#5B7FFF] h-full" style={{ width: "34%" }}></div>
              </div>
            </div>

            {/* Pass Accuracy */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-300">
                <span>دقت پاس: ۸۸٪</span>
                <span>۸۲٪</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-[#2ECC71] h-full" style={{ width: "52%" }}></div>
                <div className="bg-[#5B7FFF] h-full" style={{ width: "48%" }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Match Timeline */}
        {activeTab === "timeline" && (
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0B121C] border border-slate-800">
              <span className="font-mono font-bold text-[#2ECC71]">۷۲'</span>
              <span className="text-xl">⚽</span>
              <span className="text-white font-bold">گل دوم استقلال! شوت دیدنی از پشت محوطه جریمه</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0B121C] border border-slate-800">
              <span className="font-mono font-bold text-amber-400">۵۵'</span>
              <span className="text-xl">🟨</span>
              <span className="text-slate-300">کارت زرد برای هافبک دفاعی پرسپولیس</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0B121C] border border-slate-800">
              <span className="font-mono font-bold text-[#E23B3B]">۳۸'</span>
              <span className="text-xl">⚽</span>
              <span className="text-white font-bold">گل اول پرسپولیس روی ضربه کرنر سرضرب</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
