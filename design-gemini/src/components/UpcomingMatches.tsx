"use client";

import React, { useState } from "react";
import {
  Search,
  Flame,
  Calendar,
  Clock,
  ChevronLeft,
  Filter,
  Check,
  Shield,
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
  isHot?: boolean;
}

interface UpcomingMatchesProps {
  matches: Match[];
  selectedMatchId: number;
  onSelectMatch: (id: number) => void;
  onOpenPredictionModal: (match: Match) => void;
}

export const UpcomingMatches: React.FC<UpcomingMatchesProps> = ({
  matches,
  selectedMatchId,
  onSelectMatch,
  onOpenPredictionModal,
}) => {
  const [filter, setFilter] = useState<"all" | "live" | "upcoming" | "hot">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMatches = matches.filter((match) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "live"
        ? match.status === "live"
        : filter === "upcoming"
        ? match.status === "upcoming"
        : match.isHot;

    const matchesSearch =
      match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.league.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-[#141C29] border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-5 bg-[#2ECC71] rounded-full"></div>
          <h2 className="font-extrabold text-base text-white">مسابقات پیش رو و زنده</h2>
        </div>
        <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-scoreboard">
          {filteredMatches.length} مسابقه
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-[#0B121C] p-1 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            filter === "all"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          همه
        </button>
        <button
          onClick={() => setFilter("live")}
          className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            filter === "live"
              ? "bg-[#E23B3B] text-white shadow-sm"
              : "text-[#E23B3B] hover:bg-[#E23B3B]/10"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
          <span>زنده</span>
        </button>
        <button
          onClick={() => setFilter("upcoming")}
          className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            filter === "upcoming"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          پیش‌رو
        </button>
        <button
          onClick={() => setFilter("hot")}
          className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            filter === "hot"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-amber-400 hover:text-amber-300"
          }`}
        >
          🔥 مهم
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="جستجوی تیم یا لیگ..."
          className="w-full bg-[#0B121C] border border-slate-800 rounded-2xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5B7FFF] transition-colors"
        />
        <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
      </div>

      {/* Match Cards List */}
      <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            مسابقه‌ای با این مشخصات پیدا نشد.
          </div>
        ) : (
          filteredMatches.map((match) => {
            const isSelected = match.id === selectedMatchId;
            const isLive = match.status === "live";

            return (
              <div
                key={match.id}
                onClick={() => onSelectMatch(match.id)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-slate-800/80 border-[#5B7FFF] shadow-md shadow-[#5B7FFF]/10"
                    : "bg-[#0B121C]/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                {/* Top Info Bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                  <span className="flex items-center gap-1 font-medium">
                    <span>{match.leagueLogo}</span>
                    <span>{match.league}</span>
                  </span>

                  {isLive ? (
                    <span className="bg-[#E23B3B]/10 border border-[#E23B3B]/30 text-[#E23B3B] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E23B3B] animate-ping"></span>
                      <span>دقیقه {match.minute || "۷۸'"}</span>
                    </span>
                  ) : (
                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {match.matchTime}
                    </span>
                  )}
                </div>

                {/* Teams Score Matchup */}
                <div className="flex items-center justify-between gap-2 py-1">
                  {/* Home Team */}
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xl">{match.homeFlag}</span>
                    <span className="font-extrabold text-xs text-white truncate">
                      {match.homeTeam}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="font-scoreboard text-sm bg-slate-900 border border-slate-700/80 text-[#2ECC71] px-2.5 py-1 rounded-xl font-bold">
                    {match.homeScore} - {match.awayScore}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-extrabold text-xs text-white truncate">
                      {match.awayTeam}
                    </span>
                    <span className="text-xl">{match.awayFlag}</span>
                  </div>
                </div>

                {/* Quick Predict Action Button */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-medium">
                    🏆 {match.prizePool}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPredictionModal(match);
                    }}
                    className="bg-[#2ECC71]/10 hover:bg-[#2ECC71] text-[#2ECC71] hover:text-slate-950 font-bold text-[11px] px-3 py-1 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>پیش‌بینی</span>
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
