"use client";

import React, { useState } from "react";
import { X, Flame, Coins, Zap, Trophy, Plus, Minus, CheckCircle } from "lucide-react";

interface Match {
  id: number;
  title: string;
  homeTeam: string;
  homeFlag: string;
  awayTeam: string;
  awayFlag: string;
  prizePool: string;
}

interface PredictionModalProps {
  isOpen: boolean;
  match: Match | null;
  onClose: () => void;
  onSubmitPrediction: (matchId: number, homeScore: number, awayScore: number) => Promise<void>;
}

export const PredictionModal: React.FC<PredictionModalProps> = ({
  isOpen,
  match,
  onClose,
  onSubmitPrediction,
}) => {
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !match) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitPrediction(match.id, homeScore, awayScore);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#141C29] border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#2ECC71]" />
            <h3 className="font-extrabold text-base text-white">پیش‌بینی دقیق نتیجه</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-16 h-16 text-[#2ECC71] mx-auto animate-bounce" />
            <h4 className="text-xl font-black text-white">پیش‌بینی شما با موفقیت ثبت شد!</h4>
            <p className="text-slate-300 text-xs">
              +۵۰ سکه و +۱۰۰ امتیاز به حساب شما افزوده شد.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs text-slate-400">{match.title}</span>
              <div className="text-xs font-bold text-amber-400">جایزه: {match.prizePool}</div>
            </div>

            {/* Score Selector Controls */}
            <div className="flex items-center justify-center gap-4 bg-[#0B121C] p-4 rounded-2xl border border-slate-800">
              {/* Home Team */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">{match.homeFlag}</span>
                <span className="font-extrabold text-xs text-white">{match.homeTeam}</span>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                    className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-scoreboard text-xl text-[#2ECC71] min-w-[24px] text-center font-extrabold">
                    {homeScore}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHomeScore(homeScore + 1)}
                    className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <span className="font-scoreboard text-2xl text-slate-500 font-extrabold pb-2">:</span>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">{match.awayFlag}</span>
                <span className="font-extrabold text-xs text-white">{match.awayTeam}</span>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                    className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-scoreboard text-xl text-[#2ECC71] min-w-[24px] text-center font-extrabold">
                    {awayScore}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAwayScore(awayScore + 1)}
                    className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Rewards info */}
            <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Coins className="w-4 h-4" />
                <span>پاداش ثبتی: +۵۰ سکه</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400">
                <Zap className="w-4 h-4" />
                <span>پاداش حدس درست: +۵۰۰ سکه</span>
              </div>
            </div>

            {/* Submit Button (Club Green Action) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2ECC71] hover:bg-[#27ae60] text-slate-950 font-black text-sm py-3 px-4 rounded-2xl transition-all shadow-lg shadow-[#2ECC71]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Flame className="w-5 h-5 fill-slate-950" />
              <span>{isSubmitting ? "در حال ثبت..." : "تایید و ثبت پیش‌بینی"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
